import { useState } from 'react';
import ModeSelect from '@/components/ModeSelect';
import Catalog from '@/components/Catalog';
import PizzaModal from '@/components/PizzaModal';
import BurgerModal from '@/components/BurgerModal';
import CartBar from '@/components/CartBar';
import CartSheet from '@/components/CartSheet';
import CheckoutSheet from '@/components/CheckoutSheet';
import OrderTracking from '@/components/OrderTracking';
import type { ModoPedido, PizzaSabor, Burguer, ItemCarrinho, Pedido, DadosCheckout } from '@/types';

function App() {
  const [modo, setModo] = useState<ModoPedido | null>(null);
  const [itens, setItens] = useState<ItemCarrinho[]>([]);
  const [pizzaSelecionada, setPizzaSelecionada] = useState<PizzaSabor | null>(null);
  const [burguerSelecionado, setBurguerSelecionado] = useState<Burguer | null>(null);
  const [cartAberto, setCartAberto] = useState(false);
  const [checkoutAberto, setCheckoutAberto] = useState(false);
  const [pedidoFinalizado, setPedidoFinalizado] = useState<Pedido | null>(null);

  const adicionarItem = (item: ItemCarrinho) => setItens((prev) => [...prev, item]);

  const alterarQtd = (uid: string, delta: number) => {
    setItens((prev) =>
      prev
        .map((i) => (i.uid === uid ? { ...i, quantidade: Math.max(1, i.quantidade + delta) } : i))
        .filter((i) => i.quantidade > 0)
    );
  };

  const removerItem = (uid: string) => setItens((prev) => prev.filter((i) => i.uid !== uid));

  const confirmarPedido = (dados: DadosCheckout, pagamentoJaConfirmado: boolean) => {
    const total = itens.reduce((s, i) => s + i.precoUnitario * i.quantidade, 0);
    const pedido: Pedido = {
      id: Math.floor(1000 + Math.random() * 9000).toString(),
      modo: modo!,
      itens,
      valorTotal: total,
      dados,
      statusPagamento: dados.formaPagamento === 'pix' ? (pagamentoJaConfirmado ? 'pago' : 'pendente') : 'na_entrega',
      statusPedido: 'recebido',
      createdAt: Date.now(),
    };
    setPedidoFinalizado(pedido);
    setItens([]);
  };

  const novoPedido = () => {
    setPedidoFinalizado(null);
    setModo(null);
  };

  if (pedidoFinalizado) {
    return <OrderTracking pedido={pedidoFinalizado} onNovoPedido={novoPedido} />;
  }

  if (!modo) {
    return <ModeSelect onSelect={setModo} />;
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

      <PizzaModal sabor={pizzaSelecionada} onClose={() => setPizzaSelecionada(null)} onAdd={adicionarItem} />
      <BurgerModal burguer={burguerSelecionado} onClose={() => setBurguerSelecionado(null)} onAdd={adicionarItem} />

      <CartBar itens={itens} onOpen={() => setCartAberto(true)} />

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
