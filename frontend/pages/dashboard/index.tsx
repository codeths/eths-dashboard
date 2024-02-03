import React, { useEffect } from 'react';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import Skeleton from '@mui/joy/Skeleton';
import { RadioTower } from 'lucide-react';
import { Await, defer, useLoaderData, useRevalidator } from 'react-router-dom';
import { ApiCall } from '../../utils';
import { LoaderParams } from '../../types/loaders';

interface DashboardLoaderData {
  onlineCount: number;
}

export default function Dashboard() {
  const revalidator = useRevalidator();
  const data = useLoaderData() as DashboardLoaderData;

  useEffect(() => {
    const id = setInterval(() => {
      revalidator.revalidate();
    }, 30_000);

    return () => {
      clearInterval(id);
    };
  }, []);
  useEffect(() => {
    console.log('data changed', data);
  }, [data]);
  return (
    <Box>
      <Typography level="h2">Dashboard</Typography>
      <Box sx={{ mt: 4 }}>
        <Card size="lg">
          <CardContent>
            <Typography level="body-md">Online</Typography>
            <React.Suspense
              fallback={
                <Typography level="h2">
                  <Skeleton>100</Skeleton>
                </Typography>
              }
            >
              <Await
                resolve={data.onlineCount}
                errorElement={
                  <Typography level="h2" color="danger">
                    ERROR
                  </Typography>
                }
              >
                {(onlineCount: number) => (
                  <Typography level="h2" startDecorator={<RadioTower />}>
                    {onlineCount.toLocaleString()}
                  </Typography>
                )}
              </Await>
            </React.Suspense>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

export function loadDashboard({ request }: LoaderParams) {
  const getOnlineCount = () =>
    ApiCall('/devices/online', { signal: request.signal })
      .then((req) => req.json())
      .then((data) => data.count);

  return defer({
    onlineCount: getOnlineCount(),
  });
}
