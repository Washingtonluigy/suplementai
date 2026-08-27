import { supabase } from '/app/lib/supabase.js';
export const SITE_CONFIG_TITLE = '__SUPLEMENTAAI_NATIONAL_SITE_CONFIG__';
export const SITE_ORDER_CAMPAIGN = 'SUPLEMENTAAI_SITE';
export const DEFAULT_SITE_CONFIG = {
    version: 2,
    siteName: 'Suplementaai',
    domain: 'suplementaai.com.br',
    active: true,
    fulfillmentFranchiseId: '',
    logoUrl: '/assets/logo.png',
    faviconUrl: '/assets/logo.png',
    primaryColor: '#FFE500',
    secondaryColor: '#090909',
    accentColor: '#17A34A',
    backgroundColor: '#F7F7F5',
    textColor: '#111111',
    fontFamily: 'Inter, Arial, sans-serif',
    radius: 10,
    announcementText: '5% OFF NO PIX • COMPRA SEGURA • ENVIO PARA TODO O BRASIL',
    announcementEnabled: true,
    whatsapp: '',
    instagram: '@suplementaai',
    supportEmail: '',
    pixDiscountPercent: 5,
    shippingFlatFee: 0,
    freeShippingThreshold: 299,
    installmentsText: 'Parcele suas compras no cartão',
    searchPlaceholder: 'O que você está procurando?',
    heroSlides: [
        { id: 'hero-1', eyebrow: 'SUPLEMENTAAI', title: 'SEU RESULTADO COMEÇA AQUI.', subtitle: 'Suplementos selecionados para performance, saúde e evolução todos os dias.', buttonText: 'COMPRAR AGORA', buttonLink: '#ofertas', imageUrl: '', enabled: true },
        { id: 'hero-2', eyebrow: 'PERFORMANCE', title: 'CREATINA, WHEY E MUITO MAIS.', subtitle: 'Encontre os produtos certos para cada objetivo e cada fase do seu treino.', buttonText: 'VER PRODUTOS', buttonLink: '#produtos', imageUrl: '', enabled: true },
    ],
    homeSections: [
        { id: 'benefits', type: 'benefits', title: 'VANTAGENS SUPLEMENTAAI', enabled: true, sortOrder: 0 },
        { id: 'offers', type: 'products', title: 'OFERTAS EM DESTAQUE', source: 'offers', enabled: true, sortOrder: 1 },
        { id: 'categories', type: 'categories', title: 'COMPRE POR CATEGORIA', enabled: true, sortOrder: 2 },
        { id: 'bestsellers', type: 'products', title: 'MAIS VENDIDOS', source: 'bestseller', enabled: true, sortOrder: 3 },
        { id: 'banners', type: 'banners', title: 'DESTAQUES', enabled: true, sortOrder: 4 },
        { id: 'objectives', type: 'objectives', title: 'COMPRE POR OBJETIVO', enabled: true, sortOrder: 5 },
        { id: 'featured', type: 'products', title: 'ESCOLHAS SUPLEMENTAAI', source: 'featured', enabled: true, sortOrder: 6 },
        { id: 'new', type: 'products', title: 'NOVIDADES', source: 'new', enabled: true, sortOrder: 7 },
    ],
    promoBanners: [
        { id: 'promo-1', title: 'WHEY PROTEIN', subtitle: 'Proteína para acompanhar sua evolução', imageUrl: '', link: '#produtos', enabled: true },
        { id: 'promo-2', title: 'CREATINA', subtitle: 'Força, potência e performance', imageUrl: '', link: '#produtos', enabled: true },
    ],
    objectives: [
        { id: 'massa', title: 'Ganho de Massa', subtitle: 'Proteína e calorias para evoluir', icon: '💪', query: 'whey hipercalorico proteína massa', enabled: true },
        { id: 'forca', title: 'Força & Performance', subtitle: 'Energia para treinar mais forte', icon: '⚡', query: 'creatina pré treino performance', enabled: true },
        { id: 'definicao', title: 'Definição', subtitle: 'Rotina e estratégia no seu objetivo', icon: '🔥', query: 'termogênico definição', enabled: true },
        { id: 'saude', title: 'Saúde & Bem-estar', subtitle: 'Suporte para o dia a dia', icon: '🧡', query: 'vitamina omega colageno saúde', enabled: true },
    ],
    benefits: [
        { id: 'pix', title: '5% OFF NO PIX', text: 'Economize no pagamento à vista', icon: 'pix' },
        { id: 'truck', title: 'ENVIO RÁPIDO', text: 'Pedido acompanhado do início ao fim', icon: 'truck' },
        { id: 'shield', title: 'COMPRA SEGURA', text: 'Pagamento processado com segurança', icon: 'shield' },
        { id: 'support', title: 'ATENDIMENTO', text: 'Fale com a equipe Suplementaai', icon: 'support' },
    ],
    footer: { about: 'A Suplementaai conecta você aos suplementos certos para sua rotina, treino e objetivos.', address: '', phone: '', copyright: '© Suplementaai. Todos os direitos reservados.' },
    seo: { title: 'Suplementaai | Suplementos, Whey, Creatina e Performance', description: 'Compre suplementos na Suplementaai com ofertas, desconto no PIX e compra segura.' },
    productOverrides: {},
};
const normalize = (raw) => ({
    ...DEFAULT_SITE_CONFIG,
    ...(raw || {}),
    heroSlides: raw?.heroSlides?.length ? raw.heroSlides : DEFAULT_SITE_CONFIG.heroSlides,
    homeSections: raw?.homeSections?.length ? raw.homeSections : DEFAULT_SITE_CONFIG.homeSections,
    promoBanners: raw?.promoBanners?.length ? raw.promoBanners : DEFAULT_SITE_CONFIG.promoBanners,
    objectives: raw?.objectives?.length ? raw.objectives : DEFAULT_SITE_CONFIG.objectives,
    benefits: raw?.benefits?.length ? raw.benefits : DEFAULT_SITE_CONFIG.benefits,
    footer: { ...DEFAULT_SITE_CONFIG.footer, ...(raw?.footer || {}) },
    seo: { ...DEFAULT_SITE_CONFIG.seo, ...(raw?.seo || {}) },
    productOverrides: raw?.productOverrides || {},
});
export async function loadSiteConfig() {
    const { data, error } = await supabase
        .from('franchise_promotions')
        .select('id,franchise_id,description,created_at')
        .eq('title', SITE_CONFIG_TITLE)
        .order('created_at', { ascending: false })
        .limit(1);
    if (error)
        throw error;
    const row = data?.[0];
    if (!row)
        return { config: DEFAULT_SITE_CONFIG, recordId: null };
    try {
        const parsed = JSON.parse(row.description || '{}');
        return { config: normalize({ ...parsed, fulfillmentFranchiseId: parsed.fulfillmentFranchiseId || row.franchise_id || '' }), recordId: row.id };
    }
    catch {
        return { config: { ...DEFAULT_SITE_CONFIG, fulfillmentFranchiseId: row.franchise_id || '' }, recordId: row.id };
    }
}
export async function saveSiteConfig(config, recordId) {
    if (!config.fulfillmentFranchiseId)
        throw new Error('Escolha a central/unidade responsável pelo site antes de publicar.');
    const payload = {
        franchise_id: config.fulfillmentFranchiseId,
        title: SITE_CONFIG_TITLE,
        description: JSON.stringify({ ...config, version: 2 }),
        badge_text: 'INTERNO',
        image_url: null,
        product_id: null,
        sort_order: 999999,
        active: false,
    };
    if (recordId) {
        const { data, error } = await supabase.from('franchise_promotions').update(payload).eq('id', recordId).select('id').single();
        if (error)
            throw error;
        return data.id;
    }
    const { data, error } = await supabase.from('franchise_promotions').insert(payload).select('id').single();
    if (error)
        throw error;
    return data.id;
}
export function mergeSiteProduct(product, config) {
    const site = config.productOverrides[product.id] || {};
    return {
        ...product,
        site,
        displayName: site.customName?.trim() || product.name,
        displayDescription: site.customDescription?.trim() || product.description,
        displayPrice: Number(site.customPrice ?? product.price ?? 0),
        displayDiscountPrice: site.customDiscountPrice ?? product.discount_price ?? null,
        displayImage: site.customImageUrl?.trim() || product.image_url,
    };
}
