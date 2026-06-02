/**
 * lockdb → dashboard UI rows (CUBRID Manager DatabaseDashboardEditor 가공 A).
 * One row per LOT entry that has at least one lock holder; tran_index joins transaction[].
 */

function asArray(value) {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

/**
 * Accepts API body after axios unwrap `{ lockinfo }` or raw envelope `{ data: { lockinfo } }`.
 */
export function extractLockInfoBlock(response) {
  if (!response || typeof response !== 'object') return null;

  if (response.lockinfo != null) {
    const items = asArray(response.lockinfo);
    const first = items[0];
    if (first && typeof first === 'object') return first;
    if (response.lot != null || response.transaction != null) return response;
  }

  if (response.data?.lockinfo != null) {
    return extractLockInfoBlock(response.data);
  }

  if (response.lot != null || response.transaction != null) return response;

  return null;
}

function tranIndexKey(value) {
  if (value == null || value === '') return null;
  const s = String(value).trim();
  const n = Number(s);
  return Number.isNaN(n) ? s : n;
}

function getTransactionUid(tran) {
  const uid = tran?.['@uid'] ?? tran?.uid ?? '';
  const trimmed = String(uid).trim();
  return trimmed || '-';
}

/** Merge entry[i] (metadata only) + entry[i+1] (lock_holders only) from CMS JSON. */
function normalizeLotEntries(rawEntries) {
  const items = asArray(rawEntries);
  const merged = [];
  let pending = null;

  for (const item of items) {
    const holders = asArray(item.lock_holders);
    const hasMeta = item.ob_type != null || item.oid != null;

    if (hasMeta) {
      if (pending) merged.push(pending);
      pending = {
        ...item,
        lock_holders: holders,
      };
    } else if (holders.length && pending) {
      pending.lock_holders = [...asArray(pending.lock_holders), ...holders];
    } else if (holders.length) {
      if (pending) merged.push(pending);
      pending = {
        ob_type: '-',
        oid: '-',
        ...item,
        lock_holders: holders,
      };
    }
  }

  if (pending) merged.push(pending);
  return merged;
}

/**
 * @param {object} response - Lock API body (unwrapped or `{ data: { lockinfo } }`)
 * @returns {Array<{ index: string, user: string, host: string, pid: string, obj: string, mode: string }>}
 */
export function buildDashboardLockRows(response) {
  const lockInfo = extractLockInfoBlock(response);
  if (!lockInfo) return [];

  const lot0 = asArray(lockInfo.lot)[0];
  if (!lot0) return [];

  const entries = normalizeLotEntries(lot0.entry);
  if (entries.length === 0) return [];

  const transactions = asArray(lockInfo.transaction);
  const txByIndex = new Map();
  for (const tran of transactions) {
    const key = tranIndexKey(tran.index);
    if (key != null) txByIndex.set(key, tran);
    if (tran.index != null) txByIndex.set(String(tran.index), tran);
  }

  const rows = [];

  for (const entry of entries) {
    const holders = asArray(entry.lock_holders);
    if (holders.length === 0) continue;

    const modes = [];
    let row = {
      index: '-',
      user: '-',
      host: '-',
      pid: '-',
      obj: entry.ob_type ?? '-',
      mode: '-',
    };

    for (const holder of holders) {
      if (holder.granted_mode) modes.push(holder.granted_mode);

      const key = tranIndexKey(holder.tran_index);
      const tran =
        (key != null && txByIndex.get(key)) ||
        txByIndex.get(String(holder.tran_index));

      if (tran) {
        row = {
          ...row,
          index: String(tran.index ?? holder.tran_index ?? '-'),
          user: getTransactionUid(tran),
          host: tran.host?.trim() || '-',
          pid: tran.pid != null && String(tran.pid).trim() !== '' ? String(tran.pid) : '-',
        };
      } else if (row.index === '-' && holder.tran_index != null) {
        row.index = String(holder.tran_index);
      }
    }

    row.mode = modes.length > 0 ? modes.join(',') : '-';
    rows.push(row);
  }

  return rows;
}
