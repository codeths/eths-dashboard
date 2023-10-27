import { ApiProperty } from '@nestjs/swagger';

type StatusMessage = 'Device not found' | 'The api key is incorrect';

export class IDeviceStatus {
  @ApiProperty()
  serial: string;

  @ApiProperty()
  deviceStatus: string;

  @ApiProperty()
  loanerStatus: string;

  @ApiProperty()
  startDate: string;
}
export interface DeviceStatus extends IDeviceStatus {}

export interface OneToOneStatus {
  object?: DeviceStatus;
  message: StatusMessage | null;
  success: boolean;
}
