/**
 * Walks the whole app flow and saves docs/screens/*.jpg for the README.
 *
 *   npm run dev            # in one terminal (mock mode)
 *   npm run screenshots    # in another
 *
 * Uses a locally installed Chrome/Edge (override with CHROME_PATH). Also acts as a smoke test:
 * exits non-zero if the page logs errors or warnings.
 */
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const BASE = process.env.APP_URL || 'http://localhost:5191';
const OUT = path.resolve('docs/screens');
const executablePath = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
].find((p) => p && fs.existsSync(p));
if (!executablePath) throw new Error('No Chrome/Edge found — set CHROME_PATH');

fs.mkdirSync(OUT, { recursive: true });
for (const f of fs.readdirSync(OUT)) if (f.endsWith('.jpg')) fs.unlinkSync(path.join(OUT, f));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ executablePath, headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

const problems = [];
page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
page.on('console', (m) => ['error', 'warn'].includes(m.type()) && !/Fast Refresh|React Router Future Flag/.test(m.text()) && problems.push(`${m.type()}: ${m.text().slice(0, 300)}`));

let n = 0;
const shot = async (name) => {
  const file = `${String(++n).padStart(2, '0')}-${name}.jpg`;
  await page.screenshot({ path: path.join(OUT, file), type: 'jpeg', quality: 82 });
  console.log('✓', file);
};
const go = async (route, wait = 900) => {
  await page.goto(BASE + route, { waitUntil: 'networkidle0' });
  await sleep(wait);
};
/** Clicks the first visible, enabled element whose text contains `text`. */
const click = (text, selector = 'button, a') =>
  page.evaluate(
    (t, sel) => {
      const el = [...document.querySelectorAll(sel)].find((b) => b.textContent.includes(t) && !b.disabled && b.offsetParent !== null);
      if (!el) throw new Error(`No clickable element with text "${t}" (${sel})`);
      el.click();
    },
    text,
    selector
  );
const scrollScreen = (y) => page.evaluate((v) => document.querySelector('.screen').scrollTo(0, v), y);
const type = async (selector, text) => {
  await page.click(selector, { count: 3 });
  await page.keyboard.press('Backspace');
  await page.type(selector, text);
};
const input = (placeholder) => `input[placeholder^="${placeholder}"]`;

// ---------- Onboarding ----------
await go('/login', 200);
await page.evaluate(() => localStorage.clear());
await go('/', 700);
await shot('splash');
await page.waitForFunction(() => location.pathname === '/welcome', { timeout: 5000 });
await sleep(900);
await shot('welcome-discover');
await click('Next');
await sleep(300);
await click('Next');
await sleep(900);
await shot('welcome-get-started');

// ---------- Register & login ----------
await go('/register?ref=TRUST2025', 700);
await type(input('Choose an account'), 'nova_art');
await type(input('At least 6'), 'secret12');
await type(input('Enter your password again'), 'secret12');
await type(input('Mobile number'), '9876543210');
await type(input('you@example'), 'nova@trustai.co.in');
await sleep(300);
await shot('register');

await go('/login', 700);
await click('demo / demo123');
await sleep(300);
await shot('login');
await click('Sign in', 'button');
await page.waitForSelector('.home-head');
await sleep(1300);

// ---------- Home ----------
await shot('home');
await scrollScreen(760);
await sleep(500);
await shot('home-collections');
await scrollScreen(99999);
await sleep(500);
await shot('home-stake-and-features');

// ---------- Explore ----------
await go('/explore', 1100);
await shot('explore-stake-market');
await go('/explore?tab=mystakes', 1100);
await shot('explore-my-stakes');
await click('Koi Drift Vault', '.mystake-card');
await page.waitForSelector('.sheet');
await sleep(600);
await shot('my-stake-summary');
await go('/explore?tab=collection', 1100);
await shot('explore-collection');

// ---------- NFT detail → stake → success / insufficient balance ----------
await go('/nft/s2', 1200);
await shot('nft-detail');
await scrollScreen(99999);
await sleep(400);
await shot('nft-detail-about');
await click('Stake now');
await page.waitForSelector('.sheet');
await sleep(600);
await shot('stake-sheet');
await click('Confirm stake');
await page.waitForSelector('.dialog-success');
await sleep(700);
await shot('stake-success');
await go('/nft/s4', 1000);
await click('Stake now');
await page.waitForSelector('.sheet');
await click('Max', '.chip');
await sleep(200);
await click('Confirm stake');
await page.waitForSelector('.dialog-error');
await sleep(600);
await shot('stake-insufficient-balance');

// ---------- Reserve → match → sell ----------
await go('/reserve', 1300);
await shot('reserve');
await scrollScreen(99999);
await sleep(400);
await shot('reserve-how-it-works');
await click('Reserve now');
await page.waitForSelector('.dialog-success');
await sleep(800);
await shot('reserve-placed');
await click('Track my order');
await page.waitForSelector('.oc-thumb.scanning');
await sleep(500);
await shot('orders-matching');
await page.waitForFunction(() => !document.querySelector('.oc-thumb.scanning'), { timeout: 20000 });
await sleep(600);
await shot('orders-matched');
await go('/reserve?tab=sell', 1100);
await shot('sell-list');
await click('Sell now');
await page.waitForSelector('.sheet');
await sleep(600);
await shot('sell-sheet');
await click('Sell for');
await page.waitForSelector('.toast');
await sleep(400);
await shot('sold-toast');
await go('/reserve', 1200);
await shot('reserve-next-round-countdown');

// ---------- Wallet ----------
await go('/wallet', 1100);
await shot('wallet');
await go('/deposit', 1000);
await type(input('Min'), '250');
await type(input('Paste the TxID'), '7f3c9a1be04d2c58f61a9e0b7d4c3a21e9f80b6d5c4a3b2e1f0d9c8b7a6e5f4d');
await sleep(300);
await shot('deposit');
await click('I have transferred');
await page.waitForSelector('.dialog-success');
await sleep(600);
await shot('deposit-submitted');
await go('/withdraw', 1000);
await type(input('Your USDT'), 'TJ8sYq3N5vLx2RkW7bPd4FmHc9QeU6Za1T');
await type(input('Min'), '100');
await sleep(300);
await shot('withdraw');
await go('/transactions', 1000);
await shot('transactions');

// ---------- Account ----------
await go('/profile', 1300);
await shot('profile');
await scrollScreen(560);
await sleep(400);
await shot('profile-team-orders');
await scrollScreen(99999);
await sleep(400);
await shot('profile-menu');
await go('/team', 1100);
await shot('team');
await go('/referral', 1100);
await shot('referral');
await go('/levels', 1100);
await shot('levels');
await go('/notifications', 1000);
await shot('notifications');

await browser.close();
console.log(`\nSaved ${n} screenshots to ${OUT}`);
if (problems.length) {
  console.error(`${problems.length} page problem(s):\n${problems.join('\n')}`);
  process.exitCode = 1;
}
