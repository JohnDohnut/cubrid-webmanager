import { BaseDatabaseRequest } from "./base-database-request";

export type SaveDatabaseProfileRequest = BaseDatabaseRequest & {
    id : string;
    password : string;
}