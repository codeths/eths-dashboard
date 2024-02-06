import React, { ReactElement, useContext, useState } from 'react';
import { Outlet } from 'react-router-dom';
import {
  Menu,
  Home,
  Laptop,
  Users,
  Goal,
  Settings,
  UserCog,
} from 'lucide-react';
import Box from '@mui/joy/Box';
import Sheet from '@mui/joy/Sheet';
import IconButton from '@mui/joy/IconButton';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import ListItemButton from '@mui/joy/ListItemButton';
import ListItemContent from '@mui/joy/ListItemContent';
import Typography from '@mui/joy/Typography';
import Divider from '@mui/joy/Divider';
import Avatar from '@mui/joy/Avatar';
import { AuthContext } from '../AuthProvider';

export default function Layout() {
  const [open, setOpen] = useState(false);
  const authCtx = useContext(AuthContext);
  const headerHeight = '52px';
  const sidebarWidth = '220px';

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex' }}>
      <Sheet
        sx={{
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'background.level1',
          boxShadow: 'sm',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'fixed',
          top: 0,
          width: '100vw',
          height: headerHeight,
          display: { xs: 'flex', md: 'none' },
        }}
      >
        <IconButton variant="outlined" onClick={() => setOpen(true)}>
          <Menu />
        </IconButton>
      </Sheet>
      <Sheet
        sx={{
          position: { xs: 'fixed', md: 'sticky' },
          transform: {
            xs: `translateX(calc(100% * (${open ? 1 : 0} - 1)))`,
            md: 'none',
          },
          transition: 'transform 0.4s, width 0.4s',
          zIndex: 10000,
          height: '100dvh',
          width: sidebarWidth,
          top: 0,
          p: 2,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          borderRight: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box
          sx={{
            position: 'fixed',
            zIndex: 9998,
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            opacity: open ? 1 : 0,
            bgcolor: 'background.backdrop',
            transition: 'opacity 0.4s',
            transform: {
              xs: `translateX(calc(100% * (${open ? 1 : 0} - 1) + ${
                open ? 1 : 0
              } * ${sidebarWidth}))`,
              lg: 'translateX(-100%)',
            },
          }}
          onClick={() => setOpen(false)}
        />
        <Box
          sx={{
            minHeight: 0,
            overflow: 'hidden auto',
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <IconButton variant="soft" color="primary" size="sm">
              <Goal />
            </IconButton>
            <Typography level="title-lg">Dashboard</Typography>
          </Box>
          <List
            size="sm"
            sx={{
              gap: 1,
              mt: 4,
              '--ListItem-radius': (theme) => theme.vars.radius.sm,
            }}
          >
            <Link name="Home" icon={<Home />} />
            <Link name="Loaners" icon={<Laptop />} />
            <Link name="Users" icon={<Users />} />
          </List>
        </Box>
        <Box
          sx={{
            overflow: 'hidden auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <List
            size="sm"
            sx={{
              gap: 1,
              mt: 4,
              '--ListItem-radius': (theme) => theme.vars.radius.sm,
            }}
          >
            {authCtx?.user?.roles?.includes('Admin') && (
              <Link name="Manage Access" icon={<UserCog />} />
            )}
            <Link name="Settings" icon={<Settings />} />
          </List>
        </Box>
        <Divider />
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Avatar
            variant="outlined"
            size="sm"
            src={authCtx?.user?.photo}
            slotProps={{ img: { referrerPolicy: 'no-referrer' } }}
          />
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography level="title-sm">
              {authCtx?.user?.name || '-'}
            </Typography>
            <Typography level="body-xs">
              {authCtx?.user?.email || '-'}
            </Typography>
          </Box>
        </Box>
      </Sheet>
      <Box
        sx={(theme) => ({
          p: 2,
          pt: `calc(${theme.spacing(2)} + ${headerHeight})`,
          [theme.breakpoints.up('md')]: {
            px: 6,
            py: 3,
          },
        })}
      >
        <Outlet />
      </Box>
    </Box>
  );
}

function Link({ name, icon }: { name: string; icon: ReactElement }) {
  return (
    <ListItem>
      <ListItemButton>
        {icon}
        <ListItemContent>
          <Typography level="title-sm">{name}</Typography>
        </ListItemContent>
      </ListItemButton>
    </ListItem>
  );
}
