import { Checkbox } from '../../../../components/ds/forms/Checkbox';
import { SectionHeader } from '../../../../components/ds/foundation/SectionHeader';
import { Typography } from '../../../../components/ds/foundation/Typography';
import { Spinner } from '../../../../components/ds/foundation/Spinner';
import { useMemo } from 'react';
import { useCM } from '../../../../constants/useCM';

export default function UnloadContentSection({
  formData,
  handleTableScopeChange,
  handleIncludeToggle,
  handleTableToggle,
  handleSelectAllTables,
  dynamicTables,
  isTablesLoading,
}) {
  const CM = useCM();
  const tableScopeOpts = useMemo(() => [CM.all, CM.selectedTables], [CM]);

  return (
    <div className="space-y-6">
      <SectionHeader title={CM.unloadTarget} icon="unfold_more" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <SectionHeader title={CM.unloadTableScope} icon="terminal" />
          {tableScopeOpts.map((opt) => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer text-[12px]">
              <input
                type="radio"
                name="tableScope"
                checked={formData.tableScope === opt}
                onChange={() => handleTableScopeChange(opt)}
              />
              {opt}
            </label>
          ))}
        </div>

        <div className="space-y-3">
          <SectionHeader title={CM.unloadIncludeLabel} icon="dataset" />
          <Checkbox
            label={CM.includeSchema}
            checked={formData.includeSchema}
            onChange={() => handleIncludeToggle('includeSchema')}
          />
          <Checkbox
            label={CM.includeData}
            checked={formData.includeData}
            onChange={() => handleIncludeToggle('includeData')}
          />
        </div>
      </div>

      {formData.tableScope === CM.selectedTables && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <SectionHeader
              title={CM.availableClasses}
              icon="table_rows"
              badge={dynamicTables.length}
            />
            {!isTablesLoading && dynamicTables.length > 0 && (
              <Checkbox
                label={CM.selectAll}
                checked={dynamicTables.length > 0 && formData.selectedTables.length === dynamicTables.length}
                indeterminate={formData.selectedTables.length > 0 && formData.selectedTables.length < dynamicTables.length}
                onChange={() => handleSelectAllTables(dynamicTables)}
              />
            )}
          </div>
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
