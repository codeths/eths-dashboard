import React from 'react';
import Box from '@mui/joy/Box';
import Sheet from '@mui/joy/Sheet';
import Typography from '@mui/joy/Typography';
import { useRouteError } from 'react-router-dom';

export default function CrashHandler() {
  const error = useRouteError() as Error;
  console.error('crash:', error);

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <Sheet
        color="danger"
        variant="outlined"
        sx={{ p: 8, borderRadius: 'lg', maxWidth: '50%' }}
      >
        <Typography level="h1" color="danger">
          Uh oh!
        </Typography>
        <Typography level="h3" sx={{ mb: 3 }}>
          Something went wrong.
        </Typography>
        <Typography gutterBottom>{error.message || 'unknown error'}</Typography>
        <Typography variant="soft">{error.stack || '-'}</Typography>
      </Sheet>
    </Box>
  );
}
