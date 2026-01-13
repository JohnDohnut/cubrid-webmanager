import * as path from 'path';

/**
 * Determines the appropriate storage path based on the execution environment.
 * If running as a `pkg` executable, it uses the executable's directory.
 * Otherwise (development mode), it uses the project's root directory.
 *
 * @returns The absolute path to the storage directory.
 * @category Utilities
 * @since 1.0.0
 */
export function getStoragePath() {
    const isPkg = !!(process as any).pkg;
    
    if (isPkg) {
        const executableDir = path.dirname(process.execPath);
        return path.join(executableDir, 'storage');
    } else {
        return path.resolve(__dirname, '..', '..', 'storage');
    }
}

/**
 * Resolves the absolute path for a user-specific file within the storage directory.
 *
 * @param filename - The name of the user's file.
 * @returns The absolute path to the user's file.
 * @category Utilities
 * @since 1.0.0
 */
export function resolveUserFilePath(filename: string) {
    const storageDir = getStoragePath();
    return path.join(storageDir, filename);
}
