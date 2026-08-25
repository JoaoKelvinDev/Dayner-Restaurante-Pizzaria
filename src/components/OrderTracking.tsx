import { Button } from '@/components/ui/button';
import { formatBRL } from '@/data/menu';
import type { Pedido, StatusPedido } from '@/types';
import {
  CheckCircle2,
  Circle,
  Clock,
  ChefHat,
  Package,
  Bike,
  PartyPopper,
} from 'lucide-react';

interface Props {
  pedido: Pedido;
  onNovoPedido: () => void;
}

const FLUXO_PADRAO: StatusPedido[] = [
  'recebido',
  'em_preparo',
  'pronto',
  'finalizado',
];

const FLUXO_DELIVERY: StatusPedido[] = [
  'recebido',
  'em_preparo',
  'pronto',
  'saiu_entrega',
  'finalizado',
];

const LABELS: Record<
  StatusPedido,
  { titulo: string; icon: React.ReactNode }
> = {
  recebido: {
    titulo: 'Pedido recebido',
    icon: <Clock className="w-4 h-4" />,
  },

  em_preparo: {
    titulo: 'Em preparo',
    icon: <ChefHat className="w-4 h-4" />,
  },

  pronto: {
    titulo: 'Pronto',
    icon: <Package className="w-4 h-4" />,
  },

  saiu_entrega: {
    titulo: 'Saiu para entrega',
    icon: <Bike className="w-4 h-4" />,
  },

  finalizado: {
    titulo: 'Finalizado',
    icon: <PartyPopper className="w-4 h-4" />,
  },
};

export default function OrderTracking({
  pedido,
  onNovoPedido,
}: Props) {
  const fluxo =
    pedido.modo === 'delivery'
      ? FLUXO_DELIVERY
      : FLUXO_PADRAO;

  const statusAtual = pedido.statusPedido;

  const idxAtual = fluxo.indexOf(statusAtual);

  const total = pedido.itens.reduce(
    (s, i) => s + i.precoUnitario * i.quantidade,
    0
  );

  /**
   * Somente Pix pendente deve bloquear o fluxo
   * aguardando confirmação de pagamento.
   *
   * Dinheiro e cartão são pagamentos presenciais,
   * portanto o pedido continua normalmente.
   */
  const aguardandoPagamento =
    pedido.dados.formaPagamento === 'pix' &&
    pedido.statusPagamento === 'pendente';

  const formaPagamentoLabel = {
    pix: 'Pix',
    cartao: 'Cartão',
    dinheiro: 'Dinheiro',
  }[pedido.dados.formaPagamento];

  const modoPedidoLabel = {
    comer_la: 'Comer no local',
    retirada: 'Retirada',
    delivery: 'Delivery',
  }[pedido.modo];

  return (
    <div className="min-h-[100dvh] bg-background px-5 py-8 flex flex-col">
      <div className="max-w-md w-full mx-auto flex-1 flex flex-col">

        {/* IDENTIFICAÇÃO DO PEDIDO */}
        <div className="text-center mb-6">
          <p className="text-xs text-muted-foreground uppercase tracking-widest">
            Pedido
          </p>

          <p className="font-display text-2xl tracking-wide text-gold-gradient">
            #{pedido.id}
          </p>
        </div>

        {/* AGUARDANDO PAGAMENTO PIX */}
        {aguardandoPagamento ? (
          <div className="rounded-xl border border-primary/40 bg-primary/10 p-5 text-center mb-6">
            <Clock className="w-6 h-6 text-primary mx-auto mb-2" />

            <p className="font-semibold text-sm">
              Aguardando confirmação do pagamento
            </p>

            <p className="text-xs text-muted-foreground mt-1">
              Assim que o Pix for confirmado, seu pedido entra
              automaticamente na fila de preparo.
            </p>
          </div>
        ) : (
          /* FLUXO DO PEDIDO */
          <div className="space-y-0 mb-6">
            {fluxo.map((status, i) => {
              const concluido = i < idxAtual;
              const atual = i === idxAtual;

              return (
                <div key={status} className="flex gap-3">

                  <div className="flex flex-col items-center">

                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        concluido || atual
                          ? 'bg-gold-gradient text-[#0D0D0D]'
                          : 'bg-secondary text-muted-foreground'
                      }`}
                    >
                      {concluido ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : atual ? (
                        LABELS[status].icon
                      ) : (
                        <Circle className="w-3 h-3" />
                      )}
                    </div>

                    {i < fluxo.length - 1 && (
                      <div
                        className={`w-0.5 flex-1 min-h-8 ${
                          concluido
                            ? 'bg-primary'
                            : 'bg-border'
                        }`}
                      />
                    )}
                  </div>

                  <div className="pb-6">

                    <p
                      className={`text-sm font-medium ${
                        atual
                          ? 'text-primary'
                          : concluido
                            ? ''
                            : 'text-muted-foreground'
                      }`}
                    >
                      {LABELS[status].titulo}
                    </p>

                    {atual && (
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {status === 'finalizado'
                          ? 'Pedido finalizado.'
                          : 'Aguardando atualização do restaurante.'}
                      </p>
                    )}

                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* RESUMO DO PEDIDO */}
        <div className="rounded-xl border border-border bg-card p-4 mb-4">

          <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            Resumo do pedido
          </h3>

          <div className="space-y-2 mb-3">
            {pedido.itens.map((item) => (
              <div
                key={item.uid}
                className="flex justify-between text-sm gap-2"
              >
                <span className="text-foreground/90">
                  {item.quantidade}x {item.nomeExibicao}
                </span>

                <span className="text-muted-foreground shrink-0">
                  {formatBRL(
                    item.precoUnitario * item.quantidade
                  )}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-3 border-t border-border">
            <span className="text-sm font-medium">
              Total
            </span>

            <span className="font-display text-lg text-primary">
              {formatBRL(total)}
            </span>
          </div>

          {/* DADOS DO CLIENTE */}
          <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground space-y-1">

            <p>
              {pedido.dados.nomeCliente} ·{' '}
              {pedido.dados.telefoneCliente}
            </p>

            {/* ENDEREÇO SOMENTE PARA DELIVERY */}
            {pedido.modo === 'delivery' &&
              pedido.dados.endereco && (
                <p>
                  {pedido.dados.endereco.rua},{' '}
                  {pedido.dados.endereco.numero} -{' '}
                  {pedido.dados.endereco.bairro}
                  {pedido.dados.endereco.referencia && (
                    <> ({pedido.dados.endereco.referencia})</>
                  )}
                </p>
              )}

            <p>
              Modalidade: {modoPedidoLabel}
            </p>

            <p>
              Pagamento: {formaPagamentoLabel}
            </p>

            {pedido.dados.trocoPara && (
              <p>
                Troco para: {pedido.dados.trocoPara}
              </p>
            )}

          </div>
        </div>

        {/* NOVO PEDIDO */}
        <Button
          variant="outline"
          className="border-border mt-auto"
          onClick={onNovoPedido}
        >
          Fazer novo pedido
        </Button>

      </div>
    </div>
  );
}