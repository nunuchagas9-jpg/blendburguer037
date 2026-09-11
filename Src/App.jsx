import { useEffect, useMemo, useState } from "react";

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
  // ========================================
  // ESTADOS
  // ========================================
  const [cart, setCart] = useState([]);
  const [showCheckout, setShowCheckout] =
    useState(false);

  const [selectedCategory, setSelectedCategory] =
    useState("ARTESANAIS");

  const [selectedProduct, setSelectedProduct] =
    useState(null);

  const [selectedOption, setSelectedOption] =
    useState("");

  const [showCash, setShowCash] =
    useState(false);

  // ========================================
  // CATEGORIAS
  // ========================================
  const categories = [
    "ARTESANAIS",
    "TRADICIONAIS",
    "DOCES",
    "ADICIONAIS",
    "COMBOS",
    "BEBIDAS",
  ];

  // ========================================
  // PRODUTOS DA CATEGORIA
  // ========================================
  const products = useMemo(() => {
    return menu.filter(
      (product) =>
        product.category === selectedCategory
    );
  }, [selectedCategory]);

  // ========================================
  // SUBTOTAL
  // ========================================
  const subtotal = useMemo(() => {
    return calculateSubtotal(cart);
  }, [cart]);

  // ========================================
  // ADICIONAR AO CARRINHO
  // ========================================
  function addToCart(product, option = "") {
    const optionText =
      typeof option === "string"
        ? option
        : "";

    const existingIndex = cart.findIndex(
      (item) =>
        item.id === product.id &&
        item.option === optionText
    );

    if (existingIndex !== -1) {
      setCart((current) =>
        current.map((item, index) =>
          index === existingIndex
            ? {
                ...item,
                quantity:
                  Number(item.quantity) + 1,
                total:
                  Number(item.price) *
                  (Number(item.quantity) + 1),
              }
            : item
        )
      );

      return;
    }

    const newItem = {
      id: product.id,
      name: product.name,
      price: Number(product.price),
      quantity: 1,
      option: optionText,
      total: Number(product.price),
    };

    setCart((current) => [
      ...current,
      newItem,
    ]);
  }

  // ========================================
  // AUMENTAR QUANTIDADE
  // ========================================
  function increaseQuantity(index) {
    setCart((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) {
          return item;
        }

        const quantity =
          Number(item.quantity) + 1;

        return {
          ...item,
          quantity,
          total:
            Number(item.price) * quantity,
        };
      })
    );
  }

  // ========================================
  // DIMINUIR QUANTIDADE
  // ========================================
  function decreaseQuantity(index) {
    setCart((current) =>
      current
        .map((item, itemIndex) => {
          if (itemIndex !== index) {
            return item;
          }

          const quantity =
            Number(item.quantity) - 1;

          return {
            ...item,
            quantity,
            total:
              Number(item.price) * quantity,
          };
        })
        .filter(
          (item) =>
            Number(item.quantity) > 0
        )
    );
  }

  // ========================================
  // REMOVER ITEM
  // ========================================
  function removeFromCart(index) {
    setCart((current) =>
      current.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    );
  }

  // ========================================
  // LIMPAR CARRINHO
  // ========================================
  function clearCart() {
    setCart([]);
  }

  // ========================================
  // ABRIR PRODUTO
  // ========================================
  function openProduct(product) {
    setSelectedProduct(product);

    if (
      product.options &&
      product.options.length > 0
    ) {
      setSelectedOption(
        product.options[0]
      );
    } else {
      setSelectedOption("");
    }
  }

  // ========================================
  // FECHAR PRODUTO
  // ========================================
  function closeProduct() {
    setSelectedProduct(null);
    setSelectedOption("");
  }

  // ========================================
  // CONFIRMAR PRODUTO
  // ========================================
  function confirmProduct() {
    if (!selectedProduct) {
      return;
    }

    addToCart(
      selectedProduct,
      selectedOption
    );

    closeProduct();
  }

  // ========================================
  // IR PARA O CHECKOUT
  // ========================================
  function goToCheckout() {
    if (cart.length === 0) {
      document
        .getElementById("cardapio")
        ?.scrollIntoView({
          behavior: "smooth",
        });

      return;
    }

    setShowCheckout(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // ========================================
  // VOLTAR DO CHECKOUT
  // ========================================
  function backToMenu() {
    setShowCheckout(false);

    setTimeout(() => {
      document
        .getElementById("carrinho")
        ?.scrollIntoView({
          behavior: "smooth",
        });
    }, 100);
  }

  // ========================================
  // CTRL + SHIFT + C
  // ========================================
  useEffect(() => {
    function handleShortcut(event) {
      if (
        event.ctrlKey &&
        event.shiftKey &&
        event.key.toLowerCase() === "c"
      ) {
        event.preventDefault();

        setShowCash((current) => !current);
      }
    }

    window.addEventListener(
      "keydown",
      handleShortcut
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleShortcut
      );
    };
  }, []);

  // ========================================
  // CHECKOUT
  // ========================================
  if (showCheckout) {
    return (
      <main className="app">

        <header className="site-header">
          <div className="header-inner">

            <img
              src={logo}
              alt="BLEND BURGUER 037"
              className="site-logo"
            />

            <button
              type="button"
              className="cart-button"
              onClick={backToMenu}
            >
              <ShoppingCart
                size={20}
              />

              Carrinho

              {cart.length > 0 && (
                <span>
                  {cart.reduce(
                    (total, item) =>
                      total +
                      Number(
                        item.quantity
                      ),
                    0
                  )}
                </span>
              )}
            </button>

          </div>
        </header>

        <Checkout
          cart={cart}
          subtotal={subtotal}
          onBack={backToMenu}
        />

      </main>
    );
  }

  // ========================================
  // SITE
  // ========================================
  return (
    <main className="app">

      {/* ========================================
          CABEÇALHO
      ======================================== */}
      <header className="site-header">

        <div className="header-inner">

          <img
            src={logo}
            alt="BLEND BURGUER 037"
            className="site-logo"
          />

          <div className="header-actions">

            <div className="header-hours">
              <Clock size={16} />
              <span>
                Sex a Dom • 19h às 23h
              </span>
            </div>

            <button
              type="button"
              className="cart-button"
              onClick={goToCheckout}
            >
              <ShoppingCart
                size={20}
              />

              Carrinho

              {cart.length > 0 && (
                <span>
                  {cart.reduce(
                    (total, item) =>
                      total +
                      Number(
                        item.quantity
                      ),
                    0
                  )}
                </span>
              )}
            </button>

          </div>

        </div>

      </header>

      {/* ========================================
          HERO
      ======================================== */}
      <section className="hero">

        <div className="hero-content">

          <span className="hero-label">
            DIVINÓPOLIS - MG
          </span>

          <h1>
            BLEND BURGUER
          </h1>

          <p>
            Feito pra matar a fome.
          </p>

          <strong>
            SABOR. QUALIDADE • ATITUDE
          </strong>

        </div>

      </section>

      {/* ========================================
          CARDÁPIO
      ======================================== */}
      <section
        id="cardapio"
        className="menu-section"
      >

        <div className="section-heading">

          <span>
            NOSSO CARDÁPIO
          </span>

          <h2>
            Escolha seu pedido
          </h2>

        </div>

        {/* ========================================
            CATEGORIAS
        ======================================== */}
        <div className="category-list">

          {categories.map(
            (category) => (

              <button
                key={category}
                type="button"
                className={
                  selectedCategory ===
                  category
                    ? "category-button active"
                    : "category-button"
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

        {/* ========================================
            PRODUTOS
        ======================================== */}
        <div className="products-grid">

          {products.map(
            (product) => (

              <article
                key={product.id}
                className="product-card"
              >

                <div className="product-info">

                  {product.popular && (
                    <span className="popular-badge">
                      MAIS PEDIDO
                    </span>
                  )}

                  <h3>
                    {product.name}
                  </h3>

                  {product.description && (
                    <p>
                      {product.description}
                    </p>
                  )}

                  <strong className="product-price">
                    {formatCurrency(
                      product.price
                    )}
                  </strong>

                </div>

                <button
                  type="button"
                  className="add-button"
                  onClick={() => {

                    if (
                      product.options &&
                      product.options.length >
                        0
                    ) {
                      openProduct(product);
                    } else {
                      addToCart(product);
                    }

                  }}
                >
                  <Plus size={18} />

                  ADICIONAR
                </button>

              </article>

            )
          )}

        </div>

      </section>

      {/* ========================================
          CARRINHO
      ======================================== */}
      {cart.length > 0 && (

        <section
          id="carrinho"
          className="cart-section"
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
              (item, index) => (

                <div
                  key={`${item.id}-${item.option}-${index}`}
                  className="cart-item"
                >

                  <div className="cart-item-info">

                    <h3>
                      {item.name}
                    </h3>

                    {item.option && (
                      <p>
                        {item.option}
                      </p>
                    )}

                    <strong>
                      {formatCurrency(
                        item.price
                      )}
                    </strong>

                  </div>

                  <div className="cart-item-actions">

                    <button
                      type="button"
                      onClick={() =>
                        decreaseQuantity(
                          index
                        )
                      }
                    >
                      <Minus size={16} />
                    </button>

                    <span>
                      {item.quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        increaseQuantity(
                          index
                        )
                      }
                    >
                      <Plus size={16} />
                    </button>

                    <button
                      type="button"
                      className="remove-button"
                      onClick={() =>
                        removeFromCart(
                          index
                        )
                      }
                    >
                      <Trash2
                        size={18}
                      />
                    </button>

                  </div>

                </div>

              )
            )}

          </div>

          {/* ========================================
              TOTAL DO CARRINHO
          ======================================== */}
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

          <div className="cart-actions">

            <button
              type="button"
              className="secondary-button"
              onClick={clearCart}
            >
              LIMPAR CARRINHO
            </button>

            <button
              type="button"
              className="primary-button"
              onClick={goToCheckout}
            >
              FINALIZAR PEDIDO
            </button>

          </div>

        </section>

      )}

      {/* ========================================
          BARRA FIXA DO CARRINHO
      ======================================== */}
      {cart.length > 0 && (

        <div className="floating-cart">

          <div>
            <span>
              {cart.reduce(
                (total, item) =>
                  total +
                  Number(
                    item.quantity
                  ),
                0
              )}{" "}
              item(ns)
            </span>

            <strong>
              {formatCurrency(
                subtotal
              )}
            </strong>
          </div>

          <button
            type="button"
            onClick={goToCheckout}
          >
            FINALIZAR
          </button>

        </div>

      )}

      {/* ========================================
          CAIXA DO DIA
          
          ATENÇÃO:
          Sem banco online, esta área NÃO
          recebe automaticamente os pedidos
          feitos pelo celular do cliente.
          
          Ela fica disponível para você usar
          futuramente.
      ======================================== */}
      {showCash && (

        <section className="cash-control">

          <div className="cash-control-header">

            <div>
              <span>
                CONTROLE INTERNO
              </span>

              <h2>
                Caixa do Dia
              </h2>
            </div>

            <button
              type="button"
              onClick={() =>
                setShowCash(false)
              }
            >
              <X size={20} />
            </button>

          </div>

          <div className="cash-empty">

            <strong>
              Caixa automático
            </strong>

            <p>
              O caixa ainda não está
              conectado aos pedidos do
              WhatsApp.
            </p>

            <p>
              Os pedidos são enviados
              diretamente para o WhatsApp
              da BLEND BURGUER 037.
            </p>

          </div>

        </section>

      )}

      {/* ========================================
          RODAPÉ
      ======================================== */}
      <footer className="site-footer">

        <img
          src={logo}
          alt="BLEND BURGUER 037"
          className="footer-logo"
        />

        <p>
          Feito pra matar a fome.
        </p>

        <span>
          Divinópolis - MG
        </span>

      </footer>

      {/* ========================================
          MODAL DE OPÇÃO
      ======================================== */}
      {selectedProduct && (

        <div
          className="modal-overlay"
          onClick={closeProduct}
        >

          <div
            className="product-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              type="button"
              className="modal-close"
              onClick={closeProduct}
            >
              <X size={20} />
            </button>

            <h2>
              {selectedProduct.name}
            </h2>

            {selectedProduct.description && (
              <p>
                {selectedProduct.description}
              </p>
            )}

            <strong>
              {formatCurrency(
                selectedProduct.price
              )}
            </strong>

            {selectedProduct.options &&
              selectedProduct.options.length >
                0 && (

              <div className="modal-options">

                <h3>
                  Escolha uma opção
                </h3>

                {selectedProduct.options.map(
                  (option) => (

                    <button
                      key={option}
                      type="button"
                      className={
                        selectedOption ===
                        option
                          ? "choice active"
                          : "choice"
                      }
                      onClick={() =>
                        setSelectedOption(
                          option
                        )
                      }
                    >
                      {option}
                    </button>

                  )
                )}

              </div>

            )}

            <button
              type="button"
              className="primary-button modal-add"
              onClick={confirmProduct}
            >
              ADICIONAR AO CARRINHO
            </button>

          </div>

        </div>

      )}

    </main>
  );
}

export default App;
