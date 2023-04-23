import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserDto } from './dto/user.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';

const user: UserDto = {
  cpf: '12345678900',
};

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, PrismaService],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(async () => {
    jest.clearAllMocks();

    console.log('Deleting user...');
    await prisma.user.deleteMany();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new user', async () => {
    const result = await service.create({
      cpf: user.cpf,
    });

    expect(result).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        cpf: user.cpf,
        role: 'USER',
        authId: null,
        addressId: null,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      }),
    );
  });

  it('should not create a new user if user already exists', async () => {
    jest.spyOn(prisma.user, 'findFirst').mockResolvedValueOnce({
      id: '7a8de516-d53e-4076-a121-82aa87c8d9b5',
      cpf: '03090303088',
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
      authId: null,
      addressId: null,
    });

    try {
      const result = await service.create({
        cpf: user.cpf,
      });

      expect(result).toBeFalsy();
    } catch (error) {
      expect(error).toBeInstanceOf(ConflictException);
      expect(error.message).toBe('User already exists');
    }
  });

  it('should list all existing users', async () => {
    console.log('Creating user...');

    await prisma.user.create({
      data: user,
    });

    const result = await service.findAll({});

    expect(result).toStrictEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          cpf: user.cpf,
          role: 'USER',
          authId: null,
          addressId: null,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        }),
      ]),
    );
  });

  it('should return a specific user by id', async () => {
    console.log('Creating user...');

    const { id } = await prisma.user.create({
      data: user,
    });

    const result = await service.findOne({
      id,
    });

    expect(result).toStrictEqual(
      expect.objectContaining({
        id,
        cpf: user.cpf,
        role: 'USER',
        authId: null,
        addressId: null,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      }),
    );
  });

  it('should return a specific user by cpf', async () => {
    console.log('Creating user...');

    await prisma.user.create({
      data: user,
    });

    const result = await service.findOne({
      cpf: '12345678900',
    });

    expect(result).toStrictEqual(
      expect.objectContaining({
        id: expect.any(String),
        cpf: user.cpf,
        role: 'USER',
        authId: null,
        addressId: null,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      }),
    );
  });

  // not found
  it('should not return user, but a conflict if user does not exists', async () => {
    try {
      const result = await service.findOne({
        id: '7a8de516-d53e-4076-a121-82aa87c8d9b7',
      });

      console.log(result);

      expect(result).toBeFalsy();
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
      expect(error.message).toBe('User not found');
    }
  });

  it('should update a specific user by id', async () => {
    console.log('Creating user...');

    const { id } = await prisma.user.create({
      data: user,
    });

    const result = await service.update({
      where: {
        id,
      },
      data: {
        role: 'ADMIN',
      },
    });

    expect(result).toHaveProperty('role', 'ADMIN');
  });

  it('should delete a specific user by id', async () => {
    console.log('Creating user...');

    const { id } = await prisma.user.create({
      data: user,
    });

    const result = await service.delete({
      id,
    });

    expect(result).toBeUndefined();
  });
});
