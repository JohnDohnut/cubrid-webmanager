import { BaseCmsResponse } from './base-cms-response';

export type CmsGetHostStatResponse = BaseCmsResponse & {
  cpu_idle: string;
  cpu_iowait: string;
  cpu_kernel: string;
  cpu_user: string;
  mem_phy_free: string;
  mem_phy_total: string;
  mem_swap_free: string;
  mem_swap_total: string;
};
