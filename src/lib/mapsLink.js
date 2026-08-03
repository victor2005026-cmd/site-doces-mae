// Gera um link de busca do Google Maps a partir de um endereço estruturado.
export function gerarLinkGoogleMaps(endereco) {
  const partes = [endereco?.rua, endereco?.numero, endereco?.bairro, endereco?.cidade, 'SP']
    .filter(Boolean)
    .join(', ');
  if (!partes) return '';
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(partes)}`;
}
