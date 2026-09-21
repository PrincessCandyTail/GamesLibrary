import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders GamesLibrary application', () => {
  render(<App />);

  const heading = screen.getByRole('heading', {
    name: /games library/i
  });

  expect(heading).toBeInTheDocument();
});