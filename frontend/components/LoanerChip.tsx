import React from 'react';
import Chip, { ChipTypeMap } from '@mui/joy/Chip';

import { IDeviceStatus } from 'common/ext/oneToOneStatus.dto';

export default function LoanerChip({
  type,
}: {
  type: IDeviceStatus['loanerStatus'];
}) {
  const config: Record<IDeviceStatus['loanerStatus'], ChipTypeMap['props']> = {
    'Short Term Loaners': { color: 'warning' },
    'Long Term Loaners': { color: 'danger' },
    'Not A Loaner': { color: 'primary', variant: 'outlined' },
  };

  return (
    <Chip {...config[type]} sx={{ maxWidth: '100%' }}>
      {type}
    </Chip>
  );
}
