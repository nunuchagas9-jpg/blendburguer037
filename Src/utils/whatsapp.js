import { formatCurrency } from "./calculations";

export const WHATSAPP_NUMBER = "37984188332";

function cleanText(value) {
  return String(value ?? "").trim();
}

export function buildWhatsAppMessage({
  customer,
  cart,
  deliveryFee = 0,
  subtotal = 0,
  total = 0,
}) {
  const lines = [];

  lines.push("🍔 *BLEND BURGUER*");
  lines.push("*Feito pra matar a fome.*");
  lines.push("");
  lines.push("📋 *NOVO PEDIDO*");
  lines.push("");

  lines.push("👤 *CLIENTE*");
  lines.push(`Nome: ${cleanText(customer?.name)}`);
  lines.push(`WhatsApp: ${cleanText(customer?.phone)}`);
  lines.push("");

  lines.push("📍 *ENTREGA*");
  lines.push(`Endereço: ${cleanText(customer?.address)}`);
  lines.push(`Número: ${cleanText(customer?.number)}`);
  lines.push(`Bairro: ${cleanText(customer?.neighborhood)}`);
  lines.push(`Ponto de referência: ${cleanText(customer?.reference)}`);

  if (cleanText(customer?.complement)) {
    lines.push(`Complemento: ${cleanText(customer.complement)}`);
  }

  lines.push("");
  lines.push("🛒 *PEDIDO*");

  if (Array.isArray(cart) && cart.length > 0) {
    cart.forEach((item) => {
      const quantity = Number(item.quantity) || 0;
      const itemTotal = Number(item.total) || 0;

      lines.push(
        `${quantity}x ${cleanText(item.name)} — ${formatCurrency(itemTotal)}`
      );

      if (Array.isArray(item.selectedOptions)) {
        item.selectedOptions.forEach((option) => {
          lines.push(`   ↳ ${cleanText(option.name)}`);
        });
      }

      if (cleanText(item.observation)) {
        lines.push(`   Obs.: ${cleanText(item.observation)}`);
      }
    });
  } else {
    lines.push("Nenhum produto informado.");
  }

  lines.push("");
  lines.push(`Subtotal: ${formatCurrency(subtotal)}`);
  lines.push(`Taxa de entrega: ${formatCurrency(deliveryFee)}`);
  lines.push(`*TOTAL: ${formatCurrency(total)}*`);

  lines.push("");
  lines.push("💳 *PAGAMENTO*");

  const paymentMethod = cleanText(customer?.paymentMethod);

  if (paymentMethod) {
    lines.push(`Forma: ${paymentMethod}`);
  }

  if (paymentMethod.toLowerCase() === "dinheiro") {
    const needsChange = customer?.needsChange === true;

    lines.push(`Precisa de troco: ${needsChange ? "Sim" : "Não"}`);

    if (needsChange) {
      lines.push(
        `Troco para: ${formatCurrency(customer?.cashAmount)}`
      );

      lines.push(
        `Troco: ${formatCurrency(customer?.changeAmount)}`
      );
    }
  }

  if (cleanText(customer?.observation)) {
    lines.push("");
    lines.push(`📝 *OBSERVAÇÃO:* ${cleanText(customer.observation)}`);
  }

  lines.push("");
  lines.push("Obrigado pela preferência! ❤️");
  lines.push("BLEND BURGUER 037");

  return lines.join("\n");
}

export function createWhatsAppLink(message) {
  if (!WHATSAPP_NUMBER) {
    return null;
  }

  const encodedMessage = encodeURIComponent(message);

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
}
