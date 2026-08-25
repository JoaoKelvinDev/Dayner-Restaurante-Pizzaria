import { useState } from 'react';

import ModeSelect from '@/components/ModeSelect';
import Catalog from '@/components/Catalog';
import PizzaModal from '@/components/PizzaModal';
import BurgerModal from '@/components/BurgerModal';
import CartBar from '@/components/CartBar';
import CartSheet from '@/components/CartSheet';
import CheckoutSheet from '@/components/CheckoutSheet';
import OrderTracking from '@/components/OrderTracking';

import type {
  ModoPedido,
  PizzaSabor,
  Burguer,
  ItemCarrinho,
  Pedido,
  DadosCheckout,
} from '@/types';

function App() {
  const [modo, setModo] = useState<ModoPedido | null>(null);

  const [itens, setItens] = useState<ItemCarrinho[]>([]);

  const [pizzaSelecionada, setPizzaSelecionada] =
    useState<PizzaSabor | null>(null);

  const [burguerSelecionado, setBurguerSelecionado] =
    useState<Burguer | null>(null);

  const [cartAberto, setCartAberto] = useState(false);

  const [checkoutAberto, setCheckoutAberto] = useState(false);

  const [pedidoFinalizado, setPedidoFinalizado] =
    useState<Pedido | null>(null);

  const adicionarItem = (item: ItemCarrinho) => {
    setItens((prev) => [...prev, item]);
  };

  const alterarQtd = (uid: string, delta: number) => {
    setItens((prev) =>
      prev
        .map((item) =>
          item.uid === uid
            ? {
                ...item,
                quantidade: Math.max(
                  1,
                  item.quantidade + delta
                ),
              }
            : item
        )
        .filter((item) => item.quantidade > 0)
    );
  };

  const removerItem = (uid: string) => {
    setItens((prev) =>
      prev.filter((item) => item.uid !== uid)
    );
  };

  const confirmarPedido = (
    dados: DadosCheckout,
    pagamentoJaConfirmado: boolean
  ) => {
    if (!modo || itens.length === 0) {
      return;
    }

    const subtotal = itens.reduce(
      (total, item) =>
        total + item.precoUnitario * item.quantidade,
      0
    );

    /*
     * A taxa de entrega ainda será definida
     * juntamente com o restaurante.
     *
     * Por enquanto permanece 0.
     */
    const taxaEntrega = 0;

    const valorTotal = subtotal + taxaEntrega;

    const pedido: Pedido = {
      id: Math.floor(
        1000 + Math.random() * 9000
      ).toString(),

      modo,

      itens: [...itens],

      subtotal,

      taxaEntrega,

      valorTotal,

      dados,

      /*
       * PIX:
       * - confirmado -> pago
       * - não confirmado -> pendente
       *
       * Dinheiro e cartão:
       * - pagamento presencial
       * - pedido não fica bloqueado
       * - pagamento começa como pendente
       */
      statusPagamento:
        dados.formaPagamento === 'pix'
          ? pagamentoJaConfirmado
            ? 'pago'
            : 'pendente'
          : 'pendente',

      /*
       * Todo pedido que está apto a entrar
       * na operação começa como recebido.
       */
      statusPedido: 'recebido',

      /*
       * O tempo será definido posteriormente
       * pelo restaurante através do painel.
       */
      tempoEstimadoMinutos: undefined,

      createdAt: Date.now(),
    };

    setPedidoFinalizado(pedido);

    setItens([]);

    setCartAberto(false);
    setCheckoutAberto(false);
  };

  const novoPedido = () => {
    setPedidoFinalizado(null);
    setModo(null);

    setItens([]);

    setCartAberto(false);
    setCheckoutAberto(false);
  };

  /*
   * Quando existe um pedido finalizado,
   * mostramos a tela de acompanhamento.
   */
  if (pedidoFinalizado) {
    return (
      <OrderTracking
        pedido={pedidoFinalizado}
        onNovoPedido={novoPedido}
      />
    );
  }

  /*
   * Primeiro passo:
   * escolher a modalidade do pedido.
   */
  if (!modo) {
    return (
      <ModeSelect
        onSelect={setModo}
      />
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background">

      <Catalog
        modo={modo}
        onTrocarModo={() => setModo(null)}
        onSelecionarPizza={setPizzaSelecionada}
        onSelecionarBurguer={setBurguerSelecionado}
        onAdicionarExtra={adicionarItem}
      />

      <PizzaModal
        sabor={pizzaSelecionada}
        onClose={() =>
          setPizzaSelecionada(null)
        }
        onAdd={adicionarItem}
      />

      <BurgerModal
        burguer={burguerSelecionado}
        onClose={() =>
          setBurguerSelecionado(null)
        }
        onAdd={adicionarItem}
      />

      <CartBar
        itens={itens}
        onOpen={() =>
          setCartAberto(true)
        }
      />

      <CartSheet
        open={cartAberto}
        onOpenChange={setCartAberto}
        itens={itens}
        onAlterarQtd={alterarQtd}
        onRemover={removerItem}
        onIrParaCheckout={() => {
          setCartAberto(false);
          setCheckoutAberto(true);
        }}
      />

      <CheckoutSheet
        open={checkoutAberto}
        onOpenChange={setCheckoutAberto}
        modo={modo}
        itens={itens}
        onConfirmar={confirmarPedido}
      />

    </div>
  );
}

export default App;