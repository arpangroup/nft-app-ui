import { endpoints as ep } from './endpoints';
import { http } from './httpClient';
import * as m from './mappers';

/**
 * REAL BACKEND ADAPTER (trustai-2025 Spring Boot).
 * When the API is ready, this folder is the only place to change:
 *   1. fix paths in endpoints.js
 *   2. adjust mappers.js if backend field names differ from the models in ../contract.js
 * Nothing in screens/ or context/ needs to change.
 */
export const httpApi = {
  // Auth
  login: async ({ username, password }) => m.toAuth(await http.post(ep.auth.login, { username, password, flow: 'password' }, { auth: false })),
  register: async (body) => m.toAuth(await http.post(ep.auth.register, { ...body, referralCode: body.inviteCode }, { auth: false })),
  logout: () => http.post(ep.auth.logout, {}).catch(() => undefined),

  // Home
  getHomeFeed: async () => {
    const r = await http.get(ep.home);
    return { ...r, featured: m.many(m.toStakePlan)(r.featured) };
  },

  // Explore / stake
  getStakePlans: async ({ category } = {}) => m.many(m.toStakePlan)(await http.get(ep.stakePlans, { query: { type: 'STAKE', category } })),
  getStakePlan: async (id) => m.toStakePlan(await http.get(ep.stakePlan(id))),
  subscribeStake: async ({ planId, amount }) => {
    const r = await http.post(ep.subscribe, { schemaId: planId, amount });
    return { stake: m.toMyStake(r.investment || r), wallet: m.toWallet(r.wallet) };
  },
  getMyStakes: async () => m.many(m.toMyStake)(await http.get(ep.myStakes)),
  getCollection: async () => m.content(await http.get(ep.collection)),

  // Reserve / store
  getStoreSummary: async () => m.toStoreSummary(await http.get(ep.storeSummary)),
  getReserveOptions: async () => (await http.get(ep.reserveOptions)).map(m.toReserveOption),
  reserve: async ({ rankCode, amount }) => ({ order: m.toOrder(await http.post(ep.reserve, { rankCode, amount })) }),
  getOrders: async ({ status } = {}) => m.many(m.toOrder)(await http.get(ep.orders, { query: { status } })),
  sellOrder: async (id) => {
    const r = await http.post(ep.sellOrder(id), {});
    return { order: m.toOrder(r?.order) || { id, status: 'SOLD' }, wallet: m.toWallet(r?.wallet) };
  },

  // Wallet
  getWallet: async () => m.toWallet(await http.get(ep.wallet)),
  getTransactions: async ({ type } = {}) => m.many(m.toTransaction)(await http.get(ep.transactions, { query: { type, size: 50 } })),
  getDepositInfo: () => http.get(ep.depositInfo),
  submitDeposit: async ({ networkId, amount, txHash }) => {
    const r = await http.post(ep.deposits, { paymentGateway: networkId, amount, txnRefId: txHash, currencyCode: 'USDT' });
    return { transaction: m.toTransaction(r.transaction || r.data || r) };
  },
  getWithdrawInfo: () => http.get(ep.withdrawInfo),
  withdraw: async (body) => {
    const r = await http.post(ep.withdrawals, body);
    return { transaction: m.toTransaction(r.transaction), wallet: m.toWallet(r.wallet) };
  },

  // Account
  getProfile: async () => m.toUser(await http.get(ep.me)),
  getIncomeSummary: async () => (await http.get(ep.incomeSummary)).map(m.toIncome),
  getTeam: async () => m.toTeam(await http.get(ep.team)),
  getReferral: () => http.get(ep.referral),
  getLevels: async () => (await http.get(ep.levels)).map(m.toLevel),
  getNotifications: async () => m.many(m.toNotification)(await http.get(ep.notifications)),
  markNotificationsRead: async () => {
    const list = m.content(await http.get(ep.notifications)).filter((n) => !n.viewed);
    if (list.length) await http.patch(ep.notificationsRead, list.map((n) => n.id));
  },
};
