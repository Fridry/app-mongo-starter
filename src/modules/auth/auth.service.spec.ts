import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import {
  ConflictException,
  NotAcceptableException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwt: JwtService;

  const authData = {
    email: 'email@mail.com',
    password: '12345678',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, PrismaService, JwtService],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwt = module.get<JwtService>(JwtService);
  });

  afterEach(async () => {
    jest.clearAllMocks();

    console.log('Deleting auth...');
    await prisma.auth.deleteMany();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new auth', async () => {
    const result = await service.create(authData);

    console.log(result);

    expect(result).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        email: authData.email,
        password: expect.any(String),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      }),
    );
  });

  it('should not create a new auth if email already in use', async () => {
    jest.spyOn(prisma.auth, 'findFirst').mockResolvedValueOnce({
      id: '7a8de516-d53e-4076-a121-82aa87c8d9b5',
      email: authData.email,
      password: authData.password,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    try {
      const result = await service.create(authData);

      expect(result).toBeFalsy();
    } catch (error) {
      expect(error).toBeInstanceOf(ConflictException);
      expect(error.message).toBe('Email already in use');
    }
  });

  it('should return a specific auth by email', async () => {
    console.log('Creating auth...');

    const { email } = await service.create(authData);

    const result = await service.findOneByEmail({
      email,
    });

    console.log(result);

    expect(result).toStrictEqual(
      expect.objectContaining({
        id: expect.any(String),
        email: authData.email,
        password: authData.password,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      }),
    );
  });

  it('should return a specific auth by id', async () => {
    console.log('Creating user...');

    const { id } = await service.create(authData);

    const result = await service.findOneById({
      id,
    });

    expect(result).toStrictEqual(
      expect.objectContaining({
        id,
        email: authData.email,
        password: authData.password,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      }),
    );
  });

  it('should not return auth, but a conflict if auth does not exists', async () => {
    try {
      const result = await service.findOneById({
        id: '7a8de516-d53e-4076-a121-82aa87c8d9b7',
      });

      console.log(result);

      expect(result).toBeFalsy();
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
      expect(error.message).toBe('Auth not found');
    }
  });

  it('should not return auth, but a conflict if auth does not exists', async () => {
    try {
      const result = await service.findOneByEmail({
        email: 'e-mail.@mail.com',
      });

      console.log(result);

      expect(result).toBeFalsy();
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
      expect(error.message).toBe('Auth not found');
    }
  });

  it('should update a specific auth by id', async () => {
    console.log('Creating auth...');

    const { id } = await service.create(authData);

    const result = await service.update({
      where: {
        id,
      },
      data: {
        password: 'password1234',
      },
    });

    expect(result).toHaveProperty('password', 'password1234');
  });

  it('should delete a specific auth by id', async () => {
    console.log('Creating auth...');

    const { id } = await service.create(authData);

    const result = await service.delete({
      id,
    });

    expect(result).toBeUndefined();
  });

  it('should validate a specific auth by email and password', async () => {
    console.log('Creating auth...');

    const { email, password } = await service.create(authData);

    const result = await service.validateUser({ email, password });

    expect(result).toHaveProperty('id', expect.any(String));
    expect(result).toHaveProperty('email', authData.email);
    expect(result).toHaveProperty('password', authData.password);
  });

  it('should not validate a specific auth using invalid email', async () => {
    try {
      const result = await service.validateUser({
        email: 'email1@mail.com',
        password: 'password1234',
      });

      expect(result).toBeFalsy();
    } catch (error) {
      expect(error).toBeInstanceOf(NotAcceptableException);
      expect(error.message).toBe('No auth found for email: email1@mail.com');
    }
  });

  it('should not validate a specific auth using invalid password', async () => {
    try {
      console.log('Creating auth...');
      const { email } = await service.create(authData);

      const result = await service.validateUser({
        email,
        password: 'password1234567890',
      });

      expect(result).toBeFalsy();
    } catch (error) {
      console.log(error);
      expect(error).toBeInstanceOf(UnauthorizedException);
      expect(error.message).toBe('Invalid credentials');
    }
  });

  it('should return a valid auth', async () => {
    console.log('Creating auth...');
    await service.create(authData);

    const result = await service.validateUser(authData);

    console.log(result);

    expect(result).toHaveProperty('id', expect.any(String));
    expect(result).toHaveProperty('email', authData.email);
    expect(result).not.toHaveProperty('password', authData.password);
  });

  it('should verify password', async () => {
    console.log('Creating auth...');
    const { password } = await service.create(authData);

    const result = await service.verifyPassword({
      password: authData.password,
      hashedPassword: password,
    });

    expect(result).toBe(undefined);
  });
});
