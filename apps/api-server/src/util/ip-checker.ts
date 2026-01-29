/**
 * Checks if the given string is a valid IPv4 address.
 *
 * @param ip - The string to check.
 * @returns True if the string is a valid IPv4 address, false otherwise.
 * @category Utilities
 * @since 1.0.0
 */
export function isValidIPv4(ip: string): boolean {
  const IPV4_REGEX =
    /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;
  return IPV4_REGEX.test(ip);
}

/**
 * Checks if the given string is a valid IPv6 address.
 *
 * @param ip - The string to check.
 * @returns True if the string is a valid IPv6 address, false otherwise.
 * @category Utilities
 * @since 1.0.0
 */
export function isValidIPv6(ip: string): boolean {
  const IPV6_REGEX = /^(([0-9a-fA-F]{1,4}):){7}([0-9a-fA-F]{1,4})$/;
  return IPV6_REGEX.test(ip);
}
