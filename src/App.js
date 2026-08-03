import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Banner from './components/Banner';
import SearchBar from './components/SearchBar';
import Menu from './components/Menu';
import CartDrawer from './components/CartDrawer';
import CartSidebar from './components/CartSidebar';
import Footer from './components/Footer';
import AdminPage from './admin/AdminPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import AguardandoPagamentoPage from './pages/AguardandoPagamentoPage';
import MeusPedidosPage from './pages/MeusPedidosPage';
import PerfilPage from './pages/PerfilPage';
import RedefinirSenhaPage from './pages/RedefinirSenhaPage';
import PoliticaPrivacidadePage from './pages/PoliticaPrivacidadePage';
import TermosUsoPage from './pages/TermosUsoPage';
import NotFoundPage from './pages/NotFoundPage';
import { CartProvider } from './context/CartContext';
import { AdminProductsProvider } from './context/AdminProductsContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

function StoreFront() {
  const [query, setQuery] = useState('');
  const location = useLocation();

  // Permite chegar em "/" com #topo ou #destaques vindo de outra página
  // (ex: header/menu mobile clicado em /meus-pedidos) — sem isso, o link só
  // funcionava quando o cliente já estava na home.
  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.slice(1);
    const t = setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    return () => clearTimeout(t);
  }, [location.hash]);

  return (
    <>
      <a href="#main-content" className="skip-link">
        Pular para o conteúdo
      </a>

      <Header />

      <main id="main-content" className="pt-[60px] md:pt-[70px]">
        <div id="topo" className="scroll-mt-[100px]" />
        <Banner />

        <div className="container-site py-5">
          <SearchBar value={query} onChange={setQuery} />
        </div>

        <div className="container-site grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
          <Menu query={query} />
          <CartSidebar />
        </div>
      </main>

      <Footer />
      <CartDrawer />
    </>
  );
}

// Páginas com header mas sem carrinho lateral
function PageWithHeader({ children }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AdminProductsProvider>
          <CartProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<StoreFront />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/pedido/:numeroPedido" element={
                  <PageWithHeader><OrderConfirmationPage /></PageWithHeader>
                } />
                <Route path="/pagamento/:numeroPedido" element={
                  <PageWithHeader><AguardandoPagamentoPage /></PageWithHeader>
                } />
                <Route path="/meus-pedidos" element={
                  <PageWithHeader><MeusPedidosPage /></PageWithHeader>
                } />
                <Route path="/perfil" element={
                  <PageWithHeader><PerfilPage /></PageWithHeader>
                } />
                <Route path="/redefinir-senha" element={
                  <PageWithHeader><RedefinirSenhaPage /></PageWithHeader>
                } />
                <Route path="/politica-privacidade" element={
                  <PageWithHeader><PoliticaPrivacidadePage /></PageWithHeader>
                } />
                <Route path="/termos-uso" element={
                  <PageWithHeader><TermosUsoPage /></PageWithHeader>
                } />
                <Route path="/admin/*" element={<AdminPage />} />
                <Route path="*" element={
                  <PageWithHeader><NotFoundPage /></PageWithHeader>
                } />
              </Routes>
            </BrowserRouter>
          </CartProvider>
        </AdminProductsProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
