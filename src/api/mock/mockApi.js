import { env } from '../../config/env';
import { ApiError, ErrorCodes } from '../errors';
import * as seed from './mockData';

/**
 * MOCK BACKEND ADAPTER — implements src/api/contract.js against a local "database".
 * It behaves like the real server: owns the wallet, checks balance/level/limits,
 * matches reservations to NFTs after a few seconds, settles deposits, and pays income.
 * State is saved to localStorage (key below), so reloads keep your stakes/orders.
 * Reset it with:  localStorage.removeItem('trustai.mockdb')  — or clear site data.
 */

const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const MATCH_MS = 8000; // reservation PROCESSING -> BOUGHT (demo speed)
const DEPOSIT_SETTLE_MS = 10000; // deposit PENDING -> SUCCESS (demo speed)
const MAX_RESERVATIONS_PER_DAY = 1;
const DB_KEY = 'trustai.mockdb';

// ---------- helpers ----------
const clone = (v) => (v === undefined ? v : structuredClone(v));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const round2 = (n) => Math.round(n * 100) / 100;
const iso = (t) => new Date(t).toISOString();
const fail = (message, code, status = 400) => {
  throw new ApiError(message, { code, status });
};
let seq = 5000;
const nextId = (p) => `${p}${++seq}`;
const orderNo = () => `19${Date.now().toString().slice(-10)}${String(++seq).slice(-4)}`;
const startOfTomorrow = () => {
  const d = new Date();
  d.setHours(24, 0, 0, 0);
  return d.getTime();
};
const isToday = (t) => new Date(t).toDateString() === new Date().toDateString();

const nftById = Object.fromEntries(seed.nfts.map((n) => [n.id, n]));
const planById = Object.fromEntries(seed.stakePlans.map((p) => [p.id, p]));
const levelByCode = Object.fromEntries(seed.levels.map((l) => [l.code, l]));
const incomeRate = (rankCode) => round2(parseFloat(levelByCode[rankCode]?.income) + 0.1) || 1.5;

// ---------- world builders ----------
function buildStake(planId, amount, subscribedAt) {
  const plan = planById[planId];
  const periodMs = plan.payoutFrequency === 'Weekly' ? 7 * DAY : DAY;
  const perPeriodProfit = round2((amount * plan.roiPercent) / 100);
  const completedPeriods = Math.min(Math.floor((Date.now() - subscribedAt) / periodMs), plan.periods);
  const expectedReturn = round2(perPeriodProfit * plan.periods);
  const matured = completedPeriods >= plan.periods;
  return {
    id: nextId('st'),
    planId,
    name: plan.title,
    artSeed: plan.artSeed,
    investedAmount: amount,
    roiPercent: plan.roiPercent,
    perPeriodProfit,
    totalPeriods: plan.periods,
    completedPeriods,
    receivedReturn: round2(perPeriodProfit * completedPeriods),
    expectedReturn,
    totalEarningPotential: round2(expectedReturn + (plan.capitalBack ? amount : 0)),
    nextReturnAmount: matured ? 0 : perPeriodProfit,
    earlyExitPenalty: round2(amount * 0.1),
    subscribedAt: iso(subscribedAt),
    nextPayoutDate: matured ? null : iso(subscribedAt + (completedPeriods + 1) * periodMs),
    maturityAt: iso(subscribedAt + plan.periods * periodMs),
    payoutFrequency: plan.payoutFrequency,
    status: matured ? 'MATURED' : 'ACTIVE',
  };
}

function buildOrder({ nftId, rankCode, amount, reservedAt, status }) {
  const order = {
    id: nextId('o'),
    orderNo: orderNo(),
    nftName: null,
    artSeed: null,
    rankCode,
    reservedAmount: amount,
    price: amount,
    reservedAt: iso(reservedAt),
    expiryAt: iso(reservedAt + DAY),
    incomeEarned: 0,
    returnRate: incomeRate(rankCode),
    handlingFee: 0,
    status: 'PROCESSING',
  };
  if (status !== 'PROCESSING') matchOrder(order, nftId);
  if (status === 'SOLD') order.status = 'SOLD';
  return order;
}

function matchOrder(order, nftId) {
  const nft = nftById[nftId] || seed.nfts[Math.floor(Math.random() * seed.nfts.length)];
  order.nftName = nft.name;
  order.artSeed = nft.artSeed;
  order.incomeEarned = round2((order.reservedAmount * order.returnRate) / 100);
  order.price = round2(order.reservedAmount + order.incomeEarned);
  order.status = 'BOUGHT';
}

function demoAccount() {
  const now = Date.now();
  const orders = seed.orderSeed.map(([nftId, rankCode, amount, daysAgo, status]) =>
    buildOrder({ nftId, rankCode, amount, reservedAt: now - daysAgo * DAY - 3 * HOUR, status })
  );
  return {
    user: { ...seed.DEMO_USER },
    wallet: { ...seed.WALLET, frozen: orders.filter((o) => o.status !== 'SOLD').reduce((s, o) => s + o.reservedAmount, 0) },
    stakes: seed.myStakeSeed.map(([planId, amount, daysAgo]) => buildStake(planId, amount, now - daysAgo * DAY - 2 * HOUR)),
    orders,
    transactions: seed.transactionSeed.map(([type, title, amount, hoursAgo, status]) => ({
      id: nextId('t'), type, title, amount, status, createdAt: iso(now - hoursAgo * HOUR), txnRef: `TX${nextId('')}`,
    })),
    notifications: seed.notificationSeed.map(([type, title, message, hoursAgo, viewed]) => ({
      id: nextId('nt'), type, title, message, viewed, createdAt: iso(now - hoursAgo * HOUR),
    })),
    owned: [...seed.ownedNftIds],
    income: clone(seed.incomeSummary),
    members: seed.members.map(({ daysAgo, ...m }) => ({ ...m, joinedAt: iso(now - daysAgo * DAY) })),
  };
}

function freshAccount(user) {
  return {
    user,
    wallet: { balance: 10, frozen: 0, todayEarning: 0, cumulativeIncome: 0 },
    stakes: [],
    orders: [],
    transactions: [{ id: nextId('t'), type: 'REWARD', title: 'Sign-up bonus', amount: 10, status: 'SUCCESS', createdAt: iso(Date.now()), txnRef: `TX${nextId('')}` }],
    notifications: [{ id: nextId('nt'), type: 'SYSTEM', title: 'Welcome to TrustAI 🎉', message: '10 USDT sign-up bonus has been added to your wallet.', viewed: false, createdAt: iso(Date.now()) }],
    owned: [],
    income: seed.incomeSummary.map((i) => ({ ...i, today: 0, total: i.type === 'ACTIVITY' ? 10 : 0 })),
    members: [],
  };
}

// ---------- state (persisted) ----------
function loadDb() {
  try {
    const db = JSON.parse(localStorage.getItem(DB_KEY));
    if (db?.accounts && db?.passwords) {
      seq = Math.max(seq, db.seq || 0);
      return db;
    }
  } catch {
    /* corrupt or unavailable storage – start fresh */
  }
  return { accounts: { demo: demoAccount() }, passwords: { demo: seed.DEMO_USER.password } };
}
const { accounts, passwords } = loadDb();
const saveDb = () => {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify({ accounts, passwords, seq }));
  } catch {
    /* storage full or blocked – keep in memory */
  }
};
let me = null; // current account

const authed = () => me || fail('Session expired, please sign in again', ErrorCodes.UNAUTHORIZED, 401);
const tokensFor = (username) => ({ accessToken: `mock.${username}.${Date.now()}`, refreshToken: `mock-refresh.${username}` });
const walletOut = (a) => ({ ...a.wallet, balance: round2(a.wallet.balance), currency: env.currency });

function addTxn(a, type, title, amount, status = 'SUCCESS') {
  const t = { id: nextId('t'), type, title, amount: round2(amount), status, createdAt: iso(Date.now()), txnRef: `TX${nextId('')}` };
  a.transactions.unshift(t);
  return t;
}
function notify(a, type, title, message) {
  a.notifications.unshift({ id: nextId('nt'), type, title, message, viewed: false, createdAt: iso(Date.now()) });
}
function addIncome(a, type, amount) {
  for (const row of a.income.filter((i) => i.type === type || i.type === 'DAILY')) {
    row.today = round2(row.today + amount);
    row.total = round2(row.total + amount);
  }
  a.wallet.todayEarning = round2(a.wallet.todayEarning + amount);
  a.wallet.cumulativeIncome = round2(a.wallet.cumulativeIncome + amount);
}

/** Advances time-based state (reservation matching, deposit settlement) before every read. */
function tick(a) {
  const now = Date.now();
  for (const o of a.orders) {
    if (o.status === 'PROCESSING' && now - Date.parse(o.reservedAt) >= MATCH_MS) {
      matchOrder(o);
      notify(a, 'ORDER', 'Reservation matched', `${o.nftName} was matched to your reservation. You can sell it now.`);
    }
  }
  for (const t of a.transactions) {
    if (t.type === 'DEPOSIT' && t.status === 'PENDING' && now - Date.parse(t.createdAt) >= DEPOSIT_SETTLE_MS) {
      t.status = 'SUCCESS';
      a.wallet.balance = round2(a.wallet.balance + t.amount);
      notify(a, 'WALLET', 'Deposit confirmed', `${t.amount} ${env.currency} has been credited to your wallet.`);
    }
  }
}

const reserveOptionsFor = (a) =>
  seed.levels.map((l) => ({
    rankCode: l.code,
    label: `LV${l.level + 1}`,
    minAmount: l.min,
    maxAmount: l.max,
    incomeRange: l.income,
    enabled: l.level <= a.user.level,
  }));

function storeSummary(a) {
  const lvl = seed.levels[a.user.level];
  const reservedToday = a.orders.filter((o) => isToday(Date.parse(o.reservedAt))).length;
  const count = (s) => a.orders.filter((o) => o.status === s).length;
  return {
    todayEarning: a.wallet.todayEarning,
    cumulativeIncome: a.wallet.cumulativeIncome,
    walletBalance: round2(a.wallet.balance),
    reservationRange: { min: lvl.min, max: lvl.max },
    reservedToday,
    maxReservationsPerDay: MAX_RESERVATIONS_PER_DAY,
    nextRoundAt: reservedToday >= MAX_RESERVATIONS_PER_DAY ? iso(startOfTomorrow()) : null,
    totalOrders: a.orders.length,
    processingOrders: count('PROCESSING'),
    boughtOrders: count('BOUGHT'),
    soldOrders: count('SOLD'),
  };
}

// ---------- adapter ----------
const impl = {
  // Auth
  login({ username, password }) {
    const name = String(username || '').trim();
    if (!name || !password) fail('Please enter your account and password', ErrorCodes.VALIDATION);
    if (passwords[name] && passwords[name] !== password) fail('Incorrect account or password', ErrorCodes.INVALID_CREDENTIALS, 401);
    if (!passwords[name] && password.length < 6) fail('Incorrect account or password', ErrorCodes.INVALID_CREDENTIALS, 401);
    if (!accounts[name]) {
      // Any new username "just works" locally so testers aren't blocked.
      passwords[name] = password;
      accounts[name] = freshAccount({ ...seed.DEMO_USER, id: nextId('u'), username: name, uid: String(80000000 + seq), level: 0, points: 0, inviteCode: `TR${name.slice(0, 4).toUpperCase()}${seq % 100}`, avatarSeed: name, email: '', phone: '' });
    }
    me = accounts[name];
    return { ...tokensFor(name), user: me.user };
  },
  register({ username, password, phone, email, inviteCode }) {
    const name = String(username || '').trim();
    if (name.length < 4) fail('Account must be at least 4 characters', ErrorCodes.VALIDATION);
    if (!password || password.length < 6) fail('Password must be at least 6 characters', ErrorCodes.VALIDATION);
    if (accounts[name]) fail('This account name is already taken', ErrorCodes.USERNAME_TAKEN, 409);
    const code = String(inviteCode || '').trim().toUpperCase();
    if (![...seed.INVITE_CODES, seed.DEMO_USER.inviteCode].includes(code)) fail('Invalid invitation code', ErrorCodes.INVALID_INVITE);
    passwords[name] = password;
    accounts[name] = freshAccount({ id: nextId('u'), username: name, uid: String(80000000 + seq * 7), email: email || '', phone: phone || '', level: 0, points: 0, inviteCode: `TR${name.slice(0, 4).toUpperCase()}${seq % 100}`, avatarSeed: name, joinedAt: iso(Date.now()) });
    me = accounts[name];
    return { ...tokensFor(name), user: me.user };
  },
  logout() {
    me = null;
  },

  // Home
  getHomeFeed() {
    return {
      banners: seed.banners,
      categories: seed.categories,
      trending: [...seed.nfts].sort((a, b) => b.likes - a.likes),
      collections: seed.collections,
      featured: seed.stakePlans.filter((p) => p.status === 'OPEN').slice(0, 4),
    };
  },

  // Explore / stake
  getStakePlans({ category } = {}) {
    return seed.stakePlans.filter((p) => !category || category === 'all' || p.category === category);
  },
  getStakePlan(id) {
    return planById[id] || fail('This NFT is no longer available', ErrorCodes.NOT_FOUND, 404);
  },
  subscribeStake({ planId, amount }) {
    const a = authed();
    const plan = impl.getStakePlan(planId);
    const value = Number(amount);
    if (plan.status !== 'OPEN') fail('This stake pool is sold out', ErrorCodes.VALIDATION);
    const [minL, maxL] = plan.levelRange;
    if (a.user.level < minL || a.user.level > maxL) fail(`This pool is for LV${minL + 1} – LV${maxL + 1} members`, ErrorCodes.LEVEL_TOO_LOW);
    if (!(value >= plan.minAmount && value <= plan.maxAmount)) fail(`Amount must be between ${plan.minAmount} and ${plan.maxAmount}`, ErrorCodes.VALIDATION);
    if (value > a.wallet.balance) fail(`Insufficient balance. Deposit ${round2(value - a.wallet.balance)} ${env.currency} more to continue.`, ErrorCodes.INSUFFICIENT_BALANCE);
    a.wallet.balance -= value;
    const stake = buildStake(planId, value, Date.now());
    a.stakes.unshift(stake);
    addTxn(a, 'STAKE', `Staked ${plan.title}`, -value);
    a.user.points += Math.round(value / 10);
    return { stake, wallet: walletOut(a) };
  },
  getMyStakes() {
    return authed().stakes;
  },
  getCollection() {
    return authed().owned.map((id) => nftById[id]);
  },

  // Reserve / store
  getStoreSummary() {
    const a = authed();
    tick(a);
    return storeSummary(a);
  },
  getReserveOptions() {
    return reserveOptionsFor(authed());
  },
  reserve({ rankCode, amount }) {
    const a = authed();
    tick(a);
    const opt = reserveOptionsFor(a).find((o) => o.rankCode === rankCode) || fail('Choose a level', ErrorCodes.VALIDATION);
    if (!opt.enabled) fail(`Reach ${opt.label} to unlock this range`, ErrorCodes.LEVEL_TOO_LOW);
    const value = Number(amount);
    if (!(value >= opt.minAmount && value <= opt.maxAmount)) fail(`Amount must be between ${opt.minAmount} and ${opt.maxAmount}`, ErrorCodes.VALIDATION);
    if (storeSummary(a).nextRoundAt) fail('You have used today’s reservation. Come back next round.', ErrorCodes.RESERVATION_LIMIT);
    if (value > a.wallet.balance) fail(`Insufficient balance. Deposit ${round2(value - a.wallet.balance)} ${env.currency} more to reserve.`, ErrorCodes.INSUFFICIENT_BALANCE);
    a.wallet.balance -= value;
    a.wallet.frozen += value;
    const order = buildOrder({ rankCode, amount: value, reservedAt: Date.now(), status: 'PROCESSING' });
    a.orders.unshift(order);
    addTxn(a, 'RESERVE', `Reservation ${opt.label} · #${order.orderNo.slice(-6)}`, -value);
    return { order };
  },
  getOrders({ status } = {}) {
    const a = authed();
    tick(a);
    return a.orders.filter((o) => !status || o.status === status);
  },
  sellOrder(orderId) {
    const a = authed();
    tick(a);
    const order = a.orders.find((o) => o.id === orderId) || fail('Order not found', ErrorCodes.NOT_FOUND, 404);
    if (order.status !== 'BOUGHT') fail('Only matched NFTs can be sold', ErrorCodes.NOT_SELLABLE);
    order.status = 'SOLD';
    a.wallet.frozen = Math.max(0, a.wallet.frozen - order.reservedAmount);
    a.wallet.balance += order.reservedAmount + order.incomeEarned;
    addTxn(a, 'SELL', `Sold ${order.nftName}`, order.reservedAmount);
    addTxn(a, 'PROFIT', `Reserve income · ${order.nftName}`, order.incomeEarned);
    addIncome(a, 'RESERVE', order.incomeEarned);
    return { order, wallet: walletOut(a) };
  },

  // Wallet
  getWallet() {
    const a = authed();
    tick(a);
    return walletOut(a);
  },
  getTransactions({ type } = {}) {
    const a = authed();
    tick(a);
    const types = type ? String(type).split(',') : null;
    return a.transactions.filter((t) => !types || types.includes(t.type));
  },
  getDepositInfo() {
    return { networks: seed.depositNetworks };
  },
  submitDeposit({ networkId, amount, txHash }) {
    const a = authed();
    const net = seed.depositNetworks.find((n) => n.id === networkId) || fail('Choose a network', ErrorCodes.VALIDATION);
    const value = Number(amount);
    if (!(value >= net.minDeposit)) fail(`Minimum deposit is ${net.minDeposit} ${env.currency}`, ErrorCodes.VALIDATION);
    if (String(txHash || '').trim().length < 10) fail('Enter a valid transaction hash', ErrorCodes.VALIDATION);
    return { transaction: addTxn(a, 'DEPOSIT', `Deposit · USDT ${net.id}`, value, 'PENDING') };
  },
  getWithdrawInfo() {
    return seed.withdrawInfo;
  },
  withdraw({ networkId, address, amount, password }) {
    const a = authed();
    const info = seed.withdrawInfo;
    const value = Number(amount);
    if (!info.networks.some((n) => n.id === networkId)) fail('Choose a network', ErrorCodes.VALIDATION);
    if (String(address || '').trim().length < 20) fail('Enter a valid wallet address', ErrorCodes.VALIDATION);
    if (!(value >= info.minWithdraw)) fail(`Minimum withdrawal is ${info.minWithdraw} ${env.currency}`, ErrorCodes.VALIDATION);
    if (value > a.wallet.balance) fail('Amount exceeds your available balance', ErrorCodes.INSUFFICIENT_BALANCE);
    const stored = passwords[a.user.username]; // empty after a reload for non-demo accounts
    if (stored ? password !== stored : !password) fail('Incorrect password', ErrorCodes.INVALID_CREDENTIALS);
    a.wallet.balance -= value;
    const transaction = addTxn(a, 'WITHDRAW', `Withdraw to ${networkId}`, -value, 'PENDING');
    return { transaction, wallet: walletOut(a) };
  },

  // Account
  getProfile() {
    return authed().user;
  },
  getIncomeSummary() {
    return authed().income;
  },
  getTeam() {
    const a = authed();
    const tier = (n) => a.members.filter((m) => m.tier === n);
    const share = (n) => round2(tier(n).reduce((s, m) => s + m.contribution, 0));
    const labels = { 1: 'A · Direct', 2: 'B · Second', 3: 'C · Third' };
    return {
      totalUser: a.members.length,
      totalActive: a.members.filter((m) => m.active).length,
      totalShare: round2(share(1) + share(2) + share(3)),
      tiers: [1, 2, 3].map((n) => ({ tier: n, label: labels[n], total: tier(n).length, active: tier(n).filter((m) => m.active).length, share: share(n) })),
      members: a.members,
    };
  },
  getReferral() {
    const a = authed();
    const direct = a.members.filter((m) => m.tier === 1);
    return {
      code: a.user.inviteCode,
      link: `https://trustai.co.in/register?ref=${a.user.inviteCode}`,
      invitedCount: direct.length,
      activeCount: direct.filter((m) => m.active).length,
      rewards: a.income.find((i) => i.type === 'TEAM')?.total || 0,
      rules: seed.referralRules,
    };
  },
  getLevels() {
    return seed.levels.map((l) => ({
      code: l.code,
      level: l.level,
      name: l.name,
      minDirect: l.minDirect,
      minTeam: l.minTeam,
      commission: l.commission,
      reserveRange: `${l.min} – ${l.max}`,
      perks: [`Reserve ${l.min} – ${l.max} ${env.currency}`, `Daily income ${l.income}`, l.commission ? `${l.commission}% team commission` : 'Access to open stake pools'],
    }));
  },
  getNotifications() {
    const a = authed();
    tick(a);
    return a.notifications;
  },
  markNotificationsRead() {
    authed().notifications.forEach((n) => (n.viewed = true));
  },
};

/** Every method: simulated latency + deep-cloned result, so screens can't mutate the "server". */
export const mockApi = Object.fromEntries(
  Object.entries(impl).map(([name, fn]) => [
    name,
    async (...args) => {
      await sleep(env.mockLatencyMs * (0.6 + Math.random() * 0.8));
      const result = clone(fn(...args));
      saveDb();
      return result;
    },
  ])
);

/** Re-attaches a stored session after a page reload (the in-memory world is rebuilt). */
export function restoreMockSession(stored) {
  const name = String(stored?.accessToken || '').split('.')[1];
  if (!name) return;
  if (!accounts[name]) {
    passwords[name] = '';
    accounts[name] = freshAccount({ ...seed.DEMO_USER, id: nextId('u'), username: name, level: 0, points: 0, avatarSeed: name, ...(stored.user || {}) });
  }
  me = accounts[name];
}
