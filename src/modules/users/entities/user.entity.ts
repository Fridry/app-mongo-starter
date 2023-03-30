import { Role, User as UserPrisma } from '@prisma/client';

export class UserEntity implements UserPrisma {
  id: string;
  cpf: string;
  role: Role;

  addressId: string;
  authId: string;
  profileId?: string;

  createdAt: Date;
  updatedAt: Date;
}
