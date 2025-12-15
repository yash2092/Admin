import { render, screen } from '@testing-library/react';
import App from './App';

test('renders dashboard shell', () => {
  render(<App />);
  expect(screen.getByText(/rootvestors/i)).toBeInTheDocument();
  expect(screen.getAllByText(/institute list/i).length).toBeGreaterThan(0);
});
