/** gettransactioninfo / killtransaction helpers (CUBRID Manager style). */

export function parseTranIndex(tranindex) {
  if (tranindex == null || tranindex === '') return '';
  const match = String(tranindex).match(/\d+/);
  return match ? match[0] : String(tranindex).trim();
}

export function buildKillParameter(killType, transaction) {
  if (!transaction) return '';
  switch (killType) {
    case 'i':
      return parseTranIndex(transaction.tranindex);
    case 'h':
      return (transaction.host || '').trim();
    case 'p':
      return (transaction.program || transaction.pname || '').trim();
    default:
      return '';
  }
}

export function extractTransactionList(response) {
  const containers = response?.transactioninfo;
  if (containers == null) return [];
  const list = Array.isArray(containers) ? containers : [containers];
  const txs = list[0]?.transaction;
  if (txs == null) return [];
  return Array.isArray(txs) ? txs : [txs];
}
