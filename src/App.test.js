import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

// App já inclui BrowserRouter internamente; para testes usa wrapper neutro
function renderApp(route = '/') {
  // Simula URL via window.location não é necessário aqui — BrowserRouter dentro do App
  // Para isolar, renderizamos o App diretamente (ele traz BrowserRouter)
  return render(<App />);
}

test('renderiza o cabecalho e o status de funcionamento da loja', () => {
  renderApp();
  expect(screen.getByRole('link', { name: /doces da ale/i })).toBeInTheDocument();
  expect(screen.getByText(/aberto|fechado/i)).toBeInTheDocument();
});

test('renderiza o menu de navegacao e os atalhos de conta', () => {
  renderApp();
  expect(screen.getByRole('link', { name: 'Início' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Promoções' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Pedidos' })).toBeInTheDocument();
  // Botão de Entrar visível quando não logado
  expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
});

test('renderiza as categorias do cardapio', () => {
  renderApp();
  expect(screen.getByRole('button', { name: 'Todos' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /tradicionais/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /gourmet/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /caixas/i })).toBeInTheDocument();
});

test('busca filtra os produtos exibidos', () => {
  renderApp();
  const search = screen.getByPlaceholderText(/busque por um produto/i);
  fireEvent.change(search, { target: { value: 'churros' } });

  expect(screen.getByText('Churros')).toBeInTheDocument();
  expect(screen.queryByText('Tradicional')).not.toBeInTheDocument();
});

test('nao renderiza mais secoes institucionais antigas', () => {
  renderApp();
  expect(screen.queryByText(/nossa história/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/depoimentos/i)).not.toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: /perguntas frequentes/i })).not.toBeInTheDocument();
});

test('adicionar um produto ao carrinho atualiza o contador e abre o drawer', () => {
  renderApp();
  const addButtons = screen.getAllByLabelText(/adicionar .* ao carrinho/i);
  fireEvent.click(addButtons[0]);

  expect(screen.getByLabelText(/abrir carrinho/i)).toHaveTextContent('1');
  expect(screen.getByRole('heading', { name: /seu carrinho/i })).toBeInTheDocument();
  expect(screen.getAllByRole('link', { name: /fazer pedido/i }).length).toBeGreaterThan(0);
});
