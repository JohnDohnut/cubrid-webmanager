import { BaseCmsResponse } from './base-cms-response';

export type StartInfoCmsResponse = BaseCmsResponse & {
  activelist: Array<{
    active: { dbname: string }[];
  }>;
  dblist: Array<{
    dbs: {
      dbdir: string;
      dbname: string;
    }[];
  }>;
};
