import {
  ConflictException,
  Injectable,
  NotAcceptableException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Auth, Prisma } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async create(data: Prisma.AuthCreateInput): Promise<Auth> {
    try {
      const authExists = await this.prisma.auth.findFirst({
        where: {
          email: data?.email,
        },
      });

      if (authExists) {
        throw new ConflictException(`Email already in use`);
      }

      const hashedPassword = await this.hashPassword(data.password);

      const authData = {
        ...data,
        password: hashedPassword,
      };

      const auth = await this.prisma.auth.create({ data: authData });

      return auth;
    } catch (error) {
      throw new Error(`Error creating auth: ${error.message}`);
    }
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<Auth[]> {
    const { skip, take, cursor, where, orderBy } = params;

    const auth = await this.prisma.auth.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });

    return auth;
  }

  async findOneByEmail(
    where: Prisma.AuthWhereUniqueInput,
  ): Promise<Auth | null> {
    const { email } = where;

    const auth = this.prisma.auth.findFirst({
      where: { email },
    });

    if (!auth) {
      throw new NotFoundException(`Auth not found`);
    }

    return auth;
  }

  async findOneById(where: Prisma.AuthWhereUniqueInput): Promise<Auth | null> {
    try {
      const { id } = where;

      const auth = await this.prisma.auth.findFirst({
        where: { id },
      });

      if (!auth) {
        throw new NotFoundException(`Auth not found`);
      }

      return auth;
    } catch (error) {
      throw new Error(`Error finding auth by id: ${error.message}`);
    }
  }

  async update(params: {
    where: Prisma.AuthWhereUniqueInput;
    data: Prisma.AuthUpdateInput;
  }): Promise<Auth> {
    try {
      const { where, data } = params;

      await this.findOneById(where);

      const auth = await this.prisma.auth.update({
        where,
        data,
      });

      return auth;
    } catch (error) {
      throw new Error(`Error updating auth: ${error.message}`);
    }
  }

  async delete(where: Prisma.AuthWhereUniqueInput): Promise<void> {
    try {
      await this.findOneById(where);

      await this.prisma.auth.delete({
        where,
      });
    } catch (error) {
      throw new Error(`Error deleting auth: ${error.message}`);
    }
  }

  async validateUser(params: { email: string; password: string }) {
    const { password, email } = params;

    const auth = await this.findOneByEmail({ email });

    if (!auth) {
      throw new NotAcceptableException(`No user found for email: ${email}`);
    }

    const hashedPassword = auth?.password;

    await this.verifyPassword({ password, hashedPassword });

    delete auth.password;

    return auth;
  }

  async verifyPassword(params: { password: string; hashedPassword: string }) {
    const { password, hashedPassword } = params;

    const isPasswordMatching = await bcrypt.compare(password, hashedPassword);

    if (!isPasswordMatching) {
      throw new UnauthorizedException(`Invalid credentials`);
    }
  }

  async signIn(auth: Auth) {
    const payload = { email: auth.email, sub: auth.id };

    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
    };
  }

  async hashPassword(password: string) {
    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    return hashedPassword;
  }
}
