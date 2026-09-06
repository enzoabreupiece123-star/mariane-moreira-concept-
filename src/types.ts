export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  categoryId: string;
  isActive: boolean;
  stock: number | null; // null means unlimited stock
  featured?: boolean;
  sizes?: string[]; // e.g. ['P', 'M', 'G', 'GG'] or ['Único']
  colors?: string[]; // e.g. ['Off White', 'Terracota', 'Preto']
}

export interface Category {
  id: string;
  name: string;
  order: number;
}

export interface DaySchedule {
  dayKey: 'seg' | 'ter' | 'qua' | 'qui' | 'sex' | 'sab' | 'dom';
  label: string;
  isOpen: boolean;
  openTime: string; // "09:00"
  closeTime: string; // "19:00"
}

export interface RestaurantSettings {
  name: string;
  slogan: string;
  description: string;
  logoUrl: string;
  bannerUrl: string;
  primaryColor: string;
  secondaryColor: string;
  whatsapp: string; // e.g. "11986641730"
  phone: string;
  address: string;
  neighborhood: string;
  cityState: string;
  deliveryFee: number;
  estimatedDeliveryTime: string;
  instagram: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export type PaymentMethod = 'Pix' | 'Dinheiro' | 'Cartão de crédito' | 'Cartão de débito';

export interface OrderCheckoutForm {
  name: string;
  phone: string;
  deliveryType?: 'delivery' | 'pickup';
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  paymentMethod: PaymentMethod;
  cashChange: string;
  notes: string;
}

export interface AppDataResponse {
  settings: RestaurantSettings;
  schedule: DaySchedule[];
  categories: Category[];
  products: Product[];
  isOpenNow: boolean;
  statusMessage: string;
}

export interface AuthSession {
  token: string;
  username: string;
}
