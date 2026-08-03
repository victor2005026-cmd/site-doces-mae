import { Link } from 'react-router-dom';
import { waLink } from '../lib/whatsapp';

export default function PoliticaPrivacidadePage() {
  return (
    <div className="min-h-screen bg-bg-alt pt-[60px] md:pt-[70px]">
      <div className="container-site max-w-site-narrow py-10">
        <Link to="/" className="mb-6 inline-block text-[0.85rem] font-medium text-text-secondary hover:text-rose">
          ← Voltar ao cardápio
        </Link>

        <h1 className="mb-2 font-heading text-[1.6rem] font-bold text-text-primary">Política de Privacidade</h1>
        <p className="mb-8 text-[0.82rem] text-text-secondary">Última atualização: 26 de julho de 2026</p>

        <div className="flex flex-col gap-6 rounded-card border border-border-light bg-bg-main p-6 text-[0.92rem] leading-relaxed text-text-primary sm:p-8">
          <p>
            Esta Política de Privacidade explica como a <strong>Doces da Ale</strong> coleta, usa e protege
            os dados pessoais de quem visita ou faz pedidos neste site, em conformidade com a Lei Geral de
            Proteção de Dados (Lei nº 13.709/2018 — LGPD).
          </p>

          <section>
            <h2 className="mb-2 font-heading text-[1.05rem] font-semibold">1. Quais dados coletamos</h2>
            <p>Coletamos apenas os dados necessários pra processar seu pedido e falar com você:</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-text-secondary">
              <li>Nome completo</li>
              <li>Telefone / WhatsApp</li>
              <li>Endereço de entrega (quando você escolhe receber em casa)</li>
              <li>E-mail (opcional, se você informar)</li>
              <li>Histórico de pedidos feitos no site</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 font-heading text-[1.05rem] font-semibold">2. Pra que usamos seus dados</h2>
            <ul className="list-inside list-disc space-y-1 text-text-secondary">
              <li>Processar, confirmar e entregar o seu pedido</li>
              <li>Calcular taxa de entrega e prazo</li>
              <li>Entrar em contato sobre o andamento do pedido (WhatsApp)</li>
              <li>Permitir que você acompanhe seu histórico de pedidos, se criar uma conta</li>
              <li>Aplicar cupons de desconto vinculados ao seu telefone, quando for o caso</li>
            </ul>
            <p className="mt-2 text-text-secondary">Não usamos seus dados pra enviar propaganda sem sua autorização.</p>
          </section>

          <section>
            <h2 className="mb-2 font-heading text-[1.05rem] font-semibold">3. Com quem compartilhamos seus dados</h2>
            <p className="text-text-secondary">
              Não vendemos nem compartilhamos seus dados com terceiros para fins comerciais. Seus dados só
              podem ser acessados por quem administra a loja (pra atender seu pedido) e podem ser divulgados
              caso exigido por lei ou ordem judicial.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-heading text-[1.05rem] font-semibold">4. Seus direitos</h2>
            <p className="text-text-secondary">Como titular dos dados, você pode a qualquer momento solicitar:</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-text-secondary">
              <li>Acesso aos dados que temos sobre você</li>
              <li>Correção de dados incompletos, desatualizados ou incorretos</li>
              <li>Exclusão dos seus dados (exceto o que precisamos manter por obrigação fiscal/legal)</li>
              <li>Informação sobre com quem seus dados são compartilhados</li>
            </ul>
            <p className="mt-2 text-text-secondary">
              Você também pode editar seu nome, telefone e endereço a qualquer momento na página{' '}
              <Link to="/perfil" className="text-rose underline">Meu perfil</Link>.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-heading text-[1.05rem] font-semibold">5. Cookies</h2>
            <p className="text-text-secondary">
              Usamos apenas cookies e armazenamento local essenciais ao funcionamento do site (por exemplo,
              manter você logado e lembrar o conteúdo do seu carrinho). Não usamos cookies de rastreamento
              publicitário.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-heading text-[1.05rem] font-semibold">6. Segurança</h2>
            <p className="text-text-secondary">
              Seus dados ficam armazenados em infraestrutura com controle de acesso e criptografia em
              trânsito. Senhas nunca são armazenadas em texto simples.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-heading text-[1.05rem] font-semibold">7. Contato</h2>
            <p className="text-text-secondary">
              Dúvidas sobre esta política ou sobre seus dados? Fale com a Ale, responsável pelo tratamento
              dos dados coletados neste site:
            </p>
            <a
              href={waLink('Olá! Tenho uma dúvida sobre a Política de Privacidade do site.')}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block font-medium text-rose underline"
            >
              Falar no WhatsApp
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}
