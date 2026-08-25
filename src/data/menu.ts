import type { PizzaSabor, Burguer, Adicional, CategoriaExtras } from '@/types';

// Preço base por tamanho — pizzas tradicionais
const precoTradicional = { mini: 18, broto: 35, pequena: 45, media: 55, grande: 70, gg: 80 };
// Preço base por tamanho — pizzas especiais
const precoEspecial = { mini: 21, broto: 37, pequena: 50, media: 60, grande: 73, gg: 85 };

export const PIZZAS_TRADICIONAIS: PizzaSabor[] = [
  { id: 'calabresa', nome: 'Calabresa', descricao: 'Molho de tomate, azeitona, orégano, cebola e calabresa e mussarela', categoria: 'tradicional', precos: precoTradicional },
  { id: 'mussarela', nome: 'Mussarela', descricao: 'Mussarela, tomate, cebola, molho de tomate, azeitona e orégano', categoria: 'tradicional', precos: precoTradicional },
  { id: 'frango-catupiry', nome: 'Frango e Catupiry', descricao: 'Molho de tomate, azeitona, orégano, cebola, calabresa, mussarela, frango, catupiry e milho verde', categoria: 'tradicional', precos: precoTradicional },
  { id: 'bacon', nome: 'Bacon', descricao: 'Molho de tomate, azeitona, orégano, cebola, mussarela, bacon e tomate', categoria: 'tradicional', precos: precoTradicional },
  { id: 'marguerita', nome: 'Marguerita', descricao: 'Molho de tomate, azeitona, orégano, cebola, mussarela, tomate, alho, manjericão, parmesão e cebola', categoria: 'tradicional', precos: precoTradicional },
  { id: 'frango-imperial', nome: 'Frango Imperial', descricao: 'Molho de tomate, azeitona, orégano, cebola, mussarela, frango, milho, creme de leite e tomate', categoria: 'tradicional', precos: precoTradicional },
  { id: 'italiana', nome: 'Italiana', descricao: 'Molho de tomate, azeitona, orégano, cebola, mussarela, bacon, tomate e cheddar', categoria: 'tradicional', precos: precoTradicional },
  { id: 'portuguesa', nome: 'Portuguesa', descricao: 'Molho de tomate, azeitona, orégano, cebola mussarela, presunto, ovo e tomate', categoria: 'tradicional', precos: precoTradicional },
  { id: 'baiana', nome: 'Baiana', descricao: 'Molho de tomate, azeitona, orégano, cebola, mussarela, calabresa, ovo e tomate', categoria: 'tradicional', precos: precoTradicional },
  { id: 'alcapone', nome: 'Alcapone', descricao: 'Molho de tomate, azeitona, orégano, cebola mussarela, presunto, catupiry, tomate, ervilha e ovo', categoria: 'tradicional', precos: precoTradicional },
  { id: 'napolitana', nome: 'Napolitana', descricao: 'Molho de tomate, azeitona, orégano, cebola, mussarela, tomate, parmesão e presunto', categoria: 'tradicional', precos: precoTradicional },
  { id: 'mexicana', nome: 'Mexicana', descricao: 'Molho de tomate, azeitona, orégano, cebola, mussarela, carne moída, tomate e pimentão', categoria: 'tradicional', precos: precoTradicional },
  { id: 'indiana', nome: 'Indiana', descricao: 'Molho de tomate, azeitona, orégano, cebola, mussarela, calabresa, tomate e pimentão', categoria: 'tradicional', precos: precoTradicional },
  { id: 'sao-jose', nome: 'São José', descricao: 'Molho de tomate, azeitona, orégano, cebola mussarela, calabresa e molho de pimenta', categoria: 'tradicional', precos: precoTradicional },
  { id: 'moda-da-casa', nome: 'Moda da Casa', descricao: 'Molho de tomate, azeitona, orégano, cebola, mussarela, calabresa e bacon', categoria: 'tradicional', precos: precoTradicional },
];

export const PIZZAS_ESPECIAIS: PizzaSabor[] = [
  { id: 'sensacao', nome: 'Sensação', descricao: 'Mussarela, chocolate, morango ou uva, creme de leite e leite condensado', categoria: 'especial', precos: precoEspecial },
  { id: 'nordestina', nome: 'Nordestina', descricao: 'Molho de tomate, azeitona, orégano, cebola, mussarela, carne seca, batata palha e requeijão cremoso', categoria: 'especial', precos: precoEspecial },
  { id: 'quatro-queijos', nome: 'Quatro Queijos', descricao: 'Molho de tomate, azeitona, orégano, cebola mussarela, parmesão, provolone e catupiry', categoria: 'especial', precos: precoEspecial },
  { id: 'principe-dnapoli', nome: 'Príncipe D\u2019Napoli', descricao: 'Molho de tomate, azeitona, orégano, cebola mussarela, bacon, tomate, presunto e catupiry', categoria: 'especial', precos: precoEspecial },
  { id: 'moda-pizzaiolo', nome: 'Moda do Pizzaiolo', descricao: 'Molho de tomate, mussarela, milho, calabresa, presunto, pimentão, azeitona, orégano e cebola', categoria: 'especial', precos: precoEspecial },
  { id: 'strogonoff-carne', nome: 'Strogonoff de Carne', descricao: 'Molho de tomate, strogonoff de carne, mussarela, batata palha, tomate, azeitona, orégano, cebola', categoria: 'especial', precos: precoEspecial },
  { id: 'frango-caipira', nome: 'Frango Caipira', descricao: 'Molho de tomate, mussarela, frango, milho, tomate, azeitona, orégano, cebola e bacon', categoria: 'especial', precos: precoEspecial },
  { id: 'frango-crocante', nome: 'Frango Crocante', descricao: 'Molho de tomate, mussarela, frango, ovo, frango empanado, tomate, azeitona, orégano, batata palha, cebola', categoria: 'especial', precos: precoEspecial },
];

export const HAMBURGUERES: Burguer[] = [
  { id: 'bacon-burguer', nome: 'Bacon Burguer', descricao: 'Pão, carne, queijo mussarela, ovo e bacon', precos: { industrializada60: 15, artesanal100: 20, artesanal160: 24, artesanal160x2: 28 } },
  { id: 'salada-burguer', nome: 'Salada Burguer', descricao: 'Pão, carne, alface, tomate, queijo mussarela e presunto', precos: { industrializada60: 13, artesanal100: 17, artesanal160: 20, artesanal160x2: 28 } },
  { id: 'turbinado-burguer', nome: 'Turbinado Burguer', descricao: 'Pão, carne, queijo mussarela (duplo), presunto (duplo), milho e ovo', precos: { industrializada60: 15, artesanal100: 19, artesanal160: 22, artesanal160x2: 28 } },
  { id: 'cheddar-burguer', nome: 'Cheddar Burguer', descricao: 'Pão, carne, queijo cheddar, queijo, bacon e molho cheddar', precos: { industrializada60: 15, artesanal100: 20, artesanal160: 24, artesanal160x2: 28 } },
  { id: 'dayner-burguer', nome: 'Dayner Burguer', descricao: 'Pão, carne, queijo mussarela, cheddar, calabresa e salada', precos: { industrializada60: 14, artesanal100: 19, artesanal160: 22, artesanal160x2: 28 } },
  { id: 'classico-burguer', nome: 'Clássico Burguer', descricao: 'Pão, carne, queijo mussarela, bacon e cebola', precos: { industrializada60: 14, artesanal100: 18, artesanal160: 23, artesanal160x2: 28 } },
  { id: 'master-burguer', nome: 'Master Burguer', descricao: 'Pão, 2 carnes, queijo (duplo), bacon, ovo e calabresa', precos: { industrializada60: 20, artesanal100: 26, artesanal160: 32 } },
  { id: 'cheese-burguer', nome: 'Cheese Burguer', descricao: 'Pão, carne, queijo, presunto e ovo', precos: { industrializada60: 13, artesanal100: 17, artesanal160: 21, artesanal160x2: 28 } },
  { id: 'tudao-burguer', nome: 'Tudão Burguer', descricao: 'Pão, carne, queijo mussarela, presunto, ovo, milho e salada', precos: { industrializada60: 18, artesanal100: 22, artesanal160: 25, artesanal160x2: 32 } },
];

export const ADICIONAIS: Adicional[] = [
  { id: 'ovo', nome: 'Ovo', preco: 2.0 },
  { id: 'bacon', nome: 'Bacon', preco: 2.5 },
  { id: 'fatia-queijo', nome: 'Fatia de queijo', preco: 2.5 },
  { id: 'presunto', nome: 'Presunto', preco: 2.5 },
  { id: 'cheddar', nome: 'Cheddar', preco: 2.5 },
  { id: 'salada', nome: 'Salada', preco: 2.0 },
  { id: 'calabresa', nome: 'Calabresa', preco: 2.5 },
  { id: 'fatia-abacaxi', nome: 'Fatia de abacaxi', preco: 2.5 },
  { id: 'salsicha', nome: 'Salsicha', preco: 2.0 },
];

export const PRODUTOS_EXTRAS: CategoriaExtras[] = [
  {
    titulo: 'Salgados de forno',
    itens: [
      { id: 'fatia-pizza', nome: 'Fatia de pizza', preco: 10 },
      { id: 'calzone', nome: 'Calzone', preco: 10 },
      { id: 'pao-frio', nome: 'Pão frio', preco: 8 },
      { id: 'pao-queijo', nome: 'Pão com queijo', preco: 6 },
      { id: 'hamburguer-forno', nome: 'Hambúrguer de forno', preco: 10 },
    ],
  },
  {
    titulo: 'Salgados fritos',
    itens: [
      { id: 'bomba', nome: 'Bomba', preco: 8 },
      { id: 'bomba-carne-seca', nome: 'Bomba de carne seca', preco: 9 },
      { id: 'pastel', nome: 'Pastel', preco: 8 },
      { id: 'coxinha', nome: 'Coxinha', preco: 8 },
      { id: 'salsichao', nome: 'Salsichão', preco: 6 },
    ],
  },
  {
    titulo: 'Bolos recheados',
    itens: [
      { id: 'chocolatudo', nome: 'Chocolatudo', preco: 12 },
      { id: 'ninho-chocolate', nome: 'Ninho e chocolate', preco: 13 },
      { id: 'abacaxi', nome: 'Abacaxi', preco: 13 },
    ],
  },
  {
    titulo: 'Bolos simples',
    itens: [
      { id: 'bolo-trigo', nome: 'Bolo de trigo', preco: 6 },
      { id: 'mandioca', nome: 'Mandioca', preco: 6 },
      { id: 'manue', nome: 'Manuê', preco: 6 },
      { id: 'milho', nome: 'Milho', preco: 6 },
      { id: 'bolo-coco', nome: 'Bolo de coco', preco: 7 },
      { id: 'rosca-sal-10', nome: 'Rosca de sal pequena', preco: 10 },
      { id: 'rosca-sal-15', nome: 'Rosca de sal grande', preco: 15 },
    ],
  },
  {
    titulo: 'Refrigerantes em lata 350ml',
    itens: [
      { id: 'refrigerante-uva', nome: 'Uva', preco: 5 },
      { id: 'refrigerante-uva-zero', nome: 'Uva Zero', preco: 5 },
      { id: 'refrigerante-laranja', nome: 'Laranja', preco: 5 },
      { id: 'refrigerante-laranja-zero', nome: 'Laranja Zero', preco: 5 },
      { id: 'refrigerante-coca', nome: 'Coca', preco: 5 },
      { id: 'refrigerante-coca-zero', nome: 'Coca Zero', preco: 5 },
      { id: 'refrigerante-guarana', nome: 'Guaraná', preco: 5 },
      { id: 'refrigerante-guarana-zero', nome: 'Guaraná Zero', preco: 5 },
      { id: 'refrigerante-sprite', nome: 'Sprite', preco: 5 },
      { id: 'refrigerante-sprite-zero', nome: 'Sprite Zero', preco: 5 },
    ],
  },
  {
    titulo: 'Refrigerantes 1 litro',
    itens: [
      { id: 'refrigerante-coca-1l', nome: 'Coca', preco: 10 },
      { id: 'refrigerante-laranja-1l', nome: 'Laranja', preco: 10 },
      { id: 'refrigerante-guarana-1l', nome: 'Guaraná', preco: 10 },
    ],
  },
  {
    titulo: 'Refrigerantes 1,5 litro',
    itens: [
      { id: 'refrigerante-coca-15l', nome: 'Coca', preco: 13 },
      { id: 'refrigerante-guarana-15l', nome: 'Guaraná', preco: 13 },
    ],
  },
  {
    titulo: 'Refrigerantes 2 litros',
    itens: [
      { id: 'refrigerante-coca-2l', nome: 'Coca', preco: 16 },
      { id: 'refrigerante-guarana-2l', nome: 'Guaraná', preco: 16 },
      { id: 'refrigerante-laranja-2l', nome: 'Laranja', preco: 16 },
      { id: 'refrigerante-uva-2l', nome: 'Uva', preco: 16 },
      { id: 'refrigerante-sao-geraldo-2l', nome: 'São Geraldo', preco: 16 },
    ],
  },
  {
    titulo: 'Sucos naturais 500ml',
    itens: [
      { id: 'suco-acerola', nome: 'Acerola', preco: 10 },
      { id: 'suco-caja', nome: 'Cajá', preco: 10 },
      { id: 'suco-caju', nome: 'Caju', preco: 10 },
      { id: 'suco-goiaba', nome: 'Goiaba', preco: 10 },
      { id: 'suco-maracuja', nome: 'Maracujá', preco: 10 },
    ],
  },
];

export function formatBRL(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
