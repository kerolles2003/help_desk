import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { StringValue } from 'ms';
import { UsersService } from '../users/users.service';
import { UserDocument } from '../users/schemas/user.schema';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  /** Validate credentials and return the (sanitized) user document. */
  async validateUser(email: string, password: string): Promise<UserDocument> {
    const user = await this.usersService.findByEmailWithPassword(email);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const matches = await this.usersService.comparePassword(
      password,
      user.password,
    );
    if (!matches) {
      throw new UnauthorizedException('Invalid email or password');
    }
    // Reload without the password field for a safe return value.
    return this.usersService.findById(user.id);
  }

  signAccessToken(user: UserDocument): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return this.jwtService.sign(payload);
  }

  signRefreshToken(user: UserDocument): string {
    return this.jwtService.sign(
      { sub: user.id },
      {
        secret: this.config.get<string>('jwt.refreshSecret'),
        expiresIn: (this.config.get<string>('jwt.refreshExpiresIn') ??
          '7d') as StringValue,
      },
    );
  }

  /** Verify a refresh token and return the associated user. */
  async userFromRefreshToken(token: string | undefined): Promise<UserDocument> {
    if (!token) throw new UnauthorizedException('Missing refresh token');
    try {
      const payload = await this.jwtService.verifyAsync<{ sub: string }>(token, {
        secret: this.config.get<string>('jwt.refreshSecret'),
      });
      const user = await this.usersService.findById(payload.sub);
      if (!user.isActive) throw new UnauthorizedException();
      return user;
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  /** Refresh cookie lifetime in milliseconds (mirrors JWT_REFRESH_EXPIRES_IN). */
  get refreshCookieMaxAge(): number {
    return 7 * 24 * 60 * 60 * 1000;
  }
}
