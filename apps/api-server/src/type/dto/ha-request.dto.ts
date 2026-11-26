import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayNotEmpty, IsArray, IsBoolean, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';

/**
 * Validated request body for HaController's heartbeat-list endpoint.
 * Mirrors HeartbeatListClientRequest (libs/api-interfaces).
 *
 * @category DTOs
 * @since 1.0.0
 */
export class HeartbeatListDto {
  @IsString()
  @IsNotEmpty()
  dbmodeall: string;
}

/**
 * POC (HA slave add, run on the master): ssh connection check from this host
 * (the master) to the new slave or a replica (CMS ha_check_ssh). The
 * password goes only into the request with the host key the user
 * confirmed; it is not saved, and the log hides it (its key contains "pass").
 */
export class HaSshCheckDto {
  @IsString()
  @IsNotEmpty()
  host: string;

  @IsInt()
  @Min(1)
  @Max(65535)
  sshPort: number;

  @IsString()
  @IsNotEmpty()
  osUser: string;

  @IsOptional()
  @IsString()
  osPassword?: string;

  @IsOptional()
  @IsString()
  hostKeyFingerprint?: string;
}

/** POC: one node reached over ssh (a new node or an existing one), checked with its confirmed host key. */
export class HaSshNodeDto {
  @IsString()
  @IsNotEmpty()
  host: string;

  @IsInt()
  @Min(1)
  @Max(65535)
  sshPort: number;

  @IsString()
  @IsNotEmpty()
  osUser: string;

  @IsString()
  @IsNotEmpty()
  osPassword: string;

  @IsString()
  @IsNotEmpty()
  hostKeyFingerprint: string;
}

/** POC (HA node add): a server to add, with its role in the HA group. */
export class HaNewNodeDto extends HaSshNodeDto {
  @IsIn(['slave', 'replica'])
  role: 'slave' | 'replica';
}

/**
 * POC (HA node add, CMS ha_add_nodes): new slaves and replicas for this
 * host's HA group in one job. `plan` checks every node and returns what run
 * would do, changing nothing; `run` does it. A single (non-HA) host is first
 * promoted to an HA master with `dbNames`. The restart confirmations go only
 * with run (the ones the plan asked for).
 */
export class HaAddNodesDto {
  @IsIn(['plan', 'run'])
  action: 'plan' | 'run';

  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(32)
  @ValidateNested({ each: true })
  @Type(() => HaNewNodeDto)
  newNodes: HaNewNodeDto[];

  /** Every other node of the group (CMS takes their roles from this host's settings). */
  @IsArray()
  @ArrayMaxSize(64)
  @ValidateNested({ each: true })
  @Type(() => HaSshNodeDto)
  existingNodes: HaSshNodeDto[];

  /** Single host only: the databases to put in HA (the new ha_db_list). */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(64)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  dbNames?: string[];

  @IsOptional()
  @IsBoolean()
  confirmMasterRestart?: boolean;

  @IsOptional()
  @IsBoolean()
  confirmOtherDbRestart?: boolean;

  @IsOptional()
  @IsBoolean()
  confirmNewNodeDbRestart?: boolean;

  @IsOptional()
  @IsBoolean()
  rollbackConvert?: boolean;

  @IsOptional()
  @IsBoolean()
  startHa?: boolean;

  /**
   * plan only: the databases to look for tables without a primary key in
   * (HA does not replicate them). The server adds the login of each one the
   * user is logged in to now; never a saved login alone.
   */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(64)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  checkDbNames?: string[];
}

/** POC: one job; offset is how much of the log the screen already has. */
export class HaAddNodesJobDto {
  @IsString()
  @IsNotEmpty()
  uuid: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number;
}

/** POC: undoes what an interrupted job (its script gone mid-way) changed; needs every node's login again. */
export class HaAddNodesRollbackDto {
  @IsString()
  @IsNotEmpty()
  uuid: string;

  @IsArray()
  @ArrayMaxSize(32)
  @ValidateNested({ each: true })
  @Type(() => HaNewNodeDto)
  newNodes: HaNewNodeDto[];

  @IsArray()
  @ArrayMaxSize(64)
  @ValidateNested({ each: true })
  @Type(() => HaSshNodeDto)
  existingNodes: HaSshNodeDto[];
}

/** POC: deletes the old database folders a successful job moved aside on the new nodes; needs their logins again. */
export class HaAddNodesCleanupDto {
  @IsString()
  @IsNotEmpty()
  uuid: string;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(32)
  @ValidateNested({ each: true })
  @Type(() => HaNewNodeDto)
  newNodes: HaNewNodeDto[];
}
