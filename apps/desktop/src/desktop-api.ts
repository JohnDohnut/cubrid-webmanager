export type DesktopConfig = {
  apiBaseUrl: string;
  clearAuthOnExit: boolean;
};

declare global {
  interface Window {
    desktopConfig?: DesktopConfig;
  }
}

export {};
