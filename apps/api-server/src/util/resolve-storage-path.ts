import * as path from 'path';

/**
 * Determines the appropriate storage path based on the execution environment.
 * If running as a `pkg` executable, it uses the executable's directory.
 * Otherwise (development mode), it uses the project's root directory.
 *
 * 실행 환경에 따라 적절한 저장소 경로를 결정합니다.
 * `pkg` 실행 파일로 실행 중인 경우, 실행 파일의 디렉토리를 사용합니다.
 * 그렇지 않은 경우(개발 모드), 프로젝트의 루트 디렉토리를 사용합니다.
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
 * 저장소 디렉토리 내의 사용자 특정 파일에 대한 절대 경로를 확인합니다.
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
