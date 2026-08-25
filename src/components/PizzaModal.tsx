import { useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { PIZZAS_TRADICIONAIS, PIZZAS_ESPECIAIS, formatBRL } from '@/data/menu';
import { TAMANHOS_PIZZA } from '@/types';
import type { PizzaSabor, TamanhoPizza, ItemCarrinho } from '@/types';
import { Pizza, ChevronRight, ChevronLeft, Check, Split } from 'lucide-react';

interface Props {
  sabor: PizzaSabor | null;
  onClose: () => void;
  onAdd: (item: ItemCarrinho) => void;
}

type Etapa = 'tamanho' | 'sabor' | 'observacao';

export default function PizzaModal({ sabor, onClose, onAdd }: Props) {
  const [etapa, setEtapa] = useState<Etapa>('tamanho');
  const [tamanho, setTamanho] = useState<TamanhoPizza | null>(null);
  const [meioAMeio, setMeioAMeio] = useState(false);
  const [saboresEscolhidos, setSaboresEscolhidos] = useState<PizzaSabor[]>([]);
  const [observacao, setObservacao] = useState('');

  const lista = sabor?.categoria === 'especial' ? PIZZAS_ESPECIAIS : PIZZAS_TRADICIONAIS;

  const reset = () => {
    setEtapa('tamanho');
    setTamanho(null);
    setMeioAMeio(false);
    setSaboresEscolhidos([]);
    setObservacao('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  useMemo(() => {
    if (sabor) setSaboresEscolhidos([sabor]);
  }, [sabor]);

  if (!sabor) return null;

  const precoAtual = tamanho
    ? Math.max(...saboresEscolhidos.map((s) => s.precos[tamanho]))
    : 0;

  const toggleSaborSecundario = (s: PizzaSabor) => {
    if (saboresEscolhidos.some((x) => x.id === s.id)) {
      if (saboresEscolhidos.length > 1) {
        setSaboresEscolhidos(saboresEscolhidos.filter((x) => x.id !== s.id));
      }
    } else if (saboresEscolhidos.length < 2) {
      setSaboresEscolhidos([...saboresEscolhidos, s]);
    } else {
      setSaboresEscolhidos([saboresEscolhidos[0], s]);
    }
  };

  const confirmarAdicionar = () => {
    if (!tamanho) return;
    const tamanhoLabel = TAMANHOS_PIZZA.find((t) => t.id === tamanho)?.label ?? tamanho;
    const nomeExibicao =
      saboresEscolhidos.length === 2
        ? `Pizza ${tamanhoLabel} — Meio a meio: ${saboresEscolhidos[0].nome} / ${saboresEscolhidos[1].nome}`
        : `Pizza ${tamanhoLabel} — ${saboresEscolhidos[0].nome}`;
    const detalhesTexto = saboresEscolhidos.map((s) => s.nome).join(' / ');

    onAdd({
      uid: crypto.randomUUID(),
      tipo: 'pizza',
      nomeExibicao,
      detalhesTexto,
      detalhes: { tamanho, saborIds: saboresEscolhidos.map((s) => s.id) },
      precoUnitario: precoAtual,
      quantidade: 1,
      observacao: observacao.trim() || undefined,
    });
    handleClose();
  };

  return (
    <Dialog open={!!sabor} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="bg-card border-border text-foreground max-w-md max-h-[85vh] overflow-hidden flex flex-col p-0 gap-0">
        <DialogHeader className="p-5 pb-3 border-b border-border">
          <div className="flex items-center gap-2 text-primary">
            <Pizza className="w-5 h-5" />
            <span className="text-xs uppercase tracking-widest font-semibold">
              {sabor.categoria === 'especial' ? 'Pizza Especial' : 'Pizza Tradicional'}
            </span>
          </div>
          <DialogTitle className="font-display text-2xl tracking-wide">{sabor.nome}</DialogTitle>
          {/* Steps indicator */}
          <div className="flex items-center gap-1.5 pt-2">
            {(['tamanho', 'sabor', 'observacao'] as Etapa[]).map((e, i) => (
              <div
                key={e}
                className={`h-1 rounded-full flex-1 transition-colors ${
                  ['tamanho', 'sabor', 'observacao'].indexOf(etapa) >= i ? 'bg-primary' : 'bg-secondary'
                }`}
              />
            ))}
          </div>
        </DialogHeader>

        <div className="overflow-y-auto scrollbar-none p-5 flex-1">
          {etapa === 'tamanho' && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground mb-3">Escolha o tamanho da pizza</p>
              {TAMANHOS_PIZZA.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTamanho(t.id)}
                  className={`w-full flex items-center justify-between rounded-lg border px-4 py-3 transition-all ${
                    tamanho === t.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-secondary/40 hover:border-primary/50'
                  }`}
                >
                  <div className="text-left">
                    <div className="font-semibold">{t.label}</div>
                    <div className="text-xs text-muted-foreground">{t.fatias}</div>
                  </div>
                  <div className="font-display text-primary text-lg">
                    {formatBRL(sabor.precos[t.id])}
                  </div>
                </button>
              ))}
            </div>
          )}

          {etapa === 'sabor' && tamanho && (
            <div>
              <button
                onClick={() => setMeioAMeio(!meioAMeio)}
                className={`w-full flex items-center gap-2 rounded-lg border px-4 py-3 mb-4 transition-all ${
                  meioAMeio ? 'border-primary bg-primary/10' : 'border-border bg-secondary/40'
                }`}
              >
                <Split className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium flex-1 text-left">Meio a meio (2 sabores)</span>
                <div
                  className={`w-9 h-5 rounded-full relative transition-colors ${
                    meioAMeio ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                      meioAMeio ? 'translate-x-4' : 'translate-x-0.5'
                    }`}
                  />
                </div>
              </button>

              {meioAMeio && (
                <p className="text-xs text-muted-foreground mb-3">
                  Selecionado{saboresEscolhidos.length === 1 ? '' : 's'}: {saboresEscolhidos.map((s) => s.nome).join(' + ') || 'nenhum'}
                  {' '}(o valor considera o sabor de maior preço)
                </p>
              )}

              <div className="space-y-2">
                {lista.map((s) => {
                  const selecionado = saboresEscolhidos.some((x) => x.id === s.id);
                  return (
                    <button
                      key={s.id}
                      onClick={() => (meioAMeio ? toggleSaborSecundario(s) : setSaboresEscolhidos([s]))}
                      className={`w-full text-left rounded-lg border px-4 py-3 transition-all ${
                        selecionado ? 'border-primary bg-primary/10' : 'border-border bg-secondary/40 hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{s.nome}</span>
                        {selecionado && <Check className="w-4 h-4 text-primary shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{s.descricao}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {etapa === 'observacao' && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Alguma observação para o preparo? (opcional)
              </p>
              <Textarea
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                placeholder="Ex: sem cebola, borda menos recheada..."
                className="bg-secondary/40 border-border min-h-[90px]"
              />
              <div className="rounded-lg border border-border bg-secondary/40 p-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Pizza</span>
                  <span className="font-medium">
                    {TAMANHOS_PIZZA.find((t) => t.id === tamanho)?.label}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Sabor{saboresEscolhidos.length > 1 ? 'es' : ''}</span>
                  <span className="font-medium text-right">{saboresEscolhidos.map((s) => s.nome).join(' / ')}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-sm">Total</span>
                  <span className="font-display text-xl text-primary">{formatBRL(precoAtual)}</span>
                </div>
              </div>
              {sabor.categoria === 'tradicional' && (
                <Badge variant="outline" className="border-primary/40 text-primary/90 text-[11px] font-normal">
                  Todas as pizzas são feitas com bordas recheadas
                </Badge>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="p-4 border-t border-border flex-row gap-2">
          {etapa !== 'tamanho' && (
            <Button
              variant="outline"
              className="border-border"
              onClick={() => setEtapa(etapa === 'observacao' ? 'sabor' : 'tamanho')}
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Voltar
            </Button>
          )}
          {etapa === 'tamanho' && (
            <Button disabled={!tamanho} className="flex-1 bg-gold-gradient text-primary-foreground font-semibold" onClick={() => setEtapa('sabor')}>
              Continuar <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
          {etapa === 'sabor' && (
            <Button
              disabled={meioAMeio && saboresEscolhidos.length < 2}
              className="flex-1 bg-gold-gradient text-primary-foreground font-semibold"
              onClick={() => setEtapa('observacao')}
            >
              Continuar <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
          {etapa === 'observacao' && (
            <Button className="flex-1 bg-gold-gradient text-primary-foreground font-semibold" onClick={confirmarAdicionar}>
              Adicionar ao carrinho — {formatBRL(precoAtual)}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
