import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { waLink } from '../lib/whatsapp';
import { formatPrice } from '../data/products';

function CardPromocao({ p }) {
  const produto = p.produtos;
  const precoCheio = produto ? produto.preco * p.quantidade : null;
  const desconto = produto && precoCheio > 0
    ? Math.round((1 - Number(p.preco_promocional) / precoCheio) * 100)
    : 0;

  return (
    <li className="flex gap-3 rounded-card border border-border-light bg-bg-alt p-3">
      <div className="min-w-0 flex-1">
        <p className="font-heading text-[0.95rem] font-bold leading-snug text-text-primary">{p.titulo}</p>
        {p.descricao && <p className="mt-1 line-clamp-2 text-[0.8rem] text-text-secondary">{p.descricao}</p>}

        {produto && (
          <>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-[1.05rem] font-bold text-success">{formatPrice(p.preco_promocional)}</span>
              <span className="text-[0.85rem] text-text-secondary line-through">{formatPrice(precoCheio)}</span>
              {desconto > 0 && (
                <span className="rounded-full bg-success/15 px-2 py-0.5 text-[0.7rem] font-bold text-success">
                  -{desconto}%
                </span>
              )}
            </div>
            <p className="mt-1 text-[0.75rem] text-text-secondary">
              {produto.nome}{p.quantidade > 1 ? ` · leve ${p.quantidade}` : ''}
            </p>
          </>
        )}
      </div>

      {produto?.imagem_url && (
        <img
          src={produto.imagem_url}
          alt={produto.nome}
          className="h-20 w-20 flex-shrink-0 rounded-card object-cover sm:h-24 sm:w-24"
        />
      )}
    </li>
  );
}

export default function PromocoesModal({ isOpen, onClose }) {
  const [promocoes, setPromocoes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    supabase
      .from('promocoes')
      .select('*, produtos(nome, preco, imagem_url)')
      .eq('ativa', true)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error('Erro ao buscar promoções:', error);
        setPromocoes(data ?? []);
        setLoading(false);
      });
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-card bg-bg-main p-6 shadow-lg">
        <div className="mb-4 flex shrink-0 items-center justify-between">
          <h2 className="font-heading text-[1.2rem] font-bold text-text-primary">Promoções</h2>
          <button type="button" onClick={onClose} className="text-[1.2rem] text-text-secondary hover:text-rose">×</button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {loading ? (
            <p className="py-8 text-center text-text-secondary">Carregando…</p>
          ) : promocoes.length === 0 ? (
            <div className="py-8 text-center text-text-secondary">
              <p>Nenhuma promoção ativa no momento.</p>
              <p className="mt-1 text-[0.85rem]">Fique de olho, novidades sempre aparecem por aqui!</p>
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {promocoes.map((p) => <CardPromocao key={p.id} p={p} />)}
            </ul>
          )}
        </div>

        <a
          href={waLink('Olá! Vi as promoções no site e quero fazer um pedido.')}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 shrink-0 rounded-full bg-success py-2.5 text-center text-[0.9rem] font-semibold text-white hover:bg-[#268a41]"
        >
          Falar no WhatsApp
        </a>
      </div>
    </div>
  );
}
