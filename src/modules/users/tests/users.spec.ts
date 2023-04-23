import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../app.module';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../modules/prisma/prisma.service';
import { HttpAdapterHost } from '@nestjs/core';
import { HttpExceptionFilter } from '../../../utils/http-exception.filter';
import { PrismaClientExceptionFilter } from '../../../utils/prisma-client-exception.filter';

describe('Users (e2e)', () => {
  let app: INestApplication;
  const cpf = '12345678700';

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    const prismaService = app.get(PrismaService);
    await prismaService.enableShutdownHooks(app);

    const { httpAdapter } = app.get(HttpAdapterHost);
    app.useGlobalFilters(
      new HttpExceptionFilter(),
      new PrismaClientExceptionFilter(httpAdapter),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });
  describe('POST /users', () => {
    it('should return HttpStatus.CREATED and created user when user does not exist', async () => {
      const userData: Prisma.UserCreateInput = {
        cpf,
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(userData);

      expect(response.status).toBe(HttpStatus.CREATED);
    });

    it('should return HttpStatus.CONFLICT when user already exists', async () => {
      const userData: Prisma.UserCreateInput = { cpf };

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(userData);

      expect(response.status).toBe(HttpStatus.CONFLICT);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toHaveLength(1);
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('path');
    });

    it('should return HttpStatus.BAD_REQUEST when user data has a invalid data type', async () => {
      const userData = { cpf: 1234567891 };

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(userData);

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toHaveLength(1);
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('path');
    });

    it('should return HttpStatus.BAD_REQUEST when user data has a invalid length', async () => {
      const userData = { cpf: '123456789789541' };

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(userData);

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toHaveLength(1);
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('path');
    });

    it('should return HttpStatus.BAD_REQUEST when user data is invalid', async () => {
      const userData = { cpf: '' };

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(userData);

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toHaveLength(2);
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('path');
    });
  });

  describe('GET /users', () => {
    it('should return an array of users', async () => {
      const response = await request(app.getHttpServer()).get('/users');

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(expect.any(Number));
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('cpf');
      expect(response.body[0].cpf).toBe(cpf);
    });
  });

  describe('GET /users/search', () => {
    it('should return an user by CPF', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/search')
        .query({ cpf });

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('cpf');
      expect(response.body.cpf).toBe(cpf);
    });

    it('should return an user by id', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/search')
        .query({ id: 'd809dbe9-1141-4400-b281-9421a37a12c0' });

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('cpf');
      expect(response.body.cpf).toBe(cpf);
    });

    it('should return HttpStatus.NOT_FOUND when user does not exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/search')
        .query({ cpf: '123456780' });

      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });
  });

  describe('PATCH /users/:id', () => {
    it('should return HttpStatus.OK and updated user', async () => {
      const userData: Prisma.UserUpdateInput = {
        cpf: '12345677777',
      };

      const response = await request(app.getHttpServer())
        .patch('/users/fe8b08fb-2706-4577-8089-77f2c9e3eba3')
        .send(userData);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('cpf');
      expect(response.body.cpf).toBe('12345677777');
    });

    it('should return HttpStatus.BAD_REQUEST when user data has a invalid data type', async () => {
      const userData = { cpf: 1234567891 };

      const response = await request(app.getHttpServer())
        .patch('/users/fe8b08fb-2706-4577-8089-77f2c9e3eba3')
        .send(userData);

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should return HttpStatus.BAD_REQUEST when user data is invalid', async () => {
      const userData = { cpf: '' };

      const response = await request(app.getHttpServer())
        .patch('/users/fe8b08fb-2706-4577-8089-77f2c9e3eba3')
        .send(userData);

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toHaveLength(2);
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('path');
    });

    it('should return HttpStatus.NOT_FOUND when user does not exist', async () => {
      const userData: Prisma.UserUpdateInput = {
        cpf: '12345678119',
      };

      const response = await request(app.getHttpServer())
        .patch('/users/fe8b08fb-2706-4577-8089-77f2c9e3eba1')
        .send(userData);

      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /users/:id', () => {
    it('should return HttpStatus.OK and deleted user', async () => {
      const response = await request(app.getHttpServer()).delete(
        '/users/d809dbe9-1141-4400-b281-9421a37a12c0',
      );

      expect(response.status).toBe(HttpStatus.OK);
    });

    it('should return HttpStatus.NOT_FOUND when user does not exist', async () => {
      const response = await request(app.getHttpServer()).delete(
        '/users/fe8b08fb-2706-4577-8089-77f2c9e3eba1',
      );

      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });
  });
});
