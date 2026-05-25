export const DESKTOP_APP_ORIGIN = 'app://.';

export function resolveDesktopAllowedOrigin(): string {
  const override = process.env.CWM_DESKTOP_ALLOWED_ORIGIN?.trim();
  if (override) {
    return override;
  }

  return [DESKTOP_APP_ORIGIN, 'app://'].join(',');
}
