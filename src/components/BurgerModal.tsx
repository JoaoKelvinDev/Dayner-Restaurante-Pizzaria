import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ADICIONAIS, formatBRL } from '@/data/menu';
import { TIPOS_CARNE } from '@/types';
import type { Burguer, TipoCarne, ItemCarrinho } from '@/types';
import { Beef, ChevronRight, ChevronLeft, Check } from 'lucide-react';

interface Props {
  burguer: Burguer | null;
  onClose: () => void;
  onAdd: (item: ItemCarrinho) => void;
}

type Etapa = 'carne' | 'adicionais' | 'observacao';

export default function BurgerModal({ burguer, onClose, onAdd }: Props) {
  const [etapa, setEtapa] = useState<Etapa>('carne');
  const [tipoCarne, setTipoCarne] = useState<TipoCarne | null>(null);
  const [adicionaisIds, setAdicionaisIds] = useState<string[]>([]);
  const [observacao, setObservacao] = useState('');

  const reset = () => {
    setEtapa('carne');
    setTipoCarne(null);
    setAdicionaisIds([]);
    setObservacao('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!burguer) return null;

  const opcoesCarne = TIPOS_CARNE.filter((t) => burguer.precos[t.id] !== undefined);
  const precoBase = tipoCarne ? burguer.precos[tipoCarne] ?? 0 : 0;
  const precoAdicionais = adicionaisIds.reduce(
    (sum, id) => sum + (ADICIONAIS.find((a) => a.id === id)?.preco ?? 0),
    0
  );
  const precoTotal = precoBase + precoAdicionais;

  const toggleAdicional = (id: string) => {
    setAdicionaisIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const confirmarAdicionar = () => {
    if (!tipoCarne) return;
    const carneLabel = TIPOS_CARNE.find((t) => t.id === tipoCarne);
    const nomesAdicionais = adicionaisIds
      .map((id) => ADICIONAIS.find((a) => a.id === id)?.nome)
      .filter(Boolean);
    const detalhesTexto = [
      `${carneLabel?.label} ${carneLabel?.sub}`,
      nomesAdicionais.length ? `+ ${nomesAdicionais.join(', ')}` : '',
    ]
      .filter(Boolean)
      .join(' ');

    onAdd({
      uid: crypto.randomUUID(),
      tipo: 'burguer',
      nomeExibicao: burguer.nome,
      detalhesTexto,
      detalhes: { tipoCarne, adicionaisIds },
      precoUnitario: precoTotal,
      quantidade: 1,
      observacao: observacao.trim() || undefined,
    });
    handleClose();
  };

  return (
    <Dialog open={!!burguer} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="bg-card border-border text-foreground max-w-md max-h-[85vh] overflow-hidden flex flex-col p-0 gap-0">
        <DialogHeader className="p-5 pb-3 border-b border-border">
          <div className="flex items-center gap-2 text-primary">
            <Beef className="w-5 h-5" />
            <span className="text-xs uppercase tracking-widest font-semibold">Hambúrguer</span>
          </div>
          <DialogTitle className="font-display text-2xl tracking-wide">{burguer.nome}</DialogTitle>
          <p className="text-xs text-muted-foreground">{burguer.descricao}</p>
          <div className="flex items-center gap-1.5 pt-2">
            {(['carne', 'adicionais', 'observacao'] as Etapa[]).map((e, i) => (
              <div
                key={e}
                className={`h-1 rounded-full flex-1 transition-colors ${
                  ['carne', 'adicionais', 'observacao'].indexOf(etapa) >= i ? 'bg-primary' : 'bg-secondary'
                }`}
              />
            ))}
          </div>
        </DialogHeader>

        <div className="overflow-y-auto scrollbar-none p-5 flex-1">
          {etapa === 'carne' && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground mb-3">Escolha o tipo de carne</p>
              {opcoesCarne.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTipoCarne(t.id)}
                  className={`w-full flex items-center justify-between rounded-lg border px-4 py-3 transition-all ${
                    tipoCarne === t.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-secondary/40 hover:border-primary/50'
                  }`}
                >
                  <div className="text-left">
                    <div className="font-semibold">{t.label}</div>
                    <div className="text-xs text-muted-foreground">{t.sub}</div>
                  </div>
                  <div className="font-display text-primary text-lg">
                    {formatBRL(burguer.precos[t.id] ?? 0)}
                  </div>
                </button>
              ))}
            </div>
          )}

          {etapa === 'adicionais' && (
            <div>
              <p className="text-sm text-muted-foreground mb-3">Adicionais (opcional)</p>
              <div className="space-y-2">
                {ADICIONAIS.map((a) => {
                  const selecionado = adicionaisIds.includes(a.id);
                  return (
                    <button
                      key={a.id}
                      onClick={() => toggleAdicional(a.id)}
                      className={`w-full flex items-center justify-between rounded-lg border px-4 py-3 transition-all ${
                        selecionado ? 'border-primary bg-primary/10' : 'border-border bg-secondary/40 hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                            selecionado ? 'bg-primary border-primary' : 'border-muted-foreground'
                          }`}
                        >
                          {selecionado && <Check className="w-3 h-3 text-primary-foreground" />}
                        </div>
                        <span className="font-medium">{a.nome}</span>
                      </div>
                      <span className="text-sm text-primary">+ {formatBRL(a.preco)}</span>
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
                placeholder="Ex: sem cebola, ponto da carne..."
                className="bg-secondary/40 border-border min-h-[90px]"
              />
              <div className="rounded-lg border border-border bg-secondary/40 p-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Carne</span>
                  <span className="font-medium">
                    {TIPOS_CARNE.find((t) => t.id === tipoCarne)?.label}{' '}
                    {TIPOS_CARNE.find((t) => t.id === tipoCarne)?.sub}
                  </span>
                </div>
                {adicionaisIds.length > 0 && (
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Adicionais</span>
                    <span className="font-medium text-right">
                      {adicionaisIds.map((id) => ADICIONAIS.find((a) => a.id === id)?.nome).join(', ')}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-sm">Total</span>
                  <span className="font-display text-xl text-primary">{formatBRL(precoTotal)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="p-4 border-t border-border flex-row gap-2">
          {etapa !== 'carne' && (
            <Button
              variant="outline"
              className="border-border"
              onClick={() => setEtapa(etapa === 'observacao' ? 'adicionais' : 'carne')}
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Voltar
            </Button>
          )}
          {etapa === 'carne' && (
            <Button disabled={!tipoCarne} className="flex-1 bg-gold-gradient text-primary-foreground font-semibold" onClick={() => setEtapa('adicionais')}>
              Continuar <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
          {etapa === 'adicionais' && (
            <Button className="flex-1 bg-gold-gradient text-primary-foreground font-semibold" onClick={() => setEtapa('observacao')}>
              Continuar <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
          {etapa === 'observacao' && (
            <Button className="flex-1 bg-gold-gradient text-primary-foreground font-semibold" onClick={confirmarAdicionar}>
              Adicionar ao carrinho — {formatBRL(precoTotal)}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
