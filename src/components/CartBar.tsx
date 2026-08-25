import { formatBRL } from '@/data/menu';
import type { ItemCarrinho } from '@/types';
import { ShoppingCart } from 'lucide-react';

interface Props {
  itens: ItemCarrinho[];
  onOpen: () => void;
}

export default function CartBar({ itens, onOpen }: Props) {
  const total = itens.reduce((s, i) => s + i.precoUnitario * i.quantidade, 0);
  const qtd = itens.reduce((s, i) => s + i.quantidade, 0);

  if (qtd === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 p-4 pointer-events-none">
      <button
        onClick={onOpen}
        className="pointer-events-auto w-full max-w-md mx-auto flex items-center justify-between rounded-xl bg-gold-gradient text-[#0D0D0D] px-5 py-4 shadow-[0_8px_30px_-6px_rgba(242,166,35,0.5)] font-semibold"
      >
        <div className="flex items-center gap-2">
          <div className="relative">
            <ShoppingCart className="w-5 h-5" />
            <span className="absolute -top-2 -right-2 bg-[#0D0D0D] text-primary text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
              {qtd}
            </span>
          </div>
          <span className="text-sm">Ver carrinho</span>
        </div>
        <span className="font-display tracking-wide">{formatBRL(total)}</span>
      </button>
    </div>
  );
}
