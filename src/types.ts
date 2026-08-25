export type ModoPedido = 'comer_la' | 'retirada' | 'delivery';

export type TamanhoPizza = 'mini' | 'broto' | 'pequena' | 'media' | 'grande' | 'gg';

export const TAMANHOS_PIZZA: { id: TamanhoPizza; label: string; fatias: string }[] = [
  { id: 'mini', label: 'Mini', fatias: '2 fatias' },
  { id: 'broto', label: 'Broto', fatias: '4 fatias' },
  { id: 'pequena', label: 'Pequena', fatias: '6 fatias' },
  { id: 'media', label: 'Média', fatias: '6/8 fatias' },
  { id: 'grande', label: 'Grande', fatias: '8/10 fatias' },
  { id: 'gg', label: 'GG', fatias: '10/12 fatias' },
];

export type PizzaPreco = Record<TamanhoPizza, number>;

export type PizzaCategoria = 'tradicional' | 'especial';

export interface PizzaSabor {
  id: string;
  nome: string;
  descricao: string;
  categoria: PizzaCategoria;
  precos: PizzaPreco;
}

export type TipoCarne = 'industrializada60' | 'artesanal100' | 'artesanal160' | 'artesanal160x2';

export const TIPOS_CARNE: { id: TipoCarne; label: string; sub: string }[] = [
  { id: 'industrializada60', label: 'Industrializada', sub: '60g' },
  { id: 'artesanal100', label: 'Artesanal', sub: '100g' },
  { id: 'artesanal160', label: 'Artesanal', sub: '160g' },
  { id: 'artesanal160x2', label: 'Artesanal', sub: '160g 2x' },
];

export interface Burguer {
  id: string;
  nome: string;
  descricao: string;
  precos: Partial<Record<TipoCarne, number>>;
}

export interface Adicional {
  id: string;
  nome: string;
  preco: number;
}

export interface ItemExtra {
  id: string;
  nome: string;
  preco: number;
}

export interface CategoriaExtras {
  titulo: string;
  itens: ItemExtra[];
}

export type FormaPagamento = 'pix' | 'cartao' | 'dinheiro';

export type StatusPedido = 'recebido' | 'em_preparo' | 'pronto_retirada' | 'saiu_entrega' | 'finalizado';

export type StatusPagamento = 'pendente' | 'pago' | 'na_entrega';

export interface DetalhesPizza {
  tamanho: TamanhoPizza;
  saborIds: string[]; // 1 ou 2 (meio a meio)
}

export interface DetalhesBurguer {
  tipoCarne: TipoCarne;
  adicionaisIds: string[];
}

export interface ItemCarrinho {
  uid: string;
  tipo: 'pizza' | 'burguer' | 'extra';
  nomeExibicao: string;
  detalhesTexto: string;
  detalhes?: DetalhesPizza | DetalhesBurguer;
  precoUnitario: number;
  quantidade: number;
  observacao?: string;
}

export interface DadosCheckout {
  nomeCliente: string;
  telefoneCliente: string;
  endereco?: string;
  formaPagamento: FormaPagamento;
  trocoPara?: string;
}

export interface Pedido {
  id: string;
  modo: ModoPedido;
  itens: ItemCarrinho[];
  valorTotal: number;
  dados: DadosCheckout;
  statusPagamento: StatusPagamento;
  statusPedido: StatusPedido;
  createdAt: number;
}
