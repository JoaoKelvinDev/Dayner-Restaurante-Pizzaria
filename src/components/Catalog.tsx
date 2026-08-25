import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { PIZZAS_TRADICIONAIS, PIZZAS_ESPECIAIS, HAMBURGUERES, PRODUTOS_EXTRAS, formatBRL } from '@/data/menu';
import type { PizzaSabor, Burguer, ModoPedido, ItemCarrinho } from '@/types';
import { Plus, ShoppingBag, UtensilsCrossed, Bike, ArrowLeft } from 'lucide-react';

interface Props {
  modo: ModoPedido;
  onTrocarModo: () => void;
  onSelecionarPizza: (p: PizzaSabor) => void;
  onSelecionarBurguer: (b: Burguer) => void;
  onAdicionarExtra: (item: ItemCarrinho) => void;
}

const MODO_INFO: Record<ModoPedido, { label: string; icon: React.ReactNode }> = {
  comer_la: { label: 'Comer lá', icon: <UtensilsCrossed className="w-3.5 h-3.5" /> },
  retirada: { label: 'Retirada no balcão', icon: <ShoppingBag className="w-3.5 h-3.5" /> },
  delivery: { label: 'Delivery', icon: <Bike className="w-3.5 h-3.5" /> },
};

export default function Catalog({ modo, onTrocarModo, onSelecionarPizza, onSelecionarBurguer, onAdicionarExtra }: Props) {
  const [tab, setTab] = useState('tradicionais');

  return (
    <div className="pb-28">
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <button onClick={onTrocarModo} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            trocar modo
          </button>
          <Badge variant="outline" className="border-primary/40 text-primary gap-1.5 font-normal">
            {MODO_INFO[modo].icon}
            {MODO_INFO[modo].label}
          </Badge>
        </div>
        <div className="px-4 pb-3 flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-gold-gradient flex items-center justify-center shrink-0">
            <img src="img/logo.jpeg" alt="Logo Dayner" className="w-9 h-9 rounded-full object-cover" />
          </div>
          <div>
            <h1 className="font-display text-xl tracking-wide leading-none">Dayner</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">Restaurante &amp; Pizzaria</p>
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full grid grid-cols-4 bg-transparent px-4 pb-2 h-auto gap-2">
            <TabsTrigger
              value="tradicionais"
              className="data-[state=active]:bg-gold-gradient data-[state=active]:text-[#0D0D0D] data-[state=active]:font-semibold rounded-full border border-border py-2 text-xs"
            >
              Pizzas Trad.
            </TabsTrigger>
            <TabsTrigger
              value="especiais"
              className="data-[state=active]:bg-gold-gradient data-[state=active]:text-[#0D0D0D] data-[state=active]:font-semibold rounded-full border border-border py-2 text-xs"
            >
              Pizzas Esp.
            </TabsTrigger>
            <TabsTrigger
              value="burgueres"
              className="data-[state=active]:bg-gold-gradient data-[state=active]:text-[#0D0D0D] data-[state=active]:font-semibold rounded-full border border-border py-2 text-xs"
            >
              Hambúrgueres
            </TabsTrigger>
            <TabsTrigger
              value="salgados"
              className="data-[state=active]:bg-gold-gradient data-[state=active]:text-[#0D0D0D] data-[state=active]:font-semibold rounded-full border border-border py-2 text-xs"
            >
              Salgados e Bolos
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </header>

      <main className="px-4 pt-4">
        {tab === 'tradicionais' && (
          <SecaoPizzas titulo="Pizzas Tradicionais" faixa="a partir de R$ 18,00" lista={PIZZAS_TRADICIONAIS} onSelecionar={onSelecionarPizza} />
        )}
        {tab === 'especiais' && (
          <SecaoPizzas titulo="Pizzas Especiais" faixa="a partir de R$ 21,00" lista={PIZZAS_ESPECIAIS} onSelecionar={onSelecionarPizza} />
        )}
        {tab === 'burgueres' && <SecaoBurgueres onSelecionar={onSelecionarBurguer} />}
        {tab === 'salgados' && <SecaoExtras onAdicionar={onAdicionarExtra} />}
      </main>
    </div>
  );
}

function SecaoPizzas({
  titulo,
  faixa,
  lista,
  onSelecionar,
}: {
  titulo: string;
  faixa: string;
  lista: PizzaSabor[];
  onSelecionar: (p: PizzaSabor) => void;
}) {
  return (
    <div>
      <div className="mb-3">
        <h2 className="font-display text-lg tracking-wide text-gold-gradient uppercase">{titulo}</h2>
        <p className="text-[11px] text-muted-foreground">{faixa} · bordas recheadas inclusas</p>
      </div>
      <div className="grid gap-3">
        {lista.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelecionar(p)}
            className="w-full text-left rounded-xl border border-border bg-card hover:border-primary/50 transition-all p-4 flex items-start gap-3"
          >
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold leading-tight">{p.nome}</h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.descricao}</p>
              <p className="text-xs text-primary mt-2">a partir de {formatBRL(p.precos.mini)}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gold-gradient flex items-center justify-center shrink-0 mt-0.5">
              <Plus className="w-5 h-5 text-[#0D0D0D]" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function SecaoBurgueres({ onSelecionar }: { onSelecionar: (b: Burguer) => void }) {
  return (
    <div>
      <div className="mb-3">
        <h2 className="font-display text-lg tracking-wide text-gold-gradient uppercase">Hambúrgueres</h2>
        <p className="text-[11px] text-muted-foreground">escolha o tipo de carne e monte do seu jeito</p>
      </div>
      <div className="grid gap-3">
        {HAMBURGUERES.map((b) => {
          const menorPreco = Math.min(...Object.values(b.precos).filter((v): v is number => v !== undefined));
          return (
            <button
              key={b.id}
              onClick={() => onSelecionar(b)}
              className="w-full text-left rounded-xl border border-border bg-card hover:border-primary/50 transition-all p-4 flex items-start gap-3"
            >
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold leading-tight">{b.nome}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{b.descricao}</p>
                <p className="text-xs text-primary mt-2">a partir de {formatBRL(menorPreco)}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-gold-gradient flex items-center justify-center shrink-0 mt-0.5">
                <Plus className="w-5 h-5 text-[#0D0D0D]" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SecaoExtras({ onAdicionar }: { onAdicionar: (item: ItemCarrinho) => void }) {
  return (
    <div className="space-y-6">
      {PRODUTOS_EXTRAS.map((categoria) => (
        <section key={categoria.titulo}>
          <h2 className="font-display text-lg tracking-wide text-gold-gradient uppercase mb-3">
            {categoria.titulo}
          </h2>
          <div className="grid gap-3">
            {categoria.itens.map((item) => (
              <button
                key={item.id}
                onClick={() =>
                  onAdicionar({
                    uid: crypto.randomUUID(),
                    tipo: 'extra',
                    nomeExibicao: item.nome,
                    detalhesTexto: categoria.titulo,
                    precoUnitario: item.preco,
                    quantidade: 1,
                  })
                }
                className="w-full text-left rounded-xl border border-border bg-card hover:border-primary/50 transition-all p-4 flex items-center gap-3"
              >
                <div className="flex-1 font-semibold">{item.nome}</div>
                <span className="font-display text-primary">{formatBRL(item.preco)}</span>
                <div className="w-9 h-9 rounded-full bg-gold-gradient flex items-center justify-center shrink-0">
                  <Plus className="w-5 h-5 text-[#0D0D0D]" />
                </div>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
