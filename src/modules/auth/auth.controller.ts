import {
  Controller,
  Post,
  Request,
  UseGuards,
  HttpCode,
  Body,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Auth } from '@prisma/client';
import { AuthDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  create(@Body() data: AuthDto): Promise<Auth> {
    return this.authService.create(data);
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @HttpCode(200)
  login(@Request() request) {
    return this.authService.signIn(request.user);
  }
}
