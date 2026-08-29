import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useAdminAuth } from '@/admin/useAdminAuth';
import { useAdminOrders } from '@/admin/useAdminOrders';
import OrderCard from '@/admin/OrderCard';
import type { StatusPedido } from '@/types';

const FILTROS: { id: StatusPedido | 'todos'; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'recebido', label: 'Recebidos' },
  { id: 'em_preparo', label: 'Em preparo' },
  { id: 'pronto', label: 'Prontos' },
  { id: 'saiu_entrega', label: 'Saiu p/ entrega' },
  { id: 'finalizado', label: 'Finalizados' },
];

export default function AdminDashboard() {
  const { sair } = useAdminAuth();
  const {
    pedidos,
    carregando,
    erro,
    atualizarStatusPedido,
    atualizarStatusPagamento,
    definirTempoEstimado,
  } = useAdminOrders();

  const [filtro, setFiltro] = useState<StatusPedido | 'todos'>('todos');

  const pedidosFiltrados = useMemo(() => {
    if (filtro === 'todos') {
      /*
       * Na visão "todos" escondemos os finalizados
       * pra não poluir o operacional do dia.
       */
      return pedidos.filter((p) => p.statusPedido !== 'finalizado');
    }
    return pedidos.filter((p) => p.statusPedido === filtro);
  }, [pedidos, filtro]);

  const handleAvancarStatus = async (id: string, status: StatusPedido) => {
    try {
      await atualizarStatusPedido(id, status);
    } catch {
      toast.error('Não foi possível atualizar o status do pedido.');
    }
  };

  const handleMarcarPago = async (id: string) => {
    try {
      await atualizarStatusPagamento(id, 'pago');
    } catch {
      toast.error('Não foi possível marcar o pagamento.');
    }
  };

  const handleDefinirTempo = async (id: string, minutos: number) => {
    try {
      await definirTempoEstimado(id, minutos);
    } catch {
      toast.error('Não foi possível definir o tempo estimado.');
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background">
      <header
        className="
          sticky top-0 z-10
          bg-background/95 backdrop-blur
          border-b border-border
          px-4 py-3
          flex items-center justify-between
        "
      >
        <h1 className="font-display text-xl text-gold-gradient">
          Painel Dayner
        </h1>
        <Button size="sm" variant="outline" onClick={sair}>
          Sair
        </Button>
      </header>

      <div className="px-4 py-3 flex gap-2 overflow-x-auto scrollbar-none border-b border-border">
        {FILTROS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFiltro(f.id)}
            className={`
              whitespace-nowrap
              rounded-full
              px-3.5 py-1.5
              text-xs
              font-medium
              border
              transition-colors
              ${
                filtro === f.id
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-secondary/40 text-muted-foreground'
              }
            `}
          >
            {f.label}
          </button>
        ))}
      </div>

      <main className="p-4 space-y-3 max-w-2xl mx-auto">
        {carregando && (
          <p className="text-sm text-muted-foreground text-center py-8">
            Carregando pedidos...
          </p>
        )}

        {erro && (
          <p className="text-sm text-destructive text-center py-8">
            Erro ao carregar pedidos: {erro}
          </p>
        )}

        {!carregando && !erro && pedidosFiltrados.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhum pedido nessa categoria.
          </p>
        )}

        {pedidosFiltrados.map((pedido) => (
          <OrderCard
            key={pedido.id}
            pedido={pedido}
            onAvancarStatus={handleAvancarStatus}
            onMarcarPago={handleMarcarPago}
            onDefinirTempo={handleDefinirTempo}
          />
        ))}
      </main>
    </div>
  );
}
