/**
 * Client-facing response for database volume/space information.
 * Strips CMS envelope fields from DbSpaceInfoCmsResponse.
 *
 * 클라이언트로 반환되는 데이터베이스 볼륨/공간 정보 응답 타입입니다.
 * CMS 메타 필드(BaseCmsResponse)를 제거합니다.
 *
 * @category Responses
 * @since 1.0.0
 */
export type DatabaseVolumeInfoClientResponse = {
    dbname: string;
    dbinfo: {
        free_size: string;
        purpose: string;
        total_size: string;
        type: string;
        used_size: string;
        volume_count: string;
    }[];
    fileinfo: {
        data_type: string;
        file_count: string;
        file_table_size: string;
        reserved_size: string;
        total_size: string;
        used_size: string;
    }[];
    freespace: string;
    logpagesize: string;
    pagesize: string;
    spaceinfo: {
        date?: string;
        freepage?: string;
        location: string;
        purpose?: string;
        spacename: string;
        totalpage?: string;
        type: string;
        usedpage?: string;
        volid?: string;
    }[];
};

