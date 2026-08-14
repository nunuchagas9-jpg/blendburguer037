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
  const { order } = req.body;

  if (!order) {
    return res.status(400).json({
      success: false,
      message: "Pedido não informado.",
    });
  }

  console.log("PEDIDO RECEBIDO:");
  console.log(JSON.stringify(order, null, 2));

  const receiptText = createReceipt(order);

  console.log("TEXTO DA IMPRESSÃO:");
  console.log(receiptText);

  printText(receiptText, (error) => {
    if (error) {
      console.error("Erro ao imprimir:", error);

      return res.status(500).json({
        success: false,
        message: "Não foi possível imprimir o pedido.",
      });
    }

    res.json({
      success: true,
      message: "Pedido enviado para a impressora.",
    });
  });
});

function createReceipt(order) {
  const customer = order.customer || {};

  const cart = Array.isArray(order.cart)
    ? order.cart
    : [];

  let text = "";

  text += "================================\n";
  text += "        BLEND BURGUER 037\n";
  text += "================================\n\n";

  text += "CLIENTE\n";
  text += "--------------------------------\n";
  text += `Nome: ${customer.name || ""}\n`;
  text += `WhatsApp: ${customer.phone || ""}\n\n`;

  if (customer.orderType === "Entrega") {
    text += "ENTREGA\n";
    text += "--------------------------------\n";
    text += `Endereco: ${customer.address || ""}\n`;
    text += `Numero: ${customer.number || ""}\n`;
    text += `Bairro: ${customer.neighborhood || ""}\n`;

    if (customer.reference) {
      text += `Referencia: ${customer.reference}\n`;
    }

    if (customer.complement) {
      text += `Complemento: ${customer.complement}\n`;
    }

    text += "\n";
  } else {
    text += "RETIRADA NO LOCAL\n";
    text += "--------------------------------\n";
    text += "Rua Frei Patricio de Moura, 71\n";
    text += "Morumbi - Divinopolis/MG\n\n";
  }

  text += "PEDIDO\n";
  text += "--------------------------------\n";

  let calculatedSubtotal = 0;

  cart.forEach((item) => {
    const quantity = Number(item.quantity) || 1;

    // Aceita:
    // 35
    // 35.00
    // "35"
    // "35,00"
    // "R$ 35,00"
    const price = parseMoney(
      item.price ??
      item.unitPrice ??
      item.valor ??
      item.preco
    );

    let itemTotal = parseMoney(
      item.total ??
      item.itemTotal ??
      item.totalPrice
    );

    // Se não existir total do item, calcula pelo preço x quantidade
    if (itemTotal <= 0) {
      itemTotal = price * quantity;
    }

    calculatedSubtotal += itemTotal;

    text += `${quantity}x ${item.name || "Produto"}\n`;
    text += `R$ ${formatMoney(price)} cada\n`;
    text += `Total: R$ ${formatMoney(itemTotal)}\n`;

    if (item.selectedOption) {
      text += `Opcao: ${item.selectedOption}\n`;
    }

    if (
      Array.isArray(item.selectedOptions) &&
      item.selectedOptions.length > 0
    ) {
      item.selectedOptions.forEach((option) => {
        text += `${option.name || "Opcao"}: ${
          option.value || ""
        }\n`;
      });
    }

    if (item.observation) {
      text += `Obs.: ${item.observation}\n`;
    }

    text += "\n";
  });

  text += "--------------------------------\n";

  // Primeiro tenta usar o subtotal enviado pelo site.
  // Se vier vazio/zero, calcula pelos itens.
  let subtotal = parseMoney(
    order.subtotal ??
    order.subTotal ??
    order.sub_total
  );

  if (subtotal <= 0) {
    subtotal = calculatedSubtotal;
  }

  text += `Subtotal: R$ ${formatMoney(subtotal)}\n`;

  if (customer.orderType === "Entrega") {
    text += "Entrega: A CONFIRMAR\n";
  } else {
    text += "Entrega: GRATIS\n";
  }

  // Total do pedido
  let total = parseMoney(
    order.total ??
    order.totalPrice ??
    order.finalTotal
  );

  // Se o total não vier corretamente, usa o subtotal.
  if (total <= 0) {
    total = subtotal;
  }

  text += "\n";
  text += `TOTAL: R$ ${formatMoney(total)}\n\n`;

  text += "PAGAMENTO\n";
  text += "--------------------------------\n";
  text += `Forma: ${
    customer.paymentMethod || ""
  }\n`;

  if (customer.needsChange) {
    text += `Troco para: R$ ${formatMoney(
      parseMoney(customer.cashAmount)
    )}\n`;

    text += `Troco: R$ ${formatMoney(
      parseMoney(customer.changeAmount)
    )}\n`;
  }

  text += "\n";

  text += "OBSERVACAO\n";
  text += "--------------------------------\n";
  text += customer.observation || "Nenhuma";
  text += "\n\n";

  text += "================================\n";
  text += "       PEDIDO RECEBIDO\n";
  text += "       BLEND BURGUER 037\n";
  text += "================================\n\n\n";

  return text;
}

/**
 * Converte valores como:
 *
 * 35
 * 35.00
 * "35"
 * "35.00"
 * "35,00"
 * "R$ 35,00"
 * "R$35,00"
 *
 * para número.
 */
function parseMoney(value) {
  if (value === null || value === undefined) {
    return 0;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  let text = String(value).trim();

  if (!text) {
    return 0;
  }

  // Remove R$, espaços e outros caracteres
  text = text
    .replace(/R\$/gi, "")
    .replace(/\s/g, "")
    .replace(/[^\d,.-]/g, "");

  if (!text) {
    return 0;
  }

  // Caso brasileiro: 35,00
  if (text.includes(",")) {
    text = text.replace(/\./g, "");
    text = text.replace(",", ".");
  }

  const number = Number(text);

  return Number.isFinite(number) ? number : 0;
}

function formatMoney(value) {
  return parseMoney(value)
    .toFixed(2)
    .replace(".", ",");
}

function printText(text, callback) {
  const safeText = text.replace(/`/g, "``");

  const powershellCommand = `
Add-Type -AssemblyName System.Drawing

$printer = "${PRINTER_NAME}"

$text = @'
${safeText}
'@

$printJob = New-Object System.Drawing.Printing.PrintDocument

$printJob.PrinterSettings.PrinterName = $printer

$printJob.add_PrintPage({
    param($sender, $e)

    $font = New-Object System.Drawing.Font(
        "Courier New",
        9
    )

    $brush = [System.Drawing.Brushes]::Black

    $x = 10
    $y = 10
    $lineHeight = 14

    $lines = $text -split "\\r?\\n"

    foreach ($line in $lines) {
        $e.Graphics.DrawString(
            $line,
            $font,
            $brush,
            $x,
            $y
        )

        $y += $lineHeight
    }
})

$printJob.Print()
$printJob.Dispose()
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
        console.error("PowerShell:", stderr);
        callback(error);
        return;
      }

      callback(null);
    }
  );
}

const server = app.listen(
  PORT,
  "0.0.0.0",
  () => {
    console.log("");
    console.log(
      "========================================"
    );
    console.log(
      " BLEND BURGUER - SERVIDOR DE IMPRESSAO"
    );
    console.log(
      "========================================"
    );
    console.log(
      `Servidor funcionando em http://127.0.0.1:${PORT}`
    );
    console.log(
      "Nao feche esta janela."
    );
    console.log("");
  }
);

server.on("error", (error) => {
  console.error("ERRO NO SERVIDOR:", error);
});

// Mantém o servidor ativo.
setInterval(() => {}, 1000);
