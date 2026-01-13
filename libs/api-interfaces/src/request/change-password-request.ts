/**
 * Request interface for changing user password.
 *
 * Contains the old password for verification and the new password
 * to be set for the user account.
 *
 * @category Requests
 * @since 1.0.0
 */
export interface ChangePasswordRequest {
    oldPassword: string;
    newPassword: string;
}
