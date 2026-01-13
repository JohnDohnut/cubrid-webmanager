import {
    GetAllSysParamCmsResponse,
    ParsedSystemParameter,
    SystemParametersBySection,
} from '@type/cms-response/get-all-sys-param-cms-response';

/**
 * Parses configuration file content and extracts system parameters.
 * 
 * @param response - CMS response containing configuration data
 * @returns Array of parsed system parameters
 * 
 * @example
 * ```typescript
 * const response: GetAllSysParamCmsResponse = { ... };
 * const params = parseConfigParams(response);
 * // Returns: [
 * //   { key: "data_buffer_size", value: "512M", section: "common", lineNumber: 45 },
 * //   { key: "max_clients", value: "100", section: "common", lineNumber: 52 },
 * //   ...
 * // ]
 * ```
 */
export function parseConfigParams(
    response: GetAllSysParamCmsResponse,
): ParsedSystemParameter[] {
    const params: ParsedSystemParameter[] = [];
    let currentSection = '';

    if (!response.conflist || response.conflist.length === 0) {
        return params;
    }

    const confdata = response.conflist[0]?.confdata || [];

    for (let i = 0; i < confdata.length; i++) {
        const line = confdata[i].trim();

        if (!line) {
            continue;
        }

        if (line.startsWith('#')) {
            continue;
        }

        const sectionMatch = line.match(/^\[([^\]]+)\]$/);
        if (sectionMatch) {
            currentSection = sectionMatch[1];
            continue;
        }

        const paramMatch = line.match(/^([^=]+)=(.*)$/);
        if (paramMatch) {
            const key = paramMatch[1].trim();
            const value = paramMatch[2].trim();

            params.push({
                key,
                value,
                section: currentSection,
                lineNumber: i + 1,
            });
        }
    }

    return params;
}

/**
 * Parses configuration file content and groups parameters by section.
 * 
 * @param response - CMS response containing configuration data
 * @returns System parameters grouped by section
 * 
 * @example
 * ```typescript
 * const response: GetAllSysParamCmsResponse = { ... };
 * const grouped = parseConfigParamsBySection(response);
 * // Returns: {
 * //   "common": {
 * //     "data_buffer_size": "512M",
 * //     "max_clients": "100",
 * //     ...
 * //   },
 * //   "service": {
 * //     "service": "server,broker,manager",
 * //     ...
 * //   },
 * //   ...
 * // }
 * ```
 */
export function parseConfigParamsBySection(
    response: GetAllSysParamCmsResponse,
): SystemParametersBySection {
    const grouped: SystemParametersBySection = {};
    let currentSection = '';

    if (!response.conflist || response.conflist.length === 0) {
        return grouped;
    }

    const confdata = response.conflist[0]?.confdata || [];

    for (const line of confdata) {
        const trimmed = line.trim();

        if (!trimmed) {
            continue;
        }

        if (trimmed.startsWith('#')) {
            continue;
        }

        const sectionMatch = trimmed.match(/^\[([^\]]+)\]$/);
        if (sectionMatch) {
            currentSection = sectionMatch[1];
            if (!grouped[currentSection]) {
                grouped[currentSection] = {};
            }
            continue;
        }

        const paramMatch = trimmed.match(/^([^=]+)=(.*)$/);
        if (paramMatch) {
            const key = paramMatch[1].trim();
            const value = paramMatch[2].trim();

            if (currentSection) {
                if (!grouped[currentSection]) {
                    grouped[currentSection] = {};
                }
                grouped[currentSection][key] = value;
            }
        }
    }

    return grouped;
}

/**
 * Gets a specific parameter value from parsed configuration.
 * 
 * @param grouped - System parameters grouped by section
 * @param section - Section name (optional, searches all sections if not provided)
 * @param key - Parameter key
 * @returns Parameter value or undefined if not found
 * 
 * @example
 * ```typescript
 * const grouped = parseConfigParamsBySection(response);
 * const bufferSize = getConfigParam(grouped, "common", "data_buffer_size");
 * // Returns: "512M"
 * ```
 */
export function getConfigParam(
    grouped: SystemParametersBySection,
    section: string,
    key: string,
): string | undefined {
    return grouped[section]?.[key];
}

/**
 * Gets all parameters from a specific section.
 * 
 * @param grouped - System parameters grouped by section
 * @param section - Section name
 * @returns Object containing all parameters in the section, or undefined if section not found
 * 
 * @example
 * ```typescript
 * const grouped = parseConfigParamsBySection(response);
 * const commonParams = getSectionParams(grouped, "common");
 * // Returns: { data_buffer_size: "512M", max_clients: "100", ... }
 * ```
 */
export function getSectionParams(
    grouped: SystemParametersBySection,
    section: string,
): Record<string, string> | undefined {
    return grouped[section];
}

