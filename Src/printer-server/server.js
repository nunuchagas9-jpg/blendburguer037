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
// REMOVER ACENTOS
// SOMENTE PARA A IMPRESSAO
// ===============================

function removeAccents(text) {
  if (text === null || text === undefined) {
    return "";
  }

  return String(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ç/g, "c")
    .replace(/Ç/g, "C")
    .replace(/[^\x20-\x7E\n\r\t]/g, "");
}

// ===============================
// QUEBRAR LINHAS GRANDES
// PARA PAPEL 58MM
// ===============================

function wrapText(text, maxLength = 42) {
  const lines = String(text).split("\n");
  const result = [];

  lines.forEach((line) => {
    if (line.length <= maxLength) {
      result.push(line);
      return;
    }

    let current = "";

    const words = line.split(" ");

    words.forEach((word) => {
      if (!current) {
        current = word;
      } else if ((current + " " + word).length <= maxLength) {
        current += " " + word;
      } else {
        result.push(current);
        current = word;
      }
    });

    if (current) {
      result.push(current);
    }
  });

  return result.join("\n");
}

// ===============================
// MONTAR CUPOM
// ===============================

function createReceipt(order) {
  const customer = order.customer || {};

  const cart = Array.isArray(order.cart)
    ? order.cart
    : [];

  let text = "";

  text += "==========================================\n";
  text += "          BLEND BURGUER 037\n";
  text += "==========================================\n\n";

  // CLIENTE

  text += "CLIENTE\n";
  text += "------------------------------------------\n";

  text += `Nome: ${customer.name || ""}\n`;
  text += `WhatsApp: ${customer.phone || ""}\n\n`;

  // ENTREGA

  if (customer.orderType === "Entrega") {
    text += "ENTREGA\n";
    text += "------------------------------------------\n";

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
  }

  // RETIRADA

  else {
    text += "RETIRADA NO LOCAL\n";
    text += "------------------------------------------\n";

    text += "Rua Frei Patricio de Moura, 71\n";
    text += "Morumbi - Divinopolis/MG\n\n";
  }

  // PEDIDO

  text += "PEDIDO\n";
  text += "------------------------------------------\n";

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

    text += `${quantity}x ${item.name || "Produto"}\n`;

    text += `R$ ${formatMoney(price)} cada\n`;

    text += `Total: R$ ${formatMoney(itemTotal)}\n`;

    // OPCAO

    if (item.selectedOption) {
      text += `Opcao: ${item.selectedOption}\n`;
    }

    // OPCOES

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

    // OBSERVACAO DO ITEM

    if (item.observation) {
      text += `Obs.: ${item.observation}\n`;
    }

    text += "\n";
  });

  text += "------------------------------------------\n";

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
    text += "Entrega: GRATIS\n";
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
  text += "------------------------------------------\n";

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

  // OBSERVACAO

  text += "OBSERVACAO\n";
  text += "------------------------------------------\n";

  text += customer.observation || "Nenhuma";

  text += "\n\n";

  // FINAL

  text += "==========================================\n";
  text += "          PEDIDO RECEBIDO\n";
  text += "          BLEND BURGUER 037\n";
  text += "==========================================\n\n\n";

  // ========================================
  // AQUI ACONTECE A CONVERSAO AUTOMATICA
  // ========================================

  text = removeAccents(text);

  // Quebra textos muito grandes para 58mm
  text = wrapText(text, 42);

  return text;
}

// ===============================
// CONVERTER DINHEIRO
// ===============================

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

  return Number.isFinite(number) ? number : 0;
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
// IMPRIMIR
// ===============================

function printText(text, callback) {

  // Remove acentos novamente por segurança
  const safeText = removeAccents(
    String(text)
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
  );

  // Converte o texto para Base64.
  // Isso evita problemas de caracteres no PowerShell.
  const textBase64 = Buffer
    .from(safeText, "utf8")
    .toString("base64");

  const powershellCommand = `
$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$printer = "${PRINTER_NAME}"

$base64 = "${textBase64}"

$bytes = [System.Convert]::FromBase64String($base64)

$text = [System.Text.Encoding]::UTF8.GetString($bytes)

$printJob = New-Object System.Drawing.Printing.PrintDocument

$printJob.PrinterSettings.PrinterName = $printer

if (-not $printJob.PrinterSettings.IsValid) {
    throw "Impressora nao encontrada: $printer"
}

$printJob.add_PrintPage({
    param($sender, $e)

    # Fonte monoespaco para impressora 58mm
    $font = New-Object System.Drawing.Font(
        "Courier New",
        8.5
    )

    $brush = [System.Drawing.Brushes]::Black

    $x = 8
    $y = 8

    # Altura da linha
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
        console.error("PowerShell:", stderr);
        callback(error);
        return;
      }

      if (stderr) {
        console.log("PowerShell:", stderr);
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
    console.log("========================================");
    console.log(" BLEND BURGUER - SERVIDOR DE IMPRESSAO");
    console.log("========================================");

    console.log(
      `Servidor funcionando em http://127.0.0.1:${PORT}`
    );

    console.log(
      `Impressora: ${PRINTER_NAME}`
    );

    console.log("Conversao automatica de acentos: ATIVA");
    console.log("Formato: 58mm");
    console.log("Fonte: Courier New");
    console.log("Nao feche esta janela.");
    console.log("");
  }
);

server.on("error", (error) => {
  console.error("ERRO NO SERVIDOR:", error);
});

// Mantém o servidor ativo
setInterval(() => {}, 1000);
