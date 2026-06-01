import { useState, useEffect } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { closeLoadDatabaseModal } from '../databaseSlice';
import { databaseApi } from '../databaseApi';
import { databaseJobApi } from '../databaseJobApi';
import { useCmsJob } from '../../../infrastructure/hooks/useCmsJob';
import { getCmsJobLoadingSubtitle } from '../../../infrastructure/cmsJob/cmsJobUi';
import { useCM } from '../../../constants/useCM';

import LoadConfigSection from './load/LoadConfigSection';
import LoadSourceSection from './load/LoadSourceSection';
import LoadOptionsSection from './load/LoadOptionsSection';

import { Modal } from '../../../components/ds/layout/Modal';
import { Button } from '../../../components/ds/foundation/Button';
import { Typography } from '../../../components/ds/foundation/Typography';
import { useActionState } from '../../../infrastructure/hooks/useActionState';
import {
  ModalStatusLoading,
  ModalStatusSuccess,
  ModalStatusError,
} from '../../../components/ds/feedback/ActionStatus';

export default function LoadDatabaseModal() {
  const CM = useCM();
  const dispatch = useDispatch();
  const { isLoadDatabaseModalOpen: isLoadDBModalOpen } = useSelector((state) => state.databaseUI, shallowEqual);
  const { selectedDatabase } = useSelector((state) => state.database, shallowEqual);
  const { selectedHostUid } = useSelector((state) => state.host, shallowEqual);

  const {
    error: actionError,
    startAction,
    endSuccess,
    endError,
    resetAction,
    isLoading,
    isSuccess,
    isError,
  } = useActionState();
  const { runJob } = useCmsJob();
  const [jobStatus, setJobStatus] = useState(null);

  const [unloadList, setUnloadList] = useState([]);
  const [selectedUnload, setSelectedUnload] = useState('');
  const [dataSource, setDataSource] = useState([]);
  const [radio, setRadio] = useState(0);

  const [formData, setFormData] = useState({
    targetDbName: '',
    dbUsername: 'dba',
    dbPassword: '',
    unloadFiles: {
      schema: '',
      object: '',
      index: '',
      trigger: '',
    },
    checkBoxes: {
      schema: false,
      object: false,
      index: false,
      trigger: false,
      checkoption: false,
      nolog: false,
      oiduse: false,
      statisticsuse: false,
      estimated: false,
      period: false,
      errorcontrolfile: false,
      ignoreclassfile: false,
    },
    values: {
      estimated: '',
      period: '',
      errorcontrolfile: '',
      ignoreclassfile: '',
    },
  });

  const updateDataSource = (rawData) => {
    const convertedList = Object.entries(rawData)
      .filter(([key]) => key !== 'dbname')
      .map(([key, value]) => {
        const [path, date] = value.split(';');
        return {
          loadType: key,
          path,
          date,
          key: Math.random().toString(36).substr(2, 4),
          checked: false,
        };
      });
    setDataSource(convertedList);
  };

  useEffect(() => {
    if (isLoadDBModalOpen && selectedDatabase) {
      resetAction();
      setFormData((prev) => ({
        ...prev,
        targetDbName: selectedDatabase,
      }));

      databaseApi.getUnloadInfo(selectedHostUid).then((res) => {
        const dbs = res.database || [];
        setUnloadList(dbs);
        if (dbs.length > 0) {
          const firstDb = dbs[0];
          setSelectedUnload(firstDb.dbname);
          updateDataSource(firstDb);
        }
      }).catch((err) => console.error('Failed to fetch unload info:', err));
    }
  }, [isLoadDBModalOpen, selectedDatabase, selectedHostUid, resetAction]);

  if (!isLoadDBModalOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUnloadSelectChange = (dbname) => {
    setSelectedUnload(dbname);
    const db = unloadList.find((d) => d.dbname === dbname);
    if (db) updateDataSource(db);
  };

  const handleTableCheckboxChange = (checked, key) => {
    setDataSource((prev) =>
      prev.map((item) => (item.key === key ? { ...item, checked } : item)),
    );
  };

  const handleCheckBoxChange = (id, checked) => {
    setFormData((prev) => ({
      ...prev,
      checkBoxes: { ...prev.checkBoxes, [id]: checked },
    }));
  };

  const handleValueChange = (id, value) => {
    setFormData((prev) => ({
      ...prev,
      values: { ...prev.values, [id]: value },
    }));
  };

  const handleUnloadPathChange = (type, value) => {
    setFormData((prev) => ({
      ...prev,
      unloadFiles: { ...prev.unloadFiles, [type]: value },
    }));
  };

  const handleLoadDatabase = async () => {
    if (!selectedHostUid || !selectedDatabase) return;

    startAction();
    try {
      const toYesNo = (val) => (val ? 'yes' : 'no');
      let loadObject = {};

      if (radio === 0) {
        ['index', 'schema', 'object', 'trigger'].forEach((item) => {
          const found = dataSource.find((res) => res.checked && res.loadType === item);
          loadObject[item] = found ? found.path : 'none';
        });
      } else {
        loadObject = {
          index: formData.checkBoxes.index ? formData.unloadFiles.index : 'none',
          schema: formData.checkBoxes.schema ? formData.unloadFiles.schema : 'none',
          object: formData.checkBoxes.object ? formData.unloadFiles.object : 'none',
          trigger: formData.checkBoxes.trigger ? formData.unloadFiles.trigger : 'none',
        };
      }

      const payload = {
        dbname: selectedDatabase,
        ...loadObject,
        user: formData.dbUsername,
        _DBID: formData.dbUsername,
        _DBPASSWD: formData.dbPassword ?? '',
        oiduse: toYesNo(formData.checkBoxes.oiduse),
        statisticsuse: toYesNo(formData.checkBoxes.statisticsuse),
        nolog: toYesNo(formData.checkBoxes.nolog),
        period: formData.checkBoxes.period ? formData.values.period : 'none',
        estimated: formData.checkBoxes.estimated ? formData.values.estimated : 'none',
        errorcontrolfile: formData.checkBoxes.errorcontrolfile ? formData.values.errorcontrolfile : 'none',
        ignoreclassfile: formData.checkBoxes.ignoreclassfile ? formData.values.ignoreclassfile : 'none',
        checkoption: formData.checkBoxes.checkoption ? 'both' : 'load',
      };

      await runJob(
        () => databaseJobApi.submitLoad(selectedHostUid, selectedDatabase, payload),
        { onProgress: (j) => setJobStatus(j.jobStatus ?? j.status) }
      );
      endSuccess();
    } catch (err) {
      endError(typeof err === 'string' ? err : (err.message || CM.failure));
    }
  };

  const handleClose = () => {
    dispatch(closeLoadDatabaseModal());
    resetAction();
  };

  if (isLoading) {
    return (
      <Modal isOpen title={CM.loadDatabase} icon="download" onClose={handleClose} maxWidth="720px">
        <ModalStatusLoading
          title={CM.loadDatabase}
          subtitle={getCmsJobLoadingSubtitle(selectedDatabase, jobStatus, CM)}
        />
      </Modal>
    );
  }

  if (isSuccess) {
    return (
      <Modal isOpen title={CM.loadDatabase} icon="download" iconVariant="success" onClose={handleClose} maxWidth="720px">
        <ModalStatusSuccess
          title={CM.success}
          message={CM.jobCompletedSuccess(CM.loadDatabase)}
          onConfirm={handleClose}
          confirmText={CM.ok}
        />
      </Modal>
    );
  }

  if (isError) {
    return (
      <Modal isOpen title={CM.loadDatabase} icon="database_upload" iconVariant="danger" onClose={resetAction} maxWidth="700px">
        <ModalStatusError
          title={CM.failure}
          error={actionError}
          onRetry={handleLoadDatabase}
          onCancel={resetAction}
          cancelText={CM.close}
        />
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isLoadDBModalOpen}
      onClose={handleClose}
      title={CM.loadDatabase}
      subtitle={CM.loadDatabaseMsg}
      icon="download"
      maxWidth="720px"
      footer={
        <div className="flex justify-end gap-2 w-full">
          <Button variant="ghost" onClick={handleClose}>{CM.cancel}</Button>
          <Button onClick={handleLoadDatabase} icon="play_circle">
            {CM.ok}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <Typography variant="caption" className="text-slate-500 font-mono block">
          {CM.databaseName}: {selectedDatabase}
        </Typography>

        <LoadConfigSection formData={formData} handleInputChange={handleInputChange} />
        <LoadSourceSection
          radio={radio}
          setRadio={setRadio}
          selectedUnload={selectedUnload}
          handleUnloadSelectChange={handleUnloadSelectChange}
          unloadList={unloadList}
          dataSource={dataSource}
          handleTableCheckboxChange={handleTableCheckboxChange}
          formData={formData}
          handleCheckBoxChange={handleCheckBoxChange}
          handleUnloadPathChange={handleUnloadPathChange}
        />
        <LoadOptionsSection
          formData={formData}
          handleCheckBoxChange={handleCheckBoxChange}
          handleValueChange={handleValueChange}
        />
      </div>
    </Modal>
  );
}
