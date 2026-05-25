import { CmsError } from '@error/cms/cms-error';
import { Logger } from '@nestjs/common';

/**
 * Checks if a CMS response indicates a failure (status === 'fail').
 *
 * @param response - The CMS response to check
 * @returns true if the response indicates a failure
 */
export function isCmsStatusFailure(response: any): boolean {
  if (!response || typeof response !== 'object') {
    return false;
  }

  if (!('status' in response)) {
    return false;
  }

  return response.status !== 'success';
}

/**
 * Checks a CMS response for failure status and throws CmsError.RequestFailed if found.
 * This is a helper function that can be used directly in service methods.
 *
 * @param response - The CMS response to check
 * @param errorMessage - Optional custom error message
 * @throws CmsError.RequestFailed if the response status is 'fail'
 * @example
 * ```typescript
 * async getBrokerLogList(...): Promise<GetBrokerLogListClientResponse> {
 *   const cmsResponse = await this.client.forwardAuthenticated(...);
 *   checkCmsStatusError(cmsResponse);  // Automatically checks status === 'fail'
 *   // ... rest of processing
 * }
 * ```
 */
export function checkCmsStatusError(response: any, errorMessage?: string): void {
  if (!isCmsStatusFailure(response)) {
    return;
  }

  const noteMessage = isMeaningfulCmsNote(response.note) ? String(response.note).trim() : undefined;
  const lineMessage = Array.isArray(response.line)
    ? response.line.map((line: unknown) => String(line)).join('\n').trim()
    : '';
  const message =
    errorMessage ||
    noteMessage ||
    (lineMessage !== '' ? lineMessage : undefined) ||
    'CMS request failed';

  Logger.log(message);
  throw CmsError.RequestFailed({
    message,
    response,
  });
}

function isMeaningfulCmsNote(note: unknown): boolean {
  if (note === undefined || note === null) {
    return false;
  }

  const value = String(note).trim();
  if (!value) {
    return false;
  }

  return value.toLowerCase() !== 'none';
}
