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
  // HORÁRIO DA HAMBURGUERIA
  // Sexta a domingo
  // 19:00 às 23:30
  // =========================

  const now = new Date();

  const day = now.getDay();
  const hour = now.getHours();
  const minutes = now.getMinutes();

  const currentTime = hour * 60 + minutes;

  const openingTime = 19 * 60;
  const closingTime = 23 * 60 + 30;

  const isOpen =
    (day === 5 || day === 6 || day === 0) &&
    currentTime >= openingTime &&
    currentTime <= closingTime;

  const categories = [
    "ARTESANAIS",
    "TRADICIONAIS",
    "PASTÉIS",
    "ADICIONAIS",
    "COMBOS",
    "BEBIDAS",
  ];

  const filteredProducts = menu.filter(
    (product) => product.category === selectedCategory
  );

  const subtotal = useMemo(
    () => calculateSubtotal(cart),
    [cart]
  );

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // =========================
  // ADICIONAR AO CARRINHO
  // =========================

  function addToCart(product) {
    // Se o produto tiver opções, abre a janela de escolha
    if (product.options && product.options.length > 0) {
      setSelectedProduct(product);
      setSelectedOption("");
      return;
    }

    adicionarProdutoAoCarrinho(product);
  }

  function adicionarProdutoAoCarrinho(product, option = "") {
    setCart((currentCart) => {
      const itemId = option
        ? `${product.id}-${option}`
        : product.id;

      const existing = currentCart.find(
        (item) => item.cartItemId === itemId
      );

      if (existing) {
        return currentCart.map((item) =>
          item.cartItemId === itemId
            ? {
                ...item,
                quantity: item.quantity + 1,
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
        (option) => option.required
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

  function increaseQuantity(cartItemId) {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.cartItemId === cartItemId
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  }

  function decreaseQuantity(cartItemId) {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.cartItemId === cartItemId
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function removeFromCart(cartItemId) {
    setCart((currentCart) =>
      currentCart.filter(
        (item) => item.cartItemId !== cartItemId
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
          onBack={() => setShowCheckout(false)}
        />
      </div>
    );
  }

  // =========================
  // SITE
  // =========================

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

        <button
          className="cart-button"
          type="button"
          onClick={() => setShowCheckout(true)}
        >
          <ShoppingCart size={20} />

          <span>Carrinho</span>

          {cartCount > 0 && (
            <strong>{cartCount}</strong>
          )}
        </button>
      </header>

      <main>
        <section className="hero">
          <div className="hero-content">
            <span className="hero-label">
              SABOR • QUALIDADE • ATITUDE
            </span>

            <h1>BLEND BURGUER</h1>

            <p>Feito pra matar a fome.</p>

            <div className="store-status">
              <span
                className={`status-dot ${
                  isOpen
                    ? "status-open"
                    : "status-closed"
                }`}
              />

              <span>
                {isOpen ? "ABERTO" : "FECHADO"}
              </span>

              <Clock size={17} />

              <span>
                Sexta a domingo · 19h às 23h30
              </span>
            </div>

            <button
              className="primary-button"
              type="button"
              onClick={() =>
                document
                  .getElementById("cardapio")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  })
              }
            >
              PEDIR AGORA
            </button>
          </div>
        </section>

        <section
          className="menu-preview"
          id="cardapio"
        >
          <div className="section-heading">
            <span>ESCOLHA SEU PEDIDO</span>

            <h2>Nosso cardápio</h2>
          </div>

          <div className="categories">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={
                  selectedCategory === category
                    ? "category-active"
                    : ""
                }
                onClick={() =>
                  setSelectedCategory(category)
                }
              >
                {category}
              </button>
            ))}
          </div>

          <div className="products">
            {filteredProducts.length === 0 ? (
              <div className="empty-category">
                <p>
                  Ainda não temos produtos nessa
                  categoria.
                </p>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <article
                  className="product-card"
                  key={product.id}
                >
                  {product.popular && (
                    <span className="popular-badge">
                      🔥 MAIS PEDIDO
                    </span>
                  )}

                  <h3>{product.name}</h3>

                  <p>{product.description}</p>

                  <div className="product-footer">
                    <strong>
                      {formatCurrency(product.price)}
                    </strong>

                    <button
                      className="add-button"
                      type="button"
                      onClick={() =>
                        addToCart(product)
                      }
                    >
                      ADICIONAR
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        {cart.length > 0 && (
          <section className="cart-section">
            <div className="section-heading">
              <span>SEU PEDIDO</span>

              <h2>Carrinho</h2>
            </div>

            <div className="cart-list">
              {cart.map((item) => (
                <article
                  className="cart-item"
                  key={item.cartItemId}
                >
                  <div>
                    <h3>{item.name}</h3>

                    {item.selectedOption && (
                      <small>
                        Recheio:{" "}
                        {item.selectedOption}
                      </small>
                    )}

                    <span>
                      {formatCurrency(item.price)}
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

                    <strong>{item.quantity}</strong>

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
              ))}
            </div>

            <div className="cart-total">
              <span>Subtotal</span>

              <strong>
                {formatCurrency(subtotal)}
              </strong>
            </div>

            <button
              className="primary-button"
              type="button"
              onClick={() => setShowCheckout(true)}
            >
              FINALIZAR PEDIDO
            </button>
          </section>
        )}
      </main>

      <footer className="footer">
        <strong>BLEND BURGUER</strong>

        <span>037 • DIVINÓPOLIS - MG</span>

        <span>Feito pra matar a fome.</span>
      </footer>

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
                setSelectedProduct(null);
                setSelectedOption("");
              }}
              aria-label="Fechar"
            >
              <X size={20} />
            </button>

            <h2>{selectedProduct.name}</h2>

            <p>
              {selectedProduct.options?.[0]?.name}
            </p>

            <div className="option-list">
              {selectedProduct.options?.[0]?.values.map(
                (value) => (
                  <button
                    key={value}
                    type="button"
                    className={
                      selectedOption === value
                        ? "option-selected"
                        : ""
                    }
                    onClick={() =>
                      setSelectedOption(value)
                    }
                  >
                    <span>{value}</span>

                    {selectedOption === value && (
                      <strong>✓</strong>
                    )}
                  </button>
                )
              )}
            </div>

            <button
              className="primary-button"
              type="button"
              disabled={!selectedOption}
              onClick={confirmarOpcao}
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
