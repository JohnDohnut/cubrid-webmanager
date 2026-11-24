import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';

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
 * POC (HA slave setup): ssh connection check from this host to the master.
 * The password goes only into the request with the fingerprint the user
 * confirmed; it is not saved, and the log hides it (its key contains "pass").
 */
export class HaSshCheckDto {
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

  @IsOptional()
  @IsString()
  osPassword?: string;

  @IsOptional()
  @IsString()
  hostKeyFingerprint?: string;
}

/** POC: one replica of the HA group, checked over ssh like the master. */
export class HaReplicaDto {
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
 * POC: the slave setup this host's CMS runs itself (master side over ssh,
 * this host locally). masterHost is the master's node name in
 * ha_node_list, which this host must resolve; ssh goes to it.
 */
export class HaMakeSlaveStartDto {
  @IsString()
  @IsNotEmpty()
  dbName: string;

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

  @IsString()
  @IsNotEmpty()
  hostKeyFingerprint: string;

  @IsOptional()
  @IsString()
  slaveHost?: string;

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

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8)
  @ValidateNested({ each: true })
  @Type(() => HaReplicaDto)
  replicas?: HaReplicaDto[];
}

/** POC: one running slave setup; offset is how much of the log the screen already has. */
export class HaMakeSlaveJobDto {
  @IsString()
  @IsNotEmpty()
  uuid: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number;
}
