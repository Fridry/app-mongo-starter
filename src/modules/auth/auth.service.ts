import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { UsersService } from 'src/modules/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async validateUser(params: { email: string; password: string }) {
    const { password, email } = params;

    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new NotFoundException(`No user found for email: ${email}`);
    }

    const hashedPassword = user?.password;

    await this.verifyPassword({ password, hashedPassword });

    delete user.password;

    return user;
  }

  async login(user: User) {
    const payload = { email: user.email, sub: user.id };

    const accessToken = this.jwtService.sign(payload);

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN,
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  logout() {
    return 'This action adds a new auth';
  }

  async verifyPassword(params: { password: string; hashedPassword: string }) {
    const { password, hashedPassword } = params;

    const isPasswordMatching = await bcrypt.compare(password, hashedPassword);

    if (!isPasswordMatching) {
      throw new UnauthorizedException(`Invalid credentials`);
    }
  }

  async refreshToken(refreshToken: string) {
    const payload: User = await this.verificarRefreshToken(refreshToken);

    return this.login(payload);
  }

  private async verificarRefreshToken(refreshToken: string) {
    if (!refreshToken) {
      throw new NotFoundException(`Refresh token not found`);
    }

    const email = this.jwtService.decode(refreshToken)['email'];

    const user = await this.usersService.findOne({ email });

    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    try {
      this.jwtService.verify(refreshToken);

      return user;
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid Token');
      }

      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Expired Token');
      }

      throw new UnauthorizedException(error.name);
    }
  }
}
