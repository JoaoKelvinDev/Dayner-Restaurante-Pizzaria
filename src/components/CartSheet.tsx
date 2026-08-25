import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { formatBRL } from '@/data/menu';
import type { ItemCarrinho } from '@/types';
import { Minus, Plus, Trash2, Pizza, Beef, Cookie } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  itens: ItemCarrinho[];
  onAlterarQtd: (uid: string, delta: number) => void;
  onRemover: (uid: string) => void;
  onIrParaCheckout: () => void;
}

export default function CartSheet({ open, onOpenChange, itens, onAlterarQtd, onRemover, onIrParaCheckout }: Props) {
  const total = itens.reduce((s, i) => s + i.precoUnitario * i.quantidade, 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="bg-card border-border text-foreground max-h-[85vh] flex flex-col rounded-t-2xl p-0">
        <SheetHeader className="p-5 pb-3 border-b border-border">
          <SheetTitle className="font-display text-2xl tracking-wide text-left">Seu carrinho</SheetTitle>
        </SheetHeader>

        <div className="overflow-y-auto scrollbar-none flex-1 p-5 space-y-3">
          {itens.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-10">Seu carrinho está vazio.</p>
          )}
          {itens.map((item) => (
            <div key={item.uid} className="flex gap-3 rounded-lg border border-border bg-secondary/40 p-3">
              <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center shrink-0 text-primary">
                {item.tipo === 'pizza' ? <Pizza className="w-4 h-4" /> : item.tipo === 'burguer' ? <Beef className="w-4 h-4" /> : <Cookie className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-sm leading-tight">{item.nomeExibicao}</h4>
                  <button onClick={() => onRemover(item.uid)} className="text-muted-foreground hover:text-destructive shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{item.detalhesTexto}</p>
                {item.observacao && (
                  <p className="text-xs text-muted-foreground italic mt-0.5">Obs: {item.observacao}</p>
                )}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onAlterarQtd(item.uid, -1)}
                      className="w-6 h-6 rounded-full border border-border flex items-center justify-center hover:border-primary"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm w-4 text-center">{item.quantidade}</span>
                    <button
                      onClick={() => onAlterarQtd(item.uid, 1)}
                      className="w-6 h-6 rounded-full border border-border flex items-center justify-center hover:border-primary"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="font-display text-primary">
                    {formatBRL(item.precoUnitario * item.quantidade)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {itens.length > 0 && (
          <SheetFooter className="p-5 border-t border-border flex-col gap-3 sm:flex-col">
            <div className="w-full flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Total</span>
              <span className="font-display text-2xl text-primary">{formatBRL(total)}</span>
            </div>
            <Button
              className="w-full bg-gold-gradient text-primary-foreground font-semibold h-12"
              onClick={onIrParaCheckout}
            >
              Continuar para o checkout
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
