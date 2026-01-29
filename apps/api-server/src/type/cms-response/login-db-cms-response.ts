import { BaseCmsResponse } from './base-cms-response';

export type LoginDBCmsResponse = BaseCmsResponse & {
  authority: string;
  dbname: string;
};
