import React from 'react';
import Typography from '@mui/joy/Typography';

export default function SearchError() {
  return (
    <>
      <Typography color="danger" level="h2">
        Error
      </Typography>
      <Typography>
        Something went wrong when we tried to search. Try again?
      </Typography>
    </>
  );
}
