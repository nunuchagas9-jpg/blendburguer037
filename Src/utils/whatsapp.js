import { formatCurrency } from "./calculations";

export const WHATSAPP_NUMBER = "5537998121783";

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

  lines.push("🍔 *BLEND BURGUER 037*");
  lines.push("Feito pra matar a fome.");
  lines.push("");
  lines.push("📋 *NOVO PEDIDO*");
  lines.push("━━━━━━━━━━━━━━━━━━");
  lines.push("");

  lines.push("👤 *CLIENTE*");
  lines.push(`Nome: ${cleanText(customer?.name)}`);
  lines.push(`WhatsApp: ${cleanText(customer?.phone)}`);
  lines.push("");

  const orderType = cleanText(customer?.orderType);

  if (orderType === "Retirada no local") {
    lines.push("🏪 *RETIRADA NO LOCAL*");
    lines.push("Rua Frei Patrício de Moura, 71");
    lines.push("Morumbi — Divinópolis/MG");
  } else {
    lines.push("🚚 *ENTREGA*");
    lines.push(
      `Endereço: ${cleanText(customer?.address)}, ${cleanText(
        customer?.number
      )}`
    );
    lines.push(`Bairro: ${cleanText(customer?.neighborhood)}`);
    lines.push(
      `Referência: ${cleanText(customer?.reference)}`
    );

    if (cleanText(customer?.complement)) {
      lines.push(
        `Complemento: ${cleanText(customer.complement)}`
      );
    }
  }

  lines.push("");
  lines.push("🛒 *ITENS DO PEDIDO*");
  lines.push("");

  if (Array.isArray(cart) && cart.length > 0) {
    cart.forEach((item) => {
      const quantity = Number(item.quantity) || 0;
      const price = Number(item.price) || 0;

      const itemTotal =
        Number(item.total) || price * quantity;

      lines.push(
        `*${quantity}x ${cleanText(item.name)}*`
      );

      lines.push(
        `   ${formatCurrency(price)} cada`
      );

      lines.push(
        `   Total: ${formatCurrency(itemTotal)}`
      );

      if (Array.isArray(item.selectedOptions)) {
        item.selectedOptions.forEach((option) => {
          lines.push(
            `   ↳ ${cleanText(option.name)}`
          );
        });
      }

      if (cleanText(item.observation)) {
        lines.push(
          `   📝 Obs.: ${cleanText(item.observation)}`
        );
      }

      lines.push("");
    });
  } else {
    lines.push("Nenhum produto informado.");
  }

  lines.push("━━━━━━━━━━━━━━━━━━");

  lines.push(
    `Subtotal: ${formatCurrency(subtotal)}`
  );

  if (orderType === "Retirada no local") {
    lines.push("Entrega: Grátis");
  } else {
    lines.push(
      `Entrega: ${formatCurrency(deliveryFee)}`
    );
  }

  lines.push("");
  lines.push(`💰 *TOTAL: ${formatCurrency(total)}*`);

  lines.push("");
  lines.push("💳 *PAGAMENTO*");

  const paymentMethod = cleanText(
    customer?.paymentMethod
  );

  if (paymentMethod) {
    lines.push(`Forma: ${paymentMethod}`);
  }

  if (paymentMethod.toLowerCase() === "dinheiro") {
    const needsChange =
      customer?.needsChange === true;

    lines.push(
      `Troco: ${needsChange ? "SIM" : "NÃO"}`
    );

    if (needsChange) {
      lines.push(
        `Troco para: ${formatCurrency(
          customer?.cashAmount
        )}`
      );

      lines.push(
        `Valor do troco: ${formatCurrency(
          customer?.changeAmount
        )}`
      );
    }
  }

  lines.push("");
  lines.push("📝 *OBSERVAÇÃO*");

  if (cleanText(customer?.observation)) {
    lines.push(cleanText(customer.observation));
  } else {
    lines.push("Nenhuma");
  }

  lines.push("");
  lines.push("━━━━━━━━━━━━━━━━━━");
  lines.push("❤️ *Obrigado pela preferência!*");
  lines.push("*BLEND BURGUER 037*");

  return lines.join("\n");
}

export function createWhatsAppLink(message) {
  if (!WHATSAPP_NUMBER) {
    return null;
  }

  const encodedMessage =
    encodeURIComponent(message);

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
}