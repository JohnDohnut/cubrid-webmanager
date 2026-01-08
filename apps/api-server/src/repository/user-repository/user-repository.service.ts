import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import { User, UserDTO } from '@type/index';

import { LockService } from '@lock/lock.service';
import { EncryptionService } from '@security/encryption/encryption.service';
import { PasswordService } from '@security/password/password.service';
import { StorageService } from '@storage/storage.service';

import { HandleUserRepoErrors } from '@decorators/handle-user-repo-errors.decorator';

/**
 * Service for user data repository operations.
 * 사용자 데이터 리포지토리 작업을 위한 서비스입니다.
 *
 * Provides low-level data access operations for user management including
 * CRUD operations, file-based storage, and data persistence.
 *
 * CRUD 작업, 파일 기반 저장소 및 데이터 영속성을 포함한
 * 사용자 관리를 위한 하위 수준 데이터 액세스 작업을 제공합니다.
 *
 * @category Infrastructure Services
 * @since 1.0.0
 */
@Injectable()
export class UserRepositoryService {
    constructor(
        private readonly encryptionService: EncryptionService,
        private readonly passwordService: PasswordService,
        private readonly storageService: StorageService,
        private readonly lockService: LockService,
    ) {}

    /**
     * Loads a user by their ID.
     * 사용자 ID로 사용자를 로드합니다.
     *
     * The ID is hashed before being used to read from storage.
     * ID는 저장소에서 읽기 전에 해싱됩니다.
     *
     * @param id - The user's ID.
     * @returns A Promise that resolves with the User object.
     * @throws UserError.UserNotFound if the user file is not found.
     */
    @HandleUserRepoErrors()
    async loadUserById(id: string): Promise<User> {
        const hashedId = this.encryptionService.getHashedValue(id);
        const encrypted = await this.storageService.read(hashedId);
        const userJson: User = JSON.parse(
            this.encryptionService.decryptValue(encrypted),
        );
        return userJson;
    }

    /**
     * Creates a new user.
     * 새 사용자를 생성합니다.
     *
     * The user's ID is hashed, and the user data is encrypted before being written to storage.
     * 사용자 ID는 해싱되고, 사용자 데이터는 저장소에 쓰기 전에 암호화됩니다.
     *
     * @param dto - The UserDTO containing the user's ID and password.
     * @returns A Promise that resolves when the user is created.
     * @throws UserError.UserAlreadyExists if a user with the given ID already exists.
     */
    @HandleUserRepoErrors()
    async createUser(dto: UserDTO): Promise<void> {
        const hashedId = this.encryptionService.getHashedValue(dto.id);
        const uuid = uuidv4();

        const userJson: User = {
            uuid,
            id: dto.id,
            password: await this.passwordService.getHashedValue(dto.password),
            department: 'default',
            host_list: {},
            ha_mon_list: {},
            resource_mon_list: {},
            user_preference : {dashboardInterval : 0, brokerStatusInterval : 0},
        };
        await this.storageService.createAndWrite(
            hashedId,
            this.encryptionService.encryptValue(JSON.stringify(userJson)),
        );
    }

    /**
     * Deletes a user by their ID.
     * 사용자 ID로 사용자를 삭제합니다.
     *
     * The user's ID is hashed before being used to delete from storage.
     * 사용자 ID는 저장소에서 삭제하기 전에 해싱됩니다.
     *
     * @param id - The user's ID.
     * @returns A Promise that resolves when the user is deleted.
     * @throws UserError.UserNotFound if the user file is not found.
     */
    @HandleUserRepoErrors()
    async deleteUser(id: string): Promise<void> {
        const hashedId = this.encryptionService.getHashedValue(id);
        await this.storageService.delete(hashedId);
    }

    /**
     * Updates a user's data.
     * 사용자 데이터를 업데이트합니다.
     *
     * The user's ID is hashed, and the updated user data is encrypted before being written to storage.
     * 사용자 ID는 해싱되고, 업데이트된 사용자 데이터는 저장소에 쓰기 전에 암호화됩니다.
     *
     * @param id - The user's ID.
     * @param userJson - The updated User object.
     * @returns A Promise that resolves when the user is updated.
     * @throws UserError.UserNotFound if the user file is not found.
     */
    @HandleUserRepoErrors()
    async updateUser(id: string, userJson: User): Promise<void> {
        const hashedId = this.encryptionService.getHashedValue(id);
        const encrypted = this.encryptionService.encryptValue(
            JSON.stringify(userJson),
        );
        await this.storageService.write(hashedId, encrypted);
    }

    /**
     * Performs an atomic update on a user's data.
     * 사용자 데이터에 대한 원자적 업데이트를 수행합니다.
     *
     * Acquires a lock on the user file, reads the data, applies a modifier function,
     * and then writes the updated data back to storage, releasing the lock afterwards.
     *
     * 사용자 파일에 잠금을 획득하고, 데이터를 읽고, 수정자 함수를 적용한 다음,
     * 업데이트된 데이터를 저장소에 다시 쓰고 잠금을 해제합니다.
     *
     * @param id - The user's ID.
     * @param modifierCallback - An asynchronous function that modifies the User object.
     * @returns A Promise that resolves with the updated User object.
     * @throws UserError if any lock or storage operation fails.
     */
    @HandleUserRepoErrors()
    async atomicUpdateUser(
        id: string,
        modifierCallback: (user: User) => Promise<User>,
    ): Promise<User> {
        const hashedId = this.encryptionService.getHashedValue(id);

        const updated = await this.lockService.withLock(hashedId, async () => {
            const encrypted: string =
                await this.storageService.readUnsafe(hashedId);
            const decrypted: string =
                await this.encryptionService.decryptValue(encrypted);
            const userJson: User = await JSON.parse(decrypted);

            await modifierCallback(userJson);

            const newEncryted = await this.encryptionService.encryptValue(
                JSON.stringify(userJson),
            );
            await this.storageService.writeUnsafe(hashedId, newEncryted);

            return userJson;
        });
        return updated;
    }
}