import React from 'react';
import Typography from '@mui/joy/Typography';
import Grid from '@mui/joy/Grid';
import Button from '@mui/joy/Button';
import GoogleLogo from '../../static/google.svg';

export default function Login() {
  return (
    <Grid
      container
      sx={{
        flexGrow: 1,
        height: '100vh',
        bgcolor: 'background.level2',
      }}
    >
      <Grid
        xs={12}
        md={6}
        sx={{
          bgcolor: 'background.surface',
          display: 'grid',
          placeContent: 'center',
        }}
      >
        <Typography level="h1" sx={{ mb: 4 }}>
          ETHS Tools Dashboard
        </Typography>
        <Button
          startDecorator={<img src={GoogleLogo} alt="logo" width="20px" />}
          variant="outlined"
          size="lg"
          component="a"
          href="/api/auth/google"
        >
          Continue with Google
        </Button>
      </Grid>
    </Grid>
  );
}
