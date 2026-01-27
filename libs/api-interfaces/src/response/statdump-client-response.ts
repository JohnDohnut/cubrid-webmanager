import { BaseCmsResponse } from '@type/cms-response/base-cms-response';
import { StatdumpCmsResponse } from '@type/cms-response/statdump-cms-response';

/**
 * Client-facing response type for statdump.
 * Removes CMS envelope fields.
 */
export type StatdumpClientResponse = Omit<StatdumpCmsResponse, keyof BaseCmsResponse>;
