const express = require("express");
const cors = require("cors");
const { execFile } = require("child_process");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 3001;
const PRINTER_NAME = "TOMATE MTIN-773";

// ===============================
// TESTE DO SERVIDOR
// ===============================

app.get("/", (req, res) => {
  res.send("Servidor de impressão Blend Burguer funcionando!");
});

// ===============================
// RECEBER PEDIDO
// ===============================

app.post("/print", (req, res) => {
  const { order } = req.body;

  if (!order) {
    return res.status(400).json({
      success: false,
      message: "Pedido não informado.",
    });
  }

  console.log("");
  console.log("========================================");
  console.log("PEDIDO RECEBIDO");
  console.log("========================================");

  console.log(JSON.stringify(order, null, 2));

  const receiptText = createReceipt(order);

  console.log("");
  console.log("TEXTO DA IMPRESSÃO:");
  console.log("----------------------------------------");
  console.log(receiptText);
  console.log("----------------------------------------");

  printText(receiptText, (error) => {
    if (error) {
      console.error("ERRO AO IMPRIMIR:", error);

      return res.status(500).json({
        success: false,
        message: "Não foi possível imprimir o pedido.",
      });
    }

    console.log("PEDIDO IMPRESSO COM SUCESSO!");

    res.json({
      success: true,
      message: "Pedido enviado para a impressora.",
    });
  });
});

// ===============================
// MONTAR CUPOM
// ===============================

function createReceipt(order) {
  const customer = order.customer || {};

  const cart = Array.isArray(order.cart)
    ? order.cart
    : [];

  const LINE = "--------------------------------";
  const EQUALS = "================================";

  let text = "";

  text += EQUALS + "\n";
  text += center("BLEND BURGUER 037") + "\n";
  text += EQUALS + "\n\n";

  // CLIENTE

  text += "CLIENTE\n";
  text += LINE + "\n";

  text += wrapText(`Nome: ${customer.name || ""}`);
  text += wrapText(`WhatsApp: ${customer.phone || ""}`);
  text += "\n";

  // ENTREGA

  if (customer.orderType === "Entrega") {
    text += "ENTREGA\n";
    text += LINE + "\n";

    text += wrapText(
      `Endereço: ${customer.address || ""}`
    );

    text += wrapText(
      `Número: ${customer.number || ""}`
    );

    text += wrapText(
      `Bairro: ${customer.neighborhood || ""}`
    );

    if (customer.reference) {
      text += wrapText(
        `Referência: ${customer.reference}`
      );
    }

    if (customer.complement) {
      text += wrapText(
        `Complemento: ${customer.complement}`
      );
    }

    text += "\n";
  } else {
    text += "RETIRADA NO LOCAL\n";
    text += LINE + "\n";

    text += "Rua Frei Patrício de Moura, 71\n";
    text += "Morumbi - Divinópolis/MG\n\n";
  }

  // PEDIDO

  text += "PEDIDO\n";
  text += LINE + "\n";

  let calculatedSubtotal = 0;

  cart.forEach((item) => {
    const quantity = Number(item.quantity) || 1;

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

    if (itemTotal <= 0) {
      itemTotal = price * quantity;
    }

    calculatedSubtotal += itemTotal;

    text += wrapText(
      `${quantity}x ${item.name || "Produto"}`
    );

    text += `R$ ${formatMoney(price)} cada\n`;

    text += `Total: R$ ${formatMoney(itemTotal)}\n`;

    // OPÇÃO

    if (item.selectedOption) {
      text += wrapText(
        `Opção: ${item.selectedOption}`
      );
    }

    // OPÇÕES

    if (
      Array.isArray(item.selectedOptions) &&
      item.selectedOptions.length > 0
    ) {
      item.selectedOptions.forEach((option) => {
        text += wrapText(
          `${option.name || "Opção"}: ${
            option.value || ""
          }`
        );
      });
    }

    // OBSERVAÇÃO DO ITEM

    if (item.observation) {
      text += wrapText(
        `Obs.: ${item.observation}`
      );
    }

    text += "\n";
  });

  text += LINE + "\n";

  // SUBTOTAL

  let subtotal = parseMoney(
    order.subtotal ??
    order.subTotal ??
    order.sub_total
  );

  if (subtotal <= 0) {
    subtotal = calculatedSubtotal;
  }

  text += `Subtotal: R$ ${formatMoney(subtotal)}\n`;

  // ENTREGA

  if (customer.orderType === "Entrega") {
    text += "Entrega: A CONFIRMAR\n";
  } else {
    text += "Entrega: GRÁTIS\n";
  }

  // TOTAL

  let total = parseMoney(
    order.total ??
    order.totalPrice ??
    order.finalTotal
  );

  if (total <= 0) {
    total = subtotal;
  }

  text += "\n";
  text += `TOTAL: R$ ${formatMoney(total)}\n\n`;

  // PAGAMENTO

  text += "PAGAMENTO\n";
  text += LINE + "\n";

  text += wrapText(
    `Forma: ${customer.paymentMethod || ""}`
  );

  if (customer.needsChange) {
    text += `Troco para: R$ ${formatMoney(
      parseMoney(customer.cashAmount)
    )}\n`;

    text += `Troco: R$ ${formatMoney(
      parseMoney(customer.changeAmount)
    )}\n`;
  }

  text += "\n";

  // OBSERVAÇÃO

  text += "OBSERVAÇÃO\n";
  text += LINE + "\n";

  if (customer.observation) {
    text += wrapText(customer.observation);
  } else {
    text += "Nenhuma\n";
  }

  text += "\n";

  // FINAL

  text += EQUALS + "\n";
  text += center("PEDIDO RECEBIDO") + "\n";
  text += center("BLEND BURGUER 037") + "\n";
  text += EQUALS + "\n\n\n";

  return text;
}

// ===============================
// CENTRALIZAR
// ===============================

function center(text) {
  const WIDTH = 32;

  if (text.length >= WIDTH) {
    return text.substring(0, WIDTH);
  }

  const spaces = Math.floor(
    (WIDTH - text.length) / 2
  );

  return " ".repeat(spaces) + text;
}

// ===============================
// QUEBRAR TEXTO PARA 58 MM
// ===============================

function wrapText(text) {
  const WIDTH = 32;

  if (!text) {
    return "\n";
  }

  const words = String(text).split(" ");

  let line = "";
  let result = "";

  words.forEach((word) => {
    if (
      (line + " " + word).trim().length > WIDTH
    ) {
      if (line) {
        result += line + "\n";
      }

      line = word;
    } else {
      line = (line + " " + word).trim();
    }
  });

  if (line) {
    result += line + "\n";
  }

  return result;
}

// ===============================
// CONVERTER DINHEIRO
// ===============================

function parseMoney(value) {
  if (value === null || value === undefined) {
    return 0;
  }

  if (typeof value === "number") {
    return Number.isFinite(value)
      ? value
      : 0;
  }

  let text = String(value).trim();

  if (!text) {
    return 0;
  }

  text = text
    .replace(/R\$/gi, "")
    .replace(/\s/g, "")
    .replace(/[^\d,.-]/g, "");

  if (!text) {
    return 0;
  }

  if (text.includes(",")) {
    text = text.replace(/\./g, "");
    text = text.replace(",", ".");
  }

  const number = Number(text);

  return Number.isFinite(number)
    ? number
    : 0;
}

// ===============================
// FORMATAR DINHEIRO
// ===============================

function formatMoney(value) {
  return parseMoney(value)
    .toFixed(2)
    .replace(".", ",");
}

// ===============================
// IMPRIMIR EM 58 MM
// ===============================

function printText(text, callback) {
  const safeText = String(text)
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/`/g, "``");

  const powershellCommand = `
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Add-Type -AssemblyName System.Drawing

$printer = "${PRINTER_NAME}"

$text = @'
${safeText}
'@

$printJob = New-Object System.Drawing.Printing.PrintDocument

$printJob.PrinterSettings.PrinterName = $printer

if (-not $printJob.PrinterSettings.IsValid) {
    throw "Impressora não encontrada: $printer"
}

$printJob.DefaultPageSettings.Margins.Left = 0
$printJob.DefaultPageSettings.Margins.Right = 0
$printJob.DefaultPageSettings.Margins.Top = 0
$printJob.DefaultPageSettings.Margins.Bottom = 0

$printJob.add_PrintPage({
    param($sender, $e)

    # 58 mm
    # Área aproximada de impressão
    $font = New-Object System.Drawing.Font(
        "Courier New",
        8,
        [System.Drawing.FontStyle]::Regular,
        [System.Drawing.GraphicsUnit]::Point
    )

    $brush = [System.Drawing.Brushes]::Black

    $x = 3
    $y = 3
    $lineHeight = 12

    $lines = $text -split "\\n"

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
        console.error(
          "ERRO POWERSHELL:",
          stderr
        );

        callback(error);
        return;
      }

      callback(null);
    }
  );
}

// ===============================
// INICIAR SERVIDOR
// ===============================

const server = app.listen(
  PORT,
  "0.0.0.0",
  () => {
    console.log("");
    console.log(
      "========================================"
    );
    console.log(
      " BLEND BURGUER - IMPRESSÃO 58 MM"
    );
    console.log(
      "========================================"
    );

    console.log(
      `Servidor funcionando em http://127.0.0.1:${PORT}`
    );

    console.log(
      `Impressora: ${PRINTER_NAME}`
    );

    console.log(
      "Largura configurada: 58 mm"
    );

    console.log(
      "Aguardando pedidos..."
    );

    console.log("");
  }
);

server.on("error", (error) => {
  console.error(
    "ERRO NO SERVIDOR:",
    error
  );
});

// Mantém o servidor ativo
setInterval(() => {}, 1000);
