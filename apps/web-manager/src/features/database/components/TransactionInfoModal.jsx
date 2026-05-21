import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { closeTransactionInfoModal, openKillTransactionModal } from '../databaseSlice';
import { databaseApi } from '../databaseApi';
import { extractTransactionList } from '../transactionUtils';
import { Input } from '../../../components/ds/forms/Input';
import { Modal } from '../../../components/ds/layout/Modal';
import { Button } from '../../../components/ds/foundation/Button';
import { Typography } from '../../../components/ds/foundation/Typography';
import { EmptyState } from '../../../components/ds/feedback/EmptyState';
import { ModalStatusLoading } from '../../../components/ds/feedback/ActionStatus';
import { CM } from '../../../constants/cmLabels';

const VIEW_LOADING = 'loading';
const VIEW_SUCCESS = 'success';
const VIEW_ERROR = 'error';

export default function TransactionInfoModal() {
  const dispatch = useDispatch();
  const { isTransactionInfoModalOpen } = useSelector((state) => state.databaseUI, shallowEqual);
  const { selectedDatabase } = useSelector((state) => state.database, shallowEqual);
  const { selectedHostUid } = useSelector((state) => state.host, shallowEqual);

  const [view, setView] = useState(VIEW_LOADING);
  const [transactions, setTransactions] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedTranIndex, setSelectedTranIndex] = useState(null);
  const [dbuser, setDbuser] = useState('dba');
  const [dbpasswd, setDbpasswd] = useState('');

  const fetchTransactionInfo = async () => {
    if (!selectedHostUid || !selectedDatabase) return;
    if (!dbuser.trim()) {
      setErrorMsg('The user name is not valid.');
      setView(VIEW_ERROR);
      return;
    }

    setView(VIEW_LOADING);
    setErrorMsg('');

    try {
      const response = await databaseApi.getTransactionInfo(selectedHostUid, selectedDatabase, {
        dbuser: dbuser.trim(),
        dbpasswd,
      });
      setTransactions(extractTransactionList(response));
      setView(VIEW_SUCCESS);
    } catch (err) {
      setErrorMsg(err.response?.data?.note || err.response?.data?.message || CM.error);
      setView(VIEW_ERROR);
    }
  };

  useEffect(() => {
    if (isTransactionInfoModalOpen) {
      setSelectedTranIndex(null);
      fetchTransactionInfo();
    }
  }, [isTransactionInfoModalOpen, selectedHostUid, selectedDatabase]);

  if (!isTransactionInfoModalOpen) return null;

  const handleClose = () => dispatch(closeTransactionInfoModal());

  const handleKill = () => {
    const selectedTran = transactions.find((t) => String(t.tranindex) === String(selectedTranIndex));
    if (selectedTran) dispatch(openKillTransactionModal(selectedTran));
  };

  if (view === VIEW_LOADING) {
    return (
      <Modal isOpen title={CM.transactionInformation} icon="swap_horiz" onClose={handleClose} maxWidth="540px">
        <ModalStatusLoading title={CM.transactionInformation} subtitle={CM.loggingInto(selectedDatabase)} />
      </Modal>
    );
  }

  if (view === VIEW_ERROR) {
    return (
      <Modal isOpen title={CM.transactionInformation} icon="error" iconVariant="danger" onClose={handleClose} maxWidth="540px">
        <div className="py-8 space-y-4 text-center">
          <Typography variant="p" className="text-[13px] text-slate-600 dark:text-slate-300">
            {CM.error}
          </Typography>
          <Typography variant="caption" className="text-rose-500 font-mono block break-words px-4">
            {errorMsg}
          </Typography>
          <div className="flex justify-center gap-3">
            <Button variant="ghost" onClick={handleClose}>{CM.close}</Button>
            <Button variant="primary" icon="refresh" onClick={fetchTransactionInfo}>{CM.refresh}</Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isTransactionInfoModalOpen}
      onClose={handleClose}
      title={CM.transactionInformation}
      subtitle={`${CM.activeTransactionsOf} ${selectedDatabase}`}
      icon="swap_horiz"
      maxWidth="1100px"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button variant="danger" disabled={!selectedTranIndex} onClick={handleKill} icon="cancel">
            {CM.killTransaction}
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleClose}>{CM.close}</Button>
            <Button onClick={fetchTransactionInfo} icon="refresh">{CM.refresh}</Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input label={CM.userName} value={dbuser} onChange={(e) => setDbuser(e.target.value)} size="sm" />
          <Input type="password" label={CM.password} value={dbpasswd} onChange={(e) => setDbpasswd(e.target.value)} size="sm" />
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-white/10 overflow-hidden max-h-[480px] overflow-y-auto">
          {transactions.length === 0 ? (
            <EmptyState icon="info" title={CM.transactionInformation} subtitle={CM.activeTransactionsOf} py="py-12" />
          ) : (
            <table className="w-full text-left text-[12px]">
              <thead className="bg-slate-50 dark:bg-white/5 text-[10px] uppercase text-slate-500 sticky top-0">
                <tr>
                  <th className="px-4 py-2">{CM.tranIndex}</th>
                  <th className="px-4 py-2">{CM.userNameCol}</th>
                  <th className="px-4 py-2">{CM.host}</th>
                  <th className="px-4 py-2">{CM.processId}</th>
                  <th className="px-4 py-2">{CM.programName}</th>
                  <th className="px-4 py-2 text-right">Query time</th>
                  <th className="px-4 py-2 text-right">Tran time</th>
                  <th className="px-4 py-2 text-right">Wait holder</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {transactions.map((tran, idx) => {
                  const tranIndex = tran.tranindex;
                  const isSelected = String(selectedTranIndex) === String(tranIndex);
                  return (
                    <tr
                      key={idx}
                      className={`cursor-pointer ${isSelected ? 'bg-amber-500/10' : 'hover:bg-slate-50 dark:hover:bg-white/5'}`}
                      onClick={() => setSelectedTranIndex(tranIndex)}
                    >
                      <td className="px-4 py-2 font-mono">{tranIndex}</td>
                      <td className="px-4 py-2">{tran['@user'] || '-'}</td>
                      <td className="px-4 py-2 font-mono">{tran.host || '-'}</td>
                      <td className="px-4 py-2 font-mono">{tran.pid || '-'}</td>
                      <td className="px-4 py-2">{tran.program || '-'}</td>
                      <td className="px-4 py-2 text-right font-mono">{tran.query_time ?? '-'}</td>
                      <td className="px-4 py-2 text-right font-mono">{tran.tran_time ?? '-'}</td>
                      <td className="px-4 py-2 text-right font-mono">{tran.wait_for_lock_holder ?? '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Modal>
  );
}
