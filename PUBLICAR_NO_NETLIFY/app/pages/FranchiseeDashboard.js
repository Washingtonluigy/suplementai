import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { supabase } from '/app/lib/supabase.js';
import { useAuth } from '/app/contexts/AuthContext.js';
import { Megaphone, X, LogOut, Bell, Menu, ClipboardList, Package, Tag, Layers, Users, BarChart3, Bike, Trophy, GraduationCap, Folder, Factory, Store, FileText, Plug, Ticket, } from 'lucide-react';
import FranchiseeOrders from '/app/components/franchisee/FranchiseeOrders.js';
import FranchiseeManualOrder from '/app/components/franchisee/FranchiseeManualOrder.js';
import FranchiseeProducts from '/app/components/franchisee/FranchiseeProducts.js';
import FranchiseeCategories from '/app/components/franchisee/FranchiseeCategories.js';
import FranchiseeGroups from '/app/components/franchisee/FranchiseeGroups.js';
import FranchiseeCustomers from '/app/components/franchisee/FranchiseeCustomers.js';
import FranchiseeFinancial from '/app/components/franchisee/FranchiseeFinancial.js';
import FranchiseeDelivery from '/app/components/franchisee/FranchiseeDelivery.js';
import FranchiseeRanking from '/app/components/franchisee/FranchiseeRanking.js';
import FranchiseeCourses from '/app/components/franchisee/FranchiseeCourses.js';
import FranchiseeMarketing from '/app/components/franchisee/FranchiseeMarketing.js';
import FranchiseeFactoryOrder from '/app/components/franchisee/FranchiseeFactoryOrder.js';
import FranchiseeFees from '/app/components/franchisee/FranchiseeFees.js';
import FranchiseeCashRegister from '/app/components/franchisee/FranchiseeCashRegister.js';
import FranchiseeFiscal from '/app/components/franchisee/FranchiseeFiscal.js';
import FranchiseeIntegrations from '/app/components/franchisee/FranchiseeIntegrations.js';
import FranchiseePromotions from '/app/components/franchisee/FranchiseePromotions.js';
import FranchiseeCoupons from '/app/components/franchisee/FranchiseeCoupons.js';
const TABS = [
    { key: 'orders', label: 'Pedidos online', icon: ClipboardList },
    { key: 'manual-order', label: 'Lançar pedido', icon: ClipboardList },
    { key: 'products', label: 'Produtos', icon: Package },
    { key: 'promotions', label: 'Promoções', icon: Ticket },
    { key: 'coupons', label: 'Cupons', icon: Ticket },
    { key: 'categories', label: 'Categorias', icon: Tag },
    { key: 'groups', label: 'Grupos e Adicionais', icon: Layers },
    { key: 'customers', label: 'Clientes', icon: Users },
    { key: 'financial', label: 'Relatório', icon: BarChart3 },
    { key: 'delivery', label: 'Delivery', icon: Bike },
    { key: 'cash', label: 'Caixa', icon: Store },
    { key: 'ranking', label: 'Ranking', icon: Trophy },
    { key: 'courses', label: 'Aulas', icon: GraduationCap },
    { key: 'announcements', label: 'Comunicados', icon: Megaphone },
    { key: 'marketing', label: 'Marketing', icon: Folder },
    { key: 'factory', label: 'Pedidos Fábrica', icon: Factory },
    { key: 'fees', label: 'Mensalidades', icon: BarChart3 },
    { key: 'fiscal', label: 'Notas Fiscais', icon: FileText },
    { key: 'integrations', label: 'Integrações', icon: Plug },
];
export default function FranchiseeDashboard() {
    const { signOut, franchiseId, user } = useAuth();
    const [franchiseName, setFranchiseName] = useState('');
    const [franchiseSlug, setFranchiseSlug] = useState('');
    const [popupAnnouncement, setPopupAnnouncement] = useState(null);
    const [showAnnouncements, setShowAnnouncements] = useState(false);
    const [allAnnouncements, setAllAnnouncements] = useState([]);
    const [activeTab, setActiveTab] = useState('orders');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [contentBadges, setContentBadges] = useState({ courses: 0, marketing: 0, announcements: 0 });
    useEffect(() => {
        if (!franchiseId)
            return;
        supabase
            .from('franchises')
            .select('name, slug')
            .eq('id', franchiseId)
            .maybeSingle()
            .then(({ data }) => {
            if (data) {
                setFranchiseName(data.name);
                setFranchiseSlug(data.slug);
            }
        });
        const loadAnnouncements = async () => {
            const { data } = await supabase
                .from('announcements')
                .select('*')
                .eq('active', true)
                .order('created_at', { ascending: false });
            if (data && data.length > 0) {
                setAllAnnouncements(data);
                const unread = [];
                for (const a of data) {
                    const { data: read } = await supabase
                        .from('announcement_reads')
                        .select('id')
                        .eq('announcement_id', a.id)
                        .eq('franchise_id', franchiseId)
                        .maybeSingle();
                    if (!read)
                        unread.push(a);
                }
                setContentBadges(current => ({ ...current, announcements: unread.length }));
                if (unread.length > 0)
                    setPopupAnnouncement(unread[0]);
            }
        };
        loadAnnouncements();
        Promise.all([
            supabase.from('courses').select('id', { count: 'exact', head: true }),
            supabase.from('marketing_files').select('id', { count: 'exact', head: true }),
        ]).then(([courses, marketing]) => setContentBadges(current => ({ ...current, courses: courses.count ?? 0, marketing: marketing.count ?? 0 })));
    }, [franchiseId]);
    const dismissAnnouncement = async (a) => {
        if (franchiseId) {
            await supabase
                .from('announcement_reads')
                .insert({ announcement_id: a.id, franchise_id: franchiseId });
        }
        setPopupAnnouncement(null);
    };
    const tabContent = {
        orders: _jsx(FranchiseeOrders, { franchiseId: franchiseId }),
        'manual-order': _jsx(FranchiseeManualOrder, { franchiseId: franchiseId }),
        products: _jsx(FranchiseeProducts, { franchiseId: franchiseId }),
        categories: _jsx(FranchiseeCategories, { franchiseId: franchiseId }),
        groups: _jsx(FranchiseeGroups, { franchiseId: franchiseId }),
        customers: _jsx(FranchiseeCustomers, { franchiseId: franchiseId }),
        financial: _jsx(FranchiseeFinancial, { franchiseId: franchiseId }),
        delivery: _jsx(FranchiseeDelivery, { franchiseId: franchiseId }),
        cash: _jsx(FranchiseeCashRegister, { franchiseId: franchiseId }),
        ranking: _jsx(FranchiseeRanking, { franchiseId: franchiseId }),
        courses: _jsx(FranchiseeCourses, { franchiseId: franchiseId }),
        announcements: (_jsxs("div", { className: "space-y-3", children: [_jsx("h3", { className: "text-white font-bold text-lg mb-4", children: "Comunicados" }), allAnnouncements.length === 0 ? (_jsx("p", { className: "text-zinc-400 text-sm text-center py-8", children: "Nenhum comunicado no momento." })) : (allAnnouncements.map(a => (_jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(Megaphone, { size: 14, className: "text-[#FFE500]" }), _jsx("span", { className: "text-zinc-500 text-xs", children: new Date(a.created_at).toLocaleDateString('pt-BR') })] }), _jsx("h4", { className: "text-white font-bold text-sm mb-1", children: a.title }), _jsx("p", { className: "text-zinc-400 text-sm whitespace-pre-wrap", children: a.message })] }, a.id))))] })),
        marketing: _jsx(FranchiseeMarketing, { franchiseId: franchiseId }),
        factory: _jsx(FranchiseeFactoryOrder, { franchiseId: franchiseId }),
        fees: _jsx(FranchiseeFees, { franchiseId: franchiseId }),
        fiscal: _jsx(FranchiseeFiscal, { franchiseId: franchiseId }),
        integrations: _jsx(FranchiseeIntegrations, { franchiseId: franchiseId }),
        promotions: _jsx(FranchiseePromotions, { franchiseId: franchiseId }),
        coupons: _jsx(FranchiseeCoupons, { franchiseId: franchiseId }),
    };
    return (_jsxs("div", { className: "min-h-screen bg-black text-white", children: [_jsx("header", { className: "bg-zinc-900 border-b border-zinc-800 sticky top-0 z-30", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("button", { onClick: () => setSidebarOpen(!sidebarOpen), className: "lg:hidden text-zinc-400 hover:text-white", children: _jsx(Menu, { size: 22 }) }), _jsx("div", { className: "w-10 h-10 rounded-lg overflow-hidden border border-[#FFE500]/30", children: _jsx("img", { src: "/assets/logo.png", alt: "Logo", className: "w-full h-full object-contain bg-[#FFE500]" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-[#FFE500] font-black text-lg leading-none", children: "Suplementaai" }), _jsxs("div", { children: [_jsx("p", { className: "text-zinc-500 text-xs mt-0.5", children: franchiseName || 'Franquia' }), _jsx("p", { className: "text-[9px] text-[#FFE500]/70 font-mono mt-0.5", children: "BUILD 27/08 MT+SITE+PDV" })] })] })] }), _jsxs("div", { className: "flex items-center gap-3", children: [franchiseId && _jsxs("a", { href: `${window.location.origin}/loja/${franchiseSlug}`, target: "_blank", rel: "noreferrer", className: "hidden sm:flex items-center gap-2 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-300 hover:text-white hover:border-[#FFE500]/50 transition-colors", children: [_jsx(Store, { size: 14 }), " Abrir loja"] }), _jsxs("button", { onClick: () => setShowAnnouncements(true), className: "text-zinc-400 hover:text-[#FFE500] transition-colors relative", title: "Comunicados", children: [_jsx(Bell, { size: 20 }), allAnnouncements.length > 0 && (_jsx("span", { className: "absolute -top-1 -right-1 w-4 h-4 bg-[#FFE500] text-black text-[10px] font-bold rounded-full flex items-center justify-center", children: allAnnouncements.length }))] }), _jsxs("button", { onClick: signOut, className: "flex items-center gap-2 text-zinc-400 hover:text-white text-sm transition-colors", children: [_jsx(LogOut, { size: 18 }), _jsx("span", { className: "hidden sm:inline", children: "Sair" })] })] })] }) }), _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 py-8 flex gap-6", children: [_jsx("aside", { className: `${sidebarOpen ? 'block' : 'hidden'} lg:block w-56 flex-shrink-0`, children: _jsx("nav", { className: "space-y-1 sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pb-4", children: TABS.map(tab => {
                                const Icon = tab.icon;
                                return (_jsxs("button", { onClick: () => { setActiveTab(tab.key); setSidebarOpen(false); }, className: `w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.key ? 'bg-[#FFE500] text-black' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}`, children: [_jsx(Icon, { size: 18 }), _jsx("span", { className: "flex-1 text-left", children: tab.label }), ['courses', 'marketing', 'announcements'].includes(tab.key) && contentBadges[tab.key] > 0 && _jsx("span", { className: "min-w-5 h-5 px-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center", children: contentBadges[tab.key] })] }, tab.key));
                            }) }) }), _jsx("main", { className: "flex-1 min-w-0", children: franchiseId ? tabContent[activeTab] : _jsx("p", { className: "text-zinc-400", children: "Carregando..." }) })] }), popupAnnouncement && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm", children: _jsxs("div", { className: "bg-zinc-900 border border-[#FFE500]/30 rounded-2xl w-full max-w-md p-6 shadow-2xl", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-10 h-10 rounded-lg bg-[#FFE500]/10 flex items-center justify-center", children: _jsx(Megaphone, { size: 20, className: "text-[#FFE500]" }) }), _jsx("span", { className: "text-[#FFE500] font-bold text-sm uppercase tracking-wide", children: "Comunicado" })] }), _jsx("button", { onClick: () => dismissAnnouncement(popupAnnouncement), className: "text-zinc-400 hover:text-white transition-colors", children: _jsx(X, { size: 20 }) })] }), _jsx("h2", { className: "text-white font-bold text-xl mb-2", children: popupAnnouncement.title }), _jsx("p", { className: "text-zinc-300 text-sm whitespace-pre-wrap mb-6", children: popupAnnouncement.message }), _jsx("button", { onClick: () => dismissAnnouncement(popupAnnouncement), className: "w-full bg-[#FFE500] hover:bg-[#FFD000] text-black font-bold rounded-lg py-3 transition-all", children: "Entendi" })] }) })), showAnnouncements && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm", onClick: () => setShowAnnouncements(false), children: _jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto", onClick: e => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center justify-between p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900", children: [_jsx("h2", { className: "font-bold text-white text-lg", children: "Comunicados" }), _jsx("button", { onClick: () => setShowAnnouncements(false), className: "text-zinc-400 hover:text-white", children: _jsx(X, { size: 22 }) })] }), _jsx("div", { className: "p-6 space-y-3", children: allAnnouncements.length === 0 ? (_jsx("p", { className: "text-zinc-400 text-sm text-center py-8", children: "Nenhum comunicado no momento." })) : (allAnnouncements.map(a => (_jsxs("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(Megaphone, { size: 14, className: "text-[#FFE500]" }), _jsx("span", { className: "text-zinc-500 text-xs", children: new Date(a.created_at).toLocaleDateString('pt-BR') })] }), _jsx("h4", { className: "text-white font-bold text-sm mb-1", children: a.title }), _jsx("p", { className: "text-zinc-400 text-sm whitespace-pre-wrap", children: a.message })] }, a.id)))) })] }) }))] }));
}
