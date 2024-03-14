import React from 'react';
import Avatar from '@mui/joy/Avatar';
import { VariantProp } from '@mui/joy';

export default function DashboardAvatar({
  photo,
  size,
  variant,
  ...props
}: {
  photo?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: VariantProp;
}) {
  return (
    <Avatar
      variant={variant || 'outlined'}
      size={size || 'sm'}
      src={photo}
      slotProps={{ img: { referrerPolicy: 'no-referrer' } }}
      {...props}
    />
  );
}
