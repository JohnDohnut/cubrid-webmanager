import { BaseCmsResponse } from '@type/cms-response/base-cms-response';
import { StartInfoCmsResponse } from '@type/cms-response/start-info-cms-response';

/**
 * Client-facing response for start info.
 * Strips CMS envelope fields from StartInfoCmsResponse.
 *
 * 클라이언트로 반환되는 시작 정보 응답 타입입니다.
 * CMS 메타 필드(BaseCmsResponse)를 제거합니다.
 */
export type StartInfoClientResponse = {
    activelist: {
        active: {
            dbname: string;
        }[];
    };
    dblist: {
        dbs: {
            dbdir: string;
            dbname: string;
            isProfileExists : boolean;
        }[];
    };
};
