import { User as UserPrisma } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class UserEntity implements UserPrisma {
  id: string;
  name: string;
  cpf: string;
  email: string;

  @Exclude()
  password: string;

  createdAt: Date;
  updatedAt: Date;
}
