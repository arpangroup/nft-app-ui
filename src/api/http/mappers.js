/**
 * Backend DTO -> UI model mappers (models are documented in ../contract.js).
 * Field names follow the trustai-2025 Spring Boot DTOs; change them here only.
 */
const num = (v) => (v === null || v === undefined || v === '' ? 0 : Number(v));
const str = (v) => (v === null || v === undefined ? '' : String(v));
/** Page<T> or T[] -> T[] */
export const content = (r) => (Array.isArray(r) ? r : r?.content || []);
export const many = (fn) => (r) => content(r).map(fn);

const RANK_LEVEL = (code) => num(String(code || 'RANK_0').replace(/\D/g, ''));

export const toUser = (u) =>
  u && {
    id: str(u.id ?? u.userId),
    username: u.username,
    uid: str(u.accountId ?? u.uid ?? u.id),
    email: u.email || '',
    phone: u.mobile || u.phone || '',
    level: RANK_LEVEL(u.rankCode),
    points: num(u.point ?? u.points),
    inviteCode: u.referralCode || u.inviteCode || '',
    avatarSeed: u.username || str(u.id),
    joinedAt: u.createdAt,
  };

export const toAuth = (r) => ({ accessToken: r.accessToken, refreshToken: r.refreshToken, user: toUser(r.user) || null });

export const toWallet = (w) =>
  w && {
    balance: num(w.walletBalance ?? w.balance),
    frozen: num(w.frozen ?? w.frozenBalance),
    todayEarning: num(w.todayEarning),
    cumulativeIncome: num(w.cumulativeIncome),
    currency: w.currencyCode || w.currency || 'USDT',
  };

export const toTransaction = (t) =>
  t && {
    id: str(t.id),
    type: t.transactionType || t.type,
    title: t.remarks || t.title || t.transactionType,
    amount: num(t.amount),
    status: t.status || 'SUCCESS',
    createdAt: t.txnDate || t.createdAt,
    txnRef: t.txnRefId || t.txnRef || '',
  };

export const toStakePlan = (s) =>
  s && {
    id: str(s.id),
    title: s.title || s.name,
    collection: s.collectionName || s.createdBy || 'TrustAI',
    artSeed: s.imageUrl || s.title,
    imageUrl: s.imageUrl,
    category: (s.category || 'stake').toLowerCase(),
    price: num(s.price ?? s.minimumInvestmentAmount),
    minAmount: num(s.minimumInvestmentAmount),
    maxAmount: num(s.maximumInvestmentAmount ?? s.minimumInvestmentAmount),
    roiPercent: num(s.returnRate ?? s.returnPercentage),
    periods: num(s.totalReturnPeriods),
    payoutFrequency: s.payoutFrequencyLabel || 'Daily',
    capitalBack: Boolean(s.capitalBack ?? s.isCapitalReturned),
    levelRange: [RANK_LEVEL(s.minRankCode), RANK_LEVEL(s.maxRankCode || 'RANK_9')],
    creator: s.createdBy || 'TrustAI',
    description: s.description || '',
    sold: num(s.sold),
    supply: num(s.supply || 100),
    status: s.active === false ? 'SOLD_OUT' : 'OPEN',
  };

export const toMyStake = (i) =>
  i && {
    id: str(i.investmentId),
    planId: str(i.schemaId),
    name: i.schemaName,
    artSeed: i.imageUrl || i.schemaName,
    imageUrl: i.imageUrl,
    investedAmount: num(i.investedAmount),
    roiPercent: num(i.roiValue),
    perPeriodProfit: num(i.perPeriodProfit),
    totalPeriods: num(i.totalPeriods),
    completedPeriods: num(i.completedPeriods),
    receivedReturn: num(i.receivedReturn),
    expectedReturn: num(i.expectedReturn),
    totalEarningPotential: num(i.totalEarningPotential),
    nextReturnAmount: num(i.nextReturnAmount),
    earlyExitPenalty: num(i.earlyExitPenalty),
    subscribedAt: i.subscribedAt,
    nextPayoutDate: i.nextPayoutDate,
    maturityAt: i.maturityAt,
    payoutFrequency: i.payoutFrequencyLabel || 'Daily',
    status: i.investmentStatus === 'MATURED' || i.investmentStatus === 'COMPLETED' ? 'MATURED' : 'ACTIVE',
  };

export const toOrder = (o) =>
  o && {
    id: str(o.reservationId ?? o.id),
    orderNo: str(o.orderNo ?? o.reservationId),
    nftName: o.schemaTitle,
    artSeed: o.imageUrl || o.schemaTitle,
    imageUrl: o.imageUrl,
    rankCode: o.rankCode,
    reservedAmount: num(o.reservedAmount),
    price: num(o.reservedAmount) + num(o.valuationDelta),
    reservedAt: o.reservedAt,
    expiryAt: o.expiryAt,
    incomeEarned: num(o.incomeEarned),
    returnRate: num(o.returnRate),
    handlingFee: num(o.handlingFee),
    status: o.sold ? 'SOLD' : o.status || 'BOUGHT',
  };

export const toStoreSummary = (s) => ({
  todayEarning: num(s.todayEarning),
  cumulativeIncome: num(s.cumulativeIncome),
  walletBalance: num(s.walletBalance),
  reservationRange: { min: num(s.reservationRange?.min), max: num(s.reservationRange?.max) },
  reservedToday: num(s.reservedCount),
  maxReservationsPerDay: num(s.maxReservationsPerDay || 1),
  nextRoundAt: s.nextRoundAt || null,
  totalOrders: num(s.totalOrders),
  processingOrders: num(s.processingOrders),
  boughtOrders: num(s.boughtOrders),
  soldOrders: num(s.soldOrders),
});

export const toReserveOption = (r) => ({
  rankCode: r.rankCode,
  label: `LV${RANK_LEVEL(r.rankCode) + 1}`,
  minAmount: num(r.minInvestmentAmount),
  maxAmount: num(r.maxInvestmentAmount),
  incomeRange: r.incomePercentageRange,
  enabled: Boolean(r.enabled),
});

const INCOME_LABELS = { DAILY: 'Comprehensive', RESERVE: 'Reserve', TEAM: 'Team', ACTIVITY: 'Activity', BID: 'Bid', STAKE: 'Stake', REFERRAL: 'Referral' };
export const toIncome = (i) => ({ type: i.incomeType, label: INCOME_LABELS[i.incomeType] || i.incomeType, today: num(i.todayAmount), total: num(i.totalAmount) });

export const toTeam = (m) => ({
  totalUser: num(m.totalUser),
  totalActive: num(m.totalActive),
  totalShare: num(m.totalShare),
  tiers: [
    { tier: 1, label: 'A · Direct', total: num(m.direct), active: num(m.activeDirect), share: num(m.memberA) },
    { tier: 2, label: 'B · Second', total: num(m.indirect), active: num(m.activeIndirect), share: num(m.memberB) },
    { tier: 3, label: 'C · Third', total: num(m.third), active: num(m.activeThird), share: num(m.memberC) },
  ],
  members: (m.memembers || m.members || []).map((x) => ({
    id: str(x.userId ?? x.id),
    username: x.username,
    avatarSeed: x.username,
    tier: num(x.level || x.tier || 1),
    level: RANK_LEVEL(x.rankCode),
    active: Boolean(x.active ?? true),
    joinedAt: x.createdAt || x.joinedAt,
    contribution: num(x.contribution ?? x.share),
  })),
});

export const toLevel = (r) => ({
  code: r.code,
  level: RANK_LEVEL(r.code),
  name: r.displayName,
  minDirect: num(r.minDirectReferrals),
  minTeam: num(r.minTeamSize),
  commission: num(r.commissionPercentage),
  reserveRange: r.reserveRange || '',
  perks: r.description ? [r.description] : [],
});

export const toNotification = (n) => ({ id: str(n.id), title: n.title, message: n.message, type: n.type || 'SYSTEM', viewed: Boolean(n.viewed), createdAt: n.createdAt });
