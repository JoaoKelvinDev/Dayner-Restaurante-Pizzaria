import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatBRL } from '@/data/menu';
import type { ModoPedido, FormaPagamento, DadosCheckout, ItemCarrinho } from '@/types';
import { QrCode, Copy, Check, Banknote, CreditCard, Loader2 } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  modo: ModoPedido;
  itens: ItemCarrinho[];
  onConfirmar: (dados: DadosCheckout, pagamentoJaConfirmado: boolean) => void;
}

type Etapa = 'dados' | 'pagamento' | 'pix';

export default function CheckoutSheet({ open, onOpenChange, modo, itens, onConfirmar }: Props) {
  const [etapa, setEtapa] = useState<Etapa>('dados');
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [pagamento, setPagamento] = useState<FormaPagamento | null>(null);
  const [trocoPara, setTrocoPara] = useState('');
  const [copiado, setCopiado] = useState(false);
  const [gerandoCobranca, setGerandoCobranca] = useState(false);
  const [confirmandoPagamento, setConfirmandoPagamento] = useState(false);

  const total = itens.reduce((s, i) => s + i.precoUnitario * i.quantidade, 0);
  const dadosValidos = nome.trim().length > 1 && telefone.length === 11 && (modo !== 'delivery' || endereco.trim().length > 4);

  const pixCopiaECola =
    '00020126580014BR.GOV.BCB.PIX0136dayner-lanches-exemplo-nao-real5204000053039865406' +
    total.toFixed(2).replace('.', '') +
    '5802BR5913Dayner Lanches6009Teresina62070503***6304ABCD';

  const dados = (): DadosCheckout => ({
    nomeCliente: nome.trim(),
    telefoneCliente: telefone.trim(),
    endereco: modo === 'delivery' ? endereco.trim() : undefined,
    formaPagamento: pagamento!,
    trocoPara: pagamento === 'dinheiro' && trocoPara.trim() ? trocoPara.trim() : undefined,
  });

  const escolherPagamento = (fp: FormaPagamento) => {
    setPagamento(fp);
    if (fp === 'pix') {
      setGerandoCobranca(true);
      setEtapa('pix');
      // Simula chamada à edge function `criar-cobranca-pix` (Mercado Pago)
      setTimeout(() => setGerandoCobranca(false), 900);
    } else {
      // cartão/dinheiro nascem como status_pagamento "na_entrega"
      onConfirmar({ ...dados(), formaPagamento: fp }, false);
      resetAndClose();
    }
  };

  const simularConfirmacaoPix = () => {
    setConfirmandoPagamento(true);
    // Simula o webhook `webhook-mercado-pago` confirmando status_pagamento: pago
    setTimeout(() => {
      onConfirmar(dados(), true);
      resetAndClose();
    }, 1100);
  };

  const resetAndClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setEtapa('dados');
      setNome('');
      setTelefone('');
      setEndereco('');
      setPagamento(null);
      setTrocoPara('');
      setCopiado(false);
      setConfirmandoPagamento(false);
    }, 300);
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && resetAndClose()}>
      <SheetContent side="bottom" className="bg-card border-border text-foreground max-h-[90vh] overflow-y-auto scrollbar-none rounded-t-2xl p-0">
        <SheetHeader className="p-5 pb-3 border-b border-border sticky top-0 bg-card z-10">
          <SheetTitle className="font-display text-2xl tracking-wide text-left">
            {etapa === 'pix' ? 'Pagamento via Pix' : 'Finalizar pedido'}
          </SheetTitle>
        </SheetHeader>

        {etapa === 'dados' && (
          <div className="p-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="nome" className="text-xs text-muted-foreground">Nome completo</Label>
              <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" className="bg-secondary/40 border-border h-11" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="telefone" className="text-xs text-muted-foreground">WhatsApp</Label>
              <Input
                id="telefone"
                type="tel"
                inputMode="numeric"
                maxLength={11}
                value={telefone}
                onChange={(e) => setTelefone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                placeholder="89994325413"
                className="bg-secondary/40 border-border h-11"
              />
              <p className="text-[11px] text-muted-foreground">Usamos esse número para avisar sobre o status do pedido.</p>
            </div>
            {modo === 'delivery' && (
              <div className="space-y-1.5">
                <Label htmlFor="endereco" className="text-xs text-muted-foreground">Endereço de entrega</Label>
                <Input id="endereco" value={endereco} onChange={(e) => setEndereco(e.target.value)} placeholder="Rua, número, bairro, referência" className="bg-secondary/40 border-border h-11" />
                <p className="text-[11px] text-muted-foreground">Taxa de entrega e valor mínimo serão confirmados pela equipe.</p>
              </div>
            )}
            <Button
              disabled={!dadosValidos}
              className="w-full bg-gold-gradient text-primary-foreground font-semibold h-12 mt-2"
              onClick={() => setEtapa('pagamento')}
            >
              Continuar
            </Button>
          </div>
        )}

        {etapa === 'pagamento' && (
          <div className="p-5 space-y-3">
            <div className="rounded-lg border border-border bg-secondary/40 p-3 flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total do pedido</span>
              <span className="font-display text-xl text-primary">{formatBRL(total)}</span>
            </div>

            <button
              onClick={() => escolherPagamento('pix')}
              className="w-full flex items-center gap-3 rounded-lg border border-border bg-secondary/40 hover:border-primary/50 px-4 py-3.5 transition-all"
            >
              <QrCode className="w-5 h-5 text-primary" />
              <div className="text-left flex-1">
                <div className="font-semibold text-sm">Pix</div>
                <div className="text-xs text-muted-foreground">Pagamento automático — QR code na hora</div>
              </div>
            </button>

            <button
              onClick={() => escolherPagamento('cartao')}
              className="w-full flex items-center gap-3 rounded-lg border border-border bg-secondary/40 hover:border-primary/50 px-4 py-3.5 transition-all"
            >
              <CreditCard className="w-5 h-5 text-primary" />
              <div className="text-left flex-1">
                <div className="font-semibold text-sm">Cartão {modo === 'delivery' ? 'na entrega' : 'na mesa/balcão'}</div>
                <div className="text-xs text-muted-foreground">Maquininha física, sem cobrança online</div>
              </div>
            </button>

            <button
              onClick={() => escolherPagamento('dinheiro')}
              className="w-full flex items-center gap-3 rounded-lg border border-border bg-secondary/40 hover:border-primary/50 px-4 py-3.5 transition-all"
            >
              <Banknote className="w-5 h-5 text-primary" />
              <div className="text-left flex-1">
                <div className="font-semibold text-sm">Dinheiro {modo === 'delivery' ? 'na entrega' : 'na mesa/balcão'}</div>
                <div className="text-xs text-muted-foreground">Informe se precisa de troco</div>
              </div>
            </button>

            {pagamento === 'dinheiro' && (
              <div className="space-y-1.5 pt-1">
                <Label htmlFor="troco" className="text-xs text-muted-foreground">Precisa de troco para quanto? (opcional)</Label>
                <Input id="troco" value={trocoPara} onChange={(e) => setTrocoPara(e.target.value)} placeholder="Ex: R$ 100,00" className="bg-secondary/40 border-border h-11" />
              </div>
            )}
          </div>
        )}

        {etapa === 'pix' && (
          <div className="p-5 flex flex-col items-center text-center">
            {gerandoCobranca ? (
              <div className="py-14 flex flex-col items-center gap-3 text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <p className="text-sm">Gerando cobrança Pix...</p>
              </div>
            ) : (
              <>
                <div className="w-52 h-52 rounded-xl bg-white flex items-center justify-center p-3 mb-4">
                  <PixQrPlaceholder />
                </div>
                <p className="font-display text-2xl text-primary mb-1">{formatBRL(total)}</p>
                <p className="text-xs text-muted-foreground mb-4">Escaneie o QR code no app do seu banco ou copie o código abaixo</p>

                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(pixCopiaECola);
                    setCopiado(true);
                    setTimeout(() => setCopiado(false), 1800);
                  }}
                  className="w-full flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3 py-2.5 mb-5"
                >
                  <span className="text-[11px] text-muted-foreground truncate flex-1 text-left font-mono">
                    {pixCopiaECola.slice(0, 34)}...
                  </span>
                  {copiado ? <Check className="w-4 h-4 text-primary shrink-0" /> : <Copy className="w-4 h-4 text-muted-foreground shrink-0" />}
                </button>

                <p className="text-[11px] text-muted-foreground mb-4">
                  O pedido só entra na fila de preparo depois que o pagamento é confirmado automaticamente.
                </p>

                <Button
                  disabled={confirmandoPagamento}
                  className="w-full bg-gold-gradient text-primary-foreground font-semibold h-12"
                  onClick={simularConfirmacaoPix}
                >
                  {confirmandoPagamento ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Confirmando pagamento...
                    </span>
                  ) : (
                    'Simular confirmação de pagamento'
                  )}
                </Button>
                <p className="text-[10px] text-muted-foreground mt-2">
                  Demonstração — em produção essa confirmação chega automaticamente via webhook do Mercado Pago.
                </p>
              </>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function PixQrPlaceholder() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <rect width="100" height="100" fill="white" />
      {Array.from({ length: 12 }).map((_, row) =>
        Array.from({ length: 12 }).map((__, col) => {
          const seed = (row * 12 + col * 7) % 5;
          const on = seed === 0 || seed === 3;
          const isFinder =
            (row < 3 && col < 3) || (row < 3 && col > 8) || (row > 8 && col < 3);
          if (isFinder) return null;
          return on ? (
            <rect key={`${row}-${col}`} x={col * 8.3} y={row * 8.3} width="7.5" height="7.5" fill="#0D0D0D" />
          ) : null;
        })
      )}
      {[0, 9].map((cx) =>
        [0, 9].map((cy) => {
          if (cx === 9 && cy === 9) return null;
          return (
            <g key={`${cx}-${cy}`}>
              <rect x={cx * 8.3} y={cy * 8.3} width="24.9" height="24.9" fill="#0D0D0D" />
              <rect x={cx * 8.3 + 4} y={cy * 8.3 + 4} width="16.9" height="16.9" fill="white" />
              <rect x={cx * 8.3 + 8} y={cy * 8.3 + 8} width="8.9" height="8.9" fill="#0D0D0D" />
            </g>
          );
        })
      )}
    </svg>
  );
}
