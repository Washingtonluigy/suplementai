import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useMemo } from 'react';
import { supabase } from '/app/lib/supabase.js';
import { X, BarChart3, TrendingUp, DollarSign, Store, Filter, Bike, CreditCard, Receipt, Eye, User } from 'lucide-react';
export default function ReportsTool({ onClose }) {
    const [sales, setSales] = useState([]);
    const [franchises, setFranchises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterFran, setFilterFran] = useState('all');
    const [filterStart, setFilterStart] = useState('');
    const [filterEnd, setFilterEnd] = useState('');
    const [filterProduct, setFilterProduct] = useState('');
    const [filterCampaign, setFilterCampaign] = useState('');
    const [filterDeliverySource, setFilterDeliverySource] = useState('all');
    const [filterPaymentMethod, setFilterPaymentMethod] = useState('all');
    const [filterSaleType, setFilterSaleType] = useState('all');
    const [filterUser, setFilterUser] = useState('all');
    const [franchiseUsers, setFranchiseUsers] = useState([]);
    const [showDetails, setShowDetails] = useState(false);
    useEffect(() => {
        (async () => {
            const [{ data: saleData }, { data: franData }, { data: userData }] = await Promise.all([
                supabase.from('sales').select('*'),
                supabase.from('franchises').select('*').order('name'),
                supabase.from('franchise_users').select('*').order('name'),
            ]);
            if (saleData)
                setSales(saleData);
            if (franData)
                setFranchises(franData);
            if (userData)
                setFranchiseUsers(userData);
            setLoading(false);
        })();
    }, []);
    const franName = (id) => franchises.find(f => f.id === id)?.name ?? '—';
    const userName = (id) => franchiseUsers.find(u => u.id === id)?.name ?? id ?? '—';
    const filtered = useMemo(() => {
        return sales.filter(s => {
            if (filterFran !== 'all' && s.franchise_id !== filterFran)
                return false;
            const d = new Date(s.created_at);
            if (filterStart && d < new Date(filterStart))
                return false;
            if (filterEnd && d > new Date(filterEnd + 'T23:59:59'))
                return false;
            if (filterCampaign && !(s.campaign_name ?? '').toLowerCase().includes(filterCampaign.toLowerCase()))
                return false;
            if (filterProduct && !s.items.some((item) => String(item.name ?? '').toLowerCase().includes(filterProduct.toLowerCase())))
                return false;
            if (filterDeliverySource === 'delivery' && !s.delivery_source)
                return false;
            if (filterDeliverySource === 'counter' && s.delivery_source)
                return false;
            if (filterDeliverySource !== 'all' && filterDeliverySource !== 'delivery' && filterDeliverySource !== 'counter' && s.delivery_source !== filterDeliverySource)
                return false;
            if (filterPaymentMethod !== 'all' && s.payment_method !== filterPaymentMethod)
                return false;
            if (filterSaleType !== 'all' && s.sale_type !== filterSaleType)
                return false;
            if (filterUser !== 'all' && s.user_id !== filterUser)
                return false;
            return true;
        });
    }, [sales, filterFran, filterStart, filterEnd, filterProduct, filterCampaign, filterDeliverySource, filterPaymentMethod, filterSaleType, filterUser]);
    const totalRevenue = filtered.reduce((sum, s) => sum + s.total, 0);
    const totalSales = filtered.length;
    const avgTicket = totalSales > 0 ? totalRevenue / totalSales : 0;
    const totalDiscount = filtered.reduce((sum, s) => sum + (s.discount ?? 0), 0);
    const totalDeliveryFee = filtered.reduce((sum, s) => sum + (s.delivery_fee ?? 0), 0);
    const storePaidDelivery = filtered.filter(s => s.delivery_fee_payer === 'store').reduce((sum, s) => sum + (s.delivery_fee ?? 0), 0);
    const customerPaidDelivery = filtered.filter(s => s.delivery_fee_payer === 'customer').reduce((sum, s) => sum + (s.delivery_fee ?? 0), 0);
    const byPaymentMethod = useMemo(() => {
        const map = new Map();
        const labels = { pix: 'PIX', credit_card: 'Cartão Crédito', debit_card: 'Cartão Débito', cash: 'Dinheiro', meal_voucher: 'Vale-refeição' };
        for (const s of filtered) {
            const key = s.payment_method ?? 'other';
            const label = s.payment_method ? (labels[s.payment_method] ?? s.payment_method) : 'Outro';
            const entry = map.get(key) ?? { label, total: 0, count: 0 };
            entry.total += s.total;
            entry.count += 1;
            map.set(key, entry);
        }
        return Array.from(map.entries()).map(([key, val]) => ({ key, ...val })).sort((a, b) => b.total - a.total);
    }, [filtered]);
    const bySaleType = useMemo(() => {
        const map = new Map();
        const labels = { counter: 'Balcão', sponsorship: 'Patrocínio', tasting: 'Degustação', gift: 'Brindes' };
        for (const s of filtered) {
            const key = s.sale_type ?? 'counter';
            const label = labels[s.sale_type] ?? s.sale_type ?? 'Balcão';
            const entry = map.get(key) ?? { label, total: 0, count: 0 };
            entry.total += s.total;
            entry.count += 1;
            map.set(key, entry);
        }
        return Array.from(map.entries()).map(([key, val]) => ({ key, ...val })).sort((a, b) => b.total - a.total);
    }, [filtered]);
    const byDeliverySource = useMemo(() => {
        const map = new Map();
        const labels = { whatsapp: 'WhatsApp', ifood: 'iFood', uber_eats: 'Uber Eats', rappi: 'Rappi', '99delivery': '99 Delivery', phone: 'Telefone', other: 'Outro' };
        for (const s of filtered) {
            const key = s.delivery_source ?? 'counter';
            const label = s.delivery_source ? (labels[s.delivery_source] ?? s.delivery_source) : 'Balcão';
            const entry = map.get(key) ?? { label, total: 0, count: 0 };
            entry.total += s.total;
            entry.count += 1;
            map.set(key, entry);
        }
        return Array.from(map.entries()).map(([key, val]) => ({ key, ...val })).sort((a, b) => b.total - a.total);
    }, [filtered]);
    const maxSource = Math.max(...byDeliverySource.map(d => d.total), 1);
    const byFranchise = useMemo(() => {
        const map = new Map();
        for (const f of franchises)
            map.set(f.id, { name: f.name, total: 0, count: 0 });
        for (const s of filtered) {
            const e = map.get(s.franchise_id);
            if (e) {
                e.total += s.total;
                e.count += 1;
            }
        }
        return Array.from(map.values()).sort((a, b) => b.total - a.total);
    }, [filtered, franchises]);
    const maxFran = Math.max(...byFranchise.map(f => f.total), 1);
    const byMonth = useMemo(() => {
        const map = new Map();
        for (const s of filtered) {
            const d = new Date(s.created_at);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            map.set(key, (map.get(key) ?? 0) + s.total);
        }
        return Array.from(map.entries()).sort().slice(-6);
    }, [filtered]);
    const maxMonth = Math.max(...byMonth.map(m => m[1]), 1);
    const monthLabel = (key) => {
        const [y, m] = key.split('-');
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        return `${months[parseInt(m) - 1]}/${y.slice(2)}`;
    };
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm", onClick: onClose, children: _jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto", onClick: e => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center justify-between p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-lg bg-[#FFE500]/10 flex items-center justify-center", children: _jsx(BarChart3, { size: 20, className: "text-[#FFE500]" }) }), _jsxs("div", { children: [_jsx("h2", { className: "font-bold text-white text-lg", children: "Relat\u00F3rios" }), _jsx("p", { className: "text-zinc-500 text-xs", children: "Vis\u00E3o geral e unificada das unidades" })] })] }), _jsx("button", { onClick: onClose, className: "text-zinc-400 hover:text-white transition-colors", children: _jsx(X, { size: 22 }) })] }), _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 mb-6", children: [_jsxs("div", { className: "flex items-center gap-2 mb-3", children: [_jsx(Filter, { size: 16, className: "text-[#FFE500]" }), _jsx("span", { className: "text-white text-sm font-medium", children: "Filtros" })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Franquia" }), _jsxs("select", { value: filterFran, onChange: e => setFilterFran(e.target.value), className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]", children: [_jsx("option", { value: "all", children: "Todas" }), franchises.map(f => _jsx("option", { value: f.id, children: f.name }, f.id))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "De" }), _jsx("input", { type: "date", value: filterStart, onChange: e => setFilterStart(e.target.value), className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "At\u00E9" }), _jsx("input", { type: "date", value: filterEnd, onChange: e => setFilterEnd(e.target.value), className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Produto" }), _jsx("input", { value: filterProduct, onChange: e => setFilterProduct(e.target.value), placeholder: "Nome do produto", className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Campanha" }), _jsx("input", { value: filterCampaign, onChange: e => setFilterCampaign(e.target.value), placeholder: "Nome da campanha", className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Origem da venda" }), _jsxs("select", { value: filterDeliverySource, onChange: e => setFilterDeliverySource(e.target.value), className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]", children: [_jsx("option", { value: "all", children: "Todas" }), _jsx("option", { value: "counter", children: "Balc\u00E3o (sem entrega)" }), _jsx("option", { value: "delivery", children: "Delivery (todas plataformas)" }), _jsx("option", { value: "whatsapp", children: "WhatsApp" }), _jsx("option", { value: "ifood", children: "iFood" }), _jsx("option", { value: "uber_eats", children: "Uber Eats" }), _jsx("option", { value: "rappi", children: "Rappi" }), _jsx("option", { value: "99delivery", children: "99 Delivery" }), _jsx("option", { value: "phone", children: "Telefone" }), _jsx("option", { value: "other", children: "Outro" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Forma de pagamento" }), _jsxs("select", { value: filterPaymentMethod, onChange: e => setFilterPaymentMethod(e.target.value), className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]", children: [_jsx("option", { value: "all", children: "Todas" }), _jsx("option", { value: "pix", children: "PIX" }), _jsx("option", { value: "credit_card", children: "Cart\u00E3o de Cr\u00E9dito" }), _jsx("option", { value: "debit_card", children: "Cart\u00E3o de D\u00E9bito" }), _jsx("option", { value: "cash", children: "Dinheiro" }), _jsx("option", { value: "meal_voucher", children: "Vale-refei\u00E7\u00E3o" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Tipo de opera\u00E7\u00E3o" }), _jsxs("select", { value: filterSaleType, onChange: e => setFilterSaleType(e.target.value), className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]", children: [_jsx("option", { value: "all", children: "Todas" }), _jsx("option", { value: "counter", children: "Balc\u00E3o" }), _jsx("option", { value: "sponsorship", children: "Patroc\u00EDnio" }), _jsx("option", { value: "tasting", children: "Degusta\u00E7\u00E3o" }), _jsx("option", { value: "gift", children: "Brindes" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Usu\u00E1rio" }), _jsxs("select", { value: filterUser, onChange: e => setFilterUser(e.target.value), className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]", children: [_jsx("option", { value: "all", children: "Todos" }), franchiseUsers.map(u => _jsx("option", { value: u.id, children: u.name }, u.id))] })] })] })] }), _jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6", children: [_jsxs("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-xl p-5", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("p", { className: "text-zinc-400 text-sm", children: "Faturamento" }), _jsx(DollarSign, { size: 20, className: "text-[#FFE500]" })] }), _jsxs("p", { className: "text-2xl font-bold text-white", children: ["R$ ", totalRevenue.toFixed(2)] })] }), _jsxs("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-xl p-5", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("p", { className: "text-zinc-400 text-sm", children: "Vendas" }), _jsx(TrendingUp, { size: 20, className: "text-[#FFE500]" })] }), _jsx("p", { className: "text-2xl font-bold text-white", children: totalSales })] }), _jsxs("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-xl p-5", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("p", { className: "text-zinc-400 text-sm", children: "Ticket m\u00E9dio" }), _jsx(Store, { size: 20, className: "text-[#FFE500]" })] }), _jsxs("p", { className: "text-2xl font-bold text-white", children: ["R$ ", avgTicket.toFixed(2)] })] }), _jsxs("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-xl p-5", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("p", { className: "text-zinc-400 text-sm", children: "Descontos" }), _jsx(DollarSign, { size: 20, className: "text-[#FFE500]" })] }), _jsxs("p", { className: "text-2xl font-bold text-white", children: ["R$ ", totalDiscount.toFixed(2)] })] })] }), totalDeliveryFee > 0 && (_jsxs("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 mb-6", children: [_jsxs("h3", { className: "text-white font-bold text-sm mb-4 flex items-center gap-2", children: [_jsx(Bike, { size: 16, className: "text-[#FFE500]" }), " Taxas de Entrega"] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-zinc-400 text-xs", children: "Total em taxas" }), _jsxs("p", { className: "text-white font-bold text-lg", children: ["R$ ", totalDeliveryFee.toFixed(2)] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-zinc-400 text-xs", children: "Pago pelo cliente" }), _jsxs("p", { className: "text-green-400 font-bold text-lg", children: ["R$ ", customerPaidDelivery.toFixed(2)] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-zinc-400 text-xs", children: "Absorvido pela loja" }), _jsxs("p", { className: "text-red-400 font-bold text-lg", children: ["R$ ", storePaidDelivery.toFixed(2)] })] })] })] })), byPaymentMethod.length > 0 && (_jsxs("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 mb-6", children: [_jsxs("h3", { className: "text-white font-bold text-sm mb-4 flex items-center gap-2", children: [_jsx(CreditCard, { size: 16, className: "text-[#FFE500]" }), " Vendas por forma de pagamento"] }), _jsx("div", { className: "space-y-3", children: byPaymentMethod.map(pm => (_jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-1", children: [_jsx("span", { className: "text-zinc-300 text-sm", children: pm.label }), _jsxs("span", { className: "text-[#FFE500] text-sm font-bold", children: ["R$ ", pm.total.toFixed(2), " ", _jsxs("span", { className: "text-zinc-500 font-normal ml-1", children: ["(", pm.count, "x)"] })] })] }), _jsx("div", { className: "h-3 bg-zinc-900 rounded-full overflow-hidden", children: _jsx("div", { className: "h-full bg-[#FFE500] rounded-full transition-all duration-500", style: { width: `${(pm.total / Math.max(...byPaymentMethod.map(p => p.total), 1)) * 100}%` } }) })] }, pm.key))) })] })), bySaleType.length > 0 && (_jsxs("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 mb-6", children: [_jsxs("h3", { className: "text-white font-bold text-sm mb-4 flex items-center gap-2", children: [_jsx(Receipt, { size: 16, className: "text-[#FFE500]" }), " Vendas por tipo de opera\u00E7\u00E3o"] }), _jsx("div", { className: "space-y-3", children: bySaleType.map(st => (_jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-1", children: [_jsx("span", { className: "text-zinc-300 text-sm", children: st.label }), _jsxs("span", { className: "text-[#FFE500] text-sm font-bold", children: ["R$ ", st.total.toFixed(2), " ", _jsxs("span", { className: "text-zinc-500 font-normal ml-1", children: ["(", st.count, "x)"] })] })] }), _jsx("div", { className: "h-3 bg-zinc-900 rounded-full overflow-hidden", children: _jsx("div", { className: "h-full bg-[#FFE500] rounded-full transition-all duration-500", style: { width: `${(st.total / Math.max(...bySaleType.map(s => s.total), 1)) * 100}%` } }) })] }, st.key))) })] })), _jsxs("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 mb-6", children: [_jsx("h3", { className: "text-white font-bold text-sm mb-4", children: "Faturamento por franquia" }), byFranchise.length === 0 || byFranchise.every(f => f.total === 0) ? (_jsx("p", { className: "text-zinc-400 text-sm text-center py-8", children: "Sem dados para exibir." })) : (_jsx("div", { className: "space-y-3", children: byFranchise.filter(f => f.total > 0).map((f, i) => (_jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-1", children: [_jsx("span", { className: "text-zinc-300 text-sm", children: f.name }), _jsxs("span", { className: "text-[#FFE500] text-sm font-bold", children: ["R$ ", f.total.toFixed(2)] })] }), _jsx("div", { className: "h-3 bg-zinc-900 rounded-full overflow-hidden", children: _jsx("div", { className: "h-full bg-[#FFE500] rounded-full transition-all duration-500", style: { width: `${(f.total / maxFran) * 100}%` } }) })] }, i))) }))] }), byDeliverySource.length > 0 && (_jsxs("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 mb-6", children: [_jsxs("h3", { className: "text-white font-bold text-sm mb-4 flex items-center gap-2", children: [_jsx(Bike, { size: 16, className: "text-[#FFE500]" }), " Origem das vendas"] }), _jsx("div", { className: "space-y-3", children: byDeliverySource.map(d => (_jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-1", children: [_jsx("span", { className: "text-zinc-300 text-sm", children: d.label }), _jsxs("span", { className: "text-[#FFE500] text-sm font-bold", children: ["R$ ", d.total.toFixed(2), " ", _jsxs("span", { className: "text-zinc-500 font-normal ml-1", children: ["(", d.count, "x)"] })] })] }), _jsx("div", { className: "h-3 bg-zinc-900 rounded-full overflow-hidden", children: _jsx("div", { className: "h-full bg-[#FFE500] rounded-full transition-all duration-500", style: { width: `${(d.total / maxSource) * 100}%` } }) })] }, d.key))) })] })), _jsxs("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 mb-6", children: [_jsxs("button", { onClick: () => setShowDetails(!showDetails), className: "w-full flex items-center justify-between mb-4", children: [_jsxs("h3", { className: "text-white font-bold text-sm flex items-center gap-2", children: [_jsx(Eye, { size: 16, className: "text-[#FFE500]" }), " Detalhamento de vendas"] }), _jsx("span", { className: "text-zinc-400 text-xs", children: showDetails ? 'Ocultar' : 'Mostrar' })] }), showDetails && (_jsx("div", { className: "space-y-2 max-h-96 overflow-y-auto", children: filtered.length === 0 ? (_jsx("p", { className: "text-zinc-400 text-sm text-center py-4", children: "Sem dados." })) : filtered.map(s => {
                                        const PAY_LABELS = { pix: 'PIX', credit_card: 'Crédito', debit_card: 'Débito', cash: 'Dinheiro', meal_voucher: 'VR' };
                                        const TYPE_LABELS = { counter: 'Balcão', sponsorship: 'Patrocínio', tasting: 'Degustação', gift: 'Brindes' };
                                        const SRC_LABELS = { whatsapp: 'WhatsApp', ifood: 'iFood', uber_eats: 'Uber Eats', rappi: 'Rappi', '99delivery': '99 Delivery', phone: 'Telefone', other: 'Outro' };
                                        return (_jsxs("div", { className: "bg-zinc-900/50 border border-zinc-800 rounded-lg p-3", children: [_jsxs("div", { className: "flex items-start justify-between mb-1", children: [_jsxs("div", { children: [_jsx("p", { className: "text-white text-sm font-bold", children: franName(s.franchise_id) }), _jsx("p", { className: "text-zinc-500 text-xs", children: new Date(s.created_at).toLocaleString('pt-BR') }), s.user_name && _jsxs("p", { className: "text-zinc-500 text-xs flex items-center gap-1", children: [_jsx(User, { size: 10 }), " ", s.user_name] })] }), _jsxs("p", { className: "text-[#FFE500] font-bold text-sm", children: ["R$ ", s.total.toFixed(2)] })] }), _jsxs("div", { className: "flex flex-wrap gap-1.5 mt-2", children: [_jsx("span", { className: "text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full", children: TYPE_LABELS[s.sale_type] ?? s.sale_type }), s.payment_method && _jsx("span", { className: "text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full", children: PAY_LABELS[s.payment_method] ?? s.payment_method }), s.delivery_source && _jsx("span", { className: "text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full", children: SRC_LABELS[s.delivery_source] ?? s.delivery_source }), (s.discount ?? 0) > 0 && _jsxs("span", { className: "text-xs bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full", children: ["Desc: R$ ", (s.discount ?? 0).toFixed(2)] }), (s.delivery_fee ?? 0) > 0 && _jsxs("span", { className: "text-xs bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded-full", children: ["Taxa: R$ ", (s.delivery_fee ?? 0).toFixed(2), " (", s.delivery_fee_payer === 'store' ? 'loja' : 'cliente', ")"] }), s.payment_method === 'cash' && (s.change ?? 0) > 0 && _jsxs("span", { className: "text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full", children: ["Troco: R$ ", (s.change ?? 0).toFixed(2)] }), s.campaign_name && _jsx("span", { className: "text-xs bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full", children: s.campaign_name })] }), _jsx("div", { className: "mt-2 text-xs text-zinc-500", children: Array.isArray(s.items) && s.items.map((item, i) => (_jsxs("span", { children: [i > 0 && ' • ', item.quantity, "x ", item.name] }, i))) })] }, s.id));
                                    }) }))] }), _jsxs("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-xl p-5", children: [_jsx("h3", { className: "text-white font-bold text-sm mb-4", children: "Faturamento mensal (\u00FAltimos 6 meses)" }), byMonth.length === 0 ? (_jsx("p", { className: "text-zinc-400 text-sm text-center py-8", children: "Sem dados para exibir." })) : (_jsx("div", { className: "flex items-end justify-between gap-2 h-40", children: byMonth.map(([key, val]) => (_jsxs("div", { className: "flex-1 flex flex-col items-center gap-2", children: [_jsx("div", { className: "w-full bg-[#FFE500] rounded-t-lg transition-all duration-500", style: { height: `${(val / maxMonth) * 100}%` } }), _jsx("span", { className: "text-zinc-500 text-xs", children: monthLabel(key) }), _jsxs("span", { className: "text-[#FFE500] text-xs font-bold", children: ["R$ ", val.toFixed(0)] })] }, key))) }))] })] })] }) }));
}
