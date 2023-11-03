import { IsNotEmpty, IsString } from 'class-validator';

export class RegistrationDto {
  @IsString()
  @IsNotEmpty()
  serial: string;

  @IsString()
  @IsNotEmpty()
  alertToken: string;

  @IsString()
  @IsNotEmpty()
  email: string;
}
