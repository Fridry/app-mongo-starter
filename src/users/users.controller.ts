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
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() data: UserDto): Promise<User> {
    return this.usersService.createUser(data);
  }

  @Get()
  findAll(@Query() { offset, limit, search }): Promise<User[]> {
    const params = {
      skip: offset ? +offset : 0,
      take: limit ? +limit : 100,
      where: {
        email: search,
      },
    };

    return this.usersService.users(params);
  }

  @Get('search')
  findOne(
    @Query() params: { id?: string; email?: string; cpf?: string },
  ): Promise<User> {
    return this.usersService.user(params);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() data: UpdateUserDto) {
    return this.usersService.updateUser({ where: { id }, data });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.usersService.deleteUser({ id });
  }
}
