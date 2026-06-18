import { render, screen } from '@testing-library/react';
import App from './App';

test('renderiza o titulo principal do Hero', () => {
  render(<App />);
  const heading = screen.getByRole('heading', { name: /doces da ale/i, level: 1 });
  expect(heading).toBeInTheDocument();
});

test('nao renderiza mais a secao Sobre/Nossa Historia', () => {
  render(<App />);
  expect(screen.queryByText(/nossa história/i)).not.toBeInTheDocument();
});

test('botao do whatsapp flutuante nao tem svg de estrela decorativa', () => {
  render(<App />);
  const waLink = screen.getByLabelText(/falar no whatsapp/i);
  const svgs = waLink.querySelectorAll('svg');
  expect(svgs).toHaveLength(1);
});
