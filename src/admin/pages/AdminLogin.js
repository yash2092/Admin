import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { setAdminSession } from '../utils/adminAuth';
import '../styles/admin/login.css';

function BrandMark() {
  return (
    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M4 12c3-6 13-8 16-8-2 3-2 12-2 16-4 0-12-2-14-8z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 13c2-3 6-4 9-4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.1-.1-2.1-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 15.3 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4c-7.7 0-14.4 4.3-17.7 10.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.8-3.4-11.4-8.1l-6.6 5.1C9.2 39.7 16 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-1.2 3.4-3.8 6-7.1 7.5l.1.1 6.2 5.2C38 37.7 44 32.8 44 24c0-1.1-.1-2.1-.4-3.5z"
      />
    </svg>
  );
}

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const redirectTo = useMemo(() => {
    const from = location.state && location.state.from;
    return (from && from.pathname) || '/institutes';
  }, [location.state]);

  const canSubmit = agreed && email.trim() && password;

  function onSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;

    setAdminSession({ email: email.trim() });
    navigate(redirectTo, { replace: true });
  }

  return (
    <div className="adminLoginPage">
      <div className="adminLoginCard">
        <div className="adminLoginLeft">
          <h1 className="adminLoginTitle">
            <span className="adminLoginTitleStrong">Login</span> to your account
          </h1>

          <form className="adminLoginForm" onSubmit={onSubmit}>
            <div className="adminLoginField">
              <label className="adminLoginLabel" htmlFor="adminEmail">
                Email ID
              </label>
              <input
                id="adminEmail"
                className="adminLoginInput"
                type="email"
                placeholder="Example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
              />
            </div>

            <div className="adminLoginField">
              <label className="adminLoginLabel" htmlFor="adminPassword">
                Password
              </label>
              <div className="adminLoginPasswordWrap">
                <input
                  id="adminPassword"
                  className="adminLoginInput adminLoginPasswordInput"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  className="adminLoginPasswordToggle"
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <div className="adminLoginMetaRow">
                <label className="adminLoginCheck">
                  <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
                  <span>
                    I agree with <a className="adminLoginLink" href="#terms">Terms and Condition</a>
                  </span>
                </label>
                <a className="adminLoginLink" href="#forgot">
                  Forgot Password
                </a>
              </div>

              <button className="adminLoginSubmit" type="submit" disabled={!canSubmit}>
                Login
              </button>

              <div className="adminLoginDivider">
                <span />
                <span className="adminLoginDividerText">or login with</span>
                <span />
              </div>

              <button
                className="adminLoginGoogle"
                type="button"
                onClick={() => window.alert('Google login is not wired yet.')}
              >
                <span>Google</span>
                <GoogleG />
              </button>
            </div>
          </form>
        </div>

        <div className="adminLoginRight">
          <div className="adminLoginRightHeader">
            <div className="adminLoginBrand">
              <span className="adminLoginBrandMark">
                <BrandMark />
              </span>
              <div className="adminLoginBrandText">
                <div className="adminLoginBrandName">rootvestors</div>
                <div className="adminLoginBrandTag">Transforming Nation: from Roots to Reality</div>
              </div>
            </div>
          </div>

          <div className="adminLoginDesignPlaceholder" aria-label="Design placeholder" />
        </div>
      </div>
    </div>
  );
}
