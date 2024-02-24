import { OneToOneService } from 'src/integrations/OneToOne.service';
import type { MigrationAction } from 'src/migrations.service';

export const up: MigrationAction = async ({ context }) => {
  const {
    mongoose: { db },
    moduleRef,
  } = context;
  const oneToOne = moduleRef.get(OneToOneService, { strict: false });

  const query = [
    {
      $lookup: {
        from: 'events',
        localField: '_id',
        foreignField: 'metadata.device',
        as: 'result',
      },
    },
    {
      $set: {
        field: {
          $filter: {
            input: '$result',
            as: 'event',
            cond: {
              $eq: ['$$event.__t', 'OneToOneStatusUpdateV1'],
            },
            limit: 1,
          },
        },
      },
    },
    {
      $match: {
        $expr: {
          $eq: [
            {
              $size: '$field',
            },
            0,
          ],
        },
      },
    },
    {
      $project: {
        _id: 1,
        serialNumber: 1,
      },
    },
  ];

  const devices = await db.collection('devices').aggregate(query).toArray();

  const requests = devices.map(async ({ serialNumber, _id }) => {
    const req = await oneToOne.getResponseFromOneToOne(serialNumber, {
      timeout: 2 * 60_000,
    });
    if (!req.data.success)
      throw new Error(`Failed to get status of ${serialNumber}`);
    if (!req.data.object)
      throw new Error(
        `Failed to get status of ${serialNumber}: no response body`,
      );

    await oneToOne.generateStatusEvent(req.data.object, _id);
    console.log('Migrated', serialNumber);

    return req.data;
  });

  await Promise.all(requests);
};
export const down: MigrationAction = async ({ context }) => {};
