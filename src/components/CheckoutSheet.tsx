import { useState } from 'react';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { formatBRL } from '@/data/menu';

import type {
  ModoPedido,
  FormaPagamento,
  DadosCheckout,
  ItemCarrinho,
} from '@/types';

import {
  QrCode,
  Copy,
  Check,
  Banknote,
  CreditCard,
  Loader2,
} from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  modo: ModoPedido;
  itens: ItemCarrinho[];

  onConfirmar: (
    dados: DadosCheckout,
    pagamentoJaConfirmado: boolean
  ) => void;
}

type Etapa =
  | 'dados'
  | 'pagamento'
  | 'pix';

export default function CheckoutSheet({
  open,
  onOpenChange,
  modo,
  itens,
  onConfirmar,
}: Props) {
  const [etapa, setEtapa] =
    useState<Etapa>('dados');

  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');

  // Endereço — somente delivery
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [referencia, setReferencia] =
    useState('');

  const [pagamento, setPagamento] =
    useState<FormaPagamento | null>(null);

  const [trocoPara, setTrocoPara] =
    useState('');

  const [copiado, setCopiado] =
    useState(false);

  const [gerandoCobranca, setGerandoCobranca] =
    useState(false);

  const [confirmandoPagamento, setConfirmandoPagamento] =
    useState(false);

  /*
   * ==========================================
   * VALORES
   * ==========================================
   */

  const subtotal = itens.reduce(
    (total, item) =>
      total +
      item.precoUnitario * item.quantidade,
    0
  );

  /*
   * A taxa de entrega ainda será definida
   * com o restaurante.
   *
   * Para comer no local e retirada:
   * sempre será 0.
   */
  const taxaEntrega =
    modo === 'delivery'
      ? 0
      : 0;

  const total =
    subtotal + taxaEntrega;

  /*
   * ==========================================
   * VALIDAÇÃO DOS DADOS
   * ==========================================
   */

  const dadosValidos =
    nome.trim().length > 1 &&
    telefone.length === 11 &&
    (
      modo !== 'delivery' ||
      (
        rua.trim().length > 2 &&
        numero.trim().length > 0 &&
        bairro.trim().length > 2
      )
    );

  /*
   * ==========================================
   * PIX — SIMULAÇÃO
   * ==========================================
   *
   * Isso NÃO é um código Pix real.
   * Posteriormente será substituído pela
   * integração com o gateway de pagamento.
   */

  const pixCopiaECola =
    '00020126580014BR.GOV.BCB.PIX0136dayner-lanches-exemplo-nao-real5204000053039865406' +
    total.toFixed(2).replace('.', '') +
    '5802BR5913Dayner Lanches6009Teresina62070503***6304ABCD';

  /*
   * ==========================================
   * TEXTO DO PAGAMENTO PRESENCIAL
   * ==========================================
   */

  const textoLocalPagamento = () => {
    if (modo === 'delivery') {
      return 'na entrega';
    }

    if (modo === 'comer_la') {
      return 'no restaurante';
    }

    return 'na retirada';
  };

  /*
   * ==========================================
   * CONSTRUIR DADOS DO PEDIDO
   * ==========================================
   */

  const construirDados = (
    formaPagamento: FormaPagamento
  ): DadosCheckout => {
    let troco: number | undefined;

    if (
      formaPagamento === 'dinheiro' &&
      trocoPara.trim().length > 0
    ) {
      const valor = Number(
        trocoPara
          .replace('R$', '')
          .replace(/\s/g, '')
          .replace(/\./g, '')
          .replace(',', '.')
      );

      if (!Number.isNaN(valor)) {
        troco = valor;
      }
    }

    return {
      nomeCliente: nome.trim(),

      telefoneCliente:
        telefone.trim(),

      endereco:
        modo === 'delivery'
          ? {
              rua: rua.trim(),
              numero: numero.trim(),
              bairro: bairro.trim(),
              referencia:
                referencia.trim() ||
                undefined,
            }
          : undefined,

      formaPagamento,

      trocoPara: troco,
    };
  };

  /*
   * ==========================================
   * PAGAMENTO PRESENCIAL
   * ==========================================
   *
   * Dinheiro e cartão não precisam de
   * confirmação online.
   *
   * O pedido é criado imediatamente.
   */

  const confirmarPagamentoLocal = () => {
    if (!pagamento) {
      return;
    }

    const dadosCheckout =
      construirDados(pagamento);

    onConfirmar(
      dadosCheckout,
      false
    );

    resetAndClose();
  };

  /*
   * ==========================================
   * ESCOLHER FORMA DE PAGAMENTO
   * ==========================================
   */

  const escolherPagamento = (
    forma: FormaPagamento
  ) => {
    setPagamento(forma);

    /*
     * PIX
     *
     * Abre a tela de pagamento.
     */
    if (forma === 'pix') {
      setGerandoCobranca(true);

      setEtapa('pix');

      /*
       * Simulação da criação da cobrança.
       *
       * Futuramente:
       * API → gateway → QR Code real.
       */
      setTimeout(() => {
        setGerandoCobranca(false);
      }, 900);

      return;
    }

    /*
     * Dinheiro e cartão permanecem
     * na tela de pagamento.
     *
     * Isso permite confirmar o pedido
     * depois de informar o troco.
     */
  };

  /*
   * ==========================================
   * CONFIRMAÇÃO PIX
   * ==========================================
   */

  const simularConfirmacaoPix = () => {
    setConfirmandoPagamento(true);

    /*
     * Simulação de webhook.
     *
     * Em produção:
     *
     * Gateway
     *    ↓
     * Webhook
     *    ↓
     * Backend
     *    ↓
     * statusPagamento = pago
     */

    setTimeout(() => {
      const dadosCheckout =
        construirDados('pix');

      onConfirmar(
        dadosCheckout,
        true
      );

      resetAndClose();
    }, 1100);
  };

  /*
   * ==========================================
   * RESET
   * ==========================================
   */

  const resetAndClose = () => {
    onOpenChange(false);

    setTimeout(() => {
      setEtapa('dados');

      setNome('');
      setTelefone('');

      setRua('');
      setNumero('');
      setBairro('');
      setReferencia('');

      setPagamento(null);

      setTrocoPara('');

      setCopiado(false);

      setGerandoCobranca(false);

      setConfirmandoPagamento(false);
    }, 300);
  };

  /*
   * ==========================================
   * INTERFACE
   * ==========================================
   */

  return (
    <Sheet
      open={open}
      onOpenChange={(valor) => {
        if (!valor) {
          resetAndClose();
        }
      }}
    >
      <SheetContent
        side="bottom"
        className="
          bg-card
          border-border
          text-foreground
          max-h-[90vh]
          overflow-y-auto
          scrollbar-none
          rounded-t-2xl
          p-0
        "
      >
        <SheetHeader
          className="
            p-5
            pb-3
            border-b
            border-border
            sticky
            top-0
            bg-card
            z-10
          "
        >
          <SheetTitle
            className="
              font-display
              text-2xl
              tracking-wide
              text-left
            "
          >
            {etapa === 'pix'
              ? 'Pagamento via Pix'
              : etapa === 'pagamento'
                ? 'Forma de pagamento'
                : 'Finalizar pedido'}
          </SheetTitle>
        </SheetHeader>

        {/* ==================================
            ETAPA 1 — DADOS
        ================================== */}

        {etapa === 'dados' && (
          <div className="p-5 space-y-4">

            {/* NOME */}

            <div className="space-y-1.5">
              <Label
                htmlFor="nome"
                className="text-xs text-muted-foreground"
              >
                Nome completo
              </Label>

              <Input
                id="nome"
                value={nome}
                onChange={(e) =>
                  setNome(e.target.value)
                }
                placeholder="Seu nome"
                className="
                  bg-secondary/40
                  border-border
                  h-11
                "
              />
            </div>

            {/* TELEFONE */}

            <div className="space-y-1.5">
              <Label
                htmlFor="telefone"
                className="text-xs text-muted-foreground"
              >
                WhatsApp
              </Label>

              <Input
                id="telefone"
                type="tel"
                inputMode="numeric"
                maxLength={11}
                value={telefone}
                onChange={(e) =>
                  setTelefone(
                    e.target.value
                      .replace(/\D/g, '')
                      .slice(0, 11)
                  )
                }
                placeholder="86999999999"
                className="
                  bg-secondary/40
                  border-border
                  h-11
                "
              />

              <p className="text-[11px] text-muted-foreground">
                Usamos esse número para avisar
                sobre o status do pedido.
              </p>
            </div>

            {/* ==================================
                ENDEREÇO — SOMENTE DELIVERY
            ================================== */}

            {modo === 'delivery' && (
              <>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="rua"
                    className="text-xs text-muted-foreground"
                  >
                    Rua
                  </Label>

                  <Input
                    id="rua"
                    value={rua}
                    onChange={(e) =>
                      setRua(e.target.value)
                    }
                    placeholder="Nome da rua"
                    className="
                      bg-secondary/40
                      border-border
                      h-11
                    "
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="numero"
                    className="text-xs text-muted-foreground"
                  >
                    Número
                  </Label>

                  <Input
                    id="numero"
                    value={numero}
                    onChange={(e) =>
                      setNumero(e.target.value)
                    }
                    placeholder="Número"
                    className="
                      bg-secondary/40
                      border-border
                      h-11
                    "
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="bairro"
                    className="text-xs text-muted-foreground"
                  >
                    Bairro
                  </Label>

                  <Input
                    id="bairro"
                    value={bairro}
                    onChange={(e) =>
                      setBairro(e.target.value)
                    }
                    placeholder="Seu bairro"
                    className="
                      bg-secondary/40
                      border-border
                      h-11
                    "
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="referencia"
                    className="text-xs text-muted-foreground"
                  >
                    Referência
                  </Label>

                  <Input
                    id="referencia"
                    value={referencia}
                    onChange={(e) =>
                      setReferencia(e.target.value)
                    }
                    placeholder="Ponto de referência (opcional)"
                    className="
                      bg-secondary/40
                      border-border
                      h-11
                    "
                  />
                </div>

                <p className="text-[11px] text-muted-foreground">
                  A taxa de entrega será definida
                  conforme as regras do restaurante.
                </p>
              </>
            )}

            <Button
              disabled={!dadosValidos}
              className="
                w-full
                bg-gold-gradient
                text-primary-foreground
                font-semibold
                h-12
                mt-2
              "
              onClick={() =>
                setEtapa('pagamento')
              }
            >
              Continuar
            </Button>
          </div>
        )}

        {/* ==================================
            ETAPA 2 — PAGAMENTO
        ================================== */}

        {etapa === 'pagamento' && (
          <div className="p-5 space-y-3">

            {/* TOTAL */}

            <div
              className="
                rounded-lg
                border
                border-border
                bg-secondary/40
                p-3
                flex
                items-center
                justify-between
                mb-2
              "
            >
              <span className="text-sm text-muted-foreground">
                Total do pedido
              </span>

              <span className="font-display text-xl text-primary">
                {formatBRL(total)}
              </span>
            </div>

            {/* PIX */}

            <button
              type="button"
              onClick={() =>
                escolherPagamento('pix')
              }
              className={`
                w-full
                flex
                items-center
                gap-3
                rounded-lg
                border
                px-4
                py-3.5
                transition-all
                ${
                  pagamento === 'pix'
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-secondary/40 hover:border-primary/50'
                }
              `}
            >
              <QrCode className="w-5 h-5 text-primary" />

              <div className="text-left flex-1">
                <div className="font-semibold text-sm">
                  Pix
                </div>

                <div className="text-xs text-muted-foreground">
                  Pagamento online via Pix
                </div>
              </div>
            </button>

            {/* CARTÃO */}

            <button
              type="button"
              onClick={() =>
                escolherPagamento('cartao')
              }
              className={`
                w-full
                flex
                items-center
                gap-3
                rounded-lg
                border
                px-4
                py-3.5
                transition-all
                ${
                  pagamento === 'cartao'
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-secondary/40 hover:border-primary/50'
                }
              `}
            >
              <CreditCard className="w-5 h-5 text-primary" />

              <div className="text-left flex-1">
                <div className="font-semibold text-sm">
                  Cartão {textoLocalPagamento()}
                </div>

                <div className="text-xs text-muted-foreground">
                  Pagamento realizado presencialmente
                </div>
              </div>
            </button>

            {/* DINHEIRO */}

            <button
              type="button"
              onClick={() =>
                escolherPagamento('dinheiro')
              }
              className={`
                w-full
                flex
                items-center
                gap-3
                rounded-lg
                border
                px-4
                py-3.5
                transition-all
                ${
                  pagamento === 'dinheiro'
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-secondary/40 hover:border-primary/50'
                }
              `}
            >
              <Banknote className="w-5 h-5 text-primary" />

              <div className="text-left flex-1">
                <div className="font-semibold text-sm">
                  Dinheiro {textoLocalPagamento()}
                </div>

                <div className="text-xs text-muted-foreground">
                  Pagamento realizado presencialmente
                </div>
              </div>
            </button>

            {/* TROCO */}

            {pagamento === 'dinheiro' && (
              <div className="space-y-1.5 pt-1">
                <Label
                  htmlFor="troco"
                  className="text-xs text-muted-foreground"
                >
                  Precisa de troco para quanto?
                </Label>

                <Input
                  id="troco"
                  inputMode="decimal"
                  value={trocoPara}
                  onChange={(e) =>
                    setTrocoPara(e.target.value)
                  }
                  placeholder="Ex: 100,00"
                  className="
                    bg-secondary/40
                    border-border
                    h-11
                  "
                />

                <p className="text-[11px] text-muted-foreground">
                  Deixe em branco caso não precise
                  de troco.
                </p>
              </div>
            )}

            {/* CONFIRMAR CARTÃO */}

            {pagamento === 'cartao' && (
              <Button
                className="
                  w-full
                  bg-gold-gradient
                  text-primary-foreground
                  font-semibold
                  h-12
                  mt-3
                "
                onClick={confirmarPagamentoLocal}
              >
                Confirmar pedido
              </Button>
            )}

            {/* CONFIRMAR DINHEIRO */}

            {pagamento === 'dinheiro' && (
              <Button
                className="
                  w-full
                  bg-gold-gradient
                  text-primary-foreground
                  font-semibold
                  h-12
                  mt-3
                "
                onClick={confirmarPagamentoLocal}
              >
                Confirmar pedido
              </Button>
            )}
          </div>
        )}

        {/* ==================================
            ETAPA 3 — PIX
        ================================== */}

        {etapa === 'pix' && (
          <div className="p-5 flex flex-col items-center text-center">

            {gerandoCobranca ? (
              <div className="py-14 flex flex-col items-center gap-3 text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />

                <p className="text-sm">
                  Gerando cobrança Pix...
                </p>
              </div>
            ) : (
              <>
                <div
                  className="
                    w-52
                    h-52
                    rounded-xl
                    bg-white
                    flex
                    items-center
                    justify-center
                    p-3
                    mb-4
                  "
                >
                  <PixQrPlaceholder />
                </div>

                <p className="font-display text-2xl text-primary mb-1">
                  {formatBRL(total)}
                </p>

                <p className="text-xs text-muted-foreground mb-4">
                  Escaneie o QR code no app do seu banco
                  ou copie o código abaixo.
                </p>

                {/* COPIAR PIX */}

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(
                      pixCopiaECola
                    );

                    setCopiado(true);

                    setTimeout(
                      () => setCopiado(false),
                      1800
                    );
                  }}
                  className="
                    w-full
                    flex
                    items-center
                    gap-2
                    rounded-lg
                    border
                    border-border
                    bg-secondary/40
                    px-3
                    py-2.5
                    mb-5
                  "
                >
                  <span
                    className="
                      text-[11px]
                      text-muted-foreground
                      truncate
                      flex-1
                      text-left
                      font-mono
                    "
                  >
                    {pixCopiaECola.slice(0, 34)}...
                  </span>

                  {copiado ? (
                    <Check className="w-4 h-4 text-primary shrink-0" />
                  ) : (
                    <Copy className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                </button>

                <p className="text-[11px] text-muted-foreground mb-4">
                  O pedido só entra na fila de preparo
                  depois que o pagamento for confirmado.
                </p>

                <Button
                  disabled={confirmandoPagamento}
                  className="
                    w-full
                    bg-gold-gradient
                    text-primary-foreground
                    font-semibold
                    h-12
                  "
                  onClick={simularConfirmacaoPix}
                >
                  {confirmandoPagamento ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Confirmando pagamento...
                    </span>
                  ) : (
                    'Simular confirmação de pagamento'
                  )}
                </Button>

                <p className="text-[10px] text-muted-foreground mt-2">
                  Demonstração — em produção essa
                  confirmação será realizada automaticamente
                  pelo provedor de pagamento.
                </p>
              </>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}


/*
 * ==========================================
 * QR CODE — PLACEHOLDER
 * ==========================================
 *
 * É apenas visual.
 * Não representa um QR Code Pix real.
 */

function PixQrPlaceholder() {
  return (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-full"
    >
      <rect
        width="100"
        height="100"
        fill="white"
      />

      {Array.from({ length: 12 }).map(
        (_, row) =>
          Array.from({ length: 12 }).map(
            (_, col) => {
              const seed =
                (row * 12 + col * 7) % 5;

              const on =
                seed === 0 || seed === 3;

              const isFinder =
                (row < 3 && col < 3) ||
                (row < 3 && col > 8) ||
                (row > 8 && col < 3);

              if (isFinder) {
                return null;
              }

              return on ? (
                <rect
                  key={`${row}-${col}`}
                  x={col * 8.3}
                  y={row * 8.3}
                  width="7.5"
                  height="7.5"
                  fill="#0D0D0D"
                />
              ) : null;
            }
          )
      )}

      {[0, 9].map((cx) =>
        [0, 9].map((cy) => {
          if (cx === 9 && cy === 9) {
            return null;
          }

          return (
            <g key={`${cx}-${cy}`}>
              <rect
                x={cx * 8.3}
                y={cy * 8.3}
                width="24.9"
                height="24.9"
                fill="#0D0D0D"
              />

              <rect
                x={cx * 8.3 + 4}
                y={cy * 8.3 + 4}
                width="16.9"
                height="16.9"
                fill="white"
              />

              <rect
                x={cx * 8.3 + 8}
                y={cy * 8.3 + 8}
                width="8.9"
                height="8.9"
                fill="#0D0D0D"
              />
            </g>
          );
        })
      )}
    </svg>
  );
}