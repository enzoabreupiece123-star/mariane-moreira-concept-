import React, { useState } from 'react';
import { X, ArrowLeft, Send, CheckCircle2, ShoppingBag, MapPin, CreditCard, DollarSign, QrCode, Sparkles, Store, Truck } from 'lucide-react';
import { CartItem, OrderCheckoutForm, PaymentMethod, RestaurantSettings } from '../types';
import { buildWhatsAppMessage, formatCurrency, formatPhoneMask, generateWhatsAppUrl } from '../utils/format';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  settings: RestaurantSettings;
  onOrderCompleted: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  settings,
  onOrderCompleted,
}) => {
  if (!isOpen) return null;

  const [step, setStep] = useState<'form' | 'summary'>('form');

  const [form, setForm] = useState<OrderCheckoutForm>({
    name: '',
    phone: '',
    deliveryType: 'delivery',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    paymentMethod: 'Pix',
    cashChange: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof OrderCheckoutForm, string>>>({});

  const isPickup = form.deliveryType === 'pickup';
  const effectiveDeliveryFee = isPickup ? 0 : settings.deliveryFee;
  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const total = subtotal + effectiveDeliveryFee;

  const validate = (): boolean => {
    const errs: Partial<Record<keyof OrderCheckoutForm, string>> = {};
    if (!form.name.trim()) errs.name = 'Por favor, informe seu nome completo.';
    if (!form.phone.trim() || form.phone.replace(/\D/g, '').length < 10) {
      errs.phone = 'Informe um WhatsApp válido com DDD para contato.';
    }

    if (!isPickup) {
      if (!form.street.trim()) errs.street = 'Informe a rua/avenida para envio.';
      if (!form.number.trim()) errs.number = 'Informe o número.';
      if (!form.neighborhood.trim()) errs.neighborhood = 'Informe o bairro.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setStep('summary');
    }
  };

  const handleSendToWhatsApp = () => {
    const message = buildWhatsAppMessage(form, items, subtotal, effectiveDeliveryFee, settings.name);
    const url = generateWhatsAppUrl(settings.whatsapp, message);

    // Open WhatsApp link
    window.open(url, '_blank') || (window.location.href = url);

    // Notify parent to clean cart and show success
    onOrderCompleted();
  };

  const paymentOptions: Array<{ id: PaymentMethod; label: string; icon: React.ReactNode; desc: string }> = [
    { id: 'Pix', label: 'Pix', icon: <QrCode size={18} className="text-emerald-600" />, desc: 'Chave enviada no WhatsApp' },
    { id: 'Cartão de crédito', label: 'Cartão de Crédito', icon: <CreditCard size={18} className="text-rose-700" />, desc: 'Link de pagamento / Máquina' },
    { id: 'Cartão de débito', label: 'Cartão de Débito', icon: <CreditCard size={18} className="text-stone-700" />, desc: 'Na entrega / Retirada' },
    { id: 'Dinheiro', label: 'Dinheiro', icon: <DollarSign size={18} className="text-amber-700" />, desc: 'Pagar na retirada/entrega' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden my-6 border border-stone-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-stone-950 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            {step === 'summary' && (
              <button
                onClick={() => setStep('form')}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors mr-1 cursor-pointer"
                title="Voltar ao formulário"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div>
              <h3 className="font-bold text-base text-white font-['Playfair_Display']">
                {step === 'form' ? 'Finalizar Pedido de Peças' : 'Resumo do seu Pedido'}
              </h3>
              <p className="text-xs text-stone-400">
                {step === 'form' ? 'Preencha seus dados para confirmação no WhatsApp' : 'Confira os detalhes antes de enviar para a nossa equipe'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* STEP 1: FORM */}
        {step === 'form' && (
          <form onSubmit={handleNextStep} className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Delivery Type Option */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider">
                Como deseja receber suas peças?
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, deliveryType: 'delivery' })}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                    form.deliveryType === 'delivery'
                      ? 'border-rose-900 bg-rose-50 text-rose-950 ring-1 ring-rose-900 font-bold'
                      : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <Truck size={18} className={form.deliveryType === 'delivery' ? 'text-rose-900' : 'text-stone-400'} />
                  <div>
                    <div className="text-xs font-bold">Envio / Entrega</div>
                    <div className="text-[11px] text-stone-500 font-normal">
                      {settings.deliveryFee > 0 ? formatCurrency(settings.deliveryFee) : 'Grátis'}
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setForm({ ...form, deliveryType: 'pickup' })}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                    form.deliveryType === 'pickup'
                      ? 'border-rose-900 bg-rose-50 text-rose-950 ring-1 ring-rose-900 font-bold'
                      : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <Store size={18} className={form.deliveryType === 'pickup' ? 'text-rose-900' : 'text-stone-400'} />
                  <div>
                    <div className="text-xs font-bold">Retirada na Loja</div>
                    <div className="text-[11px] text-emerald-600 font-bold">Sem taxa (Grátis)</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Customer Info */}
            <div className="space-y-3 pt-2 border-t border-stone-100">
              <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                <span>👤 Seus Dados</span>
              </h4>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Mariana Albuquerque"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors ${
                    errors.name ? 'border-rose-400 bg-rose-50/30' : 'border-stone-300 focus:border-rose-900'
                  }`}
                />
                {errors.name && <span className="text-xs text-rose-600 mt-1 block">{errors.name}</span>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  WhatsApp com DDD *
                </label>
                <input
                  type="tel"
                  placeholder="(11) 98664-1730"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: formatPhoneMask(e.target.value) })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors ${
                    errors.phone ? 'border-rose-400 bg-rose-50/30' : 'border-stone-300 focus:border-rose-900'
                  }`}
                />
                {errors.phone && <span className="text-xs text-rose-600 mt-1 block">{errors.phone}</span>}
              </div>
            </div>

            {/* Address (only if delivery) */}
            {!isPickup && (
              <div className="space-y-3 pt-2 border-t border-stone-100">
                <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin size={14} className="text-rose-900" />
                  <span>📍 Endereço de Envio</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Endereço (Rua, Avenida, Alameda) *
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Av. Paulista"
                      value={form.street}
                      onChange={(e) => setForm({ ...form, street: e.target.value })}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors ${
                        errors.street ? 'border-rose-400 bg-rose-50/30' : 'border-stone-300 focus:border-rose-900'
                      }`}
                    />
                    {errors.street && <span className="text-xs text-rose-600 mt-1 block">{errors.street}</span>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Número *
                    </label>
                    <input
                      type="text"
                      placeholder="1842"
                      value={form.number}
                      onChange={(e) => setForm({ ...form, number: e.target.value })}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors ${
                        errors.number ? 'border-rose-400 bg-rose-50/30' : 'border-stone-300 focus:border-rose-900'
                      }`}
                    />
                    {errors.number && <span className="text-xs text-rose-600 mt-1 block">{errors.number}</span>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Complemento <span className="text-stone-400 font-normal">(Opcional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Apto 84, Bloco 2..."
                      value={form.complement}
                      onChange={(e) => setForm({ ...form, complement: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-rose-900 text-sm focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Bairro *
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Bela Vista"
                      value={form.neighborhood}
                      onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors ${
                        errors.neighborhood ? 'border-rose-400 bg-rose-50/30' : 'border-stone-300 focus:border-rose-900'
                      }`}
                    />
                    {errors.neighborhood && (
                      <span className="text-xs text-rose-600 mt-1 block">{errors.neighborhood}</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {isPickup && (
              <div className="p-3.5 bg-rose-50/70 rounded-2xl border border-rose-200 text-xs text-stone-700 space-y-1">
                <div className="font-bold text-rose-900 flex items-center gap-1.5">
                  <Store size={15} />
                  <span>Ponto de Retirada da Loja:</span>
                </div>
                <p className="font-medium text-stone-800">{settings.address}, {settings.neighborhood} - {settings.cityState}</p>
                <p className="text-stone-500">Seu pacote ficará embalado para retirada após a confirmação no WhatsApp!</p>
              </div>
            )}

            {/* Payment Method */}
            <div className="space-y-3 pt-2 border-t border-stone-100">
              <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard size={14} className="text-rose-900" />
                <span>💳 Forma de Pagamento Preferida</span>
              </h4>

              <div className="grid grid-cols-2 gap-2.5">
                {paymentOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setForm({ ...form, paymentMethod: opt.id })}
                    className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      form.paymentMethod === opt.id
                        ? 'border-rose-900 bg-rose-50/60 shadow-xs ring-1 ring-rose-900'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {opt.icon}
                        <span className="text-xs font-bold text-stone-800">{opt.label}</span>
                      </div>
                      {form.paymentMethod === opt.id && (
                        <span className="w-2 h-2 rounded-full bg-rose-900" />
                      )}
                    </div>
                    <span className="text-[11px] text-stone-500">{opt.desc}</span>
                  </button>
                ))}
              </div>

              {form.paymentMethod === 'Dinheiro' && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 mt-2">
                  <label className="block text-xs font-semibold text-amber-900 mb-1">
                    Precisa de troco? <span className="font-normal text-amber-700">(Deixe em branco se não precisar)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-amber-700">R$</span>
                    <input
                      type="text"
                      placeholder="Ex: 300,00"
                      value={form.cashChange}
                      onChange={(e) => setForm({ ...form, cashChange: e.target.value })}
                      className="w-full pl-8 pr-3 py-2 rounded-lg border border-amber-300 bg-white text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <label className="block text-xs font-semibold text-stone-700">
                Observações ou Dúvidas sobre o Ajuste <span className="text-stone-400 font-normal">(Opcional)</span>
              </label>
              <textarea
                rows={2}
                placeholder="Ex: Gostaria de embalagem para presente, tirar dúvidas sobre o tecido..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-rose-900 text-sm focus:outline-none transition-colors resize-none"
              />
            </div>

            {/* Submit step 1 */}
            <div className="pt-3 border-t border-stone-200">
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-rose-900 hover:bg-rose-950 text-white font-bold text-sm shadow-md transition-all transform active:scale-98 cursor-pointer"
              >
                <span>Revisar Peças e Confirmar</span>
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: SUMMARY & WHATSAPP REDIRECT */}
        {step === 'summary' && (
          <div className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            <div className="p-3 bg-rose-50/80 rounded-2xl border border-rose-200 text-rose-950 text-xs flex items-center gap-2.5">
              <CheckCircle2 size={20} className="text-rose-900 shrink-0" />
              <span>Ao clicar no botão abaixo, sua sacola será enviada com um clique para a consultora da <strong>{settings.name}</strong> no WhatsApp.</span>
            </div>

            {/* Customer & Delivery summary */}
            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 text-xs space-y-1.5 text-stone-700">
              <div className="font-bold text-stone-900 text-sm pb-1 mb-1 border-b border-stone-200 font-['Playfair_Display']">
                Dados de Atendimento
              </div>
              <p><span className="font-semibold text-stone-900">Cliente:</span> {form.name} ({form.phone})</p>
              <p>
                <span className="font-semibold text-stone-900">Modalidade:</span> {isPickup ? 'Retirada na Loja' : 'Envio no Endereço'}
              </p>
              {!isPickup && (
                <p>
                  <span className="font-semibold text-stone-900">Endereço:</span> {form.street}, {form.number}
                  {form.complement ? ` - ${form.complement}` : ''} • {form.neighborhood}
                </p>
              )}
              <p>
                <span className="font-semibold text-stone-900">Pagamento:</span> {form.paymentMethod}
                {form.paymentMethod === 'Dinheiro' && form.cashChange ? ` (Troco para R$ ${form.cashChange})` : ''}
              </p>
              {form.notes && (
                <p><span className="font-semibold text-stone-900">Observações:</span> {form.notes}</p>
              )}
            </div>

            {/* Products summary */}
            <div className="border border-stone-200 rounded-2xl p-4 space-y-2">
              <div className="font-bold text-stone-900 text-sm pb-1 border-b border-stone-100 flex items-center justify-between font-['Playfair_Display']">
                <span>Peças Selecionadas</span>
                <span className="text-xs text-stone-500 font-normal">{items.length} {items.length === 1 ? 'modelo' : 'modelos'}</span>
              </div>
              <div className="divide-y divide-stone-100 text-xs text-stone-700">
                {items.map((it) => (
                  <div key={it.product.id} className="py-2.5 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-stone-900">{it.quantity}x</span> {it.product.name}
                      {it.selectedSize && (
                        <span className="ml-1.5 px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 text-[10px] font-bold">
                          Tam: {it.selectedSize}
                        </span>
                      )}
                    </div>
                    <span className="font-semibold text-stone-900">
                      {formatCurrency(it.product.price * it.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2.5 border-t border-stone-200 space-y-1 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal das peças</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Frete / Envio</span>
                  <span>{effectiveDeliveryFee > 0 ? formatCurrency(effectiveDeliveryFee) : 'Grátis'}</span>
                </div>
                <div className="flex justify-between text-stone-900 font-extrabold text-sm pt-1.5 border-t border-stone-200">
                  <span>Total do Pedido</span>
                  <span className="text-rose-900 font-black text-base">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <div className="space-y-2 pt-2">
              <button
                id="btn-confirm-whatsapp-order"
                onClick={handleSendToWhatsApp}
                className="w-full py-4 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-base shadow-xl shadow-emerald-950/20 flex items-center justify-center gap-2.5 transition-all transform active:scale-98 cursor-pointer"
              >
                <Send size={20} />
                <span>Enviar Pedido para o WhatsApp da Loja</span>
              </button>
              <p className="text-[11px] text-center text-stone-500">
                Atendimento Oficial: <span className="font-bold text-stone-700">{settings.phone}</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
