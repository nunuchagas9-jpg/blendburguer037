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

  const deliveryFee = useMemo(() => {
    if (orderType === "pickup") {
      return 0;
    }

    if (!customer.address.trim()) {
      return 0;
    }

    return 5;
  }, [orderType, customer.address]);

  const total = calculateTotal(
    subtotal,
    deliveryFee
  );

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

  async function handleSubmit(event) {
    event.preventDefault();

    if (sending) {
      return;
    }

    setError("");
    setSending(true);

    try {
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
          setError("Informe o endereÃ§o.");
          return;
        }

        if (!customer.number.trim()) {
          setError("Informe o nÃºmero.");
          return;
        }

        if (!customer.neighborhood.trim()) {
          setError("Informe o bairro.");
          return;
        }

        if (!customer.reference.trim()) {
          setError(
            "O ponto de referÃªncia Ã© obrigatÃ³rio."
          );
          return;
        }
      }

      if (!customer.paymentMethod) {
        setError(
          "Escolha a forma de pagamento."
        );
        return;
      }

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

      const cartForMessage = cart.map(
        (item) => ({
          ...item,
          total:
            Number(item.total) ||
            Number(item.price) *
              Number(item.quantity),
        })
      );

      const orderData = {
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

        createdAt:
          new Date().toISOString(),
      };

      /*
       * =========================================
       * MONTAR PEDIDO DO WHATSAPP
       * =========================================
       */

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
          "O WhatsApp ainda nÃ£o foi configurado corretamente."
        );
        return;
      }

      /*
       * =========================================
       * ABRIR WHATSAPP
       * =========================================
       *
       * O pedido serÃ¡ enviado para:
       * +55 37 99812-1783
       */

      window.location.href =
        whatsappLink;
    } catch (error) {
      console.error(
        "Erro ao enviar pedido:",
        error
      );

      setError(
        "NÃ£o foi possÃ­vel enviar o pedido. Tente novamente."
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="checkout">
      <div className="section-heading">
        <span>FINALIZAÃ‡ÃƒO</span>

        <h2>Finalizar pedido</h2>
      </div>

      <form onSubmit={handleSubmit}>
        {/* TIPO DO PEDIDO */}

        <div className="checkout-section">
          <h3>
            Como vocÃª quer receber?
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
                handleOrderType(
                  "delivery"
                )
              }
            >
              ðŸšš Entrega
            </button>

            <button
              type="button"
              className={
                orderType === "pickup"
                  ? "choice active"
                  : "choice"
              }
              onClick={() =>
                handleOrderType(
                  "pickup"
                )
              }
            >
              ðŸª Retirar no local
            </button>
          </div>
        </div>

        {/* DADOS DO CLIENTE */}

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

        {/* ENDEREÃ‡O */}

        {orderType === "delivery" && (
          <div className="checkout-section">
            <h3>
              EndereÃ§o de entrega
            </h3>

            <label>
              EndereÃ§o *

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
              NÃºmero *

              <input
                type="text"
                value={customer.number}
                onChange={(event) =>
                  updateCustomer(
                    "number",
                    event.target.value
                  )
                }
                placeholder="NÃºmero"
              />
            </label>

            <label>
              Bairro *

              <input
                type="text"
                value={
                  customer.neighborhood
                }
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
              Ponto de referÃªncia *

              <input
                type="text"
                value={
                  customer.reference
                }
                onChange={(event) =>
                  updateCustomer(
                    "reference",
                    event.target.value
                  )
                }
                placeholder="Ex.: perto da praÃ§a"
              />
            </label>

            <label>
              Complemento

              <input
                type="text"
                value={
                  customer.complement
                }
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

        {/* RETIRADA */}

        {orderType === "pickup" && (
          <div className="pickup-info">
            <strong>
              ðŸª Retirada no local
            </strong>

            <p>
              Rua Frei PatrÃ­cio de Moura, 71 â€”
              Morumbi, DivinÃ³polis - MG
            </p>
          </div>
        )}

        {/* PAGAMENTO */}

        <div className="checkout-section">
          <h3>Pagamento</h3>

          <div className="choice-grid payment-grid">
            {[
              "Pix",
              "CartÃ£o",
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
                    NÃ£o
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
                      {formatCurrency(
                        change
                      )}
                    </strong>
                  </p>
                )}
            </div>
          )}
        </div>

        {/* OBSERVAÃ‡ÃƒO */}

        <div className="checkout-section">
          <h3>ObservaÃ§Ã£o</h3>

          <textarea
            value={
              customer.observation
            }
            onChange={(event) =>
              updateCustomer(
                "observation",
                event.target.value
              )
            }
            placeholder="Alguma observaÃ§Ã£o sobre o pedido?"
            rows="3"
          />
        </div>

        {/* RESUMO */}

        <div className="order-summary">
          <div>
            <span>Subtotal</span>

            <strong>
              {formatCurrency(
                subtotal
              )}
            </strong>
          </div>

          <div>
            <span>Entrega</span>

            <strong>
              {orderType === "pickup"
                ? "GrÃ¡tis"
                : formatCurrency(
                    deliveryFee
                  )}
            </strong>
          </div>

          <div className="total-line">
            <span>Total</span>

            <strong>
              {formatCurrency(total)}
            </strong>
          </div>
        </div>

        {/* ERRO */}

        {error && (
          <div className="checkout-error">
            {error}
          </div>
        )}

        {/* BOTÃ•ES */}

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


