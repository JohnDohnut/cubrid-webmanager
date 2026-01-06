/**
 * Data Transfer Object for user authentication.
 * 사용자 인증을 위한 데이터 전송 객체입니다.
 *
 * Used for login and registration requests containing
 * user credentials.
 *
 * 사용자 자격 증명을 포함하는 로그인 및 등록 요청에 사용됩니다.
 *
 * @category DTOs
 * @since 1.0.0
 */
export class UserDTO {
    id: string;
    password: string;
}
