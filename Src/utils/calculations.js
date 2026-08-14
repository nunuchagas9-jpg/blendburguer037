export function roundMoney(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

export function calculateItemTotal(item) {
  const price = Number(item.price) || 0;
  const quantity = Number(item.quantity) || 0;

  const optionsTotal = (item.selectedOptions || []).reduce(
    (total, option) => total + (Number(option.price) || 0),
    0
  );

  return roundMoney((price + optionsTotal) * quantity);
}

export function calculateSubtotal(cart) {
  if (!Array.isArray(cart)) {
    return 0;
  }

  const subtotal = cart.reduce(
    (total, item) => total + calculateItemTotal(item),
    0
  );

  return roundMoney(subtotal);
}

export function calculateTotal(subtotal, deliveryFee = 0) {
  return roundMoney(
    (Number(subtotal) || 0) + (Number(deliveryFee) || 0)
  );
}

export function calculateChange(total, cashAmount) {
  const orderTotal = Number(total) || 0;
  const amountReceived = Number(cashAmount) || 0;

  if (amountReceived < orderTotal) {
    return null;
  }

  return roundMoney(amountReceived - orderTotal);
}

export function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value) || 0);
}

export function validateCashPayment(total, cashAmount) {
  const orderTotal = Number(total) || 0;
  const amountReceived = Number(cashAmount) || 0;

  return amountReceived >= orderTotal;
}


