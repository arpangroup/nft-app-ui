/**
 * Every backend path in one place (relative to VITE_API_BASE_URL, e.g. "/api").
 * Paths marked TODO don't exist in trustai-2025 yet — agree them with the backend team.
 */
const e = encodeURIComponent;

export const endpoints = {
  auth: {
    login: '/auth/accessToken',
    refresh: '/auth/refresh',
    register: '/v1/register',
    logout: '/auth/logout', // TODO
  },
  home: '/v1/home', // TODO: aggregate feed (banners, trending, collections, featured)

  stakePlans: '/v1/investment-schemas',
  stakePlan: (id) => `/v1/investment-schemas/${e(id)}`,
  subscribe: '/v1/investments/subscribe',
  myStakes: '/v1/investments',
  collection: '/v1/nfts/owned', // TODO

  storeSummary: '/v1/orders/summary',
  reserveOptions: '/v1/reservations/eligibility',
  reserve: '/v1/orders/reserve',
  orders: '/v1/orders',
  sellOrder: (id) => `/v1/orders/${e(id)}/sell`,

  wallet: '/v1/wallet', // TODO: today only /wallet/balance/{userId} exists
  transactions: '/v1/transactions',
  depositInfo: '/v1/deposits/config', // TODO
  deposits: '/v1/deposits',
  withdrawInfo: '/v1/withdrawals/config', // TODO
  withdrawals: '/v1/withdrawals', // TODO

  me: '/v1/users/info',
  incomeSummary: '/v1/incomes/summary',
  team: '/v1/users/metrics/member-summary',
  referral: '/v1/users/referral', // TODO
  levels: '/v1/rankings',
  notifications: '/v1/notifications',
  notificationsRead: '/v1/notifications/viewed',
};
