import React, { useEffect, useMemo, useState } from 'react';
import {
  Await,
  defer,
  useLoaderData,
  useNavigation,
  useSearchParams,
} from 'react-router-dom';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Sheet from '@mui/joy/Sheet';
import Table from '@mui/joy/Table';
import Button from '@mui/joy/Button';
import Code from '../../components/Code';
import IconButton from '@mui/joy/IconButton';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import Input from '@mui/joy/Input';
import Skeleton from '@mui/joy/Skeleton';
import { ApiCall } from '../../utils';

import { LoaderParams } from '../../types/loaders';
import { IDeviceStatus } from 'common/ext/oneToOneStatus.dto';

interface Device {
  id: string;
  isOnline: boolean;
  serialNumber: string;
  lastSeen: {
    timestamp: string;
    ipAddress: string;
  };
  lastUpdate: {
    timestamp: string;
    loanerStatus: IDeviceStatus['loanerStatus'];
    deviceStatus: IDeviceStatus['deviceStatus'];
    startDate: string | null;
  };
  lastUser: {
    id: string;
    googleID: string;
    email: string;
  };
}
interface PageData {
  data: {
    pages: number;
    results: Device[];
  };
}

function getPage(params: URLSearchParams) {
  const param = params.get('p');
  if (!param) return 0;

  const pageAsInt = parseInt(param);
  if (!pageAsInt) return 0;
  return Math.max(pageAsInt - 1, 0);
}

function PageSelect({
  currentPage,
  totalPages,
  gotoPage,
  disabled,
}: {
  currentPage: number;
  totalPages: number;
  gotoPage: (page: number) => void;
  disabled: boolean;
}) {
  const [initial, setInitial] = useState('');
  const [text, setText] = useState('');
  const valid = useMemo(() => {
    const pageNum = parseInt(text);
    if (!pageNum) return false;
    return pageNum - 1 < totalPages && text !== initial;
  }, [text, initial]);

  useEffect(() => {
    const value = `${currentPage + 1}`;
    setText(value);
    setInitial(value);
  }, [currentPage, totalPages]);
  return (
    <Input
      size="sm"
      value={text}
      required
      slotProps={{ input: { sx: { width: '32px' } } }}
      onChange={(e) => setText(e.target.value)}
      disabled={disabled}
      color={
        currentPage + 1 === parseInt(initial) &&
        currentPage > 0 &&
        currentPage + 1 < totalPages
          ? 'primary'
          : 'neutral'
      }
      endDecorator={
        <IconButton
          color="primary"
          variant="soft"
          disabled={!valid}
          onClick={() => gotoPage(parseInt(text))}
        >
          <Check />
        </IconButton>
      }
    />
  );
}

function DeviceEntry({ serialNumber, deviceStatus, email }) {
  return (
    <tr>
      <td>
        <Code>{serialNumber}</Code>
      </td>
      <td>{deviceStatus}</td>
      <td>{email}</td>
    </tr>
  );
}

function RowSkeleton() {
  return (
    <tr>
      <td>
        <Typography>
          <Skeleton>Lorem ipsum dolor sit.</Skeleton>
        </Typography>
      </td>
      <td>
        <Typography>
          <Skeleton>Lorem ipsum dolor sit amet.</Skeleton>
        </Typography>
      </td>
      <td>
        <Typography>
          <Skeleton>Lorem ipsum dolor.</Skeleton>
        </Typography>
      </td>
    </tr>
  );
}
function TableSkeleton() {
  return (
    <>
      <RowSkeleton />
      <RowSkeleton />
      <RowSkeleton />
    </>
  );
}

export default function Devices() {
  const data = useLoaderData() as PageData;
  const [searchParams, setSearchParams] = useSearchParams();
  const navigation = useNavigation();

  const currentPage = useMemo(() => getPage(searchParams), [searchParams]);
  const isLoading = useMemo(() => navigation.state === 'loading', [navigation]);
  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Typography level="h2">Devices</Typography>
      <Typography>Includes all enterprise enrolled Chromebooks</Typography>
      <Sheet
        variant="outlined"
        sx={{
          mt: 3,
          borderRadius: 'md',
          overflow: 'auto',
        }}
      >
        <Table
          hoverRow
          stickyHeader
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
              <th>Serial Number</th>
              <th>Status</th>
              <th>Last User</th>
            </tr>
          </thead>
          <tbody>
            <React.Suspense fallback={<TableSkeleton />}>
              <Await resolve={data.data}>
                {({ results: devices }: PageData['data']) =>
                  isLoading ? (
                    <TableSkeleton />
                  ) : (
                    devices.map(
                      ({ serialNumber, id, lastUpdate, lastUser }) => (
                        <DeviceEntry
                          serialNumber={serialNumber}
                          key={id}
                          deviceStatus={lastUpdate.deviceStatus}
                          email={lastUser.email}
                        />
                      ),
                    )
                  )
                }
              </Await>
            </React.Suspense>
          </tbody>
        </Table>
      </Sheet>
      <React.Suspense>
        <Await resolve={data.data}>
          {({ pages }: PageData['data']) => (
            <Box
              sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}
            >
              <Button
                startDecorator={<ChevronLeft />}
                variant="soft"
                disabled={currentPage === 0 || isLoading}
                onClick={() => setSearchParams({ p: `${currentPage}` })}
              >
                Previous
              </Button>
              <Box
                sx={{
                  display: 'flex',
                  gap: 1,
                  '.MuiIconButton-root': { borderRadius: '50%' },
                  alignItems: 'center',
                }}
              >
                <IconButton
                  size="sm"
                  variant="outlined"
                  color={currentPage === 0 ? 'primary' : 'neutral'}
                  onClick={() => setSearchParams({ p: '1' })}
                  disabled={isLoading}
                >
                  1
                </IconButton>
                {pages > 1 && (
                  <>
                    <PageSelect
                      currentPage={currentPage}
                      totalPages={pages}
                      gotoPage={(page) => setSearchParams({ p: `${page}` })}
                      disabled={isLoading}
                    />
                    <IconButton
                      size="sm"
                      variant="outlined"
                      color={currentPage + 1 === pages ? 'primary' : 'neutral'}
                      onClick={() => setSearchParams({ p: `${pages}` })}
                      disabled={isLoading}
                    >
                      {pages}
                    </IconButton>
                  </>
                )}
              </Box>
              <Button
                endDecorator={<ChevronRight />}
                variant="soft"
                disabled={currentPage + 1 === pages || isLoading}
                onClick={() => setSearchParams({ p: `${currentPage + 2}` })}
              >
                Next
              </Button>
            </Box>
          )}
        </Await>
      </React.Suspense>
    </Box>
  );
}

export function loadDevicesFirstPage({ request }: LoaderParams) {
  const load = () => {
    const params = new URL(request.url).searchParams;
    const page = getPage(params);
    return ApiCall(`/devices/search?page=${page}`, {
      signal: request.signal,
    }).then((req) => req.json());
  };

  return defer({
    data: load(),
  });
}
