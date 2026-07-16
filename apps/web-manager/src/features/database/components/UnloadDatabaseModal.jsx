import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { closeUnloadDatabaseModal, openUnloadResultModal, fetchDatabaseStartInfo } from '../databaseSlice';
import { databaseApi } from '../databaseApi';
import { databaseJobApi } from '../databaseJobApi';
import { useCmsJob } from '../../../infrastructure/hooks/useCmsJob';
import { getCmsJobLoadingSubtitle } from '../../../infrastructure/cmsJob/cmsJobUi';
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
  tableScope: 'All',
  includeSchema: true,
  includeData: true,
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
        if (prev.tableScope === 'All') {
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
      // databases can be stale/empty right after a host switch (resetDatabaseState
      // clears it synchronously while the refetch is still in flight) — refetch
      // so currentDb.dbdir resolves to the real path instead of falling through
      // to a fabricated default that doesn't match this host's actual layout.
      if (selectedHostUid && !currentDb) {
        dispatch(fetchDatabaseStartInfo(selectedHostUid));
      }
      setFormData({
        ...INITIAL_FORM_DATA,
        targetDbName: selectedDatabase,
        targetDirectory: currentDb?.dbdir || '',
        dbUsername: 'dba',
        dbPassword: '',
        fileForHash: currentDb?.dbdir ? `${currentDb.dbdir}/hashfile` : '',
      });
      fetchTables();
    }
  }, [isUnloadDBModalOpen, selectedDatabase, currentDb, selectedHostUid, dispatch, fetchTables, resetAction]);

  if (!isUnloadDBModalOpen) return null;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleTableScopeChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      tableScope: value,
      selectedTables: value === 'All' ? [...dynamicTables] : [],
    }));
  };

  const handleTableToggle = (table) => {
    setFormData((prev) => ({
      ...prev,
      selectedTables: prev.selectedTables.includes(table)
        ? prev.selectedTables.filter((t) => t !== table)
        : [...prev.selectedTables, table],
    }));
  };

  const handleSelectAllTables = (allTables) => {
    setFormData((prev) => ({
      ...prev,
      selectedTables: prev.selectedTables.length === allTables.length ? [] : [...allTables],
    }));
  };

  // Backend rejects the request when neither schema nor data is included
  // (there would be nothing to unload) — block turning off the last one.
  const handleIncludeToggle = (key) => {
    setFormData((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (!next.includeSchema && !next.includeData) return prev;
      return next;
    });
  };

  const handleUnloadDatabase = async () => {
    if (!selectedHostUid || !selectedDatabase) return;

    startAction();
    try {
      const payload = {
        targetdir: formData.targetDirectory,
        isSchemaIncluded: formData.includeSchema,
        isDataIncluded: formData.includeData,
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
    return (
      <Modal isOpen title={CM.unloadDatabase} icon="upload" onClose={handleClose} maxWidth="740px">
        <ModalStatusLoading
          title={CM.unloadDatabase}
          subtitle={getCmsJobLoadingSubtitle(selectedDatabase, jobStatus, CM)}
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
      testId="unload-database"
      footer={
        <div className="flex justify-end gap-2 w-full">
          <Button data-testid="unload-database-cancel-btn" variant="ghost" onClick={handleClose}>{CM.cancel}</Button>
          <Button data-testid="unload-database-run-btn" onClick={handleUnloadDatabase} icon="upload">
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
          handleTableScopeChange={handleTableScopeChange}
          handleIncludeToggle={handleIncludeToggle}
          handleTableToggle={handleTableToggle}
          handleSelectAllTables={handleSelectAllTables}
          dynamicTables={dynamicTables}
          isTablesLoading={isTablesLoading}
        />
        <UnloadAdvancedOptions formData={formData} handleInputChange={handleInputChange} />
      </div>
    </Modal>
  );
}
