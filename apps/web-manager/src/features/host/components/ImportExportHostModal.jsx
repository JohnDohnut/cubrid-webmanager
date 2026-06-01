import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import {
  closeImportExportModal,
  addHost,
  createHostGroup,
  deleteHostGroup,
  editHost,
  loginToHost,
  setSelectedHost,
  fetchHostEnv,
} from '../hostSlice';
import { showStatusModal } from '../../layout/layoutSlice';
import { fetchDatabaseStartInfo } from '../../database/databaseSlice';
import { fetchBrokerList } from '../../broker/brokerSlice';
import { setActiveMainTab } from '../../layout/layoutSlice';
import {
  exportHostsToXml,
  parseHostsXml,
  buildImportPreviewList,
  validateSelectedImportRows,
} from '../hostImportExport';
import { flattenHostsFromGroups, findNewGroupId } from '../hostGroupUtils';
import { store } from '../../../app/store';
import { Modal } from '../../../components/ds/layout/Modal';
import { Button } from '../../../components/ds/foundation/Button';
import { Table } from '../../../components/ds/layout/Table';
import { Badge } from '../../../components/ds/foundation/Badge';
import { Input } from '../../../components/ds/forms/Input';
import { FileUpload } from '../../../components/ds/forms/FileUpload';
import { Typography } from '../../../components/ds/foundation/Typography';
import { Checkbox } from '../../../components/ds/forms/Checkbox';

import { useCM } from '../../../constants/useCM';

async function loginImportedHost(dispatch, hostUid) {
  await dispatch(loginToHost(hostUid)).unwrap();
}

function activateImportedHost(dispatch, hostUid) {
  dispatch(setSelectedHost(hostUid));
  dispatch(setActiveMainTab(`host:${hostUid}`));
  dispatch(fetchDatabaseStartInfo(hostUid));
  dispatch(fetchBrokerList(hostUid));
  dispatch(fetchHostEnv(hostUid));
}

export default function ImportExportHostModal() {
  const CM = useCM();
  const dispatch = useDispatch();
  const { isImportExportModalOpen, importExportMode, hosts } = useSelector((state) => state.host, shallowEqual);
  const [selectedHosts, setSelectedHosts] = useState([]);
  const [importList, setImportList] = useState([]);
  const [pendingPasswordHosts, setPendingPasswordHosts] = useState([]);
  const [passwordDrafts, setPasswordDrafts] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState('export_servers');
  const [importGroupName, setImportGroupName] = useState('Imported');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isImportExportModalOpen) {
      if (importExportMode === 'export') {
        setImportList(hosts);
        setSelectedHosts(hosts.map(h => h.uid));
      } else {
        setImportList([]);
        setSelectedHosts([]);
        setPendingPasswordHosts([]);
        setPasswordDrafts({});
        setImportGroupName('Imported');
      }
    }
  }, [isImportExportModalOpen, importExportMode, hosts]);

  if (!isImportExportModalOpen) return null;

  const handleToggleHost = (uid) => {
    setSelectedHosts(prev =>
      prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]
    );
  };

  const handleToggleAll = () => {
    const selectable = importList.filter(h => h.isSelectable);
    if (selectedHosts.length === selectable.length) {
      setSelectedHosts([]);
    } else {
      setSelectedHosts(selectable.map(h => h.uid));
    }
  };

  const deriveImportGroupName = (filename) => {
    const base = String(filename || '')
      .replace(/\.(xml|prefs|properties|txt)$/i, '')
      .trim();
    return base || 'Imported';
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        setImportGroupName(deriveImportGroupName(file.name));
        const parsed = parseHostsXml(event.target.result);
        const listWithStatus = buildImportPreviewList(parsed, hosts);

        setImportList(listWithStatus);
        setSelectedHosts(listWithStatus.filter(h => h.isSelectable).map(h => h.uid));
      } catch (err) {
        dispatch(showStatusModal({
          type: 'error',
          title: 'Import Error',
          message: err.message || 'An error occurred while parsing the file.',
        }));
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  const rollbackImportGroup = async (importGroupId) => {
    if (!importGroupId) return;
    await dispatch(deleteHostGroup(importGroupId)).unwrap().catch(() => {});
  };

  const handleAction = async () => {
    if (selectedHosts.length === 0) return;

    setIsProcessing(true);
    try {
      if (importExportMode === 'export') {
        const hostsToExport = hosts.filter(h => selectedHosts.includes(h.uid));
        const finalFileName = `${fileName || 'export_servers'}.xml`;
        exportHostsToXml(hostsToExport, finalFileName);
        dispatch(closeImportExportModal());
      } else {
        const hostsToImport = importList.filter((h) => selectedHosts.includes(h.uid));
        const hostsToAdd = hostsToImport.filter((row) => row.isSelectable);

        const preflight = validateSelectedImportRows(hostsToAdd);
        if (!preflight.ok) {
          dispatch(showStatusModal({
            type: 'error',
            title: 'Import validation failed',
            message: preflight.messages.join('\n'),
          }));
          return;
        }

        if (hostsToAdd.length === 0) {
          dispatch(showStatusModal({
            type: 'info',
            title: 'Import Result',
            message: 'No valid hosts selected for import.',
          }));
          return;
        }

        const skippedCount = hostsToImport.length - hostsToAdd.length;
        const importedWithoutPassword = [];
        let importGroupId = null;

        try {
          const groupName = importGroupName.trim() || 'Imported';
          const previousGroups = store.getState().host.hostGroups;
          const groupsAfterCreate = await dispatch(createHostGroup({ name: groupName })).unwrap();
          importGroupId = findNewGroupId(previousGroups, groupsAfterCreate);

          if (!importGroupId) {
            throw new Error('Failed to create import group.');
          }

          for (const hostData of hostsToAdd) {
            const hostGroups = await dispatch(addHost({
              alias: hostData.alias,
              address: hostData.address,
              id: hostData.id,
              password: hostData.password || '',
              port: hostData.portNumber,
              groupId: importGroupId,
            })).unwrap();

            if (!hostData.password) {
              const addedHosts = flattenHostsFromGroups(hostGroups);
              const addedHost = addedHosts.find((h) =>
                h.address === hostData.address &&
                h.port === hostData.portNumber &&
                h.id === hostData.id
              );
              if (addedHost) {
                importedWithoutPassword.push(addedHost);
              }
            }
          }

          const addedCount = hostsToAdd.length;

          if (importedWithoutPassword.length > 0) {
            const draft = {};
            importedWithoutPassword.forEach((host) => { draft[host.uid] = ''; });
            setPasswordDrafts(draft);
            setPendingPasswordHosts(importedWithoutPassword);
            dispatch(showStatusModal({
              type: 'info',
              title: 'Set imported passwords',
              message: `Imported ${addedCount} host(s) into "${groupName}". Add passwords for ${importedWithoutPassword.length} host(s), or skip.`,
            }));
          } else {
            dispatch(showStatusModal({
              type: 'success',
              title: 'Import Result',
              message: `Imported ${addedCount} host(s) into "${groupName}". ${skippedCount} item(s) were skipped.`,
            }));
            dispatch(closeImportExportModal());
          }
        } catch (err) {
          await rollbackImportGroup(importGroupId);
          dispatch(showStatusModal({
            type: 'error',
            title: 'Import failed',
            message: err?.message || 'Import was rolled back. No hosts were added.',
          }));
        }
      }
    } catch (err) {
      dispatch(showStatusModal({
        type: 'error',
        title: 'Import Error',
        message: err?.message || 'Failed to import hosts.',
      }));
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePasswordDraftChange = (uid, value) => {
    setPasswordDrafts((prev) => ({ ...prev, [uid]: value }));
  };

  const handleApplyImportedPasswords = async () => {
    if (pendingPasswordHosts.length === 0) {
      dispatch(closeImportExportModal());
      return;
    }

    setIsProcessing(true);
    let updatedCount = 0;
    let firstLoggedInUid = null;
    const loginFailures = [];

    try {
      for (const host of pendingPasswordHosts) {
        const password = String(passwordDrafts[host.uid] || '');
        if (!password) continue;

        const payload = {
          id: host.id,
          address: host.address,
          port: Number(host.port),
          alias: host.alias,
          password,
        };

        try {
          await dispatch(editHost({ hostUid: host.uid, payload })).unwrap();
          updatedCount += 1;
          try {
            await loginImportedHost(dispatch, host.uid);
            if (!firstLoggedInUid) {
              firstLoggedInUid = host.uid;
            }
          } catch (loginErr) {
            loginFailures.push(host.alias || host.id);
          }
        } catch {
          // Continue for remaining hosts.
        }
      }

      let message = `Password updated for ${updatedCount} host(s).`;
      if (firstLoggedInUid) {
        message += ' First successful host was connected.';
      }
      if (loginFailures.length > 0) {
        message += ` Login failed for: ${loginFailures.join(', ')}.`;
      }

      if (firstLoggedInUid) {
        activateImportedHost(dispatch, firstLoggedInUid);
      }

      dispatch(showStatusModal({
        type: updatedCount > 0 ? 'success' : 'info',
        title: 'Import Result',
        message,
      }));
      dispatch(closeImportExportModal());
    } finally {
      setIsProcessing(false);
      setPendingPasswordHosts([]);
      setPasswordDrafts({});
    }
  };

  const isPasswordStep = importExportMode === 'import' && pendingPasswordHosts.length > 0;
  const title = isPasswordStep
    ? 'Set Passwords for Imported Hosts'
    : (importExportMode === 'export' ? CM.exportHosts : CM.importHosts);
  const actionLabel = isPasswordStep
    ? 'Apply Passwords'
    : (importExportMode === 'export' ? CM.exportHost : CM.importHost);
  const icon = importExportMode === 'export' ? 'file_upload' : 'file_download';

  const selectable = importList.filter(h => h.isSelectable);
  const isAllSelected = selectable.length > 0 && selectedHosts.length === selectable.length;
  const isSomeSelected = selectedHosts.length > 0 && selectedHosts.length < selectable.length;
  const hasValidationErrors = importList.some((h) => h.validationError && !h.isDuplicate);

  return (
    <Modal
      isOpen={isImportExportModalOpen}
      onClose={() => dispatch(closeImportExportModal())}
      title={title}
      icon={icon}
      loading={isProcessing}
      maxWidth="max-w-[720px]"
      subtitle={isPasswordStep
        ? 'Imported hosts were added without passwords. Enter passwords now or skip.'
        : importExportMode === 'export'
        ? 'Export hosts to XML file. Note: The passwords are not included.'
        : 'Import flat host lists into a single group (legacy XML / .prefs / .properties).'}
      footer={
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-4">
            {importExportMode === 'import' && importList.length > 0 && !isPasswordStep && (
              <Button
                variant="ghost"
                size="sm"
                icon="change_circle"
                onClick={() => { setImportList([]); setSelectedHosts([]); }}
              >
                Change File
              </Button>
            )}
            {importExportMode === 'export' && !isPasswordStep && (
              <div className="flex items-center gap-2">
                <Typography variant="caption" className="font-bold text-slate-400 uppercase tracking-tight">Filename:</Typography>
                <div className="w-48">
                  <Input
                    size="sm"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    placeholder="export_servers"
                    suffix=".XML"
                  />
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                if (isPasswordStep) {
                  dispatch(showStatusModal({
                    type: 'info',
                    title: 'Import Result',
                    message: 'Passwords were skipped for imported hosts. You can edit each host later.',
                  }));
                }
                dispatch(closeImportExportModal());
                setPendingPasswordHosts([]);
                setPasswordDrafts({});
              }}
              disabled={isProcessing}
            >
              {isPasswordStep ? 'Skip' : 'Discard'}
            </Button>
            <Button
              variant="primary"
              onClick={isPasswordStep ? handleApplyImportedPasswords : handleAction}
              disabled={isPasswordStep ? isProcessing : (selectedHosts.length === 0 || isProcessing)}
              loading={isProcessing}
              icon={icon === 'file_upload' ? 'bolt' : icon}
              className="min-w-[120px]"
            >
              {actionLabel}
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col h-[500px]">
        {isPasswordStep ? (
          <div className="px-4 py-3 space-y-3 overflow-auto">
            {pendingPasswordHosts.map((host) => (
              <div key={host.uid} className="p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="text-xs font-semibold mb-2">
                  {host.alias || host.id} ({host.address}:{host.port})
                </div>
                <Input
                  type="password"
                  size="sm"
                  placeholder="Host password"
                  value={passwordDrafts[host.uid] || ''}
                  onChange={(e) => handlePasswordDraftChange(host.uid, e.target.value)}
                />
              </div>
            ))}
          </div>
        ) : importExportMode === 'import' && importList.length === 0 ? (
            <div className="p-8">
              <FileUpload
                label={CM.importHostsXml}
                accept=".xml,.prefs,.properties,.txt"
                onFileSelect={(file) => {
                  const event = { target: { files: [file] } };
                  handleFileChange(event);
                }}
              />
              <Typography variant="p" className="text-slate-500 mt-4 text-center text-[11px] max-w-[280px] mx-auto">
                Select a CUBRID hosts XML file or legacy desktop .prefs / .properties file.
              </Typography>
            </div>
        ) : (
          <>
            <div className="px-4 py-2 bg-slate-50/50 dark:bg-bk-main/20 flex flex-col gap-2 border-b border-slate-100 dark:border-slate-800">
              {importExportMode === 'import' && (
                <div className="flex items-center gap-2">
                  <Typography variant="caption" className="font-bold text-slate-400 uppercase tracking-tight shrink-0">
                    Group
                  </Typography>
                  <div className="flex-1 max-w-xs">
                    <Input
                      size="sm"
                      value={importGroupName}
                      onChange={(e) => setImportGroupName(e.target.value)}
                      placeholder="Imported"
                    />
                  </div>
                  <Typography variant="caption" className="text-slate-400 text-[10px]">
                    All selected hosts go into this group
                  </Typography>
                </div>
              )}
              {hasValidationErrors && (
                <Typography variant="caption" className="text-amber-600 dark:text-amber-400 text-[10px]">
                  Rows with validation errors cannot be imported. Fix the source file or deselect them.
                </Typography>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={isAllSelected}
                    indeterminate={isSomeSelected}
                    onChange={handleToggleAll}
                    disabled={selectable.length === 0}
                    label={CM.selectAll}
                    className="text-[10px]! font-bold tracking-wider text-slate-500"
                  />
                </div>
                <Badge variant="yellow" size="sm">
                  {selectedHosts.length} SELECTED
                </Badge>
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
               <Table
                  className="h-full"
                   columns={[
                    {
                      accessor: 'select',
                      header: '',
                      width: '48px',
                      render: (_, host) => {
                        const id = host.uid;
                        const isSelected = selectedHosts.includes(id);
                        return (
                          <div className="flex justify-center">
                            <Checkbox
                              checked={isSelected}
                              onChange={() => host.isSelectable && handleToggleHost(id)}
                              disabled={!host.isSelectable}
                            />
                          </div>
                        );
                      }
                    },
                    {
                      accessor: 'alias',
                      header: 'Name',
                      render: (alias, host) => (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <Typography variant="caption" className={`font-bold ${host.isSelectable ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400'}`}>
                              {alias || 'Unnamed'}
                            </Typography>
                            {host.isDuplicate && (
                              <Badge variant="secondary" size="xs">DUPLICATE</Badge>
                            )}
                            {host.validationError && !host.isDuplicate && (
                              <Badge variant="secondary" size="xs">INVALID</Badge>
                            )}
                          </div>
                          {host.validationError && (
                            <Typography variant="caption" className="text-[10px] text-amber-600 dark:text-amber-400">
                              {host.validationError}
                            </Typography>
                          )}
                        </div>
                      )
                    },
                    { accessor: 'address', header: 'Address' },
                    { accessor: 'port', header: 'Port' }
                  ]}
                  data={importList}
                  onRowClick={(host) => {
                    if (host.isSelectable) handleToggleHost(host.uid);
                  }}
                  rowClassName={(host) => {
                    const isSelected = selectedHosts.includes(host.uid);
                    return `
                      ${isSelected ? 'bg-bk-yellow/3' : ''}
                      ${host.isSelectable ? 'cursor-pointer' : 'opacity-60 grayscale-[0.35]'}
                    `;
                  }}
               />
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
