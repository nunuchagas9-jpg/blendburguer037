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

  const receiptText = createReceipt(order);

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

  cart.forEach((item) => {
    const quantity = Number(item.quantity) || 1;
    const price = Number(item.price) || 0;

    const itemTotal =
      Number(item.total) ||
      price * quantity;

    text += `${quantity}x ${item.name || "Produto"}\n`;
    text += `Valor: R$ ${formatMoney(price)} cada\n`;
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

  text += `Subtotal: R$ ${formatMoney(
    order.subtotal
  )}\n`;

  if (customer.orderType === "Entrega") {
    text += "Entrega: A CONFIRMAR\n";
  } else {
    text += "Entrega: GRATIS\n";
  }

  text += "\n";

  text += `TOTAL: R$ ${formatMoney(order.total)}\n\n`;

  text += "PAGAMENTO\n";
  text += "--------------------------------\n";
  text += `Forma: ${
    customer.paymentMethod || ""
  }\n`;

  if (customer.needsChange) {
    text += `Troco para: R$ ${formatMoney(
      customer.cashAmount
    )}\n`;

    text += `Troco: R$ ${formatMoney(
      customer.changeAmount
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

function formatMoney(value) {
  return Number(value || 0)
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
  "127.0.0.1",
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