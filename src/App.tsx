import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  CheckCircle2,
  Clock,
  Phone,
  MapPin,
  Instagram,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  MessageCircle,
  Sparkles,
} from 'lucide-react';
import { AppDataResponse, CartItem, Product } from './types';
import { fetchPublicData, fetchAdminData, verifyToken } from './services/api';
import { Header } from './components/Header';
import { ProductCard } from './components/ProductCard';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OperatingHoursModal } from './components/OperatingHoursModal';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { formatCurrency } from './utils/format';

export default function App() {
  const [data, setData] = useState<AppDataResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cart state persisted to localStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved =
        localStorage.getItem('mariane_concept_cart') ||
        localStorage.getItem('sabor_nordestino_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Client menu filters
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isHoursOpen, setIsHoursOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [orderSuccessToast, setOrderSuccessToast] = useState(false);

  // Admin state
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return (
      localStorage.getItem('mariane_concept_admin_token') ||
      localStorage.getItem('sabor_nordestino_admin_token') ||
      null
    );
  });
  const [isAdminView, setIsAdminView] = useState(false);
  const [adminData, setAdminData] = useState<any>(null);

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('mariane_concept_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Load public data
  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetchPublicData();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Não foi possível carregar as peças da loja.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Check if URL has /admin or #admin
    const isUrlAdmin = window.location.pathname.includes('admin') || window.location.hash.includes('admin');
    if (isUrlAdmin) {
      handleCheckAdminAccess();
    }
  }, []);

  // Admin auth check
  const handleCheckAdminAccess = async () => {
    const token =
      localStorage.getItem('mariane_concept_admin_token') ||
      localStorage.getItem('sabor_nordestino_admin_token');
    if (token) {
      const isValid = await verifyToken(token);
      if (isValid) {
        setAdminToken(token);
        try {
          const admData = await fetchAdminData(token);
          setAdminData(admData);
          setIsAdminView(true);
          return;
        } catch {
          // Token expired or invalid
        }
      }
    }
    setIsAdminLoginOpen(true);
  };

  const handleLoginSuccess = async (token: string) => {
    setAdminToken(token);
    localStorage.setItem('mariane_concept_admin_token', token);
    setIsAdminLoginOpen(false);

    try {
      const admData = await fetchAdminData(token);
      setAdminData(admData);
      setIsAdminView(true);
    } catch {
      loadData();
    }
  };

  const handleLogoutAdmin = () => {
    setAdminToken(null);
    localStorage.removeItem('mariane_concept_admin_token');
    localStorage.removeItem('sabor_nordestino_admin_token');
    setIsAdminView(false);
    setAdminData(null);
    if (window.location.hash.includes('admin')) {
      window.location.hash = '';
    }
    loadData();
  };

  // Cart operations
  const handleAddToCart = (product: Product, selectedSize?: string, selectedColor?: string) => {
    setCart((prev) => {
      const existing = prev.find(
        (item) =>
          item.product.id === product.id &&
          item.selectedSize === selectedSize &&
          item.selectedColor === selectedColor
      );
      if (existing) {
        return prev.map((item) =>
          item === existing ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1, selectedSize, selectedColor }];
    });
  };

  const handleUpdateCartQuantity = (productId: string, delta: number, selectedSize?: string) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          const matches =
            item.product.id === productId &&
            (!selectedSize || item.selectedSize === selectedSize);
          if (matches) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveFromCart = (productId: string, selectedSize?: string) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          !(item.product.id === productId && (!selectedSize || item.selectedSize === selectedSize))
      )
    );
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderCompleted = () => {
    setIsCheckoutOpen(false);
    setCart([]);
    setOrderSuccessToast(true);
    setTimeout(() => setOrderSuccessToast(false), 8000);
  };

  // Calculation values
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Refresh admin and public data
  const handleAdminRefresh = async () => {
    if (adminToken) {
      try {
        const admData = await fetchAdminData(adminToken);
        setAdminData(admData);
      } catch (err) {
        console.error(err);
      }
    }
    await loadData();
  };

  // If Admin View is active, show the complete Admin Dashboard
  if (isAdminView && adminData && adminToken) {
    return (
      <AdminDashboard
        token={adminToken}
        settings={adminData.settings || data?.settings}
        schedule={adminData.schedule || data?.schedule}
        categories={adminData.categories || data?.categories}
        products={adminData.products || data?.products}
        isOpenNow={adminData.isOpenNow}
        statusMessage={adminData.statusMessage}
        onRefreshData={handleAdminRefresh}
        onCloseAdmin={() => setIsAdminView(false)}
        onLogout={handleLogoutAdmin}
      />
    );
  }

  // Loading state
  if (isLoading && !data) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-full border-4 border-rose-200 border-t-rose-900 animate-spin mb-4" />
        <p className="text-stone-800 font-bold text-base font-['Playfair_Display']">Mariane Moreira Concept</p>
        <p className="text-stone-400 text-xs mt-1">Carregando coleção exclusiva...</p>
      </div>
    );
  }

  // Error fallback state
  if (error || !data) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
          ⚠️
        </div>
        <h2 className="font-extrabold text-stone-900 text-xl font-['Playfair_Display']">Não foi possível carregar o catálogo</h2>
        <p className="text-stone-600 text-sm max-w-md mt-2">
          {error || 'Ocorreu uma falha na conexão com o servidor da loja.'}
        </p>
        <button
          onClick={loadData}
          className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-900 text-white font-bold text-sm hover:bg-rose-950 transition-colors cursor-pointer shadow-sm"
        >
          <RefreshCw size={16} />
          <span>Tentar novamente</span>
        </button>
      </div>
    );
  }

  // Filter products by category and search
  const filteredProducts = data.products.filter((product) => {
    const matchesCategory = activeCategory === 'all' || product.categoryId === activeCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col justify-between selection:bg-rose-900 selection:text-white">
      {/* Toast notification after placing WhatsApp order */}
      {orderSuccessToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md bg-stone-950 text-white p-4 rounded-2xl shadow-2xl border border-rose-800/40 flex items-center gap-3 animate-in slide-in-from-top-4 duration-200">
          <CheckCircle2 size={24} className="text-emerald-400 shrink-0" />
          <div className="text-xs">
            <div className="font-extrabold text-sm text-white font-['Playfair_Display']">Pedido Aberto no WhatsApp!</div>
            <div className="text-stone-300">Envie a mensagem no aplicativo para confirmar as peças e combinar a entrega com a Mariane Moreira.</div>
          </div>
        </div>
      )}

      <div>
        {/* Boutique Header */}
        <Header
          settings={data.settings}
          isOpenNow={data.isOpenNow}
          statusMessage={data.statusMessage}
          cartCount={cartTotalItems}
          cartSubtotal={cartSubtotal}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenHours={() => setIsHoursOpen(true)}
          onOpenAdmin={handleCheckAdminAccess}
        />

        {/* Main Content / Collection Container */}
        <main className="max-w-6xl mx-auto px-4 py-8">
          {/* Collection Search and Categories Navigation Bar */}
          <div className="sticky top-0 z-20 bg-stone-50/95 backdrop-blur-xs pt-2 pb-4 -mx-4 px-4 border-b border-stone-200/60 mb-8 space-y-4">
            {/* Search Input */}
            <div className="relative max-w-md mx-auto sm:mx-0">
              <Search size={18} className="absolute left-3.5 top-3 text-stone-400" />
              <input
                id="search-dish-input"
                type="text"
                placeholder="Buscar vestidos, alfaiataria, linho, cropped..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm focus:outline-none focus:border-rose-900 shadow-2xs transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-xs text-stone-400 hover:text-stone-700 p-1"
                >
                  Limpar
                </button>
              )}
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeCategory === 'all'
                    ? 'bg-rose-900 text-white shadow-md shadow-rose-950/15'
                    : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                }`}
              >
                Todas as Peças ({data.products.length})
              </button>

              {data.categories.map((category) => {
                const count = data.products.filter((p) => p.categoryId === category.id).length;
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                      activeCategory === category.id
                        ? 'bg-rose-900 text-white shadow-md shadow-rose-950/15'
                        : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {category.name} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Collection Section Title */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 font-['Playfair_Display']">
                {activeCategory === 'all'
                  ? 'Nossa Coleção Exclusiva'
                  : data.categories.find((c) => c.id === activeCategory)?.name || 'Coleção'}
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
                Peças selecionadas com corte impecável, tecidos nobres e acabamento refinado
              </p>
            </div>

            <span className="text-xs font-semibold text-stone-600 bg-stone-200/70 px-3 py-1 rounded-lg">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'modelo' : 'modelos'}
            </span>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {filteredProducts.map((product) => {
              const inCartItem = cart.find((i) => i.product.id === product.id);
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  quantityInCart={inCartItem ? inCartItem.quantity : 0}
                  onAddToCart={handleAddToCart}
                  onUpdateQuantity={handleUpdateCartQuantity}
                />
              );
            })}

            {filteredProducts.length === 0 && (
              <div className="col-span-full bg-white rounded-3xl border border-stone-200 p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-800 flex items-center justify-center mx-auto mb-3">
                  <ShoppingBag size={28} />
                </div>
                <h3 className="font-bold text-stone-800 text-lg font-['Playfair_Display']">Nenhuma peça encontrada</h3>
                <p className="text-stone-500 text-xs sm:text-sm mt-1 max-w-sm mx-auto">
                  Não encontramos nenhum modelo correspondente a "{searchQuery}". Tente buscar por outros termos ou explore todas as categorias da boutique.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('all');
                  }}
                  className="mt-4 px-4 py-2 rounded-xl bg-rose-900 text-white font-semibold text-xs hover:bg-rose-950 transition-colors cursor-pointer"
                >
                  Ver Todas as Peças
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Floating Bottom Bar for Mobile / Quick Cart Access */}
      {cartTotalItems > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 lg:hidden">
          <button
            id="mobile-bottom-cart-bar"
            onClick={() => setIsCartOpen(true)}
            className="w-full py-3.5 px-5 rounded-2xl bg-stone-950 text-white font-extrabold shadow-2xl shadow-black/40 flex items-center justify-between transition-transform active:scale-98 cursor-pointer border border-stone-800"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-900 flex items-center justify-center font-black text-xs text-white">
                {cartTotalItems}
              </div>
              <div className="text-left">
                <div className="text-[11px] text-stone-400 font-medium">Ver Sacola de Compras</div>
                <div className="text-sm font-black text-white">{formatCurrency(cartSubtotal)}</div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl text-rose-200">
              <span>Finalizar</span>
              <ArrowRight size={14} />
            </div>
          </button>
        </div>
      )}

      {/* Site Footer */}
      <footer className="mt-16 bg-stone-950 text-stone-300 border-t border-stone-800">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand column */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src={data.settings.logoUrl}
                  alt={data.settings.name}
                  className="w-12 h-12 rounded-xl object-cover border border-rose-800/40"
                />
                <div>
                  <h3 className="font-extrabold text-white text-lg font-['Playfair_Display']">
                    {data.settings.name}
                  </h3>
                  <p className="text-rose-300 text-xs font-medium">{data.settings.slogan}</p>
                </div>
              </div>
              <p className="text-stone-400 text-xs leading-relaxed max-w-md">
                {data.settings.description}
              </p>
            </div>

            {/* Contacts column */}
            <div className="space-y-2">
              <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-3">
                Atendimento VIP
              </h4>
              <p className="text-xs text-stone-400 flex items-center gap-2">
                <Phone size={14} className="text-rose-400 shrink-0" />
                <a href={`tel:${data.settings.whatsapp}`} className="hover:text-white transition-colors">
                  {data.settings.phone}
                </a>
              </p>
              <p className="text-xs text-stone-400 flex items-center gap-2">
                <MessageCircle size={14} className="text-emerald-400 shrink-0" />
                <a
                  href={`https://wa.me/55${data.settings.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors font-semibold"
                >
                  WhatsApp: (11) 98664-1730
                </a>
              </p>
              <p className="text-xs text-stone-400 flex items-center gap-2">
                <MapPin size={14} className="text-rose-400 shrink-0" />
                <span>{data.settings.address}, {data.settings.neighborhood} - {data.settings.cityState}</span>
              </p>
              {data.settings.instagram && (
                <p className="text-xs text-stone-400 flex items-center gap-2">
                  <Instagram size={14} className="text-rose-400 shrink-0" />
                  <span className="font-medium text-rose-300">{data.settings.instagram}</span>
                </p>
              )}
            </div>

            {/* Operating status and admin link */}
            <div className="space-y-3">
              <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-2">
                Atendimento & Envios
              </h4>
              <button
                onClick={() => setIsHoursOpen(true)}
                className="text-left text-xs p-3 rounded-xl bg-stone-900 hover:bg-stone-850 border border-stone-800 block w-full transition-colors cursor-pointer"
              >
                <div className="font-bold text-white flex items-center gap-2 mb-1">
                  <span className={`w-2 h-2 rounded-full ${data.isOpenNow ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                  <span>{data.isOpenNow ? 'Atendimento Aberto' : 'Atendimento Offline'}</span>
                </div>
                <div className="text-stone-400 text-[11px]">{data.statusMessage}</div>
                <div className="text-rose-300 text-[11px] font-semibold mt-1">Ver horários de atendimento →</div>
              </button>

              <div className="pt-2">
                <button
                  id="footer-admin-btn"
                  onClick={handleCheckAdminAccess}
                  className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-white transition-colors cursor-pointer"
                >
                  <ShieldCheck size={14} />
                  <span>Acesso da Boutique (Área do Dono)</span>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-stone-850 text-center text-xs text-stone-500 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              © {new Date().getFullYear()} {data.settings.name}. Todos os direitos reservados.
            </div>
            <div className="text-stone-400">
              Moda feminina com entrega rápida e pedidos diretos no WhatsApp
            </div>
          </div>
        </div>
      </footer>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        deliveryFee={data.settings.deliveryFee}
        isOpenNow={data.isOpenNow}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onProceedToCheckout={handleProceedToCheckout}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        settings={data.settings}
        onOrderCompleted={handleOrderCompleted}
      />

      {/* Operating Hours Modal */}
      <OperatingHoursModal
        isOpen={isHoursOpen}
        onClose={() => setIsHoursOpen(false)}
        schedule={data.schedule}
        isOpenNow={data.isOpenNow}
        statusMessage={data.statusMessage}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
