import { DBInfo } from "./db-info";
import { HashMap } from "./collections";

/**
 * Interface representing host information.
 * 호스트 정보를 나타내는 인터페이스입니다.
 *
 * Contains host identification and connection details including
 * unique ID, address, port, and password.
 *
 * 고유 ID, 주소, 포트, 패스워드를 포함한 호스트 식별 및
 * 연결 세부정보를 포함합니다.
 *
 * @category Types
 * @since 1.0.0
 */
export type  HostInfo = {
    uid: string;
    id: string;
    token?: string;
    address: string;
    port: number;
    password: string;
    alias?: string;
    dbProfiles: HashMap<DBInfo>;
};
