import xFrangoImage from "../assets/211B5561-4631-40DB-8F7A-AB6E733F48B8.jpeg";
import doceImage from "../assets/5BC68375-8B4F-4531-A0C0-813A9F725B44.jpeg";
import blendDuploImage from "../assets/B3B4E00C-F66E-4673-B86F-6281D09EB2FD.png";

export const categories = [
  "ARTESANAIS",
  "TRADICIONAIS",
  "DOCES",
  "ADICIONAIS",
  "COMBOS",
  "BEBIDAS",
];

export const menu = [
  {
    id: "blend-burger",
    category: "ARTESANAIS",
    name: "BLEND BURGER",
    description:
      "Blend, mussarela, alface, tomate, cebola, maionese temperada e batata palha.",
    price: 27,
  },
  {
    id: "cheddar-bacon",
    category: "ARTESANAIS",
    name: "CHEDDAR BACON",
    description:
      "Blend, cheddar, bacon crocante, alface, tomate, cebola, maionese temperada e batata palha.",
    price: 29,
    popular: true,
  },
  {
    id: "blend-burger-duplo",
    category: "ARTESANAIS",
    name: "BLEND BURGER DUPLO",
    description:
      "2 Blends, bacon crocante, cheddar, alface, tomate, cebola, catupiry, maionese temperada e batata palha.",
    price: 37,
    image: blendDuploImage,
  },
  {
  id: "cebola-burger",
  category: "ARTESANAIS",
  name: "CEBOLA BURGER",
  description:
    "Blend, mussarela, alface, tomate, cebola caramelizada, maionese temperada e batata palha.",
  price: 29,
},
  {
    id: "x-frango",
    category: "ARTESANAIS",
    name: "X-FRANGO",
    description:
      "Pão, blend de frango, maionese temperada, alface, tomate e mussarela empanada.",
    price: 28,
    image: xFrangoImage,
  },
  {
    id: "x-burguer",
    category: "TRADICIONAIS",
    name: "X-BURGUER",
    description:
      "Bife de hambúrguer, mussarela, alface, tomate, maionese temperada e batata palha.",
    price: 22,
  },
  {
    id: "x-cheddar-bacon",
    category: "TRADICIONAIS",
    name: "X-CHEDDAR BACON",
    description:
      "Bife de hambúrguer, cheddar, bacon crocante, alface, tomate, maionese temperada e batata palha.",
    price: 25,
  },
  {
    id: "x-tudo-burger",
    category: "TRADICIONAIS",
    name: "X-TUDO BURGER",
    description:
      "Bife de hambúrguer, bacon, catupiry, mussarela, batata palha, milho, ovo, alface, tomate e maionese temperada.",
28,
  },
  {
    id: "hamburguer-doce",
    category: "DOCES",
    name: "HAMBÚRGUER DOCE",
    description: "Pão, creme de avelã e morango.",
    price: 18,
    image: doceImage,
  },
  {
    id: "mussarela-empanada",
    category: "ADICIONAIS",
    name: "MUSSARELA EMPANADA",
    description: "Mussarela empanada.",
    price: 8,
  },
  {
    id: "geleia-pimenta-abacaxi",
    category: "ADICIONAIS",
    name: "GELEIA DE PIMENTA C/ ABACAXI",
    description: "Geleia de pimenta com abacaxi.",
    price: 3,
  },
  {
    id: "blend-extra",
    category: "ADICIONAIS",
    name: "BLEND EXTRA",
    description: "Um blend extra de 120g.",
    price: 6,
  },
  {
    id: "barbecue-goiabada",
    category: "ADICIONAIS",
    name: "BARBECUE DE GOIABADA",
    description: "Molho barbecue de goiabada.",
    price: 3,
  },
  {
    id: "bacon",
    category: "ADICIONAIS",
    name: "FAROFA DE BACON",
    description: "Farofa crocante de bacon.",
    price: 3,
  },
  {
    id: "ovo",
    category: "ADICIONAIS",
    name: "OVO",
    description: "Ovo adicional.",
    price: 1,
  },
  {
    id: "batata-cheddar-bacon",
    category: "ADICIONAIS",
    name: "BATATA FRITA COM CHEDDAR E BACON",
    description: "Batata frita individual com cheddar e bacon.",
    price: 8,
  },
  {
    id: "coca-cola-310",
    category: "BEBIDAS",
    name: "COCA-COLA 310ML",
    description: "Coca-Cola lata 310ml.",
    price: 6,
    subcategory: "LATA",
  },
  {
    id: "coca-cola-zero",
    category: "BEBIDAS",
    name: "COCA-COLA ZERO",
    description: "Coca-Cola Zero lata.",
    price: 6.5,
    subcategory: "LATA",
  },
  {
    id: "fanta-350",
    category: "BEBIDAS",
    name: "FANTA 350ML",
    description: "Fanta lata 350ml.",
    price: 5,
    subcategory: "LATA",
  },
  {
    id: "guarana-antartica",
    category: "BEBIDAS",
    name: "GUARANÁ ANTARCTICA",
    description: "Guaraná Antarctica lata.",
    price: 5,
    subcategory: "LATA",
  },
  {
    id: "suco-uva",
    category: "BEBIDAS",
    name: "SUCO DE UVA",
    description: "Suco de uva.",
    price: 6,
    subcategory: "LATA",
  },
  {
    id: "mate-couro",
    category: "BEBIDAS",
    name: "MATE COURO",
    description: "Mate Couro 1 litro.",
    price: 9,
    subcategory: "1 LITRO",
  },
  {
    id: "coca-cola-2l",
    category: "BEBIDAS",
    name: "COCA-COLA 2 LITROS",
    description: "Coca-Cola 2 litros.",
    price: 14,
    subcategory: "2 LITROS",
  },
  {
    id: "antartica-2l",
    category: "BEBIDAS",
    name: "ANTARCTICA 2 LITROS",
    description: "Antarctica 2 litros.",
    price: 12,
    subcategory: "2 LITROS",
  },
];
