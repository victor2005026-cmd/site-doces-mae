import { useEffect, useRef, useState } from 'react';

// Nominatim (OpenStreetMap) — busca de endereço gratuita, sem API key.
// O navegador NÃO permite customizar o header User-Agent via fetch (é um
// header bloqueado por segurança do próprio browser); o Nominatim aceita
// isso em apps client-side porque o navegador já manda o Referer sozinho,
// identificando de qual site veio a busca.
const MIN_CHARS = 4;
const DEBOUNCE_MS = 500;
const MIN_INTERVALO_MS = 1000; // respeita o limite de 1 req/s do Nominatim

// Bounding box aproximado de Santos/SP (sudoeste, nordeste), pra restringir
// a busca só à região — sem isso, ruas de nome comum (ex: "Rua Oswaldo
// Cruz") voltam de qualquer cidade do Brasil e as de Santos ficam perdidas.
const VIEWBOX_SANTOS = '-46.4239,-23.9931,-46.2839,-23.8931';

const PinIcon = (props) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 1 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

function extrairEndereco(item) {
  const a = item.address || {};
  return {
    rua: a.road || a.pedestrian || a.footway || '',
    numero: a.house_number || '',
    bairro: a.suburb || a.neighbourhood || a.quarter || a.city_district || '',
    cidade: a.city || a.town || a.municipality || '',
    cep: a.postcode || '',
  };
}

function formatarSugestao(item) {
  const a = item.address || {};
  const partes = [
    a.road || (item.display_name ?? '').split(',')[0],
    a.suburb || a.neighbourhood,
    a.city || a.town || a.municipality,
  ].filter(Boolean);
  return partes.join(', ');
}

// bounded=1 já devia restringir ao viewbox, mas em áreas de fronteira (ex:
// São Vicente colado em Santos) o Nominatim às vezes ainda retorna vizinhos
// — por segurança, filtra de novo no front, aceitando só cidade = Santos.
function ehSantos(item) {
  const a = item.address || {};
  const cidade = (a.city || a.town || a.municipality || '').trim().toLowerCase();
  return cidade === 'santos';
}

// A busca ESTRUTURADA do Nominatim é rígida sobre o tipo de logradouro: "Rua
// Marechal Deodoro" não acha nada se o nome de verdade for "Avenida Marechal
// Deodoro". Como o cliente frequentemente erra ou nem sabe o tipo certo,
// tenta de novo sem o prefixo — o Nominatim acha pelo nome mesmo assim.
const PREFIXO_LOGRADOURO = /^(rua|r\.|avenida|av\.?|alameda|al\.?|pra[çc]a|travessa|rodovia|estrada|via|largo)\s+/i;

function removerPrefixoLogradouro(texto) {
  return texto.replace(PREFIXO_LOGRADOURO, '').trim();
}

export default function EnderecoAutocomplete({ onSelect }) {
  const [query, setQuery] = useState('');
  const [sugestoes, setSugestoes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [buscaFeita, setBuscaFeita] = useState(false);
  const cacheRef = useRef({});
  const lastFetchRef = useRef(0);
  const debounceRef = useRef(null);
  const reqIdRef = useRef(0);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    setErro('');
    setBuscaFeita(false);
    if (query.trim().length < MIN_CHARS) {
      setSugestoes([]);
      return undefined;
    }
    debounceRef.current = setTimeout(() => buscar(query.trim()), DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
  }, [query]); // eslint-disable-line

  // Respeita o limite de 1 req/s do Nominatim antes de CADA chamada (pode
  // ser chamado mais de uma vez por busca, por causa do fallback abaixo).
  const aguardarIntervalo = async () => {
    const espera = Math.max(0, MIN_INTERVALO_MS - (Date.now() - lastFetchRef.current));
    if (espera > 0) await new Promise((r) => setTimeout(r, espera));
    lastFetchRef.current = Date.now();
  };

  const chamarNominatim = async (params) => {
    await aguardarIntervalo();
    const res = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`);
    if (!res.ok) throw new Error('Falha na busca');
    return res.json();
  };

  const buscarEstruturado = (rua) => chamarNominatim(new URLSearchParams({
    street: rua,
    city: 'Santos',
    state: 'São Paulo',
    country: 'Brasil',
    format: 'json',
    addressdetails: '1',
    limit: '10',
    viewbox: VIEWBOX_SANTOS,
    bounded: '1',
    'accept-language': 'pt-BR',
  }));

  const buscar = async (texto) => {
    const chave = texto.toLowerCase();
    if (cacheRef.current[chave]) {
      setSugestoes(cacheRef.current[chave]);
      setBuscaFeita(true);
      return;
    }

    const meuId = ++reqIdRef.current;
    setLoading(true);
    try {
      // 1ª tentativa: com o texto exatamente como o cliente digitou.
      let data = await buscarEstruturado(texto);
      if (meuId !== reqIdRef.current) return; // resposta de uma busca antiga, ignora

      // 2ª tentativa: sem o prefixo do tipo de logradouro (Rua/Avenida/etc) —
      // só entra se a 1ª não achou nada E o cliente tinha digitado um prefixo,
      // pra cobrir o caso de errar o tipo (ex: "Rua X" quando é "Avenida X").
      if (data.length === 0) {
        const semPrefixo = removerPrefixoLogradouro(texto);
        if (semPrefixo && semPrefixo.toLowerCase() !== texto.toLowerCase()) {
          data = await buscarEstruturado(semPrefixo);
          if (meuId !== reqIdRef.current) return;
        }
      }

      const filtrado = data.filter(ehSantos);
      cacheRef.current[chave] = filtrado;
      setSugestoes(filtrado);
      setBuscaFeita(true);
    } catch {
      if (meuId !== reqIdRef.current) return;
      setErro('Não consegui buscar agora. Tente de novo ou preencha manualmente.');
      setSugestoes([]);
    } finally {
      if (meuId === reqIdRef.current) setLoading(false);
    }
  };

  const handleSelecionar = (item) => {
    const endereco = extrairEndereco(item);
    setSugestoes([]);
    setQuery('');
    setBuscaFeita(false);
    onSelect(endereco);
  };

  const semResultados = buscaFeita && !loading && !erro && sugestoes.length === 0;

  return (
    <div>
      <label className="mb-1 flex items-center gap-1.5 text-[0.85rem] font-medium text-text-primary">
        <PinIcon className="text-rose" /> Buscar endereço
      </label>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Digite o nome da rua…"
        className="w-full rounded-card border border-border-light bg-bg-alt px-4 py-2.5 text-[0.95rem] outline-none focus:border-rose focus:ring-1 focus:ring-rose"
      />
      {loading && <p className="mt-1 text-[0.8rem] text-text-secondary">Buscando…</p>}
      {erro && <p className="mt-1 text-[0.8rem] text-rose-dark">{erro}</p>}
      {semResultados && (
        <p className="mt-1 text-[0.8rem] text-rose-dark">
          Nenhum endereço encontrado em Santos. Tente ajustar o nome da rua ou use "Preencher manualmente".
        </p>
      )}

      {sugestoes.length > 0 && (
        <ul className="mt-2 divide-y divide-border-light overflow-hidden rounded-card border border-border-light bg-bg-main">
          {sugestoes.map((item) => (
            <li key={item.place_id}>
              <button
                type="button"
                onClick={() => handleSelecionar(item)}
                className="block w-full px-4 py-2.5 text-left text-[0.85rem] text-text-primary hover:bg-bg-alt"
              >
                {formatarSugestao(item)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
