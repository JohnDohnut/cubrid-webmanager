import { CmsHttpsClientService } from '@cms-https-client/cms-https-client.service';
import {
    checkCmsTokenError,
    checkCmsStatusError,
    HandleDatabaseErrors
} from '@common';
import { DatabaseError } from '@error/database/database-error';
import { HostError } from '@error/index';
import { ValidationError } from '@error/validation/validation-error';
import { HostService } from '@host';
import { Injectable } from '@nestjs/common';
import { UserRepositoryService } from '@repository';
import {
    BaseCmsRequest,
    BaseCmsResponse,
    DatabaseVolumeInfoClientResponse,
    StartInfoClientResponse,
    AddBackupInfoClientRequest,
    AddBackupInfoClientResponse,
    GetBackupInfoClientRequest,
    GetBackupInfoClientResponse,
    SetAutoExecQueryClientRequest,
    SetAutoExecQueryClientResponse,
    GetAutoExecQueryClientRequest,
    GetAutoExecQueryClientResponse,
} from '@type';
import {
    DbSpaceInfoCmsRequest,
    StartDatabaseCmsRequest,
    StopDatabaseCmsRequest,
    AddBackupInfoCmsRequest,
    GetBackupInfoCmsRequest,
    SetAutoExecQueryCmsRequest,
    GetAutoExecQueryCmsRequest,
} from '@type/cms-request';
import {
    DbSpaceInfoCmsResponse,
    StartInfoCmsResponse,
    AddBackupInfoCmsResponse,
    GetBackupInfoCmsResponse,
    SetAutoExecQueryCmsResponse,
    GetAutoExecQueryCmsResponse,
} from '@type/cms-response';

/**
 * Service for managing database operations.
 *
 * - Builds CMS requests (task, token, payload) and calls CMS HTTPS Client
 * - Evaluates CMS body `status` (HTTP code is always 200/201) to decide success
 * - Strips CMS envelope fields for domain-facing return types when needed
 *
 * 데이터베이스 작업을 관리하는 서비스입니다.
 * - CMS 요청(task, token, payload)을 구성하여 CMS HTTPS Client로 전달합니다
 * - CMS 본문 `status`로 성공/실패를 판단합니다(HTTP 200/201이 항상 반환됨)
 * - 필요 시 도메인에 반환할 때 CMS 메타 필드를 제거합니다
 *
 * @category Business Services
 * @since 1.0.0
 */
@Injectable()
export class DatabaseService {
    constructor(
        private readonly hostService: HostService,
        private readonly cmsClient: CmsHttpsClientService,
        private readonly repository: UserRepositoryService,
    ) {}

    /**
     * Get start information for databases on a host (internal use).
     * Returns raw CMS response without transformation.
     *
     * 특정 호스트의 데이터베이스 시작 정보를 조회합니다 (내부 사용).
     * CMS 응답을 변환 없이 그대로 반환합니다.
     *
     * @internal
     * @param userId 사용자 ID (JWT)
     * @param hostUid 호스트 UID
     * @returns StartInfoCmsResponse
     * @throws DatabaseError 요청 실패 또는 CMS status가 fail인 경우
     */
    @HandleDatabaseErrors()
    async startInfoInternal(
        userId: string,
        hostUid: string,
    ): Promise<StartInfoCmsResponse> {
        // Find host with full password, token, dbProfiles, etc
        const host = await this.hostService.findHostInternal(userId, hostUid);

        const url = `https://${host.address}:${host.port}/cm_api`;
        const data: BaseCmsRequest = {
            task: 'startinfo',
            token: host.token || '',
        };
        const response = await this.cmsClient.postAuthenticated<
            BaseCmsRequest,
            StartInfoCmsResponse | BaseCmsResponse
        >(url, data);

        // CMS token 에러 체크
        checkCmsTokenError(response);

        // CMS는 항상 200/201 HTTP status를 반환하므로 body의 status 필드로 성공 여부 판단
        if (response.status === 'success') {
            return response as StartInfoCmsResponse;
        } else {
            // status가 "fail"인 경우 에러 던지기
            throw DatabaseError.GetStartInfoFailed({ response });
        }
    }

    /**
     * Get start information for databases on a host.
     * Returns domain-only data (CMS envelope removed).
     *
     * 특정 호스트의 데이터베이스 시작 정보를 조회합니다.
     * CMS 메타 필드를 제거한 순수 데이터만 반환합니다.
     *
     * @param userId 사용자 ID (JWT)
     * @param hostUid 호스트 UID
     * @returns StartInfoClientResponse
     * @throws DatabaseError 요청 실패 또는 CMS status가 fail인 경우
     */
    @HandleDatabaseErrors()
    async startInfo(
        userId: string,
        hostUid: string,
    ): Promise<StartInfoClientResponse> {
        // Find host with full password, token, dbProfiles, etc
        const host = await this.hostService.findHostInternal(userId, hostUid);

        // 순수 CMS 응답 가져오기
        const response = await this.startInfoInternal(userId, hostUid);

        // BaseCmsResponse 필드 제외하고 순수 데이터만 반환
        const { __EXEC_TIME, note, status, task, ...dataOnly } = response;

        // 유저의 호스트 객체에서 dbProfiles 추출 (없을 수 있음)
        // dbProfiles는 { [dbname: string]: DatabaseProfile }
        const dbProfiles = host.dbProfiles || {};

        // CMS 응답: dblist와 activelist는 배열로 옴
        // dblist[0].dbs가 없는 경우를 대비한 안전한 처리
        const dbs = dataOnly.dblist?.[0]?.dbs || [];

        // activelist[0].active가 없는 경우를 대비한 안전한 처리
        const activeList = dataOnly.activelist?.[0]?.active || [];

        const clientResponse: StartInfoClientResponse = {
            activelist: { active: activeList },
            dblist: {
                dbs: dbs.map((db) => ({
                    ...db,
                    isProfileExists: !!dbProfiles[db.dbname],
                })),
            },
        };

        return clientResponse;
    }

    /**
     * Start a database on a host.
     *
     * 특정 호스트의 데이터베이스를 시작합니다.
     *
     * @param userId 사용자 ID (JWT)
     * @param hostUid 호스트 UID
     * @param dbname 시작할 DB 이름
     * @returns 성공 시 최신 시작 정보 (StartInfoClientResponse)
     * @throws DatabaseError CMS status가 fail인 경우
     */
    @HandleDatabaseErrors()
    async startDatabase(
        userId: string,
        hostUid: string,
        dbname: string,
    ): Promise<StartInfoClientResponse> {
        const host = await this.hostService.findHostInternal(userId, hostUid);
        const url = `https://${host.address}:${host.port}/cm_api`;
        const data: StartDatabaseCmsRequest = {
            task: 'startdb',
            token: host.token || '',
            dbname: dbname,
        };

        const response = await this.cmsClient.postAuthenticated<
            StartDatabaseCmsRequest,
            BaseCmsResponse
        >(url, data);

        // CMS token 에러 체크
        checkCmsTokenError(response);

        // CMS는 항상 200/201 HTTP status를 반환하므로 body의 status 필드로 성공 여부 판단
        if (response.status === 'success') {
            // 작업 성공 후 최신 상태 반환
            return await this.startInfo(userId, hostUid);
        }

        throw DatabaseError.StartDatabaseFailed({ response, dbname });
    }

    /**
     * Stop a database on a host.
     *
     * 특정 호스트의 데이터베이스를 중지합니다.
     *
     * @param userId 사용자 ID (JWT)
     * @param hostUid 호스트 UID
     * @param dbname 중지할 DB 이름
     * @returns 성공 시 최신 시작 정보 (StartInfoClientResponse)
     * @throws DatabaseError CMS status가 fail인 경우
     */
    @HandleDatabaseErrors()
    async stopDatabase(
        userId: string,
        hostUid: string,
        dbname: string,
    ): Promise<StartInfoClientResponse> {
        const host = await this.hostService.findHostInternal(userId, hostUid);
        const url = `https://${host.address}:${host.port}/cm_api`;
        const data: StopDatabaseCmsRequest = {
            task: 'stopdb',
            token: host.token || '',
            dbname: dbname,
        };

        const response = await this.cmsClient.postAuthenticated<
            StopDatabaseCmsRequest,
            BaseCmsResponse
        >(url, data);

        // CMS token 에러 체크
        checkCmsTokenError(response);

        // CMS는 항상 200/201 HTTP status를 반환하므로 body의 status 필드로 성공 여부 판단
        if (response.status === 'success') {
            // 작업 성공 후 최신 상태 반환
            return await this.startInfo(userId, hostUid);
        }

        throw DatabaseError.StopDatabaseFailed({ response, dbname });
    }

    /**
     * Restart a database (stop then start).
     *
     * 특정 호스트의 데이터베이스를 재시작합니다(중지 후 시작 순차 수행).
     *
     * @param userId 사용자 ID (JWT)
     * @param hostUid 호스트 UID
     * @param dbname 재시작할 DB 이름
     * @returns 성공 시 최신 시작 정보 (StartInfoClientResponse)
     * @throws DatabaseError 중지/시작 단계에서 실패 시 해당 에러
     */
    @HandleDatabaseErrors()
    async restartDatabase(
        userId: string,
        hostUid: string,
        dbname: string,
    ): Promise<StartInfoClientResponse> {
        // Stop database
        const host = await this.hostService.findHostInternal(userId, hostUid);
        const url = `https://${host.address}:${host.port}/cm_api`;

        const stopRequest: StopDatabaseCmsRequest = {
            task: 'stopdb',
            token: host.token || '',
            dbname: dbname,
        };

        const stopResponse = await this.cmsClient.postAuthenticated<
            StopDatabaseCmsRequest,
            BaseCmsResponse
        >(url, stopRequest);

        // CMS token 에러 체크
        checkCmsTokenError(stopResponse);

        if (stopResponse.status === 'success') {
            // Start database
            const startRequest: StartDatabaseCmsRequest = {
                task: 'startdb',
                token: host.token || '',
                dbname: dbname,
            };

            const startResponse = await this.cmsClient.postAuthenticated<
                StartDatabaseCmsRequest,
                BaseCmsResponse
            >(url, startRequest);

            // CMS token 에러 체크
            checkCmsTokenError(startResponse);

            if (startResponse.status === 'success') {
                // 작업 성공 후 최신 상태 반환
                return await this.startInfo(userId, hostUid);
            } else {
                throw DatabaseError.StartDatabaseFailed({
                    response: startResponse,
                    dbname,
                });
            }
        } else {
            throw DatabaseError.StopDatabaseFailed({
                response: stopResponse,
                dbname,
            });
        }
    }

    /**
     * Save a database profile for a host.
     *
     * 호스트에 대한 데이터베이스 프로파일을 저장합니다.
     *
     * @param userId 사용자 ID (JWT)
     * @param hostUid 호스트 UID
     * @param dbname 데이터베이스 이름
     * @param databaseId 데이터베이스 사용자 ID
     * @param databasePassword 데이터베이스 비밀번호
     * @returns 성공 시 최신 시작 정보 (StartInfoClientResponse)
     * @throws DatabaseError 프로파일이 이미 존재하거나 저장 실패 시
     */
    @HandleDatabaseErrors()
    async saveDatabaseProfile(
        userId: string,
        hostUid: string,
        dbname: string,
        databaseId: string,
        databasePassword: string,
    ): Promise<StartInfoClientResponse> {
        // 유효성 검증 (null/undefined만 체크, 빈 문자열은 허용)
        if (dbname == null || databaseId == null || databasePassword == null) {
            const missingFields = [
                dbname == null && 'dbname',
                databaseId == null && 'id',
                databasePassword == null && 'password',
            ].filter(Boolean) as string[];

            throw ValidationError.MissingDBCredentials(
                dbname || 'unknown',
                missingFields,
            );
        }

        // atomicUpdateUser를 사용하여 저장
        await this.repository.atomicUpdateUser(userId, async (user) => {
            const host = user.host_list[hostUid];
            if (!host) {
                throw HostError.NoSuchHost({ hostUid });
            }

            // 기존 host 객체에 dbProfiles가 없으면 초기화 (하위 호환성)
            // undefined, null 모두 체크
            if (host.dbProfiles == null) {
                host.dbProfiles = {};
            }

            // 중복 체크 (초기화 후이므로 안전하게 접근 가능)
            if (host.dbProfiles[dbname]) {
                throw DatabaseError.DuplicatedDatabaseProfile({
                    dbname,
                    hostUid,
                });
            }

            // 프로파일 추가
            host.dbProfiles[dbname] = {
                dbname,
                id: databaseId,
                password: databasePassword,
            };

            return user;
        });

        // 프로파일 저장 후 최신 상태 반환 (isProfileExists가 업데이트됨)
        return await this.startInfo(userId, hostUid);
    }

    /**
     * Get database volume/space information for a database on a host.
     * Returns domain-only data (CMS envelope removed).
     *
     * 특정 호스트의 데이터베이스 볼륨/공간 정보를 조회합니다.
     * CMS 메타 필드를 제거한 순수 데이터만 반환합니다.
     *
     * @param userId 사용자 ID (JWT)
     * @param hostUid 호스트 UID
     * @param dbname 데이터베이스 이름
     * @returns DatabaseVolumeInfoClientResponse
     * @throws DatabaseError 요청 실패 또는 CMS status가 fail인 경우
     */
    @HandleDatabaseErrors()
    async getDBSpaceInfo(
        userId: string,
        hostUid: string,
        dbname: string,
    ): Promise<DatabaseVolumeInfoClientResponse> {
        const host = await this.hostService.findHostInternal(userId, hostUid);
        const url = `https://${host.address}:${host.port}/cm_api`;

        const startInfoRequest: BaseCmsRequest = {
            task: 'startinfo',
            token: host.token || '',
        };

        const startInfo =
            await this.cmsClient.postAuthenticated<
                BaseCmsRequest,
                StartInfoCmsResponse | BaseCmsResponse
            >(url, startInfoRequest);

        // 타입 가드: StartInfoCmsResponse인지 확인
        if ('dblist' in startInfo && 'activelist' in startInfo) {
            // StartInfoCmsResponse 타입
            // dblist 내에서 dbname 존재 여부 확인
            const dbExists = startInfo.dblist.some((el) =>
                el.dbs.some((db) => db.dbname === dbname)
            );
            
            if (!dbExists) {
                throw DatabaseError.NoSuchDatabase({ dbname, hostUid });
            }
        } else {
            // BaseCmsResponse 타입 (status === 'fail'인 경우)
            checkCmsTokenError(startInfo);
            throw DatabaseError.InternalError();
        }
            
        const spaceInfoRequest: DbSpaceInfoCmsRequest = {
            task: 'dbspaceinfo',
            token: host.token || '',
            dbname: dbname,
        };
        const response = await this.cmsClient.postAuthenticated<
            DbSpaceInfoCmsRequest,
            DbSpaceInfoCmsResponse | BaseCmsResponse
        >(url, spaceInfoRequest);

        // CMS token 에러 체크
        checkCmsTokenError(response);

        // CMS는 항상 200/201 HTTP status를 반환하므로 body의 status 필드로 성공 여부 판단
        if (response.status === 'success') {
            // BaseCmsResponse 필드 제외하고 순수 데이터만 반환
            const { __EXEC_TIME, note, status, task, ...dataOnly } =
                response as DbSpaceInfoCmsResponse;
            return dataOnly;
        } else {
            // status가 "fail"인 경우 에러 던지기
            throw DatabaseError.GetDBSpaceInfoFailed({ response, dbname });
        }
    }
    

    /**
     * Add automated backup schedule information for a database.
     * Returns empty object on success (CMS envelope fields removed).
     *
     * 데이터베이스의 백업 정보를 추가합니다.
     * 성공 시 빈 객체를 반환합니다 (CMS 메타 필드 제거).
     *
     * @param userId 사용자 ID (JWT)
     * @param hostUid 호스트 UID
     * @param dbname 데이터베이스 이름
     * @param backupInfo 백업 정보
     * @returns AddBackupInfoClientResponse 성공 시 빈 객체
     * @throws DatabaseError 요청 실패 또는 CMS status가 fail인 경우
     */
    @HandleDatabaseErrors()
    async addBackupSchedule(
        userId: string,
        hostUid: string,
        dbname: string,
        backupInfo: AddBackupInfoClientRequest,
    ): Promise<AddBackupInfoClientResponse> {
        const host = await this.hostService.findHostInternal(userId, hostUid);
        const url = `https://${host.address}:${host.port}/cm_api`;
        const request: AddBackupInfoCmsRequest = {
            task: 'addbackupinfo',
            token: host.token || '',
            dbname: dbname,
            backupid: backupInfo.backupid,
            path: backupInfo.path,
            period_type: backupInfo.period_type,
            period_date: backupInfo.period_date,
            time: backupInfo.time,
            level: backupInfo.level,
            archivedel: backupInfo.archivedel,
            updatestatus: backupInfo.updatestatus,
            storeold: backupInfo.storeold,
            onoff: backupInfo.onoff,
            zip: backupInfo.zip,
            check: backupInfo.check,
            mt: backupInfo.mt,
            bknum: backupInfo.bknum,
        };

        const response = await this.cmsClient.postAuthenticated<AddBackupInfoCmsRequest, AddBackupInfoCmsResponse>(url, request);

        // CMS token 에러 체크
        checkCmsTokenError(response);

        // CMS status 에러 체크
        checkCmsStatusError(response);

        // 성공 시 빈 객체 반환
        return {};
    }

    /**
     * Get automated backup schedule information for a database.
     * Returns domain-only data (CMS envelope removed).
     *
     * 데이터베이스의 백업 정보를 조회합니다.
     * CMS 메타 필드를 제거한 순수 데이터만 반환합니다.
     *
     * @param userId 사용자 ID (JWT)
     * @param hostUid 호스트 UID
     * @param dbname 데이터베이스 이름
     * @returns GetBackupInfoClientResponse 백업 정보
     * @throws DatabaseError 요청 실패 또는 CMS status가 fail인 경우
     */
    @HandleDatabaseErrors()
    async getBackupSchedule(
        userId: string,
        hostUid: string,
        dbname: string,
    ): Promise<GetBackupInfoClientResponse> {
        const host = await this.hostService.findHostInternal(userId, hostUid);
        const url = `https://${host.address}:${host.port}/cm_api`;
        const request: GetBackupInfoCmsRequest = {
            task: 'getbackupinfo',
            token: host.token || '',
            dbname: dbname,
        };

        const response = await this.cmsClient.postAuthenticated<GetBackupInfoCmsRequest, GetBackupInfoCmsResponse>(url, request);

        // CMS token 에러 체크
        checkCmsTokenError(response);

        // CMS status 에러 체크
        checkCmsStatusError(response);

        // CMS 응답에서 동적 키로 저장된 백업 정보 추출
        const { __EXEC_TIME, note, status, task, dbname: responseDbname, ...rest } = response;
        const backupArray = rest[dbname] as any[];

        // 클라이언트 응답 형식으로 변환
        return {
            dbname: responseDbname,
            backups: backupArray || [],
        };
    }

    /**
     * Set auto-execution query for a database.
     * Returns empty object on success (CMS envelope fields removed).
     *
     * 데이터베이스의 자동 실행 쿼리를 설정합니다.
     * 성공 시 빈 객체를 반환합니다 (CMS 메타 필드 제거).
     *
     * @param userId 사용자 ID (JWT)
     * @param hostUid 호스트 UID
     * @param dbname 데이터베이스 이름
     * @param autoExecQuery 자동 실행 쿼리 설정
     * @returns SetAutoExecQueryClientResponse 성공 시 빈 객체
     * @throws DatabaseError 요청 실패 또는 CMS status가 fail인 경우
     */
    @HandleDatabaseErrors()
    async setAutoExecQuery(
        userId: string,
        hostUid: string,
        dbname: string,
        autoExecQuery: SetAutoExecQueryClientRequest,
    ): Promise<SetAutoExecQueryClientResponse> {
        const host = await this.hostService.findHostInternal(userId, hostUid);
        const url = `https://${host.address}:${host.port}/cm_api`;
        const request: SetAutoExecQueryCmsRequest = {
            task: 'setautoexecquery',
            token: host.token || '',
            dbname: dbname,
            planlist: autoExecQuery.planlist,
        };

        const response = await this.cmsClient.postAuthenticated<SetAutoExecQueryCmsRequest, SetAutoExecQueryCmsResponse>(url, request);

        // CMS token 에러 체크
        checkCmsTokenError(response);

        // CMS status 에러 체크
        checkCmsStatusError(response);

        // 성공 시 빈 객체 반환
        return {};
    }

    /**
     * Get auto-execution query for a database.
     * Returns domain-only data (CMS envelope removed).
     *
     * 데이터베이스의 자동 실행 쿼리를 조회합니다.
     * CMS 메타 필드를 제거한 순수 데이터만 반환합니다.
     *
     * @param userId 사용자 ID (JWT)
     * @param hostUid 호스트 UID
     * @param dbname 데이터베이스 이름
     * @returns GetAutoExecQueryClientResponse 자동 실행 쿼리 정보
     * @throws DatabaseError 요청 실패 또는 CMS status가 fail인 경우
     */
    @HandleDatabaseErrors()
    async getAutoExecQuery(
        userId: string,
        hostUid: string,
        dbname: string,
    ): Promise<GetAutoExecQueryClientResponse> {
        const host = await this.hostService.findHostInternal(userId, hostUid);
        const url = `https://${host.address}:${host.port}/cm_api`;
        const request: GetAutoExecQueryCmsRequest = {
            task: 'getautoexecquery',
            token: host.token || '',
            dbname: dbname,
        };

        const response = await this.cmsClient.postAuthenticated<GetAutoExecQueryCmsRequest, GetAutoExecQueryCmsResponse>(url, request);

        // CMS token 에러 체크
        checkCmsTokenError(response);

        // CMS status 에러 체크
        checkCmsStatusError(response);

        // BaseCmsResponse 필드 제외하고 순수 데이터만 반환
        const { __EXEC_TIME, note, status, task, ...dataOnly } = response;

        // CMS 응답에서 @username 필드를 username으로 변환
        // CMS API가 실제로 @username으로 응답을 보내므로, 클라이언트 타입(username)에 맞게 변환
        const planlist = dataOnly.planlist.map(plan => {
            const queryplan = plan.queryplan.map(query => {
                const queryAny = query as any;
                
                // CMS가 @username으로 보내므로 이를 username으로 변환
                if (queryAny['@username'] !== undefined) {
                    const { '@username': atUsername, ...rest } = queryAny;
                    return {
                        ...rest,
                        username: atUsername || '',
                    };
                }
                
                // 이미 username으로 온 경우 그대로 사용
                return queryAny;
            });

            return {
                dbname: plan.dbname,
                queryplan: queryplan,
            };
        });

        return {
            planlist: planlist,
        };
    }

    @HandleDatabaseErrors()
    async createDatabase(){
        //getenv - get default directory
        //checkfile - db duplication check 
        //checkdir - db directory check
        //createdb - create db
        //setautoaddvol - set auto scale of db.
    }
}
