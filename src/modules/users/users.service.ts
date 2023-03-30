import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.UserCreateInput): Promise<User> {
    try {
      const userExists = await this.prisma.user.findFirst({
        where: {
          cpf: data?.cpf,
        },
      });

      if (userExists) {
        throw new ConflictException(`User already exists`);
      }

      // const salt = await bcrypt.genSalt(10);

      // const hashedPassword = await bcrypt.hash(data?.password, salt);

      // const userData = {
      //   ...data,
      //   password: hashedPassword,
      // };

      const user = await this.prisma.user.create({
        data,
      });

      return user;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    try {
      const { skip, take, cursor, where, orderBy } = params;

      const users = await this.prisma.user.findMany({
        skip,
        take,
        cursor,
        where,
        orderBy,
      });

      return users;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findOne(where: Prisma.UserWhereUniqueInput): Promise<User | null> {
    try {
      const search = {};

      if (where?.id) {
        search['id'] = where.id;
      } else if (where?.cpf) {
        search['cpf'] = where.cpf;
      }

      if (!Object.entries(search)?.length) {
        throw new NotFoundException(`User not found`);
      }

      const user = await this.prisma.user.findUnique({
        where: search,
      });

      if (!user) {
        throw new NotFoundException(`User not found`);
      }

      return user;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async update(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }): Promise<User> {
    try {
      const { where, data } = params;

      await this.findOne(where);

      const user = await this.prisma.user.update({
        where,
        data,
      });

      return user;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async delete(where: Prisma.UserWhereUniqueInput): Promise<void> {
    try {
      await this.findOne(where);

      await this.prisma.user.delete({
        where,
      });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
