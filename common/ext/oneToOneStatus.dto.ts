import { ApiProperty } from '@nestjs/swagger';

type APIResponseMessage = 'Device not found' | 'The api key is incorrect';

type DeviceStatus =
  | 'Available'
  | 'Broken'
  | 'Charging'
  | 'Deprovisioned'
  | 'Given to Assignee'
  | 'In-house Troubleshooting/Repair'
  | 'Insurance Repair'
  | 'Invoiced - Waiting for Payment'
  | 'Lost/Stolen'
  | 'Warranty Repair';
type DeviceType = 'Not A Loaner' | 'Short Term Loaners' | 'Long Term Loaners';

export class IDeviceStatus {
  serial: string;
  deviceStatus: DeviceStatus;
  loanerStatus: DeviceType;
  startDate: string | null;
}
export interface DeviceState extends IDeviceStatus {}

export interface OneToOneStatus {
  object?: DeviceState;
  message: APIResponseMessage | null;
  success: boolean;
}
