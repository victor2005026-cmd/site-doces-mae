import { useState } from 'react';
import AdminProductList from './AdminProductList';
import AdminHoursForm from './AdminHoursForm';
import AdminImagesSection from './AdminImagesSection';
import AdminOrdersTab from './AdminOrdersTab';
import AdminStatsTab from './AdminStatsTab';
import AdminSettingsTab from './AdminSettingsTab';

const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'pedidos', label: 'Pedidos' },
  { id: 'produtos', label: 'Produtos' },
  { id: 'horario', label: 'Horário' },
  { id: 'imagens', label: 'Imagens' },
  { id: 'configuracoes', label: 'Config.' },
];

export default function AdminDashboard({ onLogout }) {
  const [tab, setTab] = useState('dashboard');

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
              onClick={() => setTab(t.id)}
              className={`border-b-2 px-5 py-3 text-[0.9rem] font-medium transition-colors ${
                tab === t.id
                  ? 'border-rose text-rose'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="container-site py-6">
        {tab === 'dashboard'     && <AdminStatsTab />}
        {tab === 'pedidos'       && <AdminOrdersTab />}
        {tab === 'produtos'      && <AdminProductList />}
        {tab === 'horario'       && <AdminHoursForm />}
        {tab === 'imagens'       && <AdminImagesSection />}
        {tab === 'configuracoes' && <AdminSettingsTab />}
      </div>
    </div>
  );
}
