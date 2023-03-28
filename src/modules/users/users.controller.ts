import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserEntity as User } from './entities/user.entity';
import { UserDto } from './dto/user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() data: UserDto): Promise<User> {
    return this.usersService.create(data);
  }

  @Get()
  findAll(
    @Query() queryParams: { offset?: number; limit?: number; search?: string },
  ): Promise<User[]> {
    const { offset, limit, search } = queryParams;

    const params = {
      skip: offset ? +offset : 0,
      take: limit ? +limit : 100,
      where: {
        email: search,
      },
    };

    return this.usersService.findAll(params);
  }

  @Get('search')
  findOne(
    @Query() params: { id?: string; email?: string; cpf?: string },
  ): Promise<User> {
    return this.usersService.findOne(params);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() data: UpdateUserDto) {
    return this.usersService.update({ where: { id }, data });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.usersService.delete({ id });
  }
}
