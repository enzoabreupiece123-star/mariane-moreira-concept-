import React from 'react';
import { ShoppingBag, Clock, MapPin, Phone, Lock, ChevronRight, Sparkles } from 'lucide-react';
import { RestaurantSettings } from '../types';
import { formatCurrency } from '../utils/format';

interface HeaderProps {
  settings: RestaurantSettings;
  isOpenNow: boolean;
  statusMessage: string;
  cartCount: number;
  cartSubtotal: number;
  onOpenCart: () => void;
  onOpenHours: () => void;
  onOpenAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  isOpenNow,
  statusMessage,
  cartCount,
  cartSubtotal,
  onOpenCart,
  onOpenHours,
  onOpenAdmin,
}) => {
  return (
    <header id="site-header" className="relative bg-white border-b border-stone-200">
      {/* Top micro-bar: Hours, address, and Owner Login */}
      <div className="bg-stone-950 text-stone-300 text-xs px-4 py-2 border-b border-stone-800">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            <button
              id="header-hours-btn"
              onClick={onOpenHours}
              className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
            >
              <span className={`w-2 h-2 rounded-full ${isOpenNow ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
              <span className="font-semibold text-white">
                {isOpenNow ? 'Atendimento Aberto' : 'Atendimento Offline'}
              </span>
              <span className="hidden sm:inline text-stone-400">— Ver horários</span>
            </button>

            <span className="hidden md:flex items-center gap-1 text-stone-400">
              <MapPin size={13} className="text-rose-400" />
              <span>{settings.address}, {settings.neighborhood} - {settings.cityState}</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a
              id="header-phone-link"
              href={`tel:${settings.whatsapp}`}
              className="flex items-center gap-1 text-stone-300 hover:text-white transition-colors"
            >
              <Phone size={12} className="text-rose-400" />
              <span>{settings.phone}</span>
            </a>

            <span className="text-stone-700">|</span>

            <button
              id="header-admin-login-btn"
              onClick={onOpenAdmin}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-xs text-stone-300 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
              title="Área Administrativa da Loja"
            >
              <Lock size={12} />
              <span>Área da Loja</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hero presentation with boutique visual banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-stone-950 via-stone-900 to-rose-950 text-white">
        {settings.bannerUrl && (
          <img
            src={settings.bannerUrl}
            alt="Banner Mariane Moreira Concept"
            className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-luminosity"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/95 via-stone-950/70 to-transparent" />

        <div className="relative max-w-6xl mx-auto px-4 py-8 sm:py-12 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Brand Logo */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-stone-900 shadow-2xl p-1 shrink-0 border-2 border-rose-900/60 overflow-hidden">
            <img
              src={settings.logoUrl || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=400&q=80'}
              alt={settings.name}
              className="w-full h-full object-cover rounded-xl"
            />
          </div>

          {/* Boutique text information */}
          <div className="flex-1 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/80 text-rose-200 text-xs font-semibold mb-2.5 border border-rose-800/50">
              <Sparkles size={12} className="text-rose-300" />
              <span>Moda Feminina Autoral & Exclusiva</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-['Playfair_Display']">
              {settings.name}
            </h1>
            <p className="text-rose-100/90 font-medium text-sm sm:text-base mt-1 italic">
              {settings.slogan}
            </p>
            <p className="text-stone-300 text-xs sm:text-sm max-w-2xl mt-2 leading-relaxed font-light">
              {settings.description}
            </p>

            {/* Quick meta badges */}
            <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-4 text-xs text-stone-300">
              <button
                onClick={onOpenHours}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors border border-white/10 cursor-pointer"
              >
                <Clock size={14} className="text-rose-400" />
                <span>{statusMessage}</span>
                <ChevronRight size={12} className="text-stone-400" />
              </button>

              <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 border border-white/10">
                <span className="text-rose-400">📦</span>
                <span>Frete: {settings.deliveryFee > 0 ? formatCurrency(settings.deliveryFee) : 'Grátis'} • {settings.estimatedDeliveryTime}</span>
              </div>
            </div>
          </div>

          {/* Header Cart button (desktop) */}
          <div className="hidden lg:flex flex-col items-end justify-center shrink-0">
            <button
              id="header-cart-desktop-btn"
              onClick={onOpenCart}
              className="group relative flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-900 to-rose-950 text-white font-bold shadow-xl shadow-rose-950/40 hover:from-rose-800 hover:to-rose-900 border border-rose-700/50 transition-all transform active:scale-98 cursor-pointer"
            >
              <div className="relative">
                <ShoppingBag size={22} className="text-rose-200" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-stone-900 text-white text-xs font-extrabold flex items-center justify-center border-2 border-rose-500">
                    {cartCount}
                  </span>
                )}
              </div>
              <div className="text-left">
                <div className="text-xs text-rose-200 font-medium">Sacola de Compras</div>
                <div className="text-sm font-extrabold">{formatCurrency(cartSubtotal)}</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
