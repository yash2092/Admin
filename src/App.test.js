import { render, screen } from '@testing-library/react';
import App from './App';
import { isAdminAuthenticated, setAdminSession } from './admin/utils/adminAuth';

beforeEach(() => {
  // WHY:
  // - Each test should be independent.
  // - The app uses `localStorage` for its temporary \"admin session\".
  window.localStorage.clear();

  // Reset the URL between tests so route-based rendering is predictable.
  window.history.pushState({}, '', '/');
});

test('renders admin login when not authenticated', () => {
  // No session is set, so protected routes should redirect to login.
  render(<App />);

  expect(screen.getByLabelText(/email id/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
});

test('renders dashboard shell when authenticated', () => {
  // Set the session before rendering so route protection passes.
  setAdminSession({ email: 'admin@example.com' });

  const userIsAuthenticated = isAdminAuthenticated();
  expect(userIsAuthenticated).toBe(true);

  render(<App />);
  expect(screen.getByText(/rootvestors/i)).toBeInTheDocument();
  expect(screen.getAllByText(/institute list/i).length).toBeGreaterThan(0);
});
