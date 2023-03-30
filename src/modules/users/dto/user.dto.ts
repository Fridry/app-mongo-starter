import { IsString, IsNotEmpty, Length } from 'class-validator';

export class UserDto {
  @IsNotEmpty()
  @IsString()
  @Length(11, 11)
  cpf: string;
}
