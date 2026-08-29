import type { ItemCarrinho, Pedido } from '@/types';
import { supabase } from '@/lib/supabase';

const ACTIVE_ORDER_STORAGE_KEY = 'dayner:pedido-ativo';

interface ReferenciaPedido {
  id: string;
  tokenAcompanhamento: string;
}

interface PedidoBanco {
  id: string;
  order_number: number;
  tracking_token: string;
  mode: Pedido['modo'];
  customer_name: string;
  customer_phone: string;
  delivery_address: Pedido['dados']['endereco'] | null;
  payment_method: Pedido['dados']['formaPagamento'];
  cash_change_for: number | string | null;
  payment_status: Pedido['statusPagamento'];
  order_status: Pedido['statusPedido'];
  status_message: string | null;
  subtotal: number | string;
  delivery_fee: number | string;
  total: number | string;
  estimated_minutes: number | null;
  created_at: string;
  items: Array<{
    id: string;
    item_type: ItemCarrinho['tipo'];
    display_name: string;
    details_text: string;
    unit_price: number | string;
    quantity: number;
    note: string | null;
    details: ItemCarrinho['detalhes'];
  }>;
}

function salvarReferencia(referencia: ReferenciaPedido): void {
  window.localStorage.setItem(ACTIVE_ORDER_STORAGE_KEY, JSON.stringify(referencia));
}

function limparReferencia(): void {
  window.localStorage.removeItem(ACTIVE_ORDER_STORAGE_KEY);
}

function converterPedido(registro: PedidoBanco): Pedido {
  return {
    id: registro.id,
    numeroPedido: registro.order_number,
    tokenAcompanhamento: registro.tracking_token,
    modo: registro.mode,
    itens: registro.items.map((item) => ({
      uid: item.id,
      tipo: item.item_type,
      nomeExibicao: item.display_name,
      detalhesTexto: item.details_text,
      detalhes: item.details,
      precoUnitario: Number(item.unit_price),
      quantidade: item.quantity,
      observacao: item.note ?? undefined,
    })),
    subtotal: Number(registro.subtotal),
    taxaEntrega: Number(registro.delivery_fee),
    valorTotal: Number(registro.total),
    dados: {
      nomeCliente: registro.customer_name,
      telefoneCliente: registro.customer_phone,
      endereco: registro.delivery_address ?? undefined,
      formaPagamento: registro.payment_method,
      trocoPara: registro.cash_change_for ? Number(registro.cash_change_for) : undefined,
    },
    statusPagamento: registro.payment_status,
    statusPedido: registro.order_status,
    mensagemStatus: registro.status_message ?? undefined,
    tempoEstimadoMinutos: registro.estimated_minutes ?? undefined,
    createdAt: new Date(registro.created_at).getTime(),
  };
}

async function buscarPedido(referencia: ReferenciaPedido): Promise<Pedido | null> {
  const { data, error } = await supabase.rpc('get_customer_order', {
    p_order_id: referencia.id,
    p_tracking_token: referencia.tokenAcompanhamento,
  });

  if (error) throw error;
  return data ? converterPedido(data as PedidoBanco) : null;
}

export async function criarPedido(pedido: Pedido): Promise<Pedido> {
  const { data, error } = await supabase.rpc('create_customer_order', {
    p_order: {
      mode: pedido.modo,
      customer_name: pedido.dados.nomeCliente,
      customer_phone: pedido.dados.telefoneCliente,
      delivery_address: pedido.dados.endereco ?? null,
      payment_method: pedido.dados.formaPagamento,
      cash_change_for: pedido.dados.trocoPara ?? null,
      delivery_fee: pedido.taxaEntrega,
    },
    p_items: pedido.itens.map((item) => ({
      item_type: item.tipo,
      display_name: item.nomeExibicao,
      details_text: item.detalhesTexto,
      unit_price: item.precoUnitario,
      quantity: item.quantidade,
      note: item.observacao ?? null,
      details: item.detalhes ?? null,
    })),
  });

  if (error || !data) {
    throw error ?? new Error('Não foi possível criar o pedido.');
  }

  const resposta = data as { id: string; tracking_token: string };
  const referencia = {
    id: resposta.id,
    tokenAcompanhamento: resposta.tracking_token,
  };

  const pedidoCriado = await buscarPedido(referencia);
  if (!pedidoCriado) {
    throw new Error('Não foi possível carregar o pedido criado.');
  }

  salvarReferencia(referencia);
  return pedidoCriado;
}

export async function carregarPedidoAtivo(): Promise<Pedido | null> {
  const valor = window.localStorage.getItem(ACTIVE_ORDER_STORAGE_KEY);
  if (!valor) return null;

  try {
    const referencia = JSON.parse(valor) as ReferenciaPedido;
    const pedido = await buscarPedido(referencia);
    if (!pedido) limparReferencia();
    return pedido;
  } catch {
    limparReferencia();
    return null;
  }
}

export function limparPedidoAtivo(): void {
  limparReferencia();
}