import { useMemo, useState } from "react";
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
import { deliveryRules } from "../data/delivery";

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

  const deliveryFee = useMemo(() => {
    if (orderType === "pickup") {
      return 0;
    }

    // A distância real será calculada quando conectarmos
    // o endereço a um serviço de mapas.
    return 5;
  }, [orderType]);

  const total = calculateTotal(subtotal, deliveryFee);

  const change = calculateChange(
    total,
    Number(customer.cashAmount) || 0
  );

  function updateCustomer(field, value) {
    setCustomer((current) => ({
      ...current,
      [field]: value,
    }));
  }

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

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!customer.name.trim()) {
      setError("Informe seu nome.");
      return;
    }

    if (!customer.phone.trim()) {
      setError("Informe seu WhatsApp.");
      return;
    }

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

      if (!customer.reference.trim()) {
        setError("O ponto de referência é obrigatório.");
        return;
      }
    }

    if (!customer.paymentMethod) {
      setError("Escolha a forma de pagamento.");
      return;
    }

    if (customer.paymentMethod === "Dinheiro") {
      if (customer.needsChange) {
        if (!customer.cashAmount) {
          setError("Informe o valor para o troco.");
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
    }

    const cartForMessage = cart.map((item) => ({
      ...item,
      total:
        Number(item.total) ||
        Number(item.price) * Number(item.quantity),
    }));

    const message = buildWhatsAppMessage({
      customer: {
        ...customer,
        orderType:
          orderType === "delivery"
            ? "Entrega"
            : "Retirada no local",
        changeAmount: change,
      },
      cart: cartForMessage,
      subtotal,
      deliveryFee,
      total,
    });

    const whatsappLink = createWhatsAppLink(message);

    if (!whatsappLink) {
      setError(
        "O WhatsApp ainda não foi configurado corretamente."
      );
      return;
    }

    window.location.href = whatsappLink;
  }

  return (
    <section className="checkout">
      <div className="section-heading">
        <span>FINALIZAÇÃO</span>
        <h2>Finalizar pedido</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="checkout-section">
          <h3>Como você quer receber?</h3>

          <div className="choice-grid">
            <button
              type="button"
              className={
                orderType === "delivery"
                  ? "choice active"
                  : "choice"
              }
              onClick={() => handleOrderType("delivery")}
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
              onClick={() => handleOrderType("pickup")}
            >
              🏪 Retirar no local
            </button>
          </div>
        </div>

        <div className="checkout-section">
          <h3>Seus dados</h3>

          <label>
            Nome *
            <input
              type="text"
              value={customer.name}
              onChange={(event) =>
                updateCustomer("name", event.target.value)
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
                updateCustomer("phone", event.target.value)
              }
              placeholder="(37) 99999-9999"
              autoComplete="tel"
            />
          </label>
        </div>

        {orderType === "delivery" && (
          <div className="checkout-section">
            <h3>Endereço de entrega</h3>

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

            <label>
              Bairro *
              <input
                type="text"
                value={customer.neighborhood}
                onChange={(event) =>
                  updateCustomer(
                    "neighborhood",
                    event.target.value
                  )
                }
                placeholder="Seu bairro"
              />
            </label>

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

        {orderType === "pickup" && (
          <div className="pickup-info">
            <strong>🏪 Retirada no local</strong>
            <p>
              Rua Frei Patrício de Moura, 71 — Morumbi,
              Divinópolis - MG
            </p>
          </div>
        )}

        <div className="checkout-section">
          <h3>Pagamento</h3>

          <div className="choice-grid payment-grid">
            {["Pix", "Cartão", "Dinheiro"].map((method) => (
              <button
                key={method}
                type="button"
                className={
                  customer.paymentMethod === method
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

          {customer.paymentMethod === "Dinheiro" && (
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
                      event.target.value === "sim"
                    )
                  }
                >
                  <option value="nao">Não</option>
                  <option value="sim">Sim</option>
                </select>
              </label>

              {customer.needsChange && (
                <label>
                  Troco para quanto?
                  <input
                    type="number"
                    min={total}
                    step="0.01"
                    value={customer.cashAmount}
                    onChange={(event) =>
                      updateCustomer(
                        "cashAmount",
                        event.target.value
                      )
                    }
                    placeholder={formatCurrency(total)}
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

        <div className="order-summary">
          <div>
            <span>Subtotal</span>
            <strong>{formatCurrency(subtotal)}</strong>
          </div>

          <div>
            <span>Entrega</span>
            <strong>
              {orderType === "pickup"
                ? "Grátis"
                : formatCurrency(deliveryFee)}
            </strong>
          </div>

          <div className="total-line">
            <span>Total</span>
            <strong>{formatCurrency(total)}</strong>
          </div>
        </div>

        {error && (
          <div className="checkout-error">
            {error}
          </div>
        )}

        <div className="checkout-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={onBack}
          >
            VOLTAR
          </button>

          <button
            type="submit"
            className="primary-button"
          >
            ENVIAR PEDIDO
          </button>
        </div>
      </form>
    </section>
  );
}

export default Checkout;
