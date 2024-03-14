import React from 'react';
import Sheet from '@mui/joy/Sheet';
import Typography from '@mui/joy/Typography';

export default function Code({ children, ...props }) {
  return (
    <Sheet
      sx={{
        width: 'fit-content',
        px: 1,
        py: 0.5,
        borderRadius: 'sm',
        bgcolor: 'background.level2',
        overflow: 'hidden',
        maxWidth: '100%',
        wordWrap: 'break-word',
      }}
    >
      <Typography sx={{ fontFamily: 'monospace' }} {...props}>
        {children}
      </Typography>
    </Sheet>
  );
}
