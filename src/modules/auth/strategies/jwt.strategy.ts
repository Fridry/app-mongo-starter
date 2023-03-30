import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '@prisma/client';
import { UsersService } from 'src/modules/users/users.service';
import { JwtPayload } from '../jwt-payload';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
      usernameField: 'email',
    });
  }

  async validate(payload: JwtPayload): Promise<void> {
    // const user = await this.usersService.findOne({ email: payload?.email });
    // if (!user) {
    //   throw new UnauthorizedException();
    // }
    // return user;
  }
}
