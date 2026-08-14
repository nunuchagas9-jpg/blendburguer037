export const deliveryRules = [
  {
    id: "ate-2km",
    label: "Até 2 km",
    maxDistanceKm: 2,
    fee: 5,
  },
  {
    id: "2-a-4km",
    label: "2 a 4 km",
    maxDistanceKm: 4,
    fee: 7,
  },
  {
    id: "4-a-6km",
    label: "4 a 6 km",
    maxDistanceKm: 6,
    fee: 9,
  },
  {
    id: "6-a-8km",
    label: "6 a 8 km",
    maxDistanceKm: 8,
    fee: 12,
  },
  {
    id: "acima-8km",
    label: "Acima de 8 km",
    maxDistanceKm: Infinity,
    fee: 15,
  },
];

export const deliveryOrigin = {
  address: "Rua Frei Patrício de Moura, 71",
  neighborhood: "Morumbi",
  city: "Divinópolis",
  state: "MG",
  country: "Brasil",
};

export function calculateDeliveryFee(distanceKm) {
  if (!Number.isFinite(distanceKm) || distanceKm < 0) {
    return null;
  }

  const rule = deliveryRules.find(
    (item) => distanceKm <= item.maxDistanceKm
  );

  return rule ? rule.fee : null;
}


