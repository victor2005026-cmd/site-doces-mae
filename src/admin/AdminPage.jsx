import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';

export default function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!loading) setChecked(true);
  }, [loading]);

  if (!checked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-alt">
        <p className="text-text-secondary">Verificando acesso…</p>
      </div>
    );
  }

  if (!user) {
    return <AdminLogin onLogin={() => setChecked(false)} />;
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg-alt">
        <p className="font-heading text-[1.2rem] font-semibold text-text-primary">Acesso não autorizado</p>
        <p className="text-text-secondary">Sua conta não tem permissão de admin.</p>
        <a href="/" className="text-rose underline">Voltar ao site</a>
      </div>
    );
  }

  return <AdminDashboard onLogout={() => {}} />;
}
