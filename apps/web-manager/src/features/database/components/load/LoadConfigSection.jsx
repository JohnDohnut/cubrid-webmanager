import { Input } from '../../../../components/ds/forms/Input';
import { SectionHeader } from '../../../../components/ds/foundation/SectionHeader';
import { CM } from '../../../../constants/cmLabels';

export default function LoadConfigSection({ formData, handleInputChange }) {
  return (
    <div className="space-y-4">
      <SectionHeader title={CM.grpDbInfo} icon="account_circle" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label={CM.targetDbName}
          name="targetDbName"
          value={formData.targetDbName}
          onChange={handleInputChange}
          disabled
        />
        <Input
          label={CM.userName}
          name="dbUsername"
          value={formData.dbUsername}
          onChange={handleInputChange}
        />
        <Input
          type="password"
          label={CM.password}
          name="dbPassword"
          value={formData.dbPassword}
          onChange={handleInputChange}
        />
      </div>
    </div>
  );
}
