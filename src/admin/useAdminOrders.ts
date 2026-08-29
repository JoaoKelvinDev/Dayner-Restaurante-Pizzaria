import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type {
  Pedido,
  StatusPedido,
  StatusPagamento,
  ItemCarrinho,
} from '@/types';

/*
 * ==========================================
 * FORMATO CRU RETORNADO PELO SUPABASE
 * ==========================================
 *
 * Select direto na tabela (protegido por RLS
 * para usuários autenticados), diferente do
 * RPC usado pelo cliente final.
 */

interface LinhaItemPedido {
  id: string;
  item_type: ItemCarrinho['tipo'];
  display_name: string;
  details_text: string;
  unit_price: number | string;
  quantity: number;
  note: string | null;
  details: ItemCarrinho['detalhes'];
}

interface LinhaPedido {
  id: string;
  order_number: number;
  tracking_token: string;
  mode: Pedido['modo'];
  customer_name: string;
  customer_phone: string;
  delivery_address: Pedido['dados']['endereco'] | null;
  payment_method: Pedido['dados']['formaPagamento'];
  cash_change_for: number | string | null;
  payment_status: StatusPagamento;
  order_status: StatusPedido;
  status_message: string | null;
  subtotal: number | string;
  delivery_fee: number | string;
  total: number | string;
  estimated_minutes: number | null;
  created_at: string;
  order_items: LinhaItemPedido[];
}

function converterLinha(linha: LinhaPedido): Pedido {
  return {
    id: linha.id,
    numeroPedido: linha.order_number,
    tokenAcompanhamento: linha.tracking_token,
    modo: linha.mode,
    itens: (linha.order_items ?? []).map((item) => ({
      uid: item.id,
      tipo: item.item_type,
      nomeExibicao: item.display_name,
      detalhesTexto: item.details_text,
      detalhes: item.details,
      precoUnitario: Number(item.unit_price),
      quantidade: item.quantity,
      observacao: item.note ?? undefined,
    })),
    subtotal: Number(linha.subtotal),
    taxaEntrega: Number(linha.delivery_fee),
    valorTotal: Number(linha.total),
    dados: {
      nomeCliente: linha.customer_name,
      telefoneCliente: linha.customer_phone,
      endereco: linha.delivery_address ?? undefined,
      formaPagamento: linha.payment_method,
      trocoPara: linha.cash_change_for
        ? Number(linha.cash_change_for)
        : undefined,
    },
    statusPagamento: linha.payment_status,
    statusPedido: linha.order_status,
    mensagemStatus: linha.status_message ?? undefined,
    tempoEstimadoMinutos: linha.estimated_minutes ?? undefined,
    createdAt: new Date(linha.created_at).getTime(),
  };
}

export function useAdminOrders() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });

    if (error) {
      setErro(error.message);
      return;
    }

    setErro(null);
    setPedidos(
      (data as unknown as LinhaPedido[]).map(converterLinha)
    );
  }, []);

  useEffect(() => {
    carregar().finally(() => setCarregando(false));

    /*
     * Realtime: qualquer INSERT/UPDATE em orders
     * ou order_items recarrega a lista.
     *
     * Requer que a tabela esteja habilitada para
     * Realtime no painel do Supabase (Database >
     * Replication).
     */
    const canal = supabase
      .channel('admin-orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => carregar()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'order_items' },
        () => carregar()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [carregar]);

  const atualizarStatusPedido = async (
    id: string,
    status: StatusPedido
  ) => {
    const { error } = await supabase
      .from('orders')
      .update({ order_status: status })
      .eq('id', id);

    if (error) throw error;
  };

  const atualizarStatusPagamento = async (
    id: string,
    status: StatusPagamento
  ) => {
    const { error } = await supabase
      .from('orders')
      .update({ payment_status: status })
      .eq('id', id);

    if (error) throw error;
  };

  const definirTempoEstimado = async (
    id: string,
    minutos: number
  ) => {
    const { error } = await supabase
      .from('orders')
      .update({ estimated_minutes: minutos })
      .eq('id', id);

    if (error) throw error;
  };

  /*
   * mensagem null/vazia limpa o aviso (o cliente
   * deixa de ver a mensagem na tela dele).
   */
  const atualizarMensagemStatus = async (
    id: string,
    mensagem: string | null
  ) => {
    const { error } = await supabase
      .from('orders')
      .update({ status_message: mensagem?.trim() || null })
      .eq('id', id);

    if (error) throw error;
  };

  return {
    pedidos,
    carregando,
    erro,
    atualizarStatusPedido,
    atualizarStatusPagamento,
    definirTempoEstimado,
    atualizarMensagemStatus,
    recarregar: carregar,
  };
}