import { BaseCmsRequest } from './base-cms-request';

export type BaseCmsForwardRequest = BaseCmsRequest & {
  address: string;
  port: number;
};
