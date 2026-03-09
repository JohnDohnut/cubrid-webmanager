/**
 * Client request for userverify (verify DB user credentials).
 */
export type UserVerifyRequest = {
  dbname: string;
  dbuser: string;
  dbpasswd: string;
};
