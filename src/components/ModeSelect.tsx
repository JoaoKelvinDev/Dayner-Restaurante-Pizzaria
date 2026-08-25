import type { ModoPedido } from '@/types';
import { UtensilsCrossed, ShoppingBag, Bike } from 'lucide-react';

interface Props {
  onSelect: (modo: ModoPedido) => void;
}

const OPCOES: { id: ModoPedido; titulo: string; desc: string; icon: React.ReactNode }[] = [
  {
    id: 'comer_la',
    titulo: 'Comer lá',
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

export default function ModeSelect({ onSelect }: Props) {
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

        {/* Card "Onde estamos" — posicionado por último visualmente via CSS order,
            mesmo aparecendo antes do bloco de seleção de modo no DOM */}
        <div className="w-full rounded-xl border border-border bg-card p-4 mt-4 mb-6 text-left" style={{ order: 3 }}>
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-primary">
              Onde estamos
            </p>
            <p className="text-foreground">{ENDERECO}</p>
          </div>

          <div className="mt-4 border-t border-border pt-3">
            <p className="text-xs font-semibold text-foreground mb-2">Horário de funcionamento</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              {HORARIOS.map((h) => (
                <p key={h.dia}>
                  <span className="text-foreground">{h.dia}</span>
                  {h.horario}
                </p>
              ))}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <a
              className="group flex min-h-12 items-center justify-center gap-2 rounded-lg border-2 border-primary/60 bg-primary/10 px-2 py-2 text-center text-xs font-semibold text-primary shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-primary hover:bg-primary/20 hover:shadow-md active:scale-[0.98] active:duration-100"
              href={MAPS_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="Abrir localização no Google Maps"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-[#0D0D0D]">
                M
              </span>
              <span>Abrir no Maps</span>
            </a>
            <a
              className="group flex min-h-12 items-center justify-center gap-2 rounded-lg border-2 border-[#25D366] bg-[#25D366] px-2 py-2 text-center text-xs font-semibold text-[#062b12] shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#20bd5a] hover:shadow-md active:scale-[0.98] active:duration-100"
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="Abrir conversa no WhatsApp"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#062b12] text-[10px] font-bold text-[#25D366]">
                W
              </span>
              <span>Abrir WhatsApp</span>
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
