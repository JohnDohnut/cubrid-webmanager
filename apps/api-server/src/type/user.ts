import { DBInfo } from './db-info';
import { HostInfo } from './host-info';
import { HashMap } from './collections';
import { UserPreference } from './user-preferencs';

/**
 * User interface representing a user in the system.
 * 시스템의 사용자를 나타내는 사용자 인터페이스입니다.
 *
 * Contains user information including authentication details,
 * department, and associated host lists.
 *
 * 인증 세부정보, 부서, 연결된 호스트 목록을 포함한
 * 사용자 정보를 포함합니다.
 *
 * @category Types
 * @since 1.0.0
 */
export interface User {
    uuid: string;
    id: string;
    password: string;
    department: string;
    host_list: HashMap<HostInfo>;
    ha_mon_list: HashMap<any>;
    resource_mon_list: HashMap<any>;
    user_preference : UserPreference;
}
