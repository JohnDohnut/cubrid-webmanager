import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as lockfile from 'proper-lockfile';
import { LockError, LockErrorCode } from '@error/lock/lock-error';
import { AppError } from '@error/app-error';
import { HandleLockFsErrors } from '@common';

/**
 * Service for managing file locking operations.
 * 파일 잠금 작업을 관리하는 서비스입니다.
 *
 * Provides functionality for file locking using proper-lockfile library.
 * Handles lock acquisition, release, and stale lock detection.
 *
 * proper-lockfile 라이브러리를 사용하여 파일 잠금 기능을 제공합니다.
 * 잠금 획득, 해제 및 오래된 잠금 감지를 처리합니다.
 *
 * @category Infrastructure Services
 * @since 1.0.0
 */

export interface LockErrorDetails {
    message: string;
    code: string;
    stack?: string;
}

export interface LockServiceDetails {
    lockReleaseFailed?: boolean;
    lockReleaseError?: LockErrorDetails;
    [key: string]: unknown;
}

export interface FileLock {
    filePath: string;
    release: () => Promise<void>;
}

@Injectable()
export class LockService {
    private readonly storageDir = path.join(process.cwd(), 'storage');

    /**
     * Resolves the absolute path for a given filename within the storage directory.
     * 저장소 디렉토리 내에서 주어진 파일 이름에 대한 절대 경로를 확인합니다.
     *
     * @param filename - The name of the file.
     * @returns The absolute path to the file.
     */
    private resolvePath(filename: string) {
        return path.join(this.storageDir, filename);
    }

    /**
     * Acquires an internal file lock for a given filename.
     * 주어진 파일 이름에 대한 내부 파일 잠금을 획득합니다.
     *
     * @param filename - The name of the file to lock.
     * @returns A Promise that resolves with a FileLock object.
     * @throws LockError if the lock cannot be acquired.
     */
    @HandleLockFsErrors()
    private async acquireInternal(filename: string): Promise<FileLock> {
        const filePath = this.resolvePath(filename);
        await fs.mkdir(path.dirname(filePath), { recursive: true });

        try {
            const release = await lockfile.lock(filePath, {
                stale: 30_000,
                realpath: false,
                retries: {
                    retries: 50,  // 재시도 횟수 증가
                    factor: 1.2,  // 재시도 간격 증가율 감소
                    minTimeout: 50,  // 최소 대기 시간 감소
                    maxTimeout: 2000,  // 최대 대기 시간 증가
                },
            });
            return { filePath, release };
        } catch (err: any) {
            throw err;
        }
    }

    /**
     * Acquires a file lock for a given filename.
     * 주어진 파일 이름에 대한 파일 잠금을 획득합니다.
     *
     * @param filename - The name of the file to lock.
     * @returns A Promise that resolves with a FileLock object.
     * @throws LockError if the lock cannot be acquired.
     */
    @HandleLockFsErrors()
    async acquire(filename: string): Promise<FileLock> {
        return this.acquireInternal(filename);
    }

    /**
     * Releases a previously acquired file lock.
     * 이전에 획득한 파일 잠금을 해제합니다.
     *
     * @param lock - The FileLock object to release.
     * @returns A Promise that resolves when the lock is released.
     * @throws LockError if the lock cannot be released.
     */
    @HandleLockFsErrors()
    async release(lock: FileLock): Promise<void> {
        await lock.release();
    }

    /**
     * Executes a work function while holding a file lock.
     * 파일 잠금을 유지하면서 작업 함수를 실행합니다.
     *
     * The lock is automatically acquired before the work and released afterwards.
     * If the work function throws an error, the lock is still released, and the original
     * error is re-thrown, potentially augmented with lock release failure information.
     *
     * 작업 전에 잠금이 자동으로 획득되고 작업 후에 해제됩니다.
     * 작업 함수가 오류를 발생시키더라도 잠금은 해제되며,
     * 원래 오류는 잠금 해제 실패 정보와 함께 다시 throw될 수 있습니다.
     *
     * @param filename - The name of the file to lock.
     * @param work - The asynchronous function to execute while holding the lock.
     * @returns A Promise that resolves with the result of the work function.
     * @throws Any error thrown by the work function or a LockError if lock operations fail.
     */
    async withLock<T>(filename: string, work: () => Promise<T>): Promise<T> {
        const lock = await this.acquire(filename);
        let workerError: any = null;
        let result: T | undefined = undefined;

        try {
            Logger.log("with lock work")
            result = await work();
            return result;
        } catch (error) {
            Logger.log('with lock error');
            workerError = error;
        } finally {
            try {
                await this.release(lock);
            } catch (releaseError) {
                Logger.warn(
                    `Lock release failed for ${filename}: ${releaseError.message}`,
                    releaseError.stack,
                );
            }
            
            if (workerError) {
                throw workerError;
            }
        }
        
        return result!;
    }
}
