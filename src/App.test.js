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
  expect(screen.getByRole('button', { name: 'Promoções' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Pedidos' })).toBeInTheDocument();
  // Botão de Entrar visível quando não logado — existe em duas variantes no
  // DOM ao mesmo tempo (mobile compacta e desktop), já que o jsdom não
  // aplica de verdade as classes responsivas que escondem uma delas.
  expect(screen.getAllByRole('button', { name: /entrar/i }).length).toBeGreaterThan(0);
});

test('renderiza as categorias do cardapio', async () => {
  renderApp();
  expect(screen.getByRole('button', { name: 'Todos' })).toBeInTheDocument();
  // Produtos vêm do Supabase de forma assíncrona (e em teste caem no
  // fallback local, já que o jsdom não acessa a internet de verdade) —
  // espera o carregamento, com folga pro tempo que a falha de rede leva
  // pra ser detectada.
  expect(await screen.findByRole('heading', { name: /gourmet/i }, { timeout: 8000 })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /caixas/i })).toBeInTheDocument();
}, 12000);

test('busca filtra os produtos exibidos', async () => {
  renderApp();
  const search = screen.getByPlaceholderText(/busque por um produto/i);
  fireEvent.change(search, { target: { value: 'churros' } });

  expect(await screen.findByText('Churros', {}, { timeout: 8000 })).toBeInTheDocument();
  expect(screen.queryByText('Tradicional')).not.toBeInTheDocument();
}, 12000);

test('nao renderiza mais secoes institucionais antigas', () => {
  renderApp();
  expect(screen.queryByText(/nossa história/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/depoimentos/i)).not.toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: /perguntas frequentes/i })).not.toBeInTheDocument();
});

test('adicionar um produto ao carrinho atualiza o contador e abre o drawer', async () => {
  renderApp();
  const addButtons = await screen.findAllByLabelText(/adicionar .* ao carrinho/i, {}, { timeout: 8000 });
  fireEvent.click(addButtons[0]);

  expect(screen.getByLabelText(/abrir carrinho/i)).toHaveTextContent('1');
  expect(screen.getByRole('heading', { name: /seu carrinho/i })).toBeInTheDocument();
  expect(screen.getAllByRole('link', { name: /fazer pedido/i }).length).toBeGreaterThan(0);
}, 12000);
