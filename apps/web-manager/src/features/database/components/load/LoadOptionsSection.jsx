import { Toggle } from '../../../../components/ds/forms/Toggle';
import { Input } from '../../../../components/ds/forms/Input';
import { Typography } from '../../../../components/ds/foundation/Typography';
import { SectionHeader } from '../../../../components/ds/foundation/SectionHeader';
import { useCM } from '../../../../constants/useCM';

function OptionRow({ label, checked, onChange }) {
  return (
    <div
      className="flex items-center justify-between p-3 border rounded-lg cursor-pointer"
      onClick={() => onChange(!checked)}
    >
      <Typography variant="p" className="text-[12px]">{label}</Typography>
      <div onClick={(e) => e.stopPropagation()}>
        <Toggle checked={checked} onChange={onChange} size="sm" />
      </div>
    </div>
  );
}

export default function LoadOptionsSection({ formData, handleCheckBoxChange, handleValueChange }) {
  const CM = useCM();
  const switches = [
    { id: 'checkoption', label: CM.checkSyntaxAndLoad },
    { id: 'nolog', label: 'No log' },
    { id: 'oiduse', label: CM.dontUseOid },
    { id: 'statisticsuse', label: CM.dontUpdateStatistics },
  ];

  const inputs = [
    { id: 'period', label: CM.insertionCountPeriodicCommit, type: 'number', placeholder: '1000' },
    { id: 'estimated', label: CM.estimatedInstances, type: 'number', placeholder: '0' },
    { id: 'errorcontrolfile', label: CM.usingErrorControlFile, type: 'text' },
    { id: 'ignoreclassfile', label: CM.ignoredTableFile, type: 'text' },
  ];

  return (
    <div className="space-y-4">
      <SectionHeader title={CM.loadOption} icon="tune" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {switches.map((opt) => (
          <OptionRow
            key={opt.id}
            label={opt.label}
            checked={formData.checkBoxes[opt.id]}
            onChange={(v) => handleCheckBoxChange(opt.id, v)}
          />
        ))}
      </div>

      <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-white/5">
        {inputs.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            <Toggle
              checked={formData.checkBoxes[item.id]}
              onChange={(v) => handleCheckBoxChange(item.id, v)}
              size="sm"
            />
            <Typography variant="caption" className="text-slate-500 w-56 shrink-0">{item.label}</Typography>
            <Input
              type={item.type}
              value={formData.values[item.id]}
              onChange={(e) => handleValueChange(item.id, e.target.value)}
              disabled={!formData.checkBoxes[item.id]}
              size="sm"
              className="flex-1 font-mono text-[11px]"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
