import { Type } from 'class-transformer';
import { ArrayMaxSize, Equals, IsArray, IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';

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

/** POC: one node reached over ssh (the new slave or a replica), checked with its confirmed host key. */
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

/**
 * POC: turns this host's single database into a one-node HA master (CMS
 * ha_convert_master). The database restarts, so the user's confirmation is
 * part of the request.
 */
export class HaConvertMasterDto {
  @IsString()
  @IsNotEmpty()
  dbName: string;

  @IsBoolean()
  @Equals(true)
  confirmMasterRestart: boolean;

  @IsOptional()
  @IsString()
  masterHost?: string;

  @IsOptional()
  @IsString()
  haGroup?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(65535)
  haPortId?: number;
}

/**
 * POC: adds a new slave from this host, the HA master (CMS ha_make_slave).
 * slave.host is the new slave's node name (its uname -n), also the address
 * ssh goes to.
 */
export class HaAddSlaveStartDto {
  @IsString()
  @IsNotEmpty()
  dbName: string;

  @ValidateNested()
  @Type(() => HaSshNodeDto)
  slave: HaSshNodeDto;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8)
  @ValidateNested({ each: true })
  @Type(() => HaSshNodeDto)
  replicas?: HaSshNodeDto[];

  @IsOptional()
  @IsString()
  masterHost?: string;

  @IsOptional()
  @IsString()
  replLogHome?: string;

  @IsOptional()
  @IsString()
  masterBackupPath?: string;

  @IsOptional()
  @IsString()
  slaveBackupPath?: string;

  @IsOptional()
  @IsBoolean()
  startHa?: boolean;
}

/** POC: one job (conversion or slave add); offset is how much of the log the screen already has. */
export class HaSlaveJobDto {
  @IsString()
  @IsNotEmpty()
  uuid: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number;
}

/** POC: deletes the old database folders a slave add moved aside on the new slave; needs its password again. */
export class HaSlaveCleanupDto {
  @IsString()
  @IsNotEmpty()
  uuid: string;

  @IsString()
  @IsNotEmpty()
  osPassword: string;
}
