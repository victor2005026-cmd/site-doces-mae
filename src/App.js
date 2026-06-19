import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Sabores from './components/Sabores';
import Cardapio from './components/Cardapio';
import Galeria from './components/Galeria';
import Depoimentos from './components/Depoimentos';
import ComoFunciona from './components/ComoFunciona';
import Faq from './components/Faq';
import CtaFinal from './components/CtaFinal';
import Footer from './components/Footer';
import WhatsappFloat from './components/WhatsappFloat';

export default function App() {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Pular para o conteúdo
      </a>

      <Navbar />

      <main id="main-content">
        <Hero />
        <Sabores />
        <Cardapio />
        <Galeria />
        <Depoimentos />
        <ComoFunciona />
        <Faq />
        <CtaFinal />
      </main>

      <Footer />
      <WhatsappFloat />
    </>
  );
}
