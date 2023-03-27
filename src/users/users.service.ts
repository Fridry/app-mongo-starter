import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    const userExists = await this.prisma.user.findFirst({
      where: {
        OR: [
          {
            email: data?.email,
          },
          {
            cpf: data?.cpf,
          },
        ],
      },
    });

    if (userExists) {
      throw new ConflictException(`User already exists`);
    }

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(data?.password, salt);

    const userData = {
      ...data,
      password: hashedPassword,
    };

    const user = await this.prisma.user.create({
      data: userData,
      // include: {
      //   addresses: true,
      // },
    });

    delete user.password;

    return user;
  }

  async user(where: Prisma.UserWhereUniqueInput): Promise<User | null> {
    const search = {};

    if (where?.id) {
      search['id'] = where.id;
    } else if (where?.cpf) {
      search['cpf'] = where.cpf;
    } else if (where?.email) {
      search['email'] = where.email;
    }

    if (!Object.entries(search)?.length) {
      throw new NotFoundException(`User not found`);
    }

    const user = await this.prisma.user.findUnique({
      where: search,
      // include: {
      //   addresses: true,
      // },
    });

    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    delete user.password;

    return user;
  }

  async users(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    const { skip, take, cursor, where, orderBy } = params;

    const users = await this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      // include: {
      //   addresses: true,
      // },
    });

    if (!users?.length) {
      return users;
    }

    const serializedUsers: User[] = users.map((user: User) => {
      delete user.password;

      return user;
    });

    return serializedUsers;
  }

  async updateUser(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }): Promise<User> {
    const { where, data } = params;

    await this.user(where);

    const user = await this.prisma.user.update({
      where,
      data,
      // include: {
      //   addresses: true,
      // },
    });

    delete user.password;

    return user;
  }

  async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<void> {
    await this.user(where);

    await this.prisma.user.delete({
      where,
    });
  }
}
