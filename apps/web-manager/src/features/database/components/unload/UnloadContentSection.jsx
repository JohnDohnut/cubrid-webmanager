import { Checkbox } from '../../../../components/ds/forms/Checkbox';
import { SectionHeader } from '../../../../components/ds/foundation/SectionHeader';
import { Typography } from '../../../../components/ds/foundation/Typography';
import { Spinner } from '../../../../components/ds/foundation/Spinner';
import { CM } from '../../../../constants/cmLabels';

const SCHEMA_OPTS = [CM.all, CM.selectedTables, CM.notInclude];
const DATA_OPTS = [CM.selectedTables, CM.notInclude];

export default function UnloadContentSection({
  formData,
  handleInputChange,
  handleSchemaChange,
  handleTableToggle,
  dynamicTables,
  isTablesLoading,
}) {
  return (
    <div className="space-y-6">
      <SectionHeader title={CM.unloadTarget} icon="unfold_more" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <SectionHeader title={CM.schema} icon="terminal" />
          {SCHEMA_OPTS.map((opt) => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer text-[12px]">
              <input
                type="radio"
                name="schemaOption"
                checked={formData.schemaOption === opt}
                onChange={() => handleSchemaChange({ target: { value: opt } })}
              />
              {opt}
            </label>
          ))}
        </div>

        <div className="space-y-3">
          <SectionHeader title={CM.data} icon="dataset" />
          {DATA_OPTS.map((opt) => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer text-[12px]">
              <input
                type="radio"
                name="dataOption"
                checked={formData.dataOption === opt}
                onChange={() => handleInputChange({ target: { name: 'dataOption', value: opt } })}
              />
              {opt}
            </label>
          ))}
        </div>
      </div>

      {formData.schemaOption === CM.selectedTables && (
        <div className="space-y-3">
          <SectionHeader
            title={CM.availableClasses}
            icon="table_rows"
            badge={dynamicTables.length}
          />
          {isTablesLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[200px] overflow-y-auto border border-slate-200 dark:border-white/10 rounded-lg p-3">
              {dynamicTables.map((table) => (
                <Checkbox
                  key={table}
                  label={table}
                  checked={formData.selectedTables.includes(table)}
                  onChange={() => handleTableToggle(table)}
                />
              ))}
            </div>
          )}
          {dynamicTables.length === 0 && !isTablesLoading && (
            <Typography variant="caption" className="text-slate-500">
              No tables are selected.
            </Typography>
          )}
        </div>
      )}
    </div>
  );
}
