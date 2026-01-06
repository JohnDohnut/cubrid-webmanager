import { HostInfo, DBInfo } from '@type/index';
import { ValidationError } from '@error/validation/validation-error';

/**
 * Resolved database authentication information.
 * 프로파일 또는 클라이언트 제공 정보로부터 해결된 DB 인증 정보입니다.
 */
export interface ResolvedDBAuth {
    dbname: string;
    id: string;
    password: string;
}

/**
 * Utility service for resolving database authentication information.
 * 
 * DB 인증 정보를 해결하는 유틸리티 서비스입니다.
 * 
 * - Profile이 있는 경우: HostInfo의 dbProfiles에서 id/password를 가져옵니다.
 * - Profile이 없는 경우: 클라이언트에서 제공한 id/password를 사용합니다.
 * 
 * @category Utilities
 * @since 1.0.0
 */
export class DBAuthResolver {
    /**
     * Resolves database authentication information from host profile or client-provided credentials.
     * 
     * 호스트 프로파일 또는 클라이언트 제공 자격 증명으로부터 DB 인증 정보를 해결합니다.
     * 
     * @param host - Host information containing dbProfiles
     * @param dbname - Database name
     * @param clientId - Client-provided database user ID (required if profile doesn't exist)
     * @param clientPassword - Client-provided database password (required if profile doesn't exist)
     * @returns ResolvedDBAuth containing dbname, id, and password
     * @throws ValidationError.MissingDBCredentials if profile doesn't exist and client credentials are not provided
     * 
     * @example
     * ```typescript
     * // Profile이 있는 경우
     * const auth = DBAuthResolver.resolve(host, 'mydb');
     * 
     * // Profile이 없는 경우
     * const auth = DBAuthResolver.resolve(host, 'mydb', 'dbuser', 'dbpass');
     * ```
     */
    static resolve(
        host: HostInfo,
        dbname: string,
        clientId?: string,
        clientPassword?: string,
    ): ResolvedDBAuth {
        // 기존 host 객체에 dbProfiles가 없으면 빈 객체로 처리 (하위 호환성)
        const dbProfiles = host.dbProfiles || {};
        const profile = dbProfiles[dbname];

        if (profile) {
            // Profile이 있는 경우: profile의 id/password 사용
            return {
                dbname,
                id: profile.id,
                password: profile.password,
            };
        }

        // Profile이 없는 경우: 클라이언트에서 제공한 id/password 필요
        // null/undefined만 체크 (빈 문자열은 유효한 값으로 처리)
        if (clientId == null || clientPassword == null) {
            const missingFields: string[] = [];
            if (clientId == null) missingFields.push('id');
            if (clientPassword == null) missingFields.push('password');
            
            throw ValidationError.MissingDBCredentials(dbname, missingFields);
        }

        return {
            dbname,
            id: clientId,
            password: clientPassword,
        };
    }

    /**
     * Checks if a database profile exists for the given dbname.
     * 
     * 주어진 dbname에 대한 데이터베이스 프로파일이 존재하는지 확인합니다.
     * 
     * @param host - Host information containing dbProfiles
     * @param dbname - Database name
     * @returns true if profile exists, false otherwise
     */
    static hasProfile(host: HostInfo, dbname: string): boolean {
        // 기존 host 객체에 dbProfiles가 없으면 false 반환 (하위 호환성)
        return !!(host.dbProfiles && host.dbProfiles[dbname]);
    }
}

