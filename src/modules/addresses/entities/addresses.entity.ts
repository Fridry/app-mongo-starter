import { Address as AddressPrisma } from '@prisma/client';

export class AddressEntity implements AddressPrisma {
  id: string;
  street: string;
  number: number;
  complement: string;
  landmark: string;
  zipCode: string;
  city: string;
  state: string;
  country: string;

  userId?: string;

  createdAt: Date;
  updatedAt: Date;
}
