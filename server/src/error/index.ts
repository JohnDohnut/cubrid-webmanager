// Base error class
export * from './app-error';

// Domain-specific errors
export * from './host/host-error';
export * from './repository/repository-error';
export * from './storage/storage-error';
export * from './lock/lock-error';
export * from './user/user-error';
export * from './database/database-error';
export * from './broker/broker-error';
export * from './auth/auth-error';
export * from './cms/cms-error';
export * from './validation/validation-error';
export * from './monitoring/resource-monitoring-error';
export * from './monitoring/resource-monitoring-error-code';

// Global error handling
export * from './global-filter';
