import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const PORT = 3000;
const DB_FILE = path.join(process.cwd(), 'data', 'db.json');

// Interface types
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  categoryId: string;
  isActive: boolean;
  stock: number | null;
  sizes?: string[];
  colors?: string[];
  featured?: boolean;
}

interface Category {
  id: string;
  name: string;
  order: number;
}

interface DaySchedule {
  dayKey: 'seg' | 'ter' | 'qua' | 'qui' | 'sex' | 'sab' | 'dom';
  label: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

interface RestaurantSettings {
  name: string;
  slogan: string;
  description: string;
  logoUrl: string;
  bannerUrl: string;
  primaryColor: string;
  secondaryColor: string;
  whatsapp: string;
  phone: string;
  address: string;
  neighborhood: string;
  cityState: string;
  deliveryFee: number;
  estimatedDeliveryTime: string;
  instagram: string;
}

interface DatabaseSchema {
  settings: RestaurantSettings;
  schedule: DaySchedule[];
  categories: Category[];
  products: Product[];
  admin: {
    username: string;
    passwordHash: string; // plain or simple hash for local ease
  };
}

const DEFAULT_DATA: DatabaseSchema = {
  settings: {
    name: 'Mariane Moreira Concept',
    slogan: 'Elegância, sofisticação e autenticidade para o seu closet',
    description: 'Coleções exclusivas de moda feminina desenvolvidas com cortes de alfaiataria impecáveis, tecidos nobres e acabamentos artesanais. Enviamos com amor para todo o Brasil.',
    logoUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=400&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
    primaryColor: '#881337', // Rose 900 / Vinho nobre
    secondaryColor: '#4c0519', // Bordô profundo
    whatsapp: '11986641730',
    phone: '(11) 98664-1730',
    address: 'Av. Paulista, 1842 - Sala 804',
    neighborhood: 'Bela Vista',
    cityState: 'São Paulo - SP',
    deliveryFee: 15.0,
    estimatedDeliveryTime: 'Envio em até 24h',
    instagram: '@marianemoreiraconcept',
  },
  schedule: [
    { dayKey: 'seg', label: 'Segunda-feira', isOpen: true, openTime: '09:00', closeTime: '19:00' },
    { dayKey: 'ter', label: 'Terça-feira', isOpen: true, openTime: '09:00', closeTime: '19:00' },
    { dayKey: 'qua', label: 'Quarta-feira', isOpen: true, openTime: '09:00', closeTime: '19:00' },
    { dayKey: 'qui', label: 'Quinta-feira', isOpen: true, openTime: '09:00', closeTime: '19:00' },
    { dayKey: 'sex', label: 'Sexta-feira', isOpen: true, openTime: '09:00', closeTime: '19:00' },
    { dayKey: 'sab', label: 'Sábado', isOpen: true, openTime: '09:00', closeTime: '16:00' },
    { dayKey: 'dom', label: 'Domingo', isOpen: false, openTime: '10:00', closeTime: '14:00' },
  ],
  categories: [
    { id: 'cat-vestidos', name: 'Vestidos & Macacões', order: 1 },
    { id: 'cat-alfaiataria', name: 'Conjuntos & Alfaiataria', order: 2 },
    { id: 'cat-blusas', name: 'Blusas & Camisas', order: 3 },
    { id: 'cat-calcas', name: 'Calças & Saias', order: 4 },
    { id: 'cat-acessorios', name: 'Acessórios & Bolsas', order: 5 },
  ],
  products: [
    {
      id: 'prod-vestido-riviera',
      name: 'Vestido Midi Linho Riviera',
      description: 'Confeccionado em puro linho misto com decote clássico, fenda lateral discreta e faixa para amarração na cintura. Elegância atemporal para ocasiões especiais.',
      price: 289.9,
      image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80',
      categoryId: 'cat-vestidos',
      isActive: true,
      stock: 12,
      featured: true,
      sizes: ['P', 'M', 'G'],
      colors: ['Off White', 'Terracota', 'Verde Oliva'],
    },
    {
      id: 'prod-vestido-esmeralda',
      name: 'Vestido Longo Seda Esmeralda',
      description: 'Vestido fluido em crepe acetinado com caimento impecável, decote costas em V profundo e movimento sutil de alta costura.',
      price: 359.0,
      image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
      categoryId: 'cat-vestidos',
      isActive: true,
      stock: 8,
      featured: true,
      sizes: ['P', 'M', 'G'],
      colors: ['Verde Esmeralda', 'Preto Clássico'],
    },
    {
      id: 'prod-blazer-milao',
      name: 'Blazer Alfaiataria Milão Oversized',
      description: 'Corte estruturado moderno com ombreiras suaves, forro de cetim, botões forrados artesanais e bolsos embutidos. O clássico indispensável do closet contemporâneo.',
      price: 329.9,
      image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80',
      categoryId: 'cat-alfaiataria',
      isActive: true,
      stock: 15,
      featured: true,
      sizes: ['P', 'M', 'G', 'GG'],
      colors: ['Areia Nude', 'Preto Chic'],
    },
    {
      id: 'prod-conjunto-saint-tropez',
      name: 'Conjunto Linho Saint-Tropez',
      description: 'Cropped estruturado com amarração nas costas acompanhado de calça pantalona de cintura alta com cós anatômico e caimento fluido.',
      price: 349.9,
      image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
      categoryId: 'cat-alfaiataria',
      isActive: true,
      stock: 10,
      sizes: ['P', 'M', 'G'],
      colors: ['Cru Natural', 'Terracota'],
    },
    {
      id: 'prod-camisa-seda',
      name: 'Camisa Seda Pura Marsala',
      description: 'Toque macio e acetinado, gola social refinada, punhos alongados com botões madrepérola e caimento impecável para produções sofisticadas.',
      price: 199.9,
      image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
      categoryId: 'cat-blusas',
      isActive: true,
      stock: 20,
      sizes: ['P', 'M', 'G'],
      colors: ['Marsala', 'Branco Puro'],
    },
    {
      id: 'prod-body-canelado',
      name: 'Body Canelado Gola Alta Minimal',
      description: 'Malha canelada premium de alta gramatura com toque aveludado e ajuste anatômico que valoriza a silhueta com extremo conforto.',
      price: 119.0,
      image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80',
      categoryId: 'cat-blusas',
      isActive: true,
      stock: 25,
      sizes: ['P', 'M', 'G'],
      colors: ['Nude Amêndoa', 'Preto Onix', 'Branco'],
    },
    {
      id: 'prod-calca-wide-leg',
      name: 'Calça Wide Leg Alfaiataria Supreme',
      description: 'Modelagem wide leg ampla, cintura super alta com passantes de cinto duplos, pregas frontais refinadas e barra alongada elegante.',
      price: 249.9,
      image: 'https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&w=800&q=80',
      categoryId: 'cat-calcas',
      isActive: true,
      stock: 14,
      sizes: ['36', '38', '40', '42'],
      colors: ['Bege Fendi', 'Preto Onix'],
    },
    {
      id: 'prod-saia-plissada',
      name: 'Saia Midi Plissada Champanhe',
      description: 'Plissado permanente com brilho acetinado sutil e cós elástico com acabamento fino para máximo conforto e sofisticação em eventos ou trabalho.',
      price: 219.0,
      image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=800&q=80',
      categoryId: 'cat-calcas',
      isActive: true,
      stock: 9,
      sizes: ['P', 'M', 'G'],
      colors: ['Champanhe Dourado', 'Prata Luz'],
    },
    {
      id: 'prod-bolsa-baguete',
      name: 'Bolsa Baguete Couro Legítimo Roma',
      description: 'Feita à mão com couro nobre estruturado, fecho imantado geométrico dourado e alça ajustável para ombro ou tiracolo.',
      price: 279.0,
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
      categoryId: 'cat-acessorios',
      isActive: true,
      stock: 7,
      sizes: ['Tamanho Único'],
      colors: ['Caramelo Queimado', 'Preto'],
    },
    {
      id: 'prod-cinto-ouro',
      name: 'Cinto Fivela Orgânica Banhada a Ouro',
      description: 'Cinto de couro legítimo com fivela de design orgânico e acabamento escovado banhado a ouro 18k.',
      price: 99.9,
      image: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=800&q=80',
      categoryId: 'cat-acessorios',
      isActive: true,
      stock: 15,
      sizes: ['P', 'M', 'G'],
      colors: ['Dourado & Couro Preto', 'Dourado & Couro Caramelo'],
    },
  ],
  admin: {
    username: 'admin',
    passwordHash: 'admin123',
  },
};

// Ensure data folder and file exist
function initDatabase(): DatabaseSchema {
  const dataDir = path.dirname(DB_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DATA, null, 2), 'utf-8');
    return DEFAULT_DATA;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const data = JSON.parse(raw);
    return {
      ...DEFAULT_DATA,
      ...data,
      settings: { ...DEFAULT_DATA.settings, ...(data.settings || {}) },
    };
  } catch {
    fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DATA, null, 2), 'utf-8');
    return DEFAULT_DATA;
  }
}

let db = initDatabase();

function saveDatabase(): void {
  try {
    const dataDir = path.dirname(DB_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing to db.json:', err);
  }
}

// Active session token store
const activeTokens = new Set<string>();

// Helper to determine if restaurant is open right now
function getRestaurantStatus(schedule: DaySchedule[]): { isOpen: boolean; message: string } {
  const dayKeys: Array<DaySchedule['dayKey']> = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
  // Convert current time to GMT-3 (Brazil time)
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const brDate = new Date(utc + 3600000 * -3);

  const dayOfWeekIndex = brDate.getDay();
  const currentDayKey = dayKeys[dayOfWeekIndex];
  const daySchedule = schedule.find((s) => s.dayKey === currentDayKey);

  if (!daySchedule || !daySchedule.isOpen) {
    return {
      isOpen: false,
      message: `Fechado hoje (${daySchedule?.label || 'Hoje'}). Abrimos no próximo horário comercial.`,
    };
  }

  const currentMinutes = brDate.getHours() * 60 + brDate.getMinutes();

  const [openH, openM] = daySchedule.openTime.split(':').map(Number);
  const [closeH, closeM] = daySchedule.closeTime.split(':').map(Number);

  const openMinutes = (openH || 0) * 60 + (openM || 0);
  let closeMinutes = (closeH || 0) * 60 + (closeM || 0);

  // If closing after midnight (e.g. 01:00)
  if (closeMinutes < openMinutes) {
    closeMinutes += 24 * 60;
  }

  const isOpen = currentMinutes >= openMinutes && currentMinutes <= closeMinutes;

  if (isOpen) {
    return {
      isOpen: true,
      message: `Aberto agora! Fechamos às ${daySchedule.closeTime}.`,
    };
  } else if (currentMinutes < openMinutes) {
    return {
      isOpen: false,
      message: `Fechado agora. Abrimos hoje às ${daySchedule.openTime}.`,
    };
  } else {
    return {
      isOpen: false,
      message: `Fechado por hoje. Abrimos amanhã às ${openScheduleForNextDay(schedule, dayOfWeekIndex)}.`,
    };
  }
}

function openScheduleForNextDay(schedule: DaySchedule[], currentDayIndex: number): string {
  const dayKeys: Array<DaySchedule['dayKey']> = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
  for (let i = 1; i <= 7; i++) {
    const nextIndex = (currentDayIndex + i) % 7;
    const nextKey = dayKeys[nextIndex];
    const item = schedule.find((s) => s.dayKey === nextKey);
    if (item && item.isOpen) {
      return `${item.openTime} (${item.label})`;
    }
  }
  return 'em breve';
}

// Authentication middleware
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Não autorizado. Faça login como administrador.' });
  }

  const token = authHeader.split(' ')[1];
  if (!activeTokens.has(token)) {
    return res.status(401).json({ error: 'Sessão expirada ou inválida.' });
  }

  next();
}

async function startServer() {
  const app = express();

  // Parse JSON and body with capacity for image uploads (e.g., base64)
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // =====================
  // PUBLIC API ROUTES
  // =====================

  // GET /api/data - Public app data (only active products)
  app.get('/api/data', (_req: Request, res: Response) => {
    const status = getRestaurantStatus(db.schedule);
    const activeProducts = db.products.filter((p) => p.isActive);

    res.json({
      settings: db.settings,
      schedule: db.schedule,
      categories: db.categories.sort((a, b) => a.order - b.order),
      products: activeProducts,
      isOpenNow: status.isOpen,
      statusMessage: status.message,
    });
  });

  // POST /api/auth/login
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { username, password } = req.body || {};
    if (username === db.admin.username && password === db.admin.passwordHash) {
      const token = `token-${Date.now()}-${Math.random().toString(36).substring(2)}`;
      activeTokens.add(token);
      return res.json({ success: true, token, username });
    }
    return res.status(401).json({ error: 'Usuário ou senha incorretos' });
  });

  // POST /api/auth/verify
  app.post('/api/auth/verify', (req: Request, res: Response) => {
    const { token } = req.body || {};
    if (token && activeTokens.has(token)) {
      return res.json({ valid: true });
    }
    return res.json({ valid: false });
  });

  // POST /api/auth/logout
  app.post('/api/auth/logout', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      activeTokens.delete(token);
    }
    res.json({ success: true });
  });

  // =====================
  // ADMIN PROTECTED ROUTES
  // =====================

  // GET /api/admin/data - Returns full data including inactive products
  app.get('/api/admin/data', requireAuth, (_req: Request, res: Response) => {
    const status = getRestaurantStatus(db.schedule);
    res.json({
      settings: db.settings,
      schedule: db.schedule,
      categories: db.categories.sort((a, b) => a.order - b.order),
      products: db.products,
      isOpenNow: status.isOpen,
      statusMessage: status.message,
    });
  });

  // POST /api/admin/products - Add product
  app.post('/api/admin/products', requireAuth, (req: Request, res: Response) => {
    const { name, description, price, image, categoryId, isActive, stock } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ error: 'Nome e preço são obrigatórios.' });
    }

    const newProduct: Product = {
      id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: String(name).trim(),
      description: String(description || '').trim(),
      price: Number(price) || 0,
      image: String(image || '').trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      categoryId: String(categoryId || db.categories[0]?.id || ''),
      isActive: isActive !== false,
      stock: stock === null || stock === '' || stock === undefined ? null : Math.max(0, Number(stock)),
    };

    db.products.push(newProduct);
    saveDatabase();
    res.status(201).json(newProduct);
  });

  // PUT /api/admin/products/:id - Update product
  app.put('/api/admin/products/:id', requireAuth, (req: Request, res: Response) => {
    const { id } = req.params;
    const index = db.products.findIndex((p) => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Produto não encontrado.' });
    }

    const { name, description, price, image, categoryId, isActive, stock } = req.body;
    db.products[index] = {
      ...db.products[index],
      name: name !== undefined ? String(name).trim() : db.products[index].name,
      description: description !== undefined ? String(description).trim() : db.products[index].description,
      price: price !== undefined ? Number(price) : db.products[index].price,
      image: image !== undefined ? String(image).trim() : db.products[index].image,
      categoryId: categoryId !== undefined ? String(categoryId) : db.products[index].categoryId,
      isActive: isActive !== undefined ? Boolean(isActive) : db.products[index].isActive,
      stock: stock === null || stock === '' ? null : stock !== undefined ? Number(stock) : db.products[index].stock,
    };

    saveDatabase();
    res.json(db.products[index]);
  });

  // DELETE /api/admin/products/:id - Delete product
  app.delete('/api/admin/products/:id', requireAuth, (req: Request, res: Response) => {
    const { id } = req.params;
    const initialLen = db.products.length;
    db.products = db.products.filter((p) => p.id !== id);
    if (db.products.length === initialLen) {
      return res.status(404).json({ error: 'Produto não encontrado.' });
    }
    saveDatabase();
    res.json({ success: true, message: 'Produto excluído com sucesso.' });
  });

  // POST /api/admin/categories - Add category
  app.post('/api/admin/categories', requireAuth, (req: Request, res: Response) => {
    const { name } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: 'Nome da categoria é obrigatório.' });
    }

    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: String(name).trim(),
      order: db.categories.length + 1,
    };

    db.categories.push(newCat);
    saveDatabase();
    res.status(201).json(newCat);
  });

  // PUT /api/admin/categories/:id - Update category
  app.put('/api/admin/categories/:id', requireAuth, (req: Request, res: Response) => {
    const { id } = req.params;
    const index = db.categories.findIndex((c) => c.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Categoria não encontrada.' });
    }

    const { name, order } = req.body;
    if (name) db.categories[index].name = String(name).trim();
    if (order !== undefined) db.categories[index].order = Number(order);

    saveDatabase();
    res.json(db.categories[index]);
  });

  // DELETE /api/admin/categories/:id - Delete category
  app.delete('/api/admin/categories/:id', requireAuth, (req: Request, res: Response) => {
    const { id } = req.params;
    if (db.categories.length <= 1) {
      return res.status(400).json({ error: 'É necessário manter ao menos uma categoria.' });
    }

    db.categories = db.categories.filter((c) => c.id !== id);
    // Relocate products in this category to first remaining category
    const fallbackCategory = db.categories[0].id;
    db.products.forEach((p) => {
      if (p.categoryId === id) {
        p.categoryId = fallbackCategory;
      }
    });

    saveDatabase();
    res.json({ success: true });
  });

  // PUT /api/admin/schedule - Update schedule
  app.put('/api/admin/schedule', requireAuth, (req: Request, res: Response) => {
    const { schedule } = req.body;
    if (!Array.isArray(schedule)) {
      return res.status(400).json({ error: 'Formato de horário inválido.' });
    }

    db.schedule = schedule;
    saveDatabase();
    const status = getRestaurantStatus(db.schedule);
    res.json({ schedule: db.schedule, isOpenNow: status.isOpen, statusMessage: status.message });
  });

  // PUT /api/admin/settings - Update restaurant customization
  app.put('/api/admin/settings', requireAuth, (req: Request, res: Response) => {
    const newSettings = req.body;
    if (!newSettings || typeof newSettings !== 'object') {
      return res.status(400).json({ error: 'Configurações inválidas.' });
    }

    // Clean phone/whatsapp formatting
    let cleanWhatsApp = (newSettings.whatsapp || db.settings.whatsapp).replace(/\D/g, '');
    if (cleanWhatsApp.startsWith('0')) cleanWhatsApp = cleanWhatsApp.substring(1);
    if (!cleanWhatsApp) cleanWhatsApp = '11986641730';

    db.settings = {
      ...db.settings,
      ...newSettings,
      whatsapp: cleanWhatsApp,
    };

    saveDatabase();
    res.json(db.settings);
  });

  // POST /api/admin/change-password
  app.post('/api/admin/change-password', requireAuth, (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    if (currentPassword !== db.admin.passwordHash) {
      return res.status(400).json({ error: 'Senha atual incorreta.' });
    }
    if (!newPassword || newPassword.length < 4) {
      return res.status(400).json({ error: 'A nova senha deve ter pelo menos 4 caracteres.' });
    }

    db.admin.passwordHash = newPassword;
    saveDatabase();
    res.json({ success: true, message: 'Senha alterada com sucesso!' });
  });

  // POST /api/admin/reset-data (Helper to reset to default demo data if owner wants)
  app.post('/api/admin/reset-data', requireAuth, (_req: Request, res: Response) => {
    db = JSON.parse(JSON.stringify(DEFAULT_DATA));
    saveDatabase();
    res.json({ success: true, message: 'Dados restaurados para o padrão.' });
  });

  // =====================
  // VITE OR STATIC FRONTEND
  // =====================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Sabor Nordestino server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
