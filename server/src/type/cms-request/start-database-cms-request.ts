import { BaseCmsRequest } from './base-cms-request';

export type StartDatabaseCmsRequest = BaseCmsRequest & {
    dbname: string;
};
