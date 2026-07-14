import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { closeManageGroupMembersModal, moveHost } from '../hostSlice';
import { flattenHostsFromGroups, findGroupIdForHost, UNGROUPED_GROUP_ID } from '../hostGroupUtils';
import { Modal } from '../../../components/ds/layout/Modal';
import { Button } from '../../../components/ds/foundation/Button';
import { Input } from '../../../components/ds/forms/Input';
import { Checkbox } from '../../../components/ds/forms/Checkbox';
import { Table } from '../../../components/ds/layout/Table';
import { Typography } from '../../../components/ds/foundation/Typography';
import { useCM } from '../../../constants/useCM';

export default function ManageGroupMembersModal() {
  const CM = useCM();
  const dispatch = useDispatch();
  const {
    isManageGroupMembersModalOpen,
    groupToEditId,
    groupToEditName,
    hostGroups,
  } = useSelector((state) => state.host, shallowEqual);

  const [selectedUids, setSelectedUids] = useState(() => new Set());
  const [initialUids, setInitialUids] = useState(() => new Set());
  const [filter, setFilter] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const allHosts = useMemo(() => flattenHostsFromGroups(hostGroups), [hostGroups]);

  useEffect(() => {
    if (isManageGroupMembersModalOpen && groupToEditId) {
      const currentMembers = new Set(
        allHosts.filter((h) => findGroupIdForHost(hostGroups, h.uid) === groupToEditId).map((h) => h.uid)
      );
      setSelectedUids(new Set(currentMembers));
      setInitialUids(currentMembers);
      setFilter('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isManageGroupMembersModalOpen, groupToEditId]);

  if (!isManageGroupMembersModalOpen) return null;

  const toggleHost = (uid) => {
    setSelectedUids((prev) => {
      const next = new Set(prev);
      if (next.has(uid)) next.delete(uid);
      else next.add(uid);
      return next;
    });
  };

  const rows = allHosts
    .map((host) => {
      const currentGroupId = findGroupIdForHost(hostGroups, host.uid);
      return {
        uid: host.uid,
        name: host.alias || host.id,
        address: host.address,
        port: host.port,
        currentGroup: currentGroupId === UNGROUPED_GROUP_ID
          ? CM.ungroupedHosts
          : (hostGroups?.[currentGroupId]?.name || ''),
      };
    })
    .filter((row) => {
      const q = filter.trim().toLowerCase();
      if (!q) return true;
      return row.name.toLowerCase().includes(q) || (row.address || '').toLowerCase().includes(q);
    });

  const columns = [
    {
      header: '',
      accessor: 'selected',
      width: '36px',
      render: (_, row) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Checkbox checked={selectedUids.has(row.uid)} onChange={() => toggleHost(row.uid)} />
        </div>
      ),
    },
    { header: CM.friendlyName, accessor: 'name' },
    { header: CM.ipAddressDomain, accessor: 'address' },
    { header: CM.port, accessor: 'port' },
    { header: CM.groupLabel, accessor: 'currentGroup' },
  ];

  const handleClose = () => dispatch(closeManageGroupMembersModal());

  const handleSave = async () => {
    const toAdd = [...selectedUids].filter((uid) => !initialUids.has(uid));
    const toRemove = [...initialUids].filter((uid) => !selectedUids.has(uid));
    if (toAdd.length === 0 && toRemove.length === 0) {
      handleClose();
      return;
    }

    setIsSaving(true);
    try {
      for (const uid of toAdd) {
        await dispatch(moveHost({ hostUid: uid, targetGroupId: groupToEditId })).unwrap().catch(() => {});
      }
      for (const uid of toRemove) {
        await dispatch(moveHost({ hostUid: uid, targetGroupId: UNGROUPED_GROUP_ID })).unwrap().catch(() => {});
      }
    } finally {
      setIsSaving(false);
      handleClose();
    }
  };

  const changedCount = [...selectedUids].filter((uid) => !initialUids.has(uid)).length
    + [...initialUids].filter((uid) => !selectedUids.has(uid)).length;

  return (
    <Modal
      isOpen={isManageGroupMembersModalOpen}
      onClose={handleClose}
      title={CM.manageGroupMembersTitle(groupToEditName)}
      icon="group_work"
      maxWidth="max-w-[620px]"
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button variant="secondary" onClick={handleClose} disabled={isSaving}>
            {CM.cancel}
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            loading={isSaving}
            icon="save_as"
            className="min-w-[140px]"
          >
            {changedCount > 0 ? CM.saveChangesCount(changedCount) : CM.saveChanges}
          </Button>
        </div>
      }
    >
      <div className="space-y-4 p-1">
        <Typography variant="caption" className="text-slate-400 dark:text-slate-500">
          {CM.manageGroupMembersDesc}
        </Typography>

        <Input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder={CM.searchHostsPlaceholder}
          icon="search"
        />

        <div className="max-h-[360px] overflow-y-auto border border-slate-200 dark:border-white/10 rounded-lg">
          <Table
            columns={columns}
            data={rows}
            onRowClick={(row) => toggleHost(row.uid)}
            bordered
          />
        </div>
      </div>
    </Modal>
  );
}
