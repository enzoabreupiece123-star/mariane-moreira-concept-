import React, { useState } from 'react';
import { Plus, Minus, ShoppingBag, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { formatCurrency } from '../utils/format';

interface ProductCardProps {
  product: Product;
  quantityInCart: number;
  onAddToCart: (product: Product, selectedSize?: string, selectedColor?: string) => void;
  onUpdateQuantity: (productId: string, delta: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  quantityInCart,
  onAddToCart,
  onUpdateQuantity,
}) => {
  const isOutOfStock = product.stock !== null && product.stock <= 0;
  const isLowStock = product.stock !== null && product.stock > 0 && product.stock <= 4;

  const [selectedSize, setSelectedSize] = useState<string>(() => {
    return product.sizes && product.sizes.length > 0 ? product.sizes[0] : '';
  });

  return (
    <div
      id={`product-card-${product.id}`}
      className="group bg-white rounded-2xl border border-stone-200 shadow-xs hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between"
    >
      <div>
        {/* Product Image */}
        <div className="relative h-64 sm:h-72 w-full bg-stone-100 overflow-hidden">
          <img
            src={product.image || 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80'}
            alt={product.name}
            loading="lazy"
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out ${
              isOutOfStock ? 'grayscale opacity-60' : ''
            }`}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80';
            }}
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.featured && (
              <span className="px-2.5 py-1 rounded-full bg-stone-950/90 text-amber-200 text-[11px] font-bold tracking-wide uppercase shadow-sm backdrop-blur-xs flex items-center gap-1 border border-amber-400/30">
                <Sparkles size={10} className="text-amber-300" />
                Destaque
              </span>
            )}
            {isOutOfStock && (
              <span className="px-2.5 py-1 rounded-full bg-rose-700 text-white text-xs font-bold shadow-xs">
                Esgotado
              </span>
            )}
            {!isOutOfStock && isLowStock && (
              <span className="px-2.5 py-1 rounded-full bg-amber-600 text-white text-[11px] font-semibold shadow-xs">
                Últimas {product.stock} peças
              </span>
            )}
          </div>

          {quantityInCart > 0 && (
            <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-rose-900 text-white text-xs font-extrabold shadow-md flex items-center gap-1.5 border border-rose-700">
              <ShoppingBag size={12} />
              <span>{quantityInCart} na sacola</span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4 sm:p-5">
          <h3 className="font-bold text-stone-900 text-base sm:text-lg leading-snug group-hover:text-rose-900 transition-colors font-['Playfair_Display']">
            {product.name}
          </h3>
          <p className="text-stone-600 text-xs sm:text-sm mt-1.5 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          {/* Sizes picker if clothing item has sizes */}
          {product.sizes && product.sizes.length > 0 && !isOutOfStock && (
            <div className="mt-3 pt-3 border-t border-stone-100 flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider">Tam:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedSize === size
                        ? 'bg-rose-900 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Colors display */}
          {product.colors && product.colors.length > 0 && (
            <div className="mt-2 text-[11px] text-stone-600">
              Cores: <span className="text-stone-700 font-medium">{product.colors.join(' • ')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer: Price & Action */}
      <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-3 flex items-center justify-between gap-3 border-t border-stone-100">
        <div>
          <span className="text-[11px] text-stone-600 font-medium block uppercase tracking-wider">Valor</span>
          <span className="text-lg sm:text-xl font-extrabold text-stone-900">
            {formatCurrency(product.price)}
          </span>
        </div>

        <div>
          {isOutOfStock ? (
            <button
              disabled
              className="px-4 py-2 rounded-xl bg-stone-100 text-stone-400 text-xs font-bold cursor-not-allowed"
            >
              Indisponível
            </button>
          ) : quantityInCart > 0 ? (
            <div className="flex items-center gap-2 bg-stone-100 p-1 rounded-xl border border-stone-200">
              <button
                id={`btn-decrease-${product.id}`}
                onClick={() => onUpdateQuantity(product.id, -1)}
                className="w-8 h-8 rounded-lg bg-white text-stone-700 hover:bg-stone-200 hover:text-stone-900 flex items-center justify-center font-bold shadow-xs transition-colors cursor-pointer"
                title="Diminuir quantidade"
              >
                <Minus size={14} />
              </button>
              <span className="w-6 text-center font-extrabold text-stone-900 text-sm">
                {quantityInCart}
              </span>
              <button
                id={`btn-increase-${product.id}`}
                onClick={() => onUpdateQuantity(product.id, 1)}
                className="w-8 h-8 rounded-lg bg-rose-900 text-white hover:bg-rose-950 flex items-center justify-center font-bold shadow-xs transition-colors cursor-pointer"
                title="Aumentar quantidade"
              >
                <Plus size={14} />
              </button>
            </div>
          ) : (
            <button
              id={`btn-add-${product.id}`}
              onClick={() => onAddToCart(product, selectedSize)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-900 hover:bg-rose-950 active:bg-stone-950 text-white font-bold text-xs sm:text-sm shadow-xs transition-all transform active:scale-95 cursor-pointer"
            >
              <Plus size={16} />
              <span>Eu Quero</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
