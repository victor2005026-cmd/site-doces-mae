import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { tocarPing } from '../lib/somNotificacao';
import AdminProductList from './AdminProductList';
import AdminHoursForm from './AdminHoursForm';
import AdminImagesSection from './AdminImagesSection';
import AdminOrdersTab from './AdminOrdersTab';
import AdminStatsTab from './AdminStatsTab';
import AdminSettingsTab from './AdminSettingsTab';
import AdminTaxasEntregaTab from './AdminTaxasEntregaTab';
import AdminCuponsTab from './AdminCuponsTab';
import AdminAgendaTab from './AdminAgendaTab';
import AdminPromocoesTab from './AdminPromocoesTab';

const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'pedidos', label: 'Pedidos' },
  { id: 'produtos', label: 'Produtos' },
  { id: 'agenda', label: 'Agenda' },
  { id: 'horario', label: 'Horário' },
  { id: 'taxas', label: 'Bairros atendidos' },
  { id: 'promocoes', label: 'Promoções' },
  { id: 'cupons', label: 'Cupons' },
  { id: 'imagens', label: 'Imagens' },
  { id: 'configuracoes', label: 'Config.' },
];

const TITULO_ORIGINAL = 'Doces da Ale — Admin';
export const ULTIMA_VISTA_KEY = 'doces-da-ale:admin-pedidos-vistos-em';

export default function AdminDashboard({ onLogout }) {
  const [tab, setTab] = useState('dashboard');
  const [naoVistos, setNaoVistos] = useState(0);
  const naoVistosRef = useRef(0);

  useEffect(() => {
    document.title = TITULO_ORIGINAL;
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Toca som + notificação do navegador + atualiza o título da aba sempre
  // que um pedido novo (feito pelo site/WhatsApp/Instagram — não os
  // lançados manualmente por ela mesma) chega, em qualquer aba do admin.
  useEffect(() => {
    const channel = supabase
      .channel('admin-pedidos-novos')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pedidos' }, (payload) => {
        if (payload.new?.origem === 'manual') return;

        naoVistosRef.current += 1;
        setNaoVistos(naoVistosRef.current);
        document.title = `🔔 (${naoVistosRef.current}) Novo pedido!`;
        tocarPing();

        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          new Notification('Novo pedido — Doces da Ale', {
            body: `Pedido ${payload.new?.numero_pedido ?? ''} acabou de chegar.`,
          });
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // Zera o aviso quando ela volta pra aba do navegador ou abre "Pedidos"
  useEffect(() => {
    const limpar = () => {
      if (naoVistosRef.current === 0) return;
      naoVistosRef.current = 0;
      setNaoVistos(0);
      document.title = TITULO_ORIGINAL;
      try { localStorage.setItem(ULTIMA_VISTA_KEY, new Date().toISOString()); } catch {}
    };

    const onFocus = () => limpar();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  const handleTabClick = (id) => {
    setTab(id);
    if (id === 'pedidos' && naoVistosRef.current > 0) {
      naoVistosRef.current = 0;
      setNaoVistos(0);
      document.title = TITULO_ORIGINAL;
      try { localStorage.setItem(ULTIMA_VISTA_KEY, new Date().toISOString()); } catch {}
    }
  };

  return (
    <div className="min-h-screen bg-bg-alt">
      {/* Barra do topo */}
      <div className="border-b border-border-light bg-bg-main">
        <div className="container-site flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-script text-[1.5rem] text-gold">Doces da Ale</span>
            <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[0.72rem] font-semibold text-gold">
              ADMIN
            </span>
          </div>
          <div className="flex items-center gap-5">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[0.85rem] font-medium text-text-primary hover:text-rose"
            >
              Ver site
            </a>
            <button
              type="button"
              onClick={onLogout}
              className="text-[0.85rem] font-medium text-text-secondary hover:text-rose"
            >
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Abas */}
      <div className="overflow-x-auto border-b border-border-light bg-bg-main">
        <div className="container-site flex min-w-max">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => handleTabClick(t.id)}
              className={`relative border-b-2 px-5 py-3 text-[0.9rem] font-medium transition-colors ${
                tab === t.id
                  ? 'border-rose text-rose'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              {t.label}
              {t.id === 'pedidos' && naoVistos > 0 && (
                <span className="absolute right-1 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose px-1 text-[0.65rem] font-bold text-white">
                  {naoVistos}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="container-site py-6">
        {tab === 'dashboard'     && <AdminStatsTab />}
        {tab === 'pedidos'       && <AdminOrdersTab />}
        {tab === 'produtos'      && <AdminProductList />}
        {tab === 'agenda'        && <AdminAgendaTab />}
        {tab === 'horario'       && <AdminHoursForm />}
        {tab === 'taxas'         && <AdminTaxasEntregaTab />}
        {tab === 'promocoes'     && <AdminPromocoesTab />}
        {tab === 'cupons'        && <AdminCuponsTab />}
        {tab === 'imagens'       && <AdminImagesSection />}
        {tab === 'configuracoes' && <AdminSettingsTab />}
      </div>
    </div>
  );
}
