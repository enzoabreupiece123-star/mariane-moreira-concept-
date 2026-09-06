import React, { useState } from 'react';
import {
  Sparkles,
  FolderTree,
  Clock,
  Palette,
  KeyRound,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Save,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  ShoppingBag,
} from 'lucide-react';
import { Category, DaySchedule, Product, RestaurantSettings } from '../../types';
import {
  apiChangePassword,
  apiCreateCategory,
  apiCreateProduct,
  apiDeleteCategory,
  apiDeleteProduct,
  apiUpdateCategory,
  apiUpdateProduct,
  apiUpdateSchedule,
  apiUpdateSettings,
} from '../../services/api';
import { ProductFormModal } from './ProductFormModal';
import { formatCurrency } from '../../utils/format';

interface AdminDashboardProps {
  token: string;
  settings: RestaurantSettings;
  schedule: DaySchedule[];
  categories: Category[];
  products: Product[];
  isOpenNow: boolean;
  statusMessage: string;
  onRefreshData: () => Promise<void>;
  onCloseAdmin: () => void;
  onLogout: () => void;
}

type AdminTab = 'products' | 'categories' | 'schedule' | 'settings' | 'security';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  token,
  settings,
  schedule,
  categories,
  products,
  isOpenNow,
  statusMessage,
  onRefreshData,
  onCloseAdmin,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('products');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Products state & modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Categories editing state
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');

  // Schedule editing state
  const [localSchedule, setLocalSchedule] = useState<DaySchedule[]>(schedule);

  // Settings editing state
  const [localSettings, setLocalSettings] = useState<RestaurantSettings>(settings);

  // Security password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 3500);
  };

  // Product actions
  const handleOpenNewProduct = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (productData: Partial<Product>) => {
    try {
      if (editingProduct) {
        await apiUpdateProduct(token, editingProduct.id, productData);
        showToast('Peça atualizada com sucesso!');
      } else {
        await apiCreateProduct(token, productData);
        showToast('Peça adicionada ao catálogo com sucesso!');
      }
      await onRefreshData();
    } catch (err: any) {
      showToast(err.message || 'Erro ao salvar peça', 'error');
      throw err;
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o modelo "${name}"?`)) return;
    try {
      await apiDeleteProduct(token, id);
      showToast('Peça excluída com sucesso!');
      await onRefreshData();
    } catch (err: any) {
      showToast(err.message || 'Erro ao excluir peça', 'error');
    }
  };

  const handleToggleProductActive = async (prod: Product) => {
    try {
      await apiUpdateProduct(token, prod.id, { isActive: !prod.isActive });
      showToast(`Peça ${!prod.isActive ? 'ativada' : 'pausada'} com sucesso!`);
      await onRefreshData();
    } catch (err: any) {
      showToast(err.message || 'Erro ao atualizar peça', 'error');
    }
  };

  // Category actions
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      await apiCreateCategory(token, newCategoryName.trim());
      setNewCategoryName('');
      showToast('Categoria criada com sucesso!');
      await onRefreshData();
    } catch (err: any) {
      showToast(err.message || 'Erro ao criar categoria', 'error');
    }
  };

  const handleSaveEditCategory = async (id: string) => {
    if (!editingCategoryName.trim()) return;
    try {
      await apiUpdateCategory(token, id, editingCategoryName.trim());
      setEditingCategoryId(null);
      showToast('Categoria renomeada com sucesso!');
      await onRefreshData();
    } catch (err: any) {
      showToast(err.message || 'Erro ao atualizar categoria', 'error');
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    const prodsInCat = products.filter((p) => p.categoryId === id);
    if (prodsInCat.length > 0) {
      showToast(`Não é possível excluir a categoria "${name}" pois ela possui ${prodsInCat.length} peças vinculadas.`, 'error');
      return;
    }

    if (!window.confirm(`Tem certeza que deseja excluir a categoria "${name}"?`)) return;

    try {
      await apiDeleteCategory(token, id);
      showToast('Categoria excluída com sucesso!');
      await onRefreshData();
    } catch (err: any) {
      showToast(err.message || 'Erro ao excluir categoria', 'error');
    }
  };

  // Schedule actions
  const handleScheduleToggleDay = (dayKey: DaySchedule['dayKey']) => {
    setLocalSchedule((prev) =>
      prev.map((item) => (item.dayKey === dayKey ? { ...item, isOpen: !item.isOpen } : item))
    );
  };

  const handleScheduleTimeChange = (
    dayKey: DaySchedule['dayKey'],
    field: 'openTime' | 'closeTime',
    value: string
  ) => {
    setLocalSchedule((prev) =>
      prev.map((item) => (item.dayKey === dayKey ? { ...item, [field]: value } : item))
    );
  };

  const handleSaveSchedule = async () => {
    try {
      await apiUpdateSchedule(token, localSchedule);
      showToast('Horários de atendimento atualizados com sucesso!');
      await onRefreshData();
    } catch (err: any) {
      showToast(err.message || 'Erro ao atualizar horários', 'error');
    }
  };

  // Settings actions
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiUpdateSettings(token, localSettings);
      showToast('Configurações da loja salvas com sucesso!');
      await onRefreshData();
    } catch (err: any) {
      showToast(err.message || 'Erro ao salvar configurações', 'error');
    }
  };

  // Security actions
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('A nova senha e a confirmação não conferem.', 'error');
      return;
    }
    if (newPassword.length < 4) {
      showToast('A nova senha deve conter ao menos 4 caracteres.', 'error');
      return;
    }
    try {
      await apiChangePassword(token, currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('Senha de acesso alterada com sucesso!');
    } catch (err: any) {
      showToast(err.message || 'Erro ao alterar senha', 'error');
    }
  };

  // Filtered products
  const filteredProducts = products.filter((p) => {
    const matchesCat = filterCategory === 'all' || p.categoryId === filterCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 pb-16">
      {/* Top Admin Bar */}
      <header className="bg-stone-950 text-white sticky top-0 z-30 shadow-md border-b border-stone-800">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-900 flex items-center justify-center font-bold text-white shadow-sm border border-rose-700/40">
              ✨
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-sm sm:text-base text-white font-['Playfair_Display']">Painel Boutique</h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-950 text-rose-200 font-bold border border-rose-800">
                  {settings.name}
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Atendimento: <span className="font-semibold text-white">{isOpenNow ? '🟢 Aberto' : '🔴 Fechado'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onCloseAdmin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs text-stone-200 hover:text-white transition-colors cursor-pointer border border-stone-700"
            >
              <ExternalLink size={14} />
              <span>Ver Loja Virtual</span>
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 hover:text-rose-100 text-xs font-semibold transition-colors cursor-pointer border border-rose-800/40"
              title="Sair do painel"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-t border-stone-850 max-w-6xl mx-auto px-4">
          <div className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2 scrollbar-none">
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-rose-900 text-white shadow-xs'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
              }`}
            >
              <Sparkles size={16} />
              <span>Catálogo de Peças ({products.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'categories'
                  ? 'bg-rose-900 text-white shadow-xs'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
              }`}
            >
              <FolderTree size={16} />
              <span>Categorias ({categories.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'schedule'
                  ? 'bg-rose-900 text-white shadow-xs'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
              }`}
            >
              <Clock size={16} />
              <span>Horários</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-rose-900 text-white shadow-xs'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
              }`}
            >
              <Palette size={16} />
              <span>Personalizar Loja</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'security'
                  ? 'bg-rose-900 text-white shadow-xs'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
              }`}
            >
              <KeyRound size={16} />
              <span>Segurança</span>
            </button>
          </div>
        </div>
      </header>

      {/* Floating Toast notification */}
      {feedback && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-xl border text-sm font-semibold flex items-center gap-2 animate-in slide-in-from-bottom-3 duration-200 ${
            feedback.type === 'success'
              ? 'bg-emerald-900 text-emerald-100 border-emerald-700'
              : 'bg-rose-900 text-rose-100 border-rose-700'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* =======================
            TAB 1: PEÇAS
            ======================= */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Action & Filter Header */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="w-full sm:w-auto flex-1 flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="text"
                  placeholder="Buscar modelo ou descrição..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-72 px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-rose-900"
                />

                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-rose-900 bg-white"
                >
                  <option value="all">Todas as Categorias</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                id="btn-admin-add-product"
                onClick={handleOpenNewProduct}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-900 hover:bg-rose-950 text-white font-bold text-sm shadow-md transition-all transform active:scale-98 cursor-pointer"
              >
                <Plus size={18} />
                <span>Adicionar Peça</span>
              </button>
            </div>

            {/* Products List Table / Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((prod) => {
                const catName = categories.find((c) => c.id === prod.categoryId)?.name || 'Sem categoria';
                return (
                  <div
                    key={prod.id}
                    className={`bg-white rounded-2xl border p-4 shadow-xs transition-all flex flex-col justify-between ${
                      prod.isActive ? 'border-stone-200' : 'border-stone-200 bg-stone-50/60 opacity-80'
                    }`}
                  >
                    <div>
                      <div className="flex items-start gap-3">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-16 h-20 rounded-xl object-cover bg-stone-100 shrink-0 border border-stone-100"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-900 bg-rose-50 px-2 py-0.5 rounded-md">
                              {catName}
                            </span>
                            {prod.featured && (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md">
                                Destaque
                              </span>
                            )}
                            {prod.stock !== null && (
                              <span className="text-[10px] font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md">
                                Estoque: {prod.stock}
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-stone-900 text-sm mt-1 truncate font-['Playfair_Display']">
                            {prod.name}
                          </h4>
                          <p className="text-xs font-black text-stone-900 mt-0.5">
                            {formatCurrency(prod.price)}
                          </p>
                        </div>
                      </div>

                      <p className="text-xs text-stone-500 mt-2.5 line-clamp-2 leading-relaxed">
                        {prod.description}
                      </p>

                      {prod.sizes && prod.sizes.length > 0 && (
                        <div className="mt-2 text-[11px] text-stone-600">
                          Tam: <span className="font-semibold text-stone-800">{prod.sizes.join(', ')}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                      {/* Active toggle */}
                      <button
                        onClick={() => handleToggleProductActive(prod)}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          prod.isActive
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                        }`}
                        title="Ativar ou desativar do catálogo"
                      >
                        {prod.isActive ? <Eye size={13} /> : <EyeOff size={13} />}
                        <span>{prod.isActive ? 'Ativo' : 'Pausado'}</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleEditProduct(prod)}
                          className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod.id, prod.name)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredProducts.length === 0 && (
                <div className="col-span-full bg-white p-12 rounded-2xl border border-stone-200 text-center">
                  <ShoppingBag size={36} className="mx-auto text-stone-300 mb-3" />
                  <h3 className="font-bold text-stone-800 text-base">Nenhuma peça encontrada</h3>
                  <p className="text-xs text-stone-500 mt-1">
                    Tente alterar os filtros ou adicione seu primeiro modelo exclusivo ao catálogo!
                  </p>
                  <button
                    onClick={handleOpenNewProduct}
                    className="mt-4 px-4 py-2 rounded-xl bg-rose-900 text-white text-xs font-bold hover:bg-rose-950 transition-colors cursor-pointer"
                  >
                    Adicionar Peça
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =======================
            TAB 2: CATEGORIAS
            ======================= */}
        {activeTab === 'categories' && (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Create Category form */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
              <h3 className="font-bold text-sm text-stone-900 mb-3 font-['Playfair_Display']">Criar Nova Categoria de Moda</h3>
              <form onSubmit={handleAddCategory} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ex: Vestidos, Linho Puro, Alfaiataria..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-rose-900"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-rose-900 hover:bg-rose-950 text-white font-bold text-sm shadow-xs transition-colors cursor-pointer"
                >
                  Adicionar
                </button>
              </form>
            </div>

            {/* Existing categories list */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs divide-y divide-stone-100 overflow-hidden">
              <div className="p-4 bg-stone-50 text-xs font-bold text-stone-500 uppercase tracking-wider">
                Categorias Ativas ({categories.length})
              </div>

              {categories.map((cat) => {
                const isEditing = editingCategoryId === cat.id;
                const countProducts = products.filter((p) => p.categoryId === cat.id).length;

                return (
                  <div key={cat.id} className="p-4 flex items-center justify-between gap-3">
                    {isEditing ? (
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          type="text"
                          value={editingCategoryName}
                          onChange={(e) => setEditingCategoryName(e.target.value)}
                          className="flex-1 px-3 py-1.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-rose-900"
                        />
                        <button
                          onClick={() => handleSaveEditCategory(cat.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={() => setEditingCategoryId(null)}
                          className="px-3 py-1.5 rounded-lg bg-stone-100 text-stone-600 text-xs font-semibold hover:bg-stone-200 transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-stone-900 text-sm">{cat.name}</span>
                          <span className="text-xs text-stone-400 bg-stone-100 px-2 py-0.5 rounded-md font-medium">
                            {countProducts} {countProducts === 1 ? 'peça' : 'peças'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingCategoryId(cat.id);
                              setEditingCategoryName(cat.name);
                            }}
                            className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
                            title="Editar nome"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat.id, cat.name)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Excluir categoria"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =======================
            TAB 3: HORÁRIOS DE ATENDIMENTO
            ======================= */}
        {activeTab === 'schedule' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-stone-100">
                <div>
                  <h3 className="font-bold text-base text-stone-900 font-['Playfair_Display']">Horário de Atendimento e Envios</h3>
                  <p className="text-xs text-stone-500">
                    Defina quais dias a boutique realiza atendimento online e despacho de encomendas.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                    isOpenNow ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {isOpenNow ? '🟢 Atendimento Aberto' : '🔴 Atendimento Offline'}
                  </span>
                </div>
              </div>

              <div className="divide-y divide-stone-100">
                {localSchedule.map((item) => (
                  <div key={item.dayKey} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 w-44">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.isOpen}
                          onChange={() => handleScheduleToggleDay(item.dayKey)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                      <span className="font-bold text-sm text-stone-800">{item.label}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.isOpen ? (
                        <>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-stone-500">Abre:</span>
                            <input
                              type="time"
                              value={item.openTime}
                              onChange={(e) => handleScheduleTimeChange(item.dayKey, 'openTime', e.target.value)}
                              className="px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs font-semibold focus:outline-none focus:border-rose-900"
                            />
                          </div>
                          <span className="text-stone-400">às</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-stone-500">Fecha:</span>
                            <input
                              type="time"
                              value={item.closeTime}
                              onChange={(e) => handleScheduleTimeChange(item.dayKey, 'closeTime', e.target.value)}
                              className="px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs font-semibold focus:outline-none focus:border-rose-900"
                            />
                          </div>
                        </>
                      ) : (
                        <span className="text-xs font-semibold text-rose-500 bg-rose-50 px-3 py-1 rounded-lg border border-rose-100">
                          Fechado o dia todo
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6 mt-6 border-t border-stone-200 flex justify-end">
                <button
                  onClick={handleSaveSchedule}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-rose-900 hover:bg-rose-950 text-white font-bold text-sm shadow-md transition-colors cursor-pointer"
                >
                  <Save size={16} />
                  <span>Salvar Horários</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =======================
            TAB 4: PERSONALIZAÇÃO DO SITE
            ======================= */}
        {activeTab === 'settings' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <form onSubmit={handleSaveSettings} className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs space-y-5">
              <div>
                <h3 className="font-bold text-base text-stone-900 font-['Playfair_Display']">Personalização da Boutique</h3>
                <p className="text-xs text-stone-500">
                  Altere nome, slogan, fotos, taxa de envio e WhatsApp oficial da loja.
                </p>
              </div>

              {/* Identity */}
              <div className="space-y-3 pt-3 border-t border-stone-100">
                <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">Identidade da Marca</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Nome da Loja *
                    </label>
                    <input
                      type="text"
                      value={localSettings.name}
                      onChange={(e) => setLocalSettings({ ...localSettings, name: e.target.value })}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-rose-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Slogan Curto
                    </label>
                    <input
                      type="text"
                      value={localSettings.slogan}
                      onChange={(e) => setLocalSettings({ ...localSettings, slogan: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-rose-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Apresentação Institucional
                  </label>
                  <textarea
                    rows={2}
                    value={localSettings.description}
                    onChange={(e) => setLocalSettings({ ...localSettings, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-rose-900 resize-none"
                  />
                </div>
              </div>

              {/* Visual Images (Logo and Banner) */}
              <div className="space-y-3 pt-3 border-t border-stone-100">
                <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">Imagens & Fotos da Loja</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Logo */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-stone-700">
                      Foto do Logo / Perfil
                    </label>
                    <div className="flex items-center gap-3">
                      <img
                        src={localSettings.logoUrl}
                        alt="Logo Preview"
                        className="w-14 h-14 rounded-xl object-cover border border-stone-200 bg-stone-50 shrink-0"
                      />
                      <input
                        type="text"
                        value={localSettings.logoUrl}
                        onChange={(e) => setLocalSettings({ ...localSettings, logoUrl: e.target.value })}
                        className="flex-1 px-3 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-rose-900"
                        placeholder="URL da foto do logo"
                      />
                    </div>
                  </div>

                  {/* Banner */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-stone-700">
                      Banner Principal do Topo
                    </label>
                    <div className="flex items-center gap-3">
                      <img
                        src={localSettings.bannerUrl}
                        alt="Banner Preview"
                        className="w-14 h-14 rounded-xl object-cover border border-stone-200 bg-stone-50 shrink-0"
                      />
                      <input
                        type="text"
                        value={localSettings.bannerUrl}
                        onChange={(e) => setLocalSettings({ ...localSettings, bannerUrl: e.target.value })}
                        className="flex-1 px-3 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-rose-900"
                        placeholder="URL do banner de fundo"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Contacts & Delivery */}
              <div className="space-y-3 pt-3 border-t border-stone-100">
                <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  Contatos & Envio
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      WhatsApp de Pedidos *
                    </label>
                    <input
                      type="text"
                      value={localSettings.whatsapp}
                      onChange={(e) => setLocalSettings({ ...localSettings, whatsapp: e.target.value })}
                      required
                      placeholder="Ex: 11986641730"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-rose-900"
                    />
                    <span className="text-[10px] text-stone-400">WhatsApp oficial: 11986641730</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Telefone / Atendimento
                    </label>
                    <input
                      type="text"
                      value={localSettings.phone}
                      onChange={(e) => setLocalSettings({ ...localSettings, phone: e.target.value })}
                      placeholder="(11) 98664-1730"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-rose-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Frete Fixo / Envio (R$)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={localSettings.deliveryFee}
                      onChange={(e) => setLocalSettings({ ...localSettings, deliveryFee: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-rose-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Endereço do Showroom / Loja
                    </label>
                    <input
                      type="text"
                      value={localSettings.address}
                      onChange={(e) => setLocalSettings({ ...localSettings, address: e.target.value })}
                      placeholder="Av. Paulista, 1842 - Sala 804"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-rose-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Bairro e Cidade
                    </label>
                    <input
                      type="text"
                      value={localSettings.neighborhood}
                      onChange={(e) => setLocalSettings({ ...localSettings, neighborhood: e.target.value })}
                      placeholder="Bela Vista"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-rose-900"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-stone-200 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-rose-900 hover:bg-rose-950 text-white font-bold text-sm shadow-md transition-colors cursor-pointer"
                >
                  <Save size={16} />
                  <span>Salvar Personalização</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* =======================
            TAB 5: SEGURANÇA (SENHA)
            ======================= */}
        {activeTab === 'security' && (
          <div className="max-w-md mx-auto space-y-6">
            <form onSubmit={handleChangePassword} className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
              <div>
                <h3 className="font-bold text-base text-stone-900 font-['Playfair_Display']">Alterar Senha do Administrador</h3>
                <p className="text-xs text-stone-500">
                  Mantenha o painel protegido com uma senha forte que apenas o dono conheça.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Senha Atual *
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="Senha atual (padrão: admin123)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-rose-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nova Senha *
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Mínimo 4 caracteres"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-rose-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Confirmar Nova Senha *
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Repita a nova senha"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-rose-900"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-rose-900 hover:bg-rose-950 text-white font-bold text-sm shadow-md transition-colors cursor-pointer"
                >
                  Atualizar Senha
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Product Form Modal (Add / Edit) */}
      <ProductFormModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        categories={categories}
        initialProduct={editingProduct}
        onSave={handleSaveProduct}
      />
    </div>
  );
};
