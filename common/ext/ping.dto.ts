import { IsNotEmpty, IsString, IsInt } from 'class-validator';

export class PingDto {
  @IsInt()
  @IsNotEmpty()
  googleID: number;

  @IsString()
  @IsNotEmpty()
  email: string;
}
