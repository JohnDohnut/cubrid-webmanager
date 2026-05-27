import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { closeUnloadDatabaseModal, openUnloadResultModal } from '../databaseSlice';
import { databaseApi } from '../databaseApi';
import { databaseJobApi } from '../databaseJobApi';
import { useCmsJob } from '../../../infrastructure/hooks/useCmsJob';
import { useCM } from '../../../constants/useCM';

import UnloadConfigSection from './unload/UnloadConfigSection';
import UnloadContentSection from './unload/UnloadContentSection';
import UnloadAdvancedOptions from './unload/UnloadAdvancedOptions';

import { Modal } from '../../../components/ds/layout/Modal';
import { Button } from '../../../components/ds/foundation/Button';
import { Typography } from '../../../components/ds/foundation/Typography';
import { useActionState } from '../../../infrastructure/hooks/useActionState';
import {
  ModalStatusLoading,
  ModalStatusError,
} from '../../../components/ds/feedback/ActionStatus';

const VIEW_FORM = 'form';

const INITIAL_FORM_DATA = {
  targetDbName: '',
  targetDirectory: '',
  dbUsername: '',
  dbPassword: '',
  schemaOption: 'All',
  dataOption: 'Selected tables',
  selectedTables: [],
  asDba: false,
  splitSchema: false,
  classOnly: false,
  skipIndex: false,
  useDelimitedIdentifier: false,
  includeReferencedTables: false,
  usePrefixOutputFile: false,
  prefixOutputFile: '',
  useFileForHash: false,
  fileForHash: '',
  useCachedPages: false,
  cachedPages: '',
  useEstimateInstances: false,
  estimateInstances: '',
  useLoFileDirectory: false,
  loFileDirectory: '',
};

export default function UnloadDatabaseModal() {
  const CM = useCM();
  const dispatch = useDispatch();
  const { isUnloadDatabaseModalOpen: isUnloadDBModalOpen } = useSelector((state) => state.databaseUI, shallowEqual);
  const { selectedDatabase, databases, activeDatabases } = useSelector((state) => state.database, shallowEqual);
  const { selectedHostUid } = useSelector((state) => state.host, shallowEqual);

  const currentDb = databases.find((db) => db.dbname === selectedDatabase);

  const {
    error: actionError,
    startAction,
    endError,
    resetAction,
    isLoading,
    isError,
  } = useActionState();
  const { runJob } = useCmsJob();
  const [jobStatus, setJobStatus] = useState(null);

  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [dynamicTables, setDynamicTables] = useState([]);
  const [isTablesLoading, setIsTablesLoading] = useState(false);

  const fetchTables = useCallback(async () => {
    if (!selectedHostUid || !selectedDatabase) return;
    setIsTablesLoading(true);
    try {
      const status = activeDatabases.includes(selectedDatabase) ? 'on' : 'off';
      const res = await databaseApi.getClassInfo(selectedHostUid, selectedDatabase, status);
      const userTables = res.userclass?.[0]?.class?.map((c) => c.classname) || [];
      setDynamicTables(userTables);
      setFormData((prev) => {
        if (prev.schemaOption === 'All') {
          return { ...prev, selectedTables: userTables };
        }
        return prev;
      });
    } catch (err) {
      console.error('Failed to fetch tables:', err);
    } finally {
      setIsTablesLoading(false);
    }
  }, [selectedHostUid, selectedDatabase, activeDatabases]);

  useEffect(() => {
    if (isUnloadDBModalOpen && selectedDatabase) {
      resetAction();
      setFormData({
        ...INITIAL_FORM_DATA,
        targetDbName: selectedDatabase,
        targetDirectory: currentDb?.dbdir || `/home/cubrid/databases/${selectedDatabase}`,
        dbUsername: 'dba',
        dbPassword: '',
        fileForHash: currentDb?.dbdir
          ? `${currentDb.dbdir}/hashfile`
          : `/home/cubrid/databases/${selectedDatabase}/hashfile`,
      });
      fetchTables();
    }
  }, [isUnloadDBModalOpen, selectedDatabase, currentDb, fetchTables, resetAction]);

  if (!isUnloadDBModalOpen) return null;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSchemaChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => {
      let newSelectedTables = prev.selectedTables;
      if (value === 'All') {
        newSelectedTables = [...dynamicTables];
      } else if (value === 'Selected tables' || value === 'Not include') {
        newSelectedTables = [];
      }
      return {
        ...prev,
        schemaOption: value,
        selectedTables: newSelectedTables,
      };
    });
  };

  const handleTableToggle = (table) => {
    setFormData((prev) => ({
      ...prev,
      selectedTables: prev.selectedTables.includes(table)
        ? prev.selectedTables.filter((t) => t !== table)
        : [...prev.selectedTables, table],
    }));
  };

  const handleUnloadDatabase = async () => {
    if (!selectedHostUid || !selectedDatabase) return;

    startAction();
    try {
      const payload = {
        targetdir: formData.targetDirectory,
        isSchemaIncluded: formData.schemaOption !== 'Not include',
        isDataIncluded: formData.dataOption !== 'Not include',
        dbuser: formData.dbUsername,
        dbpasswd: formData.dbPassword,
        usehash: formData.useFileForHash ? 'yes' : 'no',
        hashdir: formData.useFileForHash ? formData.fileForHash : '',
        class: formData.selectedTables.map((t) => ({ classname: t })),
        ref: formData.includeReferencedTables ? 'yes' : 'no',
        classonly: formData.classOnly ? 'yes' : 'no',
        'as-dba': formData.asDba ? 'yes' : 'no',
        'skip-index-detail': formData.skipIndex ? 'yes' : 'no',
        'split-schema-files': formData.splitSchema ? 'yes' : 'no',
        delimit: formData.useDelimitedIdentifier ? 'yes' : 'no',
        estimate: formData.useEstimateInstances ? String(formData.estimateInstances) : '',
        prefix: formData.usePrefixOutputFile ? formData.prefixOutputFile : '',
        cach: formData.useCachedPages ? String(formData.cachedPages) : '',
        lofile: formData.useLoFileDirectory ? String(formData.loFileDirectory) : '',
      };

      const job = await runJob(
        () => databaseJobApi.submitUnload(selectedHostUid, selectedDatabase, payload),
        { onProgress: (j) => setJobStatus(j.jobStatus ?? j.status) }
      );
      resetAction();
      dispatch(closeUnloadDatabaseModal());
      dispatch(openUnloadResultModal(job.result ?? {}));
    } catch (err) {
      endError(typeof err === 'string' ? err : (err.message || CM.failure));
    }
  };

  const handleClose = () => {
    dispatch(closeUnloadDatabaseModal());
    setFormData(INITIAL_FORM_DATA);
    setDynamicTables([]);
    resetAction();
  };

  if (isLoading) {
    const statusHint = jobStatus === 'running' ? ' (CMS)' : jobStatus === 'queued' ? ' (queued)' : '';
    return (
      <Modal isOpen title={CM.unloadDatabase} icon="upload" onClose={handleClose} maxWidth="740px">
        <ModalStatusLoading
          title={CM.unloadDatabase}
          subtitle={`${selectedDatabase}${statusHint} — running in background`}
        />
      </Modal>
    );
  }

  if (isError) {
    return (
      <Modal isOpen title={CM.unloadDatabase} icon="upload_file" iconVariant="danger" onClose={resetAction} maxWidth="700px">
        <ModalStatusError
          title={CM.failure}
          error={actionError}
          onRetry={handleUnloadDatabase}
          onCancel={resetAction}
          cancelText={CM.close}
        />
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isUnloadDBModalOpen}
      onClose={handleClose}
      title={CM.unloadDatabase}
      subtitle={CM.unloadDatabaseMsg}
      icon="upload"
      maxWidth="740px"
      footer={
        <div className="flex justify-end gap-2 w-full">
          <Button variant="ghost" onClick={handleClose}>{CM.cancel}</Button>
          <Button onClick={handleUnloadDatabase} icon="upload">
            {CM.ok}
          </Button>
        </div>
      }
    >
      <div className="space-y-6 pb-2">
        <Typography variant="caption" className="text-slate-500 font-mono block">
          {CM.databaseName}: {selectedDatabase}
        </Typography>

        <UnloadConfigSection formData={formData} handleInputChange={handleInputChange} />
        <UnloadContentSection
          formData={formData}
          handleInputChange={handleInputChange}
          handleSchemaChange={handleSchemaChange}
          handleTableToggle={handleTableToggle}
          dynamicTables={dynamicTables}
          isTablesLoading={isTablesLoading}
        />
        <UnloadAdvancedOptions formData={formData} handleInputChange={handleInputChange} />
      </div>
    </Modal>
  );
}
