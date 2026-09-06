import React, { useState, useEffect } from 'react';
import { X, Upload, Image as ImageIcon, AlertCircle, Sparkles } from 'lucide-react';
import { Category, Product } from '../../types';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  initialProduct?: Product | null;
  onSave: (productData: Partial<Product>) => Promise<void>;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  categories,
  initialProduct,
  onSave,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [image, setImage] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [sizesStr, setSizesStr] = useState('P, M, G');
  const [colorsStr, setColorsStr] = useState('');
  const [hasStockLimit, setHasStockLimit] = useState(false);
  const [stock, setStock] = useState('10');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialProduct) {
      setName(initialProduct.name);
      setDescription(initialProduct.description || '');
      setPrice(String(initialProduct.price));
      setCategoryId(initialProduct.categoryId || categories[0]?.id || '');
      setImage(initialProduct.image || '');
      setIsActive(initialProduct.isActive !== false);
      setFeatured(!!initialProduct.featured);
      setSizesStr(initialProduct.sizes?.join(', ') || '');
      setColorsStr(initialProduct.colors?.join(', ') || '');
      if (initialProduct.stock !== null && initialProduct.stock !== undefined) {
        setHasStockLimit(true);
        setStock(String(initialProduct.stock));
      } else {
        setHasStockLimit(false);
        setStock('10');
      }
    } else {
      setName('');
      setDescription('');
      setPrice('');
      setCategoryId(categories[0]?.id || '');
      setImage('https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80');
      setIsActive(true);
      setFeatured(false);
      setSizesStr('P, M, G');
      setColorsStr('');
      setHasStockLimit(false);
      setStock('10');
    }
    setError('');
  }, [initialProduct, categories]);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('A imagem deve ter menos de 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      if (result) {
        setImage(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('O nome da peça é obrigatório.');
      return;
    }

    const numPrice = parseFloat(price.replace(',', '.'));
    if (isNaN(numPrice) || numPrice < 0) {
      setError('Informe um preço válido.');
      return;
    }

    const sizes = sizesStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const colors = colorsStr
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    setIsSubmitting(true);
    try {
      await onSave({
        name: name.trim(),
        description: description.trim(),
        price: numPrice,
        categoryId: categoryId || categories[0]?.id || '',
        image: image.trim() || 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80',
        isActive,
        featured,
        sizes: sizes.length > 0 ? sizes : undefined,
        colors: colors.length > 0 ? colors : undefined,
        stock: hasStockLimit ? Math.max(0, parseInt(stock, 10) || 0) : null,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar peça.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden my-6 border border-stone-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-stone-950 text-white flex items-center justify-between border-b border-stone-800">
          <div>
            <h3 className="font-bold text-base text-white font-['Playfair_Display']">
              {initialProduct ? 'Editar Peça' : 'Nova Peça na Coleção'}
            </h3>
            <p className="text-xs text-stone-400">
              {initialProduct ? 'Atualize as fotos e informações da peça' : 'Adicione uma nova peça ao catálogo da boutique'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Nome da Peça / Modelo *
            </label>
            <input
              type="text"
              placeholder="Ex: Vestido Midi Linho Riviera"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-rose-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Categoria *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-rose-900 bg-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Preço (R$) *
              </label>
              <input
                type="text"
                placeholder="Ex: 289,90"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-rose-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Descrição Detalhada do Modelo
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Puro linho com decote clássico, botões forrados artesanais e caimento fluido..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-rose-900 resize-none"
            />
          </div>

          {/* Sizes and Colors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Tamanhos Disponíveis (separados por vírgula)
              </label>
              <input
                type="text"
                placeholder="Ex: P, M, G, GG ou 36, 38, 40"
                value={sizesStr}
                onChange={(e) => setSizesStr(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-rose-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Cores / Variações (separadas por vírgula)
              </label>
              <input
                type="text"
                placeholder="Ex: Off White, Terracota, Preto"
                value={colorsStr}
                onChange={(e) => setColorsStr(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-rose-900"
              />
            </div>
          </div>

          {/* Image management */}
          <div className="space-y-2 pt-2 border-t border-stone-100">
            <label className="block text-xs font-semibold text-stone-700">
              Foto da Peça
            </label>

            <div className="flex gap-3 items-center">
              <div className="w-16 h-20 rounded-xl bg-stone-100 border border-stone-200 overflow-hidden shrink-0">
                {image ? (
                  <img src={image} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-400">
                    <ImageIcon size={20} />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold cursor-pointer transition-colors border border-stone-200">
                  <Upload size={14} />
                  <span>Escolher foto da galeria</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                </label>

                <input
                  type="text"
                  placeholder="Ou cole a URL da imagem aqui"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-200 text-xs text-stone-600 focus:outline-none focus:border-rose-900"
                />
              </div>
            </div>
          </div>

          {/* Status, Featured & Stock toggles */}
          <div className="pt-2 border-t border-stone-100 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200">
                <div>
                  <span className="text-xs font-bold text-stone-800 block">Status da Peça</span>
                  <span className="text-[11px] text-stone-500">
                    {isActive ? 'Visível' : 'Oculto'}
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200">
                <div>
                  <span className="text-xs font-bold text-stone-800 block flex items-center gap-1">
                    <Sparkles size={12} className="text-amber-500" />
                    Destaque
                  </span>
                  <span className="text-[11px] text-stone-500">
                    {featured ? 'Em destaque' : 'Padrão'}
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-900"></div>
                </label>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-stone-800 block">Controle de Estoque</span>
                  <span className="text-[11px] text-stone-500">
                    {hasStockLimit ? 'Limitar peças disponíveis' : 'Sem limite'}
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasStockLimit}
                    onChange={(e) => setHasStockLimit(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-900"></div>
                </label>
              </div>

              {hasStockLimit && (
                <div className="pt-2 border-t border-stone-200 flex items-center gap-3">
                  <label className="text-xs font-semibold text-stone-700 whitespace-nowrap">
                    Peças no Estoque:
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-24 px-3 py-1.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-rose-900"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-stone-600 hover:bg-stone-100 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-rose-900 hover:bg-rose-950 text-white font-bold text-xs shadow-md transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Salvando...' : initialProduct ? 'Salvar Alterações' : 'Publicar no Catálogo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
