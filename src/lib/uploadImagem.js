import imageCompression from 'browser-image-compression';
import { supabase } from './supabase';

const BUCKET = 'produtos';
const MAX_FILE_SIZE_MB = 5;
const TIPOS_ACEITOS = ['image/jpeg', 'image/png', 'image/webp'];

function suportaWebp() {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').startsWith('data:image/webp');
  } catch {
    return false;
  }
}

export function validarImagemProduto(file) {
  if (!TIPOS_ACEITOS.includes(file.type)) {
    return 'Formato não aceito. Envie uma foto JPEG, PNG ou WebP.';
  }
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    return `Arquivo muito grande. O tamanho máximo é ${MAX_FILE_SIZE_MB} MB.`;
  }
  return null;
}

export async function comprimirImagemProduto(file, opts = {}) {
  const { maxWidthOrHeight = 800, maxSizeMB = 0.1 } = opts;
  try {
    return await imageCompression(file, {
      maxWidthOrHeight,
      maxSizeMB,
      useWebWorker: true,
      initialQuality: 0.8,
      fileType: suportaWebp() ? 'image/webp' : 'image/jpeg',
    });
  } catch {
    throw new Error('Não foi possível otimizar a imagem. Tenta uma foto menor.');
  }
}

async function enviarParaStorage(blob, nomeBase, pasta) {
  const extensao = blob.type === 'image/webp' ? 'webp' : 'jpg';
  const nomeArquivo = `${pasta ? `${pasta}/` : ''}${nomeBase}-${Date.now()}.${extensao}`;

  const { error } = await supabase.storage.from(BUCKET).upload(nomeArquivo, blob, {
    contentType: blob.type,
    cacheControl: '31536000',
    upsert: false,
  });
  if (error) throw new Error('Não foi possível enviar a imagem. Tenta de novo.');

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(nomeArquivo);
  return data.publicUrl;
}

// Fotos do site (banner, logo) — mesmo bucket "produtos", subpasta "site/".
export async function uploadImagemSite(file, nomeBase, opts = {}) {
  const erro = validarImagemProduto(file);
  if (erro) throw new Error(erro);
  const comprimida = await comprimirImagemProduto(file, opts);
  return enviarParaStorage(comprimida, nomeBase, 'site');
}

// Combina compressão + upload num passo só. Use comprimirImagemProduto + enviarImagemComprimida
// separadamente quando quiser mostrar progresso de compressão antes do upload em si.
export async function uploadImagemProduto(file, produtoId) {
  const erro = validarImagemProduto(file);
  if (erro) throw new Error(erro);
  const comprimida = await comprimirImagemProduto(file);
  return enviarParaStorage(comprimida, produtoId);
}

export function enviarImagemComprimida(blob, produtoId) {
  return enviarParaStorage(blob, produtoId);
}

export async function deletarImagemProduto(url) {
  const nomeArquivo = extrairNomeArquivo(url);
  if (!nomeArquivo) return;
  const { error } = await supabase.storage.from(BUCKET).remove([nomeArquivo]);
  if (error) console.error('Erro ao deletar imagem do storage:', error);
}

function extrairNomeArquivo(url) {
  if (!url) return null;
  const marcador = `/${BUCKET}/`;
  const idx = url.indexOf(marcador);
  if (idx === -1) return null;
  return decodeURIComponent(url.slice(idx + marcador.length).split('?')[0]);
}
