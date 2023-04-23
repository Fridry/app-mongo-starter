import {
  Controller,
  Get,
  Post,
  Body,
  Request,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { AddressEntity as Address } from './entities/addresses.entity';
import { AddressDto } from './dto/addresses.dto';
import { UpdateAddressDto } from './dto/update-addresses.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() data: AddressDto, @Request() request): Promise<Address> {
    const user = request.user as any;

    const createParams = {
      ...data,
      userEmail: user.email,
    };

    return this.addressesService.create(createParams);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(
    @Query()
    queryParams: {
      offset?: number;
      limit?: number;
      id?: string;
      userId?: string;
    },
  ): Promise<Address[]> {
    const { offset, limit } = queryParams;

    const params = {
      skip: offset ? +offset : 0,
      take: limit ? +limit : 100,
    };

    return this.addressesService.findAll(params);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.addressesService.findOne({ id });
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() data: UpdateAddressDto) {
    return this.addressesService.update({ where: { id }, data });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Request() request) {
    return this.addressesService.remove({ id });
  }
}
