import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { closeImportExportModal, addHost, editHost } from '../hostSlice';
import { showStatusModal } from '../../layout/layoutSlice';
import { exportHostsToXml, parseHostsXml } from '../hostImportExport';
import { Modal } from '../../../components/ds/layout/Modal';
import { Button } from '../../../components/ds/foundation/Button';
import { Table } from '../../../components/ds/layout/Table';
import { Badge } from '../../../components/ds/foundation/Badge';
import { Input } from '../../../components/ds/forms/Input';
import { FileUpload } from '../../../components/ds/forms/FileUpload';
import { Typography } from '../../../components/ds/foundation/Typography';
import { Checkbox } from '../../../components/ds/forms/Checkbox';

import { Icon } from '../../../components/ds/foundation/Icon';
import { useCM } from '../../../constants/useCM';

export default function ImportExportHostModal() {
  const CM = useCM();
  const dispatch = useDispatch();
  const { isImportExportModalOpen, importExportMode, hosts } = useSelector((state) => state.host, shallowEqual);
  const [selectedHosts, setSelectedHosts] = useState([]);
  const [importList, setImportList] = useState([]);
  const [pendingPasswordHosts, setPendingPasswordHosts] = useState([]);
  const [passwordDrafts, setPasswordDrafts] = useState({});
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState('export_servers');
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
        setShowPasswordPrompt(false);
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
    const selectable = importList.filter(h => !h.isDuplicate);
    if (selectedHosts.length === selectable.length) {
      setSelectedHosts([]);
    } else {
      setSelectedHosts(selectable.map(h => h.uid));
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const xmlString = event.target.result;
        const parsed = parseHostsXml(xmlString);
        
        const listWithStatus = parsed.map(h => {
          const isDuplicate = hosts.find(existing => 
            existing.address === h.address && String(existing.port) === String(h.port)
          );
          return {
            ...h,
            uid: h.address + ':' + h.port + ':' + h.id,
            isDuplicate: !!isDuplicate
          };
        });

        setImportList(listWithStatus);
        setSelectedHosts(listWithStatus.filter(h => !h.isDuplicate).map(h => h.uid));
      } catch (err) {
        dispatch(showStatusModal({ 
          type: 'error', 
          title: 'Import Error', 
          message: err.message || 'An error occurred while parsing the file.' 
        }));
        e.target.value = '';
      }
    };
    reader.readAsText(file);
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
        const hostsToImport = importList.filter(h => selectedHosts.includes(h.uid));
        const importedHosts = [];
        let skippedCount = 0;

        for (const hostData of hostsToImport) {
          const isDuplicate = hosts.find(h => h.address === hostData.address && String(h.port) === String(hostData.port));
          if (isDuplicate) {
            skippedCount++;
            continue;
          }
          try {
            const allHosts = await dispatch(addHost({ ...hostData, port: Number(hostData.port) })).unwrap();
            const added = allHosts.find(h => h.address === hostData.address && String(h.port) === String(hostData.port));
            if (added) importedHosts.push(added);
          } catch {
            skippedCount++;
          }
        }

        if (importedHosts.length > 0) {
          const drafts = {};
          importedHosts.forEach(h => { drafts[h.uid] = ''; });
          setPasswordDrafts(drafts);
          setPendingPasswordHosts(importedHosts);
          setShowPasswordPrompt(true);
        } else {
          dispatch(showStatusModal({
            type: skippedCount > 0 ? 'info' : 'error',
            title: 'Import Result',
            message: skippedCount > 0
              ? `All ${skippedCount} host(s) were skipped (duplicates or errors).`
              : 'No hosts were imported.',
          }));
          dispatch(closeImportExportModal());
        }
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyPasswords = async () => {
    setIsProcessing(true);
    const failed = [];
    for (const host of pendingPasswordHosts) {
      const password = passwordDrafts[host.uid] ?? '';
      if (!password) continue;
      try {
        await dispatch(editHost({
          hostUid: host.uid,
          payload: { id: host.id, address: host.address, port: Number(host.port), alias: host.alias, password },
        })).unwrap();
      } catch {
        failed.push(host.alias || host.id);
      }
    }
    const entered = pendingPasswordHosts.filter(h => (passwordDrafts[h.uid] ?? '') !== '').length;
    dispatch(showStatusModal({
      type: failed.length ? 'info' : 'success',
      title: 'Import Result',
      message: entered === 0
        ? `${pendingPasswordHosts.length} host(s) imported. No passwords were set.`
        : failed.length
        ? `Passwords saved for ${entered - failed.length} host(s). Failed: ${failed.join(', ')}.`
        : `${pendingPasswordHosts.length} host(s) imported. Passwords saved for ${entered} host(s).`,
    }));
    dispatch(closeImportExportModal());
    setIsProcessing(false);
    setPendingPasswordHosts([]);
    setPasswordDrafts({});
    setShowPasswordPrompt(false);
  };

  const isPasswordPromptStep = showPasswordPrompt && pendingPasswordHosts.length > 0;
  const isPasswordStep = !showPasswordPrompt && pendingPasswordHosts.length > 0;
  const hasPasswordDrafts = pendingPasswordHosts.some(h => (passwordDrafts[h.uid] ?? '') !== '');

  const title = importExportMode === 'export' ? CM.exportHosts : CM.importHosts;
  const actionLabel = importExportMode === 'export' ? CM.exportHost : CM.importHost;
  const icon = importExportMode === 'export' ? 'file_upload' : 'file_download';

  const selectable = importList.filter(h => !h.isDuplicate);
  const isAllSelected = selectable.length > 0 && selectedHosts.length === selectable.length;
  const isSomeSelected = selectedHosts.length > 0 && selectedHosts.length < selectable.length;

  return (
    <Modal
      isOpen={isImportExportModalOpen}
      onClose={() => dispatch(closeImportExportModal())}
      title={title}
      icon={icon}
      loading={isProcessing}
      maxWidth="max-w-[720px]"
      subtitle={isPasswordPromptStep
        ? `${pendingPasswordHosts.length} host(s) imported. Passwords are not stored in the file.`
        : isPasswordStep
        ? 'Enter passwords below or skip — you can edit each host later.'
        : importExportMode === 'export'
        ? 'Export hosts to XML file. Note: The passwords are not included.'
        : 'Import hosts from XML file.'}
      footer={
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-4">
            {importExportMode === 'import' && importList.length > 0 && !isPasswordPromptStep && !isPasswordStep && (
              <Button 
                variant="ghost" 
                size="sm"
                icon="change_circle"
                onClick={() => { setImportList([]); setSelectedHosts([]); }}
              >
                Change File
              </Button>
            )}
            {importExportMode === 'export' && (
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
            {isPasswordPromptStep ? (
              <>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setPendingPasswordHosts([]);
                    setPasswordDrafts({});
                    setShowPasswordPrompt(false);
                    dispatch(showStatusModal({
                      type: 'success',
                      title: 'Import Result',
                      message: `${pendingPasswordHosts.length} host(s) imported. You can set passwords later by editing each host.`,
                    }));
                    dispatch(closeImportExportModal());
                  }}
                  disabled={isProcessing}
                >
                  Skip
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setShowPasswordPrompt(false)}
                  icon="lock"
                  className="min-w-[160px]"
                >
                  Add Passwords
                </Button>
              </>
            ) : isPasswordStep ? (
              <>
                <Button
                  variant="secondary"
                  onClick={() => {
                    dispatch(showStatusModal({
                      type: 'success',
                      title: 'Import Result',
                      message: `${pendingPasswordHosts.length} host(s) imported without passwords.`,
                    }));
                    dispatch(closeImportExportModal());
                    setPendingPasswordHosts([]);
                    setPasswordDrafts({});
                    setShowPasswordPrompt(false);
                  }}
                  disabled={isProcessing}
                >
                  Skip
                </Button>
                <Button
                  variant="primary"
                  onClick={handleApplyPasswords}
                  disabled={isProcessing || !hasPasswordDrafts}
                  loading={isProcessing}
                  icon="check_circle"
                  className="min-w-[140px]"
                >
                  Apply Passwords
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="secondary"
                  onClick={() => dispatch(closeImportExportModal())}
                  disabled={isProcessing}
                >
                  Discard
                </Button>
                <Button
                  variant="primary"
                  onClick={handleAction}
                  disabled={selectedHosts.length === 0 || isProcessing}
                  loading={isProcessing}
                  icon={icon === 'file_upload' ? 'bolt' : icon}
                  className="min-w-[120px]"
                >
                  {actionLabel}
                </Button>
              </>
            )}
          </div>
        </div>
      }
    >
      <div className="flex flex-col h-[500px]">
        {isPasswordPromptStep ? (
          <div className="flex flex-col items-center justify-center flex-1 px-8 py-6 gap-5 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Icon name="lock" size="28px" weight={300} className="text-amber-500" />
            </div>
            <div className="space-y-1.5">
              <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100">
                Add passwords for imported hosts?
              </p>
              <p className="text-[12px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                {pendingPasswordHosts.length} host(s) were imported without passwords.
                You can add them now, or skip and edit each host individually later.
              </p>
            </div>
            <div className="w-full max-w-xs divide-y divide-slate-100 dark:divide-white/5 border border-slate-200 dark:border-white/8 rounded-xl overflow-hidden">
              {pendingPasswordHosts.map((host) => (
                <div key={host.uid} className="px-4 py-2.5 flex items-center gap-3 bg-white dark:bg-white/2">
                  <Icon name="dns" size="16px" weight={300} className="text-slate-400 shrink-0" />
                  <div className="min-w-0 text-left">
                    <p className="text-[12px] font-semibold text-slate-700 dark:text-slate-200 truncate">{host.alias || host.id}</p>
                    <p className="text-[10px] text-slate-400 font-mono truncate">{host.address}:{host.port}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : isPasswordStep ? (
          <div className="px-4 py-3 space-y-3 overflow-auto">
            {pendingPasswordHosts.map((host) => (
              <div key={host.uid} className="p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="text-xs font-semibold mb-2 text-slate-700 dark:text-slate-200">
                  {host.alias || host.id} <span className="font-normal text-slate-400">({host.address}:{host.port})</span>
                </div>
                <Input
                  type="password"
                  size="sm"
                  placeholder="Host password"
                  value={passwordDrafts[host.uid] || ''}
                  onChange={(e) => setPasswordDrafts(prev => ({ ...prev, [host.uid]: e.target.value }))}
                />
              </div>
            ))}
          </div>
        ) : importExportMode === 'import' && importList.length === 0 ? (
            <div className="p-8">
              <FileUpload
                label={CM.importHostsXml}
                accept=".xml"
                onFileSelect={(file) => {
                  const event = { target: { files: [file] } };
                  handleFileChange(event);
                }}
              />
              <Typography variant="p" className="text-slate-500 mt-4 text-center text-[11px] max-w-[280px] mx-auto">
                Select an XML file containing host connections exported from CUBRID Admin.
              </Typography>
            </div>
        ) : (
          <>
            <div className="px-4 py-2 bg-slate-50/50 dark:bg-bk-main/20 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
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

            <div className="flex-1 overflow-hidden">
               <Table
                  className="h-full"
                   columns={[
                    { 
                      accessor: 'select', 
                      header: '', 
                      width: '48px',
                      render: (_, host) => {
                        const id = host.uid || host.address + host.port + host.id;
                        const isSelected = selectedHosts.includes(id);
                        return (
                          <div className="flex justify-center">
                            <Checkbox 
                              checked={isSelected}
                              onChange={() => !host.isDuplicate && handleToggleHost(id)}
                              disabled={host.isDuplicate}
                            />
                          </div>
                        );
                      }
                    },
                    { 
                      accessor: 'alias', 
                      header: 'Name',
                      render: (alias, host) => (
                        <div className="flex items-center gap-2">
                          <Typography variant="caption" className={`font-bold ${host.isDuplicate ? 'text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>
                            {alias || 'Unnamed'}
                          </Typography>
                          {host.isDuplicate && (
                            <Badge variant="secondary" size="xs">DUPLICATE</Badge>
                          )}
                        </div>
                      )
                    },
                    { accessor: 'address', header: 'Address' },
                    { accessor: 'port', header: 'Port' }
                  ]}
                  data={importList}
                  onRowClick={(host) => {
                    const id = host.uid || host.address + host.port + host.id;
                    if (!host.isDuplicate) handleToggleHost(id);
                  }}
                  rowClassName={(host) => {
                    const id = host.uid || host.address + host.port + host.id;
                    const isSelected = selectedHosts.includes(id);
                    return `
                      ${isSelected ? 'bg-bk-yellow/3' : ''} 
                      ${host.isDuplicate ? 'opacity-60 grayscale-[0.5]' : 'cursor-pointer'}
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
