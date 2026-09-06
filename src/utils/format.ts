import { CartItem, OrderCheckoutForm } from '../types';

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);
}

export function cleanPhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

export function formatPhoneMask(val: string): string {
  const digits = cleanPhone(val).slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

export function buildWhatsAppMessage(
  form: OrderCheckoutForm,
  items: CartItem[],
  subtotal: number,
  deliveryFee: number,
  storeName: string
): string {
  const isPickup = form.deliveryType === 'pickup';
  const effectiveDeliveryFee = isPickup ? 0 : deliveryFee;
  const total = subtotal + effectiveDeliveryFee;

  const itemsList = items
    .map((item) => {
      const sizeStr = item.selectedSize ? ` [Tam: ${item.selectedSize}]` : '';
      return `• ${item.quantity}x ${item.product.name}${sizeStr} — ${formatCurrency(item.product.price * item.quantity)}`;
    })
    .join('\n');

  let paymentText = form.paymentMethod;
  if (form.paymentMethod === 'Dinheiro' && form.cashChange && form.cashChange.trim()) {
    paymentText += ` (Troco para R$ ${form.cashChange.trim()})`;
  }

  const deliveryTypeText = isPickup ? '🛍️ Retirada na Loja / Showroom' : '📦 Envio / Entrega no Endereço';
  const complementText = form.complement && form.complement.trim() ? form.complement.trim() : 'Não informado';
  const notesText = form.notes && form.notes.trim() ? form.notes.trim() : 'Nenhuma';

  let addressBlock = '';
  if (isPickup) {
    addressBlock = `📍 Modalidade: Retirada presencial na loja`;
  } else {
    addressBlock = `📍 Endereço: ${form.street.trim()}, ${form.number.trim()}
🏠 Complemento: ${complementText}
📌 Bairro: ${form.neighborhood.trim()}`;
  }

  return `✨ Olá ${storeName}! Gostaria de confirmar meu pedido de peças pelo site:

👤 Cliente: ${form.name.trim()}
📱 WhatsApp: ${form.phone.trim()}
${deliveryTypeText}
${addressBlock}
💳 Forma de Pagamento: ${paymentText}

👗 PEÇAS ESCOLHIDAS:
${itemsList}

💰 Subtotal das Peças: ${formatCurrency(subtotal)}
📦 Frete / Envio: ${effectiveDeliveryFee > 0 ? formatCurrency(effectiveDeliveryFee) : 'Grátis'}
✨ Total do Pedido: ${formatCurrency(total)}

📝 Observações / Ajustes: ${notesText}

Aguardo a confirmação da disponibilidade para efetuar o pagamento!`;
}

export function generateWhatsAppUrl(whatsappNumber: string, message: string): string {
  let cleanNumber = cleanPhone(whatsappNumber);
  if (cleanNumber.startsWith('0')) {
    cleanNumber = cleanNumber.substring(1);
  }
  if (!cleanNumber.startsWith('55')) {
    cleanNumber = `55${cleanNumber}`;
  }

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}
