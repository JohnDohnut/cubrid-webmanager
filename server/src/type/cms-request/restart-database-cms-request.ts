import { BaseCmsRequest } from './base-cms-request';

export type RestartDatabaseCmsRequest = BaseCmsRequest & {
    dbname: string;
};
