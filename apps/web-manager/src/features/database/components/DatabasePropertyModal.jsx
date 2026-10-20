import { useState, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { closeDatabasePropertyModal } from '../databaseSlice';
import { hostApi } from '../../host/hostApi';
import { fetchHostEnv } from '../../host/hostSlice';
import { useCM } from '../../../constants/useCM';

import { Icon } from '../../../components/ds/foundation/Icon';
import { Modal } from '../../../components/ds/layout/Modal';
import { Button } from '../../../components/ds/foundation/Button';
import { TabGroup } from '../../../components/ds/layout/TabGroup';
import { Table } from '../../../components/ds/layout/Table';
import { Input } from '../../../components/ds/forms/Input';
import { Select } from '../../../components/ds/forms/Select';
import { Radio } from '../../../components/ds/forms/Radio';
import { SectionHeader } from '../../../components/ds/foundation/SectionHeader';
import { StatusBadge } from '../../../components/ds/foundation/StatusBadge';
import { InfoBanner } from '../../../components/ds/foundation/InfoBanner';
import { useActionState } from '../../../infrastructure/hooks/useActionState';
import { useToast } from '../../../infrastructure/hooks/useToast';
import { getModifiedKeys } from '../databasePropertyUtils';
import { validateParams } from '@api-interfaces';
import {
  ModalStatusLoading,
  ModalStatusError
} from '../../../components/ds/feedback/ActionStatus';

// View states
const VIEW_FORM    = 'form';
const VIEW_LOADING = 'loading';
const VIEW_SUCCESS = 'success';
const VIEW_ERROR   = 'error';

// The param list itself — which keys exist, their category/type/guard/
// default — no longer lives here. It comes from the connected host's
// `getEnv` response (`paramSchemas.database`, cached in Redux's
// `hostEnvs`), already resolved for that host's actual engine version by
// the server (see libs/api-interfaces/src/param-schema and
// CmsConfigService.getEnv). This modal only keeps the purely
// presentational pieces a version-aware server schema has no business
// owning: i18n label text and the buffer radio groups' fixed 4-pair UI
// layout (see `BUFFER_GROUP_LABELS` and `useBufferGroups` below).
const BUFFER_GROUP_LABELS = {
  data: CM => CM.dataBufferAllocLabel,
  sort: CM => CM.sortBufferAllocLabel,
  log: CM => CM.logBufferAllocLabel,
  indexScanOid: CM => CM.indexScanOidBufferAllocLabel,
};
const BUFFER_UNITS = ['KB', 'MB', 'GB', 'TB'];
const BUFFER_UNIT_LETTER = { KB: 'K', MB: 'M', GB: 'G', TB: 'T' };
const DEFAULT_BUFFER_MODE = { data: 'size', sort: 'size', log: 'size', indexScanOid: 'size' };
const DEFAULT_BUFFER_UNIT = { data: 'MB', sort: 'MB', log: 'MB', indexScanOid: 'MB' };

/**
 * Groups the schema's `buffer`-category entries (pages/size pairs) by
 * `bufferGroup.pairKey`, attaching each pair's display-label function —
 * `groupLabel` is called as `group.groupLabel(CM)` at render time, same
 * as the old hardcoded BUFFER_GROUPS did.
 */
function buildBufferGroups(databaseParamSchema) {
  const byPairKey = {};
  for (const entry of databaseParamSchema) {
    if (entry.category !== 'buffer' || !entry.bufferGroup) continue;
    const { pairKey, role } = entry.bufferGroup;
    byPairKey[pairKey] ??= { type: pairKey, groupLabel: BUFFER_GROUP_LABELS[pairKey] ?? (() => pairKey) };
    if (role === 'pages') {
      byPairKey[pairKey].pagesKey = entry.key;
      byPairKey[pairKey].pagesDefault = entry.default;
    } else {
      byPairKey[pairKey].sizeKey = entry.key;
      byPairKey[pairKey].sizeDefault = entry.default;
    }
  }
  return Object.values(byPairKey);
}

function getEffectiveParams(params, bufferMode, bufferUnit, bufferGroups) {
  const effectiveParams = { ...params };
  bufferGroups.forEach(({ type, pagesKey, sizeKey }) => {
    if (bufferMode[type] === 'pages') {
      delete effectiveParams[sizeKey];
    } else {
      const value = params[sizeKey];
      if (value) effectiveParams[sizeKey] = `${value}${BUFFER_UNIT_LETTER[bufferUnit[type]]}`;
      delete effectiveParams[pagesKey];
    }
  });
  return effectiveParams;
}

/* ─── ParamNameCell — shared "modified" dot + mono key label ─── */
function ParamNameCell({ label, isModified }) {
  return (
    <div className="flex items-center gap-1.5">
      {isModified && <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />}
      <span className={`text-13 font-mono truncate ${isModified ? 'text-amber-500 font-bold' : 'text-slate-600 dark:text-slate-400'}`}>
        {label}
      </span>
    </div>
  );
}

/* ─── ParamValueCell — select for fixed-option keys, else free-text input ─── */
function ParamValueCell({ guard, value, defaultValue, onChange, disabled, disabledHint, error }) {
  const options = guard?.kind === 'enum' ? guard.options : null;
  if (options) {
    return (
      <div className="w-full max-w-none" title={disabled ? disabledHint : undefined}>
        <Select
          size="sm"
          value={value ?? defaultValue}
          options={options.map(o => ({ value: o, label: o }))}
          onChange={e => onChange(e.target.value)}
          className="w-full max-w-none"
          disabled={disabled}
        />
      </div>
    );
  }
  return (
    <div className="w-full max-w-none" title={error}>
      <Input
        size="sm"
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        placeholder={defaultValue || '—'}
        className={`w-full max-w-none ${error ? 'ring-1 ring-rose-500' : ''}`}
      />
      {error && <p className="text-11 text-rose-500 mt-0.5">{error}</p>}
    </div>
  );
}

/* ─── BufferChoiceGroup — CA's PageSizeChoiceComposite: radio(pages)/radio(size+unit) ─── */
function BufferChoiceGroup({ group, mode, unit, pagesValue, sizeValue, onModeChange, onUnitChange, onPagesChange, onSizeChange, pagesError }) {
  const CM = useCM();
  return (
    <div className="rounded-xl border border-slate-100 dark:border-white/6 p-4">
      <p className="text-11 font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">{group.groupLabel(CM)}</p>
      <div className="space-y-2.5">
        <div className="flex items-center gap-3">
          <Radio
            name={`${group.type}-buffer-mode`}
            value="pages"
            checked={mode === 'pages'}
            onChange={() => onModeChange('pages')}
            label={<span className="text-12 font-mono w-[140px] shrink-0 inline-block">{group.pagesKey}</span>}
          />
          <div className="flex-1 max-w-[200px]" title={mode === 'pages' ? pagesError : undefined}>
            <Input
              size="sm"
              type="number"
              value={pagesValue ?? ''}
              onChange={e => onPagesChange(e.target.value)}
              placeholder={group.pagesDefault}
              disabled={mode !== 'pages'}
              className={`w-full ${mode !== 'pages' ? 'opacity-40' : ''} ${mode === 'pages' && pagesError ? 'ring-1 ring-rose-500' : ''}`}
            />
            {mode === 'pages' && pagesError && <p className="text-11 text-rose-500 mt-0.5">{pagesError}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Radio
            name={`${group.type}-buffer-mode`}
            value="size"
            checked={mode === 'size'}
            onChange={() => onModeChange('size')}
            label={<span className="text-12 font-mono w-[140px] shrink-0 inline-block">{group.sizeKey}</span>}
          />
          <Input
            size="sm"
            type="number"
            value={sizeValue ?? ''}
            onChange={e => onSizeChange(e.target.value)}
            placeholder={group.sizeDefault}
            disabled={mode !== 'size'}
            className={`flex-1 ${mode !== 'size' ? 'opacity-40' : ''}`}
          />
          {/* FormField (shared by Input/Select) always includes a base
              "w-full" class, which beats a plain width class passed in from
              here — constrain via an outer sized wrapper instead, same as
              the rest of this modal's other Select usages. */}
          <div className={`w-[92px] shrink-0 ${mode !== 'size' ? 'opacity-40' : ''}`}>
            <Select
              size="sm"
              value={unit}
              options={BUFFER_UNITS.map(u => ({ value: u, label: u }))}
              onChange={e => onUnitChange(e.target.value)}
              disabled={mode !== 'size'}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DatabasePropertyModal() {
  const CM = useCM();
  const dispatch = useDispatch();
  const { isDatabasePropertyModalOpen } = useSelector((state) => state.databaseUI, shallowEqual);
  const { selectedDatabase } = useSelector((state) => state.database, shallowEqual);
  const { selectedHostUid, authorizedHosts } = useSelector((state) => state.host, shallowEqual);
  const isAuthorized = selectedHostUid && authorizedHosts.includes(selectedHostUid);
  // Resolved per this host's actual engine version by the server (see
  // CmsConfigService.getEnv) — populated into `hostEnvs` by whatever
  // already triggers `fetchHostEnv` on host activation/login. The
  // defensive dispatch below only matters if this modal somehow opens
  // before that's happened.
  const hostEnv = useSelector((state) => state.host.hostEnvs[selectedHostUid]);
  const databaseParamSchema = useMemo(() => hostEnv?.paramSchemas?.database ?? [], [hostEnv]);
  const bufferGroups = useMemo(() => buildBufferGroups(databaseParamSchema), [databaseParamSchema]);
  const toast = useToast();
  const {
    error: actionError,
    startAction,
    endError,
    resetAction,
    isLoading,
    isError
  } = useActionState();

  const [activeTab, setActiveTab] = useState('General');
  const [fetching, setFetching] = useState(false);
  const [initialParams, setInitialParams] = useState({});
  const [params, setParams] = useState({});
  const [initialBufferMode, setInitialBufferMode] = useState(DEFAULT_BUFFER_MODE);
  const [bufferMode, setBufferMode] = useState(DEFAULT_BUFFER_MODE);
  const [initialBufferUnit, setInitialBufferUnit] = useState(DEFAULT_BUFFER_UNIT);
  const [bufferUnit, setBufferUnit] = useState(DEFAULT_BUFFER_UNIT);
  // Tracks which (host, database) the Server Parameter config has already
  // been fetched for, so switching tabs and back doesn't re-fetch and
  // clobber unsaved edits — see the fetch effect below.
  const fetchedConfigKeyRef = useRef(null);

  useEffect(() => {
    if (isDatabasePropertyModalOpen) {
      resetAction();
      setInitialParams({});
      setParams({});
      setInitialBufferMode(DEFAULT_BUFFER_MODE);
      setBufferMode(DEFAULT_BUFFER_MODE);
      setInitialBufferUnit(DEFAULT_BUFFER_UNIT);
      setBufferUnit(DEFAULT_BUFFER_UNIT);
      fetchedConfigKeyRef.current = null;
    }
  }, [isDatabasePropertyModalOpen, selectedDatabase, resetAction]);

  useEffect(() => {
    if (isDatabasePropertyModalOpen && selectedHostUid && isAuthorized && !hostEnv) {
      dispatch(fetchHostEnv(selectedHostUid));
    }
  }, [isDatabasePropertyModalOpen, selectedHostUid, isAuthorized, hostEnv, dispatch]);

  useEffect(() => {
    const configKey = `${selectedHostUid}:${selectedDatabase || ''}`;
    if (
      isDatabasePropertyModalOpen && selectedHostUid && isAuthorized &&
      databaseParamSchema.length > 0 &&
      fetchedConfigKeyRef.current !== configKey
    ) {
      fetchedConfigKeyRef.current = configKey;
      const fetchParams = async () => {
        setFetching(true);
        try {
          const response = await hostApi.getHostConfig(selectedHostUid, 'cubridconf');
          const lines = response?.conflist?.[0]?.confdata || [];
          let currentSection = '';
          const newParams = {};
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;
            if (trimmed.startsWith('[') && trimmed.endsWith(']')) { currentSection = trimmed.slice(1, -1).toLowerCase(); continue; }
            const target = selectedDatabase ? `@${selectedDatabase.toLowerCase()}` : 'common';
            if (currentSection === 'common' || (selectedDatabase && currentSection === target)) {
              const [key, ...valueParts] = trimmed.split('=');
              const k = key?.trim();
              const v = valueParts.join('=').trim();
              if (k) newParams[k] = v;
            }
          }

          // Mirrors CA's PageSizeChoiceComposite#initBtnState: prefer the
          // pages key if it has a value, else fall back to size (+ unit
          // parsed off the trailing letter, e.g. "512M" -> 512 / MB).
          const nextMode = {}, nextUnit = {};
          bufferGroups.forEach(({ type, pagesKey, sizeKey }) => {
            const pagesVal = newParams[pagesKey];
            const sizeVal = newParams[sizeKey];
            if (pagesVal && pagesVal.trim() !== '') {
              nextMode[type] = 'pages';
            } else if (sizeVal && sizeVal.trim() !== '') {
              nextMode[type] = 'size';
              const letter = sizeVal.slice(-1).toUpperCase();
              const unitEntry = Object.entries(BUFFER_UNIT_LETTER).find(([, l]) => l === letter);
              if (unitEntry) {
                nextUnit[type] = unitEntry[0];
                newParams[sizeKey] = sizeVal.slice(0, -1);
              }
            } else {
              nextMode[type] = 'size';
            }
          });
          const loadedBufferMode = { ...DEFAULT_BUFFER_MODE, ...nextMode };
          const loadedBufferUnit = { ...DEFAULT_BUFFER_UNIT, ...nextUnit };
          setInitialBufferMode(loadedBufferMode);
          setBufferMode(loadedBufferMode);
          setInitialBufferUnit(loadedBufferUnit);
          setBufferUnit(loadedBufferUnit);
          setInitialParams({ ...newParams });
          setParams({ ...newParams });
        } catch (err) {
          console.error('Failed to fetch config:', err);
          // Allow a retry on the next tab switch instead of permanently
          // marking this (host, database) as "fetched" — but only if this
          // request is still the current one. A stale request for an
          // earlier (host, database) can still be in flight and reject
          // after a newer request for a different target already
          // succeeded; clearing the ref unconditionally here would wipe
          // out that newer success and trigger a pointless re-fetch (and
          // possible edit-clobbering) on the next tab switch.
          if (fetchedConfigKeyRef.current === configKey) {
            fetchedConfigKeyRef.current = null;
          }
        }
        finally { setFetching(false); }
      };
      fetchParams();
    }
  }, [isDatabasePropertyModalOpen, selectedDatabase, selectedHostUid, isAuthorized, databaseParamSchema, bufferGroups]);

  const handleApply = async () => {
    // Defense-in-depth: the Apply button is already disabled while
    // guardErrorCount > 0, but never write a known-invalid value even if
    // this somehow gets called some other way.
    if (guardErrorCount > 0) return;
    startAction();
    try {
      // Reconcile the pages/size radio choice per buffer group: only the
      // selected side is written, and the size value gets its unit letter
      // suffixed back on (e.g. 512 + MB -> "512M"), matching cubrid.conf.
      const effectiveParams = getEffectiveParams(params, bufferMode, bufferUnit, bufferGroups);
      // Only write keys that actually changed from what was loaded —
      // modifiedKeySet already does this exact diff for the UI's "modified"
      // dots. Without this filter, any field whose box shows a value (even
      // the schema's own placeholder default, for a key that was never in
      // the conf file to begin with) gets promoted to an explicit conf
      // line the instant its onChange fires, even if the user just retyped
      // the same default and effectively made no real change. That would
      // silently turn "let the engine decide" into "pinned to this exact
      // value forever" for every field a user so much as clicks into.
      const saveParams = {};
      for (const key of modifiedKeySet) {
        if (key in effectiveParams) saveParams[key] = effectiveParams[key];
      }

      // The server now owns conf-line construction (section lookup, merge,
      // duplicate-key handling) via a typed, per-field-validated endpoint —
      // the client just sends the changed keys. `dbname` omitted writes to
      // [common], matching the old `sectionName` fallback above.
      await hostApi.setDatabaseConfigParams(selectedHostUid, {
        ...(selectedDatabase ? { dbname: selectedDatabase } : {}),
        params: saveParams,
      });
      // Stay on the form view showing the values that were just applied,
      // instead of closing the modal — the user asked to keep editing
      // without having to reopen it. Re-baseline off `params`/`bufferMode`/
      // `bufferUnit` directly, not `saveParams` — `saveParams` is now only
      // the subset that actually changed (and its buffer values carry the
      // unit letter suffixed back on for cubrid.conf, which would corrupt
      // the raw, unsuffixed state the buffer inputs expect). Promoting the
      // full current values to the "initial" baseline is what correctly
      // zeroes out modifiedCount and makes a subsequent "Reset to original"
      // target these just-applied values instead of the pre-session ones.
      setInitialParams({ ...params });
      setInitialBufferMode({ ...bufferMode });
      setInitialBufferUnit({ ...bufferUnit });
      resetAction();
      toast.success(CM.configurationAppliedMsg(selectedDatabase));
    } catch (err) {
      endError(typeof err === 'string' ? err : (err.message || CM.configPatchRejectedMsg));
    }
  };

  useEffect(() => {
    if (!isDatabasePropertyModalOpen) {
      setTimeout(() => resetAction(), 300);
    }
  }, [isDatabasePropertyModalOpen, resetAction]);

  const handleClose = () => {
    dispatch(closeDatabasePropertyModal());
    setInitialParams({});
    setParams({});
    setInitialBufferMode(DEFAULT_BUFFER_MODE);
    setBufferMode(DEFAULT_BUFFER_MODE);
    setInitialBufferUnit(DEFAULT_BUFFER_UNIT);
    setBufferUnit(DEFAULT_BUFFER_UNIT);
  };

  const handleReset = () => {
    setParams({ ...initialParams });
    setBufferMode({ ...initialBufferMode });
    setBufferUnit({ ...initialBufferUnit });
  };

  // Keyed lookup of each schema entry's own default — see getModifiedKeys's
  // header comment for why a key that was never explicitly in the conf
  // file needs this to tell "retyped the same default" apart from "set a
  // genuinely new value".
  const schemaDefaults = useMemo(
    () => Object.fromEntries(databaseParamSchema.map(e => [e.key, e.default])),
    [databaseParamSchema]
  );

  const modifiedKeys = useMemo(
    () => getModifiedKeys(
      getEffectiveParams(initialParams, initialBufferMode, initialBufferUnit, bufferGroups),
      getEffectiveParams(params, bufferMode, bufferUnit, bufferGroups),
      schemaDefaults
    ),
    [initialParams, params, initialBufferMode, bufferMode, initialBufferUnit, bufferUnit, bufferGroups, schemaDefaults]
  );
  const modifiedKeySet = useMemo(() => new Set(modifiedKeys), [modifiedKeys]);
  const modifiedCount = modifiedKeys.length;

  // Guard validation runs against the schema this host's own engine
  // version resolved (see `databaseParamSchema` above), using the exact
  // pages/size-reconciled values that actually get written to cubrid.conf
  // on Apply — same `validateParams` the server re-runs before writing.
  const guardErrors = useMemo(
    () => validateParams(databaseParamSchema, getEffectiveParams(params, bufferMode, bufferUnit, bufferGroups)).errors,
    [databaseParamSchema, params, bufferMode, bufferUnit, bufferGroups]
  );
  const guardErrorCount = Object.keys(guardErrors).length;

  // CUBRID forces auto_restart_server off in-process whenever HA is enabled
  // (system_parameter.c's prm_tune_parameters — an abnormally-terminated
  // server should fail over via HA, not blindly self-restart in place), so
  // leaving this editable here would show a "yes" that the running server
  // silently ignores. Mirrors the off-keyword set system_parameter.c itself
  // recognizes for ha_mode (only "on" would previously have been detected).
  const HA_MODE_OFF_KEYWORDS = ['off', 'no', 'n', '0', 'false'];
  const isHaEnabled = params.ha_mode !== undefined
    && !HA_MODE_OFF_KEYWORDS.includes(String(params.ha_mode).trim().toLowerCase());

  const generalRows = useMemo(() => databaseParamSchema
    // commonOnly keys (cubrid_port_id, auto_restart_server on 11.4+) only
    // belong in [common] — hidden entirely while editing a specific
    // database, same as advancedRows below and BrokerPropertyModal's
    // identical commonOnly filter, so the entry point you opened (공통
    // 속성 편집 vs 개별 속성 편집) and the param set you actually see
    // always match instead of showing-then-disabling a field that could
    // never be saved from here anyway.
    .filter(e => e.category === 'general' && !(e.commonOnly && selectedDatabase))
    .map(e => ({
      ...e,
      value: params[e.key],
      isModified: modifiedKeySet.has(e.key),
      error: guardErrors[e.key],
    }))
  , [databaseParamSchema, params, modifiedKeySet, guardErrors, selectedDatabase]);

  const advancedRows = useMemo(() => databaseParamSchema
    // See generalRows' comment — commonOnly keys (ha_mode/ha_node_list/
    // ha_port_id) are hidden entirely while a specific database is being
    // edited, not shown-and-disabled.
    .filter(e => e.category === 'advanced' && !(e.commonOnly && selectedDatabase))
    .map(e => {
      // Non-blocking hint only — never affects validity/Apply. Reads the
      // OTHER param's effective value (falling back to its own schema
      // default the same way the field itself does) to decide whether
      // this one currently has no real engine effect — see the entry's
      // `advisory` field (ParamSchemaEntry's own doc comment for why).
      const dep = e.advisory;
      const isInactive = dep
        ? dep.inactiveWhen.includes(
            String(params[dep.dependsOnKey] !== undefined ? params[dep.dependsOnKey] : schemaDefaults[dep.dependsOnKey])
              .trim().toLowerCase()
          )
        : false;
      return {
        ...e,
        value: params[e.key] !== undefined ? params[e.key] : e.default,
        isModified: modifiedKeySet.has(e.key),
        error: guardErrors[e.key],
        inactiveHint: isInactive ? CM.paramInactiveWhileHint(dep.dependsOnKey) : null,
      };
    })
  , [databaseParamSchema, params, modifiedKeySet, guardErrors, schemaDefaults, CM, selectedDatabase]);

  const SERVER_TABS = [
    { id: 'General', label: CM.generalParamsTab, icon: 'tune' },
    { id: 'Advanced', label: CM.advancedParamsTab, icon: 'settings_applications' },
  ];

  if (!isDatabasePropertyModalOpen) return null;

  /* ─── LOADING VIEW ─── */
  if (isLoading) return (
    <Modal isOpen title={CM.applyingConfigTitle} icon="settings" onClose={handleClose} maxWidth="900px" showCloseButton={false}>
      <ModalStatusLoading
        title={CM.updatingConfigTitle}
        subtitle={CM.updatingConfigSubtitle}
      />
    </Modal>
  );

  /* ─── ERROR VIEW ─── */
  if (isError) return (
    <Modal isOpen title={CM.updateRejected} icon="error" iconVariant="danger" onClose={resetAction} maxWidth="900px">
      <ModalStatusError
        title={CM.applyFailedTitle}
        error={actionError}
        guidance={CM.databasePropertyGuidance}
        onRetry={handleApply}
        onCancel={resetAction}
        retryText={CM.retryPatch}
        cancelText={CM.cancel}
      />
    </Modal>
  );

  // No separate Default column here either — same convention as the
  // Advanced table (and CA itself): the value cell shows the current value,
  // falling back to the default as a placeholder.
  const generalColumns = [
    { header: CM.parameter, accessor: 'key', width: '45%', render: (_, row) => <ParamNameCell label={row.key} isModified={row.isModified} /> },
    {
      header: CM.value, accessor: 'value', width: '55%', cellClassName: 'w-[55%]', sortable: false,
      render: (_, row) => {
        const isHaForcedOff = row.key === 'auto_restart_server' && isHaEnabled;
        return (
          <ParamValueCell
            guard={row.guard}
            value={isHaForcedOff ? 'no' : row.value}
            defaultValue={row.default}
            onChange={(val) => setParams({ ...params, [row.key]: val })}
            disabled={isHaForcedOff}
            disabledHint={CM.autoRestartHaDisabledHint}
            error={row.error}
          />
        );
      },
    },
  ];

  // Column set/order mirrors CUBRID Admin's own advanced-parameter table
  // (DatabaseConfigPropertyPage.java): Parameter Name, Parameter Type (the
  // SERVER/CLIENT/BOTH scope), Value Type (the bool/int/string descriptor),
  // Parameter Value. CA has no separate "Default" column — the value cell
  // itself shows the current value, falling back to the default.
  const advancedColumns = [
    { header: CM.parameter, accessor: 'key', width: '30%', render: (_, row) => <ParamNameCell label={row.key} isModified={row.isModified} /> },
    {
      header: CM.parameterTypeLabel, accessor: 'scope', width: '16%',
      render: (val) => {
        const scopeColors = {
          SERVER: 'text-sky-500 bg-sky-500/8 border-sky-500/20',
          CLIENT: 'text-violet-500 bg-violet-500/8 border-violet-500/20',
          BOTH: 'text-emerald-500 bg-emerald-500/8 border-emerald-500/20',
        };
        return <span className={`text-11 font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${scopeColors[val]}`}>{val}</span>;
      },
    },
    { header: CM.valueTypeLabel, accessor: 'guard', width: '18%', render: (guard) => <span className="text-12 font-mono text-slate-400 dark:text-slate-500">{guard.kind}</span> },
    {
      header: CM.parameterValueLabel, accessor: 'value', width: '36%', cellClassName: 'w-[36%]', sortable: false,
      render: (_, row) => {
        const options = row.guard.kind === 'enum' ? row.guard.options : null;
        // 'intList'/'bigint'/'size' fall through to the plain text input —
        // a number input can't hold comma-separated values, and silently
        // loses precision on 64-bit values.
        const isNumberInput = row.guard.kind === 'int' || row.guard.kind === 'float';
        return options ? (
          <div className="w-full max-w-none">
            <Select
              size="sm"
              value={row.value}
              options={options.map(o => ({ value: o, label: o.toUpperCase() }))}
              onChange={e => setParams({ ...params, [row.key]: e.target.value })}
              className="w-full max-w-none"
            />
            {row.inactiveHint && <p className="text-11 text-slate-400 dark:text-slate-500 italic mt-0.5">{row.inactiveHint}</p>}
          </div>
        ) : (
          <div title={row.error}>
            <Input
              type={isNumberInput ? 'number' : 'text'}
              size="sm"
              value={row.value}
              onChange={e => setParams({ ...params, [row.key]: e.target.value })}
              className={`w-full max-w-none ${row.error ? 'ring-1 ring-rose-500' : ''}`}
            />
            {row.error && <p className="text-11 text-rose-500 mt-0.5">{row.error}</p>}
            {!row.error && row.inactiveHint && <p className="text-11 text-slate-400 dark:text-slate-500 italic mt-0.5">{row.inactiveHint}</p>}
          </div>
        );
      },
    },
  ];

  /* ─── FORM VIEW ─── */
  return (
    <Modal
      isOpen={isDatabasePropertyModalOpen}
      onClose={handleClose}
      title={selectedDatabase ? CM.registrySubtitle(selectedDatabase) : CM.kernelParamsTitle}
      subtitle={CM.deepSystemConfigDesc}
      icon="tune"
      maxWidth="1200px"
      testId="database-property"
      footer={
        <div className="flex justify-between items-center w-full">
          <div>
            {modifiedCount > 0 && (
              <Button
                data-testid="database-property-reset-btn"
                variant="ghost"
                icon="restart_alt"
                onClick={handleReset}
                className="text-amber-500 hover:bg-amber-500/5"
              >
                {CM.resetToOriginalBtn}
              </Button>
            )}
          </div>
          <div className="flex gap-2.5">
            <Button data-testid="database-property-cancel-btn" variant="ghost" onClick={handleClose}>{CM.cancel}</Button>
            <Button
              data-testid="database-property-apply-btn"
              variant="primary"
              onClick={handleApply}
              icon="save"
              className="min-w-[140px]"
              disabled={modifiedCount === 0 || guardErrorCount > 0}
            >
              {CM.applyChanges}
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col h-[min(720px,calc(90vh-146px))] min-h-[360px] -m-5 overflow-hidden bg-white dark:bg-transparent">

        {/* Tab bar */}
        <div className="p-4 border-b border-slate-100 dark:border-white/6 flex items-center justify-between">
          <TabGroup
            tabs={SERVER_TABS}
            active={activeTab}
            onChange={setActiveTab}
            fullWidth={false}
          />
          {/* Modified / guard-error indicators */}
          <div className="flex items-center gap-2">
            {guardErrorCount > 0 && (
              <div data-testid="database-property-guard-error-count">
                <StatusBadge label={`${guardErrorCount} invalid`} variant="rose" className="rounded-full" />
              </div>
            )}
            {modifiedCount > 0 && (
              <div data-testid="database-property-modified-count">
                <StatusBadge label={`${modifiedCount} modified`} variant="amber" pulse={true} className="rounded-full" />
              </div>
            )}
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {fetching ? (
            <div className="h-full flex flex-col items-center justify-center gap-5">
              <div className="w-10 h-10 border-2 border-amber-500/10 border-t-amber-500 rounded-full animate-spin" />
              <div className="text-center">
                <p className="text-11 uppercase tracking-[0.2em] text-slate-400 font-black mb-1">{CM.loadingLabel}</p>
                <p className="text-12 text-slate-400 dark:text-slate-500 italic font-medium">{CM.queryingHostRegistry}</p>
              </div>
            </div>

          ) : activeTab === 'General' ? (
              /* ─── GENERAL PARAMETERS ─── */
              <div className="p-6 space-y-6">
                <div className="flex flex-col gap-3">
                  {bufferGroups.map(group => (
                    <BufferChoiceGroup
                      key={group.type}
                      group={group}
                      mode={bufferMode[group.type]}
                      unit={bufferUnit[group.type]}
                      pagesValue={params[group.pagesKey]}
                      sizeValue={params[group.sizeKey]}
                      onModeChange={(m) => setBufferMode(prev => ({ ...prev, [group.type]: m }))}
                      onUnitChange={(u) => setBufferUnit(prev => ({ ...prev, [group.type]: u }))}
                      onPagesChange={(v) => setParams({ ...params, [group.pagesKey]: v })}
                      onSizeChange={(v) => setParams({ ...params, [group.sizeKey]: v })}
                      pagesError={guardErrors[group.pagesKey]}
                    />
                  ))}
                </div>

                <div className="space-y-3">
                  <SectionHeader title={CM.standardParameters} icon="settings" />
                  <Table columns={generalColumns} data={generalRows} zebra bordered showEmptyStateAsRow />
                </div>
              </div>

            ) : (
              /* ─── ADVANCED PARAMETERS TABLE ─── */
              <div>
                <div className="px-6 py-6">
                  <InfoBanner>
                    {CM.advancedParamsWarning}
                  </InfoBanner>
                </div>
                <div className="px-6 pb-6">
                  <Table columns={advancedColumns} data={advancedRows} zebra bordered showEmptyStateAsRow />
                </div>
              </div>
            )}
          </div>
        </div>
    </Modal>
  );
}
