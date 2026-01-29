import { BaseCmsRequest } from '.';

export type LoginDBCmsRequest = BaseCmsRequest & {
  targetid: string;
  dbname: string;
  dbuser: string;
  dbpasswd: string;
};
