import { BaseCmsResponse } from './base-cms-response';

/** Single user entry in userinfo response */
export type UserInfoUserEntry = {
  '@id'?: string;
  '@name'?: string;
  authorization?: Record<string, string>[] | null;
  groups?: unknown | null;
};

/**
 * CMS response for userinfo task.
 */
export type UserInfoCmsResponse = BaseCmsResponse & {
  task: 'userinfo';
  dbname?: string;
  user?: UserInfoUserEntry[];
};
