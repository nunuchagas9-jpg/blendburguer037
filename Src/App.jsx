import { useState } from "react";
import { ShoppingCart, Clock } from "lucide-react";

function App() {
  const [cartCount, setCartCount] = useState(0);

  const addToCart = () => {
    setCartCount((current) => current + 1);
  };

  return (
    <div className="site">
      <header className="header">
        <div className="brand">
          <span className="brand-name">BLEND BURGUER</span>
          <span className="brand-city">037 • DIVINÓPOLIS - MG</span>
        </div>

        <button className="cart-button" type="button">
          <ShoppingCart size={20} />
          <span>Carrinho</span>
          {cartCount > 0 && <strong>{cartCount}</strong>}
        </button>
      </header>

      <main>
        <section className="hero">
          <div className="hero-content">
            <span className="hero-label">SABOR • QUALIDADE • ATITUDE</span>

            <h1>BLEND BURGUER</h1>

            <p>Feito pra matar a fome.</p>

            <div className="store-status">
              <span className="status-dot" />
              <span>ABERTO</span>
              <Clock size={17} />
              <span>18h às 23h30</span>
            </div>

            <button className="primary-button" type="button">
              PEDIR AGORA
            </button>
          </div>
        </section>

        <section className="featured">
          <div className="section-heading">
            <span>DESTAQUE</span>
            <h2>Mais pedido</h2>
          </div>

          <article className="featured-card">
            <div className="product-info">
              <span className="popular-badge">🔥 MAIS PEDIDO</span>

              <h3>CHEDDAR BACON</h3>

              <p>
                Blend de 120g, creme de cheddar, bacon crocante,
                alface, tomate, cebola e maionese temperada.
              </p>

              <div className="product-footer">
                <strong>R$ 28,00</strong>

                <button
                  className="add-button"
                  type="button"
                  onClick={addToCart}
                >
                  ADICIONAR
                </button>
              </div>
            </div>
          </article>
        </section>

        <section className="menu-preview">
          <div className="section-heading">
            <span>ESCOLHA SEU PEDIDO</span>
            <h2>Nosso cardápio</h2>
          </div>

          <div className="categories">
            <button type="button">ARTESANAIS</button>
            <button type="button">TRADICIONAIS</button>
            <button type="button">PASTÉIS</button>
            <button type="button">ADICIONAIS</button>
            <button type="button">COMBOS</button>
            <button type="button">BEBIDAS</button>
          </div>
        </section>
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
