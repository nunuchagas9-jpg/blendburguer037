import { useState } from "react";

import {
  calculateChange,
  calculateTotal,
  formatCurrency,
  validateCashPayment,
} from "../utils/calculations";

import {
  buildWhatsAppMessage,
  createWhatsAppLink,
} from "../utils/whatsapp";

// ========================================
// BAIRROS E TAXAS DE ENTREGA
// ========================================
// Edite essa lista conforme suas regiões.

const bairros = [
  { nome: "Centro", taxa: 5 },
  { nome: "São José", taxa: 5 },

  { nome: "Bom Pastor", taxa: 7 },
  { nome: "Santa Clara", taxa: 7 },
  { nome: "Santa Rosa", taxa: 7 },

  { nome: "Belvedere", taxa: 9 },
  { nome: "Planalto", taxa: 9 },

  { nome: "Jardim Primavera", taxa: 12 },

  { nome: "Exemplo Bairro", taxa: 15 },
];

function Checkout({
  cart = [],
  subtotal = 0,
  onBack,
}) {
  const [orderType, setOrderType] = useState("delivery");

  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    address: "",
    number: "",
    neighborhood: "",
    reference: "",
    complement: "",
    paymentMethod: "",
    needsChange: false,
    cashAmount: "",
    observation: "",
  });

  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  // ========================================
  // BAIRRO SELECIONADO
  // ========================================

  const selectedNeighborhood = bairros.find(
    (bairro) =>
      bairro.nome.toLowerCase() ===
      customer.neighborhood.trim().toLowerCase()
  );

  // ========================================
  // TAXA DE ENTREGA
  // ========================================

  const deliveryFee =
    orderType === "delivery" &&
    selectedNeighborhood
      ? selectedNeighborhood.taxa
      : 0;

  // ========================================
  // TOTAL
  // ========================================

  const total = calculateTotal(
    subtotal,
    deliveryFee
  );

  // ========================================
  // TROCO
  // ========================================

  const change = calculateChange(
    total,
    Number(customer.cashAmount) || 0
  );

  // ========================================
  // ATUALIZAR CLIENTE
  // ========================================

  function updateCustomer(field, value) {
    setCustomer((current) => ({
      ...current,
      [field]: value,
    }));

    // Limpa o erro quando o cliente altera o campo
    if (error) {
      setError("");
    }
  }

  // ========================================
  // TIPO DO PEDIDO
  // ========================================

  function handleOrderType(type) {
    setOrderType(type);
    setError("");

    if (type === "pickup") {
      setCustomer((current) => ({
        ...current,
        address: "",
        number: "",
        neighborhood: "",
        reference: "",
        complement: "",
      }));
    }
  }

  // ========================================
  // ENVIAR PEDIDO
  // ========================================

  async function handleSubmit(event) {
    event.preventDefault();

    if (sending) {
      return;
    }

    setError("");
    setSending(true);

    try {
      // ========================================
      // VALIDAÇÕES
      // ========================================

      if (!customer.name.trim()) {
        setError("Informe seu nome.");
        return;
      }

      if (!customer.phone.trim()) {
        setError("Informe seu WhatsApp.");
        return;
      }

      // ========================================
      // VALIDAÇÃO DE ENTREGA
      // ========================================

      if (orderType === "delivery") {
        if (!customer.address.trim()) {
          setError("Informe o endereço.");
          return;
        }

        if (!customer.number.trim()) {
          setError("Informe o número.");
          return;
        }

        if (!customer.neighborhood.trim()) {
          setError("Informe o bairro.");
          return;
        }

        // Verifica se o bairro existe na lista
        if (!selectedNeighborhood) {
          setError(
            "Selecione um bairro válido da lista."
          );
          return;
        }

        if (!customer.reference.trim()) {
          setError(
            "O ponto de referência é obrigatório."
          );
          return;
        }
      }

      // ========================================
      // PAGAMENTO
      // ========================================

      if (!customer.paymentMethod) {
        setError(
          "Escolha a forma de pagamento."
        );
        return;
      }

      // ========================================
      // DINHEIRO / TROCO
      // ========================================

      if (
        customer.paymentMethod === "Dinheiro" &&
        customer.needsChange
      ) {
        if (!customer.cashAmount) {
          setError(
            "Informe o valor para o troco."
          );
          return;
        }

        if (
          !validateCashPayment(
            total,
            Number(customer.cashAmount)
          )
        ) {
          setError(
            "O valor informado para o troco precisa ser maior ou igual ao total."
          );
          return;
        }
      }

      // ========================================
      // PREPARAR ITENS
      // ========================================

      const cartForMessage = cart.map(
        (item) => ({
          ...item,
          total:
            Number(item.total) ||
            Number(item.price) *
              Number(item.quantity),
        })
      );

      // ========================================
      // DADOS DO PEDIDO
      // ========================================

      const orderData = {
        customer: {
          ...customer,

          orderType:
            orderType === "delivery"
              ? "Entrega"
              : "Retirada no local",

          changeAmount: change,

          // Nome do bairro selecionado
          neighborhood:
            orderType === "delivery"
              ? selectedNeighborhood?.nome ||
                customer.neighborhood
              : "",

          // Taxa da entrega
          deliveryFee:
            orderType === "delivery"
              ? deliveryFee
              : 0,
        },

        cart: cartForMessage,

        subtotal,

        deliveryFee,

        total,

        createdAt:
          new Date().toISOString(),
      };

      // ========================================
      // MENSAGEM DO WHATSAPP
      // ========================================

      const message =
        buildWhatsAppMessage({
          customer:
            orderData.customer,

          cart: cartForMessage,

          subtotal,

          deliveryFee,

          total,
        });

      const whatsappLink =
        createWhatsAppLink(message);

      if (!whatsappLink) {
        setError(
          "O WhatsApp ainda não foi configurado corretamente."
        );
        return;
      }

      // ========================================
      // ABRIR WHATSAPP
      // ========================================

      window.location.href = whatsappLink;
    } catch (error) {
      console.error(
        "Erro ao enviar pedido:",
        error
      );

      setError(
        "Não foi possível enviar o pedido. Tente novamente."
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="checkout">
      <div className="section-heading">
        <span>FINALIZAÇÃO</span>

        <h2>Finalizar pedido</h2>
      </div>

      <form onSubmit={handleSubmit}>

        {/* ========================================
            TIPO DO PEDIDO
        ======================================== */}

        <div className="checkout-section">
          <h3>
            Como você quer receber?
          </h3>

          <div className="choice-grid">
            <button
              type="button"
              className={
                orderType === "delivery"
                  ? "choice active"
                  : "choice"
              }
              onClick={() =>
                handleOrderType("delivery")
              }
            >
              🚚 Entrega
            </button>

            <button
              type="button"
              className={
                orderType === "pickup"
                  ? "choice active"
                  : "choice"
              }
              onClick={() =>
                handleOrderType("pickup")
              }
            >
              🏪 Retirar no local
            </button>
          </div>
        </div>

        {/* ========================================
            DADOS DO CLIENTE
        ======================================== */}

        <div className="checkout-section">
          <h3>Seus dados</h3>

          <label>
            Nome *

            <input
              type="text"
              value={customer.name}
              onChange={(event) =>
                updateCustomer(
                  "name",
                  event.target.value
                )
              }
              placeholder="Seu nome"
              autoComplete="name"
            />
          </label>

          <label>
            WhatsApp *

            <input
              type="tel"
              value={customer.phone}
              onChange={(event) =>
                updateCustomer(
                  "phone",
                  event.target.value
                )
              }
              placeholder="(37) 99999-9999"
              autoComplete="tel"
            />
          </label>
        </div>

        {/* ========================================
            ENDEREÇO DE ENTREGA
        ======================================== */}

        {orderType === "delivery" && (
          <div className="checkout-section">
            <h3>
              Endereço de entrega
            </h3>

            <label>
              Endereço *

              <input
                type="text"
                value={customer.address}
                onChange={(event) =>
                  updateCustomer(
                    "address",
                    event.target.value
                  )
                }
                placeholder="Rua / Avenida"
                autoComplete="street-address"
              />
            </label>

            <label>
              Número *

              <input
                type="text"
                value={customer.number}
                onChange={(event) =>
                  updateCustomer(
                    "number",
                    event.target.value
                  )
                }
                placeholder="Número"
              />
            </label>

            {/* ========================================
                BAIRRO COM BUSCA
            ======================================== */}

            <label>
              Bairro *

              <input
                type="text"
                list="lista-bairros"
                value={customer.neighborhood}
                onChange={(event) =>
                  updateCustomer(
                    "neighborhood",
                    event.target.value
                  )
                }
                placeholder="Digite para procurar seu bairro"
                autoComplete="off"
              />

              <datalist id="lista-bairros">
                {bairros.map((bairro) => (
                  <option
                    key={bairro.nome}
                    value={bairro.nome}
                  >
                    R${" "}
                    {bairro.taxa
                      .toFixed(2)
                      .replace(".", ",")}
                  </option>
                ))}
              </datalist>
            </label>

            {/* ========================================
                TAXA
            ======================================== */}

            <div className="pickup-info">
              <strong>
                🚚 Taxa de entrega
              </strong>

              {selectedNeighborhood ? (
                <p>
                  Entrega para{" "}
                  <strong>
                    {selectedNeighborhood.nome}
                  </strong>
                  :{" "}
                  <strong>
                    {formatCurrency(
                      selectedNeighborhood.taxa
                    )}
                  </strong>
                </p>
              ) : (
                <p>
                  Digite e selecione seu bairro
                  para calcular a entrega.
                </p>
              )}
            </div>

            <label>
              Ponto de referência *

              <input
                type="text"
                value={customer.reference}
                onChange={(event) =>
                  updateCustomer(
                    "reference",
                    event.target.value
                  )
                }
                placeholder="Ex.: perto da praça"
              />
            </label>

            <label>
              Complemento

              <input
                type="text"
                value={customer.complement}
                onChange={(event) =>
                  updateCustomer(
                    "complement",
                    event.target.value
                  )
                }
                placeholder="Apartamento, bloco etc."
              />
            </label>
          </div>
        )}

        {/* ========================================
            PAGAMENTO
        ======================================== */}

        <div className="checkout-section">
          <h3>Pagamento</h3>

          <div className="choice-grid payment-grid">
            {[
              "Pix",
              "Cartão",
              "Dinheiro",
            ].map((method) => (
              <button
                key={method}
                type="button"
                className={
                  customer.paymentMethod ===
                  method
                    ? "choice active"
                    : "choice"
                }
                onClick={() =>
                  updateCustomer(
                    "paymentMethod",
                    method
                  )
                }
              >
                {method}
              </button>
            ))}
          </div>

          {customer.paymentMethod ===
            "Dinheiro" && (
            <div className="cash-box">
              <label>
                Precisa de troco?

                <select
                  value={
                    customer.needsChange
                      ? "sim"
                      : "nao"
                  }
                  onChange={(event) =>
                    updateCustomer(
                      "needsChange",
                      event.target.value ===
                        "sim"
                    )
                  }
                >
                  <option value="nao">
                    Não
                  </option>

                  <option value="sim">
                    Sim
                  </option>
                </select>
              </label>

              {customer.needsChange && (
                <label>
                  Troco para quanto?

                  <input
                    type="number"
                    min={total}
                    step="0.01"
                    value={
                      customer.cashAmount
                    }
                    onChange={(event) =>
                      updateCustomer(
                        "cashAmount",
                        event.target.value
                      )
                    }
                    placeholder={formatCurrency(
                      total
                    )}
                  />
                </label>
              )}

              {customer.needsChange &&
                customer.cashAmount &&
                change !== null && (
                  <p className="change-result">
                    Troco:{" "}
                    <strong>
                      {formatCurrency(change)}
                    </strong>
                  </p>
                )}
            </div>
          )}
        </div>

        {/* ========================================
            OBSERVAÇÃO
        ======================================== */}

        <div className="checkout-section">
          <h3>Observação</h3>

          <textarea
            value={customer.observation}
            onChange={(event) =>
              updateCustomer(
                "observation",
                event.target.value
              )
            }
            placeholder="Alguma observação sobre o pedido?"
            rows="3"
          />
        </div>

        {/* ========================================
            RESUMO
        ======================================== */}

        <div className="order-summary">
          <div>
            <span>Subtotal</span>

            <strong>
              {formatCurrency(subtotal)}
            </strong>
          </div>

          <div>
            <span>Entrega</span>

            <strong>
              {orderType === "pickup"
                ? "Grátis"
                : selectedNeighborhood
                ? formatCurrency(
                    deliveryFee
                  )
                : "Selecione o bairro"}
            </strong>
          </div>

          <div className="total-line">
            <span>Total</span>

            <strong>
              {formatCurrency(total)}
            </strong>
          </div>
        </div>

        {/* ========================================
            ERRO
        ======================================== */}

        {error && (
          <div className="checkout-error">
            {error}
          </div>
        )}

        {/* ========================================
            BOTÕES
        ======================================== */}

        <div className="checkout-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={onBack}
            disabled={sending}
          >
            VOLTAR
          </button>

          <button
            type="submit"
            className="primary-button"
            disabled={sending}
          >
            {sending
              ? "ENVIANDO..."
              : "ENVIAR PEDIDO"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default Checkout;
