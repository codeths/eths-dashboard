import React, { useContext, useEffect, useState } from 'react';
import {
  ActionFunction,
  Await,
  LoaderFunction,
  defer,
  json,
  useFetcher,
  useLoaderData,
  useNavigate,
} from 'react-router-dom';
import Typography from '@mui/joy/Typography';
import { AuthContext } from '../../AuthProvider';
import Box from '@mui/joy/Box';
import Sheet from '@mui/joy/Sheet';
import Table from '@mui/joy/Table';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Chip from '@mui/joy/Chip';
import Button from '@mui/joy/Button';
import Code from '../../components/Code';
import Avatar from '@mui/joy/Avatar';
import Skeleton from '@mui/joy/Skeleton';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import ModalClose from '@mui/joy/ModalClose';
import DialogTitle from '@mui/joy/DialogTitle';
import DialogActions from '@mui/joy/DialogActions';
import DialogContent from '@mui/joy/DialogContent';
import Divider from '@mui/joy/Divider';
import { AlertTriangle, ShieldCheck, Trash2 } from 'lucide-react';
import { ApiCall } from '../../utils';
import { ToastContext } from '../..//ToastProvider';

import { UserRoleName } from 'src/schemas/WebUser.schema';
import { WebUser } from '../../types/WebUser';

interface ManagementLoaderData {
  users: WebUser[];
}
interface ActionResponse {
  error: boolean;
  text: string;
}

function User({
  name,
  email,
  roles,
  userID,
  photo,
  deleteUser,
  updateRoles,
  disabled,
}: {
  name: string;
  email: string;
  roles: UserRoleName[];
  userID: string;
  photo: string | undefined;
  deleteUser: (name: string, id: string) => void;
  updateRoles: (userID: string, roles: UserRoleName[]) => void;
  disabled: boolean;
}) {
  const handleChange = (
    event: React.SyntheticEvent | null,
    roles: UserRoleName[],
  ) => {
    updateRoles(userID, roles);
  };

  return (
    <tr>
      <td>
        <Code level="body-sm">{userID}</Code>
      </td>
      <td>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Avatar
            size="sm"
            src={photo}
            slotProps={{ img: { referrerPolicy: 'no-referrer' } }}
          />
          <div>
            <Typography level="body-xs">{name}</Typography>
            <Typography level="body-xs">{email}</Typography>
          </div>
        </Box>
      </td>
      <td>
        <Select
          multiple
          defaultValue={roles}
          onChange={handleChange}
          startDecorator={<ShieldCheck />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', gap: '0.25rem' }}>
              {selected.map((selectedOption) => (
                <Chip
                  variant="soft"
                  color="primary"
                  key={`${userID}-RoleChip-${selectedOption.label}`}
                >
                  {selectedOption.label}
                </Chip>
              ))}
            </Box>
          )}
          disabled={disabled}
        >
          <Option value="View">View</Option>
          <Option value="Admin">Admin</Option>
        </Select>
      </td>
      <td>
        <Button
          variant="soft"
          color="danger"
          onClick={() => deleteUser(name, userID)}
          disabled={disabled}
        >
          <Trash2 />
        </Button>
      </td>
    </tr>
  );
}

function UserSkeleton() {
  return (
    <tr>
      <td>
        <Typography>
          <Skeleton>Lorem, ipsum dolor.</Skeleton>
        </Typography>
      </td>
      <td>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Avatar size="sm" />
          <div>
            <Typography level="body-xs">
              <Skeleton>Lorem, ipsum.</Skeleton>
            </Typography>
            <Typography level="body-xs">
              <Skeleton>user@example.com</Skeleton>
            </Typography>
          </div>
        </Box>
      </td>
      <td>
        <Typography>
          <Skeleton>Lorem, ipsum dolor.</Skeleton>
        </Typography>
      </td>
      <td>
        <Button variant="soft" color="danger" disabled>
          <Trash2 />
        </Button>
      </td>
    </tr>
  );
}

export default function Management() {
  const [open, setOpen] = useState(false);
  const [userData, setUserData] = useState({ name: '', id: '' });
  const goto = useNavigate();
  const ctx = useContext(AuthContext);
  const toastCtx = useContext(ToastContext);
  const data = useLoaderData() as ManagementLoaderData;
  const fetcher = useFetcher<ActionResponse>();

  const updateRoles = (userID: string, roles: UserRoleName[]) => {
    fetcher.submit(
      { userID, roles: JSON.stringify(roles) },
      { method: 'PATCH' },
    );
  };
  const openPrompt = (name: string, id: string) => {
    setOpen(true);
    setUserData({ name, id });
  };

  useEffect(() => {
    if (fetcher.data) {
      const { error, text } = fetcher.data;
      toastCtx?.createToast(text, error ? 'FAILURE' : 'SUCCESS');
    }
  }, [fetcher.data]);
  useEffect(() => {
    if (ctx && !ctx.user?.roles.includes('Admin')) goto('/');
  }, [ctx]);
  return (
    <Box>
      <Modal open={open} onClose={() => setOpen(false)}>
        <ModalDialog variant="outlined" color="danger">
          <ModalClose />
          <DialogTitle>
            <AlertTriangle />
            Confirmation
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ display: 'block' }}>
            Are you sure you want to delete{' '}
            <Box sx={{ fontWeight: 'lg', display: 'inline-block' }}>
              {userData.name}
            </Box>
            ?
          </DialogContent>
          <DialogActions>
            <fetcher.Form method="DELETE" onSubmit={() => setOpen(false)}>
              <input type="hidden" name="userID" value={userData.id} />
              <Button variant="solid" color="danger" type="submit">
                Delete
              </Button>
            </fetcher.Form>
            <Button
              variant="plain"
              color="neutral"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>
      <Typography level="h2">Manage Access</Typography>
      <Sheet
        variant="outlined"
        sx={{ mt: 3, borderRadius: 'md', overflow: 'hidden' }}
      >
        <Table
          hoverRow
          sx={{
            '--TableCell-headBackground':
              'var(--joy-palette-background-level1)',
            '--Table-headerUnderlineThickness': '1px',
            '--TableRow-hoverBackground':
              'var(--joy-palette-background-level1)',
            'thead th': {
              px: '6px',
              py: '12px',
              ':first-child': {
                pl: 2,
              },
            },
          }}
        >
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Roles</th>
              <th style={{ width: '68px' }} />
            </tr>
          </thead>
          <tbody>
            <React.Suspense
              fallback={
                <>
                  <UserSkeleton />
                  <UserSkeleton />
                  <UserSkeleton />
                  <UserSkeleton />
                </>
              }
            >
              <Await resolve={data.users}>
                {(users: ManagementLoaderData['users']) =>
                  users.map(({ name, email, roles, _id, photo }) => (
                    <User
                      name={name}
                      email={email}
                      roles={roles}
                      userID={_id}
                      key={_id}
                      photo={photo}
                      deleteUser={openPrompt}
                      updateRoles={updateRoles}
                      disabled={fetcher.state === 'submitting'}
                    />
                  ))
                }
              </Await>
            </React.Suspense>
          </tbody>
        </Table>
      </Sheet>
    </Box>
  );
}

export const loadManagement: LoaderFunction = ({ request }) => {
  const getUsers = () =>
    ApiCall('/access', { signal: request.signal }).then((req) => req.json());

  return defer({ users: getUsers() });
};
export const managementAction: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  let error = false;
  let text = '';

  const userID = formData.get('userID');
  switch (request.method) {
    case 'DELETE':
      try {
        const res = await ApiCall(`/access/${userID}`, { method: 'DELETE' });
        if (!res.ok) throw new Error();
        text = 'Successfully deleted user';
      } catch (err) {
        error = true;
        text = 'Failed to delete user';
      }
      break;
    case 'PATCH':
      const roles = JSON.parse(formData.get('roles') as string);
      try {
        const res = await ApiCall(`/access/${userID}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roles }),
        });
        if (!res.ok) throw new Error();
        text = 'Successfully updated roles';
      } catch (err) {
        error = true;
        text = 'Failed to update roles';
      }
      break;
  }

  return json<ActionResponse>({ error, text }, { status: 200 });
};
