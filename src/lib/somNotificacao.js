// Toca um "ping" suave de duas notas usando a Web Audio API — sem precisar
// de nenhum arquivo de áudio (evita ter que hospedar/carregar um mp3).
export function tocarPing() {
  try {
    const AudioContextClasse = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClasse) return;
    const ctx = new AudioContextClasse();

    const tocarNota = (frequencia, inicioSeg, duracaoSeg) => {
      const osc = ctx.createOscillator();
      const ganho = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = frequencia;
      osc.connect(ganho);
      ganho.connect(ctx.destination);

      const t0 = ctx.currentTime + inicioSeg;
      ganho.gain.setValueAtTime(0, t0);
      ganho.gain.linearRampToValueAtTime(0.25, t0 + 0.02);
      ganho.gain.exponentialRampToValueAtTime(0.001, t0 + duracaoSeg);

      osc.start(t0);
      osc.stop(t0 + duracaoSeg + 0.05);
    };

    tocarNota(880, 0, 0.18);     // primeira nota (lá)
    tocarNota(1318.5, 0.15, 0.25); // segunda nota (mi), tipo "ping-pong"

    setTimeout(() => ctx.close(), 800);
  } catch (err) {
    console.error('Erro ao tocar som de notificação:', err);
  }
}
