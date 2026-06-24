import { CM as CM_EN } from './cmLabels';
import { useCM } from './useCM';

/** @deprecated Prefer useCM() for locale-aware labels */
export const UI = {
  close: CM_EN.close,
  ok: CM_EN.ok,
  cancel: CM_EN.cancel,
  refresh: CM_EN.refresh,
  retry: 'Retry',
  save: 'Save',
  delete: 'Delete',
  yes: 'Yes',
  no: 'No',
};

export { CM_EN as CM, useCM };
