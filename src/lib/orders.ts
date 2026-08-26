import type { Pedido } from '@/types';

const ACTIVE_ORDER_STORAGE_KEY = 'dayner:pedido-ativo';

/**
 * Persiste somente o pedido que o cliente está acompanhando neste navegador.
 * Esta camada é temporária, até o pedido passar a ser salvo no Supabase.
 */
export function carregarPedidoAtivo(): Pedido | null {
  if (typeof window === 'undefined') return null;

  try {
    const valor = window.localStorage.getItem(ACTIVE_ORDER_STORAGE_KEY);
    return valor ? (JSON.parse(valor) as Pedido) : null;
  } catch {
    window.localStorage.removeItem(ACTIVE_ORDER_STORAGE_KEY);
    return null;
  }
}

export function salvarPedidoAtivo(pedido: Pedido): void {
  window.localStorage.setItem(ACTIVE_ORDER_STORAGE_KEY, JSON.stringify(pedido));
}

export function limparPedidoAtivo(): void {
  window.localStorage.removeItem(ACTIVE_ORDER_STORAGE_KEY);
}
