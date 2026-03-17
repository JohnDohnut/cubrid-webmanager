import { BaseCmsResponse } from './base-cms-response';

/**
 * CMS response for getautoaddvol task.
 */
export type GetAutoAddVolCmsResponse = BaseCmsResponse & {
  task: 'getautoaddvol';
  data: string;
  data_ext_page: string;
  data_warn_outofspace: string;
  index: string;
  index_ext_page: string;
  index_warn_outofspace: string;
};
