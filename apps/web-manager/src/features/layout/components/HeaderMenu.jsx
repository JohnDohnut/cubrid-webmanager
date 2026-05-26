import { RefreshingOverlay } from '../../../components/ds/feedback/RefreshingOverlay';
import { useState } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { DropdownMenu, SubMenu, MenuItem, MenuDivider } from '../../../components/common/DropdownMenu';
import { openTab, showStatusModal, setActiveMainTab } from '../layoutSlice';
import { openAddHostModal, openEditHostModal, startService, stopService, openServerVersionModal, openImportExportModal } from '../../host/hostSlice';
import { startDatabase, stopDatabase, fetchDatabaseStartInfo } from '../../database/databaseSlice';
import { startBroker, stopBroker, fetchBrokerList } from '../../broker/brokerSlice';
import { setAboutCubrid } from '../appBarSlice';
import { Typography } from '../../../components/ds/foundation/Typography';
import { useActionState } from '../../../infrastructure/hooks/useActionState';
import { Modal } from '../../../components/ds/layout/Modal';
import { ModalStatusError } from '../../../components/ds/feedback/ActionStatus';
import { useCM } from '../../../constants/useCM';

export default function HeaderMenu() {
  const CM = useCM();
  const dispatch = useDispatch();
  const { selectedHostUid } = useSelector((state) => state.host, shallowEqual);
  const { selectedDatabase, activeDatabases } = useSelector((state) => state.database, shallowEqual);
  const { brokers, selectedBroker } = useSelector((state) => state.broker, shallowEqual);

  const { 
    startAction, 
    endError, 
    resetAction,
    isLoading: menuActionLoading,
    isError: isMenuActionError,
    error: menuActionError
  } = useActionState();

  const [loadingTitle, setLoadingTitle] = useState(CM.processing);

  const handleServiceAction = async (action) => {
    if (!selectedHostUid) return;
    setLoadingTitle(action === 'start' ? CM.startingService : CM.stoppingService);
    startAction();
    try {
      if (action === 'start') {
        await dispatch(startService(selectedHostUid)).unwrap();
      } else {
        await dispatch(stopService(selectedHostUid)).unwrap();
      }
      resetAction();
    } catch (err) {
      endError(err);
    }
  };

  const handleDatabaseAction = async (action) => {
    if (!selectedDatabase) return;
    setLoadingTitle(action === 'start' ? CM.startingDbNamed(selectedDatabase) : CM.stoppingDbNamed(selectedDatabase));
    startAction();
    try {
      if (action === 'start') {
        await dispatch(startDatabase({ hostUid: selectedHostUid, dbname: selectedDatabase })).unwrap();
      } else {
        await dispatch(stopDatabase({ hostUid: selectedHostUid, dbname: selectedDatabase })).unwrap();
      }
      dispatch(fetchDatabaseStartInfo(selectedHostUid));
      resetAction();
    } catch (err) {
      endError(err);
    }
  };

  const handleBrokerAction = async (action) => {
    if (!selectedBroker) return;
    setLoadingTitle(action === 'start' ? CM.startingBrokerNamed(selectedBroker) : CM.stoppingBrokerNamed(selectedBroker));
    startAction();
    try {
      if (action === 'start') {
        await dispatch(startBroker({ hostUid: selectedHostUid, brokerName: selectedBroker })).unwrap();
      } else {
        await dispatch(stopBroker({ hostUid: selectedHostUid, brokerName: selectedBroker })).unwrap();
      }
      dispatch(fetchBrokerList(selectedHostUid));
      resetAction();
    } catch (err) {
      endError(err);
    }
  };

  const handleExport = () => {
    dispatch(openImportExportModal('export'));
  };

  const handleImport = () => {
    dispatch(openImportExportModal('import'));
  };

  const MenuLabel = ({ children }) => (
    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 tracking-wide group-hover:text-amber-500 transition-colors">
      {children}
    </span>
  );

  return (
    <nav className="flex items-center gap-6 font-sans">
      {/* Loading Overlay - Using direct fixed component call */}
      {menuActionLoading && (
        <RefreshingOverlay 
          show={true} 
          title={loadingTitle} 
          className="fixed z-[10002]"
        />
      )}

      <DropdownMenu label={<MenuLabel>{CM.file}</MenuLabel>}>
        <MenuItem
          icon="add_box"
          label={CM.addHost}
          onClick={() => dispatch(openAddHostModal())}
        />
        <MenuItem
          icon="edit"
          label={CM.changeHost}
          disabled={!selectedHostUid}
          onClick={() => dispatch(openEditHostModal(selectedHostUid))}
        />
        <MenuItem
          icon="file_upload"
          label={CM.exportHost}
          onClick={handleExport}
        />
        <MenuItem
          icon="file_download"
          label={CM.importHost}
          onClick={handleImport}
        />
      </DropdownMenu>

      <DropdownMenu label={<MenuLabel>{CM.tools}</MenuLabel>} width="w-56">
        <MenuItem
          icon="space_dashboard"
          label={CM.serviceDashboard}
          onClick={() => dispatch(openTab('service_dashboard'))}
        />
        <MenuDivider />
        <MenuItem
          icon="play_arrow"
          label={CM.startService}
          disabled={!selectedHostUid || menuActionLoading}
          onClick={() => handleServiceAction('start')}
        />
        <MenuItem
          icon="stop"
          label={CM.stopService}
          disabled={!selectedHostUid || menuActionLoading}
          onClick={() => handleServiceAction('stop')}
        />
        <MenuDivider />
        <MenuItem
          icon="database"
          label={CM.startDatabase}
          disabled={!selectedDatabase || activeDatabases.includes(selectedDatabase) || menuActionLoading}
          onClick={() => handleDatabaseAction('start')}
        />
        <MenuItem
          icon="database_off"
          label={CM.stopDatabase}
          disabled={!selectedDatabase || !activeDatabases.includes(selectedDatabase) || menuActionLoading}
          onClick={() => handleDatabaseAction('stop')}
        />
        <MenuDivider />
        <MenuItem
          icon="hub"
          label={CM.startBroker}
          disabled={!selectedBroker || brokers.find(b => b.name === selectedBroker)?.state === 'ON' || menuActionLoading}
          onClick={() => handleBrokerAction('start')}
        />
        <MenuItem
          icon="hub"
          label={CM.stopBroker}
          disabled={!selectedBroker || brokers.find(b => b.name === selectedBroker)?.state !== 'ON' || menuActionLoading}
          onClick={() => handleBrokerAction('stop')}
        />
      </DropdownMenu>

      <DropdownMenu label={<MenuLabel>{CM.actionMenu}</MenuLabel>} width="w-48">
        <MenuItem icon="tune" label={CM.properties} href="#" />
        <SubMenu icon="settings" label={CM.configParam} width="w-56" gap="ml-3">
          <MenuItem
            icon="edit_document"
            label={CM.editCubridConfig}
            onClick={() => {
              if (selectedHostUid) {
                dispatch(openTab(`edit_config:${selectedHostUid}:cubridconf`));
              } else {
                dispatch(showStatusModal({ type: 'info', title: CM.noHostSelected, message: CM.selectHostHint }));
              }
            }}
          />
          <MenuItem
            icon="edit_note"
            label={CM.editBrokerConfig}
            onClick={() => {
              if (selectedHostUid) {
                dispatch(openTab(`broker_config:${selectedHostUid}`));
              } else {
                dispatch(showStatusModal({ type: 'info', title: CM.noHostSelected, message: CM.selectHostHint }));
              }
            }}
          />
          <MenuItem
            icon="manage_accounts"
            label={CM.editCmConfig}
            onClick={() => {
              if (selectedHostUid) {
                dispatch(openTab(`edit_config:${selectedHostUid}:cmconf`));
              } else {
                dispatch(showStatusModal({ type: 'info', title: CM.noHostSelected, message: CM.selectHostHint }));
              }
            }}
          />
        </SubMenu>
      </DropdownMenu>

      <DropdownMenu label={<MenuLabel>{CM.help}</MenuLabel>} width="w-56">
        <MenuItem
          icon="help"
          label={CM.help}
          onClick={() => window.open('https://www.cubrid.org/', '_blank')}
        />
        <MenuItem
          icon="bug_report"
          label={CM.reportBug}
          onClick={() => window.open('http://jira.cubrid.org/secure/Dashboard.jspa', '_blank')}
        />
        <MenuItem
          icon="forum"
          label={CM.cubridOnlineForum}
          onClick={() => window.open('https://www.reddit.com/r/CUBRID/', '_blank')}
        />
        <MenuItem
          icon="code"
          label={CM.cubridToolsDevelopment}
          onClick={() => window.open('https://github.com/CUBRID/cubrid-manager', '_blank')}
        />
        <MenuDivider />
        <MenuItem
          icon="update"
          label={CM.checkForUpdates}
          disabled={true}
          onClick={() => {}}
        />
        <MenuItem
          icon="info"
          label={CM.serverVersion}
          disabled={!selectedHostUid}
          onClick={() => dispatch(openServerVersionModal(selectedHostUid))}
        />
        <MenuItem
          icon="admin_panel_settings"
          label={CM.aboutCubridAdmin}
          onClick={() => dispatch(setAboutCubrid(true))}
        />
      </DropdownMenu>
      {isMenuActionError && (
        <Modal isOpen title={CM.actionFailed} icon="error" iconVariant="danger" onClose={resetAction} maxWidth="400px">
          <ModalStatusError 
            title={CM.updateInterrupted}
            error={menuActionError}
            onRetry={resetAction}
            onCancel={resetAction}
            retryText={CM.dismiss}
          />
        </Modal>
      )}
    </nav>
  );
}
