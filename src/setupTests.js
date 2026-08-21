// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Variáveis de ambiente para testes (o .env.local não é carregado pelo Jest)
process.env.REACT_APP_SUPABASE_URL = 'http://localhost:54321';
process.env.REACT_APP_SUPABASE_ANON_KEY = 'test-anon-key-for-jest';

// jsdom não implementa IntersectionObserver (usado pelo scroll-spy do Menu)
class IntersectionObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.IntersectionObserver = IntersectionObserverMock;

// jsdom também não implementa matchMedia (usado pelo CartDrawer pra travar
// o scroll do body só no mobile)
window.matchMedia = window.matchMedia || function matchMediaMock(query) {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  };
};
