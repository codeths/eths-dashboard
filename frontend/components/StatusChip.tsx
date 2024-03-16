import React from 'react';
import Chip, { ChipTypeMap } from '@mui/joy/Chip';
import {
  CheckCircle,
  SquareUser,
  CircleSlash,
  XCircle,
  Zap,
  HeartPulse,
  Wrench,
  AlertTriangle,
  Receipt,
} from 'lucide-react';

import { IDeviceStatus } from 'common/ext/oneToOneStatus.dto';

export default function StatusChip({
  type,
}: {
  type: IDeviceStatus['deviceStatus'];
}) {
  const config: Record<IDeviceStatus['deviceStatus'], ChipTypeMap['props']> = {
    Available: { color: 'success', startDecorator: <CheckCircle /> },
    Broken: { color: 'danger', startDecorator: <XCircle /> },
    Charging: { color: 'warning', startDecorator: <Zap /> },
    Deprovisioned: { color: 'neutral', startDecorator: <CircleSlash /> },
    'Given to Assignee': { color: 'primary', startDecorator: <SquareUser /> },
    'In-house Troubleshooting/Repair': {
      color: 'danger',
      startDecorator: <HeartPulse />,
    },
    'Insurance Repair': { color: 'warning', startDecorator: <Wrench /> },
    'Invoiced - Waiting for Payment': {
      color: 'primary',
      startDecorator: <Receipt />,
    },
    'Lost/Stolen': { color: 'danger', startDecorator: <AlertTriangle /> },
    'Warranty Repair': { color: 'warning', startDecorator: <Wrench /> },
  };

  return (
    <Chip {...config[type]} sx={{ maxWidth: '100%' }}>
      {type}
    </Chip>
  );
}
