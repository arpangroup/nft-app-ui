/**
 * THE API CONTRACT — every adapter (mock + HTTP) implements exactly these async methods.
 * Screens/context depend only on this shape, never on an adapter or on mock data.
 *
 * Models (backend DTOs are mapped to these in http/mappers.js):
 *
 * @typedef {{ id, username, uid, email, phone, level:number(0..9), points, inviteCode, avatarSeed, joinedAt }} User
 * @typedef {{ balance, frozen, todayEarning, cumulativeIncome, currency }} Wallet
 * @typedef {{ id, type:'DEPOSIT'|'WITHDRAW'|'STAKE'|'RESERVE'|'SELL'|'PROFIT'|'REWARD'|'REFERRAL',
 *             title, amount:number(+/-), status:'SUCCESS'|'PENDING'|'FAILED', createdAt, txnRef }} Transaction
 * @typedef {{ id, name, collection, artSeed, price, change24h, likes, category, planId }} Nft   (planId = stake pool it trades in)
 * @typedef {{ id, name, artSeed, floor, volume, change, items, verified }} Collection
 * @typedef {{ id, title, collection, artSeed, category, price, minAmount, maxAmount, roiPercent,
 *             periods, payoutFrequency:'Daily'|'Weekly', capitalBack, levelRange:[min,max], creator,
 *             description, sold, supply, status:'OPEN'|'SOLD_OUT' }} StakePlan
 * @typedef {{ id, planId, name, artSeed, investedAmount, roiPercent, perPeriodProfit, totalPeriods,
 *             completedPeriods, receivedReturn, expectedReturn, totalEarningPotential, nextReturnAmount,
 *             earlyExitPenalty, subscribedAt, nextPayoutDate, maturityAt, payoutFrequency,
 *             status:'ACTIVE'|'MATURED' }} MyStake
 * @typedef {{ id, orderNo, nftName, artSeed, rankCode, reservedAmount, price, reservedAt, expiryAt,
 *             incomeEarned, returnRate, handlingFee, status:'PROCESSING'|'BOUGHT'|'SOLD' }} Order
 * @typedef {{ rankCode, label, minAmount, maxAmount, incomeRange, enabled }} ReserveOption
 * @typedef {{ id, title, message, type, viewed, createdAt }} Notification
 *
 * Methods (all return Promises, all throw ApiError on failure):
 *
 *  Auth
 *   login({ username, password })                              -> { accessToken, refreshToken, user }
 *   register({ username, password, phone, email, inviteCode }) -> { accessToken, refreshToken, user }
 *   logout()                                                   -> void
 *
 *  Home
 *   getHomeFeed() -> { banners:{id,title,subtitle,cta,link,artSeed}[], categories:{id,label}[],
 *                      trending:Nft[], collections:Collection[], featured:StakePlan[] }
 *
 *  Explore / stake (investment schemas)
 *   getStakePlans({ category })        -> StakePlan[]
 *   getStakePlan(id)                   -> StakePlan
 *   subscribeStake({ planId, amount }) -> { stake:MyStake, wallet:Wallet }
 *   getMyStakes()                      -> MyStake[]
 *   getCollection()                    -> Nft[]          (NFTs the user owns)
 *
 *  Reserve / store (reservations)
 *   getStoreSummary()   -> { todayEarning, cumulativeIncome, walletBalance, reservationRange:{min,max},
 *                            reservedToday, maxReservationsPerDay, nextRoundAt:string(ISO)|null,
 *                            totalOrders, processingOrders, boughtOrders, soldOrders }
 *   getReserveOptions() -> ReserveOption[]
 *   reserve({ rankCode, amount }) -> { order:Order }
 *   getOrders({ status })         -> Order[]            (status omitted = all)
 *   sellOrder(orderId)            -> { order:Order, wallet:Wallet }
 *
 *  Wallet
 *   getWallet()                    -> Wallet
 *   getTransactions({ type })      -> Transaction[]      (type omitted = all)
 *   getDepositInfo()               -> { networks:{ id, name, address, minDeposit, confirmations }[] }
 *   submitDeposit({ networkId, amount, txHash }) -> { transaction }
 *   getWithdrawInfo()              -> { feePercent, minWithdraw, networks:{ id, name }[] }
 *   withdraw({ networkId, address, amount, password }) -> { transaction, wallet }
 *
 *  Account
 *   getProfile()        -> User
 *   getIncomeSummary()  -> { type, label, today, total }[]
 *   getTeam()           -> { totalUser, totalActive, totalShare, tiers:{ tier, label, total, active, share }[],
 *                            members:{ id, username, avatarSeed, tier:1|2|3, level, active, joinedAt, contribution }[] }
 *   getReferral()       -> { code, link, invitedCount, activeCount, rewards, rules:string[] }
 *   getLevels()         -> { code, level, name, minDirect, minTeam, commission, reserveRange, perks:string[] }[]
 *   getNotifications()  -> Notification[]
 *   markNotificationsRead() -> void
 */
export const API_METHODS = [
  'login', 'register', 'logout',
  'getHomeFeed',
  'getStakePlans', 'getStakePlan', 'subscribeStake', 'getMyStakes', 'getCollection',
  'getStoreSummary', 'getReserveOptions', 'reserve', 'getOrders', 'sellOrder',
  'getWallet', 'getTransactions', 'getDepositInfo', 'submitDeposit', 'getWithdrawInfo', 'withdraw',
  'getProfile', 'getIncomeSummary', 'getTeam', 'getReferral', 'getLevels',
  'getNotifications', 'markNotificationsRead',
];
