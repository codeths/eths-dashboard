type APIResponseMessage = 'Device not found' | 'The api key is incorrect';

export const DeviceStatusValues = [
  'Available',
  'Broken',
  'Charging',
  'Deprovisioned',
  'Given to Assignee',
  'In-house Troubleshooting/Repair',
  'Insurance Repair',
  'Invoiced - Waiting for Payment',
  'Lost/Stolen',
  'Warranty Repair',
] as const;
export const DeviceTypeValues = [
  'Not A Loaner',
  'Short Term Loaners',
  'Long Term Loaners',
] as const;
type DeviceStatus = (typeof DeviceStatusValues)[number];
type DeviceType = (typeof DeviceTypeValues)[number];

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
