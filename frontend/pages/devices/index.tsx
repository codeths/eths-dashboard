import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
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
import {
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  Check,
  ChevronLeft,
  ChevronRight,
  Power,
  PowerOff,
} from 'lucide-react';
import Input from '@mui/joy/Input';
import Skeleton from '@mui/joy/Skeleton';
import Chip from '@mui/joy/Chip';
import StatusChip from '../../components/StatusChip';
import LoanerChip from '../../components/LoanerChip';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import { ApiCall } from '../../utils';

import { LoaderParams } from '../../types/loaders';
import {
  DeviceStatusValues,
  DeviceTypeValues,
  IDeviceStatus,
} from 'common/ext/oneToOneStatus.dto';
import {
  OrderValue,
  SortValue,
  sortOrders,
  sortValues,
} from 'common/web/deviceSort';

interface Device<DateFormat> {
  id: string;
  isOnline: boolean;
  serialNumber: string;
  lastSeen: {
    timestamp: DateFormat;
    ipAddress: string;
  };
  lastUpdate: {
    timestamp: DateFormat;
    loanerStatus: IDeviceStatus['loanerStatus'];
    deviceStatus: IDeviceStatus['deviceStatus'];
    startDate: DateFormat | null;
  };
  lastUser: {
    id: string;
    googleID: string;
    email: string;
  };
}
interface PageData<DateFormat> {
  data: {
    pages: number;
    results: Device<DateFormat>[];
  };
}
type PageDataRaw = PageData<string>;
type PageDataParsed = PageData<Date>;

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

function DeviceEntry({
  serialNumber,
  deviceStatus,
  email,
  isOnline,
  lastSeen,
  loanerStatus,
}: {
  serialNumber: string;
  deviceStatus: IDeviceStatus['deviceStatus'];
  isOnline: boolean;
  email: string;
  lastSeen: Date;
  loanerStatus: IDeviceStatus['loanerStatus'];
}) {
  return (
    <tr>
      <td>
        <Code level="body-sm">{serialNumber}</Code>
      </td>
      <td>
        <Box
          sx={{ display: 'flex', flexWrap: 'wrap', columnGap: 2, rowGap: 1 }}
        >
          {lastSeen.toLocaleString()}
          {isOnline ? (
            <Chip startDecorator={<Power />} color="success">
              Online
            </Chip>
          ) : (
            <Chip startDecorator={<PowerOff />}>Offline</Chip>
          )}
        </Box>
      </td>
      <td>
        <StatusChip type={deviceStatus} />
      </td>
      <td>
        <Box sx={{ wordWrap: 'break-word' }}>{email}</Box>
      </td>
      <td>
        <LoanerChip type={loanerStatus} />
      </td>
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
      <td>
        <Typography>
          <Skeleton>Lorem ipsum.</Skeleton>
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

const HeaderContext = createContext<{
  active?: SortValue | null;
  toggleCol: (col: SortValue) => void;
  isLoading: boolean;
  order: OrderValue;
} | null>(null);
function SortHeader({ children, type }: { children: any; type: SortValue }) {
  const context = useContext(HeaderContext);
  const isActive = useMemo(() => context?.active === type, [context, type]);
  const decorator = useMemo(() => {
    if (isActive && context) {
      return context.order === 'desc' ? (
        <ArrowDownWideNarrow />
      ) : (
        <ArrowUpWideNarrow />
      );
    }
  }, [isActive, context]);
  return (
    <th>
      <Button
        size="sm"
        variant="plain"
        startDecorator={decorator}
        onClick={() => context?.toggleCol(type)}
        disabled={context?.isLoading}
      >
        {children}
      </Button>
    </th>
  );
}

function isStatusValue(
  value: string,
): value is IDeviceStatus['deviceStatus'] | 'all' {
  return (
    value === 'all' ||
    DeviceStatusValues.includes(value as IDeviceStatus['deviceStatus'])
  );
}
function isTypeValue(
  value: string,
): value is IDeviceStatus['loanerStatus'] | 'all' {
  return (
    value === 'all' ||
    DeviceTypeValues.includes(value as IDeviceStatus['loanerStatus'])
  );
}
function isSortValue(value: string | null): value is SortValue | null {
  return value === null || sortValues.includes(value as SortValue);
}
function isOrderValue(value: string | null): value is OrderValue | null {
  return value === null || sortOrders.includes(value as OrderValue);
}

export default function Devices() {
  const data = useLoaderData() as PageDataParsed;
  const [searchParams, setSearchParams] = useSearchParams();
  const navigation = useNavigation();
  const [statusValue, setStatusValue] = useState<
    IDeviceStatus['deviceStatus'] | 'all'
  >('all');
  const [typeValue, setTypeValue] = useState<
    IDeviceStatus['loanerStatus'] | 'all'
  >('all');
  const [activeCol, setActiveCol] = useState<SortValue | null>(null);
  const [order, setOrder] = useState<OrderValue>('desc');

  const setFilter = (
    key: 'p' | 'status' | 'type' | 'sort' | 'order',
    value: string | number,
  ) => {
    setSearchParams((prev) => {
      if (key !== 'p') prev.delete('p');

      if (['status', 'type'].includes(key) && value === 'all') {
        prev.delete(key);
      } else if (key === 'sort') {
        prev.set('order', 'desc');
        prev.set('sort', value as string);
      } else {
        prev.set(key, typeof value === 'number' ? `${value}` : value);
      }

      return prev;
    });
  };

  const toggleCol = (col: SortValue) => {
    if (col === activeCol) {
      setFilter('order', order === 'asc' ? 'desc' : 'asc');
    } else {
      setFilter('sort', col);
    }
  };

  const currentPage = useMemo(() => {
    const status = searchParams.get('status') || 'all';
    if (isStatusValue(status)) setStatusValue(status);

    const type = searchParams.get('type') || 'all';
    if (isTypeValue(type)) setTypeValue(type);

    const sort = searchParams.get('sort');
    if (isSortValue(sort)) setActiveCol(sort);

    const searchOrder = searchParams.get('order');
    if (isOrderValue(searchOrder)) setOrder(searchOrder || 'desc');

    return getPage(searchParams);
  }, [searchParams]);
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
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <FormControl>
          <FormLabel>Status</FormLabel>
          <Select
            size="sm"
            value={statusValue}
            sx={{ minWidth: '180px' }}
            onChange={(_, e) => e && setFilter('status', e)}
            disabled={isLoading}
          >
            <Option value="all">All</Option>
            <Option value="Available">Available</Option>
            <Option value="Broken">Broken</Option>
            <Option value="Charging">Charging</Option>
            <Option value="Deprovisioned">Deprovisioned</Option>
            <Option value="Given to Assignee">Given to Assignee</Option>
            <Option value="In-house Troubleshooting/Repair">
              In-house Troubleshooting/Repair
            </Option>
            <Option value="Insurance Repair">Insurance Repair</Option>
            <Option value="Invoiced - Waiting for Payment">
              Invoiced - Waiting for Payment
            </Option>
            <Option value="Lost/Stolen">Lost/Stolen</Option>
            <Option value="Warranty Repair">Warranty Repair</Option>
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel>Type</FormLabel>
          <Select
            size="sm"
            value={typeValue}
            sx={{ minWidth: '160px' }}
            onChange={(_, e) => e && setFilter('type', e)}
            disabled={isLoading}
          >
            <Option value="all">All</Option>
            <Option value="Short Term Loaners">Short Term Loaners</Option>
            <Option value="Long Term Loaners">Long Term Loaners</Option>
            <Option value="Not A Loaner">Not A Loaner</Option>
          </Select>
        </FormControl>
      </Box>
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
              <HeaderContext.Provider
                value={{ active: activeCol, toggleCol, isLoading, order }}
              >
                <SortHeader type="serial">Serial Number</SortHeader>
                <SortHeader type="lastSeen">Last Seen</SortHeader>
                <SortHeader type="status">Status</SortHeader>
                <SortHeader type="user">Last User</SortHeader>
                <SortHeader type="loaner">Device Type</SortHeader>
              </HeaderContext.Provider>
            </tr>
          </thead>
          <tbody>
            <React.Suspense fallback={<TableSkeleton />}>
              <Await resolve={data.data}>
                {({ results: devices }: PageDataParsed['data']) =>
                  isLoading ? (
                    <TableSkeleton />
                  ) : devices.length > 0 ? (
                    devices.map(
                      ({
                        serialNumber,
                        id,
                        lastUpdate,
                        lastUser,
                        isOnline,
                        lastSeen,
                      }) => (
                        <DeviceEntry
                          serialNumber={serialNumber}
                          key={id}
                          deviceStatus={lastUpdate.deviceStatus}
                          email={lastUser.email}
                          isOnline={isOnline}
                          lastSeen={lastSeen.timestamp}
                          loanerStatus={lastUpdate.loanerStatus}
                        />
                      ),
                    )
                  ) : (
                    <td colSpan={5}>
                      <Box
                        sx={{ display: 'grid', placeContent: 'center', py: 4 }}
                      >
                        <Typography level="h4">No results</Typography>
                      </Box>
                    </td>
                  )
                }
              </Await>
            </React.Suspense>
          </tbody>
        </Table>
      </Sheet>
      <React.Suspense>
        <Await resolve={data.data}>
          {({ pages }: PageDataParsed['data']) => (
            <Box
              sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}
            >
              <Button
                startDecorator={<ChevronLeft />}
                variant="soft"
                disabled={currentPage === 0 || isLoading}
                onClick={() => setFilter('p', currentPage)}
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
                  onClick={() => setFilter('p', 1)}
                  disabled={isLoading}
                >
                  1
                </IconButton>
                {pages > 1 && (
                  <>
                    <PageSelect
                      currentPage={currentPage}
                      totalPages={pages}
                      gotoPage={(page) => setFilter('p', page)}
                      disabled={isLoading}
                    />
                    <IconButton
                      size="sm"
                      variant="outlined"
                      color={currentPage + 1 === pages ? 'primary' : 'neutral'}
                      onClick={() => setFilter('p', pages)}
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
                disabled={currentPage + 1 >= pages || isLoading}
                onClick={() => setFilter('p', currentPage + 2)}
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
    const otherProps: string[] = [];
    for (const key of ['status', 'type', 'sort', 'order']) {
      const rawValue = params.get(key);
      if (rawValue !== null)
        otherProps.push(`${key}=${encodeURIComponent(rawValue)}`);
    }

    return ApiCall(
      `/devices/search?page=${page}${
        otherProps.length ? `&${otherProps.join('&')}` : ''
      }`,
      {
        signal: request.signal,
      },
    )
      .then((req) => {
        if (!req.ok) {
          throw new Error(`Device search failed: error ${req.status}`);
        } else {
          return req.json();
        }
      })
      .then(
        ({ pages, results }: PageDataRaw['data']): PageDataParsed['data'] => {
          const parsed = results.map(
            ({
              lastSeen: deviceLastSeen,
              lastUpdate: deviceLastUpdate,
              ...deviceRest
            }) => {
              const { timestamp: lastSeenTime, ...lastSeenRest } =
                deviceLastSeen;
              const lastSeen = {
                timestamp: new Date(lastSeenTime),
                ...lastSeenRest,
              };
              const {
                timestamp: lastUpdatedTime,
                startDate: startDateTime,
                ...lastUpdatedRest
              } = deviceLastUpdate;
              const lastUpdate = {
                timestamp: new Date(lastUpdatedTime),
                startDate:
                  startDateTime !== null
                    ? new Date(startDateTime)
                    : startDateTime,
                ...lastUpdatedRest,
              };

              return {
                lastSeen,
                lastUpdate,
                ...deviceRest,
              };
            },
          );

          return {
            pages,
            results: parsed,
          };
        },
      );
  };

  return defer({
    data: load(),
  });
}

export { default as SearchError } from './searchError';
