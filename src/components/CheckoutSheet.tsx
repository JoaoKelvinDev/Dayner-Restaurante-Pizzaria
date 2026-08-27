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
  Banknote,
  CreditCard,
} from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  modo: ModoPedido;
  itens: ItemCarrinho[];

  onConfirmar: (
    dados: DadosCheckout,
    pagamentoJaConfirmado: boolean
  ) => Promise<void>;
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

  const [enviandoPedido, setEnviandoPedido] = useState(false);
  const [erroPedido, setErroPedido] = useState<string | null>(null);

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

  const confirmarPagamentoLocal = async () => {
    if (!pagamento) {
      return;
    }

    await enviarPedido(construirDados(pagamento), false);
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
      setEtapa('pix');
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
   * PEDIDO PIX PENDENTE
   * ==========================================
   */

  const registrarPixPendente = async () => {
    await enviarPedido(construirDados('pix'), false);
  };

  const enviarPedido = async (
    dadosCheckout: DadosCheckout,
    pagamentoJaConfirmado: boolean
  ) => {
    setEnviandoPedido(true);
    setErroPedido(null);

    /*
     * Sem uma integração de pagamento não há como confirmar Pix com segurança.
     * O pedido fica fora da fila até o futuro webhook alterar o pagamento para pago.
     */
    try {
      await onConfirmar(dadosCheckout, pagamentoJaConfirmado);
      resetAndClose();
    } catch {
      setErroPedido('Não foi possível enviar o pedido. Verifique a conexão e tente novamente.');
    } finally {
      setEnviandoPedido(false);
    }
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
      setErroPedido(null);
      setEnviandoPedido(false);

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
                disabled={enviandoPedido}
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
                {enviandoPedido ? 'Enviando pedido...' : 'Confirmar pedido'}
              </Button>
            )}

            {/* CONFIRMAR DINHEIRO */}

            {pagamento === 'dinheiro' && (
              <Button
                disabled={enviandoPedido}
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
                {enviandoPedido ? 'Enviando pedido...' : 'Confirmar pedido'}
              </Button>
            )}

            {erroPedido && (
              <p className="text-xs text-destructive text-center pt-2">
                {erroPedido}
              </p>
            )}
          </div>
        )}

        {/* ==================================
            ETAPA 3 — PIX
        ================================== */}

        {etapa === 'pix' && (
          <div className="p-5 flex flex-col items-center text-center">

            <>
                <p className="font-display text-2xl text-primary mb-1">
                  {formatBRL(total)}
                </p>

                <p className="text-xs text-muted-foreground mb-4">
                  O Pix será liberado com um QR Code real na próxima etapa.
                  Por enquanto, você pode registrar o pedido para validar o
                  estado de pagamento pendente.
                </p>

                <p className="text-[11px] text-muted-foreground mb-4">
                  O pedido só entra na fila de preparo
                  depois que o pagamento for confirmado.
                </p>

                <Button
                  disabled={enviandoPedido}
                  className="
                    w-full
                    bg-gold-gradient
                    text-primary-foreground
                    font-semibold
                    h-12
                  "
                  onClick={registrarPixPendente}
                >
                  {enviandoPedido ? 'Enviando pedido...' : 'Registrar pedido pendente'}
                </Button>

                <p className="text-[10px] text-muted-foreground mt-2">
                  A confirmação automática será adicionada com o provedor de
                  pagamento; nenhum Pix é gerado nesta versão.
                </p>

                {erroPedido && (
                  <p className="text-xs text-destructive mt-3">
                    {erroPedido}
                  </p>
                )}
            </>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
