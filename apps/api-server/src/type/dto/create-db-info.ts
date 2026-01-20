export type CreateDBInfo = {
    dbname : string,
    pageSize : string,
    logPageSize: string,
    collation : "ko_KR.utf8" | "en_US.iso88591" | "en_US.utf8" | "ko_KR.euckr"
    volPath : string,
    logVolPath:string
    autoStart : "YES" | "NO",

}

