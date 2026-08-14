const express = require("express");
const cors = require("cors");
const { execFile } = require("child_process");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 3001;
const PRINTER_NAME = "TOMATE MTIN-773";

app.get("/", (req, res) => {
  res.send("Servidor de impressão Blend Burguer funcionando!");
});

app.post("/print", (req, res) => {
  try {
    const { order } = req.body;

    if (!order) {
      return res.status(400).json({
        success: false,
        message: "Pedido não informado.",
      });
    }

    const receiptText = createReceipt(order);

    printText(receiptText, (error) => {
      if (error) {
        console.error("Erro ao imprimir:", error);

        return res.status(500).json({
          success: false,
          message: "Não foi possível imprimir o pedido.",
          error: error.message,
        });
      }

      return res.json({
        success: true,
        message: "Pedido enviado para a impressora.",
      });
    });
  } catch (error) {
    console.error("Erro:", error);

    return res.status(500).json({
      success: false,
      message: "Erro no servidor de impressão.",
      error: error.message,
    });
  }
});

function createReceipt(order) {
  const customer = order.customer || {};

  const cart = Array.isArray(order.cart)
    ? order.cart
    : [];

  let text = "";

  text += "BLEND BURGUER\n";
  text += "\n";

  text += `Cliente: ${customer.name || ""}\n`;
  text += `WhatsApp: ${customer.phone || ""}\n`;
  text += "\n";

  if (customer.orderType === "Entrega") {
    text += "ENTREGA\n";
    text += `${customer.address || ""}, ${customer.number || ""}\n`;
    text += `${customer.neighborhood || ""}\n`;

    if (customer.reference) {
      text += `Referencia: ${customer.reference}\n`;
    }

    if (customer.complement) {
      text += `Complemento: ${customer.complement}\n`;
    }

    text += "\n";
  } else {
    text += "RETIRADA NO LOCAL\n";
    text += "\n";
  }

  text += "PEDIDO\n";
  text += "\n";

  cart.forEach((item) => {
    const quantity = Number(item.quantity) || 1;
    const price = Number(item.price) || 0;

    const itemTotal =
      Number(item.total) ||
      price * quantity;

    text += `${quantity}x ${item.name || "Produto"}\n`;
    text += `R$ ${formatMoney(itemTotal)}\n`;
    text += "\n";
  });

  text += `Subtotal: R$ ${formatMoney(order.subtotal)}\n`;

  if (Number(order.deliveryFee) > 0) {
    text += `Entrega: R$ ${formatMoney(order.deliveryFee)}\n`;
  }

  text += `TOTAL: R$ ${formatMoney(order.total)}\n`;
  text += "\n";

  text += `Pagamento: ${customer.paymentMethod || ""}\n`;

  if (customer.needsChange) {
    text += `Troco para: R$ ${formatMoney(
      customer.cashAmount
    )}\n`;

    text += `Troco: R$ ${formatMoney(
      customer.changeAmount
    )}\n`;
  }

  if (customer.observation) {
    text += "\n";
    text += `Observacao: ${customer.observation}\n`;
  }

  text += "\n";
  text += "PEDIDO RECEBIDO\n";
  text += "\n\n\n";

  return text;
}

function formatMoney(value) {
  return Number(value || 0)
    .toFixed(2)
    .replace(".", ",");
}

function printText(text, callback) {
  const powershellCommand = `
$text = @'
${text}
'@

$text | Out-Printer -Name "${PRINTER_NAME}"
`;

  execFile(
    "powershell.exe",
    [
      "-NoProfile",
      "-ExecutionPolicy",
      "Bypass",
      "-Command",
      powershellCommand,
    ],
    (error, stdout, stderr) => {
      if (error) {
        console.error(stderr);
        callback(error);
        return;
      }

      callback(null);
    }
  );
}

app.listen(PORT, "127.0.0.1", () => {
  console.log(
    `Servidor de impressão funcionando em http://127.0.0.1:${PORT}`
  );
});

