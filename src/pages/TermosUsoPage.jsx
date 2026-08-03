import { Link } from 'react-router-dom';
import { waLink } from '../lib/whatsapp';

export default function TermosUsoPage() {
  return (
    <div className="min-h-screen bg-bg-alt pt-[60px] md:pt-[70px]">
      <div className="container-site max-w-site-narrow py-10">
        <Link to="/" className="mb-6 inline-block text-[0.85rem] font-medium text-text-secondary hover:text-rose">
          ← Voltar ao cardápio
        </Link>

        <h1 className="mb-2 font-heading text-[1.6rem] font-bold text-text-primary">Termos de Uso</h1>
        <p className="mb-8 text-[0.82rem] text-text-secondary">Última atualização: 26 de julho de 2026</p>

        <div className="flex flex-col gap-6 rounded-card border border-border-light bg-bg-main p-6 text-[0.92rem] leading-relaxed text-text-primary sm:p-8">
          <p>
            Estes Termos de Uso regulam o uso do site da <strong>Doces da Ale</strong>. Ao criar uma conta ou
            fazer um pedido, você concorda com as condições abaixo.
          </p>

          <section>
            <h2 className="mb-2 font-heading text-[1.05rem] font-semibold">1. Cadastro</h2>
            <p className="text-text-secondary">
              O cadastro é opcional pra fazer pedidos (você também pode comprar como convidado), mas é
              necessário caso queira acompanhar seu histórico de pedidos. Ao se cadastrar, você garante que
              os dados informados (nome, telefone) são verdadeiros e atualizados, e é responsável por manter
              sua senha em sigilo.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-heading text-[1.05rem] font-semibold">2. Pedidos e agendamento</h2>
            <ul className="list-inside list-disc space-y-1 text-text-secondary">
              <li>Todo pedido precisa de uma data e período de entrega/retirada agendados, respeitando o prazo mínimo de antecedência informado no checkout.</li>
              <li>O pedido só é confirmado depois do pagamento ser identificado.</li>
              <li>Cancelamentos podem ser solicitados pelo WhatsApp; pedidos já em preparo podem não ser cancelados dependendo do estágio de produção.</li>
              <li>A loja pode entrar em contato pra confirmar detalhes do pedido antes de iniciar o preparo.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 font-heading text-[1.05rem] font-semibold">3. Pagamento</h2>
            <p className="text-text-secondary">
              O pagamento é feito via Pix. Após confirmar o pedido, você recebe um QR Code / código Pix
              "Copia e Cola" com prazo pra pagamento. Pedidos não pagos dentro do prazo são cancelados
              automaticamente.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-heading text-[1.05rem] font-semibold">4. Entrega</h2>
            <p className="text-text-secondary">
              Fazemos entregas em Santos/SP e região, conforme os bairros atendidos exibidos no checkout.
              Fora dessas áreas, só é possível retirar no local. Prazos de entrega são estimados e podem
              variar por condições de trânsito, clima ou volume de pedidos.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-heading text-[1.05rem] font-semibold">5. Preços</h2>
            <p className="text-text-secondary">
              Os preços exibidos no site podem ser alterados a qualquer momento, sem aviso prévio. O valor
              válido é sempre o exibido no momento da confirmação do pedido.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-heading text-[1.05rem] font-semibold">6. Trocas e devoluções</h2>
            <p className="text-text-secondary">
              Por se tratar de produtos alimentícios perecíveis, feitos sob encomenda, não aceitamos
              devolução após a entrega, exceto em caso de produto entregue com defeito, avaria ou divergente
              do pedido — nesse caso, entre em contato em até 2 horas após o recebimento pelo WhatsApp com
              fotos do produto, pra avaliarmos troca ou reembolso.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-heading text-[1.05rem] font-semibold">7. Foro</h2>
            <p className="text-text-secondary">
              Fica eleito o foro da Comarca de Santos/SP para dirimir quaisquer dúvidas ou controvérsias
              decorrentes destes Termos de Uso.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-heading text-[1.05rem] font-semibold">8. Contato</h2>
            <p className="text-text-secondary">Dúvidas sobre estes termos?</p>
            <a
              href={waLink('Olá! Tenho uma dúvida sobre os Termos de Uso do site.')}
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
