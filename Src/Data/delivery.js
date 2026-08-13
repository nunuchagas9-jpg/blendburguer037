export const deliveryAreas = [
  {
    id: "centro",
    name: "Centro",
    fee: 5,
    active: true,
  },
  {
    id: "bairro-exemplo-1",
    name: "Bairro Exemplo 1",
    fee: 7,
    active: true,
  },
  {
    id: "bairro-exemplo-2",
    name: "Bairro Exemplo 2",
    fee: 8,
    active: true,
  },
];

export const getDeliveryFee = (areaId) => {
  const area = deliveryAreas.find(
    (item) => item.id === areaId && item.active
  );

  return area ? area.fee : 0;
};
