import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { brokerApi } from '../../broker/brokerApi';
import { showStatusModal, setTabDirty } from '../../layout/layoutSlice';
import { isAmbiguousFailure } from '../../../api/isAmbiguousFailure';
import { Typography } from '../../../components/ds/foundation/Typography';
import { Spinner } from '../../../components/ds/foundation/Spinner';
import { useCM } from '../../../constants/useCM';
import { validateParamValue } from '@api-interfaces';

import ConfigEditorToolbar from './broker/ConfigEditorToolbar';
import ConfigSourceEditor from './broker/ConfigSourceEditor';

// Same purpose as CubridConfigEditor.jsx's identical pair — see its
// comment. Section-aware so commonOnly/instanceOnly violations (e.g. one
// of the 5 [broker]-only keys set inside a [%name] section, or BROKER_PORT/
// APPL_SERVER_SHM_ID set inside [broker] itself — see
// broker-param-schema.ts) are caught here too, not just server-side.
function parseConfSections(text) {
  const sections = [];
  let current = { name: null, entries: [] };
  text.split('\n').forEach((line, i) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const sectionMatch = trimmed.match(/^\[%?(.+)\]$/);
    if (sectionMatch) {
      if (current.name !== null || current.entries.length > 0) sections.push(current);
      current = { name: sectionMatch[1].toLowerCase(), entries: [] };
      return;
    }
    const eq = trimmed.indexOf('=');
    if (eq === -1) return;
    current.entries.push({ key: trimmed.slice(0, eq).trim(), value: trimmed.slice(eq + 1).trim(), lineNo: i + 1 });
  });
  if (current.entries.length > 0) sections.push(current);
  return sections;
}

function validateConfText(text, brokerParamSchema) {
  if (!brokerParamSchema?.length) return [];
  const schemaByKey = new Map(brokerParamSchema.map(e => [e.key.toLowerCase(), e]));
  const problems = [];
  for (const section of parseConfSections(text)) {
    const isCommonSection = section.name === null || section.name === 'broker';
    for (const { key, value, lineNo } of section.entries) {
      const entry = schemaByKey.get(key.toLowerCase());
      if (!entry) continue;
      if (entry.commonOnly && !isCommonSection) {
        problems.push(`Line ${lineNo}: ${key} can only be set in [broker], not [${section.name}]`);
        continue;
      }
      if (entry.instanceOnly && isCommonSection) {
        problems.push(`Line ${lineNo}: ${key} cannot be set in [${section.name ?? 'broker'}], only per-broker`);
        continue;
      }
      const reason = validateParamValue(entry.guard, value);
      if (reason) problems.push(`Line ${lineNo}: ${key} = "${value}" — ${reason}`);
    }
  }
  return problems;
}

export default function BrokerConfigEditor({ hostUid }) {
  const CM = useCM();
  const tabId = `broker_config:${hostUid}`;
  const dispatch = useDispatch();
  const { hosts, hostEnvs } = useSelector((state) => state.host, shallowEqual);
  const { refreshCounter, refreshTabId } = useSelector((state) => state.layout, shallowEqual);
  const brokerParamSchema = useMemo(() => hostEnvs[hostUid]?.paramSchemas?.broker ?? [], [hostEnvs, hostUid]);
  const currentHost = hosts.find(h => h.uid === hostUid);
  const hostDisplayName = currentHost ? (currentHost.alias || currentHost.id) : CM.unknownHost;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Source View State
  const originalRawContentRef = useRef('');
  const lastRefreshCounterRef = useRef(refreshCounter);
  const [rawContent, setRawContent] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try {
      const response = await brokerApi.getBrokerConfig(hostUid);
      const lines = response?.conflist?.[0]?.confdata || [];
      
      const content = lines.join('\n');
      originalRawContentRef.current = content;
      setRawContent(content);
      setHasChanges(false);
      dispatch(setTabDirty({ tabId, isDirty: false }));
    } catch (err) {
      console.error('Failed to fetch broker config:', err);
      dispatch(showStatusModal({
        type: 'error',
        title: CM.fetchFailed,
        message: CM.brokerConfigRetrieveError,
        guidance: CM.brokerOperationGuidance,
        detail: err?.response?.data?.note || err?.message,
      }));
    } finally {
      setLoading(false);
    }
  }, [hostUid, dispatch, tabId]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  useEffect(() => {
    if (refreshCounter <= lastRefreshCounterRef.current) return;
    lastRefreshCounterRef.current = refreshCounter;
    if (refreshTabId === tabId) fetchConfig();
  }, [fetchConfig, refreshCounter, refreshTabId, tabId]);

  const handleSourceChange = (e) => {
    setRawContent(e.target.value);
    const changed = e.target.value !== originalRawContentRef.current;
    setHasChanges(changed);
    dispatch(setTabDirty({ tabId, isDirty: changed }));
  };

  const handleUndo = () => {
    setRawContent(originalRawContentRef.current);
    setHasChanges(false);
    dispatch(setTabDirty({ tabId, isDirty: false }));
  };

  const handleSave = async () => {
    const problems = validateConfText(rawContent, brokerParamSchema);
    if (problems.length > 0) {
      dispatch(showStatusModal({
        type: 'error',
        title: CM.invalidConfigValues,
        message: CM.invalidConfigValuesMsg,
        guidance: problems,
      }));
      return;
    }
    setSaving(true);
    try {
      const confdata = rawContent.split('\n');

      await brokerApi.updateBrokerConfig(hostUid, confdata);
      
      originalRawContentRef.current = rawContent;
      setHasChanges(false);
      dispatch(setTabDirty({ tabId, isDirty: false }));
      dispatch(showStatusModal({
        type: 'success',
        title: CM.configSaved,
        message: CM.brokerConfigSaveSuccess
      }));
    } catch (err) {
      if (isAmbiguousFailure(err)) fetchConfig();
      dispatch(showStatusModal({
        type: 'error',
        title: CM.saveFailed,
        message: CM.brokerConfigSaveError,
        guidance: CM.brokerOperationGuidance,
        detail: err?.response?.data?.note || err?.message,
      }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div data-testid="broker-config-editor" className="flex-1 flex flex-col bg-slate-50 dark:bg-bk-main overflow-hidden font-sans transition-colors">
      <ConfigEditorToolbar 
        hostDisplayName={hostDisplayName}
        hasChanges={hasChanges}
        loading={loading}
        saving={saving}
        handleUndo={handleUndo}
        fetchConfig={fetchConfig}
        handleSave={handleSave}
      />

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col relative bg-slate-100 dark:bg-black/20">
        <ConfigSourceEditor 
          rawContent={rawContent}
          handleSourceChange={handleSourceChange}
        />
        {loading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-white/80 dark:bg-bk-side/80 backdrop-blur-xs">
            <Spinner size="lg" />
            <Typography variant="overline" className="text-slate-600 dark:text-bk-yellow tracking-widest animate-pulse">{CM.initializingEditor}</Typography>
          </div>
        )}
      </div>
      
      {/* Bottom hint bar */}
      <div className="px-6 py-2 bg-white dark:bg-bk-side border-t border-slate-200 dark:border-slate-800 flex items-center justify-between transition-colors">
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(59,130,246,0.3)]"></span>
              <Typography variant="caption" className="text-slate-500 dark:text-slate-400 font-medium leading-none">{CM.brokerConfig}</Typography>
            </div>
         </div>
         <Typography variant="caption" className="text-slate-400 dark:text-slate-500 font-medium tracking-tight">
           {CM.brokerConfigFile}
         </Typography>
      </div>
    </div>
  );
}
