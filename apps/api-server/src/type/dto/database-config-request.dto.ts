import { Type } from 'class-transformer';
import { IsArray, IsIn, IsNotEmpty, IsString, ValidateNested } from 'class-validator';

/**
 * Validated request bodies for DatabaseConfigController. Kept as
 * backend-only classes (mirroring the shared @api-interfaces types) so
 * class-validator decorators don't end up bundled into the frontend's
 * copy of those types.
 *
 * @category DTOs
 * @since 1.0.0
 */
export class QueryPlanClientDto {
  @IsString()
  @IsNotEmpty()
  query_id: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  // Unlike DB-user login credentials (database-user-request.dto.ts), CMS's
  // setautoexecquery task does not tolerate an empty userpass: it silently
  // accepts one on the first write, then persists the entry with the
  // userpass key missing entirely, which corrupts the whole list and makes
  // every later append/edit for that database fail with "Parameter(userpass)
  // missing" (setautoexecquery replaces the full list, not just one entry).
  @IsString()
  @IsNotEmpty()
  userpass: string;

  @IsString()
  @IsNotEmpty()
  period: string;

  @IsString()
  @IsNotEmpty()
  detail: string;

  @IsString()
  @IsNotEmpty()
  query_string: string;
}

class PlanListClientDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QueryPlanClientDto)
  queryplan: QueryPlanClientDto[];
}

export class SetAutoExecQueryDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlanListClientDto)
  planlist: PlanListClientDto[];
}

export class AppendAutoExecQueryPlanDto {
  @ValidateNested()
  @Type(() => QueryPlanClientDto)
  plan: QueryPlanClientDto;
}

export class UpdateAutoExecQueryPlanDto {
  @ValidateNested()
  @Type(() => QueryPlanClientDto)
  plan: QueryPlanClientDto;
}

export class RemoveAutoExecQueryPlanDto {
  @IsString()
  @IsNotEmpty()
  query_id: string;
}

export class SetAutoStartDto {
  @IsString()
  @IsNotEmpty()
  confname: string;

  @IsString()
  @IsNotEmpty()
  dbname: string;
}

export class RemoveAutoStartDto {
  @IsString()
  @IsNotEmpty()
  confname: string;

  @IsString()
  @IsNotEmpty()
  dbname: string;
}

export class SetAutoAddVolDto {
  @IsString()
  @IsNotEmpty()
  data: string;

  @IsString()
  @IsNotEmpty()
  data_warn_outofspace: string;

  @IsString()
  @IsNotEmpty()
  data_ext_page: string;

  @IsString()
  @IsNotEmpty()
  index: string;

  @IsString()
  @IsNotEmpty()
  index_warn_outofspace: string;

  @IsString()
  @IsNotEmpty()
  index_ext_page: string;
}

export class ClassInfoDto {
  @IsIn(['on', 'off'])
  dbstatus: 'on' | 'off';
}
