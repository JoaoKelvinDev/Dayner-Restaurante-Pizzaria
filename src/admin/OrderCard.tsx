import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatBRL } from '@/data/menu';
import type { Pedido, StatusPedido } from '@/types';

interface Props {
  pedido: Pedido;
  onAvancarStatus: (id: string, status: StatusPedido) => Promise<void>;
  onMarcarPago: (id: string) => Promise<void>;
  onDefinirTempo: (id: string, minutos: number) => Promise<void>;
}

const FLUXO_STATUS: StatusPedido[] = [
  'recebido',
  'em_preparo',
  'pronto',
  'saiu_entrega',
  'finalizado',
];

const LABEL_STATUS: Record<StatusPedido, string> = {
  recebido: 'Recebido',
  em_preparo: 'Em preparo',
  pronto: 'Pronto',
  saiu_entrega: 'Saiu p/ entrega',
  finalizado: 'Finalizado',
};

const LABEL_MODO: Record<Pedido['modo'], string> = {
  comer_la: 'Comer no local',
  retirada: 'Retirada',
  delivery: 'Delivery',
};

const LABEL_PAGAMENTO: Record<Pedido['dados']['formaPagamento'], string> = {
  pix: 'Pix',
  cartao: 'Cartão',
  dinheiro: 'Dinheiro',
};

export default function OrderCard({
  pedido,
  onAvancarStatus,
  onMarcarPago,
  onDefinirTempo,
}: Props) {
  const [processando, setProcessando] = useState(false);
  const [tempo, setTempo] = useState('');

  /*
   * Comer no local não tem etapa de "saiu para
   * entrega" — pula direto de pronto pra
   * finalizado.
   */
  const fluxo =
    pedido.modo === 'delivery'
      ? FLUXO_STATUS
      : FLUXO_STATUS.filter((s) => s !== 'saiu_entrega');

  const indiceAtual = fluxo.indexOf(pedido.statusPedido);
  const proximoStatus = fluxo[indiceAtual + 1];

  const avancar = async () => {
    if (!proximoStatus) return;
    setProcessando(true);
    try {
      await onAvancarStatus(pedido.id, proximoStatus);
    } finally {
      setProcessando(false);
    }
  };

  const marcarPago = async () => {
    setProcessando(true);
    try {
      await onMarcarPago(pedido.id);
    } finally {
      setProcessando(false);
    }
  };

  const salvarTempo = async () => {
    const minutos = Number(tempo);
    if (!Number.isFinite(minutos) || minutos <= 0) return;

    setProcessando(true);
    try {
      await onDefinirTempo(pedido.id, minutos);
      setTempo('');
    } finally {
      setProcessando(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      {/* CABEÇALHO */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-display text-lg text-primary">
              #{pedido.numeroPedido}
            </span>
            <Badge variant="secondary">{LABEL_MODO[pedido.modo]}</Badge>
          </div>
          <p className="text-sm font-medium mt-0.5">
            {pedido.dados.nomeCliente}
          </p>
          <p className="text-xs text-muted-foreground">
            {pedido.dados.telefoneCliente}
          </p>
        </div>

        <div className="text-right">
          <p className="font-display text-lg text-gold-gradient">
            {formatBRL(pedido.valorTotal)}
          </p>
          <Badge
            variant={
              pedido.statusPagamento === 'pago' ? 'default' : 'outline'
            }
          >
            {LABEL_PAGAMENTO[pedido.dados.formaPagamento]} ·{' '}
            {pedido.statusPagamento === 'pago' ? 'Pago' : 'Pendente'}
          </Badge>
        </div>
      </div>

      {/* ENDEREÇO */}
      {pedido.dados.endereco && (
        <p className="text-xs text-muted-foreground">
          {pedido.dados.endereco.rua}, {pedido.dados.endereco.numero} —{' '}
          {pedido.dados.endereco.bairro}
          {pedido.dados.endereco.referencia &&
            ` (${pedido.dados.endereco.referencia})`}
        </p>
      )}

      {/* ITENS */}
      <div className="border-t border-border pt-2 space-y-1.5">
        {pedido.itens.map((item) => (
          <div key={item.uid} className="text-sm">
            <div className="flex justify-between">
              <span>
                {item.quantidade}x {item.nomeExibicao}
              </span>
              <span className="text-muted-foreground">
                {formatBRL(item.precoUnitario * item.quantidade)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {item.detalhesTexto}
            </p>
            {item.observacao && (
              <p className="text-xs text-primary/80">
                Obs: {item.observacao}
              </p>
            )}
          </div>
        ))}
      </div>

      {pedido.dados.trocoPara !== undefined && (
        <p className="text-xs text-muted-foreground">
          Troco para {formatBRL(pedido.dados.trocoPara)}
        </p>
      )}

      {/* AÇÕES */}
      <div className="border-t border-border pt-3 flex flex-wrap items-center gap-2">
        <Badge variant="outline">{LABEL_STATUS[pedido.statusPedido]}</Badge>

        {proximoStatus && (
          <Button
            size="sm"
            disabled={processando}
            onClick={avancar}
            className="bg-gold-gradient text-primary-foreground font-semibold"
          >
            Marcar como {LABEL_STATUS[proximoStatus]}
          </Button>
        )}

        {pedido.statusPagamento === 'pendente' && (
          <Button
            size="sm"
            variant="outline"
            disabled={processando}
            onClick={marcarPago}
          >
            Marcar como pago
          </Button>
        )}

        {!pedido.tempoEstimadoMinutos &&
          pedido.statusPedido !== 'finalizado' && (
            <div className="flex items-center gap-1.5">
              <Input
                value={tempo}
                onChange={(e) => setTempo(e.target.value)}
                inputMode="numeric"
                placeholder="min"
                className="h-8 w-16 bg-secondary/40 border-border text-xs"
              />
              <Button
                size="sm"
                variant="outline"
                disabled={processando}
                onClick={salvarTempo}
              >
                Definir tempo
              </Button>
            </div>
          )}

        {pedido.tempoEstimadoMinutos && (
          <span className="text-xs text-muted-foreground">
            ~{pedido.tempoEstimadoMinutos} min
          </span>
        )}
      </div>
    </div>
  );
}
