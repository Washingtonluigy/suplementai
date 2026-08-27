import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState, useRef } from 'react';
import { supabase } from '/app/lib/supabase.js';
import { ShoppingBag, MapPin, Phone, Bike, Store, AlertCircle, Plus, Minus, X, Link2, Check, ChevronLeft, ChevronRight, Package, Truck, CreditCard, Wallet, Banknote, Ticket, Search, Play } from 'lucide-react';
const defaultLogo = '/assets/logo.png';
// Desconto comercial da Suplementa Aí para pagamento online via PIX.
// Mantido centralizado para que catálogo, checkout, pedido e Mercado Pago usem a mesma regra.
const PIX_DISCOUNT_PERCENT = 5;
// Uma única regra de ordenação para qualquer largura de tela. O desempate
// evita que duas categorias com o mesmo sort_order mudem de posição entre
// consultas/dispositivos.
const compareCategories = (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) ||
    (a.created_at ?? '').localeCompare(b.created_at ?? '') ||
    a.id.localeCompare(b.id);
export default function PublicStore() {
    const [store, setStore] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [cart, setCart] = useState([]);
    const [showCart, setShowCart] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [copied, setCopied] = useState(false);
    const [detailProduct, setDetailProduct] = useState(null);
    const [detailImageIndex, setDetailImageIndex] = useState(0);
    const [detailMediaTab, setDetailMediaTab] = useState('photos');
    const [activeVideoIndex, setActiveVideoIndex] = useState(0);
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponError, setCouponError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [promoIndex, setPromoIndex] = useState(0);
    const promoTimer = useRef(null);
    const categoryScrollRef = useRef(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [mpReturnStatus, setMpReturnStatus] = useState(null);
    const [form, setForm] = useState({
        name: '', phone: '', address: '', reference: '', notes: '',
        orderMode: 'delivery',
        paymentChannel: 'store',
        storePaymentMethod: 'cash',
        onlinePaymentMethod: 'pix',
        customerEmail: '', customerCpf: '',
    });
    const slug = window.location.pathname.replace(/^\/+|\/+$/g, '').split('/')[1] ?? '';
    useEffect(() => {
        const loadStore = async () => {
            const { data: franchiseData } = await supabase.from('franchises').select('*').eq('slug', slug).eq('status', 'active').maybeSingle();
            if (!franchiseData) {
                setNotFound(true);
                setLoading(false);
                return;
            }
            const franchise = franchiseData;
            const [{ data: categoryData }, { data: productData }, { data: deliveryData }, { data: promoData }] = await Promise.all([
                supabase.from('franchise_categories').select('*').eq('franchise_id', franchise.id).order('sort_order', { ascending: true }).order('created_at', { ascending: true }).order('id', { ascending: true }),
                supabase.from('franchise_products').select('*').eq('franchise_id', franchise.id).eq('active', true).order('sort_order'),
                supabase.from('delivery_settings').select('*').eq('franchise_id', franchise.id).maybeSingle(),
                supabase.from('franchise_promotions').select('*').eq('franchise_id', franchise.id).eq('active', true).order('sort_order'),
            ]);
            const categories = (categoryData ?? []).slice().sort(compareCategories);
            setStore({ franchise, categories, products: (productData ?? []), delivery: deliveryData ?? null, promotions: (promoData ?? []) });
            setLoading(false);
        };
        loadStore();
    }, [slug]);
    useEffect(() => {
        if (!store)
            return;
        const logo = store.franchise.logo_url || defaultLogo;
        document.title = `${store.franchise.name} | SuplementaAí`;
        document.querySelector('link[rel="icon"]')?.setAttribute('href', logo);
        document.querySelector('meta[property="og:title"]')?.setAttribute('content', store.franchise.name);
        document.querySelector('meta[property="og:image"]')?.setAttribute('content', logo);
        document.querySelector('meta[name="twitter:image"]')?.setAttribute('content', logo);
    }, [store]);
    // Auto-rotate promotions
    useEffect(() => {
        if (!store || store.promotions.length <= 1)
            return;
        promoTimer.current = setInterval(() => {
            setPromoIndex(prev => (prev + 1) % store.promotions.length);
        }, 5000);
        return () => { if (promoTimer.current)
            clearInterval(promoTimer.current); };
    }, [store]);
    const hiddenCategoryIds = useMemo(() => new Set((store?.categories ?? []).filter(category => /\bml\b/i.test(category.name)).map(category => category.id)), [store]);
    const filteredProducts = useMemo(() => {
        if (!store)
            return [];
        let list = store.products;
        if (activeCategory !== 'all')
            list = list.filter(p => (p.category_id ?? 'others') === activeCategory);
        if (searchQuery.trim())
            list = list.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.description ?? '').toLowerCase().includes(searchQuery.toLowerCase()));
        return list;
    }, [store, activeCategory, searchQuery]);
    const filteredByCategory = useMemo(() => {
        const groups = new Map();
        filteredProducts.forEach(product => { const key = product.category_id && hiddenCategoryIds.has(product.category_id) ? 'others' : (product.category_id ?? 'others'); groups.set(key, [...(groups.get(key) ?? []), product]); });
        return groups;
    }, [filteredProducts, hiddenCategoryIds]);
    const roundMoney = (value) => Math.round((value + Number.EPSILON) * 100) / 100;
    const getProductBasePrice = (product) => product.discount_price ?? product.price;
    const getProductPixPrice = (product) => roundMoney(getProductBasePrice(product) * (1 - PIX_DISCOUNT_PERCENT / 100));
    // O subtotal usa o preço vigente do produto (incluindo promoção cadastrada, quando houver).
    // O desconto PIX é financeiro e só entra quando PIX online estiver efetivamente selecionado.
    const subtotal = roundMoney(cart.reduce((sum, item) => sum + item.price * item.quantity, 0));
    const rawCouponDiscount = appliedCoupon
        ? (appliedCoupon.discount_type === 'percent' ? (subtotal * appliedCoupon.discount_value) / 100 : appliedCoupon.discount_value)
        : 0;
    // O cupom nunca pode descontar mais que o valor dos produtos. Isso evita total negativo
    // e mantém exatamente o mesmo valor no pedido e no Mercado Pago.
    const couponDiscount = roundMoney(Math.min(Math.max(rawCouponDiscount, 0), subtotal));
    const isPixPayment = form.paymentChannel === 'online' && form.onlinePaymentMethod === 'pix';
    // O PIX acumula com o cupom, mas incide apenas sobre o saldo dos produtos depois do cupom.
    // A taxa de entrega não recebe desconto PIX.
    const pixDiscountBase = roundMoney(Math.max(0, subtotal - couponDiscount));
    const pixDiscount = isPixPayment ? roundMoney(pixDiscountBase * PIX_DISCOUNT_PERCENT / 100) : 0;
    const baseDeliveryFee = form.orderMode === 'delivery' && store?.delivery?.fee_type === 'fixed' ? (store?.delivery?.fee_value ?? 0) : 0;
    const storePercent = store?.delivery?.fee_store_percent ?? 0;
    const customerFeePortion = baseDeliveryFee * (1 - storePercent / 100);
    const deliveryFee = roundMoney(form.orderMode === 'delivery' ? customerFeePortion : 0);
    const total = roundMoney(Math.max(0, subtotal - couponDiscount - pixDiscount + deliveryFee));
    // Se o cliente alterar o carrinho depois de aplicar um cupom com compra mínima,
    // revalidamos automaticamente para impedir que o desconto permaneça indevidamente.
    useEffect(() => {
        if (appliedCoupon && appliedCoupon.min_purchase > 0 && subtotal < appliedCoupon.min_purchase) {
            setAppliedCoupon(null);
            setCouponError(`Este cupom exige compra mínima de R$ ${appliedCoupon.min_purchase.toFixed(2)}.`);
        }
    }, [subtotal, appliedCoupon]);
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const mpStatus = params.get('mp_status');
        if (mpStatus) {
            setMpReturnStatus(mpStatus);
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, []);
    const applyCoupon = async () => {
        setCouponError('');
        if (!couponCode.trim() || !store)
            return;
        const { data } = await supabase.from('coupons').select('*').eq('code', couponCode.toUpperCase().trim()).eq('active', true).or(`franchise_id.is.null,franchise_id.eq.${store.franchise.id}`).maybeSingle();
        if (!data) {
            setCouponError('Cupom inválido ou expirado.');
            setAppliedCoupon(null);
            return;
        }
        const coupon = data;
        if (coupon.min_purchase > 0 && subtotal < coupon.min_purchase) {
            setCouponError(`Compra mínima de R$ ${coupon.min_purchase} para este cupom.`);
            setAppliedCoupon(null);
            return;
        }
        setAppliedCoupon(coupon);
    };
    const addToCart = (product) => setCart(items => {
        const existing = items.find(item => item.id === product.id);
        const line = { ...product, price: getProductBasePrice(product), quantity: 1 };
        return existing ? items.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) : [...items, line];
    });
    const changeQuantity = (id, amount) => setCart(items => items.map(item => item.id === id ? { ...item, quantity: item.quantity + amount } : item).filter(item => item.quantity > 0));
    const copyLink = async () => { await navigator.clipboard.writeText(window.location.href); setCopied(true); window.setTimeout(() => setCopied(false), 1800); };
    const submitOrder = async (event) => {
        event.preventDefault();
        if (!store || cart.length === 0)
            return;
        setSubmitting(true);
        setSubmitError('');
        const orderData = {
            franchise_id: store.franchise.id,
            customer_name: form.name.trim(), customer_phone: form.phone.trim() || null,
            items: cart.map(item => ({ product_id: item.id, name: item.name, price: item.price, quantity: item.quantity })),
            subtotal, discount_amount: pixDiscount, delivery_fee: deliveryFee, total,
            status: 'pending', delivery: form.orderMode === 'delivery',
            address: form.orderMode === 'delivery' ? form.address.trim() : null,
            customer_reference: form.reference.trim() || null,
            notes: form.notes.trim() || null,
            order_type: 'public', order_mode: form.orderMode,
            payment_method: form.paymentChannel === 'store' ? form.storePaymentMethod : form.onlinePaymentMethod,
            pix_discount_percent: isPixPayment ? PIX_DISCOUNT_PERCENT : 0,
            installments: null,
            delivery_payment_method: form.orderMode === 'delivery' ? (form.paymentChannel === 'online' ? 'online' : 'on_delivery') : null,
            delivery_fee_payer: form.orderMode === 'delivery' ? 'customer' : null,
            coupon_code: appliedCoupon?.code || null,
            coupon_discount: couponDiscount,
            payer_email: form.paymentChannel === 'online' ? form.customerEmail.trim() : null,
            payer_cpf: form.paymentChannel === 'online' ? form.customerCpf.trim() : null,
        };
        const { data: inserted, error } = await supabase.from('customer_orders').insert(orderData).select().single();
        if (error) {
            setSubmitError('Erro ao criar pedido. Tente novamente.');
            setSubmitting(false);
            return;
        }
        // Store payment: just confirm
        if (form.paymentChannel === 'store') {
            setSubmitted(true);
            setCart([]);
            setAppliedCoupon(null);
            setCouponCode('');
            setForm({ name: '', phone: '', address: '', reference: '', notes: '', orderMode: 'delivery', paymentChannel: 'store', storePaymentMethod: 'cash', onlinePaymentMethod: 'pix', customerEmail: '', customerCpf: '' });
            setSubmitting(false);
            return;
        }
        // Se o cupom zerar os produtos e não houver taxa de entrega, não existe valor
        // positivo para o Mercado Pago cobrar. O pedido continua válido e é registrado
        // como aprovado sem abrir uma preferência de R$ 0,00.
        if (total <= 0) {
            await supabase.from('customer_orders').update({ mp_payment_status: 'approved' }).eq('id', inserted.id);
            setSubmitted(true);
            setCart([]);
            setAppliedCoupon(null);
            setCouponCode('');
            setForm({ name: '', phone: '', address: '', reference: '', notes: '', orderMode: 'delivery', paymentChannel: 'store', storePaymentMethod: 'cash', onlinePaymentMethod: 'pix', customerEmail: '', customerCpf: '' });
            setSubmitting(false);
            return;
        }
        // Online payment: create Mercado Pago preference and redirect
        try {
            const apiUrl = `${"https://sgvojdgbjvynnoherpqj.supabase.co"}/functions/v1/mercadopago`;
            const mpResp = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'apikey': "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNndm9qZGdianZ5bm5vaGVycHFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3NDE4ODIsImV4cCI6MjEwMTMxNzg4Mn0.RuAHGD0VCcDxIL4jfSFXjyiC4ZzVgRAZna3j80ovIf4" },
                body: JSON.stringify({
                    action: 'create_preference',
                    // O Mercado Pago calcula a cobrança pela soma dos itens recebidos.
                    // Enviamos o TOTAL FINAL do pedido em uma única linha para garantir que
                    // cupom + desconto PIX + preço promocional + taxa de entrega sejam cobrados
                    // exatamente como aparecem no checkout da loja.
                    items: [{
                            id: inserted.id,
                            title: `Pedido ${store.franchise.name}`,
                            description: [
                                cart.map(item => `${item.quantity}x ${item.name}`).join(', '),
                                appliedCoupon ? `Cupom ${appliedCoupon.code}: -R$ ${couponDiscount.toFixed(2)}` : '',
                                pixDiscount > 0 ? `PIX ${PIX_DISCOUNT_PERCENT}%: -R$ ${pixDiscount.toFixed(2)}` : '',
                                deliveryFee > 0 ? `Entrega: R$ ${deliveryFee.toFixed(2)}` : '',
                            ].filter(Boolean).join(' | ').slice(0, 250),
                            quantity: 1,
                            unit_price: total,
                        }],
                    payer: { email: form.customerEmail.trim(), cpf: form.customerCpf.trim() },
                    external_reference: inserted.id,
                    payment_method: form.onlinePaymentMethod === 'pix' ? 'pix' : undefined,
                    notification_url: `${"https://sgvojdgbjvynnoherpqj.supabase.co"}/functions/v1/mercadopago-webhook`,
                }),
            });
            if (!mpResp.ok) {
                const errData = await mpResp.json().catch(() => ({}));
                throw new Error(errData.error || `Erro no Mercado Pago (${mpResp.status})`);
            }
            const mpData = await mpResp.json();
            // Save preference ID on the order
            await supabase.from('customer_orders').update({ mp_preference_id: mpData.preference_id }).eq('id', inserted.id);
            // Redirect to Mercado Pago checkout
            const checkoutUrl = mpData.init_point ?? mpData.sandbox_init_point;
            if (checkoutUrl) {
                window.location.href = checkoutUrl;
            }
            else {
                throw new Error('Mercado Pago não retornou URL de checkout');
            }
        }
        catch (err) {
            setSubmitError(err.message || 'Erro ao iniciar pagamento online. O pedido foi criado mas não foi pago.');
            setSubmitting(false);
        }
    };
    if (loading)
        return _jsx("div", { className: "min-h-screen bg-black flex items-center justify-center", children: _jsx("div", { className: "w-8 h-8 border-2 border-zinc-700 border-t-[#FFE500] rounded-full animate-spin" }) });
    if (notFound || !store)
        return _jsx("div", { className: "min-h-screen bg-black text-white flex items-center justify-center p-6", children: _jsxs("div", { className: "text-center", children: [_jsx(AlertCircle, { size: 40, className: "mx-auto text-[#FFE500] mb-3" }), _jsx("h1", { className: "text-xl font-bold", children: "Loja n\u00E3o encontrada" }), _jsx("p", { className: "text-zinc-400 text-sm mt-2", children: "Confira o link e tente novamente." })] }) });
    const logo = store.franchise.logo_url || defaultLogo;
    const categoryList = [
        ...store.categories.filter(category => !hiddenCategoryIds.has(category.id)).slice().sort(compareCategories),
        { id: 'others', name: 'Outros', franchise_id: store.franchise.id, sort_order: Number.MAX_SAFE_INTEGER, created_at: '' },
    ];
    const activePromotions = store.promotions;
    const allImages = (p) => {
        const imgs = [p.image_url, ...(p.gallery_urls ?? [])].filter(Boolean);
        return imgs.length > 0 ? imgs : [];
    };
    const allVideos = (p) => (p.video_urls ?? []).filter(Boolean);
    return _jsxs("div", { className: "min-h-screen bg-zinc-950 text-white", children: [mpReturnStatus && (_jsx("div", { className: `px-4 py-3 text-center text-sm font-bold ${mpReturnStatus === 'success' ? 'bg-green-500/20 text-green-400 border-b border-green-500/30' : mpReturnStatus === 'pending' ? 'bg-amber-500/20 text-amber-400 border-b border-amber-500/30' : 'bg-red-500/20 text-red-400 border-b border-red-500/30'}`, children: mpReturnStatus === 'success' ? 'Pagamento aprovado! A loja foi notificada e vai preparar seu pedido.' : mpReturnStatus === 'pending' ? 'Pagamento pendente. Você receberá a confirmação por e-mail.' : 'Pagamento não concluído. Tente novamente.' })), _jsxs("header", { className: "bg-black border-b border-zinc-800 sticky top-0 z-20", children: [_jsxs("div", { className: "max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-3", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("img", { src: logo, alt: `Logo ${store.franchise.name}`, className: "w-12 h-12 rounded-xl object-contain bg-[#FFE500] border border-[#FFE500]/30" }), _jsxs("div", { children: [_jsx("h1", { className: "text-lg font-black text-[#FFE500]", children: store.franchise.name }), _jsx("p", { className: "text-zinc-500 text-xs", children: "SuplementaA\u00ED" })] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs("button", { onClick: copyLink, className: "border border-zinc-700 text-zinc-300 hover:text-white rounded-lg px-3 py-2 text-sm flex items-center gap-2", children: [_jsx(Link2, { size: 15 }), copied ? 'Link copiado' : 'Compartilhar'] }), _jsxs("button", { onClick: () => setShowCart(true), className: "relative bg-[#FFE500] text-black font-bold rounded-lg px-3 py-2 text-sm flex items-center gap-2", children: [_jsx(ShoppingBag, { size: 16 }), "Sacola", cart.length > 0 && _jsx("span", { className: "absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center", children: cart.reduce((sum, item) => sum + item.quantity, 0) })] })] })] }), _jsxs("div", { className: "max-w-5xl mx-auto px-4 pb-3", children: [_jsxs("div", { className: "relative", children: [_jsx(Search, { size: 18, className: "absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" }), _jsx("input", { type: "text", value: searchQuery, onChange: e => setSearchQuery(e.target.value), placeholder: "Buscar produtos...", className: "w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg pl-10 pr-4 py-2.5 text-sm placeholder-zinc-500 focus:outline-none focus:border-[#FFE500]/50" })] }), _jsxs("div", { className: "relative mt-3 group/category-nav", children: [_jsx("button", { type: "button", "aria-label": "Ver categorias anteriores", onClick: () => categoryScrollRef.current?.scrollBy({ left: -280, behavior: 'smooth' }), className: "hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 items-center justify-center rounded-full bg-[#FFE500] text-black shadow-lg shadow-black/40 opacity-0 group-hover/category-nav:opacity-100 transition-opacity hover:bg-[#FFD000]", children: _jsx(ChevronLeft, { size: 18 }) }), _jsxs("div", { ref: categoryScrollRef, className: "category-scroll flex gap-2 overflow-x-auto pb-3 -mx-1 px-1 md:px-10", style: { scrollbarWidth: 'thin', scrollbarColor: '#FFE500 #27272a' }, children: [_jsx("button", { onClick: () => setActiveCategory('all'), className: `flex-shrink-0 text-sm font-medium rounded-full px-4 py-1.5 transition-colors ${activeCategory === 'all' ? 'bg-[#FFE500] text-black' : 'bg-transparent text-zinc-400 border border-zinc-800 hover:text-white'}`, children: "Todas" }), categoryList.map(cat => (_jsx("button", { onClick: () => setActiveCategory(cat.id), className: `flex-shrink-0 text-sm font-medium rounded-full px-4 py-1.5 transition-colors ${activeCategory === cat.id ? 'bg-[#FFE500] text-black' : 'bg-transparent text-zinc-400 border border-zinc-800 hover:text-white'}`, children: cat.name }, cat.id)))] }), _jsx("button", { type: "button", "aria-label": "Ver pr\u00F3ximas categorias", onClick: () => categoryScrollRef.current?.scrollBy({ left: 280, behavior: 'smooth' }), className: "hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 items-center justify-center rounded-full bg-[#FFE500] text-black shadow-lg shadow-black/40 opacity-0 group-hover/category-nav:opacity-100 transition-opacity hover:bg-[#FFD000]", children: _jsx(ChevronRight, { size: 18 }) })] })] })] }), _jsxs("main", { className: "max-w-5xl mx-auto px-4 py-8 space-y-8", children: [_jsxs("div", { className: "flex flex-wrap gap-3 text-sm text-zinc-300", children: [store.delivery?.address && _jsxs("span", { className: "flex items-center gap-1.5", children: [_jsx(MapPin, { size: 15, className: "text-[#FFE500]" }), store.delivery.address] }), store.delivery?.contact_phone && _jsxs("a", { href: `tel:${store.delivery.contact_phone}`, className: "flex items-center gap-1.5 hover:text-[#FFE500]", children: [_jsx(Phone, { size: 15, className: "text-[#FFE500]" }), store.delivery.contact_phone] }), store.delivery?.enabled && _jsxs("span", { className: "flex items-center gap-1.5 text-green-400", children: [_jsx(Bike, { size: 15 }), "Delivery dispon\u00EDvel"] })] }), activeCategory === 'all' && !searchQuery && activePromotions.length > 0 && (_jsxs("section", { className: "relative rounded-2xl overflow-hidden", children: [_jsx("div", { className: "relative h-56 sm:h-64", children: activePromotions.map((promo, idx) => (_jsxs("div", { className: `absolute inset-0 transition-opacity duration-700 ${idx === promoIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'}`, children: [_jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900" }), promo.image_url && _jsx("img", { src: promo.image_url, alt: promo.title, className: "absolute inset-0 w-full h-full object-cover opacity-60" }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" }), _jsxs("div", { className: "relative h-full flex flex-col justify-end p-6", children: [promo.badge_text && _jsxs("span", { className: "inline-flex items-center gap-1 bg-[#FFE500] text-black text-xs font-black px-3 py-1 rounded-full w-fit mb-2", children: [_jsx(Ticket, { size: 12 }), promo.badge_text] }), _jsx("h2", { className: "text-2xl font-black text-white mb-1", children: promo.title }), promo.description && _jsx("p", { className: "text-zinc-200 text-sm line-clamp-2", children: promo.description })] })] }, promo.id))) }), activePromotions.length > 1 && (_jsxs(_Fragment, { children: [_jsx("button", { onClick: () => setPromoIndex((promoIndex - 1 + activePromotions.length) % activePromotions.length), className: "absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors", children: _jsx(ChevronLeft, { size: 20 }) }), _jsx("button", { onClick: () => setPromoIndex((promoIndex + 1) % activePromotions.length), className: "absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors", children: _jsx(ChevronRight, { size: 20 }) }), _jsx("div", { className: "absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5", children: activePromotions.map((_, idx) => (_jsx("button", { onClick: () => setPromoIndex(idx), className: `h-1.5 rounded-full transition-all ${idx === promoIndex ? 'w-6 bg-[#FFE500]' : 'w-1.5 bg-white/40'}` }, idx))) })] }))] })), _jsxs("section", { className: "space-y-8", children: [categoryList.map(category => { const products = filteredByCategory.get(category.id) ?? []; if (products.length === 0)
                                return null; return _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-bold mb-4", children: category.name }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", children: products.map(product => _jsxs("article", { onClick: () => { setDetailProduct(product); setDetailImageIndex(0); setDetailMediaTab('photos'); setActiveVideoIndex(0); }, className: "bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-[#FFE500]/40 transition-all cursor-pointer group", children: [_jsx("div", { className: "aspect-square bg-zinc-800 overflow-hidden flex items-center justify-center", children: product.image_url ? _jsx("img", { src: product.image_url, alt: product.name, className: "w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" }) : _jsx("div", { className: "h-full flex items-center justify-center", children: _jsx(ShoppingBag, { size: 32, className: "text-zinc-600" }) }) }), _jsxs("div", { className: "p-4", children: [_jsx("h3", { className: "font-bold", children: product.name }), product.description && _jsx("p", { className: "text-zinc-400 text-sm mt-1 line-clamp-2", children: product.description }), (product.brand || product.flavor || product.weight) && _jsxs("div", { className: "flex flex-wrap gap-1.5 mt-2", children: [product.brand && _jsx("span", { className: "text-xs bg-zinc-800 text-zinc-300 rounded px-2 py-0.5", children: product.brand }), product.flavor && _jsx("span", { className: "text-xs bg-zinc-800 text-zinc-300 rounded px-2 py-0.5", children: product.flavor }), product.weight && _jsx("span", { className: "text-xs bg-zinc-800 text-zinc-300 rounded px-2 py-0.5", children: product.weight })] }), _jsxs("div", { className: "flex items-center justify-between mt-3", children: [_jsxs("div", { children: [_jsxs("p", { className: "text-green-400 font-black", children: ["R$ ", getProductPixPrice(product).toFixed(2), " ", _jsx("span", { className: "text-xs font-bold", children: "no PIX" })] }), _jsxs("p", { className: "text-zinc-500 text-xs", children: ["R$ ", getProductBasePrice(product).toFixed(2), " nos demais pagamentos", product.discount_price ? _jsxs("span", { className: "ml-1 text-zinc-600 line-through", children: ["R$ ", product.price.toFixed(2)] }) : null] }), _jsxs("p", { className: "text-green-500/80 text-[11px] font-semibold", children: [PIX_DISCOUNT_PERCENT, "% de desconto no PIX"] })] }), _jsx("span", { className: "text-zinc-500 text-xs group-hover:text-[#FFE500] transition-colors", children: "Ver detalhes" })] })] })] }, product.id)) })] }, category.id); }), filteredProducts.length === 0 && _jsxs("div", { className: "text-center py-16", children: [_jsx(Store, { size: 40, className: "mx-auto text-zinc-700 mb-3" }), _jsx("p", { className: "text-zinc-400", children: searchQuery ? 'Nenhum produto encontrado para sua busca.' : 'O cardápio desta loja ainda está sendo preparado.' })] })] })] }), detailProduct && (() => {
                const imgs = allImages(detailProduct);
                const activeImg = imgs[detailImageIndex] ?? imgs[0] ?? null;
                const vids = allVideos(detailProduct);
                return (_jsx("div", { className: "fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4", onClick: () => { setDetailProduct(null); setDetailImageIndex(0); }, children: _jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto", onClick: e => e.stopPropagation(), children: [_jsxs("div", { className: "relative", children: [_jsx("button", { onClick: () => { setDetailProduct(null); setDetailImageIndex(0); }, className: "absolute top-3 left-3 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 transition-colors z-10", children: _jsx(ChevronLeft, { size: 20 }) }), _jsx("button", { onClick: () => { setDetailProduct(null); setDetailImageIndex(0); }, className: "absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 transition-colors z-10", children: _jsx(X, { size: 20 }) }), detailMediaTab === 'photos' ? (_jsxs("div", { className: "w-full aspect-square bg-black flex items-center justify-center", children: [activeImg ? _jsx("img", { src: activeImg, alt: detailProduct.name, className: "w-full h-full object-contain" }) : _jsx("div", { className: "w-full h-full bg-zinc-800 flex items-center justify-center", children: _jsx(Package, { size: 48, className: "text-zinc-600" }) }), imgs.length > 1 && (_jsxs(_Fragment, { children: [_jsx("button", { onClick: () => setDetailImageIndex((detailImageIndex - 1 + imgs.length) % imgs.length), className: "absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors", children: _jsx(ChevronLeft, { size: 20 }) }), _jsx("button", { onClick: () => setDetailImageIndex((detailImageIndex + 1) % imgs.length), className: "absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors", children: _jsx(ChevronRight, { size: 20 }) })] }))] })) : (_jsx("div", { className: "w-full aspect-square bg-black flex items-center justify-center", children: vids.length > 0 ? (_jsx("video", { src: vids[activeVideoIndex], controls: true, autoPlay: true, className: "w-full h-full object-contain" })) : (_jsx("p", { className: "text-zinc-500 text-sm", children: "Nenhum v\u00EDdeo dispon\u00EDvel." })) }))] }), (imgs.length > 0 || vids.length > 0) && (_jsxs("div", { className: "flex gap-2 p-3 overflow-x-auto", children: [imgs.length > 0 && imgs.map((img, idx) => (_jsx("button", { onClick: () => { setDetailMediaTab('photos'); setDetailImageIndex(idx); }, className: `flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${detailMediaTab === 'photos' && idx === detailImageIndex ? 'border-[#FFE500]' : 'border-transparent'}`, children: _jsx("img", { src: img, alt: "", className: "w-full h-full object-cover" }) }, `img${idx}`))), vids.length > 0 && vids.map((vid, idx) => (_jsx("button", { onClick: () => { setDetailMediaTab('videos'); setActiveVideoIndex(idx); }, className: `flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors flex items-center justify-center bg-zinc-800 ${detailMediaTab === 'videos' && idx === activeVideoIndex ? 'border-[#FFE500]' : 'border-transparent'}`, children: _jsx(Play, { size: 18, className: "text-white" }) }, `vid${idx}`)))] })), _jsxs("div", { className: "p-5 space-y-4", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-xl font-black text-white", children: detailProduct.name }), _jsxs("div", { className: "mt-1", children: [_jsxs("p", { className: "text-green-400 text-xl font-black", children: ["R$ ", getProductPixPrice(detailProduct).toFixed(2), " ", _jsx("span", { className: "text-sm font-bold", children: "no PIX" })] }), _jsxs("p", { className: "text-zinc-400 text-sm", children: ["R$ ", getProductBasePrice(detailProduct).toFixed(2), " nos demais pagamentos ", detailProduct.discount_price ? _jsxs("span", { className: "text-zinc-600 line-through ml-1", children: ["R$ ", detailProduct.price.toFixed(2)] }) : null] }), _jsxs("p", { className: "text-green-500/80 text-xs font-semibold mt-0.5", children: [PIX_DISCOUNT_PERCENT, "% de desconto no PIX"] })] })] }), detailProduct.description && _jsx("p", { className: "text-zinc-300 text-sm", children: detailProduct.description }), detailProduct.long_description && _jsxs("div", { children: [_jsx("h3", { className: "text-white font-bold text-sm mb-1", children: "Detalhes" }), _jsx("p", { className: "text-zinc-400 text-sm whitespace-pre-wrap", children: detailProduct.long_description })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [detailProduct.brand && _jsxs("div", { className: "bg-zinc-800/50 rounded-lg p-3", children: [_jsx("p", { className: "text-zinc-500 text-xs", children: "Marca" }), _jsx("p", { className: "text-white text-sm font-medium", children: detailProduct.brand })] }), detailProduct.flavor && _jsxs("div", { className: "bg-zinc-800/50 rounded-lg p-3", children: [_jsx("p", { className: "text-zinc-500 text-xs", children: "Sabor" }), _jsx("p", { className: "text-white text-sm font-medium", children: detailProduct.flavor })] }), detailProduct.weight && _jsxs("div", { className: "bg-zinc-800/50 rounded-lg p-3", children: [_jsx("p", { className: "text-zinc-500 text-xs", children: "Peso / Tamanho" }), _jsx("p", { className: "text-white text-sm font-medium", children: detailProduct.weight })] }), detailProduct.ingredients && _jsxs("div", { className: "bg-zinc-800/50 rounded-lg p-3", children: [_jsx("p", { className: "text-zinc-500 text-xs", children: "Ingredientes" }), _jsx("p", { className: "text-white text-sm font-medium", children: detailProduct.ingredients })] }), detailProduct.nutritional_info && _jsxs("div", { className: "bg-zinc-800/50 rounded-lg p-3", children: [_jsx("p", { className: "text-zinc-500 text-xs", children: "Informa\u00E7\u00E3o Nutricional" }), _jsx("p", { className: "text-white text-sm font-medium", children: detailProduct.nutritional_info })] }), detailProduct.usage_instructions && _jsxs("div", { className: "bg-zinc-800/50 rounded-lg p-3", children: [_jsx("p", { className: "text-zinc-500 text-xs", children: "Como Usar" }), _jsx("p", { className: "text-white text-sm font-medium", children: detailProduct.usage_instructions })] })] }), _jsxs("button", { onClick: () => { addToCart(detailProduct); setDetailProduct(null); setDetailImageIndex(0); setShowCart(true); }, className: "w-full bg-[#FFE500] hover:bg-[#FFD000] text-black font-bold rounded-lg py-3 flex items-center justify-center gap-2 transition-all", children: [_jsx(Plus, { size: 18 }), " Adicionar \u00E0 sacola \u2014 R$ ", getProductBasePrice(detailProduct).toFixed(2)] }), _jsxs("button", { onClick: () => { setDetailProduct(null); setDetailImageIndex(0); }, className: "w-full bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg py-2.5 flex items-center justify-center gap-2 transition-all", children: [_jsx(ChevronLeft, { size: 16 }), " Voltar ao card\u00E1pio"] })] })] }) }));
            })(), showCart && _jsx("div", { className: "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4", onClick: () => { setShowCart(false); setSubmitted(false); }, children: _jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto", onClick: event => event.stopPropagation(), children: [_jsxs("div", { className: "p-5 border-b border-zinc-800 flex justify-between", children: [_jsx("h2", { className: "font-bold text-lg", children: submitted ? 'Pedido enviado' : 'Sua sacola' }), _jsx("button", { onClick: () => { setShowCart(false); setSubmitted(false); }, children: _jsx(X, { size: 20 }) })] }), submitted ? _jsxs("div", { className: "p-8 text-center", children: [_jsx(Check, { size: 42, className: "mx-auto text-green-400 mb-3" }), _jsx("p", { className: "text-zinc-300", children: "A loja recebeu seu pedido e entrar\u00E1 em contato." }), _jsx("button", { onClick: () => { setShowCart(false); setSubmitted(false); }, className: "mt-4 bg-[#FFE500] hover:bg-[#FFD000] text-black font-bold rounded-lg px-4 py-2 text-sm", children: "Fazer novo pedido" })] }) : _jsx("div", { className: "p-5 space-y-4", children: cart.length === 0 ? _jsx("p", { className: "text-zinc-400 text-center py-6", children: "Adicione produtos para fazer um pedido." }) : _jsxs(_Fragment, { children: [_jsx("div", { className: "space-y-2", children: cart.map(item => _jsxs("div", { className: "flex items-center gap-3 bg-zinc-800/60 rounded-lg p-3", children: [item.image_url ? _jsx("img", { src: item.image_url, alt: item.name, className: "w-12 h-12 rounded-lg object-contain bg-zinc-900 flex-shrink-0" }) : _jsx("div", { className: "w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0", children: _jsx(Package, { size: 18, className: "text-zinc-600" }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-medium truncate", children: item.name }), _jsxs("p", { className: "text-[#FFE500] text-xs", children: ["R$ ", (item.price * item.quantity).toFixed(2)] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { onClick: () => changeQuantity(item.id, -1), className: "w-7 h-7 rounded bg-zinc-700 flex items-center justify-center", children: _jsx(Minus, { size: 13 }) }), _jsx("span", { className: "text-sm", children: item.quantity }), _jsx("button", { onClick: () => changeQuantity(item.id, 1), className: "w-7 h-7 rounded bg-zinc-700 flex items-center justify-center", children: _jsx(Plus, { size: 13 }) })] })] }, item.id)) }), _jsxs("form", { onSubmit: submitOrder, className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1.5", children: "Tipo de pedido" }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsxs("button", { type: "button", onClick: () => setForm({ ...form, orderMode: 'pickup', storePaymentMethod: 'cash' }), className: `flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold border transition-all ${form.orderMode === 'pickup' ? 'bg-[#FFE500] text-black border-[#FFE500]' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`, children: [_jsx(Store, { size: 16 }), " Retirada"] }), _jsxs("button", { type: "button", onClick: () => setForm({ ...form, orderMode: 'delivery' }), className: `flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold border transition-all ${form.orderMode === 'delivery' ? 'bg-[#FFE500] text-black border-[#FFE500]' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`, children: [_jsx(Truck, { size: 16 }), " Entrega"] })] })] }), _jsx("input", { required: true, placeholder: "Seu nome", value: form.name, onChange: e => setForm({ ...form, name: e.target.value }), className: "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), _jsx("input", { required: true, placeholder: "Telefone / WhatsApp", value: form.phone, onChange: e => setForm({ ...form, phone: e.target.value }), className: "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), form.orderMode === 'delivery' && _jsxs(_Fragment, { children: [_jsx("input", { required: true, placeholder: "Endere\u00E7o de entrega (rua, n\u00FAmero, bairro)", value: form.address, onChange: e => setForm({ ...form, address: e.target.value }), className: "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), _jsx("input", { placeholder: "Ponto de refer\u00EAncia", value: form.reference, onChange: e => setForm({ ...form, reference: e.target.value }), className: "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), _jsx("textarea", { placeholder: "Observa\u00E7\u00F5es", value: form.notes, onChange: e => setForm({ ...form, notes: e.target.value }), rows: 2, className: "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-[#FFE500]" }), _jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1.5", children: "Cupom de desconto" }), appliedCoupon ? (_jsxs("div", { className: "flex items-center justify-between bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-2", children: [_jsxs("div", { children: [_jsxs("p", { className: "text-green-400 text-sm font-bold", children: [appliedCoupon.code, " aplicado!"] }), _jsx("p", { className: "text-zinc-500 text-xs", children: appliedCoupon.discount_type === 'percent' ? `${appliedCoupon.discount_value}% de desconto` : `R$ ${appliedCoupon.discount_value} de desconto` })] }), _jsx("button", { type: "button", onClick: () => { setAppliedCoupon(null); setCouponCode(''); }, className: "text-red-400", children: _jsx(X, { size: 16 }) })] })) : (_jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "text", value: couponCode, onChange: e => setCouponCode(e.target.value), placeholder: "Digite o cupom", className: "flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), _jsx("button", { type: "button", onClick: applyCoupon, className: "bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-bold rounded-lg px-4 py-2", children: "Aplicar" })] })), couponError && _jsx("p", { className: "text-red-400 text-xs mt-1", children: couponError })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1.5", children: "Forma de pagamento" }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsxs("button", { type: "button", onClick: () => setForm({ ...form, paymentChannel: 'store' }), className: `flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-bold border transition-all ${form.paymentChannel === 'store' ? 'bg-[#FFE500] text-black border-[#FFE500]' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`, children: [_jsx(Store, { size: 16 }), " Pagamento na loja"] }), _jsxs("button", { type: "button", onClick: () => setForm({ ...form, paymentChannel: 'online' }), className: `flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-bold border transition-all ${form.paymentChannel === 'online' ? 'bg-[#FFE500] text-black border-[#FFE500]' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`, children: [_jsx(Wallet, { size: 16 }), " Online e PIX"] })] }), _jsx("p", { className: "text-zinc-500 text-xs mt-1.5", children: form.paymentChannel === 'store'
                                                            ? 'O entregador leva a maquininha para pagar no cliente (cartão ou dinheiro).'
                                                            : 'Pagamento via Mercado Pago (PIX, cartão de crédito ou débito) — o pedido é confirmado após o pagamento.' })] }), form.paymentChannel === 'store' && (_jsx("div", { className: "grid grid-cols-3 gap-2", children: [
                                                    { key: 'credit_card', label: 'Crédito', icon: _jsx(CreditCard, { size: 15 }) },
                                                    { key: 'debit_card', label: 'Débito', icon: _jsx(CreditCard, { size: 15 }) },
                                                    { key: 'cash', label: 'Dinheiro', icon: _jsx(Banknote, { size: 15 }) },
                                                ].map(pm => (_jsxs("button", { type: "button", onClick: () => setForm({ ...form, storePaymentMethod: pm.key }), className: `flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold border transition-all ${form.storePaymentMethod === pm.key ? 'bg-[#FFE500] text-black border-[#FFE500]' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`, children: [pm.icon, " ", pm.label] }, pm.key))) })), form.paymentChannel === 'online' && (_jsxs("div", { className: "space-y-3", children: [_jsx("div", { className: "grid grid-cols-3 gap-2", children: [
                                                            { key: 'pix', label: `PIX -${PIX_DISCOUNT_PERCENT}%`, icon: _jsx(Wallet, { size: 15 }) },
                                                            { key: 'credit_card', label: 'Crédito', icon: _jsx(CreditCard, { size: 15 }) },
                                                            { key: 'debit_card', label: 'Débito', icon: _jsx(CreditCard, { size: 15 }) },
                                                        ].map(pm => (_jsxs("button", { type: "button", onClick: () => setForm({ ...form, onlinePaymentMethod: pm.key }), className: `flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold border transition-all ${form.onlinePaymentMethod === pm.key ? 'bg-[#FFE500] text-black border-[#FFE500]' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`, children: [pm.icon, " ", pm.label] }, pm.key))) }), _jsx("input", { type: "email", required: true, placeholder: "E-mail para receber a cobran\u00E7a", value: form.customerEmail, onChange: e => setForm({ ...form, customerEmail: e.target.value }), className: "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), _jsx("input", { type: "text", required: true, placeholder: "CPF do pagador", value: form.customerCpf, onChange: e => setForm({ ...form, customerCpf: e.target.value }), className: "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), _jsx("div", { className: `${isPixPayment ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'} border rounded-lg p-2.5 text-xs`, children: isPixPayment
                                                            ? `PIX selecionado: ${PIX_DISCOUNT_PERCENT}% de desconto aplicado automaticamente ao valor dos produtos. Você pagará o total final já descontado no Mercado Pago.`
                                                            : 'Após enviar o pedido, você será redirecionado para o checkout do Mercado Pago para concluir o pagamento.' })] })), _jsxs("div", { className: "bg-zinc-800/50 rounded-lg p-3 space-y-1.5 text-sm", children: [_jsxs("div", { className: "flex justify-between text-zinc-400", children: [_jsx("span", { children: "Subtotal" }), _jsxs("span", { children: ["R$ ", subtotal.toFixed(2)] })] }), couponDiscount > 0 && _jsxs("div", { className: "flex justify-between text-green-400", children: [_jsxs("span", { children: ["Cupom (", appliedCoupon?.code, ")"] }), _jsxs("span", { children: ["- R$ ", couponDiscount.toFixed(2)] })] }), pixDiscount > 0 && _jsxs("div", { className: "flex justify-between text-green-400 font-medium", children: [_jsxs("span", { children: ["Desconto PIX (", PIX_DISCOUNT_PERCENT, "%)"] }), _jsxs("span", { children: ["- R$ ", pixDiscount.toFixed(2)] })] }), deliveryFee > 0 && (_jsxs("div", { className: "flex justify-between text-zinc-400", children: [_jsxs("span", { children: ["Taxa de entrega", storePercent > 0 ? ` (loja paga ${storePercent}%)` : ''] }), _jsxs("span", { children: ["R$ ", deliveryFee.toFixed(2)] })] })), _jsxs("div", { className: "flex justify-between text-white font-bold border-t border-zinc-700 pt-1.5", children: [_jsx("span", { children: "Total" }), _jsxs("span", { className: "text-[#FFE500]", children: ["R$ ", total.toFixed(2)] })] })] }), _jsxs("div", { className: "flex items-center justify-between border-t border-zinc-800 pt-3", children: [_jsxs("span", { className: "font-bold", children: ["Total R$ ", total.toFixed(2)] }), _jsxs("button", { type: "submit", disabled: submitting, className: "bg-[#FFE500] text-black font-bold rounded-lg px-4 py-2 disabled:opacity-60 flex items-center gap-2", children: [submitting && _jsx("div", { className: "w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" }), submitting ? 'Processando...' : form.paymentChannel === 'online' ? 'Ir para pagamento' : 'Enviar pedido'] })] }), submitError && _jsx("p", { className: "text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2", children: submitError })] })] }) })] }) })] });
}
