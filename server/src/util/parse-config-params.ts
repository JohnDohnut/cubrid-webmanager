import {
    GetAllSysParamCmsResponse,
    ParsedSystemParameter,
    SystemParametersBySection,
} from '@type/cms-response/get-all-sys-param-cms-response';

/**
 * Parses configuration file content and extracts system parameters.
 * 
 * 설정 파일 내용을 파싱하여 시스템 파라미터를 추출합니다.
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

    // Get the first conflist entry (usually there's only one)
    const confdata = response.conflist[0]?.confdata || [];

    for (let i = 0; i < confdata.length; i++) {
        const line = confdata[i].trim();

        // Skip empty lines
        if (!line) {
            continue;
        }

        // Skip comment lines (starting with #)
        if (line.startsWith('#')) {
            continue;
        }

        // Check for section header: [section]
        const sectionMatch = line.match(/^\[([^\]]+)\]$/);
        if (sectionMatch) {
            currentSection = sectionMatch[1];
            continue;
        }

        // Parse key=value format
        const paramMatch = line.match(/^([^=]+)=(.*)$/);
        if (paramMatch) {
            const key = paramMatch[1].trim();
            const value = paramMatch[2].trim();

            params.push({
                key,
                value,
                section: currentSection,
                lineNumber: i + 1, // 1-based line number
            });
        }
    }

    return params;
}

/**
 * Parses configuration file content and groups parameters by section.
 * 
 * 설정 파일 내용을 파싱하여 섹션별로 파라미터를 그룹화합니다.
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

        // Skip empty lines
        if (!trimmed) {
            continue;
        }

        // Skip comment lines (starting with #)
        if (trimmed.startsWith('#')) {
            continue;
        }

        // Check for section header: [section]
        const sectionMatch = trimmed.match(/^\[([^\]]+)\]$/);
        if (sectionMatch) {
            currentSection = sectionMatch[1];
            if (!grouped[currentSection]) {
                grouped[currentSection] = {};
            }
            continue;
        }

        // Parse key=value format
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
 * 파싱된 설정에서 특정 파라미터 값을 가져옵니다.
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
 * 특정 섹션의 모든 파라미터를 가져옵니다.
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

