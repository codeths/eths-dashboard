import React, { createContext, useState } from 'react';
import Snackbar, { SnackbarCloseReason } from '@mui/joy/Snackbar';
import { ColorPaletteProp } from '@mui/joy';

type MessageStatus = 'SUCCESS' | 'FAILURE';

const ToastContext = createContext<{
  createToast: (text: string, status: MessageStatus) => void;
} | null>(null);

function ToastProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [color, setColor] = useState<ColorPaletteProp>('neutral');

  const createToast = (text: string, status: MessageStatus) => {
    switch (status) {
      case 'SUCCESS':
        setColor('success');
        break;
      case 'FAILURE':
        setColor('danger');
        break;
    }
    setText(text);
    setOpen(true);
  };
  const close = (event, reason: SnackbarCloseReason) => {
    if (reason === 'clickaway') return;

    setOpen(false);
  };
  return (
    <ToastContext.Provider value={{ createToast }}>
      <Snackbar
        open={open}
        color={color}
        autoHideDuration={6_000}
        onClose={close}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ zIndex: 9100 }}
      >
        {text}
      </Snackbar>
      {children}
    </ToastContext.Provider>
  );
}

export { ToastContext, ToastProvider };
