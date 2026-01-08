import { User } from '@type/user';

/**
 * Request interface for updating user information.
 *
 * Currently allows updating the 'department' field of a user.
 *
 * 사용자 정보 업데이트를 위한 요청 인터페이스입니다.
 *
 * 현재 사용자의 'department' 필드 업데이트를 허용합니다.
 *
 * @category Requests
 * @since 1.0.0
 */
export type UpdateUserInfoRequest = Pick<User, 'department'>;
