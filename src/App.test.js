import { render, screen } from '@testing-library/react';
import App from './App';
import { isAdminAuthenticated, setAdminSession } from './admin/utils/adminAuth';

beforeEach(() => {
  window.localStorage.clear();
  window.history.pushState({}, '', '/');
});

test('renders admin login when not authenticated', () => {
  render(<App />);
  expect(screen.getByLabelText(/email id/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
});

test('renders dashboard shell when authenticated', () => {
  setAdminSession({ email: 'admin@example.com' });
  expect(isAdminAuthenticated()).toBe(true);
  render(<App />);
  expect(screen.getByText(/rootvestors/i)).toBeInTheDocument();
  expect(screen.getAllByText(/institute list/i).length).toBeGreaterThan(0);
});
