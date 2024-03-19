export const sortValues = [
  'serial',
  'lastSeen',
  'status',
  'user',
  'loaner',
] as const;
export type SortValue = (typeof sortValues)[number];

export const sortOrders = ['asc', 'desc'] as const;
export type OrderValue = (typeof sortOrders)[number];
