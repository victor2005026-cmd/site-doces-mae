import { Playfair_Display, Lato, Great_Vibes } from 'next/font/google';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
});

const lato = Lato({
  subsets: ['latin'],
  weight: ['300', '400', '700', '900'],
  variable: '--font-lato',
  display: 'swap',
});

const greatVibes = Great_Vibes({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-great-vibes',
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL('https://www.docesdaale.com.br'),
  title: 'Doces da Ale | Brigadeiros Gourmet e Doces Finos Artesanais em Santos/SP',
  description:
    'Brigadeiros gourmet, doces finos e bolos personalizados feitos à mão em Santos/SP. Encomende pelo WhatsApp e transforme seu momento especial em uma lembrança inesquecível.',
  keywords:
    'brigadeiros gourmet Santos, doces finos artesanais, confeitaria Santos SP, doces personalizados, trufas artesanais, kits de doces para presentear',
  authors: [{ name: 'Doces da Ale' }],
  alternates: {
    canonical: 'https://www.docesdaale.com.br/',
  },
  openGraph: {
    type: 'website',
    title: 'Doces da Ale | Brigadeiros Gourmet e Doces Finos Artesanais',
    description:
      'Doces feitos com amor para transformar momentos em lembranças inesquecíveis. Encomende pelo WhatsApp em Santos e região.',
    images: ['/images/logo.jpg'],
    locale: 'pt_BR',
    url: 'https://www.docesdaale.com.br/',
  },
  icons: {
    icon: '/images/logo.jpg',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#3C2415',
};

const schema = {
  '@context': 'https://schema.org',
  '@type': 'Bakery',
  name: 'Doces da Ale',
  image: '/images/logo.jpg',
  description: 'Brigadeiros gourmet, doces finos e bolos personalizados artesanais em Santos/SP.',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Santos',
    addressRegion: 'SP',
    addressCountry: 'BR',
  },
  telephone: '+5513999999999',
  priceRange: 'R$4,50 - R$150',
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    opens: '09:00',
    closes: '18:00',
  },
  sameAs: ['https://www.instagram.com/docesdaale'],
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${playfair.variable} ${lato.variable} ${greatVibes.variable}`}>
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      </head>
      <body className="font-body">
        <a href="#main-content" className="skip-link">
          Pular para o conteúdo
        </a>
        {children}
      </body>
    </html>
  );
}
