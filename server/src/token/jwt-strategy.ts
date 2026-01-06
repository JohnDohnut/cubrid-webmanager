import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@config/config.service';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly config: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: config.getSecretKey(),
        });
    }

    async validate(payload: any) {
        // JWT 토큰이 유효하면 페이로드만 반환
        // 사용자 존재 여부는 필요할 때만 별도로 확인
        return payload;
    }
}
