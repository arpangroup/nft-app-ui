/**
 * Seed data for the mock adapter. Only mockApi.js imports this file.
 * Art is generated on the client from `artSeed` ("<style>:<key>", see components/NftArt.jsx),
 * so the app runs fully offline.
 */

/** Demo login — any username works with a 6+ char password; this one has a populated account. */
export const DEMO_USER = {
  id: 'u1001',
  username: 'demo',
  password: 'demo123',
  uid: '80271946',
  email: 'demo@trustai.co.in',
  phone: '+91 98765 43210',
  level: 2,
  points: 1260,
  inviteCode: 'TRUST7Q2',
  avatarSeed: 'demo',
  joinedAt: '2025-03-14T09:20:00Z',
};

/** Invitation codes accepted by register() (plus the demo user's own code). */
export const INVITE_CODES = ['TRUST2025', 'WELCOME'];

export const WALLET = { balance: 1286.45, frozen: 0, todayEarning: 18.42, cumulativeIncome: 734.18 };

export const categories = [
  { id: 'all', label: 'All' },
  { id: 'art', label: 'Art' },
  { id: 'collectibles', label: 'Collectibles' },
  { id: 'gaming', label: 'Gaming' },
  { id: 'music', label: 'Music' },
];

export const collections = [
  { id: 'c1', name: 'Pixel Punks', artSeed: 'punk:pp-1', floor: 17.98, volume: 160580, change: 12.4, items: 10000, verified: true },
  { id: 'c2', name: 'Cyber Koi', artSeed: 'orb:ck-2', floor: 9.42, volume: 140790, change: 8.1, items: 5555, verified: true },
  { id: 'c3', name: 'Chain Hard Art', artSeed: 'bauhaus:ch-3', floor: 6.35, volume: 110640, change: -4.2, items: 3333, verified: true },
  { id: 'c4', name: 'Astro Cats', artSeed: 'rings:ac-4', floor: 3.11, volume: 60040, change: 21.7, items: 7777, verified: false },
  { id: 'c5', name: 'Meta Bloom', artSeed: 'bloom:mb-5', floor: 2.48, volume: 41210, change: -1.6, items: 2500, verified: true },
];

const styleOf = { 'Pixel Punks': 'punk', 'Cyber Koi': 'orb', 'Chain Hard Art': 'bauhaus', 'Astro Cats': 'rings', 'Meta Bloom': 'bloom', 'Noxious Audience': 'punk', 'Penguin Pals': 'bloom' };
/** Stake pool each collection trades in (tapping an NFT opens that pool). */
const planOf = { 'Pixel Punks': 's1', 'Cyber Koi': 's3', 'Chain Hard Art': 's4', 'Astro Cats': 's2', 'Meta Bloom': 's5', 'Noxious Audience': 's6', 'Penguin Pals': 's8' };
const nft = (id, name, collection, price, change24h, likes, category) => ({
  id, name, collection, artSeed: `${styleOf[collection]}:${id}`, price, change24h, likes, category, planId: planOf[collection],
});

export const nfts = [
  nft('n1', 'Punk #3021', 'Pixel Punks', 873.03, 6.2, 412, 'collectibles'),
  nft('n2', 'Koi Drift #88', 'Cyber Koi', 962.39, 3.4, 268, 'art'),
  nft('n3', 'Chain Hard #29', 'Chain Hard Art', 857.38, -2.1, 190, 'art'),
  nft('n4', 'Nebula Cat #7', 'Astro Cats', 637.98, 14.8, 534, 'collectibles'),
  nft('n5', 'Bloom Genesis', 'Meta Bloom', 512.4, 1.9, 145, 'art'),
  nft('n6', 'Noxious #1262', 'Noxious Audience', 455.12, 9.3, 322, 'gaming'),
  nft('n7', 'Penguin Pal #2401', 'Penguin Pals', 388.5, -0.8, 98, 'gaming'),
  nft('n8', 'Koi Pulse #12', 'Cyber Koi', 720.0, 4.6, 207, 'music'),
  nft('n9', 'Punk #0042', 'Pixel Punks', 1210.75, 18.2, 801, 'collectibles'),
  nft('n10', 'Orbit Cat #19', 'Astro Cats', 299.9, 2.2, 76, 'music'),
];

/** NFTs already in the demo user's collection. */
export const ownedNftIds = ['n5', 'n7', 'n10'];

export const banners = [
  { id: 'b1', title: 'The next miracle of NFT', subtitle: 'Stake rare digital art & earn daily rewards', cta: 'Explore now', link: '/explore', artSeed: 'orb:banner-1' },
  { id: 'b2', title: 'Exclusive Drop · Zone 2', subtitle: 'Limited LV3+ stake pool — up to 2.4% daily', cta: 'Stake now', link: '/nft/s2', artSeed: 'rings:banner-2' },
  { id: 'b3', title: 'Invite friends, earn 100%', subtitle: 'Get cashback on every friend’s first reserve', cta: 'Invite', link: '/referral', artSeed: 'bloom:banner-3' },
];

const DESC =
  'A curated, verified piece from the TrustAI vault. Staking locks the NFT for the full period and pays the reward ' +
  'to your wallet on every payout. Capital is returned at maturity when “capital back” is enabled.';

export const stakePlans = [
  { id: 's1', title: 'Exclusive Stake · Zone 1', collection: 'Pixel Punks', artSeed: 'punk:s1', category: 'collectibles', price: 199, minAmount: 199, maxAmount: 1000, roiPercent: 1.5, periods: 7, payoutFrequency: 'Daily', capitalBack: true, levelRange: [1, 5], sold: 812, supply: 1000 },
  { id: 's2', title: 'Exclusive Stake · Zone 2', collection: 'Astro Cats', artSeed: 'rings:s2', category: 'collectibles', price: 500, minAmount: 500, maxAmount: 2000, roiPercent: 2.4, periods: 15, payoutFrequency: 'Daily', capitalBack: true, levelRange: [2, 9], sold: 344, supply: 500 },
  { id: 's3', title: 'Koi Drift Vault', collection: 'Cyber Koi', artSeed: 'orb:s3', category: 'art', price: 100, minAmount: 100, maxAmount: 800, roiPercent: 1.2, periods: 30, payoutFrequency: 'Daily', capitalBack: true, levelRange: [0, 9], sold: 1630, supply: 2000 },
  { id: 's4', title: 'Chain Hard Genesis', collection: 'Chain Hard Art', artSeed: 'bauhaus:s4', category: 'art', price: 300, minAmount: 300, maxAmount: 1500, roiPercent: 1.8, periods: 14, payoutFrequency: 'Daily', capitalBack: false, levelRange: [1, 9], sold: 220, supply: 400 },
  { id: 's5', title: 'Bloom Weekly Pool', collection: 'Meta Bloom', artSeed: 'bloom:s5', category: 'art', price: 50, minAmount: 50, maxAmount: 500, roiPercent: 6.5, periods: 4, payoutFrequency: 'Weekly', capitalBack: true, levelRange: [0, 9], sold: 940, supply: 1200 },
  { id: 's6', title: 'Noxious Arena Pass', collection: 'Noxious Audience', artSeed: 'punk:s6', category: 'gaming', price: 250, minAmount: 250, maxAmount: 1200, roiPercent: 1.6, periods: 21, payoutFrequency: 'Daily', capitalBack: true, levelRange: [0, 9], sold: 512, supply: 600 },
  { id: 's7', title: 'Elite Stake · Zone 3', collection: 'Pixel Punks', artSeed: 'punk:s7', category: 'collectibles', price: 2000, minAmount: 2000, maxAmount: 10000, roiPercent: 3.1, periods: 30, payoutFrequency: 'Daily', capitalBack: true, levelRange: [5, 9], sold: 41, supply: 100 },
  { id: 's8', title: 'Penguin Beats', collection: 'Penguin Pals', artSeed: 'bloom:s8', category: 'music', price: 80, minAmount: 80, maxAmount: 400, roiPercent: 1.1, periods: 10, payoutFrequency: 'Daily', capitalBack: true, levelRange: [0, 9], sold: 300, supply: 300 },
].map((s) => ({ ...s, creator: 'TrustAI Labs', description: DESC, status: s.sold >= s.supply ? 'SOLD_OUT' : 'OPEN' }));

/** Stakes the demo user already holds: [planId, amount, daysAgo] */
export const myStakeSeed = [
  ['s3', 400, 12],
  ['s1', 300, 3],
  ['s5', 120, 35],
];

/** Reservation levels (rankCode = backend RANK_n). */
export const levels = [
  { code: 'RANK_0', level: 0, name: 'Explorer', minDirect: 0, minTeam: 0, commission: 0, min: 50, max: 300, income: '1.2% - 1.4%' },
  { code: 'RANK_1', level: 1, name: 'Collector', minDirect: 2, minTeam: 5, commission: 2, min: 50, max: 1000, income: '1.5% - 1.7%' },
  { code: 'RANK_2', level: 2, name: 'Curator', minDirect: 4, minTeam: 15, commission: 4, min: 100, max: 2000, income: '1.8% - 2.0%' },
  { code: 'RANK_3', level: 3, name: 'Patron', minDirect: 6, minTeam: 40, commission: 6, min: 500, max: 5000, income: '2.1% - 2.3%' },
  { code: 'RANK_4', level: 4, name: 'Virtuoso', minDirect: 8, minTeam: 80, commission: 8, min: 1000, max: 10000, income: '2.4% - 2.6%' },
  { code: 'RANK_5', level: 5, name: 'Luminary', minDirect: 10, minTeam: 150, commission: 10, min: 2000, max: 20000, income: '2.7% - 2.9%' },
  { code: 'RANK_6', level: 6, name: 'Visionary', minDirect: 12, minTeam: 300, commission: 12, min: 5000, max: 40000, income: '3.0% - 3.2%' },
  { code: 'RANK_7', level: 7, name: 'Legend', minDirect: 15, minTeam: 600, commission: 14, min: 10000, max: 80000, income: '3.3% - 3.5%' },
];

/** Past reservations: [nftId, rankCode, amount, daysAgo, status] */
export const orderSeed = [
  ['n4', 'RANK_2', 640, 1, 'BOUGHT'],
  ['n6', 'RANK_2', 455, 2, 'SOLD'],
  ['n3', 'RANK_1', 820, 3, 'SOLD'],
  ['n7', 'RANK_1', 388, 5, 'SOLD'],
  ['n2', 'RANK_1', 540, 7, 'SOLD'],
];

/** [type, title, amount, hoursAgo, status] */
export const transactionSeed = [
  ['PROFIT', 'Reserve income · Noxious #1262', 8.19, 20, 'SUCCESS'],
  ['SELL', 'Sold Noxious #1262', 455, 20, 'SUCCESS'],
  ['PROFIT', 'Stake payout · Koi Drift Vault', 4.8, 26, 'SUCCESS'],
  ['REFERRAL', 'Team reward · alex_r', 3.25, 30, 'SUCCESS'],
  ['RESERVE', 'Reserved Nebula Cat #7', -640, 34, 'SUCCESS'],
  ['WITHDRAW', 'Withdraw to TRC20', -56.71, 52, 'SUCCESS'],
  ['STAKE', 'Staked Exclusive Stake · Zone 1', -300, 72, 'SUCCESS'],
  ['REWARD', 'Activity reward', 15, 98, 'SUCCESS'],
  ['DEPOSIT', 'Deposit · USDT TRC20', 500, 120, 'SUCCESS'],
  ['WITHDRAW', 'Withdraw to BEP20', -53, 180, 'SUCCESS'],
  ['REWARD', 'Sign-up bonus', 10, 400, 'SUCCESS'],
  ['DEPOSIT', 'Deposit · USDT BEP20', 1000, 410, 'SUCCESS'],
];

export const incomeSummary = [
  { type: 'DAILY', label: 'Comprehensive', today: 18.42, total: 734.18 },
  { type: 'RESERVE', label: 'Reserve', today: 8.19, total: 312.6 },
  { type: 'STAKE', label: 'Stake', today: 6.98, total: 268.4 },
  { type: 'TEAM', label: 'Team', today: 3.25, total: 118.18 },
  { type: 'ACTIVITY', label: 'Activity', today: 0, total: 25 },
  { type: 'REFERRAL', label: 'Referral', today: 0, total: 10 },
];

const memberNames = ['alex_r', 'priya.k', 'sam_nft', 'neo.trader', 'riya_m', 'kabir22', 'mia.art', 'lucas.eth', 'ananya', 'dev_ops', 'zoe_x', 'arjun.s', 'nora', 'vikram_p'];
/** [tier, level, active, daysAgo, contribution] */
const memberShape = [[1, 2, true, 40, 42.1], [1, 1, true, 33, 31.6], [1, 1, true, 21, 18.2], [1, 0, false, 12, 0], [2, 1, true, 30, 12.4], [2, 0, true, 18, 6.8], [2, 0, true, 15, 4.9], [2, 0, false, 9, 0], [3, 0, true, 14, 2.1], [3, 0, true, 8, 1.4], [3, 0, false, 6, 0], [3, 0, true, 4, 0.9], [3, 0, false, 2, 0], [3, 0, true, 1, 0.3]];
export const members = memberNames.map((username, i) => {
  const [tier, level, active, daysAgo, contribution] = memberShape[i];
  return { id: `m${i + 1}`, username, avatarSeed: username, tier, level, active, daysAgo, contribution };
});

/** [type, title, message, hoursAgo, viewed] */
export const notificationSeed = [
  ['ORDER', 'Reservation matched', 'Nebula Cat #7 was matched to your LV3 reservation. You can sell it now.', 2, false],
  ['PAYOUT', 'Stake payout received', '+4.80 USDT from Koi Drift Vault has been credited to your wallet.', 26, false],
  ['TEAM', 'New team member', 'vikram_p joined your community with your invitation code.', 30, true],
  ['SYSTEM', 'Exclusive Zone 2 is live', 'A new LV3+ stake pool with up to 2.4% daily rewards just opened.', 50, true],
  ['WALLET', 'Withdrawal completed', '56.71 USDT was sent to your TRC20 address.', 52, true],
];

export const depositNetworks = [
  { id: 'TRC20', name: 'TRON (TRC20)', address: 'TQ5bRL2YqNv4Gz8Y1hK9pD7sXwE3uFcM6a', minDeposit: 10, confirmations: 20 },
  { id: 'BEP20', name: 'BNB Smart Chain (BEP20)', address: '0x5987d451a2d9f7db04d8e539e4d3d6f8aede71bb', minDeposit: 10, confirmations: 15 },
];

export const withdrawInfo = {
  feePercent: 2,
  minWithdraw: 20,
  networks: [
    { id: 'TRC20', name: 'TRON (TRC20)' },
    { id: 'BEP20', name: 'BNB Smart Chain (BEP20)' },
  ],
};

export const referralRules = [
  'Share your code — friends enter it when they register.',
  'Earn 100% cashback of the reservation fee on a friend’s first reserve.',
  'Collect team rewards from 3 tiers: A 5%, B 3%, C 1% of their daily income.',
  'Rewards are credited to your wallet every day at 00:00 UTC.',
];
