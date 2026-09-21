import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders GamesLibrary application', () => {
  render(<App />);

  const heading = screen.getByText(/games/i);
  expect(heading).toBeInTheDocument();
});