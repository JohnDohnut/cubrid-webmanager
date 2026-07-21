import { Toggle } from '../../../../components/ds/forms/Toggle';
import { Input } from '../../../../components/ds/forms/Input';
import { Typography } from '../../../../components/ds/foundation/Typography';
import { SectionHeader } from '../../../../components/ds/foundation/SectionHeader';
import { useCM } from '../../../../constants/useCM';

function OptionRow({ label, checked, onChange, disabled }) {
  return (
    <div
      className={`flex items-center justify-between p-3 border rounded-lg ${disabled ? 'opacity-40' : 'cursor-pointer'}`}
      onClick={() => !disabled && onChange(!checked)}
    >
      <Typography variant="p" className="text-[12px]">{label}</Typography>
      <div onClick={(e) => e.stopPropagation()}>
        <Toggle checked={checked} onChange={onChange} disabled={disabled} size="sm" />
      </div>
    </div>
  );
}

export default function UnloadAdvancedOptions({ formData, handleInputChange }) {
  const CM = useCM();
  const toggles = [
    { label: 'As DBA', name: 'asDba' },
    { label: 'Split schema files', name: 'splitSchema' },
    { label: 'Class only', name: 'classOnly' },
    { label: 'Skip index detail', name: 'skipIndex' },
    { label: CM.useDelimitedIdentifier, name: 'useDelimitedIdentifier' },
    {
      label: CM.includeReferencedTables,
      name: 'includeReferencedTables',
      disabled: !formData.includeSchema,
    },
  ];

  const inputFields = [
    { label: CM.prefixOutputFiles, name: 'prefixOutputFile', useName: 'usePrefixOutputFile', type: 'text' },
    { label: CM.fileForHash, name: 'fileForHash', useName: 'useFileForHash', type: 'text' },
    { label: CM.numCachedPages, name: 'cachedPages', useName: 'useCachedPages', type: 'number' },
    { label: CM.estimatedInstances, name: 'estimateInstances', useName: 'useEstimateInstances', type: 'number' },
    { label: CM.loFileCountPerDir, name: 'loFileDirectory', useName: 'useLoFileDirectory', type: 'text' },
  ];

  const triggerInputChange = (name, value) => {
    handleInputChange({ target: { name, value, type: 'toggle' } });
  };

  return (
    <div className="space-y-4">
      <SectionHeader title={CM.unloadOption} icon="tune" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {toggles.map((opt) => (
          <OptionRow
            key={opt.name}
            label={opt.label}
            checked={formData[opt.name]}
            onChange={(v) => triggerInputChange(opt.name, v)}
            disabled={opt.disabled}
          />
        ))}
      </div>

      <div className="space-y-3">
        {inputFields.map((field) => (
          <div key={field.name} className="flex items-center gap-3">
            <Toggle
              checked={formData[field.useName]}
              onChange={(v) => triggerInputChange(field.useName, v)}
              size="sm"
            />
            <Typography variant="caption" className="text-slate-500 w-48 shrink-0">{field.label}</Typography>
            <Input
              type={field.type}
              name={field.name}
              value={formData[field.name]}
              onChange={handleInputChange}
              disabled={!formData[field.useName]}
              size="sm"
              className="flex-1 font-mono text-[11px]"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
