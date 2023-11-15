import { IsNotEmpty, IsString } from 'class-validator';
import { PingDto } from './ping.dto';

export class RegistrationDto extends PingDto {
  @IsString()
  @IsNotEmpty()
  serial: string;

  @IsString()
  @IsNotEmpty()
  alertToken: string;
}
