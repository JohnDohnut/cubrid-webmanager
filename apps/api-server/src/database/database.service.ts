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
} from '@api-interfaces';
import { BaseCmsRequest, BaseCmsResponse } from '@type';
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

        checkCmsTokenError(response);

        if (response.status === 'success') {
            return response as StartInfoCmsResponse;
        } else {
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
        const host = await this.hostService.findHostInternal(userId, hostUid);
        const response = await this.startInfoInternal(userId, hostUid);
        const { __EXEC_TIME, note, status, task, ...dataOnly } = response;
        const dbProfiles = host.dbProfiles || {};
        const dbs = dataOnly.dblist?.[0]?.dbs || [];
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

        checkCmsTokenError(response);

        if (response.status === 'success') {
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

        checkCmsTokenError(response);

        if (response.status === 'success') {
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

        checkCmsTokenError(stopResponse);

        if (stopResponse.status === 'success') {
            const startRequest: StartDatabaseCmsRequest = {
                task: 'startdb',
                token: host.token || '',
                dbname: dbname,
            };

            const startResponse = await this.cmsClient.postAuthenticated<
                StartDatabaseCmsRequest,
                BaseCmsResponse
            >(url, startRequest);

            checkCmsTokenError(startResponse);

            if (startResponse.status === 'success') {
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

        await this.repository.atomicUpdateUser(userId, async (user) => {
            const host = user.host_list[hostUid];
            if (!host) {
                throw HostError.NoSuchHost({ hostUid });
            }

            if (host.dbProfiles == null) {
                host.dbProfiles = {};
            }

            if (host.dbProfiles[dbname]) {
                throw DatabaseError.DuplicatedDatabaseProfile({
                    dbname,
                    hostUid,
                });
            }

            host.dbProfiles[dbname] = {
                dbname,
                id: databaseId,
                password: databasePassword,
            };

            return user;
        });

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

        if ('dblist' in startInfo && 'activelist' in startInfo) {
            const dbExists = startInfo.dblist.some((el) =>
                el.dbs.some((db) => db.dbname === dbname)
            );
            
            if (!dbExists) {
                throw DatabaseError.NoSuchDatabase({ dbname, hostUid });
            }
        } else {
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

        checkCmsTokenError(response);

        if (response.status === 'success') {
            const { __EXEC_TIME, note, status, task, ...dataOnly } =
                response as DbSpaceInfoCmsResponse;
            return dataOnly;
        } else {
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

        checkCmsTokenError(response);

        checkCmsStatusError(response);

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

        checkCmsTokenError(response);

        checkCmsStatusError(response);

        const { __EXEC_TIME, note, status, task, dbname: responseDbname, ...rest } = response;
        const backupArray = rest[dbname] as any[];

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

        checkCmsTokenError(response);

        checkCmsStatusError(response);

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

        checkCmsTokenError(response);

        checkCmsStatusError(response);

        const { __EXEC_TIME, note, status, task, ...dataOnly } = response;

        const planlist = dataOnly.planlist.map(plan => {
            const queryplan = plan.queryplan.map(query => {
                const queryAny = query as any;
                
                if (queryAny['@username'] !== undefined) {
                    const { '@username': atUsername, ...rest } = queryAny;
                    return {
                        ...rest,
                        username: atUsername || '',
                    };
                }
                
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
    }
}
