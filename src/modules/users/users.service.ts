import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UserDto } from './dto/user.dto';
import { AuthService } from '../auth/auth.service';
@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}

  async create(data: UserDto): Promise<User> {
    const { cpf, email, name, phone, tags, password } = data;

    const userExists = await this.prisma.user.findFirst({
      where: {
        OR: [{ cpf }, { auth: { email } }, { profile: { email } }],
      },
    });

    if (userExists) {
      throw new ConflictException(`User already exists`);
    }

    const newUser = this.prisma.$transaction(async (prisma) => {
      const user = await prisma.user.create({
        data: {
          cpf,
          auth: {
            create: {
              email,
              password: await this.authService.hashPassword(password),
            },
          },
          profile: {
            create: {
              name,
              email,
              phone,
              tags,
            },
          },
        },
      });

      return user;
    });

    return newUser;
  }

  async findAll(params: {
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
    });

    return users;
  }

  async findOne(where: Prisma.UserWhereUniqueInput): Promise<User | null> {
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
      include: {
        address: true,
        profile: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    return user;
  }

  async update(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }): Promise<User> {
    const { where, data } = params;

    await this.findOne(where);

    const user = await this.prisma.user.update({
      where,
      data,
    });

    return user;
  }

  async delete(where: Prisma.UserWhereUniqueInput): Promise<void> {
    await this.findOne(where);

    await this.prisma.user.delete({
      where,
    });
  }
}
