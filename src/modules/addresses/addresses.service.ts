import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma, Address } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AddressesService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.AddressCreateInput): Promise<Address> {
    try {
      const address = await this.prisma.address.create({
        data,
      });

      return address;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.AddressWhereUniqueInput;
    where?: Prisma.AddressWhereInput;
    orderBy?: Prisma.AddressOrderByWithRelationInput;
  }): Promise<Address[]> {
    try {
      const { skip, take, cursor, where, orderBy } = params;

      const addresses = await this.prisma.address.findMany({
        skip,
        take,
        cursor,
        where,
        orderBy,
      });

      return addresses;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findOne(
    where: Prisma.AddressWhereUniqueInput,
  ): Promise<Address | null> {
    const address = await this.prisma.address.findUnique({
      where,
    });

    return address;
  }

  async update(params: {
    where: Prisma.AddressWhereUniqueInput;
    data: Prisma.AddressUpdateInput;
  }): Promise<Address> {
    try {
      const { where, data } = params;

      const address = await this.prisma.address.update({
        where,
        data,
      });

      return address;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async remove(where: Prisma.AddressWhereUniqueInput): Promise<void> {
    try {
      // await this.validateUser(where, userId);

      await this.prisma.address.delete({
        where,
      });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  // private async validateUser(
  //   where: Prisma.AddressWhereUniqueInput,
  //   userId: string,
  // ): Promise<void> {
  //   const addressFound = await this.findOne(where);

  //   if (addressFound?.user. !== userId) {
  //     console.log('Só pode o que é seu');

  //     throw new UnauthorizedException('User not authorized');
  //   }
  // }
}
