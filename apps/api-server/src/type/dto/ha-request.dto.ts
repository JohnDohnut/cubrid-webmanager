import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

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
 * POC (HA slave setup): the master host this host's CMS connects to over ssh.
 * The password goes only into this request; it is not saved, and the log
 * hides it (its key contains "pass").
 */
export class HaSshTargetDto {
  @IsString()
  @IsNotEmpty()
  masterHost: string;

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
}

/** POC: ssh connection check, optionally with the host key fingerprint the user accepted. */
export class HaSshCheckDto extends HaSshTargetDto {
  @IsOptional()
  @IsString()
  hostKeyFingerprint?: string;
}

/** POC: ha_make_slavedb.sh run with the script's own variables. */
export class HaMakeSlaveStartDto extends HaSshTargetDto {
  @IsString()
  @IsNotEmpty()
  hostKeyFingerprint: string;

  @IsString()
  @IsNotEmpty()
  targetHost: string;

  @IsString()
  @IsNotEmpty()
  dbName: string;

  @IsOptional()
  @IsString()
  replLogHome?: string;

  @IsOptional()
  @IsString()
  backupDestPath?: string;

  @IsOptional()
  @IsString()
  backupOption?: string;

  @IsOptional()
  @IsString()
  restoreOption?: string;

  @IsOptional()
  @IsString()
  scpOption?: string;
}

/** POC: one running ha_make_slavedb.sh job; offset is how much output the screen already has. */
export class HaMakeSlaveJobDto {
  @IsString()
  @IsNotEmpty()
  uuid: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number;
}
