import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserDto } from './dto/user.dto';

const user: UserDto = {
  cpf: '12345678900',
};

describe('UsersController', () => {
  let controller: UsersController;
  let prisma: PrismaService;
  // let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService, PrismaService],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    prisma = module.get<PrismaService>(PrismaService);
    // service = module.get<UsersService>(UsersService);
  });

  afterEach(async () => {
    jest.clearAllMocks();

    console.log('Deleting user...');
    await prisma.user.deleteMany();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('POST - should create a new user', async () => {
    const result = await controller.create({
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

  it('GET - should list a specific user by id', async () => {
    console.log('Creating user...');

    const { id } = await prisma.user.create({
      data: user,
    });

    const result = await controller.findOne({
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

  it('GET - should list a specific user by cpf', async () => {
    console.log('Creating user...');

    await prisma.user.create({
      data: user,
    });

    const result = await controller.findOne({
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

  it('UPDATE - should update a specific user by id', async () => {
    console.log('Creating user...');

    const { id } = await prisma.user.create({
      data: user,
    });

    const result = await controller.update(id, { cpf: '12345678901' });

    expect(result).toHaveProperty('cpf', '12345678901');
  });

  it('DELETE - should delete a specific user by id', async () => {
    console.log('Creating user...');

    const { id } = await prisma.user.create({
      data: user,
    });

    const result = await controller.delete(id);

    expect(result).toBeUndefined();
  });
});
