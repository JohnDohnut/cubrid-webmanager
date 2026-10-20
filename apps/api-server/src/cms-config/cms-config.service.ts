import { HostService } from '@host';
import { Injectable } from '@nestjs/common';
import { ValidationError } from '@error/validation/validation-error';
import { CmsHttpsClientService } from '@cms-https-client/cms-https-client.service';
import {
  GetAddBrokerInfoClientResponse,
  GetEnvClientResponse,
  GetAllSysParamClientResponse,
  ParamdumpClientResponse,
  PlandumpClientResponse,
  SetSysParamClientResponse,
  StatdumpClientResponse,
} from '@api-interfaces';
import {
  SetSysParamCmsRequest,
  BaseCmsRequest,
  GetAddBrokerInfoCmsRequest,
  BrokerSetParamCmsRequest,
} from '@type';
import { GetAddBrokerInfoCmsResponse } from '@type/cms-response/get-add-broker-info-cms-response';
import { GetEnvCmsResponse } from '@type/cms-response/get-env-cms-response';
import { GetAllSysParamCmsRequest } from '@type/cms-request/get-all-sys-param-cms-request';
import { GetAllSysParamCmsResponse } from '@type/cms-response/get-all-sys-param-cms-response';
import { ParamdumpCmsResponse } from '@type/cms-response/paramdump-cms-response';
import { PlandumpCmsResponse } from '@type/cms-response/plandump-cms-response';
import { StatdumpCmsResponse } from '@type/cms-response/statdump-cms-response';
import { LogContentContainer } from '@type/cms-response/view-log-cms-response';
import { BaseCmsResponse } from '@type/cms-response/base-cms-response';
import { BaseService, HandleCmsErrors } from '@common';
import { DatabaseUserService } from '@database/user/database-user.service';
import { resolveHostParamSchemas } from './param-schema.util';
import { ParamSchemaEntry, validateParams, validateEffectiveParams } from '@api-interfaces';

/**
 * Service for managing CMS environment configuration operations.
 *
 * Provides methods to retrieve environment information from CMS hosts
 * including CUBRID version, broker version, database paths, and system information.
 *
 * @category Business Services
 * @since 1.0.0
 */
@Injectable()
export class CmsConfigService extends BaseService {
  constructor(
    protected readonly hostService: HostService,
    protected readonly cmsClient: CmsHttpsClientService,
    private readonly databaseUserService: DatabaseUserService
  ) {
    super(hostService, cmsClient);
  }

  /**
   * Get environment information from a CMS host.
   * Returns domain-only data (CMS envelope removed), plus the
   * database/broker param-editor schema already resolved for this host's
   * CUBRIDVER (see `resolveHostParamSchemas`) — one round trip instead of
   * a separate schema fetch every time a param editor modal opens.
   *
   * @param userId - User ID from JWT
   * @param hostUid - Host unique identifier
   * @returns GetEnvClientResponse Environment information without CMS envelope fields
   * @throws Error if the request fails or CMS status is not success
   */
  @HandleCmsErrors()
  async getEnv(userId: string, hostUid: string): Promise<GetEnvClientResponse> {
    const cmsRequest: BaseCmsRequest = {
      task: 'getenv',
    };

    const response = await this.executeCmsRequest<BaseCmsRequest, GetEnvCmsResponse>(
      userId,
      hostUid,
      cmsRequest
    );

    const domainData = this.extractDomainData(response);
    return {
      ...domainData,
      paramSchemas: resolveHostParamSchemas(domainData.CUBRIDVER),
    };
  }

  /**
   * Get database parameters dump from a CMS host.
   * Returns domain-only data (CMS envelope removed).
   *
   * @param userId - User ID from JWT
   * @param hostUid - Host unique identifier
   * @param dbname - Database name
   * @returns ParamdumpClientResponse Database parameters without CMS envelope fields
   * @throws Error if the request fails or CMS status is not success
   */
  @HandleCmsErrors()
  async getParamDump(
    userId: string,
    hostUid: string,
    dbname: string
  ): Promise<ParamdumpClientResponse> {
    await this.databaseUserService.ensureDbLogin(userId, hostUid, dbname);

    const cmsRequest: BaseCmsRequest & { dbname: string; both: 'n' } = {
      task: 'paramdump',
      both: 'n',
      dbname: dbname,
    };

    const response = await this.executeCmsRequest<
      BaseCmsRequest & { dbname: string; both: 'n' },
      ParamdumpCmsResponse
    >(userId, hostUid, cmsRequest);

    return this.extractDomainData(response);
  }

  /**
   * Get database statistics dump from a CMS host.
   * Returns domain-only data (CMS envelope removed).
   *
   * @param userId - User ID from JWT
   * @param hostUid - Host unique identifier
   * @param dbname - Database name
   * @returns StatdumpClientResponse Database statistics without CMS envelope fields
   * @throws Error if the request fails or CMS status is not success
   */
  @HandleCmsErrors()
  async getStatDump(
    userId: string,
    hostUid: string,
    dbname: string
  ): Promise<StatdumpClientResponse> {
    await this.databaseUserService.ensureDbLogin(userId, hostUid, dbname);

    const cmsRequest: BaseCmsRequest & { dbname: string } = {
      task: 'statdump',
      dbname,
    };

    const response = await this.executeCmsRequest<
      BaseCmsRequest & { dbname: string },
      StatdumpCmsResponse
    >(userId, hostUid, cmsRequest);

    return this.extractDomainData(response);
  }

  /**
   * Query plan / XASL-related dump (`plandump`) from a CMS host.
   * CMS returns lines nested as `log[].line[]`; this flattens to `lines` and `text` for clients.
   *
   * @param userId - User ID from JWT
   * @param hostUid - Host unique identifier
   * @param dbname - Database name
   */
  @HandleCmsErrors()
  async getPlanDump(
    userId: string,
    hostUid: string,
    dbname: string
  ): Promise<PlandumpClientResponse> {
    await this.databaseUserService.ensureDbLogin(userId, hostUid, dbname);

    const cmsRequest: BaseCmsRequest & { dbname: string } = {
      task: 'plandump',
      dbname,
    };

    const response = await this.executeCmsRequest<
      BaseCmsRequest & { dbname: string },
      PlandumpCmsResponse
    >(userId, hostUid, cmsRequest);

    const { log } = this.extractDomainData(response) as { log: LogContentContainer[] };
    const lines = this.flattenCmsLogLines(log);
    return { lines, text: lines.join('\n') };
  }

  /**
   * Get all system parameters from a configuration file on a CMS host.
   * Returns domain-only data (CMS envelope removed).
   *
   * @param userId - User ID from JWT
   * @param hostUid - Host unique identifier
   * @param confname - Configuration file name (e.g., "cubridconf", "broker.conf")
   * @returns GetAllSysParamClientResponse System parameters without CMS envelope fields
   * @throws Error if the request fails or CMS status is not success
   */
  @HandleCmsErrors()
  async getAllSystemParam(
    userId: string,
    hostUid: string,
    confname: string
  ): Promise<GetAllSysParamClientResponse> {
    const cmsRequest: GetAllSysParamCmsRequest = {
      task: 'getallsysparam',
      confname: confname,
    };

    const response = await this.executeCmsRequest<
      GetAllSysParamCmsRequest,
      GetAllSysParamCmsResponse
    >(userId, hostUid, cmsRequest);

    return this.extractDomainData(response);
  }

  /**
   * Entry point for the raw cubridconf/cmconf text editor's save — unlike
   * `setSystemParam` (also called internally by `setDatabaseConfigParams`
   * with an already-guard-checked, freshly-merged `confdata`), this is the
   * only place arbitrary hand-edited conf text reaches the server, so it's
   * the one place that text needs validating before being accepted.
   * cmconf has no schema at all (see `assertValidConfText`'s guard) and is
   * passed straight through unchanged, same as before this existed.
   */
  @HandleCmsErrors()
  async setSystemParamFromRawEdit(
    userId: string,
    hostUid: string,
    confname: string,
    confdata: string[]
  ): Promise<SetSysParamClientResponse> {
    if (confname === 'cubridconf') {
      const { database: schema } = (await this.getEnv(userId, hostUid)).paramSchemas;
      this.assertValidConfText(schema, confdata, ['common']);
    }
    return this.setSystemParam(userId, hostUid, confname, confdata);
  }

  /**
   * Set system parameters in a configuration file on a CMS host.
   * Returns domain-only data (CMS envelope removed).
   *
   * @param userId - User ID from JWT
   * @param hostUid - Host unique identifier
   * @param confname - Configuration file name (e.g., "cubridconf", "broker.conf")
   * @param confdata - Configuration data as array of lines
   * @returns SetSysParamClientResponse Empty object on success (CMS envelope fields removed)
   * @throws Error if the request fails or CMS status is not success
   */
  @HandleCmsErrors()
  async setSystemParam(
    userId: string,
    hostUid: string,
    confname: string,
    confdata: string[]
  ): Promise<SetSysParamClientResponse> {
    const cmsRequest: SetSysParamCmsRequest = {
      task: 'setsysparam',
      confname: confname,
      confdata: confdata,
    };

    await this.executeCmsRequest<SetSysParamCmsRequest, BaseCmsResponse>(
      userId,
      hostUid,
      cmsRequest
    );

    return { success: true };
  }

  /**
   * Get broker config file content from a CMS host (CMS task: getaddbrokerinfo).
   * Returns conflist (config lines) and confname (CMS envelope omitted).
   *
   * @param userId - User ID from JWT
   * @param hostUid - Host unique identifier
   * @param confname - Config name (e.g. "brokerconf")
   * @returns GetAddBrokerInfoClientResponse conflist, confname
   */
  @HandleCmsErrors()
  async getAddBrokerInfo(
    userId: string,
    hostUid: string,
    confname: string
  ): Promise<GetAddBrokerInfoClientResponse> {
    const cmsRequest: GetAddBrokerInfoCmsRequest = {
      task: 'getaddbrokerinfo',
      confname,
    };

    const response = await this.executeCmsRequest<
      GetAddBrokerInfoCmsRequest,
      GetAddBrokerInfoCmsResponse
    >(userId, hostUid, cmsRequest);

    const cms = response as GetAddBrokerInfoCmsResponse;
    return {
      conflist: cms.conflist,
      confname: cms.confname,
    };
  }

  /**
   * Entry point for the raw brokerconf text editor's save — same reasoning
   * as `setSystemParamFromRawEdit`: `setBrokerParam` is also called
   * internally by `setBrokerConfigParams` with already-guard-checked
   * `confdata`, so this is the one place hand-edited broker.conf text
   * needs validating before being accepted.
   */
  @HandleCmsErrors()
  async setBrokerParamFromRawEdit(
    userId: string,
    hostUid: string,
    confdata: string[]
  ): Promise<SetSysParamClientResponse> {
    const { broker: schema } = (await this.getEnv(userId, hostUid)).paramSchemas;
    this.assertValidConfText(schema, confdata, ['broker']);
    return this.setBrokerParam(userId, hostUid, confdata);
  }

  /**
   * Set broker configuration file content on a CMS host (CMS task: broker_setparam).
   *
   * @param userId - User ID from JWT
   * @param hostUid - Host unique identifier
   * @param confdata - Configuration data as array of lines (broker config content)
   * @returns SetSysParamClientResponse Empty object on success
   */
  @HandleCmsErrors()
  async setBrokerParam(
    userId: string,
    hostUid: string,
    confdata: string[]
  ): Promise<SetSysParamClientResponse> {
    const cmsRequest: BrokerSetParamCmsRequest = {
      task: 'broker_setparam',
      confdata,
    };

    await this.executeCmsRequest<
      BrokerSetParamCmsRequest,
      BaseCmsResponse
    >(userId, hostUid, cmsRequest);

    return { success: true };
  }

  /**
   * Set a subset of cubrid.conf parameters for a database (or [common],
   * when `dbname` is omitted). Fetches the current conf, merges `params`
   * into the target section (preserving every other line verbatim — other
   * sections, comments, blank lines, and any untouched key in the same
   * section), and writes the merged result back. This replaces the old
   * flow where the client built the full conf-file text itself and sent
   * it as `confdata: string[]`.
   *
   * @param userId - User ID from JWT
   * @param hostUid - Host unique identifier
   * @param dbname - Target database, or undefined for the [common] section
   * @param params - Only the keys that changed; values are stringified as-is
   * @returns SetSysParamClientResponse Empty object on success
   */
  @HandleCmsErrors()
  async setDatabaseConfigParams(
    userId: string,
    hostUid: string,
    dbname: string | undefined,
    params: Record<string, string | number>
  ): Promise<SetSysParamClientResponse> {
    const { database: schema } = (await this.getEnv(userId, hostUid)).paramSchemas;
    this.assertKnownParams(schema, params);

    const current = await this.getAllSystemParam(userId, hostUid, 'cubridconf');
    const lines = current.conflist?.[0]?.confdata ?? [];
    const targetSectionName = dbname ? `@${dbname.toLowerCase()}` : 'common';
    const nextLines = this.mergeNamedSection(
      lines,
      (line) => line.trim().toLowerCase() === `[${targetSectionName}]`,
      `[${targetSectionName}]`,
      params
    );
    // Checked on the MERGED result, not the raw diff — required/
    // commonOnly/instanceOnly/crossField all need the section's full
    // effective state (e.g. a cross-field check needs both sides' real
    // values even if only one was touched by this request), which a
    // partial diff alone can't provide. See validateEffectiveParams's own
    // doc comment — this is the same rule engine every other save path
    // (table UI, raw editor, raw editor's server-side re-check) uses.
    this.assertValidSection(schema, nextLines, targetSectionName, {
      isCommonSection: !dbname,
      commonSectionLabel: 'common',
    });
    return this.setSystemParam(userId, hostUid, 'cubridconf', nextLines);
  }

  /**
   * Set a subset of broker.conf parameters for one broker, or for the
   * shared `[broker]` section when `brokerName` is omitted. Same
   * fetch-merge-write shape as `setDatabaseConfigParams`, but — unlike
   * cubrid.conf's `[common]`/`[@dbname]` — the engine itself does NOT
   * inherit `[broker]` into `[%name]` sections at all (ini_parser.c does
   * exact "section:key" lookups, no section fallback; broker_config.c
   * reads the 5 commonOnly keys via the literal section name "broker"
   * and everything else via each broker's own `[%name]` section only).
   * So `[broker]` only has any real effect for keys flagged `commonOnly`
   * in BROKER_PARAM_SCHEMA — enforced below, same as `instanceOnly` keys
   * (BROKER_PORT, APPL_SERVER_SHM_ID) being rejected from `[broker]`.
   *
   * @param userId - User ID from JWT
   * @param hostUid - Host unique identifier
   * @param brokerName - Target broker's section name, or undefined for [broker]
   * @param params - Only the keys that changed; values are stringified as-is
   * @returns SetSysParamClientResponse Empty object on success
   */
  @HandleCmsErrors()
  async setBrokerConfigParams(
    userId: string,
    hostUid: string,
    brokerName: string | undefined,
    params: Record<string, string | number>
  ): Promise<SetSysParamClientResponse> {
    const { broker: schema } = (await this.getEnv(userId, hostUid)).paramSchemas;
    this.assertKnownParams(schema, params);

    const current = await this.getAddBrokerInfo(userId, hostUid, 'brokerconf');
    const lines = current.conflist?.[0]?.confdata ?? [];
    const sectionName = brokerName ? `[%${brokerName}]` : '[broker]';
    const nextLines = this.mergeNamedSection(
      lines,
      (line) => {
        if (!brokerName) {
          return line.trim().toLowerCase() === '[broker]';
        }
        const match = line.trim().match(/^\[%?(.+)\]$/);
        return !!match && match[1].toLowerCase() === brokerName.toLowerCase();
      },
      sectionName,
      params
    );
    // See setDatabaseConfigParams's equivalent comment — checked on the
    // merged result so required/section-placement/crossField all see the
    // section's full effective state, not just this request's own diff.
    this.assertValidSection(schema, nextLines, brokerName ? brokerName.toLowerCase() : 'broker', {
      isCommonSection: !brokerName,
      commonSectionLabel: 'broker',
    });
    return this.setBrokerParam(userId, hostUid, nextLines);
  }

  /**
   * Validates `params` against `schema` (this host's own version-resolved
   * database/broker schema — see `resolveHostParamSchemas`) and throws a
   * 400 naming every problem key if any value fails its guard, or if a
   * key isn't in the schema at all (nothing to validate it against, and
   * nowhere to write it either — most likely a param that doesn't exist
   * on this host's engine version). This is the only validation these two
   * endpoints get; there's no per-field class-validator DTO to fall back
   * on, by design — see `setDatabaseConfigParams`'s class-level comment.
   *
   * Deliberately narrow: only rejects a malformed body or a key this
   * host's schema doesn't recognize at all. Everything else (guard
   * values, required/commonOnly/instanceOnly/crossField) is checked by
   * `assertValidSection` AFTER the merge, against the section's full
   * effective state — a per-key check here on the raw diff alone can't
   * see that (e.g. a cross-field rule needs both sides' real values, and
   * omitting a key from `params` must stay a no-op, not read as "blank").
   */
  private assertKnownParams(schema: ParamSchemaEntry[], params: Record<string, string | number>): void {
    // A malformed body (e.g. `params` missing or not an object) must fail
    // with a clear, specific message here — not reach Object.entries
    // inside validateParams and crash as an opaque, unhelpful 500.
    if (params === null || typeof params !== 'object' || Array.isArray(params)) {
      throw ValidationError.InvalidFieldFormat('params', undefined, {
        message: '"params" must be an object of paramKey -> value.',
      });
    }
    const { unknownKeys } = validateParams(schema, params);
    if (unknownKeys.length > 0) {
      // A plain NestJS HttpException here would get swallowed by
      // @HandleCmsErrors() — it only passes through this codebase's own
      // AppError subclasses unchanged, wrapping anything else into an
      // opaque 500 (confirmed live: the specific validation message was
      // lost behind a generic "CMS request failed" until this was fixed).
      // `message` in additionalData is what actually reaches the client
      // (getPublicClientErrorMessage prefers it over the generic
      // per-code copy) — without it the specific key/reason list here
      // would be silently replaced by "The field format is invalid."
      throw ValidationError.InvalidFieldFormat('params', undefined, {
        message: `Invalid parameter(s): ${unknownKeys.map((key) => `${key}: not supported on this host's engine version`).join('; ')}`,
      });
    }
  }

  /**
   * Post-merge check shared by both typed save endpoints: extracts
   * `targetSectionName`'s effective key -> value map out of `mergedLines`
   * (defaults filled in for anything the section doesn't mention) and
   * runs it through the same rule engine every other validation surface
   * uses (`validateEffectiveParams` — required/guard/section-placement/
   * cross-field). Throws naming every problem key if any fail.
   */
  private assertValidSection(
    schema: ParamSchemaEntry[],
    mergedLines: string[],
    targetSectionName: string,
    options: { isCommonSection: boolean; commonSectionLabel: string }
  ): void {
    const effectiveParams = this.extractEffectiveSectionParams(mergedLines, targetSectionName, schema);
    const errors = validateEffectiveParams(schema, effectiveParams, options);
    if (Object.keys(errors).length > 0) {
      throw ValidationError.InvalidFieldFormat('params', undefined, {
        message: `Invalid parameter value(s): ${Object.entries(errors).map(([key, reason]) => `${key}: ${reason}`).join('; ')}`,
      });
    }
  }

  /**
   * Splits raw conf text into sections of `{key, value, lineNo}` entries,
   * same shape/semantics as the frontend's identical `parseConfSections`
   * helper in CubridConfigEditor.jsx/BrokerConfigEditor.jsx (kept in sync
   * by hand — this one only exists to re-check what that one already
   * checked, in case a request reaches this endpoint some other way).
   * `name` is `null` for any content before the first `[...]` header.
   */
  private parseConfTextSections(
    lines: string[]
  ): { name: string | null; entries: { key: string; value: string; lineNo: number }[] }[] {
    const sections: { name: string | null; entries: { key: string; value: string; lineNo: number }[] }[] = [];
    let current: { name: string | null; entries: { key: string; value: string; lineNo: number }[] } = {
      name: null,
      entries: [],
    };
    lines.forEach((line, i) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const sectionMatch = trimmed.match(/^\[%?(.+)\]$/);
      if (sectionMatch) {
        if (current.name !== null || current.entries.length > 0) sections.push(current);
        current = { name: sectionMatch[1].toLowerCase(), entries: [] };
        return;
      }
      const eq = trimmed.indexOf('=');
      if (eq === -1) return;
      current.entries.push({ key: trimmed.slice(0, eq).trim(), value: trimmed.slice(eq + 1).trim(), lineNo: i + 1 });
    });
    if (current.entries.length > 0) sections.push(current);
    return sections;
  }

  /**
   * Guard-checks raw, hand-edited conf text (the free-text editor's save
   * path) against `schema` — the one validation surface the typed
   * endpoints' post-merge check doesn't cover, since that only ever sees
   * one known target section. Here the text can touch any number of
   * sections at once, so each one is checked independently through the
   * same shared rule engine (`validateEffectiveParams` — required/guard/
   * section-placement/cross-field, identical to every other call site).
   * `commonSectionNames` is `['common']` for cubrid.conf or `['broker']`
   * for broker.conf — the one section name that counts as "shared,"
   * everything else is a per-instance section. An unrecognized key is
   * left alone (not every key has schema coverage; see
   * `setSystemParamFromRawEdit`'s cmconf case for the extreme of that).
   */
  private assertValidConfText(schema: ParamSchemaEntry[], lines: string[], commonSectionNames: string[]): void {
    const schemaByKey = new Map(schema.map((entry) => [entry.key.toLowerCase(), entry]));
    const schemaDefaults = Object.fromEntries(schema.map((entry) => [entry.key, entry.default ?? '']));
    const problems: string[] = [];
    for (const section of this.parseConfTextSections(lines)) {
      const isCommonSection = section.name === null || commonSectionNames.includes(section.name);
      const sectionValues: Record<string, string> = {};
      const sectionLineNos: Record<string, number> = {};
      for (const { key, value, lineNo } of section.entries) {
        const entry = schemaByKey.get(key.toLowerCase());
        if (!entry) continue;
        sectionValues[entry.key] = value;
        sectionLineNos[entry.key] = lineNo;
      }
      const sectionErrors = validateEffectiveParams(
        schema,
        { ...schemaDefaults, ...sectionValues },
        { isCommonSection, commonSectionLabel: commonSectionNames[0] }
      );
      for (const [key, reason] of Object.entries(sectionErrors)) {
        const lineNo = sectionLineNos[key];
        problems.push(
          lineNo
            ? `Line ${lineNo}: ${key} — ${reason}`
            : `Section [${section.name ?? commonSectionNames[0]}]: ${key} — ${reason}`
        );
      }
    }
    if (problems.length > 0) {
      throw ValidationError.InvalidFieldFormat('confdata', undefined, {
        message: `Invalid configuration value(s): ${problems.join('; ')}`,
      });
    }
  }

  /**
   * Finds `targetSectionName` (already in `parseConfTextSections`' own
   * lowercased, `@`/`%`-stripped-or-kept convention — e.g. `'common'`,
   * `'@dbname'`, `'broker'`, or a bare broker name) among `lines` and
   * returns its effective key -> value map, merged with `schema`'s own
   * defaults for anything the section doesn't mention at all. Returns
   * pure defaults if the section doesn't exist yet (e.g. a brand new
   * `[@dbname]` about to be created by this same save).
   */
  private extractEffectiveSectionParams(
    lines: string[],
    targetSectionName: string,
    schema: ParamSchemaEntry[]
  ): Record<string, string> {
    const schemaDefaults = Object.fromEntries(schema.map((entry) => [entry.key, entry.default ?? '']));
    const schemaByKey = new Map(schema.map((entry) => [entry.key.toLowerCase(), entry]));
    const section = this.parseConfTextSections(lines).find((s) => s.name === targetSectionName);
    if (!section) return schemaDefaults;
    const values: Record<string, string> = {};
    for (const { key, value } of section.entries) {
      const entry = schemaByKey.get(key.toLowerCase());
      if (entry) values[entry.key] = value;
    }
    return { ...schemaDefaults, ...values };
  }

  /**
   * Shared merge primitive for both conf writers above: finds the section
   * whose header line satisfies `isTargetHeader` (creating it at the end
   * of the file if it doesn't exist yet), then for each key in `params`
   * either overwrites that key's existing `key=value` line within the
   * section (matched case-insensitively, comments skipped) or appends a
   * new line for it. Every other line — other sections, comments, blank
   * lines, and any key in this section NOT present in `params` — is left
   * completely untouched, so blank-line count/position and overall line
   * order are preserved exactly as-is.
   *
   * Key lookup is a single O(section-length) index pass up front (a
   * lowercased key -> line-index(es) map), then O(1) per param — not a
   * fresh scan of the section for every param — since both conf files can
   * run into the hundreds of lines.
   *
   * That same index also surfaces pre-existing duplicate `key=value`
   * lines for a key (a malformed-but-real possibility in hand-edited conf
   * files). The old first-match-wins scan would silently update only the
   * first occurrence and leave a stale duplicate behind — and since
   * CMS's own conf parser isn't guaranteed to agree on which occurrence
   * wins, that stale duplicate could make the save appear to succeed while
   * the engine keeps using the old value. All occurrences are updated
   * together instead, with a warning logged so the underlying duplicate
   * (a pre-existing data issue, not something this merge introduces) stays
   * visible.
   *
   * Deliberately add/update-only — there's no way to express "delete this
   * line" through `params` (a key just absent from it is left alone, not
   * removed), so a param once explicitly set can't be reverted back to an
   * implicit engine default through the typed table endpoints. That's a
   * real gap but an intentionally unfixed one: the raw conf editor
   * (CubridConfigEditor/BrokerConfigEditor) already deletes a line exactly
   * the way a text editor should — the user removes it and the unchanged
   * `confdata` is saved verbatim (see `setSystemParamFromRawEdit`) — so
   * building delete semantics into this merge model and the table UI on
   * top of it would duplicate a capability that already exists for free.
   */
  private mergeNamedSection(
    lines: string[],
    isTargetHeader: (line: string) => boolean,
    newHeaderLine: string,
    params: Record<string, string | number>
  ): string[] {
    let sectionStartIndex = -1;
    let sectionEndIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (isTargetHeader(lines[i])) {
        sectionStartIndex = i;
        for (let j = i + 1; j < lines.length; j++) {
          const trimmed = lines[j].trim();
          if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
            sectionEndIndex = j;
            break;
          }
        }
        if (sectionEndIndex === -1) sectionEndIndex = lines.length;
        break;
      }
    }

    let workingLines = lines;
    if (sectionStartIndex === -1) {
      workingLines = [...lines, '', newHeaderLine];
      sectionStartIndex = workingLines.length - 1;
      sectionEndIndex = workingLines.length;
    }

    const sectionLines = workingLines.slice(sectionStartIndex + 1, sectionEndIndex);
    const otherBefore = workingLines.slice(0, sectionStartIndex + 1);
    const otherAfter = workingLines.slice(sectionEndIndex);
    const updatedSection = [...sectionLines];

    const keyLineIndices = new Map<string, number[]>();
    for (let i = 0; i < updatedSection.length; i++) {
      const trimmed = updatedSection[i].trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim().toLowerCase();
      const indices = keyLineIndices.get(key);
      if (indices) indices.push(i);
      else keyLineIndices.set(key, [i]);
    }

    for (const [key, value] of Object.entries(params)) {
      const indices = keyLineIndices.get(key.toLowerCase());
      if (!indices) {
        updatedSection.push(`${key}=${value}`);
        continue;
      }
      if (indices.length > 1) {
        this.logger.warn(
          `Duplicate key "${key}" found in conf section (${indices.length} occurrences) — updating all to keep the file consistent.`,
          'CmsConfigService'
        );
      }
      for (const i of indices) {
        updatedSection[i] = `${key}=${value}`;
      }
    }

    return [...otherBefore, ...updatedSection, ...otherAfter];
  }

  private flattenCmsLogLines(log: LogContentContainer[] | undefined): string[] {
    const lines: string[] = [];
    for (const block of log ?? []) {
      if (Array.isArray(block?.line)) {
        lines.push(...block.line);
      }
    }
    return lines;
  }
}
