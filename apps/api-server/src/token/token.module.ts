import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@config/config.module';
import { ConfigService } from '@config/config.service';
import { JwtStrategy } from './jwt-strategy';

/**
 * Module for managing JWT authentication and token-related functionalities.
 *
 * @category Modules
 * @since 1.0.0
 */
@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getSecretKey(),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  exports: [JwtModule, PassportModule],
  providers: [JwtStrategy],
})
export class TokenModule {}
