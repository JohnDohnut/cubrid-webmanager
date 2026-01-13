import { Test, TestingModule } from '@nestjs/testing';
import { StorageService } from './storage.service';
import { LockService } from '@lock/lock.service';
import * as fs from 'fs/promises';
import { resolveUserFilePath } from '@util/resolve-storage-path';
import { StorageError } from '@error/storage/storage-error';

// Mock dependencies
jest.mock('fs/promises');
jest.mock('@lock/lock.service');
jest.mock('@util/resolve-storage-path', () => ({
    ...jest.requireActual('@util/resolve-storage-path'),
    resolveUserFilePath: jest.fn((filename) => `mock/path/to/${filename}`),
    getStoragePath: jest.fn(() => 'mock/path'),
}));

describe('StorageService', () => {
    let service: StorageService;
    let lockService: jest.Mocked<LockService>;
    let mockedFs: jest.Mocked<typeof fs>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [StorageService, LockService],
        }).compile();

        service = module.get<StorageService>(StorageService);
        lockService = module.get(LockService);
        mockedFs = fs as jest.Mocked<typeof fs>;

        // Mock implementation of withLock to just run the worker function
        lockService.withLock.mockImplementation(
            async (filename: string, work: () => Promise<any>) => {
                return work();
            },
        );

        // Reset fs mocks
        Object.values(mockedFs).forEach((mockFn) => {
            if (typeof mockFn === 'function') {
                mockFn.mockReset();
            }
        });
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('Unsafe methods (without lock)', () => {
        describe('readUnsafe', () => {
            it('should read and return file content', async () => {
                const content = 'file content';
                mockedFs.readFile.mockResolvedValue(content);
                const result = await service.readUnsafe('test.txt');
                expect(mockedFs.readFile).toHaveBeenCalledWith(
                    'mock/path/to/test.txt',
                    'utf-8',
                );
                expect(result).toBe(content);
            });

            it('should throw if fs.readFile rejects', async () => {
                mockedFs.readFile.mockRejectedValue(new Error('Read error'));
                await expect(service.readUnsafe('test.txt')).rejects.toThrow();
            });
        });

        describe('writeUnsafe', () => {
            it('should perform an atomic write (write to tmp, then rename)', async () => {
                const data = 'new data';
                mockedFs.writeFile.mockResolvedValue(undefined);
                mockedFs.rename.mockResolvedValue(undefined);
                mockedFs.rm.mockResolvedValue(undefined);

                await service.writeUnsafe('test.txt', data);

                expect(mockedFs.writeFile).toHaveBeenCalledWith(
                    expect.stringContaining('.tmp'),
                    data,
                    'utf-8',
                );
                expect(mockedFs.rename).toHaveBeenCalledWith(
                    expect.stringContaining('.tmp'),
                    'mock/path/to/test.txt',
                );
                expect(mockedFs.rm).toHaveBeenCalledWith(
                    expect.stringContaining('.tmp'),
                    { force: true },
                );
            });
        });

        describe('createUnsafe', () => {
            it('should create an empty file with "wx" flag', async () => {
                mockedFs.writeFile.mockResolvedValue(undefined);
                await service.createUnsafe('new-file.txt');
                expect(mockedFs.writeFile).toHaveBeenCalledWith(
                    'mock/path/to/new-file.txt',
                    '',
                    { flag: 'wx' },
                );
            });
        });

        describe('createAndWriteUnsafe', () => {
            it('should create and write to a file with "wx" flag', async () => {
                const data = 'initial data';
                mockedFs.writeFile.mockResolvedValue(undefined);
                await service.createAndWriteUnsafe('new-file.txt', data);
                expect(mockedFs.writeFile).toHaveBeenCalledWith(
                    'mock/path/to/new-file.txt',
                    data,
                    { flag: 'wx', encoding: 'utf-8' },
                );
            });
        });

        describe('deleteUnsafe', () => {
             it('should delete a file using fs.rm', async () => {
                mockedFs.rm.mockResolvedValue(undefined);
                await service.deleteUnsafe('test.txt');
                expect(mockedFs.rm).toHaveBeenCalledWith(
                    'mock/path/to/test.txt',
                    { force: true },
                );
            });
        });
    });

    describe('Safe methods (with lock)', () => {
        it('read() should call lockService.withLock and readUnsafe', async () => {
            const readUnsafeSpy = jest
                .spyOn(service, 'readUnsafe')
                .mockResolvedValue('data');

            const result = await service.read('test.txt');

            expect(lockService.withLock).toHaveBeenCalledWith(
                'test.txt',
                expect.any(Function),
            );
            expect(readUnsafeSpy).toHaveBeenCalled();
            expect(result).toBe('data');
        });

        it('write() should call lockService.withLock and writeUnsafe', async () => {
            const writeUnsafeSpy = jest
                .spyOn(service, 'writeUnsafe')
                .mockResolvedValue(undefined);

            await service.write('test.txt', 'data');

            expect(lockService.withLock).toHaveBeenCalledWith(
                'test.txt',
                expect.any(Function),
            );
            expect(writeUnsafeSpy).toHaveBeenCalledWith('test.txt', 'data');
        });

        it('create() should call lockService.withLock and createUnsafe', async () => {
            const createUnsafeSpy = jest
                .spyOn(service, 'createUnsafe')
                .mockResolvedValue(undefined);

            await service.create('test.txt');

            expect(lockService.withLock).toHaveBeenCalledWith(
                'test.txt',
                expect.any(Function),
            );
            expect(createUnsafeSpy).toHaveBeenCalledWith('test.txt');
        });

        it('createAndWrite() should call lockService.withLock and createAndWriteUnsafe', async () => {
            const createAndWriteUnsafeSpy = jest
                .spyOn(service, 'createAndWriteUnsafe')
                .mockResolvedValue(undefined);

            await service.createAndWrite('test.txt', 'data');

            expect(lockService.withLock).toHaveBeenCalledWith(
                'test.txt',
                expect.any(Function),
            );
            expect(createAndWriteUnsafeSpy).toHaveBeenCalledWith(
                'test.txt',
                'data',
            );
        });

        it('delete() should call lockService.withLock and deleteUnsafe', async () => {
            const deleteUnsafeSpy = jest
                .spyOn(service, 'deleteUnsafe')
                .mockResolvedValue(undefined);

            await service.delete('test.txt');

            expect(lockService.withLock).toHaveBeenCalledWith(
                'test.txt',
                expect.any(Function),
            );
            expect(deleteUnsafeSpy).toHaveBeenCalledWith('test.txt');
        });
    });
});