import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import MeusPedidosPage from './pages/MeusPedidosPage';
import { CartProvider } from './context/CartContext';
import { ImageOverridesProvider } from './context/ImageOverridesContext';
import { AdminProductsProvider } from './context/AdminProductsContext';
import { AuthProvider } from './context/AuthContext';

function StoreFront() {
  const [query, setQuery] = useState('');

  return (
    <>
      <a href="#main-content" className="skip-link">
        Pular para o conteúdo
      </a>

      <Header />

      <main id="main-content" className="pt-[70px]">
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
    <AuthProvider>
      <ImageOverridesProvider>
        <AdminProductsProvider>
          <CartProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<StoreFront />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/pedido/:numeroPedido" element={
                  <PageWithHeader><OrderConfirmationPage /></PageWithHeader>
                } />
                <Route path="/meus-pedidos" element={
                  <PageWithHeader><MeusPedidosPage /></PageWithHeader>
                } />
                <Route path="/admin/*" element={<AdminPage />} />
              </Routes>
            </BrowserRouter>
          </CartProvider>
        </AdminProductsProvider>
      </ImageOverridesProvider>
    </AuthProvider>
  );
}
