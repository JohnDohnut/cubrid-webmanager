import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDTO } from '@type/index';
import { LoginResponse, CreateLoginResponse } from '@api-interfaces';
import { Public } from '@common';

/**
 * Controller for handling authentication operations.
 *
 * Provides endpoints for user login and registration. These endpoints are
 * marked as public and do not require JWT authentication.
 *
 * @category Controllers
 * @since 1.0.0
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Authenticates a user and returns a JWT token.
   *
   * Validates user credentials and returns a JWT token for authenticated
   * requests. This endpoint is public and does not require authentication.
   *
   * @param {UserDTO} userDTO - User credentials containing id and password
   * @returns {Promise<LoginResponse>} Response containing the JWT token
   * @throws {UserError} When user is not found or password is incorrect
   * @example
   * ```typescript
   * // POST /auth/login
   * // Body: { id: "user123", password: "password123" }
   * // Returns: { token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
   * ```
   */
  @Public()
  @Post('login')
  async login(@Body() userDTO: UserDTO): Promise<LoginResponse> {
    const token = await this.authService.login(userDTO);
    return CreateLoginResponse(token);
  }

  /**
   * Registers a new user account.
   *
   * Creates a new user account with the provided credentials.
   * This endpoint is public and does not require authentication.
   *
   * @param {UserDTO} userDTO - User information containing id and password
   * @returns {Promise<void>} No return value on success
   * @throws {UserError} When user already exists or registration fails
   * @example
   * ```typescript
   * // POST /auth/register
   * // Body: { id: "newuser", password: "newpassword123" }
   * ```
   */
  @Public()
  @Post('register')
  async register(@Body() userDTO: UserDTO): Promise<void> {
    await this.authService.register(userDTO);
  }
}
