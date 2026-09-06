import React from 'react';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, AlertTriangle } from 'lucide-react';
import { CartItem } from '../types';
import { formatCurrency } from '../utils/format';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  deliveryFee: number;
  isOpenNow: boolean;
  onUpdateQuantity: (productId: string, delta: number, selectedSize?: string) => void;
  onRemoveItem: (productId: string, selectedSize?: string) => void;
  onClearCart: () => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  deliveryFee,
  isOpenNow,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout,
}) => {
  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const total = subtotal + (items.length > 0 ? deliveryFee : 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 bg-stone-950 text-white flex items-center justify-between border-b border-stone-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-rose-950 text-rose-300 border border-rose-800/40">
                <ShoppingBag size={20} />
              </div>
              <div>
                <h2 className="font-bold text-base text-white font-['Playfair_Display']">Sua Sacola</h2>
                <p className="text-xs text-stone-400">
                  {items.length === 0
                    ? 'Nenhuma peça adicionada'
                    : `${items.reduce((s, i) => s + i.quantity, 0)} ${
                        items.reduce((s, i) => s + i.quantity, 0) === 1 ? 'peça escolhida' : 'peças escolhidas'
                      }`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {items.length > 0 && (
                <button
                  id="btn-clear-cart"
                  onClick={onClearCart}
                  className="text-xs text-stone-400 hover:text-rose-400 p-1 transition-colors cursor-pointer"
                  title="Esvaziar sacola"
                >
                  Limpar
                </button>
              )}
              <button
                id="btn-close-cart"
                onClick={onClose}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {!isOpenNow && (
            <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-xs text-amber-900 flex items-center gap-2">
              <AlertTriangle size={14} className="text-amber-600 shrink-0" />
              <span>Atendimento fora do expediente. Você pode enviar seu pedido e responderemos no início do próximo turno!</span>
            </div>
          )}

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 divide-y divide-stone-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-800 flex items-center justify-center mb-4">
                  <ShoppingBag size={32} />
                </div>
                <h3 className="font-bold text-stone-800 text-base font-['Playfair_Display']">Sua sacola está vazia</h3>
                <p className="text-xs text-stone-500 mt-1.5 max-w-xs leading-relaxed">
                  Explore nossa coleção exclusiva de peças em alfaiataria, linho e vestidos elegantes para renovar seu closet!
                </p>
                <button
                  onClick={onClose}
                  className="mt-5 px-5 py-2.5 rounded-xl bg-rose-900 text-white font-bold text-sm hover:bg-rose-950 transition-colors cursor-pointer shadow-sm"
                >
                  Ver Coleção Completa
                </button>
              </div>
            ) : (
              items.map((item, idx) => (
                <div key={`${item.product.id}-${item.selectedSize || 'nosize'}-${idx}`} className="py-4 first:pt-0 last:pb-0 flex gap-3.5">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-16 h-20 rounded-xl object-cover bg-stone-100 shrink-0 border border-stone-100"
                  />

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-bold text-stone-900 text-sm truncate font-['Playfair_Display']">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(item.product.id, item.selectedSize)}
                          className="text-stone-400 hover:text-rose-600 transition-colors p-0.5 cursor-pointer"
                          title="Remover peça"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      {item.selectedSize && (
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-stone-100 text-stone-700 text-[11px] font-bold">
                          Tamanho: {item.selectedSize}
                        </span>
                      )}

                      <span className="text-xs text-stone-500 font-medium block mt-0.5">
                        {formatCurrency(item.product.price)} cada
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity selector */}
                      <div className="flex items-center gap-2 bg-stone-100 p-0.5 rounded-lg border border-stone-200">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, -1, item.selectedSize)}
                          className="w-6 h-6 rounded bg-white text-stone-700 hover:bg-stone-200 flex items-center justify-center font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-5 text-center font-bold text-stone-900 text-xs">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, 1, item.selectedSize)}
                          className="w-6 h-6 rounded bg-rose-900 text-white hover:bg-rose-950 flex items-center justify-center font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      {/* Total for this line */}
                      <span className="font-extrabold text-stone-900 text-sm">
                        {formatCurrency(item.product.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer with Calculations */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 bg-stone-50 border-t border-stone-200 space-y-3">
              <div className="space-y-1.5 text-xs sm:text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal das peças</span>
                  <span className="font-semibold text-stone-800">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Frete / Envio</span>
                  <span className="font-semibold text-stone-800">
                    {deliveryFee > 0 ? formatCurrency(deliveryFee) : 'Grátis'}
                  </span>
                </div>
                <div className="pt-2 border-t border-stone-200 flex justify-between text-base font-extrabold text-stone-900">
                  <span>Total do Pedido</span>
                  <span className="text-rose-900 text-lg font-black">{formatCurrency(total)}</span>
                </div>
              </div>

              <button
                id="btn-checkout-proceed"
                onClick={onProceedToCheckout}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-rose-900 to-rose-950 hover:from-rose-800 hover:to-rose-900 text-white font-bold text-sm sm:text-base shadow-lg shadow-rose-950/20 flex items-center justify-center gap-2 transition-all transform active:scale-98 cursor-pointer"
              >
                <span>Avançar para o WhatsApp</span>
                <ArrowRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
