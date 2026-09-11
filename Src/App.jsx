import { useMemo, useState } from "react";
import {
  ShoppingCart,
  Clock,
  Plus,
  Minus,
  Trash2,
  X,
} from "lucide-react";

import { menu } from "./Data/menu";
import Checkout from "./components/Checkout";
import {
  calculateSubtotal,
  formatCurrency,
} from "./utils/calculations";

import logo from "./IMG_6208.png";

function App() {
  const [cart, setCart] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState("ARTESANAIS");

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedOption, setSelectedOption] = useState("");

  // =========================
  // CAIXA DO DIA
  // =========================

  const hoje = new Date().toISOString().split("T")[0];

  const dadosCaixaSalvos = JSON.parse(
    localStorage.getItem("blend-caixa") || "{}"
  );

  const caixaInicial =
    dadosCaixaSalvos.data === hoje
      ? dadosCaixaSalvos
      : {
          data: hoje,
          dinheiro: "",
          pix: "",
          cartao: "",
          taxas: {
            3: 0,
            5: 0,
            7: 0,
            9: 0,
            10: 0,
            12: 0,
            15: 0,
          },
        };

  const [caixa, setCaixa] = useState(caixaInicial);
  const [mostrarCaixa, setMostrarCaixa] = useState(false);

  function atualizarCaixa(campo, valor) {
    const novoCaixa = {
      ...caixa,
      [campo]: valor,
    };

    setCaixa(novoCaixa);

    localStorage.setItem(
      "blend-caixa",
      JSON.stringify(novoCaixa)
    );
  }

  function atualizarTaxa(taxa, quantidade) {
    const novoCaixa = {
      ...caixa,
      taxas: {
        ...caixa.taxas,
        [taxa]: quantidade,
      },
    };

    setCaixa(novoCaixa);

    localStorage.setItem(
      "blend-caixa",
      JSON.stringify(novoCaixa)
    );
  }

  const totalDinheiro =
    Number(caixa.dinheiro) || 0;

  const totalPix =
    Number(caixa.pix) || 0;

  const totalCartao =
    Number(caixa.cartao) || 0;

  const totalVendas =
    totalDinheiro +
    totalPix +
    totalCartao;

  const totalTaxas = Object.entries(
    caixa.taxas
  ).reduce(
    (total, [taxa, quantidade]) =>
      total +
      Number(taxa) *
        Number(quantidade || 0),
    0
  );

  function copiarResumo() {
    const resumo = `RESUMO DE VENDAS — BLEND BURGUER 037
Data: ${new Date().toLocaleDateString(
      "pt-BR"
    )}

DINHEIRO: ${formatCurrency(
      totalDinheiro
    )}
PIX: ${formatCurrency(totalPix)}
CARTÃO: ${formatCurrency(
      totalCartao
    )}

TOTAL DE VENDAS: ${formatCurrency(
      totalVendas
    )}

TAXAS DE ENTREGA
R$ 3,00 — ${caixa.taxas[3]} entregas
R$ 5,00 — ${caixa.taxas[5]} entregas
R$ 7,00 — ${caixa.taxas[7]} entregas
R$ 9,00 — ${caixa.taxas[9]} entregas
R$ 10,00 — ${caixa.taxas[10]} entregas
R$ 12,00 — ${caixa.taxas[12]} entregas
R$ 15,00 — ${caixa.taxas[15]} entregas

TOTAL DE TAXAS: ${formatCurrency(
      totalTaxas
    )}`;

    navigator.clipboard
      .writeText(resumo)
      .then(() => {
        alert("Resumo copiado!");
      })
      .catch(() => {
        alert(
          "Não foi possível copiar automaticamente."
        );
      });
  }

  // =========================
  // HORÁRIO
  // SEXTA E SÁBADO
  // 19:00 ÀS 23:00
  // =========================

  const now = new Date();

  const day = now.getDay();
  const hour = now.getHours();
  const minutes = now.getMinutes();

  const currentTime =
    hour * 60 + minutes;

  const openingTime = 19 * 60;
  const closingTime = 23 * 60;

  const isOpen =
    (day === 5 || day === 6) &&
    currentTime >= openingTime &&
    currentTime <= closingTime;

  // =========================
  // CATEGORIAS
  // =========================

  const categories = [
    "ARTESANAIS",
    "TRADICIONAIS",
    "DOCES",
    "ADICIONAIS",
    "COMBOS",
    "BEBIDAS",
  ];

  const filteredProducts = menu.filter(
    (product) =>
      product.category ===
      selectedCategory
  );

  // =========================
  // TOTAL DO CARRINHO
  // =========================

  const subtotal = useMemo(
    () => calculateSubtotal(cart),
    [cart]
  );

  const cartCount = cart.reduce(
    (total, item) =>
      total + item.quantity,
    0
  );

  // =========================
  // IR PARA O CARRINHO
  // =========================

  function irParaCarrinho() {
    if (cart.length === 0) {
      document
        .getElementById("cardapio")
        ?.scrollIntoView({
          behavior: "smooth",
        });

      return;
    }

    document
      .getElementById("carrinho")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  }

  // =========================
  // ADICIONAR AO CARRINHO
  // =========================

  function addToCart(product) {
    if (
      product.options &&
      product.options.length > 0
    ) {
      setSelectedProduct(product);
      setSelectedOption("");
      return;
    }

    adicionarProdutoAoCarrinho(product);
  }

  function adicionarProdutoAoCarrinho(
    product,
    option = ""
  ) {
    setCart((currentCart) => {
      const itemId = option
        ? `${product.id}-${option}`
        : product.id;

      const existing =
        currentCart.find(
          (item) =>
            item.cartItemId === itemId
        );

      if (existing) {
        return currentCart.map(
          (item) =>
            item.cartItemId === itemId
              ? {
                  ...item,
                  quantity:
                    item.quantity + 1,
                }
              : item
        );
      }

      return [
        ...currentCart,
        {
          ...product,
          cartItemId: itemId,
          quantity: 1,
          selectedOption: option,
        },
      ];
    });
  }

  function confirmarOpcao() {
    if (!selectedProduct) return;

    if (
      selectedProduct.options?.some(
        (option) =>
          option.required
      ) &&
      !selectedOption
    ) {
      return;
    }

    adicionarProdutoAoCarrinho(
      selectedProduct,
      selectedOption
    );

    setSelectedProduct(null);
    setSelectedOption("");
  }

  // =========================
  // QUANTIDADE
  // =========================

  function increaseQuantity(
    cartItemId
  ) {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.cartItemId ===
        cartItemId
          ? {
              ...item,
              quantity:
                item.quantity + 1,
            }
          : item
      )
    );
  }

  function decreaseQuantity(
    cartItemId
  ) {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.cartItemId ===
          cartItemId
            ? {
                ...item,
                quantity:
                  item.quantity - 1,
              }
            : item
        )
        .filter(
          (item) =>
            item.quantity > 0
        )
    );
  }

  function removeFromCart(
    cartItemId
  ) {
    setCart((currentCart) =>
      currentCart.filter(
        (item) =>
          item.cartItemId !==
          cartItemId
      )
    );
  }

  // =========================
  // CHECKOUT
  // =========================

  if (showCheckout) {
    return (
      <div className="site">

        <header className="header">

          <div className="brand">

            <img
              src={logo}
              alt="Blend Burguer"
              className="brand-logo"
            />

            <span className="brand-city">
              037 • DIVINÓPOLIS - MG
            </span>

          </div>

        </header>

        <Checkout
          cart={cart}
          subtotal={subtotal}
          onBack={() =>
            setShowCheckout(false)
          }
        />

      </div>
    );
  }

  // =========================
  // SITE
  // =========================

  return (
    <div className="site">

      {/* =========================
          CABEÇALHO
      ========================= */}

      <header className="header">

        <div className="brand">

          <img
            src={logo}
            alt="Blend Burguer"
            className="brand-logo"
          />

          <span className="brand-city">
            037 • DIVINÓPOLIS - MG
          </span>

        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >

          <button
            className="caixa-button"
            type="button"
            onClick={() =>
              setMostrarCaixa(true)
            }
          >
            CAIXA
          </button>

          <button
            className="cart-button"
            type="button"
            onClick={irParaCarrinho}
          >

            <ShoppingCart size={20} />

            <span>
              Carrinho
            </span>

            {cartCount > 0 && (
              <strong>
                {cartCount}
              </strong>
            )}

          </button>

        </div>

      </header>

      <main>

        {/* =========================
            HERO
        ========================= */}

        <section className="hero">

          <div className="hero-content">

            <span className="hero-label">
              SABOR • QUALIDADE • ATITUDE
            </span>

            <h1>
              BLEND BURGUER
            </h1>

            <p>
              Feito pra matar a fome.
            </p>

            <div className="store-status">

              <span
                className={`status-dot ${
                  isOpen
                    ? "status-open"
                    : "status-closed"
                }`}
              />

              <span>
                {isOpen
                  ? "ABERTO"
                  : "FECHADO"}
              </span>

              <Clock size={17} />

              <span>
                Sexta e Sábado -
                19h às 23h00
              </span>

            </div>

            <button
              className="primary-button"
              type="button"
              onClick={() =>
                document
                  .getElementById(
                    "cardapio"
                  )
                  ?.scrollIntoView({
                    behavior:
                      "smooth",
                  })
              }
            >
              PEDIR AGORA
            </button>

          </div>

        </section>

        {/* =========================
            CARDÁPIO
        ========================= */}

        <section
          className="menu-preview"
          id="cardapio"
        >

          <div className="section-heading">

            <span>
              ESCOLHA SEU PEDIDO
            </span>

            <h2>
              Nosso cardápio
            </h2>

          </div>

          <div className="categories">

            {categories.map(
              (category) => (

                <button
                  key={category}
                  type="button"
                  className={
                    selectedCategory ===
                    category
                      ? "category-active"
                      : ""
                  }
                  onClick={() =>
                    setSelectedCategory(
                      category
                    )
                  }
                >
                  {category}
                </button>

              )
            )}

          </div>

          <div className="products">

            {filteredProducts.length ===
            0 ? (

              <div className="empty-category">

                <p>
                  Ainda não temos
                  produtos nessa
                  categoria.
                </p>

              </div>

            ) : (

              filteredProducts.map(
                (product) => (

                  <article
                    className="product-card"
                    key={product.id}
                  >

                    <div className="product-image">

                      {product.image ? (

                        <img
                          src={product.image}
                          alt={product.name}
                        />

                      ) : (

                        <div className="image-placeholder">
                          <span>
                            FOTO
                          </span>
                        </div>

                      )}

                    </div>

                    {product.popular && (

                      <span className="popular-badge">
                        MAIS PEDIDO
                      </span>

                    )}

                    <h3>
                      {product.name}
                    </h3>

                    <p>
                      {product.description}
                    </p>

                    <div className="product-footer">

                      <strong>
                        {formatCurrency(
                          product.price
                        )}
                      </strong>

                      <button
                        className="add-button"
                        type="button"
                        onClick={() =>
                          addToCart(
                            product
                          )
                        }
                      >
                        ADICIONAR
                      </button>

                    </div>

                  </article>

                )
              )

            )}

          </div>

        </section>

        {/* =========================
            CARRINHO
        ========================= */}

        {cart.length > 0 && (

          <section
            className="cart-section"
            id="carrinho"
          >

            <div className="section-heading">

              <span>
                SEU PEDIDO
              </span>

              <h2>
                Carrinho
              </h2>

            </div>

            <div className="cart-list">

              {cart.map(
                (item) => (

                  <article
                    className="cart-item"
                    key={item.cartItemId}
                  >

                    <div>

                      <h3>
                        {item.name}
                      </h3>

                      {item.selectedOption && (

                        <small>
                          Recheio:{" "}
                          {item.selectedOption}
                        </small>

                      )}

                      <span>
                        {formatCurrency(
                          item.price
                        )}
                      </span>

                    </div>

                    <div className="cart-controls">

                      <button
                        type="button"
                        onClick={() =>
                          decreaseQuantity(
                            item.cartItemId
                          )
                        }
                        aria-label="Diminuir quantidade"
                      >
                        <Minus size={16} />
                      </button>

                      <strong>
                        {item.quantity}
                      </strong>

                      <button
                        type="button"
                        onClick={() =>
                          increaseQuantity(
                            item.cartItemId
                          )
                        }
                        aria-label="Aumentar quantidade"
                      >
                        <Plus size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          removeFromCart(
                            item.cartItemId
                          )
                        }
                        aria-label="Remover produto"
                      >
                        <Trash2 size={16} />
                      </button>

                    </div>

                  </article>

                )
              )}

            </div>

            <div className="cart-total">

              <span>
                Subtotal
              </span>

              <strong>
                {formatCurrency(
                  subtotal
                )}
              </strong>

            </div>

            <button
              className="primary-button"
              type="button"
              onClick={() =>
                setShowCheckout(true)
              }
            >
              FINALIZAR PEDIDO
            </button>

          </section>

        )}

        {/* =========================
            CAIXA DO DIA
        ========================= */}

        {mostrarCaixa && (

          <section className="caixa-section">

            <div className="caixa-header">

              <div className="section-heading">

                <span>
                  CONTROLE DO DIA
                </span>

                <h2>
                  Resumo de Vendas
                </h2>

              </div>

              <button
                className="caixa-fechar"
                type="button"
                onClick={() =>
                  setMostrarCaixa(false)
                }
                aria-label="Fechar caixa"
              >
                <X size={20} />
              </button>

            </div>

            <p className="caixa-data">
              Data:{" "}
              <strong>
                {new Date().toLocaleDateString(
                  "pt-BR"
                )}
              </strong>
            </p>

            <div className="caixa-vendas">

              <label>
                💵 DINHEIRO

                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={caixa.dinheiro}
                  onChange={(e) =>
                    atualizarCaixa(
                      "dinheiro",
                      e.target.value
                    )
                  }
                />

              </label>

              <label>
                📱 PIX

                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={caixa.pix}
                  onChange={(e) =>
                    atualizarCaixa(
                      "pix",
                      e.target.value
                    )
                  }
                />

              </label>

              <label>
                💳 CARTÃO

                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={caixa.cartao}
                  onChange={(e) =>
                    atualizarCaixa(
                      "cartao",
                      e.target.value
                    )
                  }
                />

              </label>

            </div>

            <div className="caixa-total">

              <span>
                TOTAL DE VENDAS
              </span>

              <strong>
                {formatCurrency(
                  totalVendas
                )}
              </strong>

            </div>

            <div className="caixa-taxas">

              <h3>
                🚴 TAXAS DE ENTREGA
              </h3>

              {[3, 5, 7, 9, 10, 12, 15].map(
                (taxa) => (

                  <div
                    className="taxa-linha"
                    key={taxa}
                  >

                    <strong>
                      R${" "}
                      {taxa
                        .toFixed(2)
                        .replace(
                          ".",
                          ","
                        )}
                    </strong>

                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={
                        caixa.taxas[
                          taxa
                        ]
                      }
                      onChange={(e) =>
                        atualizarTaxa(
                          taxa,
                          e.target.value
                        )
                      }
                    />

                    <span>
                      entregas
                    </span>

                  </div>

                )
              )}

              <div className="taxa-total">

                <span>
                  TOTAL DE TAXAS
                </span>

                <strong>
                  {formatCurrency(
                    totalTaxas
                  )}
                </strong>

              </div>

            </div>

            <div className="caixa-botoes">

              <button
                className="primary-button"
                type="button"
                onClick={copiarResumo}
              >
                📋 COPIAR RESUMO
              </button>

              <button
                className="secondary-button"
                type="button"
                onClick={() =>
                  window.print()
                }
              >
                🖨️ IMPRIMIR RESUMO
              </button>

            </div>

          </section>

        )}

      </main>

      {/* =========================
          RODAPÉ
      ========================= */}

      <footer className="footer">

        <strong>
          BLEND BURGUER
        </strong>

        <span>
          037 • DIVINÓPOLIS - MG
        </span>

        <span>
          Feito pra matar a fome.
        </span>

      </footer>

      {/* =========================
          CARRINHO FIXO
      ========================= */}

      {cart.length > 0 &&
        !showCheckout && (

          <button
            className="floating-cart"
            type="button"
            onClick={irParaCarrinho}
          >

            <div className="floating-cart-icon">

              <ShoppingCart size={20} />

              <strong>
                {cartCount}
              </strong>

            </div>

            <div className="floating-cart-info">

              <span>
                VER CARRINHO
              </span>

              <strong>
                {formatCurrency(
                  subtotal
                )}
              </strong>

            </div>

            <span className="floating-cart-arrow">
              →
            </span>

          </button>

        )}

      {/* =========================
          MODAL DE OPÇÕES
      ========================= */}

      {selectedProduct && (

        <div className="option-overlay">

          <div className="option-modal">

            <button
              className="option-close"
              type="button"
              onClick={() => {
                setSelectedProduct(
                  null
                );
                setSelectedOption("");
              }}
              aria-label="Fechar"
            >
              <X size={20} />
            </button>

            <h2>
              {selectedProduct.name}
            </h2>

            <p>
              {
                selectedProduct
                  .options?.[0]?.name
              }
            </p>

            <div className="option-list">

              {selectedProduct
                .options?.[0]?.values.map(
                  (value) => (

                    <button
                      key={value}
                      type="button"
                      className={
                        selectedOption ===
                        value
                          ? "option-selected"
                          : ""
                      }
                      onClick={() =>
                        setSelectedOption(
                          value
                        )
                      }
                    >

                      <span>
                        {value}
                      </span>

                      {selectedOption ===
                        value && (

                        <strong>
                          ✓
                        </strong>

                      )}

                    </button>

                  )
                )}

            </div>

            <button
              className="primary-button"
              type="button"
              disabled={
                !selectedOption
              }
              onClick={
                confirmarOpcao
              }
            >
              ADICIONAR AO CARRINHO
            </button>

          </div>

        </div>

      )}

    </div>
  );
}

export default App;
