import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, Address } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AddressDto } from './dto/addresses.dto';

@Injectable()
export class AddressesService {
  constructor(private prisma: PrismaService) {}

  async create(data: AddressDto): Promise<Address> {
    const {
      authId,
      state,
      number,
      complement,
      zipCode,
      landmark,
      city,
      street,
      country,
    } = data;

    const user = await this.prisma.user.findFirst({
      where: {
        authId,
      },
    });

    if (!user) {
      throw new BadRequestException(`User not found`);
    }

    const newAddress = await this.prisma.$transaction(async (prisma) => {
      const address = await prisma.address.create({
        data: {
          state,
          number,
          complement,
          zipCode,
          landmark,
          city,
          street,
          country,
          user: {
            connect: {
              id: user.id,
            },
          },
        },
      });

      return address;
    });

    return newAddress;
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.AddressWhereUniqueInput;
    where?: Prisma.AddressWhereInput;
    orderBy?: Prisma.AddressOrderByWithRelationInput;
  }): Promise<Address[]> {
    const { skip, take, cursor, where, orderBy } = params;

    const addresses = await this.prisma.address.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });

    return addresses;
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
    const { where, data } = params;

    await this.findOne(where);

    const address = await this.prisma.address.update({
      where,
      data,
    });

    return address;
  }

  async remove(where: Prisma.AddressWhereUniqueInput): Promise<void> {
    await this.findOne(where);

    await this.prisma.address.delete({
      where,
    });
  }
}
