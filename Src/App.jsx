import { useMemo, useState } from "react";
import { ShoppingCart, Clock, Plus, Minus, Trash2 } from "lucide-react";
import { menu } from "./data/menu";
import Checkout from "./components/Checkout";
import { calculateSubtotal, formatCurrency } from "./utils/calculations";

function App() {
  const [cart, setCart] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState("ARTESANAIS");

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

  function addToCart(product) {
    setCart((currentCart) => {
      const existing = currentCart.find(
        (item) => item.id === product.id
      );

      if (existing) {
        return currentCart.map((item) =>
          item.id === product.id
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
          quantity: 1,
        },
      ];
    });
  }

  function increaseQuantity(id) {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  }

  function decreaseQuantity(id) {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function removeFromCart(id) {
    setCart((currentCart) =>
      currentCart.filter((item) => item.id !== id)
    );
  }

  if (showCheckout) {
    return (
      <div className="site">
        <header className="header">
          <div className="brand">
            <span className="brand-name">
              BLEND BURGUER
            </span>

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

  return (
    <div className="site">
      <header className="header">
        <div className="brand">
          <span className="brand-name">
            BLEND BURGUER
          </span>

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
              <span className="status-dot" />

              <span>ABERTO</span>

              <Clock size={17} />

              <span>18h às 23h30</span>
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
                  key={item.id}
                >
                  <div>
                    <h3>{item.name}</h3>

                    <span>
                      {formatCurrency(item.price)}
                    </span>
                  </div>

                  <div className="cart-controls">
                    <button
                      type="button"
                      onClick={() =>
                        decreaseQuantity(item.id)
                      }
                      aria-label="Diminuir quantidade"
                    >
                      <Minus size={16} />
                    </button>

                    <strong>{item.quantity}</strong>

                    <button
                      type="button"
                      onClick={() =>
                        increaseQuantity(item.id)
                      }
                      aria-label="Aumentar quantidade"
                    >
                      <Plus size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        removeFromCart(item.id)
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
    </div>
  );
}

export default App;
