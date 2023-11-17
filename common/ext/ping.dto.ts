import { IsNotEmpty, IsString } from 'class-validator';

export class PingDto {
  @IsString()
  @IsNotEmpty()
  googleID: string;

  @IsString()
  @IsNotEmpty()
  email: string;
}
