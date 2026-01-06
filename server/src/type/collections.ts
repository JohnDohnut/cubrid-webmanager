import { HostInfo } from './host-info';
import { DBInfo } from './db-info';

/**
 * Generic hashmap/dictionary type
 * 제네릭 해시맵/딕셔너리 타입입니다
 *
 * @category Types
 * @since 1.0.0
 */
export type HashMap<T> = Record<string, T>;

/**
 * Host list as a hashmap (internal use with passwords)
 * 해시맵으로 된 호스트 목록 (패스워드 포함, 내부 사용)
 *
 * @category Types
 */
export type HostList = HashMap<HostInfo>;

/**
 * Safe host list without password fields (for API responses)
 * 패스워드 필드가 없는 안전한 호스트 목록 (API 응답용)
 *
 * @category Types
 */
export type SafeHostList = HashMap<Omit<HostInfo, 'password' | 'token' | 'dbProfiles'>>;

/**
 * Database list as a hashmap (internal use with passwords)
 * 해시맵으로 된 데이터베이스 목록 (패스워드 포함, 내부 사용)
 *
 * @category Types
 */
export type DbList = HashMap<DBInfo>;

/**
 * Safe database list without password fields (for API responses)
 * 패스워드 필드가 없는 안전한 데이터베이스 목록 (API 응답용)
 *
 * @category Types
 */
export type SafeDbList = HashMap<Omit<DBInfo, 'password'>>;
// Re-export commonly used types
export type { HostInfo } from './host-info';
export type { DBInfo } from './db-info';
export type { User } from './user';
