import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { env } from './config/env';
import { BottomNav } from './components/Nav';
import { Toast } from './components/Overlays';
import { AppProvider, useApp } from './context/AppContext';
import Deposit from './screens/Deposit';
import Explore from './screens/Explore';
import Home from './screens/Home';
import Levels from './screens/Levels';
import Login from './screens/Login';
import NftDetail from './screens/NftDetail';
import Notifications from './screens/Notifications';
import Profile from './screens/Profile';
import Referral from './screens/Referral';
import Register from './screens/Register';
import Reserve from './screens/Reserve';
import Splash from './screens/Splash';
import Team from './screens/Team';
import Transactions from './screens/Transactions';
import Wallet from './screens/Wallet';
import Welcome from './screens/Welcome';
import Withdraw from './screens/Withdraw';

/** Signed-in area; remembers where the user was going. */
function RequireAuth() {
  const { isLoggedIn } = useApp();
  const location = useLocation();
  return isLoggedIn ? <Outlet /> : <Navigate to="/login" replace state={{ from: location.pathname }} />;
}

/** Screens with the bottom tab bar. */
function TabLayout() {
  return (
    <>
      <Outlet />
      <BottomNav />
    </>
  );
}

function Shell() {
  const { toast } = useApp();
  return (
    <div className="device">
      <div className="app-shell" id="app-shell">
        {/* Marks non-prod backends (dev/uat) so testers never confuse them with production. */}
        {!env.isProduction && env.name !== 'local' && <span className="env-ribbon">{env.name.toUpperCase()}</span>}
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<RequireAuth />}>
            <Route element={<TabLayout />}>
              <Route path="/home" element={<Home />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/reserve" element={<Reserve />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
            <Route path="/nft/:id" element={<NftDetail />} />
            <Route path="/deposit" element={<Deposit />} />
            <Route path="/withdraw" element={<Withdraw />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/team" element={<Team />} />
            <Route path="/referral" element={<Referral />} />
            <Route path="/levels" element={<Levels />} />
            <Route path="/notifications" element={<Notifications />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toast toast={toast} />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Shell />
      </AppProvider>
    </BrowserRouter>
  );
}
