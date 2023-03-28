import { Address as AddressPrisma } from '@prisma/client';

export class AddressEntity implements AddressPrisma {
  id: string;
  street: string;
  number: number;
  city: string;
  state: string;
  zipCode: string;
  country: string;

  userId: string;

  createdAt: Date;
  updatedAt: Date;
}
