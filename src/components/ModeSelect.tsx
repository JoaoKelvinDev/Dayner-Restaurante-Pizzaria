import type { ModoPedido } from '@/types';
import {
  UtensilsCrossed,
  ShoppingBag,
  Bike,
  MapPin,
  Clock3,
  Navigation,
  MessageCircle,
} from 'lucide-react';

interface Props {
  onSelect: (modo: ModoPedido) => void;
}

const OPCOES: { id: ModoPedido; titulo: string; desc: string; icon: React.ReactNode }[] = [
  {
    id: 'comer_la',
    titulo: 'Comer no Local',
    desc: 'Peça agora e retire na sua mesa',
    icon: <UtensilsCrossed className="w-7 h-7" />,
  },
  {
    id: 'retirada',
    titulo: 'Retirada no balcão',
    desc: 'Peça e retire quando estiver pronto',
    icon: <ShoppingBag className="w-7 h-7" />,
  },
  {
    id: 'delivery',
    titulo: 'Delivery',
    desc: 'Receba no conforto de casa',
    icon: <Bike className="w-7 h-7" />,
  },
];

const HORARIOS = [
  { dia: 'Segunda: ', horario: '06:00–21:00' },
  { dia: 'Terça a quinta: ', horario: '06:00–22:30' },
  { dia: 'Sexta e sábado: ', horario: '06:00–23:00' },
  { dia: 'Domingo: ', horario: '16:00–23:00' },
];

const ENDERECO = 'R. Maria Borges, Paes Landim - PI, 64710-000';
const MAPS_URL = 'https://maps.app.goo.gl/kDJybPpX7mfndVeJ9';
const WHATSAPP_URL = 'https://wa.me/5589994325413?text=Ol%C3%A1%2C%20gostaria%20de%20fazer%20um%20pedido.';

/*
 * Descobre qual linha de HORARIOS corresponde
 * ao dia de hoje, pra destacar na interface.
 */
function indiceHorarioDeHoje(): number {
  const dia = new Date().getDay(); // 0 = domingo ... 6 = sábado
  if (dia === 0) return 3; // Domingo
  if (dia === 1) return 0; // Segunda
  if (dia >= 2 && dia <= 4) return 1; // Terça a quinta
  return 2; // Sexta e sábado
}

/*
 * Compara o horário atual do visitante com o
 * intervalo do dia (ex: "06:00–21:00") pra saber
 * se a casa está aberta agora.
 */
function estaAbertoAgora(intervalo: string): boolean {
  const [inicio, fim] = intervalo.split('–').map((h) => h.trim());
  const paraMinutos = (hhmm: string) => {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
  };

  const agora = new Date();
  const minutosAgora = agora.getHours() * 60 + agora.getMinutes();

  return minutosAgora >= paraMinutos(inicio) && minutosAgora <= paraMinutos(fim);
}

export default function ModeSelect({ onSelect }: Props) {
  const indiceHoje = indiceHorarioDeHoje();
  const aberto = estaAbertoAgora(HORARIOS[indiceHoje].horario);

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-5 py-16 bg-background relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(circle_at_50%_0%,#F2A623,transparent_60%)]" />
      <div className="relative z-10 flex flex-col items-center text-center max-w-md w-full gap-6">
        <img
          src="img/logo.jpeg"
          alt="Logo Dayner Restaurante & Pizzaria"
          className="w-20 h-20 object-cover rounded-full mb-5 shadow-[0_0_40px_-8px_rgba(242,166,35,0.6)]"
        />
        <h1 className="font-display text-4xl tracking-wide text-gold-gradient uppercase">
          Dayner
        </h1>
        <p className="text-muted-foreground text-sm tracking-[0.3em] uppercase mb-10">
          Restaurante &amp; Pizzaria
        </p>

        {/* Rodapé institucional — estilo comanda/ticket, com
            perfuração separando as informações da ação.
            Posicionado por último visualmente via CSS order,
            mesmo aparecendo antes do bloco de seleção de modo
            no DOM. */}
        <div
          className="w-full rounded-2xl border border-border bg-card overflow-hidden mt-4 mb-6 text-left"
          style={{ order: 3 }}
        >
          <div className="p-4 space-y-4">
            {/* Endereço */}
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <MapPin className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">
                  Onde estamos
                </p>
                <p className="text-sm text-foreground mt-0.5">{ENDERECO}</p>
              </div>
            </div>

            {/* Horário */}
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Clock3 className="h-4 w-4" />
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">
                    Horário
                  </p>
                  <span
                    className={`flex items-center gap-1.5 text-[10px] font-semibold ${
                      aberto ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        aberto ? 'bg-primary' : 'bg-muted-foreground'
                      }`}
                    />
                    {aberto ? 'Aberto agora' : 'Fechado agora'}
                  </span>
                </div>

                <div className="mt-2 space-y-1 text-xs">
                  {HORARIOS.map((h, i) => (
                    <div
                      key={h.dia}
                      className={`flex justify-between ${
                        i === indiceHoje
                          ? 'font-semibold text-primary'
                          : 'text-muted-foreground'
                      }`}
                    >
                      <span>{h.dia.replace(':', '').trim()}</span>
                      <span>{h.horario}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>


          {/* Ações */}
          <div className="grid grid-cols-2 gap-3 p-4 pt-3">
            <a
              className="group flex min-h-12 items-center justify-center gap-2 rounded-lg border border-primary/50 bg-primary/5 px-2 py-2 text-center text-xs font-semibold text-primary transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-primary hover:bg-primary/15 active:scale-[0.98] active:duration-100"
              href={MAPS_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="Abrir localização no Google Maps"
            >
              <Navigation className="h-4 w-4" />
              <span>Como chegar</span>
            </a>
            <a
              className="group flex min-h-12 items-center justify-center gap-2 rounded-lg border border-primary/50 bg-primary/5 px-2 py-2 text-center text-xs font-semibold text-primary transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-primary hover:bg-primary/15 active:scale-[0.98] active:duration-100"
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="Abrir conversa no WhatsApp"
            >
              <MessageCircle className="h-4 w-4 text-[#25D366]" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4 self-start" style={{ order: 1 }}>
          Como você quer pedir?
        </p>

        <div className="w-full flex flex-col gap-3" style={{ order: 2 }}>
          {OPCOES.map((op) => (
            <button
              key={op.id}
              onClick={() => onSelect(op.id)}
              className="group w-full flex items-center gap-4 rounded-xl border border-border bg-card hover:border-primary/60 hover:bg-primary/5 transition-all px-5 py-4 text-left"
            >
              <div className="text-primary shrink-0">{op.icon}</div>
              <div className="flex-1">
                <div className="font-display text-lg tracking-wide">{op.titulo}</div>
                <div className="text-xs text-muted-foreground">{op.desc}</div>
              </div>
              <ChevronDecor />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChevronDecor() {
  return (
    <svg
      className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}