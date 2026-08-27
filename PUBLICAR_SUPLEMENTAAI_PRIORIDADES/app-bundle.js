import * as React from 'react';
import * as JSXRuntime from 'react/jsx-runtime';
import * as ReactDOMClient from 'react-dom/client';
import * as SupabaseJS from '@supabase/supabase-js';
import * as LucideReact from 'lucide-react';

const __modules={
"/src/App.tsx": function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = App;
const jsx_runtime_1 = require("react/jsx-runtime");
const AuthContext_1 = require("@/contexts/AuthContext");
const Login_1 = __importDefault(require("@/pages/Login"));
const MasterDashboard_1 = __importDefault(require("@/pages/MasterDashboard"));
const FranchiseeDashboard_1 = __importDefault(require("@/pages/FranchiseeDashboard"));
const PublicStore_1 = __importDefault(require("@/pages/PublicStore"));
const EcommerceStorefront_1 = __importDefault(require("@/pages/EcommerceStorefront"));
function AppContent() {
    const { session, isMaster, franchiseId, loading } = (0, AuthContext_1.useAuth)();
    const isPublicStore = window.location.pathname.startsWith('/loja/');
    const host = window.location.hostname.toLowerCase();
    const isAdminPath = window.location.pathname.startsWith('/admin');
    const isNationalSite = window.location.pathname.startsWith('/site') || (!isAdminPath && (host === 'suplementaai.com.br' || host === 'www.suplementaai.com.br'));
    if (isPublicStore)
        return (0, jsx_runtime_1.jsx)(PublicStore_1.default, {});
    if (isNationalSite)
        return (0, jsx_runtime_1.jsx)(EcommerceStorefront_1.default, {});
    if (loading) {
        return ((0, jsx_runtime_1.jsx)("div", { className: "min-h-screen bg-black flex items-center justify-center", children: (0, jsx_runtime_1.jsx)("div", { className: "w-10 h-10 border-2 border-zinc-700 border-t-[#FFE500] rounded-full animate-spin" }) }));
    }
    if (!session)
        return (0, jsx_runtime_1.jsx)(Login_1.default, {});
    if (isMaster)
        return (0, jsx_runtime_1.jsx)(MasterDashboard_1.default, {});
    if (franchiseId)
        return (0, jsx_runtime_1.jsx)(FranchiseeDashboard_1.default, {});
    return ((0, jsx_runtime_1.jsx)("div", { className: "min-h-screen bg-black flex items-center justify-center text-white p-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "text-center max-w-sm", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-xl font-bold mb-2", children: "Acesso n\u00E3o vinculado" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-sm", children: "Seu usu\u00E1rio n\u00E3o est\u00E1 vinculado a nenhuma franquia. Entre em contato com o administrador." })] }) }));
}
function App() {
    return ((0, jsx_runtime_1.jsx)(AuthContext_1.AuthProvider, { children: (0, jsx_runtime_1.jsx)(AppContent, {}) }));
}

},
"/src/components/franchisee/FranchiseeCashRegister.tsx": function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = FranchiseeCashRegister;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const supabase_1 = require("@/lib/supabase");
const lucide_react_1 = require("lucide-react");
function FranchiseeCashRegister({ franchiseId }) {
    const [sessions, setSessions] = (0, react_1.useState)([]);
    const [currentSession, setCurrentSession] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [showOpen, setShowOpen] = (0, react_1.useState)(false);
    const [showClose, setShowClose] = (0, react_1.useState)(false);
    const [openingAmount, setOpeningAmount] = (0, react_1.useState)('');
    const [closingAmount, setClosingAmount] = (0, react_1.useState)('');
    const [notes, setNotes] = (0, react_1.useState)('');
    const [saving, setSaving] = (0, react_1.useState)(false);
    const load = async () => {
        const { data } = await supabase_1.supabase.from('cash_sessions').select('*').eq('franchise_id', franchiseId).order('created_at', { ascending: false });
        if (data) {
            setSessions(data);
            const open = data.find(s => s.status === 'open') ?? null;
            setCurrentSession(open);
        }
        setLoading(false);
    };
    (0, react_1.useEffect)(() => { load(); }, [franchiseId]);
    const openCash = async (e) => {
        e.preventDefault();
        setSaving(true);
        const { data } = await supabase_1.supabase.from('cash_sessions').insert({
            franchise_id: franchiseId,
            opening_amount: parseFloat(openingAmount) || 0,
            status: 'open',
        }).select().single();
        if (data) {
            setCurrentSession(data);
            setOpeningAmount('');
            setShowOpen(false);
        }
        setSaving(false);
        load();
    };
    const closeCash = async (e) => {
        e.preventDefault();
        if (!currentSession)
            return;
        setSaving(true);
        await supabase_1.supabase.from('cash_sessions').update({
            status: 'closed',
            closed_at: new Date().toISOString(),
            closing_amount: parseFloat(closingAmount) || 0,
            notes: notes || null,
        }).eq('id', currentSession.id);
        setCurrentSession(null);
        setClosingAmount('');
        setNotes('');
        setShowClose(false);
        setSaving(false);
        load();
    };
    if (loading) {
        return (0, jsx_runtime_1.jsx)("div", { className: "flex justify-center py-12", children: (0, jsx_runtime_1.jsx)("div", { className: "w-6 h-6 border-2 border-zinc-700 border-t-[#FFE500] rounded-full animate-spin" }) });
    }
    return ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-white font-bold text-lg mb-4", children: "Caixa" }), (0, jsx_runtime_1.jsxs)("div", { className: `rounded-xl p-6 mb-6 border ${currentSession ? 'bg-green-500/5 border-green-500/30' : 'bg-zinc-900 border-zinc-800'}`, children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)("div", { className: `w-12 h-12 rounded-lg flex items-center justify-center ${currentSession ? 'bg-green-500/10' : 'bg-zinc-800'}`, children: currentSession ? (0, jsx_runtime_1.jsx)(lucide_react_1.Unlock, { size: 24, className: "text-green-400" }) : (0, jsx_runtime_1.jsx)(lucide_react_1.Lock, { size: 24, className: "text-zinc-500" }) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-white font-bold", children: currentSession ? 'Caixa Aberto' : 'Caixa Fechado' }), currentSession ? ((0, jsx_runtime_1.jsxs)("p", { className: "text-zinc-400 text-xs flex items-center gap-1", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Clock, { size: 11 }), " Aberto em ", new Date(currentSession.opened_at).toLocaleString('pt-BR')] })) : ((0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-xs", children: "Abra o caixa para iniciar o dia" }))] })] }), currentSession ? ((0, jsx_runtime_1.jsxs)("div", { className: "text-right", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-xs", children: "Abertura" }), (0, jsx_runtime_1.jsxs)("p", { className: "text-[#FFE500] font-bold text-lg", children: ["R$ ", currentSession.opening_amount.toFixed(2)] })] })) : null] }), currentSession && ((0, jsx_runtime_1.jsx)("button", { onClick: () => setShowClose(true), className: "w-full mt-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold rounded-lg py-2.5 transition-colors", children: "Fechar Caixa" }))] }), !currentSession && ((0, jsx_runtime_1.jsxs)("button", { onClick: () => setShowOpen(true), className: "w-full bg-[#FFE500] hover:bg-[#FFD000] text-black font-bold rounded-lg py-3 flex items-center justify-center gap-2 transition-all", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Store, { size: 20 }), " Abrir Caixa"] })), sessions.filter(s => s.status === 'closed').length > 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "mt-8", children: [(0, jsx_runtime_1.jsx)("h4", { className: "text-white font-bold text-sm mb-3", children: "Hist\u00F3rico de Caixas" }), (0, jsx_runtime_1.jsx)("div", { className: "space-y-2", children: sessions.filter(s => s.status === 'closed').slice(0, 10).map(s => ((0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-white text-sm font-bold", children: new Date(s.opened_at).toLocaleDateString('pt-BR') }), (0, jsx_runtime_1.jsxs)("p", { className: "text-zinc-500 text-xs", children: [new Date(s.opened_at).toLocaleTimeString('pt-BR'), " \u2014 ", s.closed_at && new Date(s.closed_at).toLocaleTimeString('pt-BR')] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "text-right", children: [(0, jsx_runtime_1.jsxs)("p", { className: "text-zinc-400 text-xs", children: ["Abertura: R$ ", s.opening_amount.toFixed(2)] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-[#FFE500] text-sm font-bold", children: ["Fechamento: R$ ", s.closing_amount?.toFixed(2) ?? '—'] })] })] }, s.id))) })] })), showOpen && ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm", onClick: () => setShowOpen(false), children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm p-6", onClick: e => e.stopPropagation(), children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-4", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-white font-bold text-lg", children: "Abrir Caixa" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setShowOpen(false), className: "text-zinc-400 hover:text-white", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { size: 20 }) })] }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: openCash, className: "space-y-3", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Valor de abertura (R$)" }), (0, jsx_runtime_1.jsx)("input", { type: "number", step: "0.01", value: openingAmount, onChange: e => setOpeningAmount(e.target.value), required: true, className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: saving, className: "w-full bg-[#FFE500] hover:bg-[#FFD000] text-black font-bold rounded-lg py-3 disabled:opacity-50", children: saving ? 'Abrindo...' : 'Abrir Caixa' })] })] }) })), showClose && currentSession && ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm", onClick: () => setShowClose(false), children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm p-6", onClick: e => e.stopPropagation(), children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-4", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-white font-bold text-lg", children: "Fechar Caixa" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setShowClose(false), className: "text-zinc-400 hover:text-white", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { size: 20 }) })] }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: closeCash, className: "space-y-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-800/50 rounded-lg p-3 text-sm text-zinc-400", children: ["Aberto em: ", new Date(currentSession.opened_at).toLocaleString('pt-BR'), (0, jsx_runtime_1.jsx)("br", {}), "Abertura: R$ ", currentSession.opening_amount.toFixed(2)] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Valor de fechamento (R$)" }), (0, jsx_runtime_1.jsx)("input", { type: "number", step: "0.01", value: closingAmount, onChange: e => setClosingAmount(e.target.value), required: true, className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Observa\u00E7\u00F5es" }), (0, jsx_runtime_1.jsx)("textarea", { value: notes, onChange: e => setNotes(e.target.value), rows: 2, className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500] resize-none" })] }), (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: saving, className: "w-full bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg py-3 disabled:opacity-50", children: saving ? 'Fechando...' : 'Fechar Caixa' })] })] }) }))] }));
}

},
"/src/components/franchisee/FranchiseeCategories.tsx": function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = FranchiseeCategories;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const supabase_1 = require("@/lib/supabase");
const lucide_react_1 = require("lucide-react");
function FranchiseeCategories({ franchiseId }) {
    const [categories, setCategories] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [showForm, setShowForm] = (0, react_1.useState)(false);
    const [editing, setEditing] = (0, react_1.useState)(null);
    const [name, setName] = (0, react_1.useState)('');
    const [saving, setSaving] = (0, react_1.useState)(false);
    const [movingId, setMovingId] = (0, react_1.useState)(null);
    const load = async () => {
        const { data } = await supabase_1.supabase.from('franchise_categories').select('*').eq('franchise_id', franchiseId).order('sort_order', { ascending: true }).order('created_at', { ascending: true }).order('id', { ascending: true });
        if (data)
            setCategories(data);
        setLoading(false);
    };
    (0, react_1.useEffect)(() => { load(); }, [franchiseId]);
    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        if (editing) {
            await supabase_1.supabase.from('franchise_categories').update({ name }).eq('id', editing.id);
        }
        else {
            const maxSort = categories.reduce((max, category) => Math.max(max, category.sort_order ?? -1), -1);
            await supabase_1.supabase.from('franchise_categories').insert({ franchise_id: franchiseId, name, sort_order: maxSort + 1 });
        }
        setName('');
        setEditing(null);
        setShowForm(false);
        setSaving(false);
        load();
    };
    const handleDelete = async (c) => {
        if (!confirm(`Excluir categoria "${c.name}"?`))
            return;
        await supabase_1.supabase.from('franchise_categories').delete().eq('id', c.id);
        load();
    };
    const move = async (c, dir) => {
        if (movingId)
            return;
        // Usa exatamente a ordem que o usuário está vendo. Se houver sort_order
        // repetido/fora de sequência, o clique também normaliza a lista inteira.
        const sorted = [...categories].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) ||
            (a.created_at ?? '').localeCompare(b.created_at ?? '') ||
            a.id.localeCompare(b.id));
        const idx = sorted.findIndex(x => x.id === c.id);
        const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
        if (idx < 0 || targetIdx < 0 || targetIdx >= sorted.length)
            return;
        const reordered = [...sorted];
        const [moved] = reordered.splice(idx, 1);
        reordered.splice(targetIdx, 0, moved);
        setMovingId(c.id);
        try {
            const results = await Promise.all(reordered.map((category, position) => supabase_1.supabase
                .from('franchise_categories')
                .update({ sort_order: position })
                .eq('id', category.id)
                .eq('franchise_id', franchiseId)));
            const failed = results.find(result => result.error);
            if (failed?.error)
                throw failed.error;
            setCategories(reordered.map((category, position) => ({ ...category, sort_order: position })));
        }
        catch (error) {
            console.error('Erro ao reordenar categorias:', error);
            alert('Não foi possível alterar a ordem da categoria. Tente novamente.');
            await load();
        }
        finally {
            setMovingId(null);
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-4", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-white font-bold text-lg", children: "Categorias" }), (0, jsx_runtime_1.jsxs)("button", { onClick: () => { if (editing) {
                            setEditing(null);
                            setName('');
                        } setShowForm(!showForm); }, className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 flex items-center gap-1.5 transition-all", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { size: 16 }), " ", editing ? 'Editando...' : 'Nova Categoria'] })] }), showForm && ((0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSave, className: "bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4 flex gap-2", children: [(0, jsx_runtime_1.jsx)("input", { type: "text", value: name, onChange: e => setName(e.target.value), required: true, placeholder: "Nome da categoria", className: "flex-1 bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: saving, className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 disabled:opacity-50", children: saving ? '...' : 'Salvar' }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => { setShowForm(false); setEditing(null); }, className: "bg-zinc-700 text-white rounded-lg px-3 py-2", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { size: 16 }) })] })), loading ? ((0, jsx_runtime_1.jsx)("div", { className: "flex justify-center py-12", children: (0, jsx_runtime_1.jsx)("div", { className: "w-6 h-6 border-2 border-zinc-700 border-t-[#FFE500] rounded-full animate-spin" }) })) : categories.length === 0 ? ((0, jsx_runtime_1.jsxs)("div", { className: "text-center py-12", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Tag, { size: 40, className: "mx-auto text-zinc-700 mb-3" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-sm", children: "Nenhuma categoria criada." })] })) : ((0, jsx_runtime_1.jsx)("div", { className: "space-y-2", children: [...categories].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) ||
                    (a.created_at ?? '').localeCompare(b.created_at ?? '') ||
                    a.id.localeCompare(b.id)).map((c, i, arr) => ((0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-10 h-10 rounded-lg bg-[#FFE500]/10 flex items-center justify-center", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Tag, { size: 18, className: "text-[#FFE500]" }) }), (0, jsx_runtime_1.jsx)("p", { className: "text-white text-sm font-bold flex-1", children: c.name }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-1", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => move(c, 'up'), disabled: i === 0 || movingId !== null, className: "text-zinc-500 hover:text-[#FFE500] p-1 disabled:opacity-30", children: (0, jsx_runtime_1.jsx)(lucide_react_1.ArrowUp, { size: 14 }) }), (0, jsx_runtime_1.jsx)("button", { onClick: () => move(c, 'down'), disabled: i === arr.length - 1 || movingId !== null, className: "text-zinc-500 hover:text-[#FFE500] p-1 disabled:opacity-30", children: (0, jsx_runtime_1.jsx)(lucide_react_1.ArrowDown, { size: 14 }) }), (0, jsx_runtime_1.jsx)("button", { onClick: () => { setEditing(c); setName(c.name); setShowForm(true); }, className: "text-zinc-500 hover:text-[#FFE500] p-1", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Edit, { size: 14 }) }), (0, jsx_runtime_1.jsx)("button", { onClick: () => handleDelete(c), className: "text-zinc-500 hover:text-red-400 p-1", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { size: 14 }) })] })] }, c.id))) }))] }));
}

},
"/src/components/franchisee/FranchiseeCoupons.tsx": function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = FranchiseeCoupons;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const supabase_1 = require("@/lib/supabase");
const lucide_react_1 = require("lucide-react");
function FranchiseeCoupons({ franchiseId }) {
    const [coupons, setCoupons] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [showForm, setShowForm] = (0, react_1.useState)(false);
    const [editing, setEditing] = (0, react_1.useState)(null);
    const [saving, setSaving] = (0, react_1.useState)(false);
    const [form, setForm] = (0, react_1.useState)({ code: '', description: '', discount_type: 'percent', discount_value: '', min_purchase: '', active: true });
    const load = async () => {
        const { data } = await supabase_1.supabase.from('coupons').select('*').eq('franchise_id', franchiseId).order('created_at', { ascending: false });
        setCoupons(data || []);
        setLoading(false);
    };
    (0, react_1.useEffect)(() => { load(); }, [franchiseId]);
    const save = async (e) => {
        e.preventDefault();
        setSaving(true);
        const payload = {
            franchise_id: franchiseId,
            code: form.code.toUpperCase().trim(),
            description: form.description || null,
            discount_type: form.discount_type,
            discount_value: parseFloat(form.discount_value) || 0,
            min_purchase: parseFloat(form.min_purchase) || 0,
            active: form.active,
        };
        if (editing) {
            await supabase_1.supabase.from('coupons').update(payload).eq('id', editing.id);
        }
        else {
            await supabase_1.supabase.from('coupons').insert(payload);
        }
        setForm({ code: '', description: '', discount_type: 'percent', discount_value: '', min_purchase: '', active: true });
        setEditing(null);
        setShowForm(false);
        setSaving(false);
        load();
    };
    const remove = async (c) => {
        if (!confirm(`Excluir cupom ${c.code}?`))
            return;
        await supabase_1.supabase.from('coupons').delete().eq('id', c.id);
        load();
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-white font-bold text-lg", children: "Cupons" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs mt-0.5", children: "Cupons de desconto para o seu cat\u00E1logo online" })] }), (0, jsx_runtime_1.jsxs)("button", { onClick: () => { setEditing(null); setShowForm(!showForm); }, className: "flex items-center gap-2 bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { size: 16 }), " Novo Cupom"] })] }), showForm && ((0, jsx_runtime_1.jsxs)("form", { onSubmit: save, className: "bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3", children: [(0, jsx_runtime_1.jsx)("input", { type: "text", value: form.code, onChange: e => setForm({ ...form, code: e.target.value }), required: true, placeholder: "C\u00F3digo (ex: BEMVINDO10)", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: form.description, onChange: e => setForm({ ...form, description: e.target.value }), placeholder: "Descri\u00E7\u00E3o (opcional)", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-3 gap-3", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs mb-1", children: "Tipo" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setForm({ ...form, discount_type: 'percent' }), className: `flex-1 text-xs py-2 ${form.discount_type === 'percent' ? 'bg-[#FFE500] text-black' : 'text-zinc-400'}`, children: (0, jsx_runtime_1.jsx)(lucide_react_1.Percent, { size: 12, className: "inline" }) }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setForm({ ...form, discount_type: 'fixed' }), className: `flex-1 text-xs py-2 ${form.discount_type === 'fixed' ? 'bg-[#FFE500] text-black' : 'text-zinc-400'}`, children: (0, jsx_runtime_1.jsx)(lucide_react_1.DollarSign, { size: 12, className: "inline" }) })] })] }), (0, jsx_runtime_1.jsx)("input", { type: "number", step: "0.01", value: form.discount_value, onChange: e => setForm({ ...form, discount_value: e.target.value }), required: true, placeholder: form.discount_type === 'percent' ? 'Valor (%)' : 'Valor (R$)', className: "bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), (0, jsx_runtime_1.jsx)("input", { type: "number", step: "0.01", value: form.min_purchase, onChange: e => setForm({ ...form, min_purchase: e.target.value }), placeholder: "Compra m\u00EDn. R$", className: "bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), (0, jsx_runtime_1.jsxs)("label", { className: "flex items-center gap-2 cursor-pointer", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: form.active, onChange: e => setForm({ ...form, active: e.target.checked }), className: "w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-[#FFE500]" }), (0, jsx_runtime_1.jsx)("span", { className: "text-zinc-300 text-sm", children: "Ativo" })] }), (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: saving, className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 disabled:opacity-50", children: saving ? 'Salvando...' : editing ? 'Salvar' : 'Criar' })] })), loading ? (0, jsx_runtime_1.jsx)("div", { className: "flex justify-center py-8", children: (0, jsx_runtime_1.jsx)("div", { className: "w-6 h-6 border-2 border-zinc-700 border-t-[#FFE500] rounded-full animate-spin" }) }) :
                coupons.length === 0 ? (0, jsx_runtime_1.jsxs)("div", { className: "text-center py-12", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Ticket, { size: 32, className: "mx-auto text-zinc-700 mb-3" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-sm", children: "Nenhum cupom criado." })] }) :
                    (0, jsx_runtime_1.jsx)("div", { className: "space-y-2", children: coupons.map(c => ((0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-10 h-10 rounded-lg bg-[#FFE500]/10 flex items-center justify-center", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Ticket, { size: 18, className: "text-[#FFE500]" }) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("p", { className: "text-white text-sm font-bold", children: [c.code, " ", !c.active && (0, jsx_runtime_1.jsx)("span", { className: "text-zinc-500 text-xs", children: "(inativo)" })] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-zinc-500 text-xs", children: [c.discount_type === 'percent' ? `${c.discount_value}% de desconto` : `R$ ${c.discount_value} de desconto`, c.min_purchase > 0 ? ` • Compra mín: R$ ${c.min_purchase}` : ''] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-1", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => { setEditing(c); setForm({ code: c.code, description: c.description ?? '', discount_type: c.discount_type, discount_value: String(c.discount_value), min_purchase: String(c.min_purchase), active: c.active }); setShowForm(true); }, className: "text-zinc-400 hover:text-[#FFE500] p-1.5", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Edit, { size: 14 }) }), (0, jsx_runtime_1.jsx)("button", { onClick: () => remove(c), className: "text-zinc-400 hover:text-red-400 p-1.5", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { size: 14 }) })] })] }, c.id))) })] }));
}

},
"/src/components/franchisee/FranchiseeCourses.tsx": function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = FranchiseeCourses;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const supabase_1 = require("@/lib/supabase");
const lucide_react_1 = require("lucide-react");
function FranchiseeCourses({ franchiseId: _franchiseId }) {
    const [courses, setCourses] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [playing, setPlaying] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        (async () => {
            const { data } = await supabase_1.supabase.from('courses').select('*').order('order_index', { ascending: true });
            if (data)
                setCourses(data);
            setLoading(false);
        })();
    }, []);
    const modules = Array.from(new Set(courses.map(c => c.module_name)));
    const getEmbedUrl = (url) => {
        const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
        return match ? `https://www.youtube.com/embed/${match[1]}` : url;
    };
    if (loading) {
        return (0, jsx_runtime_1.jsx)("div", { className: "flex justify-center py-12", children: (0, jsx_runtime_1.jsx)("div", { className: "w-6 h-6 border-2 border-zinc-700 border-t-[#FFE500] rounded-full animate-spin" }) });
    }
    if (playing) {
        return ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => setPlaying(null), className: "text-zinc-400 hover:text-white text-sm mb-4 transition-colors", children: "\u2190 Voltar" }), (0, jsx_runtime_1.jsx)("div", { className: "aspect-video rounded-xl overflow-hidden border border-zinc-800 mb-4", children: (0, jsx_runtime_1.jsx)("iframe", { src: getEmbedUrl(playing.video_url), className: "w-full h-full", allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture", allowFullScreen: true }) }), (0, jsx_runtime_1.jsx)("h3", { className: "text-white font-bold text-lg", children: playing.title }), playing.description && (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-sm mt-2", children: playing.description })] }));
    }
    if (courses.length === 0) {
        return ((0, jsx_runtime_1.jsxs)("div", { className: "text-center py-12", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.GraduationCap, { size: 40, className: "mx-auto text-zinc-700 mb-3" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-sm", children: "Nenhum curso dispon\u00EDvel." })] }));
    }
    return ((0, jsx_runtime_1.jsx)("div", { className: "space-y-6", children: modules.map(mod => ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-[#FFE500] font-bold text-sm uppercase tracking-wide mb-3", children: mod }), (0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", children: courses.filter(c => c.module_name === mod).map(c => ((0, jsx_runtime_1.jsxs)("button", { onClick: () => setPlaying(c), className: "bg-zinc-900 border border-zinc-800 hover:border-[#FFE500]/30 rounded-xl p-4 text-left transition-all group", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3 mb-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Youtube, { size: 20, className: "text-red-400" }) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-white font-bold text-sm", children: c.title }), c.description && (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs line-clamp-2", children: c.description })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-1.5 text-[#FFE500] text-xs font-bold group-hover:gap-2.5 transition-all", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Play, { size: 14 }), " Assistir curso"] })] }, c.id))) })] }, mod))) }));
}

},
"/src/components/franchisee/FranchiseeCustomers.tsx": function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = FranchiseeCustomers;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const supabase_1 = require("@/lib/supabase");
const lucide_react_1 = require("lucide-react");
const IMPORT_MARKER = '[IMPORT_BKP_20260826]';
const normalizeText = (value) => String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
const digitsOnly = (value) => String(value ?? '').replace(/\D/g, '');
const normalizeEmail = (value) => String(value ?? '').trim().toLowerCase();
const nullable = (value) => {
    const clean = String(value ?? '').trim();
    return clean ? clean : null;
};
const stateNames = {
    'acre': 'AC', 'alagoas': 'AL', 'amapa': 'AP', 'amazonas': 'AM', 'bahia': 'BA', 'ceara': 'CE',
    'distrito federal': 'DF', 'espirito santo': 'ES', 'goias': 'GO', 'goiais': 'GO', 'maranhao': 'MA', 'mato grosso': 'MT',
    'mato grosso do sul': 'MS', 'minas gerais': 'MG', 'para': 'PA', 'paraiba': 'PB', 'parana': 'PR',
    'pernambuco': 'PE', 'piaui': 'PI', 'rio de janeiro': 'RJ', 'rio grande do norte': 'RN',
    'rio grande do sul': 'RS', 'rondonia': 'RO', 'roraima': 'RR', 'santa catarina': 'SC',
    'sao paulo': 'SP', 'sergipe': 'SE', 'tocantins': 'TO',
};
const parseCityState = (raw) => {
    const value = String(raw ?? '').trim();
    if (!value)
        return { city: null, state: null };
    const normalized = normalizeText(value);
    if (stateNames[normalized])
        return { city: null, state: stateNames[normalized] };
    if (/^[A-Za-z]{2}$/.test(value))
        return { city: null, state: value.toUpperCase() };
    const match = value.match(/^(.+?)\s*[\/-]\s*([A-Za-z]{2})$/);
    if (match)
        return { city: match[1].trim() || null, state: match[2].toUpperCase() };
    return { city: value, state: null };
};
const parseBrazilianDate = (value) => {
    const match = String(value ?? '').trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!match)
        return undefined;
    const [, dd, mm, yyyy] = match;
    return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}T12:00:00-04:00`;
};
const parseLegacyCustomersTxt = (text) => {
    const normalized = text.replace(/\r\n/g, '\n');
    const header = /^CLIENTE\s+\d+\s+DE\s+\d+\s+\|\s+C[ÓO]DIGO:\s*([^\n]*)$/gmi;
    const matches = [...normalized.matchAll(header)];
    const rows = [];
    const getField = (body, label) => {
        const line = body.split('\n').find(item => label.test(item));
        if (!line)
            return null;
        const index = line.indexOf(':');
        return index >= 0 ? nullable(line.slice(index + 1)) : null;
    };
    const usablePhone = (value) => digitsOnly(value).length >= 8 ? value : null;
    matches.forEach((match, index) => {
        const bodyStart = (match.index ?? 0) + match[0].length;
        const bodyEnd = index + 1 < matches.length ? (matches[index + 1].index ?? normalized.length) : normalized.length;
        const body = normalized.slice(bodyStart, bodyEnd);
        const legacyCode = String(match[1] ?? '').trim();
        const name = getField(body, /^Nome\/Raz[aã]o Social\s*:/i);
        if (!name)
            return;
        const fantasy = getField(body, /^Nome Fantasia\s*:/i);
        const type = getField(body, /^Tipo\s*:/i);
        const cpfCnpj = getField(body, /^CPF\/CNPJ\s*:/i);
        const rgIe = getField(body, /^RG\/IE\s*:/i);
        const cellular = usablePhone(getField(body, /^Celular\s*:/i));
        const residential = usablePhone(getField(body, /^Tel\. Residencial\s*:/i));
        const business = usablePhone(getField(body, /^Tel\. Empresarial\s*:/i));
        const email = getField(body, /^E-mail\s*:/i);
        const address = getField(body, /^Endere[cç]o\s*:/i);
        const neighborhood = getField(body, /^Bairro\s*:/i);
        const cep = getField(body, /^CEP\s*:/i);
        const cityUf = getField(body, /^Cidade\/UF\s*:/i);
        const birth = getField(body, /^Data Nascimento\s*:/i);
        const created = getField(body, /^Data Cadastro\s*:/i);
        const contact = getField(body, /^Contato\s*:/i);
        const customerType = normalizeText(type).includes('jurid') ? 'pj' : 'pf';
        const phone = cellular || residential || business;
        const { city, state } = parseCityState(cityUf);
        const noteParts = [`${IMPORT_MARKER} Código legado: ${legacyCode}`];
        if (cep)
            noteParts.push(`CEP: ${cep}`);
        if (customerType === 'pf' && rgIe)
            noteParts.push(`RG: ${rgIe}`);
        if (residential && residential !== phone)
            noteParts.push(`Tel. residencial: ${residential}`);
        if (business && business !== phone)
            noteParts.push(`Tel. empresarial: ${business}`);
        if (birth)
            noteParts.push(`Data nascimento: ${birth}`);
        if (contact)
            noteParts.push(`Contato: ${contact}`);
        rows.push({
            legacy_code: legacyCode,
            name,
            phone,
            email,
            cpf_cnpj: cpfCnpj,
            address,
            neighborhood,
            city,
            state,
            notes: noteParts.join('; '),
            customer_type: customerType,
            ie: customerType === 'pj' ? rgIe : null,
            company_name: customerType === 'pj' ? (fantasy || name) : null,
            total_purchases: 0,
            created_at: parseBrazilianDate(created),
        });
    });
    return rows;
};
function FranchiseeCustomers({ franchiseId }) {
    const [customers, setCustomers] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [showForm, setShowForm] = (0, react_1.useState)(false);
    const [viewing, setViewing] = (0, react_1.useState)(null);
    const [viewingSales, setViewingSales] = (0, react_1.useState)([]);
    const [loadingSales, setLoadingSales] = (0, react_1.useState)(false);
    const [form, setForm] = (0, react_1.useState)({ name: '', phone: '', email: '', cpf_cnpj: '', address: '', neighborhood: '', city: '', state: '', customer_type: 'pf', ie: '', company_name: '', partner_name: '', partner_cpf: '' });
    const [saving, setSaving] = (0, react_1.useState)(false);
    const [search, setSearch] = (0, react_1.useState)('');
    const importInputRef = (0, react_1.useRef)(null);
    const [importing, setImporting] = (0, react_1.useState)(false);
    const [importProgress, setImportProgress] = (0, react_1.useState)('');
    const [importStatus, setImportStatus] = (0, react_1.useState)(null);
    const load = async () => {
        setLoading(true);
        try {
            const allCustomers = [];
            for (let from = 0;; from += 1000) {
                const { data, error } = await supabase_1.supabase
                    .from('customers')
                    .select('*')
                    .eq('franchise_id', franchiseId)
                    .order('created_at', { ascending: false })
                    .order('id', { ascending: true })
                    .range(from, from + 999);
                if (error)
                    throw error;
                const page = (data ?? []);
                allCustomers.push(...page);
                if (page.length < 1000)
                    break;
            }
            setCustomers(allCustomers);
        }
        catch (error) {
            console.error('Erro ao carregar todos os clientes:', error);
        }
        finally {
            setLoading(false);
        }
    };
    (0, react_1.useEffect)(() => { load(); }, [franchiseId]);
    const filtered = customers.filter(c => {
        if (!search)
            return true;
        const q = search.toLowerCase();
        return c.name?.toLowerCase().includes(q) || c.phone?.includes(q) || c.cpf_cnpj?.includes(q);
    });
    const handleImportTxt = async (event) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file)
            return;
        setImportStatus(null);
        setImporting(true);
        let inserted = 0;
        let skipped = 0;
        try {
            setImportProgress('Lendo e validando a lista...');
            const text = await file.text();
            const source = parseLegacyCustomersTxt(text);
            if (source.length === 0)
                throw new Error('Nenhum cliente foi reconhecido neste TXT.');
            const totalMatch = text.match(/CLIENTE\s+\d+\s+DE\s+(\d+)/i);
            const declaredTotal = totalMatch ? Number(totalMatch[1]) : source.length;
            if (declaredTotal && source.length !== declaredTotal) {
                throw new Error(`O TXT informa ${declaredTotal} clientes, mas ${source.length} foram reconhecidos. A importação foi cancelada para evitar perda de dados.`);
            }
            if (!confirm(`Importar ${source.length.toLocaleString('pt-BR')} clientes para esta unidade?\n\nOs clientes existentes serão preservados e possíveis duplicados serão ignorados.`))
                return;
            setImportProgress('Comparando com os clientes já cadastrados...');
            const existing = [];
            for (let from = 0;; from += 1000) {
                const { data, error } = await supabase_1.supabase
                    .from('customers')
                    .select('name,phone,email,cpf_cnpj,notes')
                    .eq('franchise_id', franchiseId)
                    .order('created_at', { ascending: false })
                    .order('id', { ascending: true })
                    .range(from, from + 999);
                if (error)
                    throw new Error(`Falha ao consultar clientes atuais: ${error.message}`);
                existing.push(...(data || []));
                if (!data || data.length < 1000)
                    break;
            }
            const importedCodes = new Set();
            const cpfKeys = new Set();
            const phoneKeys = new Set();
            const emailKeys = new Set();
            const addKeys = (row) => {
                const name = normalizeText(row.name);
                const cpf = digitsOnly(row.cpf_cnpj);
                const phone = digitsOnly(row.phone);
                const email = normalizeEmail(row.email);
                if (name && cpf)
                    cpfKeys.add(`${name}|${cpf}`);
                if (name && phone)
                    phoneKeys.add(`${name}|${phone}`);
                if (name && email)
                    emailKeys.add(`${name}|${email}`);
                const notes = String(row.notes ?? '');
                const match = notes.match(/\[IMPORT_BKP_20260826\]\s*C[oó]digo legado:\s*([^;]+)/i);
                if (match?.[1])
                    importedCodes.add(match[1].trim());
            };
            existing.forEach(addKeys);
            const pending = [];
            for (const sourceRow of source) {
                const name = normalizeText(sourceRow.name);
                const cpf = digitsOnly(sourceRow.cpf_cnpj);
                const phone = digitsOnly(sourceRow.phone);
                const email = normalizeEmail(sourceRow.email);
                const duplicated = importedCodes.has(sourceRow.legacy_code)
                    || (!!name && !!cpf && cpfKeys.has(`${name}|${cpf}`))
                    || (!!name && !!phone && phoneKeys.has(`${name}|${phone}`))
                    || (!!name && !!email && emailKeys.has(`${name}|${email}`));
                if (duplicated) {
                    skipped++;
                    continue;
                }
                const { legacy_code, ...customerData } = sourceRow;
                pending.push({ franchise_id: franchiseId, ...customerData });
                importedCodes.add(legacy_code);
                addKeys(sourceRow);
            }
            if (pending.length === 0) {
                setImportStatus({ ok: true, message: `Lista conferida: nenhum novo cliente para importar. ${skipped.toLocaleString('pt-BR')} registro(s) já existiam.` });
                return;
            }
            for (let i = 0; i < pending.length; i += 50) {
                const batch = pending.slice(i, i + 50);
                setImportProgress(`Importando ${Math.min(i + batch.length, pending.length).toLocaleString('pt-BR')} de ${pending.length.toLocaleString('pt-BR')} novos clientes...`);
                const { error } = await supabase_1.supabase.from('customers').insert(batch);
                if (error)
                    throw new Error(`Falha no lote ${Math.floor(i / 50) + 1}: ${error.message}`);
                inserted += batch.length;
            }
            setImportStatus({
                ok: true,
                message: `Importação concluída: ${inserted.toLocaleString('pt-BR')} cliente(s) adicionado(s) e ${skipped.toLocaleString('pt-BR')} duplicado(s) ignorado(s).`,
            });
            await load();
        }
        catch (error) {
            setImportStatus({
                ok: false,
                message: `${error instanceof Error ? error.message : String(error)}${inserted ? ` — ${inserted.toLocaleString('pt-BR')} cliente(s) já haviam sido inseridos antes da interrupção.` : ''}`,
            });
        }
        finally {
            setImporting(false);
            setImportProgress('');
        }
    };
    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        await supabase_1.supabase.from('customers').insert({
            franchise_id: franchiseId,
            name: form.name,
            phone: form.phone || null,
            email: form.email || null,
            cpf_cnpj: form.cpf_cnpj || null,
            address: form.address || null,
            neighborhood: form.neighborhood || null,
            city: form.city || null,
            state: form.state || null,
            customer_type: form.customer_type,
            ie: form.ie || null,
            company_name: form.company_name || null,
            partner_name: form.partner_name || null,
            partner_cpf: form.partner_cpf || null,
        });
        setForm({ name: '', phone: '', email: '', cpf_cnpj: '', address: '', neighborhood: '', city: '', state: '', customer_type: 'pf', ie: '', company_name: '', partner_name: '', partner_cpf: '' });
        setShowForm(false);
        setSaving(false);
        load();
    };
    const handleDelete = async (c) => {
        if (!confirm(`Excluir cliente "${c.name}"?`))
            return;
        await supabase_1.supabase.from('customers').delete().eq('id', c.id);
        load();
    };
    const viewCustomer = async (c) => {
        setViewing(c);
        setLoadingSales(true);
        const { data } = await supabase_1.supabase.from('sales').select('*').eq('customer_id', c.id).order('created_at', { ascending: false });
        setViewingSales(data || []);
        setLoadingSales(false);
    };
    const formatTimeAgo = (dateStr) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const days = Math.floor(diff / 86400000);
        if (days === 0)
            return 'Hoje';
        if (days === 1)
            return 'Ontem';
        if (days < 30)
            return `${days} dias atrás`;
        if (days < 365)
            return `${Math.floor(days / 30)} meses atrás`;
        return `${Math.floor(days / 365)} anos atrás`;
    };
    const totalSpent = viewingSales.reduce((sum, s) => sum + (s.total || 0), 0);
    // Aggregate product purchases
    const productHistory = [];
    for (const sale of viewingSales) {
        for (const item of (sale.items || [])) {
            const existing = productHistory.find(p => p.name === item.name);
            if (existing) {
                existing.qty += item.quantity || 1;
                if (new Date(sale.created_at) > new Date(existing.lastBought))
                    existing.lastBought = sale.created_at;
            }
            else {
                productHistory.push({ name: item.name, qty: item.quantity || 1, lastBought: sale.created_at });
            }
        }
    }
    productHistory.sort((a, b) => new Date(b.lastBought).getTime() - new Date(a.lastBought).getTime());
    return ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4", children: [(0, jsx_runtime_1.jsxs)("h3", { className: "text-white font-bold text-lg", children: ["Clientes (", customers.length, ")"] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-wrap gap-2", children: [(0, jsx_runtime_1.jsx)("input", { ref: importInputRef, type: "file", accept: ".txt,text/plain", className: "hidden", onChange: handleImportTxt }), (0, jsx_runtime_1.jsxs)("button", { onClick: () => importInputRef.current?.click(), disabled: importing, className: "bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white text-sm font-bold rounded-lg px-4 py-2 flex items-center gap-1.5 transition-all disabled:opacity-50", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Upload, { size: 16 }), " ", importing ? 'Importando...' : 'Importar lista TXT'] }), (0, jsx_runtime_1.jsxs)("button", { onClick: () => setShowForm(!showForm), disabled: importing, className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 flex items-center gap-1.5 transition-all disabled:opacity-50", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { size: 16 }), " Novo Cliente"] })] })] }), (importing || importStatus) && ((0, jsx_runtime_1.jsxs)("div", { className: `mb-4 rounded-xl border p-3 flex items-start gap-2 ${importStatus?.ok ? 'bg-green-500/10 border-green-500/20' : importStatus && !importStatus.ok ? 'bg-red-500/10 border-red-500/20' : 'bg-[#FFE500]/10 border-[#FFE500]/20'}`, children: [importing ? ((0, jsx_runtime_1.jsx)("div", { className: "w-4 h-4 mt-0.5 border-2 border-zinc-600 border-t-[#FFE500] rounded-full animate-spin shrink-0" })) : importStatus?.ok ? ((0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle2, { size: 16, className: "text-green-400 mt-0.5 shrink-0" })) : ((0, jsx_runtime_1.jsx)(lucide_react_1.AlertCircle, { size: 16, className: "text-red-400 mt-0.5 shrink-0" })), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: `text-sm font-medium ${importStatus?.ok ? 'text-green-300' : importStatus && !importStatus.ok ? 'text-red-300' : 'text-[#FFE500]'}`, children: importing ? importProgress : importStatus?.message }), importing && (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs mt-1", children: "N\u00E3o feche esta tela at\u00E9 concluir." })] })] })), (0, jsx_runtime_1.jsxs)("div", { className: "relative mb-4", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Search, { size: 16, className: "absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: search, onChange: e => setSearch(e.target.value), placeholder: "Buscar por nome, telefone ou CPF...", className: "w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), showForm && ((0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSave, className: "bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4 space-y-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setForm({ ...form, customer_type: 'pf' }), className: `flex-1 text-sm font-bold rounded-lg py-2 ${form.customer_type === 'pf' ? 'bg-[#FFE500] text-black' : 'bg-zinc-800 text-zinc-400'}`, children: "Pessoa F\u00EDsica" }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setForm({ ...form, customer_type: 'pj' }), className: `flex-1 text-sm font-bold rounded-lg py-2 ${form.customer_type === 'pj' ? 'bg-[#FFE500] text-black' : 'bg-zinc-800 text-zinc-400'}`, children: "Pessoa Jur\u00EDdica" })] }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: form.name, onChange: e => setForm({ ...form, name: e.target.value }), required: true, placeholder: form.customer_type === 'pj' ? 'Razão Social' : 'Nome completo', className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [(0, jsx_runtime_1.jsx)("input", { type: "text", value: form.phone, onChange: e => setForm({ ...form, phone: e.target.value }), placeholder: "Telefone", className: "bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: form.cpf_cnpj, onChange: e => setForm({ ...form, cpf_cnpj: e.target.value }), placeholder: form.customer_type === 'pj' ? 'CNPJ' : 'CPF', className: "bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), form.customer_type === 'pj' && ((0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [(0, jsx_runtime_1.jsx)("input", { type: "text", value: form.ie, onChange: e => setForm({ ...form, ie: e.target.value }), placeholder: "Inscri\u00E7\u00E3o Estadual", className: "bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: form.company_name, onChange: e => setForm({ ...form, company_name: e.target.value }), placeholder: "Nome Fantasia", className: "bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: form.partner_name, onChange: e => setForm({ ...form, partner_name: e.target.value }), placeholder: "Nome do s\u00F3cio", className: "bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: form.partner_cpf, onChange: e => setForm({ ...form, partner_cpf: e.target.value }), placeholder: "CPF do s\u00F3cio", className: "bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] })), (0, jsx_runtime_1.jsx)("input", { type: "email", value: form.email, onChange: e => setForm({ ...form, email: e.target.value }), placeholder: "Email", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: form.address, onChange: e => setForm({ ...form, address: e.target.value }), placeholder: "Endere\u00E7o", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3", children: [(0, jsx_runtime_1.jsx)("input", { type: "text", value: form.neighborhood, onChange: e => setForm({ ...form, neighborhood: e.target.value }), placeholder: "Bairro", className: "bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: form.city, onChange: e => setForm({ ...form, city: e.target.value }), placeholder: "Cidade", className: "bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: form.state, onChange: e => setForm({ ...form, state: e.target.value }), placeholder: "UF", className: "bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: saving, className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 disabled:opacity-50", children: "Salvar" })] })), loading ? ((0, jsx_runtime_1.jsx)("div", { className: "flex justify-center py-12", children: (0, jsx_runtime_1.jsx)("div", { className: "w-6 h-6 border-2 border-zinc-700 border-t-[#FFE500] rounded-full animate-spin" }) })) : filtered.length === 0 ? ((0, jsx_runtime_1.jsxs)("div", { className: "text-center py-12", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Users, { size: 40, className: "mx-auto text-zinc-700 mb-3" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-sm", children: search ? 'Nenhum cliente encontrado.' : 'Nenhum cliente cadastrado.' })] })) : ((0, jsx_runtime_1.jsx)("div", { className: "space-y-2 max-h-[60vh] overflow-y-auto", children: filtered.map(c => ((0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex items-center justify-between hover:border-zinc-700 transition-colors", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3 min-w-0", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-10 h-10 rounded-full bg-[#FFE500]/10 flex items-center justify-center text-[#FFE500] text-sm font-bold shrink-0", children: c.name.charAt(0).toUpperCase() }), (0, jsx_runtime_1.jsxs)("div", { className: "min-w-0", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-white text-sm font-bold truncate", children: c.name }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 text-zinc-500 text-xs", children: [c.phone && (0, jsx_runtime_1.jsx)("span", { children: c.phone }), c.city && (0, jsx_runtime_1.jsxs)("span", { children: ["\u00B7 ", c.city, "/", c.state || ''] })] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-1 shrink-0", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => viewCustomer(c), className: "text-zinc-400 hover:text-[#FFE500] p-1.5", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Eye, { size: 15 }) }), (0, jsx_runtime_1.jsx)("button", { onClick: () => handleDelete(c), className: "text-zinc-400 hover:text-red-400 p-1.5", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { size: 15 }) })] })] }, c.id))) })), viewing && ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm", onClick: () => { setViewing(null); setViewingSales([]); }, children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto p-6", onClick: e => e.stopPropagation(), children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-4", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-white font-bold text-lg", children: "Dados do cliente" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => { setViewing(null); setViewingSales([]); }, className: "text-zinc-400 hover:text-white", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { size: 20 }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-16 h-16 rounded-full bg-[#FFE500]/10 flex items-center justify-center text-[#FFE500] text-2xl font-bold mx-auto", children: viewing.name.charAt(0).toUpperCase() }), (0, jsx_runtime_1.jsx)("p", { className: "text-white font-bold text-center", children: viewing.name }), viewing.phone && (0, jsx_runtime_1.jsxs)("p", { className: "text-zinc-400 text-sm flex items-center gap-2 justify-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Phone, { size: 14 }), " ", viewing.phone] }), viewing.email && (0, jsx_runtime_1.jsxs)("p", { className: "text-zinc-400 text-sm flex items-center gap-2 justify-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Mail, { size: 14 }), " ", viewing.email] }), viewing.cpf_cnpj && (0, jsx_runtime_1.jsxs)("p", { className: "text-zinc-400 text-sm flex items-center gap-2 justify-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.CreditCard, { size: 14 }), " ", viewing.cpf_cnpj] }), viewing.address && (0, jsx_runtime_1.jsxs)("p", { className: "text-zinc-400 text-sm flex items-center gap-2 justify-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.MapPin, { size: 14 }), " ", viewing.address] }), (viewing.city || viewing.neighborhood) && ((0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs text-center", children: [viewing.neighborhood, viewing.city, viewing.state].filter(Boolean).join(', ') })), (0, jsx_runtime_1.jsxs)("p", { className: "text-zinc-500 text-xs text-center", children: ["Cliente desde ", new Date(viewing.created_at).toLocaleDateString('pt-BR')] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-5 grid grid-cols-2 gap-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-800/50 rounded-lg p-3 text-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.TrendingUp, { size: 18, className: "mx-auto text-green-400 mb-1" }), (0, jsx_runtime_1.jsxs)("p", { className: "text-white font-bold text-lg", children: ["R$ ", totalSpent.toFixed(2)] }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs", children: "Total comprado" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-800/50 rounded-lg p-3 text-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ShoppingBag, { size: 18, className: "mx-auto text-[#FFE500] mb-1" }), (0, jsx_runtime_1.jsx)("p", { className: "text-white font-bold text-lg", children: viewingSales.length }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs", children: "Compras realizadas" })] })] }), productHistory.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "mt-5", children: [(0, jsx_runtime_1.jsxs)("h4", { className: "text-zinc-300 text-sm font-bold mb-2 flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ShoppingBag, { size: 15 }), " Produtos comprados"] }), (0, jsx_runtime_1.jsx)("div", { className: "space-y-1.5 max-h-40 overflow-y-auto", children: productHistory.map((p, i) => ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between bg-zinc-800/30 rounded-lg px-3 py-2", children: [(0, jsx_runtime_1.jsxs)("div", { className: "min-w-0", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-white text-sm font-medium truncate", children: p.name }), (0, jsx_runtime_1.jsxs)("p", { className: "text-zinc-500 text-xs flex items-center gap-1", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Clock, { size: 10 }), " ", formatTimeAgo(p.lastBought)] })] }), (0, jsx_runtime_1.jsxs)("span", { className: "text-[#FFE500] text-sm font-bold shrink-0 ml-2", children: [p.qty, "x"] })] }, i))) })] })), loadingSales ? ((0, jsx_runtime_1.jsx)("div", { className: "flex justify-center py-4 mt-4", children: (0, jsx_runtime_1.jsx)("div", { className: "w-5 h-5 border-2 border-zinc-700 border-t-[#FFE500] rounded-full animate-spin" }) })) : viewingSales.length > 0 ? ((0, jsx_runtime_1.jsxs)("div", { className: "mt-5", children: [(0, jsx_runtime_1.jsx)("h4", { className: "text-zinc-300 text-sm font-bold mb-2", children: "Hist\u00F3rico de compras" }), (0, jsx_runtime_1.jsx)("div", { className: "space-y-2 max-h-48 overflow-y-auto", children: viewingSales.map(s => ((0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-800/30 rounded-lg p-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-1", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-zinc-400 text-xs", children: new Date(s.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }), (0, jsx_runtime_1.jsxs)("span", { className: "text-green-400 text-sm font-bold", children: ["R$ ", s.total.toFixed(2)] })] }), (0, jsx_runtime_1.jsx)("div", { className: "flex flex-wrap gap-1", children: (s.items || []).map((item, i) => ((0, jsx_runtime_1.jsxs)("span", { className: "text-zinc-500 text-xs bg-zinc-800 rounded px-1.5 py-0.5", children: [item.quantity, "x ", item.name] }, i))) })] }, s.id))) })] })) : ((0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs text-center mt-4", children: "Nenhuma compra registrada ainda." }))] }) }))] }));
}

},
"/src/components/franchisee/FranchiseeDelivery.tsx": function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = FranchiseeDelivery;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const supabase_1 = require("@/lib/supabase");
const lucide_react_1 = require("lucide-react");
const mtClient_1 = require("@/lib/mtClient");
function FranchiseeDelivery({ franchiseId }) {
    const [settings, setSettings] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [saving, setSaving] = (0, react_1.useState)(false);
    const [form, setForm] = (0, react_1.useState)({
        enabled: false,
        contact_phone: '',
        contact_whatsapp: '',
        address: '',
        pickup_neighborhood: '',
        pickup_city: '',
        pickup_state: '',
        latitude: '',
        longitude: '',
        fee_type: 'km',
        fee_value: '',
        fee_store_percent: '0',
        fee_ranges: [],
        neighborhood_fees: [],
        mt_entregas_enabled: false,
        mt_entregas_username: '',
        mt_entregas_password: '',
        mt_entregas_company_id: '',
        mt_entregas_category_id: '',
    });
    const [testingMt, setTestingMt] = (0, react_1.useState)(false);
    const [mtTestResult, setMtTestResult] = (0, react_1.useState)(null);
    const load = async () => {
        const { data } = await supabase_1.supabase.from('delivery_settings').select('*').eq('franchise_id', franchiseId).maybeSingle();
        if (data) {
            const s = data;
            setSettings(s);
            const pickup = (0, mtClient_1.parseStoredPickupAddress)(s.address);
            setForm({
                enabled: s.enabled,
                contact_phone: s.contact_phone ?? '',
                contact_whatsapp: s.contact_whatsapp ?? '',
                address: pickup.address || s.address || '',
                pickup_neighborhood: pickup.neighborhood,
                pickup_city: pickup.city,
                pickup_state: pickup.state,
                latitude: s.latitude?.toString() ?? '',
                longitude: s.longitude?.toString() ?? '',
                fee_type: s.fee_type,
                fee_value: s.fee_value?.toString() ?? '',
                fee_store_percent: s.fee_store_percent?.toString() ?? '0',
                fee_ranges: s.fee_ranges?.map(r => ({ up_to_km: String(r.up_to_km), fee: String(r.fee) })) ?? [],
                neighborhood_fees: s.neighborhood_fees?.map(n => ({ name: n.name, fee: String(n.fee) })) ?? [],
                mt_entregas_enabled: s.mt_entregas_enabled ?? false,
                mt_entregas_username: s.mt_entregas_username ?? '',
                mt_entregas_password: s.mt_entregas_password ?? '',
                mt_entregas_company_id: s.mt_entregas_company_id?.toString() ?? '',
                mt_entregas_category_id: s.mt_entregas_category_id?.toString() ?? '',
            });
        }
        setLoading(false);
    };
    (0, react_1.useEffect)(() => { load(); }, [franchiseId]);
    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        const payload = {
            franchise_id: franchiseId,
            enabled: form.enabled,
            contact_phone: form.contact_phone || null,
            contact_whatsapp: form.contact_whatsapp || null,
            address: (0, mtClient_1.serializePickupAddress)({ address: form.address, neighborhood: form.pickup_neighborhood, city: form.pickup_city, state: form.pickup_state }) || null,
            latitude: form.latitude ? parseFloat(form.latitude) : null,
            longitude: form.longitude ? parseFloat(form.longitude) : null,
            fee_type: form.fee_type,
            fee_value: parseFloat(form.fee_value) || 0,
            fee_store_percent: Math.min(100, Math.max(0, parseFloat(form.fee_store_percent) || 0)),
            fee_ranges: form.fee_ranges.filter(r => r.up_to_km && r.fee).map(r => ({ up_to_km: parseFloat(r.up_to_km), fee: parseFloat(r.fee) })),
            neighborhood_fees: form.neighborhood_fees.filter(n => n.name && n.fee).map(n => ({ name: n.name, fee: parseFloat(n.fee) })),
            mt_entregas_enabled: form.mt_entregas_enabled,
            mt_entregas_username: form.mt_entregas_username || null,
            mt_entregas_password: form.mt_entregas_password || null,
            mt_entregas_company_id: form.mt_entregas_company_id ? parseInt(form.mt_entregas_company_id) : null,
            mt_entregas_category_id: form.mt_entregas_category_id ? parseInt(form.mt_entregas_category_id) : null,
        };
        if (settings) {
            await supabase_1.supabase.from('delivery_settings').update(payload).eq('id', settings.id);
        }
        else {
            await supabase_1.supabase.from('delivery_settings').insert(payload);
        }
        setSaving(false);
        load();
    };
    if (loading) {
        return (0, jsx_runtime_1.jsx)("div", { className: "flex justify-center py-12", children: (0, jsx_runtime_1.jsx)("div", { className: "w-6 h-6 border-2 border-zinc-700 border-t-[#FFE500] rounded-full animate-spin" }) });
    }
    return ((0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSave, className: "space-y-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-white font-bold text-lg", children: "Delivery" }), (0, jsx_runtime_1.jsxs)("label", { className: "flex items-center gap-2 cursor-pointer", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: form.enabled, onChange: e => setForm({ ...form, enabled: e.target.checked }), className: "w-5 h-5 accent-[#FFE500]" }), (0, jsx_runtime_1.jsx)("span", { className: `text-sm font-bold ${form.enabled ? 'text-green-400' : 'text-zinc-500'}`, children: form.enabled ? 'Ativado' : 'Desativado' })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3", children: [(0, jsx_runtime_1.jsxs)("h4", { className: "text-white font-bold text-sm flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Phone, { size: 16, className: "text-[#FFE500]" }), " Contato"] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Telefone" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: form.contact_phone, onChange: e => setForm({ ...form, contact_phone: e.target.value }), className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "WhatsApp" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: form.contact_whatsapp, onChange: e => setForm({ ...form, contact_whatsapp: e.target.value }), className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3", children: [(0, jsx_runtime_1.jsxs)("h4", { className: "text-white font-bold text-sm flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.MapPin, { size: 16, className: "text-[#FFE500]" }), " Localiza\u00E7\u00E3o"] }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs", children: "A MT Entregas exige os dados completos do ponto de retirada. Estes campos usam o mesmo cadastro de Delivery j\u00E1 existente; n\u00E3o criam tabela nem coluna nova." }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Endere\u00E7o da retirada (rua e n\u00FAmero)" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: form.address, onChange: e => setForm({ ...form, address: e.target.value }), placeholder: "Ex.: Rua Lucca, 414", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 sm:grid-cols-[1fr_1fr_80px] gap-3", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Bairro" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: form.pickup_neighborhood, onChange: e => setForm({ ...form, pickup_neighborhood: e.target.value }), className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Cidade" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: form.pickup_city, onChange: e => setForm({ ...form, pickup_city: e.target.value }), className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "UF" }), (0, jsx_runtime_1.jsx)("input", { type: "text", maxLength: 2, value: form.pickup_state, onChange: e => setForm({ ...form, pickup_state: e.target.value.toUpperCase() }), className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm uppercase focus:outline-none focus:border-[#FFE500]" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-3", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Latitude" }), (0, jsx_runtime_1.jsx)("input", { type: "number", step: "any", value: form.latitude, onChange: e => setForm({ ...form, latitude: e.target.value }), className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Longitude" }), (0, jsx_runtime_1.jsx)("input", { type: "number", step: "any", value: form.longitude, onChange: e => setForm({ ...form, longitude: e.target.value }), className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3", children: [(0, jsx_runtime_1.jsxs)("h4", { className: "text-white font-bold text-sm flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Bike, { size: 16, className: "text-[#FFE500]" }), " Taxas de Entrega"] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Tipo de cobran\u00E7a" }), (0, jsx_runtime_1.jsxs)("select", { value: form.fee_type, onChange: e => setForm({ ...form, fee_type: e.target.value }), className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]", children: [(0, jsx_runtime_1.jsx)("option", { value: "km", children: "Por KM" }), (0, jsx_runtime_1.jsx)("option", { value: "range", children: "Faixas de dist\u00E2ncia" }), (0, jsx_runtime_1.jsx)("option", { value: "neighborhood", children: "Por bairro" })] })] }), form.fee_type === 'km' && ((0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Valor por KM (R$)" }), (0, jsx_runtime_1.jsx)("input", { type: "number", step: "0.01", value: form.fee_value, onChange: e => setForm({ ...form, fee_value: e.target.value }), className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Ajuda de custo da loja (%)" }), (0, jsx_runtime_1.jsx)("input", { type: "number", min: "0", max: "100", step: "1", value: form.fee_store_percent, onChange: e => setForm({ ...form, fee_store_percent: e.target.value }), className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs mt-1", children: "A loja paga esta % da taxa. O cliente paga o resto." })] })] })), form.fee_type === 'range' && ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-3", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Ajuda de custo da loja (%)" }), (0, jsx_runtime_1.jsx)("input", { type: "number", min: "0", max: "100", step: "1", value: form.fee_store_percent, onChange: e => setForm({ ...form, fee_store_percent: e.target.value }), className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs mt-1", children: "A loja paga esta % da taxa. O cliente paga o resto." })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [form.fee_ranges.map((r, i) => ((0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2 items-center", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-zinc-400 text-xs", children: "At\u00E9" }), (0, jsx_runtime_1.jsx)("input", { type: "number", step: "0.1", value: r.up_to_km, onChange: e => { const arr = [...form.fee_ranges]; arr[i] = { ...arr[i], up_to_km: e.target.value }; setForm({ ...form, fee_ranges: arr }); }, placeholder: "KM", className: "w-20 bg-zinc-800 border border-zinc-700 text-white rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-[#FFE500]" }), (0, jsx_runtime_1.jsx)("span", { className: "text-zinc-400 text-xs", children: "km: R$" }), (0, jsx_runtime_1.jsx)("input", { type: "number", step: "0.01", value: r.fee, onChange: e => { const arr = [...form.fee_ranges]; arr[i] = { ...arr[i], fee: e.target.value }; setForm({ ...form, fee_ranges: arr }); }, className: "w-24 bg-zinc-800 border border-zinc-700 text-white rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-[#FFE500]" }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setForm({ ...form, fee_ranges: form.fee_ranges.filter((_, j) => j !== i) }), className: "text-zinc-400 hover:text-red-400 p-1", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { size: 14 }) })] }, i))), (0, jsx_runtime_1.jsxs)("button", { type: "button", onClick: () => setForm({ ...form, fee_ranges: [...form.fee_ranges, { up_to_km: '', fee: '' }] }), className: "text-[#FFE500] text-xs font-bold flex items-center gap-1", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { size: 14 }), " Adicionar faixa"] })] })] })), form.fee_type === 'neighborhood' && ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-3", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Ajuda de custo da loja (%)" }), (0, jsx_runtime_1.jsx)("input", { type: "number", min: "0", max: "100", step: "1", value: form.fee_store_percent, onChange: e => setForm({ ...form, fee_store_percent: e.target.value }), className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs mt-1", children: "A loja paga esta % da taxa. O cliente paga o resto." })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [form.neighborhood_fees.map((n, i) => ((0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2 items-center", children: [(0, jsx_runtime_1.jsx)("input", { type: "text", value: n.name, onChange: e => { const arr = [...form.neighborhood_fees]; arr[i] = { ...arr[i], name: e.target.value }; setForm({ ...form, neighborhood_fees: arr }); }, placeholder: "Nome do bairro", className: "flex-1 bg-zinc-800 border border-zinc-700 text-white rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-[#FFE500]" }), (0, jsx_runtime_1.jsx)("input", { type: "number", step: "0.01", value: n.fee, onChange: e => { const arr = [...form.neighborhood_fees]; arr[i] = { ...arr[i], fee: e.target.value }; setForm({ ...form, neighborhood_fees: arr }); }, placeholder: "R$", className: "w-24 bg-zinc-800 border border-zinc-700 text-white rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-[#FFE500]" }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setForm({ ...form, neighborhood_fees: form.neighborhood_fees.filter((_, j) => j !== i) }), className: "text-zinc-400 hover:text-red-400 p-1", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { size: 14 }) })] }, i))), (0, jsx_runtime_1.jsxs)("button", { type: "button", onClick: () => setForm({ ...form, neighborhood_fees: [...form.neighborhood_fees, { name: '', fee: '' }] }), className: "text-[#FFE500] text-xs font-bold flex items-center gap-1", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { size: 14 }), " Adicionar bairro"] })] })] }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("h4", { className: "text-white font-bold text-sm flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Truck, { size: 16, className: "text-[#FFE500]" }), " MT Entregas (Machine)"] }), (0, jsx_runtime_1.jsxs)("label", { className: "flex items-center gap-2 cursor-pointer", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: form.mt_entregas_enabled, onChange: e => setForm({ ...form, mt_entregas_enabled: e.target.checked }), className: "w-5 h-5 accent-[#FFE500]" }), (0, jsx_runtime_1.jsx)("span", { className: `text-sm font-bold ${form.mt_entregas_enabled ? 'text-green-400' : 'text-zinc-500'}`, children: form.mt_entregas_enabled ? 'Ativado' : 'Desativado' })] })] }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs", children: "Integra\u00E7\u00E3o com a API da Machine Entregas para solicitar entregadores. A chave da API j\u00E1 est\u00E1 configurada no sistema. Informe abaixo o login e senha do seu usu\u00E1rio da Machine e o ID da sua empresa." }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Login (usu\u00E1rio)" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: form.mt_entregas_username, onChange: e => setForm({ ...form, mt_entregas_username: e.target.value }), placeholder: "Seu login da Machine", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Senha" }), (0, jsx_runtime_1.jsx)("input", { type: "password", value: form.mt_entregas_password, onChange: e => setForm({ ...form, mt_entregas_password: e.target.value }), placeholder: "Sua senha da Machine", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "ID da Empresa" }), (0, jsx_runtime_1.jsx)("input", { type: "number", value: form.mt_entregas_company_id, onChange: e => setForm({ ...form, mt_entregas_company_id: e.target.value }), placeholder: "empresa_id", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "ID da Categoria (opcional)" }), (0, jsx_runtime_1.jsx)("input", { type: "number", value: form.mt_entregas_category_id, onChange: e => setForm({ ...form, mt_entregas_category_id: e.target.value }), placeholder: "categoria_id", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] })] }), (0, jsx_runtime_1.jsxs)("button", { type: "button", disabled: testingMt || !form.mt_entregas_username || !form.mt_entregas_password, onClick: async () => {
                            setTestingMt(true);
                            setMtTestResult(null);
                            try {
                                const apiUrl = `${"https://sgvojdgbjvynnoherpqj.supabase.co"}/functions/v1/mt-entregas`;
                                const resp = await fetch(apiUrl, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json', 'apikey': "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNndm9qZGdianZ5bm5vaGVycHFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3NDE4ODIsImV4cCI6MjEwMTMxNzg4Mn0.RuAHGD0VCcDxIL4jfSFXjyiC4ZzVgRAZna3j80ovIf4" },
                                    body: JSON.stringify({
                                        action: 'list_deliveries',
                                        payload: {
                                            basic_auth: { username: form.mt_entregas_username, password: form.mt_entregas_password },
                                            company_id: form.mt_entregas_company_id ? parseInt(form.mt_entregas_company_id) : undefined,
                                            limit: 1,
                                        },
                                    }),
                                });
                                const json = await resp.json();
                                if (resp.ok && json.success !== false) {
                                    setMtTestResult({ ok: true, message: 'Conexão validada com sucesso!' });
                                }
                                else {
                                    setMtTestResult({ ok: false, message: json.errors?.join(', ') || json.error || 'Falha na conexão' });
                                }
                            }
                            catch (err) {
                                setMtTestResult({ ok: false, message: err.message });
                            }
                            setTestingMt(false);
                        }, className: "bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-lg px-4 py-2 flex items-center gap-2 transition-colors border border-zinc-700 disabled:opacity-50", children: [testingMt ? (0, jsx_runtime_1.jsx)("div", { className: "w-4 h-4 border-2 border-zinc-600 border-t-[#FFE500] rounded-full animate-spin" }) : (0, jsx_runtime_1.jsx)(lucide_react_1.TestTube, { size: 14 }), "Testar conex\u00E3o"] }), mtTestResult && ((0, jsx_runtime_1.jsx)("div", { className: `rounded-lg p-3 text-sm ${mtTestResult.ok ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`, children: mtTestResult.message }))] }), (0, jsx_runtime_1.jsxs)("button", { type: "submit", disabled: saving, className: "bg-[#FFE500] hover:bg-[#FFD000] text-black font-bold rounded-lg px-6 py-3 flex items-center gap-2 transition-all disabled:opacity-50", children: [saving ? (0, jsx_runtime_1.jsx)("div", { className: "w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" }) : (0, jsx_runtime_1.jsx)(lucide_react_1.Save, { size: 18 }), "Salvar configura\u00E7\u00F5es"] })] }));
}

},
"/src/components/franchisee/FranchiseeFactoryOrder.tsx": function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = FranchiseeFactoryOrder;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const supabase_1 = require("@/lib/supabase");
const lucide_react_1 = require("lucide-react");
const STATUS_LABELS = {
    pending: 'Pendente', processing: 'Em preparo', shipped: 'Enviado', delivered: 'Entregue', cancelled: 'Cancelado',
};
const STATUS_COLORS = {
    pending: 'bg-yellow-500/10 text-yellow-400', processing: 'bg-blue-500/10 text-blue-400', shipped: 'bg-purple-500/10 text-purple-400', delivered: 'bg-green-500/10 text-green-400', cancelled: 'bg-red-500/10 text-red-400',
};
const STATUS_ICONS = {
    pending: (0, jsx_runtime_1.jsx)(lucide_react_1.Clock, { size: 12 }), processing: (0, jsx_runtime_1.jsx)(lucide_react_1.Loader, { size: 12 }), shipped: (0, jsx_runtime_1.jsx)(lucide_react_1.Truck, { size: 12 }), delivered: (0, jsx_runtime_1.jsx)(lucide_react_1.PackageCheck, { size: 12 }), cancelled: (0, jsx_runtime_1.jsx)(lucide_react_1.Ban, { size: 12 }),
};
function FranchiseeFactoryOrder({ franchiseId }) {
    const [tab, setTab] = (0, react_1.useState)('shop');
    const [products, setProducts] = (0, react_1.useState)([]);
    const [orders, setOrders] = (0, react_1.useState)([]);
    const [policies, setPolicies] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [cart, setCart] = (0, react_1.useState)([]);
    const [showCart, setShowCart] = (0, react_1.useState)(false);
    const [notes, setNotes] = (0, react_1.useState)('');
    const [submitting, setSubmitting] = (0, react_1.useState)(false);
    const [success, setSuccess] = (0, react_1.useState)(false);
    const load = async () => {
        const [{ data: prodData }, { data: orderData }, { data: policyData }] = await Promise.all([
            supabase_1.supabase.from('factory_products').select('*').eq('active', true).order('sort_order').order('name'),
            supabase_1.supabase.from('factory_orders').select('*').eq('franchise_id', franchiseId).order('created_at', { ascending: false }),
            supabase_1.supabase.from('factory_commercial_policy').select('*').eq('active', true).order('created_at'),
        ]);
        if (prodData)
            setProducts(prodData);
        if (orderData)
            setOrders(orderData);
        if (policyData)
            setPolicies(policyData);
        setLoading(false);
    };
    (0, react_1.useEffect)(() => { load(); }, [franchiseId]);
    const addToCart = (p) => {
        const existing = cart.find(c => c.product_id === p.id);
        if (existing) {
            setCart(cart.map(c => c.product_id === p.id ? { ...c, quantity: c.quantity + 1 } : c));
        }
        else {
            setCart([...cart, { product_id: p.id, name: p.name, quantity: 1, price: p.price }]);
        }
    };
    const updateQty = (id, delta) => {
        setCart(cart.map(c => c.product_id === id ? { ...c, quantity: Math.max(1, c.quantity + delta) } : c));
    };
    const removeFromCart = (id) => {
        setCart(cart.filter(c => c.product_id !== id));
    };
    const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const submitOrder = async () => {
        setSubmitting(true);
        const { error } = await supabase_1.supabase.from('factory_orders').insert({
            franchise_id: franchiseId,
            items: cart,
            notes: notes || null,
            total: cartTotal,
            status: 'pending',
        });
        if (!error) {
            setCart([]);
            setNotes('');
            setShowCart(false);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
            load();
        }
        setSubmitting(false);
    };
    if (loading) {
        return (0, jsx_runtime_1.jsx)("div", { className: "flex justify-center py-12", children: (0, jsx_runtime_1.jsx)("div", { className: "w-6 h-6 border-2 border-zinc-700 border-t-[#FFE500] rounded-full animate-spin" }) });
    }
    const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'processing' || o.status === 'shipped').length;
    return ((0, jsx_runtime_1.jsxs)("div", { children: [success && ((0, jsx_runtime_1.jsx)("div", { className: "bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg p-3 mb-4 text-sm", children: "Pedido enviado com sucesso! O master ir\u00E1 processar seu pedido." })), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2 mb-4", children: [(0, jsx_runtime_1.jsxs)("button", { onClick: () => setTab('shop'), className: `flex items-center gap-2 text-sm font-bold rounded-lg px-4 py-2 transition-colors ${tab === 'shop' ? 'bg-[#FFE500] text-black' : 'bg-zinc-900 text-zinc-400 hover:text-white'}`, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ShoppingCart, { size: 16 }), " Fazer pedido"] }), (0, jsx_runtime_1.jsxs)("button", { onClick: () => setTab('orders'), className: `flex items-center gap-2 text-sm font-bold rounded-lg px-4 py-2 transition-colors ${tab === 'orders' ? 'bg-[#FFE500] text-black' : 'bg-zinc-900 text-zinc-400 hover:text-white'}`, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ClipboardList, { size: 16 }), " Meus pedidos ", pendingOrders > 0 && (0, jsx_runtime_1.jsx)("span", { className: "bg-yellow-500/20 text-yellow-400 text-xs px-1.5 py-0.5 rounded-full", children: pendingOrders })] }), (0, jsx_runtime_1.jsxs)("button", { onClick: () => setTab('policy'), className: `flex items-center gap-2 text-sm font-bold rounded-lg px-4 py-2 transition-colors ${tab === 'policy' ? 'bg-[#FFE500] text-black' : 'bg-zinc-900 text-zinc-400 hover:text-white'}`, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.FileText, { size: 16 }), " Pol\u00EDtica Comercial"] })] }), tab === 'shop' && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-4", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-white font-bold text-sm", children: "Produtos dispon\u00EDveis" }), cart.length > 0 && ((0, jsx_runtime_1.jsxs)("button", { onClick: () => setShowCart(true), className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 flex items-center gap-1.5 transition-all", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ShoppingCart, { size: 16 }), " Carrinho (", cart.length, ")"] }))] }), products.length === 0 ? ((0, jsx_runtime_1.jsxs)("div", { className: "text-center py-12", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Package, { size: 40, className: "mx-auto text-zinc-700 mb-3" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-sm", children: "Nenhum produto dispon\u00EDvel para pedido no momento." })] })) : ((0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3", children: products.map(p => ((0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-4", children: [p.image_url ? ((0, jsx_runtime_1.jsx)("img", { src: p.image_url, alt: p.name, className: "w-full h-24 rounded-lg object-cover mb-3" })) : ((0, jsx_runtime_1.jsx)("div", { className: "w-full h-24 rounded-lg bg-zinc-800 flex items-center justify-center mb-3", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Package, { size: 28, className: "text-zinc-600" }) })), (0, jsx_runtime_1.jsx)("p", { className: "text-white text-sm font-bold", children: p.name }), p.description && (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs mt-0.5 line-clamp-2", children: p.description }), (0, jsx_runtime_1.jsxs)("p", { className: "text-[#FFE500] font-bold text-sm mt-2", children: ["R$ ", p.price.toFixed(2)] }), (0, jsx_runtime_1.jsxs)("button", { onClick: () => addToCart(p), className: "w-full mt-3 bg-zinc-800 hover:bg-[#FFE500] hover:text-black text-white text-xs font-bold rounded-lg py-2 flex items-center justify-center gap-1 transition-all", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { size: 14 }), " Adicionar"] })] }, p.id))) }))] })), tab === 'orders' && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-white font-bold text-sm mb-4", children: "Meus pedidos de f\u00E1brica" }), orders.length === 0 ? ((0, jsx_runtime_1.jsxs)("div", { className: "text-center py-12", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ClipboardList, { size: 40, className: "mx-auto text-zinc-700 mb-3" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-sm", children: "Voc\u00EA ainda n\u00E3o fez nenhum pedido de f\u00E1brica." })] })) : ((0, jsx_runtime_1.jsx)("div", { className: "space-y-3", children: orders.map(order => ((0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-start justify-between mb-2", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 mb-1", children: [(0, jsx_runtime_1.jsxs)("span", { className: `text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${STATUS_COLORS[order.status]}`, children: [STATUS_ICONS[order.status], " ", STATUS_LABELS[order.status]] }), (0, jsx_runtime_1.jsx)("span", { className: "text-zinc-500 text-xs", children: new Date(order.created_at).toLocaleString('pt-BR') })] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-zinc-400 text-xs", children: [order.items?.length ?? 0, " item(ns)"] })] }), order.total > 0 && (0, jsx_runtime_1.jsxs)("span", { className: "text-[#FFE500] font-bold text-sm", children: ["R$ ", order.total.toFixed(2)] })] }), (0, jsx_runtime_1.jsx)("div", { className: "mt-2 space-y-1", children: Array.isArray(order.items) && order.items.map((item, i) => ((0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between text-xs", children: [(0, jsx_runtime_1.jsxs)("span", { className: "text-zinc-300", children: [item.quantity, "x ", item.name ?? item.title ?? `Item ${i + 1}`] }), item.price && (0, jsx_runtime_1.jsxs)("span", { className: "text-zinc-500", children: ["R$ ", ((item.price ?? 0) * (item.quantity ?? 1)).toFixed(2)] })] }, i))) }), order.notes && (0, jsx_runtime_1.jsxs)("p", { className: "text-zinc-500 text-xs mt-2 italic", children: ["\"", order.notes, "\""] }), (0, jsx_runtime_1.jsx)("div", { className: "flex items-center gap-1 mt-3 pt-3 border-t border-zinc-800", children: ['pending', 'processing', 'shipped', 'delivered'].map((step, i) => {
                                        const stepOrder = ['pending', 'processing', 'shipped', 'delivered'];
                                        const currentIdx = stepOrder.indexOf(order.status);
                                        const stepIdx = i;
                                        const isPast = stepIdx <= currentIdx && order.status !== 'cancelled';
                                        return ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center flex-1", children: [(0, jsx_runtime_1.jsx)("div", { className: `w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${isPast ? 'bg-[#FFE500] text-black' : 'bg-zinc-800 text-zinc-600'}`, children: stepIdx < currentIdx || (stepIdx === currentIdx && order.status !== 'pending') ? (0, jsx_runtime_1.jsx)(lucide_react_1.Check, { size: 10 }) : stepIdx + 1 }), i < 3 && (0, jsx_runtime_1.jsx)("div", { className: `flex-1 h-0.5 mx-1 ${stepIdx < currentIdx ? 'bg-[#FFE500]' : 'bg-zinc-800'}` })] }, step));
                                    }) }), (0, jsx_runtime_1.jsx)("div", { className: "flex justify-between mt-1", children: ['Pendente', 'Preparo', 'Enviado', 'Entregue'].map((label, i) => ((0, jsx_runtime_1.jsx)("span", { className: "text-[9px] text-zinc-600 flex-1 text-center", children: label }, i))) })] }, order.id))) }))] })), tab === 'policy' && ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-white font-bold text-sm", children: "Pol\u00EDtica Comercial e Ofertas" }), policies.length === 0 ? ((0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-sm text-center py-8", children: "Nenhuma pol\u00EDtica comercial dispon\u00EDvel no momento." })) : (policies.map(p => ((0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-5", children: [(0, jsx_runtime_1.jsxs)("h4", { className: "text-[#FFE500] font-bold text-sm mb-2 flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.FileText, { size: 16 }), " ", p.title] }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-300 text-sm whitespace-pre-wrap", children: p.content }), (0, jsx_runtime_1.jsxs)("p", { className: "text-zinc-600 text-xs mt-3", children: ["Atualizado em ", new Date(p.updated_at).toLocaleDateString('pt-BR')] })] }, p.id))))] })), showCart && ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm", onClick: () => setShowCart(false), children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto", onClick: e => e.stopPropagation(), children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-white font-bold text-lg", children: "Carrinho" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setShowCart(false), className: "text-zinc-400 hover:text-white", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { size: 20 }) })] }), (0, jsx_runtime_1.jsx)("div", { className: "p-6 space-y-3", children: cart.length === 0 ? ((0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-sm text-center py-8", children: "Carrinho vazio." })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [cart.map(item => ((0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-white text-sm font-medium", children: item.name }), (0, jsx_runtime_1.jsxs)("p", { className: "text-zinc-500 text-xs", children: ["R$ ", item.price.toFixed(2), " cada"] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 mt-1", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => updateQty(item.product_id, -1), className: "w-6 h-6 rounded bg-zinc-700 text-white text-sm", children: "\u2212" }), (0, jsx_runtime_1.jsx)("span", { className: "text-white text-sm", children: item.quantity }), (0, jsx_runtime_1.jsx)("button", { onClick: () => updateQty(item.product_id, 1), className: "w-6 h-6 rounded bg-zinc-700 text-white text-sm", children: "+" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "text-right", children: [(0, jsx_runtime_1.jsxs)("p", { className: "text-[#FFE500] font-bold text-sm", children: ["R$ ", (item.price * item.quantity).toFixed(2)] }), (0, jsx_runtime_1.jsx)("button", { onClick: () => removeFromCart(item.product_id), className: "text-zinc-400 hover:text-red-400 p-1.5 mt-1", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { size: 15 }) })] })] }, item.product_id))), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between border-t border-zinc-800 pt-3", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-white font-bold", children: "Total" }), (0, jsx_runtime_1.jsxs)("span", { className: "text-[#FFE500] font-bold", children: ["R$ ", cartTotal.toFixed(2)] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Observa\u00E7\u00F5es" }), (0, jsx_runtime_1.jsx)("textarea", { value: notes, onChange: e => setNotes(e.target.value), rows: 2, placeholder: "Alguma observa\u00E7\u00E3o para o pedido?", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500] resize-none" })] }), (0, jsx_runtime_1.jsx)("button", { onClick: submitOrder, disabled: submitting, className: "w-full bg-[#FFE500] hover:bg-[#FFD000] text-black font-bold rounded-lg py-3 flex items-center justify-center gap-2 transition-all disabled:opacity-50", children: submitting ? (0, jsx_runtime_1.jsx)("div", { className: "w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" }) : (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Send, { size: 18 }), " Enviar pedido"] }) })] })) })] }) }))] }));
}

},
"/src/components/franchisee/FranchiseeFees.tsx": function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = FranchiseeFees;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const supabase_1 = require("@/lib/supabase");
const lucide_react_1 = require("lucide-react");
function FranchiseeFees({ franchiseId }) {
    const [fees, setFees] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [copiedPix, setCopiedPix] = (0, react_1.useState)(null);
    const [uploadingId, setUploadingId] = (0, react_1.useState)(null);
    const load = async () => {
        const { data } = await supabase_1.supabase
            .from('monthly_fees')
            .select('*')
            .eq('franchise_id', franchiseId)
            .order('due_date', { ascending: false });
        if (data)
            setFees(data);
        setLoading(false);
    };
    (0, react_1.useEffect)(() => { load(); }, [franchiseId]);
    const copyPix = (key) => {
        navigator.clipboard.writeText(key);
        setCopiedPix(key);
        setTimeout(() => setCopiedPix(null), 2000);
    };
    const handleUploadProof = async (fee, file) => {
        setUploadingId(fee.id);
        const ext = file.name.split('.').pop();
        const path = `${fee.id}.${ext}`;
        const { error } = await supabase_1.supabase.storage.from('fee-proofs').upload(path, file, { upsert: true });
        if (!error) {
            const url = supabase_1.supabase.storage.from('fee-proofs').getPublicUrl(path).data.publicUrl;
            await supabase_1.supabase.from('monthly_fees').update({
                proof_file_url: url,
                status: 'paid',
                paid_at: new Date().toISOString(),
            }).eq('id', fee.id);
            load();
        }
        setUploadingId(null);
    };
    const statusColor = (s) => {
        if (s === 'paid')
            return 'bg-green-500/10 text-green-400';
        if (s === 'overdue')
            return 'bg-red-500/10 text-red-400';
        return 'bg-yellow-500/10 text-yellow-400';
    };
    const statusLabel = (s) => s === 'paid' ? 'Paga' : s === 'overdue' ? 'Vencida' : 'Pendente';
    if (loading) {
        return (0, jsx_runtime_1.jsx)("div", { className: "flex justify-center py-12", children: (0, jsx_runtime_1.jsx)("div", { className: "w-6 h-6 border-2 border-zinc-700 border-t-[#FFE500] rounded-full animate-spin" }) });
    }
    if (fees.length === 0) {
        return ((0, jsx_runtime_1.jsxs)("div", { className: "text-center py-12", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.DollarSign, { size: 40, className: "mx-auto text-zinc-700 mb-3" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-sm", children: "Nenhuma mensalidade no momento." })] }));
    }
    return ((0, jsx_runtime_1.jsx)("div", { className: "space-y-3", children: fees.map(fee => ((0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-5", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-start justify-between mb-3", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 mb-1", children: [(0, jsx_runtime_1.jsx)("h4", { className: "text-white font-bold", children: fee.description }), (0, jsx_runtime_1.jsx)("span", { className: `text-xs px-2 py-0.5 rounded-full ${statusColor(fee.status)}`, children: statusLabel(fee.status) })] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-zinc-500 text-xs", children: ["Vencimento: ", new Date(fee.due_date).toLocaleDateString('pt-BR')] })] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-[#FFE500] font-bold text-xl", children: ["R$ ", fee.amount.toFixed(2)] })] }), fee.pix_key && fee.status !== 'paid' && ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 mb-3", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-zinc-500 text-xs", children: "Chave PIX:" }), (0, jsx_runtime_1.jsx)("span", { className: "text-white text-sm flex-1 truncate", children: fee.pix_key }), (0, jsx_runtime_1.jsx)("button", { onClick: () => copyPix(fee.pix_key), className: "text-zinc-400 hover:text-[#FFE500] transition-colors", children: copiedPix === fee.pix_key ? (0, jsx_runtime_1.jsx)(lucide_react_1.Check, { size: 16, className: "text-green-400" }) : (0, jsx_runtime_1.jsx)(lucide_react_1.Copy, { size: 16 }) })] })), fee.status === 'overdue' && ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 text-red-400 text-xs mb-3", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.AlertCircle, { size: 14 }), " Mensalidade vencida \u2014 regularize para evitar bloqueio da loja."] })), fee.proof_file_url ? ((0, jsx_runtime_1.jsx)("div", { className: "flex items-center gap-2", children: (0, jsx_runtime_1.jsxs)("a", { href: fee.proof_file_url, target: "_blank", rel: "noopener noreferrer", className: "flex items-center gap-1.5 text-green-400 text-sm hover:text-green-300 transition-colors", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Eye, { size: 16 }), " Ver comprovante enviado"] }) })) : fee.status !== 'paid' && ((0, jsx_runtime_1.jsxs)("label", { className: "inline-flex items-center gap-1.5 bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 cursor-pointer transition-all", children: [uploadingId === fee.id ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { className: "w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" }), " Enviando..."] })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Upload, { size: 16 }), " Enviar comprovante"] })), (0, jsx_runtime_1.jsx)("input", { type: "file", accept: "image/*,.pdf", className: "hidden", onChange: e => e.target.files?.[0] && handleUploadProof(fee, e.target.files[0]) })] }))] }, fee.id))) }));
}

},
"/src/components/franchisee/FranchiseeFinancial.tsx": function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = FranchiseeFinancial;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const supabase_1 = require("@/lib/supabase");
const lucide_react_1 = require("lucide-react");
function FranchiseeFinancial({ franchiseId }) {
    const [entries, setEntries] = (0, react_1.useState)([]);
    const [orders, setOrders] = (0, react_1.useState)([]);
    const [sales, setSales] = (0, react_1.useState)([]);
    const [password, setPassword] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [unlocked, setUnlocked] = (0, react_1.useState)(false);
    const [showForm, setShowForm] = (0, react_1.useState)(false);
    const [showPasswordForm, setShowPasswordForm] = (0, react_1.useState)(false);
    const [reportTab, setReportTab] = (0, react_1.useState)('overview');
    const [filterStart, setFilterStart] = (0, react_1.useState)('');
    const [filterEnd, setFilterEnd] = (0, react_1.useState)('');
    const [form, setForm] = (0, react_1.useState)({ type: 'income', description: '', amount: '', due_date: '' });
    const [pwForm, setPwForm] = (0, react_1.useState)({ password: '', confirm: '' });
    const [saving, setSaving] = (0, react_1.useState)(false);
    const load = async () => {
        const [{ data: entryData }, { data: orderData }, { data: saleData }, { data: pwData }] = await Promise.all([
            supabase_1.supabase.from('financial_entries').select('*').eq('franchise_id', franchiseId).order('created_at', { ascending: false }),
            supabase_1.supabase.from('customer_orders').select('*').eq('franchise_id', franchiseId).order('created_at', { ascending: false }),
            supabase_1.supabase.from('sales').select('*').eq('franchise_id', franchiseId).order('created_at', { ascending: false }),
            supabase_1.supabase.from('financial_passwords').select('*').eq('franchise_id', franchiseId).maybeSingle(),
        ]);
        if (entryData)
            setEntries(entryData);
        if (orderData)
            setOrders(orderData);
        if (saleData)
            setSales(saleData);
        if (pwData)
            setPassword(pwData);
        setLoading(false);
    };
    (0, react_1.useEffect)(() => { load(); }, [franchiseId]);
    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        await supabase_1.supabase.from('financial_entries').insert({
            franchise_id: franchiseId,
            type: form.type,
            description: form.description,
            amount: parseFloat(form.amount) || 0,
            due_date: form.due_date || null,
        });
        setForm({ type: 'income', description: '', amount: '', due_date: '' });
        setShowForm(false);
        setSaving(false);
        load();
    };
    const handleDelete = async (e) => {
        if (!confirm('Excluir este lançamento?'))
            return;
        await supabase_1.supabase.from('financial_entries').delete().eq('id', e.id);
        load();
    };
    const togglePaid = async (e) => {
        await supabase_1.supabase.from('financial_entries').update({ paid: !e.paid }).eq('id', e.id);
        load();
    };
    const savePassword = async (e) => {
        e.preventDefault();
        if (pwForm.password !== pwForm.confirm) {
            alert('As senhas não conferem');
            return;
        }
        setSaving(true);
        const hash = btoa(pwForm.password);
        if (password) {
            await supabase_1.supabase.from('financial_passwords').update({ password_hash: hash }).eq('id', password.id);
        }
        else {
            await supabase_1.supabase.from('financial_passwords').insert({ franchise_id: franchiseId, password_hash: hash });
        }
        setPwForm({ password: '', confirm: '' });
        setShowPasswordForm(false);
        setSaving(false);
        load();
    };
    const removePassword = async () => {
        if (!confirm('Remover a senha de acesso da área financeira?'))
            return;
        await supabase_1.supabase.from('financial_passwords').delete().eq('franchise_id', franchiseId);
        setPassword(null);
        setUnlocked(false);
    };
    const verifyPassword = (input) => {
        if (password && btoa(input) === password.password_hash) {
            setUnlocked(true);
        }
        else {
            alert('Senha incorreta');
        }
    };
    const totalReceivable = entries.filter(e => e.type === 'receivable' && !e.paid).reduce((s, e) => s + e.amount, 0);
    const totalPayable = entries.filter(e => e.type === 'payable' && !e.paid).reduce((s, e) => s + e.amount, 0);
    const totalIncome = entries.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);
    const totalExpense = entries.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0);
    const balance = totalIncome - totalExpense;
    // Filter orders and sales by date range
    const inDateRange = (dateStr) => {
        const d = new Date(dateStr);
        if (filterStart && d < new Date(filterStart))
            return false;
        if (filterEnd && d > new Date(filterEnd + 'T23:59:59'))
            return false;
        return true;
    };
    const filteredOrders = orders.filter(o => inDateRange(o.created_at));
    const filteredSales = sales.filter(s => inDateRange(s.created_at));
    // Revenue from orders (online catalog) + sales (manual/counter)
    const ordersRevenue = filteredOrders.reduce((s, o) => s + o.total, 0);
    const salesRevenue = filteredSales.filter(s => s.sale_type === 'counter').reduce((s, s2) => s + s2.total, 0);
    const totalRevenue = ordersRevenue + salesRevenue;
    const totalOrders = filteredOrders.length + filteredSales.length;
    const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    // Sales by payment method (from orders + sales)
    const byPaymentMethod = (() => {
        const map = new Map();
        const labels = { pix: 'PIX', credit_card: 'Cartão Crédito', debit_card: 'Cartão Débito', cash: 'Dinheiro', meal_voucher: 'Vale-refeição' };
        const addEntry = (method, total) => {
            const key = method ?? 'other';
            const label = method ? (labels[method] ?? method) : 'Outro';
            const entry = map.get(key) ?? { label, total: 0, count: 0 };
            entry.total += total;
            entry.count += 1;
            map.set(key, entry);
        };
        for (const o of filteredOrders)
            addEntry(o.payment_method, o.total);
        for (const s of filteredSales)
            if (s.sale_type === 'counter')
                addEntry(s.payment_method, s.total);
        return Array.from(map.entries()).map(([key, val]) => ({ key, ...val })).sort((a, b) => b.total - a.total);
    })();
    // Delivery fee breakdown
    const deliveryFees = filteredSales.filter(s => (s.delivery_fee ?? 0) > 0);
    const totalDeliveryFee = deliveryFees.reduce((sum, s) => sum + (s.delivery_fee ?? 0), 0);
    const storePaidDelivery = deliveryFees.filter(s => s.delivery_fee_payer === 'store').reduce((sum, s) => sum + (s.delivery_fee ?? 0), 0);
    const customerPaidDelivery = deliveryFees.filter(s => s.delivery_fee_payer === 'customer').reduce((sum, s) => sum + (s.delivery_fee ?? 0), 0);
    const totalDiscount = filteredSales.reduce((sum, s) => sum + (s.discount ?? 0), 0);
    // Sales by order mode
    const byOrderMode = (() => {
        const delivery = filteredOrders.filter(o => o.order_mode === 'delivery').length + filteredSales.filter(s => s.delivery_source).length;
        const pickup = filteredOrders.filter(o => o.order_mode === 'pickup').length;
        return { delivery, pickup };
    })();
    const typeInfo = (t) => {
        if (t === 'payable')
            return { label: 'Conta a pagar', color: 'text-red-400', icon: (0, jsx_runtime_1.jsx)(lucide_react_1.TrendingDown, { size: 14 }) };
        if (t === 'receivable')
            return { label: 'A receber', color: 'text-green-400', icon: (0, jsx_runtime_1.jsx)(lucide_react_1.TrendingUp, { size: 14 }) };
        if (t === 'income')
            return { label: 'Entrada', color: 'text-green-400', icon: (0, jsx_runtime_1.jsx)(lucide_react_1.DollarSign, { size: 14 }) };
        return { label: 'Saída', color: 'text-red-400', icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Wallet, { size: 14 }) };
    };
    if (password && !unlocked) {
        return ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col items-center justify-center py-16", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Lock, { size: 48, className: "text-[#FFE500] mb-4" }), (0, jsx_runtime_1.jsx)("h3", { className: "text-white font-bold text-lg mb-2", children: "\u00C1rea protegida" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-sm mb-4", children: "Digite a senha para acessar os relat\u00F3rios financeiros" }), (0, jsx_runtime_1.jsx)(PasswordInput, { onVerify: verifyPassword })] }));
    }
    return ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-4 flex-wrap gap-2", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-white font-bold text-lg", children: "Relat\u00F3rio Financeiro" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => setShowPasswordForm(!showPasswordForm), className: "bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-lg px-3 py-2 flex items-center gap-1.5 transition-colors border border-zinc-700", children: password ? (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Lock, { size: 14 }), " Alterar senha"] }) : (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Unlock, { size: 14 }), " Criar senha"] }) }), password && unlocked && ((0, jsx_runtime_1.jsx)("button", { onClick: removePassword, className: "bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-red-400 text-sm font-medium rounded-lg px-3 py-2 transition-colors border border-zinc-700", children: "Remover senha" })), (0, jsx_runtime_1.jsxs)("button", { onClick: () => setShowForm(!showForm), className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 flex items-center gap-1.5 transition-all", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { size: 16 }), " Novo Lan\u00E7amento"] })] })] }), showPasswordForm && ((0, jsx_runtime_1.jsxs)("form", { onSubmit: savePassword, className: "bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4 space-y-3", children: [(0, jsx_runtime_1.jsx)("input", { type: "password", value: pwForm.password, onChange: e => setPwForm({ ...pwForm, password: e.target.value }), required: true, placeholder: "Senha", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), (0, jsx_runtime_1.jsx)("input", { type: "password", value: pwForm.confirm, onChange: e => setPwForm({ ...pwForm, confirm: e.target.value }), required: true, placeholder: "Confirmar senha", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: saving, className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 disabled:opacity-50", children: "Salvar senha" })] })), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-1", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-xs", children: "A receber" }), (0, jsx_runtime_1.jsx)(lucide_react_1.TrendingUp, { size: 16, className: "text-green-400" })] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-green-400 font-bold text-lg", children: ["R$ ", totalReceivable.toFixed(2)] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-1", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-xs", children: "A pagar" }), (0, jsx_runtime_1.jsx)(lucide_react_1.TrendingDown, { size: 16, className: "text-red-400" })] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-red-400 font-bold text-lg", children: ["R$ ", totalPayable.toFixed(2)] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-1", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-xs", children: "Entradas" }), (0, jsx_runtime_1.jsx)(lucide_react_1.DollarSign, { size: 16, className: "text-green-400" })] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-green-400 font-bold text-lg", children: ["R$ ", totalIncome.toFixed(2)] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-1", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-xs", children: "Saldo" }), (0, jsx_runtime_1.jsx)(lucide_react_1.Wallet, { size: 16, className: "text-[#FFE500]" })] }), (0, jsx_runtime_1.jsxs)("p", { className: `font-bold text-lg ${balance >= 0 ? 'text-green-400' : 'text-red-400'}`, children: ["R$ ", balance.toFixed(2)] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 mb-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 mb-3", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Filter, { size: 16, className: "text-[#FFE500]" }), (0, jsx_runtime_1.jsx)("span", { className: "text-white text-sm font-medium", children: "Filtrar per\u00EDodo" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-3 mb-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "De" }), (0, jsx_runtime_1.jsx)("input", { type: "date", value: filterStart, onChange: e => setFilterStart(e.target.value), className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "At\u00E9" }), (0, jsx_runtime_1.jsx)("input", { type: "date", value: filterEnd, onChange: e => setFilterEnd(e.target.value), className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] })] }), (0, jsx_runtime_1.jsx)("div", { className: "flex gap-2 mb-4 flex-wrap", children: [
                            { key: 'overview', label: 'Visão geral', icon: (0, jsx_runtime_1.jsx)(lucide_react_1.BarChart3, { size: 14 }) },
                            { key: 'orders', label: 'Pedidos', icon: (0, jsx_runtime_1.jsx)(lucide_react_1.ShoppingBag, { size: 14 }) },
                            { key: 'entries', label: 'Lançamentos', icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Receipt, { size: 14 }) },
                        ].map(tab => ((0, jsx_runtime_1.jsxs)("button", { onClick: () => setReportTab(tab.key), className: `flex items-center gap-1.5 text-xs font-bold rounded-lg px-3 py-2 transition-colors ${reportTab === tab.key ? 'bg-[#FFE500] text-black' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`, children: [tab.icon, " ", tab.label] }, tab.key))) }), reportTab === 'overview' && ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-1", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-xs", children: "Faturamento" }), (0, jsx_runtime_1.jsx)(lucide_react_1.DollarSign, { size: 14, className: "text-[#FFE500]" })] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-white font-bold text-base", children: ["R$ ", totalRevenue.toFixed(2)] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-1", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-xs", children: "Total pedidos" }), (0, jsx_runtime_1.jsx)(lucide_react_1.TrendingUp, { size: 14, className: "text-[#FFE500]" })] }), (0, jsx_runtime_1.jsx)("p", { className: "text-white font-bold text-base", children: totalOrders })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-1", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-xs", children: "Ticket m\u00E9dio" }), (0, jsx_runtime_1.jsx)(lucide_react_1.Receipt, { size: 14, className: "text-[#FFE500]" })] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-white font-bold text-base", children: ["R$ ", avgTicket.toFixed(2)] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-1", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-xs", children: "Saldo" }), (0, jsx_runtime_1.jsx)(lucide_react_1.Wallet, { size: 14, className: "text-[#FFE500]" })] }), (0, jsx_runtime_1.jsxs)("p", { className: `font-bold text-base ${balance >= 0 ? 'text-green-400' : 'text-red-400'}`, children: ["R$ ", balance.toFixed(2)] })] })] }), byPaymentMethod.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h4", { className: "text-white text-xs font-bold mb-2", children: "Vendas por forma de pagamento" }), (0, jsx_runtime_1.jsx)("div", { className: "space-y-1.5", children: byPaymentMethod.map(pm => ((0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between text-sm", children: [(0, jsx_runtime_1.jsxs)("span", { className: "text-zinc-300", children: [pm.label, " ", (0, jsx_runtime_1.jsxs)("span", { className: "text-zinc-500", children: ["(", pm.count, "x)"] })] }), (0, jsx_runtime_1.jsxs)("span", { className: "text-[#FFE500] font-bold", children: ["R$ ", pm.total.toFixed(2)] })] }, pm.key))) })] })), totalDiscount > 0 && ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h4", { className: "text-white text-xs font-bold mb-2", children: "Descontos concedidos" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between text-sm", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-green-400", children: "Total em descontos" }), (0, jsx_runtime_1.jsxs)("span", { className: "text-green-400 font-bold", children: ["R$ ", totalDiscount.toFixed(2)] })] })] })), totalDeliveryFee > 0 && ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h4", { className: "text-white text-xs font-bold mb-2", children: "Taxas de entrega" }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-1.5", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between text-sm", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-zinc-300", children: "Total em taxas" }), (0, jsx_runtime_1.jsxs)("span", { className: "text-white font-bold", children: ["R$ ", totalDeliveryFee.toFixed(2)] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between text-sm", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-zinc-300", children: "Pago pelo cliente" }), (0, jsx_runtime_1.jsxs)("span", { className: "text-green-400 font-bold", children: ["R$ ", customerPaidDelivery.toFixed(2)] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between text-sm", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-zinc-300", children: "Absorvido pela loja" }), (0, jsx_runtime_1.jsxs)("span", { className: "text-red-400 font-bold", children: ["R$ ", storePaidDelivery.toFixed(2)] })] })] })] })), (byOrderMode.delivery > 0 || byOrderMode.pickup > 0) && ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h4", { className: "text-white text-xs font-bold mb-2", children: "Pedidos por tipo" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-4 text-sm", children: [(0, jsx_runtime_1.jsxs)("span", { className: "text-zinc-300", children: ["Entrega: ", (0, jsx_runtime_1.jsx)("span", { className: "text-[#FFE500] font-bold", children: byOrderMode.delivery })] }), (0, jsx_runtime_1.jsxs)("span", { className: "text-zinc-300", children: ["Retirada: ", (0, jsx_runtime_1.jsx)("span", { className: "text-[#FFE500] font-bold", children: byOrderMode.pickup })] })] })] }))] })), reportTab === 'orders' && ((0, jsx_runtime_1.jsx)("div", { className: "space-y-2 max-h-96 overflow-y-auto", children: filteredOrders.length === 0 && filteredSales.length === 0 ? ((0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-sm text-center py-6", children: "Nenhum pedido no per\u00EDodo." })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [filteredOrders.map(o => ((0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-white text-sm font-medium", children: o.customer_name }), (0, jsx_runtime_1.jsxs)("p", { className: "text-zinc-500 text-xs", children: [new Date(o.created_at).toLocaleString('pt-BR'), " \u2014 ", o.order_mode === 'pickup' ? 'Retirada' : 'Entrega'] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "text-right", children: [(0, jsx_runtime_1.jsxs)("p", { className: "text-[#FFE500] text-sm font-bold", children: ["R$ ", o.total.toFixed(2)] }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs", children: o.payment_method ?? '—' })] })] }, o.id))), filteredSales.map(s => {
                                    const PAY_LABELS = { pix: 'PIX', credit_card: 'Crédito', debit_card: 'Débito', cash: 'Dinheiro', meal_voucher: 'VR' };
                                    const TYPE_LABELS = { counter: 'Balcão', sponsorship: 'Patrocínio', tasting: 'Degustação', gift: 'Brindes' };
                                    return ((0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-start justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("p", { className: "text-white text-sm font-medium", children: [TYPE_LABELS[s.sale_type] ?? s.sale_type, s.campaign_name ? ` — ${s.campaign_name}` : ''] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-zinc-500 text-xs", children: [new Date(s.created_at).toLocaleString('pt-BR'), s.payment_method ? ` • ${PAY_LABELS[s.payment_method] ?? s.payment_method}` : '', s.delivery_source ? ` • ${s.delivery_source}` : ''] })] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-[#FFE500] text-sm font-bold", children: ["R$ ", s.total.toFixed(2)] })] }), (s.discount ?? 0) > 0 || (s.delivery_fee ?? 0) > 0 ? ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-wrap gap-1.5 mt-1.5", children: [(s.discount ?? 0) > 0 && (0, jsx_runtime_1.jsxs)("span", { className: "text-xs bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded", children: ["Desc: R$ ", (s.discount ?? 0).toFixed(2)] }), (s.delivery_fee ?? 0) > 0 && (0, jsx_runtime_1.jsxs)("span", { className: "text-xs bg-orange-500/10 text-orange-400 px-1.5 py-0.5 rounded", children: ["Taxa: R$ ", (s.delivery_fee ?? 0).toFixed(2), " (", s.delivery_fee_payer === 'store' ? 'loja' : 'cliente', ")"] }), s.payment_method === 'cash' && (s.change ?? 0) > 0 && (0, jsx_runtime_1.jsxs)("span", { className: "text-xs bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded", children: ["Troco: R$ ", (s.change ?? 0).toFixed(2)] })] })) : null] }, s.id));
                                })] })) })), reportTab === 'entries' && ((0, jsx_runtime_1.jsx)("div", { className: "space-y-2 max-h-96 overflow-y-auto", children: entries.length === 0 ? ((0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-sm text-center py-6", children: "Nenhum lan\u00E7amento." })) : (entries.map(e => {
                            const ti = typeInfo(e.type);
                            return ((0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("div", { className: `w-8 h-8 rounded-lg flex items-center justify-center ${e.type === 'income' || e.type === 'receivable' ? 'bg-green-500/10' : 'bg-red-500/10'}`, children: ti.icon }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-white text-sm font-medium", children: e.description }), (0, jsx_runtime_1.jsxs)("p", { className: `text-xs ${ti.color}`, children: [ti.label, e.due_date && ` — Venc: ${new Date(e.due_date).toLocaleDateString('pt-BR')}`] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsxs)("span", { className: `text-sm font-bold ${e.type === 'income' || e.type === 'receivable' ? 'text-green-400' : 'text-red-400'}`, children: ["R$ ", e.amount.toFixed(2)] }), (e.type === 'payable' || e.type === 'receivable') && ((0, jsx_runtime_1.jsx)("button", { onClick: () => togglePaid(e), className: `text-xs px-2 py-1 rounded-lg ${e.paid ? 'bg-green-500/20 text-green-400' : 'bg-zinc-800 text-zinc-400'}`, children: e.paid ? 'Pago' : 'Pendente' })), (0, jsx_runtime_1.jsx)("button", { onClick: () => handleDelete(e), className: "text-zinc-400 hover:text-red-400 p-1", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { size: 14 }) })] })] }, e.id));
                        })) }))] }), showForm && ((0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSave, className: "bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4 space-y-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [(0, jsx_runtime_1.jsxs)("select", { value: form.type, onChange: e => setForm({ ...form, type: e.target.value }), className: "bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]", children: [(0, jsx_runtime_1.jsx)("option", { value: "income", children: "Entrada" }), (0, jsx_runtime_1.jsx)("option", { value: "expense", children: "Sa\u00EDda" }), (0, jsx_runtime_1.jsx)("option", { value: "receivable", children: "A receber" }), (0, jsx_runtime_1.jsx)("option", { value: "payable", children: "Conta a pagar" })] }), (0, jsx_runtime_1.jsx)("input", { type: "number", step: "0.01", value: form.amount, onChange: e => setForm({ ...form, amount: e.target.value }), required: true, placeholder: "Valor", className: "bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: form.description, onChange: e => setForm({ ...form, description: e.target.value }), required: true, placeholder: "Descri\u00E7\u00E3o", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), (0, jsx_runtime_1.jsx)("input", { type: "date", value: form.due_date, onChange: e => setForm({ ...form, due_date: e.target.value }), className: "bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: saving, className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 disabled:opacity-50", children: "Salvar" })] })), loading ? ((0, jsx_runtime_1.jsx)("div", { className: "flex justify-center py-12", children: (0, jsx_runtime_1.jsx)("div", { className: "w-6 h-6 border-2 border-zinc-700 border-t-[#FFE500] rounded-full animate-spin" }) })) : entries.length === 0 ? ((0, jsx_runtime_1.jsxs)("div", { className: "text-center py-12", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.BarChart3, { size: 40, className: "mx-auto text-zinc-700 mb-3" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-sm", children: "Nenhum lan\u00E7amento financeiro." })] })) : ((0, jsx_runtime_1.jsx)("div", { className: "space-y-2", children: entries.map(e => {
                    const ti = typeInfo(e.type);
                    return ((0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)("div", { className: `w-9 h-9 rounded-lg flex items-center justify-center ${e.type === 'income' || e.type === 'receivable' ? 'bg-green-500/10' : 'bg-red-500/10'}`, children: ti.icon }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-white text-sm font-bold", children: e.description }), (0, jsx_runtime_1.jsxs)("p", { className: `text-xs ${ti.color}`, children: [ti.label, e.due_date && ` — Venc: ${new Date(e.due_date).toLocaleDateString('pt-BR')}`] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsxs)("span", { className: `text-sm font-bold ${e.type === 'income' || e.type === 'receivable' ? 'text-green-400' : 'text-red-400'}`, children: ["R$ ", e.amount.toFixed(2)] }), (e.type === 'payable' || e.type === 'receivable') && ((0, jsx_runtime_1.jsx)("button", { onClick: () => togglePaid(e), className: `text-xs px-2 py-1 rounded-lg ${e.paid ? 'bg-green-500/20 text-green-400' : 'bg-zinc-800 text-zinc-400'}`, children: e.paid ? 'Pago' : 'Pendente' })), (0, jsx_runtime_1.jsx)("button", { onClick: () => handleDelete(e), className: "text-zinc-400 hover:text-red-400 p-1", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { size: 14 }) })] })] }, e.id));
                }) }))] }));
}
function PasswordInput({ onVerify }) {
    const [pw, setPw] = (0, react_1.useState)('');
    return ((0, jsx_runtime_1.jsxs)("form", { onSubmit: (e) => { e.preventDefault(); onVerify(pw); }, className: "flex flex-col items-center gap-3", children: [(0, jsx_runtime_1.jsx)("input", { type: "password", value: pw, onChange: e => setPw(e.target.value), required: true, placeholder: "Senha", className: "bg-zinc-900 border border-zinc-700 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#FFE500] text-center" }), (0, jsx_runtime_1.jsx)("button", { type: "submit", className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-6 py-2", children: "Entrar" })] }));
}

},
"/src/components/franchisee/FranchiseeFiscal.tsx": function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = FranchiseeFiscal;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const supabase_1 = require("@/lib/supabase");
const lucide_react_1 = require("lucide-react");
const PROVIDERS = [
    { value: 'focus_nfe', label: 'Focus NFe' },
    { value: 'enotas', label: 'eNotas' },
    { value: 'brazza', label: 'Brazza' },
    { value: 'manual', label: 'Manual (sem provedor)' },
];
const CRT_OPTIONS = [
    { value: '1', label: 'Simples Nacional' },
    { value: '2', label: 'Simples Nacional - Excesso' },
    { value: '3', label: 'Regime Normal' },
];
const STATUS_INFO = {
    pending: { label: 'Pendente', color: 'text-zinc-400', icon: lucide_react_1.Clock },
    processing: { label: 'Processando', color: 'text-yellow-400', icon: lucide_react_1.Clock },
    authorized: { label: 'Autorizada', color: 'text-green-400', icon: lucide_react_1.CheckCircle2 },
    rejected: { label: 'Rejeitada', color: 'text-red-400', icon: lucide_react_1.AlertCircle },
    cancelled: { label: 'Cancelada', color: 'text-zinc-500', icon: lucide_react_1.X },
};
function FranchiseeFiscal({ franchiseId }) {
    const [settings, setSettings] = (0, react_1.useState)(null);
    const [invoices, setInvoices] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [saving, setSaving] = (0, react_1.useState)(false);
    const [showInvoiceModal, setShowInvoiceModal] = (0, react_1.useState)(null);
    const [form, setForm] = (0, react_1.useState)({
        company_name: '',
        cnpj: '',
        ie: '',
        address: '',
        city: '',
        uf: '',
        cep: '',
        phone: '',
        email: '',
        crt: '1',
        provider: 'manual',
        provider_api_key: '',
        environment: 'homologacao',
    });
    const load = async () => {
        const [{ data: sData }, { data: invData }] = await Promise.all([
            supabase_1.supabase.from('fiscal_settings').select('*').eq('franchise_id', franchiseId).maybeSingle(),
            supabase_1.supabase.from('fiscal_invoices').select('*').eq('franchise_id', franchiseId).order('created_at', { ascending: false }),
        ]);
        if (sData) {
            const s = sData;
            setSettings(s);
            setForm({
                company_name: s.company_name,
                cnpj: s.cnpj,
                ie: s.ie,
                address: s.address,
                city: s.city,
                uf: s.uf,
                cep: s.cep,
                phone: s.phone,
                email: s.email,
                crt: s.crt,
                provider: s.provider,
                provider_api_key: s.provider_api_key,
                environment: s.environment,
            });
        }
        if (invData)
            setInvoices(invData);
        setLoading(false);
    };
    (0, react_1.useEffect)(() => { load(); }, [franchiseId]);
    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        const payload = { ...form, franchise_id: franchiseId };
        if (settings) {
            await supabase_1.supabase.from('fiscal_settings').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', settings.id);
        }
        else {
            await supabase_1.supabase.from('fiscal_settings').insert(payload);
        }
        setSaving(false);
        load();
    };
    if (loading) {
        return (0, jsx_runtime_1.jsx)("div", { className: "flex justify-center py-12", children: (0, jsx_runtime_1.jsx)("div", { className: "w-6 h-6 border-2 border-zinc-700 border-t-[#FFE500] rounded-full animate-spin" }) });
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-6", children: [(0, jsx_runtime_1.jsxs)("h3", { className: "text-white font-bold text-lg flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.FileText, { size: 20, className: "text-[#FFE500]" }), " Notas Fiscais (NFe)"] }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSave, className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3", children: [(0, jsx_runtime_1.jsxs)("h4", { className: "text-white font-bold text-sm flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Building2, { size: 16, className: "text-[#FFE500]" }), " Dados do Emitente"] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "sm:col-span-2", children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Raz\u00E3o Social" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: form.company_name, onChange: e => setForm({ ...form, company_name: e.target.value }), className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "CNPJ" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: form.cnpj, onChange: e => setForm({ ...form, cnpj: e.target.value }), placeholder: "00.000.000/0000-00", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Inscri\u00E7\u00E3o Estadual" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: form.ie, onChange: e => setForm({ ...form, ie: e.target.value }), className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "sm:col-span-2", children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Endere\u00E7o" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: form.address, onChange: e => setForm({ ...form, address: e.target.value }), className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Cidade" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: form.city, onChange: e => setForm({ ...form, city: e.target.value }), className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-3", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "UF" }), (0, jsx_runtime_1.jsx)("input", { type: "text", maxLength: 2, value: form.uf, onChange: e => setForm({ ...form, uf: e.target.value.toUpperCase() }), className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "CEP" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: form.cep, onChange: e => setForm({ ...form, cep: e.target.value }), placeholder: "00000-000", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Telefone" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: form.phone, onChange: e => setForm({ ...form, phone: e.target.value }), className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "E-mail" }), (0, jsx_runtime_1.jsx)("input", { type: "email", value: form.email, onChange: e => setForm({ ...form, email: e.target.value }), className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Regime Tribut\u00E1rio (CRT)" }), (0, jsx_runtime_1.jsx)("select", { value: form.crt, onChange: e => setForm({ ...form, crt: e.target.value }), className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]", children: CRT_OPTIONS.map(o => (0, jsx_runtime_1.jsx)("option", { value: o.value, children: o.label }, o.value)) })] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3", children: [(0, jsx_runtime_1.jsxs)("h4", { className: "text-white font-bold text-sm flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.KeyRound, { size: 16, className: "text-[#FFE500]" }), " Provedor de Emiss\u00E3o"] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Provedor" }), (0, jsx_runtime_1.jsx)("select", { value: form.provider, onChange: e => setForm({ ...form, provider: e.target.value }), className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]", children: PROVIDERS.map(p => (0, jsx_runtime_1.jsx)("option", { value: p.value, children: p.label }, p.value)) })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Ambiente" }), (0, jsx_runtime_1.jsxs)("select", { value: form.environment, onChange: e => setForm({ ...form, environment: e.target.value }), className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]", children: [(0, jsx_runtime_1.jsx)("option", { value: "homologacao", children: "Homologa\u00E7\u00E3o (testes)" }), (0, jsx_runtime_1.jsx)("option", { value: "producao", children: "Produ\u00E7\u00E3o" })] })] }), form.provider !== 'manual' && ((0, jsx_runtime_1.jsxs)("div", { className: "sm:col-span-2", children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "API Key do Provedor" }), (0, jsx_runtime_1.jsx)("input", { type: "password", value: form.provider_api_key, onChange: e => setForm({ ...form, provider_api_key: e.target.value }), placeholder: "Cole aqui a chave de API do provedor", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }))] }), form.provider === 'manual' && ((0, jsx_runtime_1.jsxs)("div", { className: "bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 flex items-start gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.AlertCircle, { size: 16, className: "text-yellow-400 mt-0.5 flex-shrink-0" }), (0, jsx_runtime_1.jsx)("p", { className: "text-yellow-400 text-xs", children: "No modo manual, as notas s\u00E3o apenas registradas no sistema. Para emiss\u00E3o autom\u00E1tica via SEFAZ, selecione um provedor e informe a API key." })] }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-4", children: [(0, jsx_runtime_1.jsxs)("h4", { className: "text-white font-bold text-sm flex items-center gap-2 mb-3", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Shield, { size: 16, className: "text-[#FFE500]" }), " Certificado Digital"] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)("div", { className: `w-3 h-3 rounded-full ${settings?.certificate_status === 'active' ? 'bg-green-400' : settings?.certificate_status === 'uploaded' ? 'bg-yellow-400' : 'bg-zinc-600'}` }), (0, jsx_runtime_1.jsx)("span", { className: "text-sm text-zinc-300", children: settings?.certificate_status === 'active' ? 'Certificado ativo' :
                                            settings?.certificate_status === 'uploaded' ? 'Certificado enviado (aguardando validação)' :
                                                'Nenhum certificado configurado' })] }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs mt-2", children: "O certificado A1/CNPJ \u00E9 configurado diretamente no provedor de emiss\u00E3o selecionado." })] }), (0, jsx_runtime_1.jsxs)("button", { type: "submit", disabled: saving, className: "bg-[#FFE500] hover:bg-[#FFD000] text-black font-bold rounded-lg px-6 py-3 flex items-center gap-2 transition-all disabled:opacity-50", children: [saving ? (0, jsx_runtime_1.jsx)("div", { className: "w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" }) : (0, jsx_runtime_1.jsx)(lucide_react_1.Save, { size: 18 }), "Salvar configura\u00E7\u00F5es fiscais"] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h4", { className: "text-white font-bold text-sm mb-3", children: "Notas Fiscais Emitidas" }), invoices.length === 0 ? ((0, jsx_runtime_1.jsxs)("div", { className: "text-center py-8 bg-zinc-900 border border-zinc-800 rounded-xl", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.FileText, { size: 36, className: "mx-auto text-zinc-700 mb-2" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-sm", children: "Nenhuma nota fiscal emitida ainda." })] })) : ((0, jsx_runtime_1.jsx)("div", { className: "space-y-2", children: invoices.map(inv => {
                            const si = STATUS_INFO[inv.status];
                            const SIcon = si.icon;
                            return ((0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center", children: (0, jsx_runtime_1.jsx)(lucide_react_1.FileText, { size: 16, className: "text-[#FFE500]" }) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("p", { className: "text-white text-sm font-bold", children: ["NF-e ", inv.number || '—', " (S\u00E9rie ", inv.series, ")"] }), (0, jsx_runtime_1.jsxs)("p", { className: `text-xs ${si.color} flex items-center gap-1`, children: [(0, jsx_runtime_1.jsx)(SIcon, { size: 11 }), " ", si.label, inv.issued_at && ` — ${new Date(inv.issued_at).toLocaleDateString('pt-BR')}`] }), inv.rejection_reason && (0, jsx_runtime_1.jsx)("p", { className: "text-red-400 text-xs mt-0.5", children: inv.rejection_reason })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsxs)("span", { className: "text-sm font-bold text-white", children: ["R$ ", inv.total.toFixed(2)] }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setShowInvoiceModal(inv), className: "text-zinc-400 hover:text-[#FFE500] p-1", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Eye, { size: 16 }) })] })] }, inv.id));
                        }) }))] }), showInvoiceModal && ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm", onClick: () => setShowInvoiceModal(null), children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-6", onClick: e => e.stopPropagation(), children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-4", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-white font-bold text-lg", children: "Detalhes da NF-e" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setShowInvoiceModal(null), className: "text-zinc-400 hover:text-white", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { size: 20 }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-2 text-sm", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-zinc-400", children: "N\u00FAmero:" }), (0, jsx_runtime_1.jsx)("span", { className: "text-white font-bold", children: showInvoiceModal.number || '—' })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-zinc-400", children: "S\u00E9rie:" }), (0, jsx_runtime_1.jsx)("span", { className: "text-white", children: showInvoiceModal.series })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-zinc-400", children: "Status:" }), (0, jsx_runtime_1.jsx)("span", { className: STATUS_INFO[showInvoiceModal.status].color, children: STATUS_INFO[showInvoiceModal.status].label })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-zinc-400", children: "Total:" }), (0, jsx_runtime_1.jsxs)("span", { className: "text-white font-bold", children: ["R$ ", showInvoiceModal.total.toFixed(2)] })] }), showInvoiceModal.sefaz_protocol && (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-zinc-400", children: "Protocolo SEFAZ:" }), (0, jsx_runtime_1.jsx)("span", { className: "text-white text-xs", children: showInvoiceModal.sefaz_protocol })] }), showInvoiceModal.rejection_reason && (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { className: "text-zinc-400", children: "Motivo rejei\u00E7\u00E3o:" }), (0, jsx_runtime_1.jsx)("p", { className: "text-red-400 mt-1", children: showInvoiceModal.rejection_reason })] }), showInvoiceModal.issued_at && (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-zinc-400", children: "Emitida em:" }), (0, jsx_runtime_1.jsx)("span", { className: "text-white", children: new Date(showInvoiceModal.issued_at).toLocaleString('pt-BR') })] })] })] }) }))] }));
}

},
"/src/components/franchisee/FranchiseeGroups.tsx": function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = FranchiseeGroups;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const supabase_1 = require("@/lib/supabase");
const lucide_react_1 = require("lucide-react");
function FranchiseeGroups({ franchiseId }) {
    const [groups, setGroups] = (0, react_1.useState)([]);
    const [addons, setAddons] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [selectedGroup, setSelectedGroup] = (0, react_1.useState)(null);
    const [showGroupForm, setShowGroupForm] = (0, react_1.useState)(false);
    const [showAddonForm, setShowAddonForm] = (0, react_1.useState)(false);
    const [editingAddon, setEditingAddon] = (0, react_1.useState)(null);
    const [groupName, setGroupName] = (0, react_1.useState)('');
    const [addonForm, setAddonForm] = (0, react_1.useState)({ name: '', price: '', is_free: false });
    const [saving, setSaving] = (0, react_1.useState)(false);
    const load = async () => {
        const [{ data: grpData }, { data: adnData }] = await Promise.all([
            supabase_1.supabase.from('franchise_groups').select('*').eq('franchise_id', franchiseId).order('name'),
            supabase_1.supabase.from('franchise_addons').select('*').order('name'),
        ]);
        if (grpData)
            setGroups(grpData);
        if (adnData)
            setAddons(adnData);
        setLoading(false);
    };
    (0, react_1.useEffect)(() => { load(); }, [franchiseId]);
    const saveGroup = async (e) => {
        e.preventDefault();
        setSaving(true);
        await supabase_1.supabase.from('franchise_groups').insert({ franchise_id: franchiseId, name: groupName });
        setGroupName('');
        setShowGroupForm(false);
        setSaving(false);
        load();
    };
    const deleteGroup = async (g) => {
        if (!confirm(`Excluir grupo "${g.name}" e seus adicionais?`))
            return;
        await supabase_1.supabase.from('franchise_groups').delete().eq('id', g.id);
        if (selectedGroup === g.id)
            setSelectedGroup(null);
        load();
    };
    const saveAddon = async (e) => {
        e.preventDefault();
        setSaving(true);
        const payload = { group_id: selectedGroup, name: addonForm.name, price: parseFloat(addonForm.price) || 0, is_free: addonForm.is_free };
        if (editingAddon) {
            await supabase_1.supabase.from('franchise_addons').update(payload).eq('id', editingAddon.id);
        }
        else {
            await supabase_1.supabase.from('franchise_addons').insert(payload);
        }
        setAddonForm({ name: '', price: '', is_free: false });
        setEditingAddon(null);
        setShowAddonForm(false);
        setSaving(false);
        load();
    };
    const deleteAddon = async (a) => {
        if (!confirm(`Excluir adicional "${a.name}"?`))
            return;
        await supabase_1.supabase.from('franchise_addons').delete().eq('id', a.id);
        load();
    };
    const addonsInGroup = (gid) => addons.filter(a => a.group_id === gid);
    if (loading) {
        return (0, jsx_runtime_1.jsx)("div", { className: "flex justify-center py-12", children: (0, jsx_runtime_1.jsx)("div", { className: "w-6 h-6 border-2 border-zinc-700 border-t-[#FFE500] rounded-full animate-spin" }) });
    }
    if (selectedGroup) {
        const grp = groups.find(g => g.id === selectedGroup);
        return ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => setSelectedGroup(null), className: "text-zinc-400 hover:text-white text-sm mb-4 transition-colors", children: "\u2190 Voltar" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-4", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-white font-bold text-lg", children: grp?.name }), (0, jsx_runtime_1.jsxs)("button", { onClick: () => { if (editingAddon) {
                                setEditingAddon(null);
                                setAddonForm({ name: '', price: '', is_free: false });
                            } setShowAddonForm(!showAddonForm); }, className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 flex items-center gap-1.5 transition-all", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { size: 16 }), " Novo Adicional"] })] }), showAddonForm && ((0, jsx_runtime_1.jsxs)("form", { onSubmit: saveAddon, className: "bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4 space-y-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [(0, jsx_runtime_1.jsx)("input", { type: "text", value: addonForm.name, onChange: e => setAddonForm({ ...addonForm, name: e.target.value }), required: true, placeholder: "Nome do adicional", className: "bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), (0, jsx_runtime_1.jsx)("input", { type: "number", step: "0.01", value: addonForm.price, onChange: e => setAddonForm({ ...addonForm, price: e.target.value }), disabled: addonForm.is_free, placeholder: "Pre\u00E7o", className: "bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500] disabled:opacity-50" })] }), (0, jsx_runtime_1.jsxs)("label", { className: "flex items-center gap-2 cursor-pointer", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: addonForm.is_free, onChange: e => setAddonForm({ ...addonForm, is_free: e.target.checked }), className: "w-4 h-4 accent-[#FFE500]" }), (0, jsx_runtime_1.jsx)("span", { className: "text-zinc-300 text-sm", children: "Adicional gr\u00E1tis" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2", children: [(0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: saving, className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 disabled:opacity-50", children: saving ? '...' : editingAddon ? 'Salvar' : 'Criar' }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => { setShowAddonForm(false); setEditingAddon(null); }, className: "bg-zinc-700 text-white rounded-lg px-3 py-2", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { size: 16 }) })] })] })), addonsInGroup(selectedGroup).length === 0 ? ((0, jsx_runtime_1.jsxs)("div", { className: "text-center py-12", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { size: 40, className: "mx-auto text-zinc-700 mb-3" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-sm", children: "Nenhum adicional neste grupo." })] })) : ((0, jsx_runtime_1.jsx)("div", { className: "space-y-2", children: addonsInGroup(selectedGroup).map(a => ((0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)("div", { className: `w-9 h-9 rounded-lg flex items-center justify-center ${a.is_free ? 'bg-green-500/10' : 'bg-[#FFE500]/10'}`, children: a.is_free ? (0, jsx_runtime_1.jsx)(lucide_react_1.Gift, { size: 16, className: "text-green-400" }) : (0, jsx_runtime_1.jsx)(lucide_react_1.DollarSign, { size: 16, className: "text-[#FFE500]" }) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-white text-sm font-bold", children: a.name }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs", children: a.is_free ? 'Grátis' : `R$ ${a.price.toFixed(2)}` })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-1", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => { setEditingAddon(a); setAddonForm({ name: a.name, price: String(a.price), is_free: a.is_free }); setShowAddonForm(true); }, className: "text-zinc-500 hover:text-[#FFE500] p-1", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Edit, { size: 14 }) }), (0, jsx_runtime_1.jsx)("button", { onClick: () => deleteAddon(a), className: "text-zinc-500 hover:text-red-400 p-1", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { size: 14 }) })] })] }, a.id))) }))] }));
    }
    return ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-4", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-white font-bold text-lg", children: "Grupos e Adicionais" }), (0, jsx_runtime_1.jsxs)("button", { onClick: () => setShowGroupForm(!showGroupForm), className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 flex items-center gap-1.5 transition-all", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { size: 16 }), " Novo Grupo"] })] }), showGroupForm && ((0, jsx_runtime_1.jsxs)("form", { onSubmit: saveGroup, className: "bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4 flex gap-2", children: [(0, jsx_runtime_1.jsx)("input", { type: "text", value: groupName, onChange: e => setGroupName(e.target.value), required: true, placeholder: "Nome do grupo", className: "flex-1 bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: saving, className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 disabled:opacity-50", children: "Criar" })] })), groups.length === 0 ? ((0, jsx_runtime_1.jsxs)("div", { className: "text-center py-12", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Layers, { size: 40, className: "mx-auto text-zinc-700 mb-3" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-sm", children: "Nenhum grupo criado." })] })) : ((0, jsx_runtime_1.jsx)("div", { className: "space-y-2", children: groups.map(g => ((0, jsx_runtime_1.jsx)("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-4 cursor-pointer hover:border-[#FFE500]/30 transition-all group", onClick: () => setSelectedGroup(g.id), children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-10 h-10 rounded-lg bg-[#FFE500]/10 flex items-center justify-center", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Layers, { size: 18, className: "text-[#FFE500]" }) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-white font-bold text-sm", children: g.name }), (0, jsx_runtime_1.jsxs)("p", { className: "text-zinc-500 text-xs", children: [addonsInGroup(g.id).length, " adicional(is)"] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-1", onClick: e => e.stopPropagation(), children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ChevronRight, { size: 18, className: "text-zinc-600 group-hover:text-[#FFE500] transition-colors" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => deleteGroup(g), className: "text-zinc-500 hover:text-red-400 p-1", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { size: 14 }) })] })] }) }, g.id))) }))] }));
}

},
"/src/components/franchisee/FranchiseeIntegrations.tsx": function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = FranchiseeIntegrations;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const supabase_1 = require("@/lib/supabase");
const lucide_react_1 = require("lucide-react");
const PLATFORMS = [
    { value: 'ifood', label: 'iFood', color: 'bg-red-500', textColor: 'text-red-400' },
    { value: '99delivery', label: '99Delivery', color: 'bg-yellow-500', textColor: 'text-yellow-400' },
    { value: 'uber_eats', label: 'Uber Eats', color: 'bg-green-600', textColor: 'text-green-400' },
    { value: 'rappi', label: 'Rappi', color: 'bg-orange-500', textColor: 'text-orange-400' },
];
const SYNC_STATUS_INFO = {
    disconnected: { label: 'Desconectado', color: 'text-zinc-400', dot: 'bg-zinc-600' },
    connected: { label: 'Conectado', color: 'text-green-400', dot: 'bg-green-400' },
    error: { label: 'Erro', color: 'text-red-400', dot: 'bg-red-400' },
    syncing: { label: 'Sincronizando', color: 'text-yellow-400', dot: 'bg-yellow-400' },
};
function FranchiseeIntegrations({ franchiseId }) {
    const [integrations, setIntegrations] = (0, react_1.useState)([]);
    const [logs, setLogs] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [saving, setSaving] = (0, react_1.useState)(null);
    const [expandedLog, setExpandedLog] = (0, react_1.useState)(null);
    const [syncing, setSyncing] = (0, react_1.useState)(false);
    const [syncResult, setSyncResult] = (0, react_1.useState)(null);
    const load = async () => {
        const [{ data: intData }, { data: logData }] = await Promise.all([
            supabase_1.supabase.from('delivery_integrations').select('*').eq('franchise_id', franchiseId).order('platform', { ascending: true }),
            supabase_1.supabase.from('delivery_sync_logs').select('*, delivery_integrations!inner(platform)').order('created_at', { ascending: false }).limit(50),
        ]);
        if (intData)
            setIntegrations(intData);
        if (logData)
            setLogs(logData);
        setLoading(false);
    };
    (0, react_1.useEffect)(() => { load(); }, [franchiseId]);
    const handleAdd = async (platform) => {
        await supabase_1.supabase.from('delivery_integrations').insert({
            franchise_id: franchiseId,
            platform,
            enabled: false,
            sync_status: 'disconnected',
        });
        load();
    };
    const handleSave = async (integ) => {
        setSaving(integ.id);
        await supabase_1.supabase.from('delivery_integrations').update({
            client_id: integ.client_id,
            client_secret: integ.client_secret,
            store_id: integ.store_id,
            auto_accept_orders: integ.auto_accept_orders,
            sync_menu: integ.sync_menu,
            updated_at: new Date().toISOString(),
        }).eq('id', integ.id);
        setSaving(null);
        load();
    };
    const handleToggle = async (integ) => {
        const newEnabled = !integ.enabled;
        const newStatus = newEnabled ? 'connected' : 'disconnected';
        await supabase_1.supabase.from('delivery_integrations').update({
            enabled: newEnabled,
            sync_status: newStatus,
            updated_at: new Date().toISOString(),
        }).eq('id', integ.id);
        load();
    };
    const handleDelete = async (integ) => {
        if (!confirm(`Remover a integração com ${PLATFORMS.find(p => p.value === integ.platform)?.label}?`))
            return;
        await supabase_1.supabase.from('delivery_integrations').delete().eq('id', integ.id);
        load();
    };
    const callEdgeFunction = async (action, integrationId) => {
        const apiUrl = `${"https://sgvojdgbjvynnoherpqj.supabase.co"}/functions/v1/delivery-sync`;
        const { data: session } = await supabase_1.supabase.auth.getSession();
        const resp = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.session?.access_token ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNndm9qZGdianZ5bm5vaGVycHFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3NDE4ODIsImV4cCI6MjEwMTMxNzg4Mn0.RuAHGD0VCcDxIL4jfSFXjyiC4ZzVgRAZna3j80ovIf4"}`,
                'apikey': "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNndm9qZGdianZ5bm5vaGVycHFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3NDE4ODIsImV4cCI6MjEwMTMxNzg4Mn0.RuAHGD0VCcDxIL4jfSFXjyiC4ZzVgRAZna3j80ovIf4",
            },
            body: JSON.stringify({ action, integration_id: integrationId }),
        });
        const json = await resp.json();
        if (!resp.ok)
            throw new Error(json.error || `Erro ${resp.status}`);
        return json;
    };
    const handleSync = async (integ) => {
        setSyncing(true);
        setSyncResult(null);
        try {
            const result = await callEdgeFunction('sync', integ.id);
            setSyncResult({ ok: true, message: result.message || `${result.imported} pedido(s) importado(s).` });
        }
        catch (err) {
            setSyncResult({ ok: false, message: err.message || 'Erro ao sincronizar.' });
        }
        finally {
            setSyncing(false);
            load();
        }
    };
    const handleSyncMenu = async (integ) => {
        setSyncing(true);
        setSyncResult(null);
        try {
            const result = await callEdgeFunction('sync_menu', integ.id);
            setSyncResult({ ok: true, message: result.message || 'Cardápio sincronizado.' });
        }
        catch (err) {
            setSyncResult({ ok: false, message: err.message || 'Erro ao sincronizar cardápio.' });
        }
        finally {
            setSyncing(false);
            load();
        }
    };
    const handleTest = async (integ) => {
        setSyncing(true);
        setSyncResult(null);
        try {
            const result = await callEdgeFunction('test', integ.id);
            setSyncResult({ ok: true, message: result.message || 'Conexão validada.' });
        }
        catch (err) {
            setSyncResult({ ok: false, message: err.message || 'Erro ao testar.' });
        }
        finally {
            setSyncing(false);
            load();
        }
    };
    if (loading) {
        return (0, jsx_runtime_1.jsx)("div", { className: "flex justify-center py-12", children: (0, jsx_runtime_1.jsx)("div", { className: "w-6 h-6 border-2 border-zinc-700 border-t-[#FFE500] rounded-full animate-spin" }) });
    }
    const availablePlatforms = PLATFORMS.filter(p => !integrations.some(i => i.platform === p.value));
    return ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-6", children: [(0, jsx_runtime_1.jsxs)("h3", { className: "text-white font-bold text-lg flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plug, { size: 20, className: "text-[#FFE500]" }), " Integra\u00E7\u00F5es de Entrega"] }), availablePlatforms.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-4", children: [(0, jsx_runtime_1.jsx)("h4", { className: "text-white font-bold text-sm mb-3", children: "Adicionar Plataforma" }), (0, jsx_runtime_1.jsx)("div", { className: "flex flex-wrap gap-2", children: availablePlatforms.map(p => ((0, jsx_runtime_1.jsxs)("button", { onClick: () => handleAdd(p.value), className: "bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-lg px-4 py-2 flex items-center gap-2 transition-colors border border-zinc-700", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { size: 14 }), " ", p.label] }, p.value))) })] })), integrations.length === 0 ? ((0, jsx_runtime_1.jsxs)("div", { className: "text-center py-12 bg-zinc-900 border border-zinc-800 rounded-xl", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Bike, { size: 40, className: "mx-auto text-zinc-700 mb-3" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-sm", children: "Nenhuma integra\u00E7\u00E3o configurada. Adicione uma plataforma acima." })] })) : ((0, jsx_runtime_1.jsx)("div", { className: "space-y-4", children: integrations.map(integ => {
                    const platform = PLATFORMS.find(p => p.value === integ.platform);
                    const si = SYNC_STATUS_INFO[integ.sync_status];
                    return ((0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)("div", { className: `w-10 h-10 rounded-lg ${platform.color} flex items-center justify-center`, children: (0, jsx_runtime_1.jsx)(lucide_react_1.Store, { size: 18, className: "text-white" }) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-white font-bold text-sm", children: platform.label }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-1.5 mt-0.5", children: [(0, jsx_runtime_1.jsx)("div", { className: `w-2 h-2 rounded-full ${si.dot} ${integ.sync_status === 'syncing' ? 'animate-pulse' : ''}` }), (0, jsx_runtime_1.jsx)("span", { className: `text-xs ${si.color}`, children: si.label }), integ.last_sync_at && (0, jsx_runtime_1.jsxs)("span", { className: "text-zinc-500 text-xs", children: ["\u2014 \u00FAltima sync: ", new Date(integ.last_sync_at).toLocaleString('pt-BR')] })] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => handleTest(integ), disabled: syncing, className: "text-zinc-400 hover:text-green-400 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-30", title: "Testar conex\u00E3o", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Plug, { size: 16 }) }), (0, jsx_runtime_1.jsx)("button", { onClick: () => handleSyncMenu(integ), disabled: syncing, className: "text-zinc-400 hover:text-blue-400 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-30", title: "Sincronizar card\u00E1pio (categorias, produtos, grupos e adicionais)", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Upload, { size: 16 }) }), (0, jsx_runtime_1.jsx)("button", { onClick: () => handleSync(integ), disabled: syncing, className: "text-zinc-400 hover:text-[#FFE500] p-1.5 rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-30", title: "Sincronizar pedidos agora", children: (0, jsx_runtime_1.jsx)(lucide_react_1.RefreshCw, { size: 16, className: syncing ? 'animate-spin' : '' }) }), (0, jsx_runtime_1.jsx)("button", { onClick: () => handleToggle(integ), className: `text-sm font-bold rounded-lg px-3 py-1.5 flex items-center gap-1.5 transition-all ${integ.enabled ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`, children: integ.enabled ? (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Link2, { size: 14 }), " Ativado"] }) : (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Unlink, { size: 14 }), " Ativar"] }) }), (0, jsx_runtime_1.jsx)("button", { onClick: () => handleDelete(integ), className: "text-zinc-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { size: 16 }) })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Client ID" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: integ.client_id, onChange: e => setIntegrations(integrations.map(i => i.id === integ.id ? { ...i, client_id: e.target.value } : i)), className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Client Secret" }), (0, jsx_runtime_1.jsx)("input", { type: "password", value: integ.client_secret, onChange: e => setIntegrations(integrations.map(i => i.id === integ.id ? { ...i, client_secret: e.target.value } : i)), className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Store / Merchant ID" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: integ.store_id, onChange: e => setIntegrations(integrations.map(i => i.id === integ.id ? { ...i, store_id: e.target.value } : i)), className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] })] }), integ.platform === 'ifood' && integ.enabled && ((0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-800/40 border border-zinc-700/50 rounded-lg p-3", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-zinc-300 text-xs font-medium mb-1", children: "URL do Webhook (configure no portal do iFood):" }), (0, jsx_runtime_1.jsxs)("code", { className: "text-[#FFE500] text-xs break-all", children: ["https://sgvojdgbjvynnoherpqj.supabase.co", "/functions/v1/delivery-sync?action=webhook"] }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs mt-1", children: "Aponte os webhooks de pedido do iFood para esta URL para receber pedidos em tempo real." })] })), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-wrap gap-4", children: [(0, jsx_runtime_1.jsxs)("label", { className: "flex items-center gap-2 cursor-pointer", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: integ.auto_accept_orders, onChange: e => setIntegrations(integrations.map(i => i.id === integ.id ? { ...i, auto_accept_orders: e.target.checked } : i)), className: "w-4 h-4 accent-[#FFE500]" }), (0, jsx_runtime_1.jsx)("span", { className: "text-zinc-300 text-sm", children: "Aceitar pedidos automaticamente" })] }), (0, jsx_runtime_1.jsxs)("label", { className: "flex items-center gap-2 cursor-pointer", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: integ.sync_menu, onChange: e => setIntegrations(integrations.map(i => i.id === integ.id ? { ...i, sync_menu: e.target.checked } : i)), className: "w-4 h-4 accent-[#FFE500]" }), (0, jsx_runtime_1.jsx)("span", { className: "text-zinc-300 text-sm", children: "Sincronizar card\u00E1pio" })] })] }), integ.error_message && ((0, jsx_runtime_1.jsxs)("div", { className: "bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.AlertCircle, { size: 16, className: "text-red-400 mt-0.5 flex-shrink-0" }), (0, jsx_runtime_1.jsx)("p", { className: "text-red-400 text-xs", children: integ.error_message })] })), syncResult && ((0, jsx_runtime_1.jsxs)("div", { className: `rounded-lg p-3 flex items-start gap-2 ${syncResult.ok ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`, children: [syncResult.ok ? (0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle2, { size: 16, className: "text-green-400 mt-0.5 flex-shrink-0" }) : (0, jsx_runtime_1.jsx)(lucide_react_1.AlertCircle, { size: 16, className: "text-red-400 mt-0.5 flex-shrink-0" }), (0, jsx_runtime_1.jsx)("p", { className: `text-xs ${syncResult.ok ? 'text-green-400' : 'text-red-400'}`, children: syncResult.message })] })), (0, jsx_runtime_1.jsxs)("button", { onClick: () => handleSave(integ), disabled: saving === integ.id, className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 flex items-center gap-2 transition-all disabled:opacity-50", children: [saving === integ.id ? (0, jsx_runtime_1.jsx)("div", { className: "w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" }) : (0, jsx_runtime_1.jsx)(lucide_react_1.Save, { size: 14 }), "Salvar"] })] }, integ.id));
                }) })), logs.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("h4", { className: "text-white font-bold text-sm mb-3 flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Settings2, { size: 16, className: "text-[#FFE500]" }), " Hist\u00F3rico de Sincroniza\u00E7\u00E3o"] }), (0, jsx_runtime_1.jsx)("div", { className: "space-y-1.5", children: logs.map(log => ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 flex items-center justify-between cursor-pointer hover:border-zinc-700", onClick: () => setExpandedLog(expandedLog === log.id ? null : log.id), children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [log.status === 'success' ? (0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle2, { size: 14, className: "text-green-400" }) : (0, jsx_runtime_1.jsx)(lucide_react_1.AlertCircle, { size: 14, className: "text-red-400" }), (0, jsx_runtime_1.jsx)("span", { className: "text-white text-xs font-medium", children: log.action.replace(/_/g, ' ') }), log.platform_order_id && (0, jsx_runtime_1.jsxs)("span", { className: "text-zinc-500 text-xs", children: ["#", log.platform_order_id] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-zinc-500 text-xs", children: new Date(log.created_at).toLocaleString('pt-BR') }), expandedLog === log.id ? (0, jsx_runtime_1.jsx)(lucide_react_1.ChevronUp, { size: 14, className: "text-zinc-500" }) : (0, jsx_runtime_1.jsx)(lucide_react_1.ChevronDown, { size: 14, className: "text-zinc-500" })] })] }), expandedLog === log.id && ((0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 mt-1", children: [log.message && (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-300 text-xs mb-2", children: log.message }), (0, jsx_runtime_1.jsx)("pre", { className: "text-zinc-500 text-xs overflow-x-auto", children: JSON.stringify(log.payload, null, 2) })] }))] }, log.id))) })] }))] }));
}

},
"/src/components/franchisee/FranchiseeManualOrder.tsx": function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = FranchiseeManualOrder;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const supabase_1 = require("@/lib/supabase");
const mtClient_1 = require("@/lib/mtClient");
const AuthContext_1 = require("@/contexts/AuthContext");
const lucide_react_1 = require("lucide-react");
const SALE_TYPES = [
    { value: 'counter', label: 'Balcão', description: 'Venda normal e faturamento' },
    { value: 'sponsorship', label: 'Patrocínio', description: 'Lançar como despesa' },
    { value: 'tasting', label: 'Degustação', description: 'Lançar como despesa' },
    { value: 'gift', label: 'Brindes', description: 'Lançar como despesa' },
];
const PAYMENT_METHODS = [
    { value: 'pix', label: 'PIX', needsChange: false },
    { value: 'credit_card', label: 'Cartão de Crédito', needsChange: false },
    { value: 'debit_card', label: 'Cartão de Débito', needsChange: false },
    { value: 'cash', label: 'Dinheiro', needsChange: true },
    { value: 'meal_voucher', label: 'Vale-refeição', needsChange: false },
];
const DELIVERY_SOURCES = [
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'events', label: 'Eventos' },
    { value: 'referral', label: 'Indicação' },
    { value: 'nutritionist', label: 'Nutricionista' },
    { value: 'ifood', label: 'iFood' },
    { value: 'uber_eats', label: 'Uber Eats' },
    { value: 'rappi', label: 'Rappi' },
    { value: '99delivery', label: '99 Delivery' },
    { value: 'phone', label: 'Telefone' },
    { value: 'other', label: 'Outro' },
];
const QUICK_CASH = [50, 100, 150, 200];
function FranchiseeManualOrder({ franchiseId }) {
    const [products, setProducts] = (0, react_1.useState)([]);
    const [categories, setCategories] = (0, react_1.useState)([]);
    const [search, setSearch] = (0, react_1.useState)('');
    const [cart, setCart] = (0, react_1.useState)([]);
    const [expandedCategory, setExpandedCategory] = (0, react_1.useState)(null);
    const [saleType, setSaleType] = (0, react_1.useState)('counter');
    const [campaign, setCampaign] = (0, react_1.useState)('');
    const [customer, setCustomer] = (0, react_1.useState)('');
    const [selectedCustomerId, setSelectedCustomerId] = (0, react_1.useState)(null);
    const [customerSearchResults, setCustomerSearchResults] = (0, react_1.useState)([]);
    const [showCustomerResults, setShowCustomerResults] = (0, react_1.useState)(false);
    const [isDelivery, setIsDelivery] = (0, react_1.useState)(false);
    const [deliverySource, setDeliverySource] = (0, react_1.useState)('whatsapp');
    const [deliverySourceDetail, setDeliverySourceDetail] = (0, react_1.useState)('');
    const [deliveryFee, setDeliveryFee] = (0, react_1.useState)('');
    const [deliveryFeePayer, setDeliveryFeePayer] = (0, react_1.useState)('customer');
    const [deliverySettings, setDeliverySettings] = (0, react_1.useState)(null);
    const [deliveryDetails, setDeliveryDetails] = (0, react_1.useState)({ phone: '', address: '', number: '', neighborhood: '', city: '', state: '', reference: '' });
    const [manualMtQuote, setManualMtQuote] = (0, react_1.useState)(null);
    const [manualMtLoading, setManualMtLoading] = (0, react_1.useState)(false);
    const [manualMtError, setManualMtError] = (0, react_1.useState)('');
    const [discountType, setDiscountType] = (0, react_1.useState)('percent');
    const [discountValue, setDiscountValue] = (0, react_1.useState)('');
    const [paymentMethod, setPaymentMethod] = (0, react_1.useState)('pix');
    const [installments, setInstallments] = (0, react_1.useState)(1);
    const [amountPaid, setAmountPaid] = (0, react_1.useState)('');
    const [saving, setSaving] = (0, react_1.useState)(false);
    const [showQuickCustomer, setShowQuickCustomer] = (0, react_1.useState)(false);
    const [quickCustomer, setQuickCustomer] = (0, react_1.useState)({ name: '', phone: '' });
    const [editingPrice, setEditingPrice] = (0, react_1.useState)(null);
    const [priceInput, setPriceInput] = (0, react_1.useState)('');
    const { user } = (0, AuthContext_1.useAuth)();
    const [franchiseUserId, setFranchiseUserId] = (0, react_1.useState)(null);
    const [franchiseUserName, setFranchiseUserName] = (0, react_1.useState)(null);
    const [message, setMessage] = (0, react_1.useState)('');
    const [showCheckout, setShowCheckout] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        supabase_1.supabase.from('franchise_products').select('*').eq('franchise_id', franchiseId).eq('active', true).order('name').then(({ data }) => setProducts((data ?? [])));
        supabase_1.supabase.from('franchise_categories').select('*').eq('franchise_id', franchiseId).order('sort_order', { ascending: true }).order('created_at', { ascending: true }).order('id', { ascending: true }).then(({ data }) => setCategories((data ?? [])));
        supabase_1.supabase.from('delivery_settings').select('*').eq('franchise_id', franchiseId).maybeSingle().then(({ data }) => setDeliverySettings(data ?? null));
    }, [franchiseId]);
    (0, react_1.useEffect)(() => {
        if (user) {
            supabase_1.supabase.from('franchise_users').select('id, name').eq('auth_user_id', user.id).maybeSingle().then(({ data }) => {
                if (data) {
                    setFranchiseUserId(data.id);
                    setFranchiseUserName(data.name);
                }
            });
        }
    }, [user]);
    const searchCustomers = async (q) => {
        const term = q.trim();
        if (!term) {
            setCustomerSearchResults([]);
            return;
        }
        const { data } = await supabase_1.supabase
            .from('customers')
            .select('*')
            .eq('franchise_id', franchiseId)
            .or(`name.ilike.%${term}%,phone.ilike.%${term}%,cpf_cnpj.ilike.%${term}%`)
            .order('name')
            .limit(12);
        setCustomerSearchResults(data || []);
    };
    const filteredProducts = (0, react_1.useMemo)(() => {
        let list = products;
        if (search.trim())
            list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
        return list;
    }, [products, search]);
    const productsByCategory = (0, react_1.useMemo)(() => {
        const map = new Map();
        for (const p of filteredProducts) {
            const key = p.category_id ?? 'others';
            const arr = map.get(key) ?? [];
            arr.push(p);
            map.set(key, arr);
        }
        return map;
    }, [filteredProducts]);
    const categoryList = [...categories, { id: 'others', name: 'Outros', franchise_id: franchiseId, sort_order: 999, created_at: '' }];
    const subtotal = (0, react_1.useMemo)(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
    const discountAmount = (0, react_1.useMemo)(() => {
        const val = parseFloat(discountValue) || 0;
        if (val <= 0)
            return 0;
        if (discountType === 'percent')
            return Math.min(subtotal * (val / 100), subtotal);
        return Math.min(val, subtotal);
    }, [discountValue, discountType, subtotal]);
    const deliveryFeeAmount = (0, react_1.useMemo)(() => {
        if (!isDelivery || saleType !== 'counter')
            return 0;
        return parseFloat(deliveryFee) || 0;
    }, [isDelivery, saleType, deliveryFee]);
    const total = (0, react_1.useMemo)(() => {
        const base = Math.max(0, subtotal - discountAmount);
        if (!isDelivery || saleType !== 'counter')
            return base;
        return deliveryFeePayer === 'customer' ? base + deliveryFeeAmount : base;
    }, [subtotal, discountAmount, isDelivery, saleType, deliveryFeePayer, deliveryFeeAmount]);
    const deliveryFullAddress = [deliveryDetails.address.trim(), deliveryDetails.number.trim()].filter(Boolean).join(', ');
    const deliveryAddressReady = Boolean(deliveryFullAddress && deliveryDetails.neighborhood.trim() && deliveryDetails.city.trim() && deliveryDetails.state.trim());
    const mtManualRequired = Boolean(isDelivery && saleType === 'counter' && deliverySettings?.enabled && deliverySettings?.mt_entregas_enabled);
    (0, react_1.useEffect)(() => {
        if (!mtManualRequired || !deliverySettings || !deliveryAddressReady) {
            setManualMtQuote(null);
            setManualMtError('');
            return;
        }
        const timer = window.setTimeout(async () => {
            setManualMtLoading(true);
            setManualMtError('');
            setManualMtQuote(null);
            try {
                const quote = await (0, mtClient_1.quoteExistingMt)(deliverySettings, {
                    address: deliveryFullAddress,
                    neighborhood: deliveryDetails.neighborhood.trim(),
                    city: deliveryDetails.city.trim(),
                    state: deliveryDetails.state.trim().toUpperCase(),
                });
                setManualMtQuote(quote);
                setDeliveryFee(String((0, mtClient_1.customerDeliveryPortion)(quote.fee, deliverySettings.fee_store_percent ?? 0)));
                setDeliveryFeePayer('customer');
            }
            catch (error) {
                setManualMtError(error?.message || 'Não foi possível calcular a taxa na MT Entregas.');
            }
            finally {
                setManualMtLoading(false);
            }
        }, 700);
        return () => window.clearTimeout(timer);
    }, [mtManualRequired, deliverySettings, deliveryAddressReady, deliveryFullAddress, deliveryDetails.neighborhood, deliveryDetails.city, deliveryDetails.state]);
    const change = (0, react_1.useMemo)(() => {
        if (paymentMethod !== 'cash')
            return 0;
        const paid = parseFloat(amountPaid) || 0;
        if (paid <= 0)
            return 0;
        return Math.max(0, paid - total);
    }, [amountPaid, paymentMethod, total]);
    const add = (product) => setCart(current => {
        const existing = current.find(item => item.id === product.id);
        const line = { ...product, price: product.discount_price ?? product.price, quantity: 1 };
        return existing ? current.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) : [...current, line];
    });
    const editPrice = (id) => {
        const item = cart.find(c => c.id === id);
        if (item) {
            setEditingPrice(id);
            setPriceInput(String(item.price));
        }
    };
    const savePrice = (id) => {
        const newPrice = parseFloat(priceInput) || 0;
        setCart(current => current.map(item => item.id === id ? { ...item, price: Math.max(0, newPrice) } : item));
        setEditingPrice(null);
        setPriceInput('');
    };
    const saveQuickCustomer = async () => {
        if (!quickCustomer.name.trim())
            return;
        const { data } = await supabase_1.supabase.from('customers').insert({
            franchise_id: franchiseId, name: quickCustomer.name.trim(), phone: quickCustomer.phone.trim() || null,
        }).select().single();
        if (data) {
            setCustomer(data.name);
            setSelectedCustomerId(data.id);
        }
        setQuickCustomer({ name: '', phone: '' });
        setShowQuickCustomer(false);
    };
    const changeQty = (id, amount) => setCart(current => current.map(item => item.id === id ? { ...item, quantity: item.quantity + amount } : item).filter(item => item.quantity > 0));
    const removeItem = (id) => setCart(current => current.filter(item => item.id !== id));
    const clearCart = () => { setCart([]); setDiscountValue(''); setAmountPaid(''); setDeliveryFee(''); setShowCheckout(false); };
    const resetForm = () => {
        setCart([]);
        setCustomer('');
        setSelectedCustomerId(null);
        setCampaign('');
        setIsDelivery(false);
        setDeliverySource('whatsapp');
        setDeliverySourceDetail('');
        setDeliveryFee('');
        setDeliveryFeePayer('customer');
        setDeliveryDetails({ phone: '', address: '', number: '', neighborhood: '', city: '', state: '', reference: '' });
        setManualMtQuote(null);
        setManualMtError('');
        setDiscountValue('');
        setAmountPaid('');
        setPaymentMethod('pix');
        setInstallments(1);
        setShowCheckout(false);
    };
    const finish = async () => {
        if (cart.length === 0)
            return;
        const deliveryFlag = isDelivery && saleType === 'counter';
        if (deliveryFlag && (!deliveryDetails.phone.trim() || !deliveryAddressReady)) {
            setMessage('Preencha telefone, rua, número, bairro, cidade e UF da entrega.');
            return;
        }
        if (deliveryFlag && mtManualRequired && (manualMtLoading || !manualMtQuote)) {
            setMessage(manualMtLoading ? 'Aguarde a MT Entregas calcular a taxa.' : (manualMtError || 'Calcule a taxa da MT Entregas antes de finalizar.'));
            return;
        }
        if (paymentMethod === 'cash' && parseFloat(amountPaid) < total)
            return;
        setSaving(true);
        setMessage('');
        const items = cart.map(item => ({ product_id: item.id, name: item.name, price: item.price, quantity: item.quantity }));
        const orderResult = await supabase_1.supabase.from('customer_orders').insert({
            franchise_id: franchiseId, customer_name: customer.trim() || 'Venda balcão', customer_phone: deliveryFlag ? deliveryDetails.phone.trim() || null : null, items, total,
            subtotal, discount_amount: discountAmount, payment_method: paymentMethod,
            status: deliveryFlag ? 'pending' : 'delivered', delivery: deliveryFlag, address: deliveryFlag ? [deliveryFullAddress, deliveryDetails.neighborhood.trim(), `${deliveryDetails.city.trim()}/${deliveryDetails.state.trim().toUpperCase()}`].filter(Boolean).join(' - ') : null, customer_reference: deliveryFlag ? deliveryDetails.reference.trim() || null : null, order_mode: deliveryFlag ? 'delivery' : 'pickup', delivery_payment_method: deliveryFlag ? 'on_delivery' : null, delivery_source: deliveryFlag ? deliverySource : null,
            delivery_source_detail: deliveryFlag && deliverySource === 'other' ? deliverySourceDetail.trim() || null : null,
            delivery_fee: deliveryFlag ? deliveryFeeAmount : 0,
            delivery_fee_payer: deliveryFlag ? deliveryFeePayer : null,
            notes: campaign.trim() ? `Campanha: ${campaign.trim()}${deliveryFlag ? ` • Entrega: ${deliverySource} • ${deliveryFullAddress} - ${deliveryDetails.neighborhood} - ${deliveryDetails.city}/${deliveryDetails.state} • Taxa: R$ ${deliveryFeeAmount.toFixed(2)} (${deliveryFeePayer === 'store' ? 'loja' : 'cliente'})` : ''}` : (deliveryFlag ? `Entrega: ${deliverySource} • ${deliveryFullAddress} - ${deliveryDetails.neighborhood} - ${deliveryDetails.city}/${deliveryDetails.state} • Taxa: R$ ${deliveryFeeAmount.toFixed(2)} (${deliveryFeePayer === 'store' ? 'loja' : 'cliente'})` : null),
            order_type: saleType, campaign_name: campaign.trim() || null,
        });
        if (orderResult.error) {
            setMessage('Não foi possível registrar o pedido.');
            setSaving(false);
            return;
        }
        const saleResult = await supabase_1.supabase.from('sales').insert({
            franchise_id: franchiseId, total, subtotal, items_count: cart.reduce((sum, item) => sum + item.quantity, 0),
            sale_type: saleType, campaign_name: campaign.trim() || null,
            delivery_source: deliveryFlag ? deliverySource : null, items,
            payment_method: paymentMethod, discount: discountAmount, discount_type: discountType === 'percent' && discountAmount > 0 ? 'percent' : discountAmount > 0 ? 'fixed' : null,
            amount_paid: paymentMethod === 'cash' ? parseFloat(amountPaid) || total : total, change: paymentMethod === 'cash' ? change : 0,
            delivery_fee: deliveryFlag ? deliveryFeeAmount : 0, delivery_fee_payer: deliveryFlag ? deliveryFeePayer : null,
            customer_id: selectedCustomerId,
            user_id: franchiseUserId,
            user_name: franchiseUserName,
            installments: paymentMethod === 'credit_card' ? installments : 1,
        });
        if (saleResult.error) {
            setMessage('Pedido salvo, mas o relatório não foi atualizado.');
            setSaving(false);
            return;
        }
        if (saleType !== 'counter')
            await supabase_1.supabase.from('financial_entries').insert({ franchise_id: franchiseId, type: 'expense', description: `${SALE_TYPES.find(type => type.value === saleType)?.label}${campaign.trim() ? ` — ${campaign.trim()}` : ''}`, amount: total, paid: true });
        resetForm();
        setMessage('Venda registrada com sucesso!');
        setSaving(false);
        setTimeout(() => setMessage(''), 4000);
    };
    return ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-white font-bold text-lg", children: "Caixa \u2014 PDV" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs", children: "Registre vendas no balc\u00E3o, a\u00E7\u00F5es e brindes." })] }), (0, jsx_runtime_1.jsx)(lucide_react_1.ClipboardPenLine, { className: "text-[#FFE500]" })] }), message && ((0, jsx_runtime_1.jsxs)("div", { className: "bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg p-3 mb-4 text-sm flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Check, { size: 16 }), " ", message] })), (0, jsx_runtime_1.jsxs)("div", { className: "grid lg:grid-cols-[1fr_380px] gap-5", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "relative mb-3", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Search, { size: 18, className: "absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: search, onChange: e => setSearch(e.target.value), placeholder: "Buscar produto...", className: "w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg pl-10 pr-4 py-2.5 text-sm placeholder-zinc-500 focus:outline-none focus:border-[#FFE500]/50" })] }), categoryList.length > 1 && !search.trim() && ((0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4", children: categoryList.map(cat => {
                                    const items = productsByCategory.get(cat.id) ?? [];
                                    if (items.length === 0)
                                        return null;
                                    const isOpen = expandedCategory === cat.id;
                                    return ((0, jsx_runtime_1.jsxs)("div", { className: `bg-zinc-900 border rounded-xl overflow-hidden transition-all ${isOpen ? 'border-[#FFE500]/50 col-span-2 sm:col-span-3' : 'border-zinc-800'}`, children: [(0, jsx_runtime_1.jsxs)("button", { onClick: () => setExpandedCategory(isOpen ? null : cat.id), className: "w-full flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ChevronDown, { size: 18, className: `text-[#FFE500] transition-transform ${isOpen ? '' : '-rotate-90'}` }), (0, jsx_runtime_1.jsx)("span", { className: "text-white font-bold text-sm", children: cat.name })] }), (0, jsx_runtime_1.jsxs)("span", { className: "text-zinc-500 text-xs", children: [items.length, " item(ns)"] })] }), isOpen && ((0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 pt-0 border-t border-zinc-800", children: items.map(product => ((0, jsx_runtime_1.jsxs)("button", { onClick: () => add(product), className: "text-left bg-zinc-800 border border-zinc-700 hover:border-[#FFE500]/50 rounded-xl p-3 transition-colors flex flex-col", children: [product.image_url ? (0, jsx_runtime_1.jsx)("img", { src: product.image_url, alt: product.name, className: "w-full h-20 rounded-lg object-contain bg-zinc-900 mb-2" }) : (0, jsx_runtime_1.jsx)("div", { className: "w-full h-20 rounded-lg bg-zinc-700 flex items-center justify-center mb-2", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Package, { size: 20, className: "text-zinc-600" }) }), (0, jsx_runtime_1.jsx)("p", { className: "text-white font-medium text-sm leading-tight", children: product.name }), (0, jsx_runtime_1.jsxs)("p", { className: "text-[#FFE500] text-sm mt-1 font-bold", children: ["R$ ", (product.discount_price ?? product.price).toFixed(2), " ", product.discount_price && (0, jsx_runtime_1.jsxs)("span", { className: "text-zinc-500 line-through text-xs ml-1", children: ["R$ ", product.price.toFixed(2)] })] }), (0, jsx_runtime_1.jsxs)("span", { className: "text-zinc-500 text-xs flex items-center gap-1 mt-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { size: 12 }), "Adicionar"] })] }, product.id))) }))] }, cat.id));
                                }) })), (search.trim() || categoryList.length <= 1) && ((0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-3", children: [filteredProducts.map(product => ((0, jsx_runtime_1.jsxs)("button", { onClick: () => add(product), className: "text-left bg-zinc-900 border border-zinc-800 hover:border-[#FFE500]/50 rounded-xl p-3 transition-colors flex flex-col", children: [product.image_url ? (0, jsx_runtime_1.jsx)("img", { src: product.image_url, alt: product.name, className: "w-full h-20 rounded-lg object-contain bg-zinc-800 mb-2" }) : (0, jsx_runtime_1.jsx)("div", { className: "w-full h-20 rounded-lg bg-zinc-800 flex items-center justify-center mb-2", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Package, { size: 20, className: "text-zinc-600" }) }), (0, jsx_runtime_1.jsx)("p", { className: "text-white font-medium text-sm leading-tight", children: product.name }), (0, jsx_runtime_1.jsxs)("p", { className: "text-[#FFE500] text-sm mt-1 font-bold", children: ["R$ ", (product.discount_price ?? product.price).toFixed(2), " ", product.discount_price && (0, jsx_runtime_1.jsxs)("span", { className: "text-zinc-500 line-through text-xs ml-1", children: ["R$ ", product.price.toFixed(2)] })] }), (0, jsx_runtime_1.jsxs)("span", { className: "text-zinc-500 text-xs flex items-center gap-1 mt-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { size: 12 }), "Adicionar"] })] }, product.id))), filteredProducts.length === 0 && (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-sm col-span-full text-center py-8", children: "Nenhum produto encontrado." })] }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-4 h-fit flex flex-col", style: { maxHeight: 'calc(100vh - 200px)' }, children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-3", children: [(0, jsx_runtime_1.jsxs)("h4", { className: "text-white font-bold flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Receipt, { size: 18 }), " Carrinho"] }), cart.length > 0 && (0, jsx_runtime_1.jsxs)("button", { onClick: clearCart, className: "text-zinc-500 hover:text-red-400 text-xs flex items-center gap-1", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { size: 12 }), " Limpar"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1 overflow-y-auto space-y-2 mb-3", children: [cart.map(item => ((0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-2.5 flex items-center gap-2", children: [item.image_url ? (0, jsx_runtime_1.jsx)("img", { src: item.image_url, alt: item.name, className: "w-10 h-10 rounded-lg object-contain bg-zinc-900 flex-shrink-0" }) : (0, jsx_runtime_1.jsx)("div", { className: "w-10 h-10 rounded-lg bg-zinc-700 flex items-center justify-center flex-shrink-0", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Package, { size: 14, className: "text-zinc-500" }) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1 min-w-0", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-white text-sm truncate", children: item.name }), editingPrice === item.id ? ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-1 mt-0.5", children: [(0, jsx_runtime_1.jsx)("input", { type: "number", step: "0.01", value: priceInput, onChange: e => setPriceInput(e.target.value), onKeyDown: e => e.key === 'Enter' && savePrice(item.id), className: "w-20 bg-zinc-900 border border-[#FFE500]/50 text-white rounded px-1.5 py-0.5 text-xs", autoFocus: true }), (0, jsx_runtime_1.jsx)("button", { onClick: () => savePrice(item.id), className: "text-green-400", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Check, { size: 12 }) }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setEditingPrice(null), className: "text-red-400", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { size: 12 }) })] })) : ((0, jsx_runtime_1.jsxs)("button", { onClick: () => editPrice(item.id), className: "text-zinc-500 text-xs flex items-center gap-1 hover:text-[#FFE500]", children: ["R$ ", item.price.toFixed(2), " un. ", (0, jsx_runtime_1.jsx)(lucide_react_1.Edit3, { size: 10 })] }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-1.5", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => changeQty(item.id, -1), className: "w-6 h-6 rounded bg-zinc-700 text-white flex items-center justify-center hover:bg-zinc-600", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Minus, { size: 12 }) }), (0, jsx_runtime_1.jsx)("span", { className: "text-white text-sm w-6 text-center", children: item.quantity }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => changeQty(item.id, 1), className: "w-6 h-6 rounded bg-zinc-700 text-white flex items-center justify-center hover:bg-zinc-600", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { size: 12 }) }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => removeItem(item.id), className: "w-6 h-6 rounded text-red-400 hover:bg-red-500/10 flex items-center justify-center", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { size: 12 }) })] })] }, item.id))), cart.length === 0 && (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-sm text-center py-8", children: "Carrinho vazio. Selecione produtos." })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-1.5 border-t border-zinc-800 pt-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between text-sm", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-zinc-400", children: "Subtotal" }), (0, jsx_runtime_1.jsxs)("span", { className: "text-zinc-300", children: ["R$ ", subtotal.toFixed(2)] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setDiscountType('percent'), className: `px-2 py-1 text-xs ${discountType === 'percent' ? 'bg-[#FFE500] text-black' : 'text-zinc-400'}`, children: (0, jsx_runtime_1.jsx)(lucide_react_1.Percent, { size: 12 }) }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setDiscountType('fixed'), className: `px-2 py-1 text-xs ${discountType === 'fixed' ? 'bg-[#FFE500] text-black' : 'text-zinc-400'}`, children: (0, jsx_runtime_1.jsx)(lucide_react_1.DollarSign, { size: 12 }) })] }), (0, jsx_runtime_1.jsx)("input", { type: "number", step: "0.01", value: discountValue, onChange: e => setDiscountValue(e.target.value), placeholder: "Desconto", className: "flex-1 bg-zinc-800 border border-zinc-700 text-white rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-[#FFE500]" })] }), discountAmount > 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between text-sm", children: [(0, jsx_runtime_1.jsxs)("span", { className: "text-green-400", children: ["Desconto ", discountType === 'percent' ? `(${discountValue}%)` : ''] }), (0, jsx_runtime_1.jsxs)("span", { className: "text-green-400", children: ["- R$ ", discountAmount.toFixed(2)] })] })), isDelivery && saleType === 'counter' && deliveryFeeAmount > 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between text-sm", children: [(0, jsx_runtime_1.jsxs)("span", { className: "text-zinc-400 flex items-center gap-1", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Bike, { size: 12 }), " Taxa de entrega (", deliveryFeePayer === 'store' ? 'loja' : 'cliente', ")"] }), (0, jsx_runtime_1.jsxs)("span", { className: deliveryFeePayer === 'customer' ? 'text-orange-400' : 'text-zinc-500', children: [deliveryFeePayer === 'customer' ? '+ ' : '', "R$ ", deliveryFeeAmount.toFixed(2)] })] })), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between font-bold text-base border-t border-zinc-800 pt-2", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-white", children: "Total" }), (0, jsx_runtime_1.jsxs)("span", { className: "text-[#FFE500]", children: ["R$ ", total.toFixed(2)] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-2 mt-3", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs mb-1", children: "Tipo da opera\u00E7\u00E3o" }), (0, jsx_runtime_1.jsx)("select", { value: saleType, onChange: e => setSaleType(e.target.value), className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]", children: SALE_TYPES.map(type => (0, jsx_runtime_1.jsxs)("option", { value: type.value, children: [type.label, " \u2014 ", type.description] }, type.value)) })] }), saleType === 'counter' && ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsxs)("label", { className: "flex items-center gap-2 cursor-pointer", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: isDelivery, onChange: e => setIsDelivery(e.target.checked), className: "w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-[#FFE500] focus:ring-[#FFE500]" }), (0, jsx_runtime_1.jsx)("span", { className: "text-zinc-300 text-sm", children: "Entrega (delivery)" })] }), isDelivery && ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsx)("select", { value: deliverySource, onChange: e => setDeliverySource(e.target.value), className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]", children: DELIVERY_SOURCES.map(ds => (0, jsx_runtime_1.jsx)("option", { value: ds.value, children: ds.label }, ds.value)) }), deliverySource === 'other' && (0, jsx_runtime_1.jsx)("input", { value: deliverySourceDetail, onChange: e => setDeliverySourceDetail(e.target.value), placeholder: "Qual origem?", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 space-y-2", children: [(0, jsx_runtime_1.jsxs)("div", { className: "rounded-lg bg-[#FFE500]/10 border border-[#FFE500]/20 px-3 py-2", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-[#FFE500] text-xs font-black uppercase", children: "Dados obrigat\u00F3rios da entrega" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-[11px] mt-0.5", children: "Telefone, rua, n\u00FAmero, bairro, cidade e UF ser\u00E3o salvos no pedido Delivery." })] }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-300 text-xs font-bold", children: "Dados para entrega" }), (0, jsx_runtime_1.jsx)("input", { value: deliveryDetails.phone, onChange: e => setDeliveryDetails({ ...deliveryDetails, phone: e.target.value }), placeholder: "Telefone / WhatsApp", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm" }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-[1fr_90px] gap-2", children: [(0, jsx_runtime_1.jsx)("input", { value: deliveryDetails.address, onChange: e => setDeliveryDetails({ ...deliveryDetails, address: e.target.value }), placeholder: "Rua / avenida", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm" }), (0, jsx_runtime_1.jsx)("input", { value: deliveryDetails.number, onChange: e => setDeliveryDetails({ ...deliveryDetails, number: e.target.value }), placeholder: "N\u00FAmero", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm" })] }), (0, jsx_runtime_1.jsx)("input", { value: deliveryDetails.neighborhood, onChange: e => setDeliveryDetails({ ...deliveryDetails, neighborhood: e.target.value }), placeholder: "Bairro", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm" }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-[1fr_70px] gap-2", children: [(0, jsx_runtime_1.jsx)("input", { value: deliveryDetails.city, onChange: e => setDeliveryDetails({ ...deliveryDetails, city: e.target.value }), placeholder: "Cidade", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm" }), (0, jsx_runtime_1.jsx)("input", { maxLength: 2, value: deliveryDetails.state, onChange: e => setDeliveryDetails({ ...deliveryDetails, state: e.target.value.toUpperCase() }), placeholder: "UF", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm uppercase" })] }), (0, jsx_runtime_1.jsx)("input", { value: deliveryDetails.reference, onChange: e => setDeliveryDetails({ ...deliveryDetails, reference: e.target.value }), placeholder: "Ponto de refer\u00EAncia", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm" }), mtManualRequired && (0, jsx_runtime_1.jsx)("div", { className: `rounded-lg border px-2.5 py-2 text-xs ${manualMtQuote ? 'bg-green-500/10 border-green-500/20 text-green-400' : manualMtError ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-zinc-900 border-zinc-700 text-zinc-400'}`, children: manualMtLoading ? 'Calculando taxa com a MT Entregas...' : manualMtQuote ? `MT: R$ ${deliveryFeeAmount.toFixed(2)}${manualMtQuote.km != null ? ` • ${manualMtQuote.km.toFixed(1)} km` : ''}` : manualMtError || 'A taxa será calculada automaticamente ao completar o endereço.' })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-2", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-400 text-xs mb-1", children: "Taxa de entrega" }), (0, jsx_runtime_1.jsx)("input", { type: "number", step: "0.01", value: deliveryFee, onChange: e => setDeliveryFee(e.target.value), readOnly: mtManualRequired, placeholder: "R$ 0.00", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-[#FFE500]" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-400 text-xs mb-1", children: "Pago por" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setDeliveryFeePayer('customer'), className: `flex-1 text-xs py-1.5 ${deliveryFeePayer === 'customer' ? 'bg-[#FFE500] text-black font-bold' : 'text-zinc-400'}`, children: "Cliente" }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setDeliveryFeePayer('store'), className: `flex-1 text-xs py-1.5 ${deliveryFeePayer === 'store' ? 'bg-[#FFE500] text-black font-bold' : 'text-zinc-400'}`, children: "Loja" })] })] })] })] }))] })), (0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsx)("input", { value: customer, onChange: e => { setCustomer(e.target.value); setSelectedCustomerId(null); setShowCustomerResults(true); searchCustomers(e.target.value); }, onFocus: () => setShowCustomerResults(true), onBlur: () => setTimeout(() => setShowCustomerResults(false), 200), placeholder: "Cliente (opcional) - digite para buscar", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm" }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setShowQuickCustomer(!showQuickCustomer), className: "absolute right-2 top-1/2 -translate-y-1/2 text-[#FFE500] hover:text-[#FFD000]", title: "Novo cliente", children: (0, jsx_runtime_1.jsx)(lucide_react_1.UserPlus, { size: 16 }) }), showCustomerResults && customerSearchResults.length > 0 && ((0, jsx_runtime_1.jsx)("div", { className: "absolute z-20 top-full mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl max-h-56 overflow-y-auto", children: customerSearchResults.map(c => ((0, jsx_runtime_1.jsxs)("button", { type: "button", onMouseDown: () => { setCustomer(c.name); setSelectedCustomerId(c.id); setDeliveryDetails(current => ({ ...current, phone: c.phone || current.phone, address: c.address || current.address, neighborhood: c.neighborhood || current.neighborhood, city: c.city || current.city, state: c.state || current.state })); setShowCustomerResults(false); }, className: "w-full text-left px-3 py-2 hover:bg-zinc-700 transition-colors border-b border-zinc-700/50 last:border-0", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-white text-sm font-medium", children: c.name }), (0, jsx_runtime_1.jsxs)("p", { className: "text-zinc-500 text-xs", children: [c.phone, c.city ? ` · ${c.city}` : ''] })] }, c.id))) }))] }), showQuickCustomer && ((0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2", children: [(0, jsx_runtime_1.jsx)("input", { type: "text", value: quickCustomer.name, onChange: e => setQuickCustomer({ ...quickCustomer, name: e.target.value }), placeholder: "Nome do cliente", className: "flex-1 bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: quickCustomer.phone, onChange: e => setQuickCustomer({ ...quickCustomer, phone: e.target.value }), placeholder: "Telefone", className: "w-32 bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: saveQuickCustomer, disabled: !quickCustomer.name.trim(), className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-xs font-bold rounded-lg px-3 py-2 disabled:opacity-50", children: "Cadastrar" })] })), (0, jsx_runtime_1.jsx)("input", { value: campaign, onChange: e => setCampaign(e.target.value), placeholder: "Campanha (opcional)", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm" })] }), (0, jsx_runtime_1.jsxs)("button", { disabled: cart.length === 0, onClick: () => setShowCheckout(true), className: "w-full bg-[#FFE500] hover:bg-[#FFD000] text-black font-bold rounded-lg py-3 mt-3 disabled:opacity-50 transition-colors flex items-center justify-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Wallet, { size: 18 }), " Ir para pagamento"] })] })] }), showCheckout && ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm", onClick: () => setShowCheckout(false), children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto", onClick: e => e.stopPropagation(), children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900", children: [(0, jsx_runtime_1.jsxs)("h3", { className: "text-white font-bold text-lg flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Wallet, { size: 20 }), " Pagamento"] }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setShowCheckout(false), className: "text-zinc-400 hover:text-white", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { size: 20 }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "p-6 space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 space-y-1", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between text-sm", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-zinc-400", children: "Subtotal" }), (0, jsx_runtime_1.jsxs)("span", { className: "text-zinc-300", children: ["R$ ", subtotal.toFixed(2)] })] }), discountAmount > 0 && (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between text-sm", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-green-400", children: "Desconto" }), (0, jsx_runtime_1.jsxs)("span", { className: "text-green-400", children: ["- R$ ", discountAmount.toFixed(2)] })] }), isDelivery && saleType === 'counter' && deliveryFeeAmount > 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between text-sm", children: [(0, jsx_runtime_1.jsxs)("span", { className: "text-zinc-400", children: ["Taxa de entrega (", deliveryFeePayer === 'store' ? 'loja' : 'cliente', ")"] }), (0, jsx_runtime_1.jsxs)("span", { className: deliveryFeePayer === 'customer' ? 'text-orange-400' : 'text-zinc-500', children: [deliveryFeePayer === 'customer' ? '+ ' : '', "R$ ", deliveryFeeAmount.toFixed(2)] })] })), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between font-bold text-lg border-t border-zinc-700 pt-2", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-white", children: "Total a pagar" }), (0, jsx_runtime_1.jsxs)("span", { className: "text-[#FFE500]", children: ["R$ ", total.toFixed(2)] })] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-2", children: "Forma de pagamento" }), (0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-2 gap-2", children: PAYMENT_METHODS.map(pm => ((0, jsx_runtime_1.jsx)("button", { onClick: () => { setPaymentMethod(pm.value); setAmountPaid(''); }, className: `text-sm font-medium rounded-lg px-3 py-2.5 transition-colors ${paymentMethod === pm.value ? 'bg-[#FFE500] text-black' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`, children: pm.label }, pm.value))) })] }), paymentMethod === 'credit_card' && ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-2", children: "Parcelamento" }), (0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-3 gap-2", children: [1, 2, 3].map(n => ((0, jsx_runtime_1.jsxs)("button", { onClick: () => setInstallments(n), className: `text-sm font-bold rounded-lg px-3 py-2.5 transition-colors ${installments === n ? 'bg-[#FFE500] text-black' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`, children: [n, "x", n > 1 ? ' s/ juros' : ''] }, n))) }), (0, jsx_runtime_1.jsxs)("p", { className: "text-white text-sm font-bold mt-2", children: [installments, "x de R$ ", (total / installments).toFixed(2)] })] })), paymentMethod === 'cash' && ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-3", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Valor recebido" }), (0, jsx_runtime_1.jsx)("input", { type: "number", step: "0.01", value: amountPaid, onChange: e => setAmountPaid(e.target.value), placeholder: "R$ 0.00", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2.5 text-lg font-bold focus:outline-none focus:border-[#FFE500]" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2 flex-wrap", children: [QUICK_CASH.map(amt => ((0, jsx_runtime_1.jsxs)("button", { onClick: () => setAmountPaid(String(amt)), className: "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-lg px-3 py-1.5 transition-colors", children: ["R$ ", amt] }, amt))), (0, jsx_runtime_1.jsx)("button", { onClick: () => setAmountPaid(total.toFixed(2)), className: "bg-[#FFE500]/20 hover:bg-[#FFE500]/30 text-[#FFE500] text-xs font-bold rounded-lg px-3 py-1.5 transition-colors", children: "Valor exato" })] }), parseFloat(amountPaid) > 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 flex justify-between items-center", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-zinc-400 text-sm", children: "Troco" }), (0, jsx_runtime_1.jsxs)("span", { className: `text-lg font-bold ${change >= 0 ? 'text-green-400' : 'text-red-400'}`, children: ["R$ ", change.toFixed(2)] })] })), parseFloat(amountPaid) > 0 && parseFloat(amountPaid) < total && ((0, jsx_runtime_1.jsxs)("p", { className: "text-red-400 text-xs", children: ["Valor insuficiente. Faltam R$ ", (total - parseFloat(amountPaid)).toFixed(2)] }))] })), paymentMethod !== 'cash' && ((0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 text-sm text-zinc-400", children: ["Pagamento via ", (0, jsx_runtime_1.jsx)("span", { className: "text-white font-bold", children: PAYMENT_METHODS.find(p => p.value === paymentMethod)?.label }), " no valor de ", (0, jsx_runtime_1.jsxs)("span", { className: "text-[#FFE500] font-bold", children: ["R$ ", total.toFixed(2)] }), "."] })), (0, jsx_runtime_1.jsx)("button", { onClick: finish, disabled: saving || (paymentMethod === 'cash' && parseFloat(amountPaid) < total), className: "w-full bg-[#FFE500] hover:bg-[#FFD000] text-black font-bold rounded-lg py-3 flex items-center justify-center gap-2 disabled:opacity-50 transition-colors", children: saving ? (0, jsx_runtime_1.jsx)("div", { className: "w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" }) : (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Check, { size: 20 }), " Confirmar venda"] }) })] })] }) }))] }));
}

},
"/src/components/franchisee/FranchiseeMarketing.tsx": function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = FranchiseeMarketing;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const supabase_1 = require("@/lib/supabase");
const lucide_react_1 = require("lucide-react");
function FranchiseeMarketing({ franchiseId: _franchiseId }) {
    const [categories, setCategories] = (0, react_1.useState)([]);
    const [files, setFiles] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [selectedCat, setSelectedCat] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        (async () => {
            const [{ data: catData }, { data: fileData }] = await Promise.all([
                supabase_1.supabase.from('marketing_categories').select('*').order('name'),
                supabase_1.supabase.from('marketing_files').select('*').order('created_at', { ascending: false }),
            ]);
            if (catData)
                setCategories(catData);
            if (fileData)
                setFiles(fileData);
            setLoading(false);
        })();
    }, []);
    const filesInCat = (catId) => files.filter(f => f.category_id === catId);
    if (loading) {
        return (0, jsx_runtime_1.jsx)("div", { className: "flex justify-center py-12", children: (0, jsx_runtime_1.jsx)("div", { className: "w-6 h-6 border-2 border-zinc-700 border-t-[#FFE500] rounded-full animate-spin" }) });
    }
    if (selectedCat) {
        const cat = categories.find(c => c.id === selectedCat);
        return ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => setSelectedCat(null), className: "text-zinc-400 hover:text-white text-sm mb-4 transition-colors", children: "\u2190 Voltar" }), (0, jsx_runtime_1.jsx)("h3", { className: "text-white font-bold text-lg mb-4", children: cat?.name }), filesInCat(selectedCat).length === 0 ? ((0, jsx_runtime_1.jsxs)("div", { className: "text-center py-12", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.FileText, { size: 40, className: "mx-auto text-zinc-700 mb-3" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-sm", children: "Nenhum arquivo nesta categoria." })] })) : ((0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", children: filesInCat(selectedCat).map(file => ((0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3 mb-3", children: [file.file_type === 'image' ? ((0, jsx_runtime_1.jsx)("img", { src: file.file_url, alt: file.title, className: "w-14 h-14 rounded-lg object-cover" })) : ((0, jsx_runtime_1.jsx)("div", { className: "w-14 h-14 rounded-lg bg-zinc-800 flex items-center justify-center", children: (0, jsx_runtime_1.jsx)(lucide_react_1.FileText, { size: 22, className: "text-zinc-400" }) })), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-white font-bold text-sm", children: file.title }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs", children: file.file_name })] })] }), (0, jsx_runtime_1.jsxs)("a", { href: file.file_url, download: true, target: "_blank", rel: "noopener noreferrer", className: "w-full bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg py-2 flex items-center justify-center gap-1.5 transition-all", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Download, { size: 16 }), " Baixar"] })] }, file.id))) }))] }));
    }
    if (categories.length === 0) {
        return ((0, jsx_runtime_1.jsxs)("div", { className: "text-center py-12", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Folder, { size: 40, className: "mx-auto text-zinc-700 mb-3" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-sm", children: "Nenhum material de marketing dispon\u00EDvel." })] }));
    }
    return ((0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", children: categories.map(cat => ((0, jsx_runtime_1.jsx)("button", { onClick: () => setSelectedCat(cat.id), className: "bg-zinc-900 border border-zinc-800 hover:border-[#FFE500]/30 rounded-xl p-5 text-left transition-all group", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-12 h-12 rounded-lg bg-[#FFE500]/10 flex items-center justify-center", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Folder, { size: 22, className: "text-[#FFE500]" }) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-white font-bold text-sm", children: cat.name }), (0, jsx_runtime_1.jsxs)("p", { className: "text-zinc-500 text-xs", children: [filesInCat(cat.id).length, " arquivo(s)"] })] })] }), (0, jsx_runtime_1.jsx)(lucide_react_1.ChevronRight, { size: 18, className: "text-zinc-600 group-hover:text-[#FFE500] transition-colors" })] }) }, cat.id))) }));
}

},
"/src/components/franchisee/FranchiseeOrders.tsx": function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = FranchiseeOrders;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const supabase_1 = require("@/lib/supabase");
const lucide_react_1 = require("lucide-react");
const PrintableComanda_1 = __importDefault(require("@/components/franchisee/PrintableComanda"));
const MtDeliveryModal_1 = __importStar(require("@/components/franchisee/MtDeliveryModal"));
const DELIVERY_SOURCE_LABELS = { whatsapp: 'WhatsApp', ifood: 'iFood', uber_eats: 'Uber Eats', rappi: 'Rappi', '99delivery': '99 Delivery', phone: 'Telefone', other: 'Outro' };
const STATUS_FLOW = [
    { key: 'pending', label: 'Pendente', color: 'bg-yellow-500/10 text-yellow-400' },
    { key: 'accepted', label: 'Aceito', color: 'bg-blue-500/10 text-blue-400' },
    { key: 'preparing', label: 'Em andamento', color: 'bg-purple-500/10 text-purple-400' },
    { key: 'ready', label: 'Pronto', color: 'bg-green-500/10 text-green-400' },
    { key: 'delivering', label: 'Em entrega', color: 'bg-orange-500/10 text-orange-400' },
    { key: 'pickup', label: 'Pode retirar', color: 'bg-cyan-500/10 text-cyan-400' },
    { key: 'delivered', label: 'Entregue', color: 'bg-green-600/10 text-green-600' },
    { key: 'cancelled', label: 'Cancelado', color: 'bg-red-500/10 text-red-400' },
];
const PAYMENT_LABELS = { pix: 'PIX', credit_card: 'Crédito', debit_card: 'Débito', cash: 'Dinheiro', meal_voucher: 'Vale-refeição' };
function FranchiseeOrders({ franchiseId }) {
    const [orders, setOrders] = (0, react_1.useState)([]);
    const [franchise, setFranchise] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [viewOrder, setViewOrder] = (0, react_1.useState)(null);
    const [printOrder, setPrintOrder] = (0, react_1.useState)(null);
    const [filterStatus, setFilterStatus] = (0, react_1.useState)('all');
    const [mtEnabled, setMtEnabled] = (0, react_1.useState)(false);
    const [dispatchOrder, setDispatchOrder] = (0, react_1.useState)(null);
    const load = async () => {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const [{ data: orderData }, { data: franData }, { data: deliveryData }] = await Promise.all([
            supabase_1.supabase.from('customer_orders').select('*').eq('franchise_id', franchiseId).gte('created_at', todayStart.toISOString()).order('created_at', { ascending: false }),
            supabase_1.supabase.from('franchises').select('*').eq('id', franchiseId).maybeSingle(),
            supabase_1.supabase.from('delivery_settings').select('mt_entregas_enabled').eq('franchise_id', franchiseId).maybeSingle(),
        ]);
        if (orderData)
            setOrders(orderData);
        if (franData)
            setFranchise(franData);
        setMtEnabled(Boolean(deliveryData?.mt_entregas_enabled));
        setLoading(false);
    };
    (0, react_1.useEffect)(() => { load(); }, [franchiseId]);
    const updateStatus = async (order, status) => {
        // Update local status
        await supabase_1.supabase.from('customer_orders').update({ status }).eq('id', order.id);
        setViewOrder({ ...order, status: status });
        // If order came from iFood, push status update back to iFood
        if (order.delivery_source === 'ifood' && order.platform_order_id) {
            const statusMap = {
                accepted: 'confirmed',
                preparing: 'preparing',
                ready: 'ready',
                delivering: 'dispatched',
                cancelled: 'cancelled',
            };
            const ifoodStatus = statusMap[status];
            if (ifoodStatus) {
                try {
                    const apiUrl = `${"https://sgvojdgbjvynnoherpqj.supabase.co"}/functions/v1/delivery-sync`;
                    const { data: session } = await supabase_1.supabase.auth.getSession();
                    await fetch(apiUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${session.session?.access_token ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNndm9qZGdianZ5bm5vaGVycHFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3NDE4ODIsImV4cCI6MjEwMTMxNzg4Mn0.RuAHGD0VCcDxIL4jfSFXjyiC4ZzVgRAZna3j80ovIf4"}`,
                            'apikey': "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNndm9qZGdianZ5bm5vaGVycHFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3NDE4ODIsImV4cCI6MjEwMTMxNzg4Mn0.RuAHGD0VCcDxIL4jfSFXjyiC4ZzVgRAZna3j80ovIf4",
                        },
                        body: JSON.stringify({ action: 'update_status', order_id: order.id, status: ifoodStatus }),
                    });
                }
                catch {
                    // Status updated locally; iFood sync will retry on next sync cycle
                }
            }
        }
        load();
    };
    const statusInfo = (s) => STATUS_FLOW.find(st => st.key === s) ?? STATUS_FLOW[0];
    const filtered = filterStatus === 'all' ? orders : orders.filter(o => o.status === filterStatus);
    const pendingCount = orders.filter(o => o.status === 'pending').length;
    return ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-4 flex-wrap gap-2", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-white font-bold text-lg", children: "Pedidos" }), pendingCount > 0 && (0, jsx_runtime_1.jsxs)("span", { className: "bg-yellow-500/20 text-yellow-400 text-xs font-bold px-2 py-0.5 rounded-full", children: [pendingCount, " novo(s)"] })] }), (0, jsx_runtime_1.jsxs)("select", { value: filterStatus, onChange: e => setFilterStatus(e.target.value), className: "bg-zinc-900 border border-zinc-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]", children: [(0, jsx_runtime_1.jsx)("option", { value: "all", children: "Todos os status" }), STATUS_FLOW.map(s => (0, jsx_runtime_1.jsx)("option", { value: s.key, children: s.label }, s.key))] })] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-zinc-500 text-xs mb-3", children: ["Mostrando apenas pedidos de hoje. Para ver pedidos antigos, acesse a aba ", (0, jsx_runtime_1.jsx)("span", { className: "text-[#FFE500] font-medium", children: "Relat\u00F3rio" }), " e filtre por per\u00EDodo."] }), loading ? ((0, jsx_runtime_1.jsx)("div", { className: "flex justify-center py-12", children: (0, jsx_runtime_1.jsx)("div", { className: "w-6 h-6 border-2 border-zinc-700 border-t-[#FFE500] rounded-full animate-spin" }) })) : filtered.length === 0 ? ((0, jsx_runtime_1.jsxs)("div", { className: "text-center py-12", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ClipboardList, { size: 40, className: "mx-auto text-zinc-700 mb-3" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-sm", children: "Nenhum pedido recebido." })] })) : ((0, jsx_runtime_1.jsx)("div", { className: "space-y-3", children: filtered.map(order => {
                    const si = statusInfo(order.status);
                    const mtMeta = (0, MtDeliveryModal_1.getMtMeta)(order.notes);
                    return ((0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-start justify-between mb-2", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 mb-1", children: [(0, jsx_runtime_1.jsx)("h4", { className: "text-white font-bold text-sm", children: order.customer_name }), (0, jsx_runtime_1.jsx)("span", { className: `text-xs px-2 py-0.5 rounded-full ${si.color}`, children: si.label })] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-zinc-500 text-xs flex items-center gap-1", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Clock, { size: 11 }), " ", new Date(order.created_at).toLocaleString('pt-BR')] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "text-right", children: [(0, jsx_runtime_1.jsxs)("p", { className: "text-[#FFE500] font-bold", children: ["R$ ", order.total.toFixed(2)] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-zinc-500 text-xs", children: [order.items?.length ?? 0, " item(ns)"] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 mt-2 flex-wrap", children: [order.delivery && (0, jsx_runtime_1.jsxs)("span", { className: "text-orange-400 text-xs flex items-center gap-1", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.MapPin, { size: 11 }), " ", order.order_mode === 'pickup' ? 'Retirada' : 'Delivery'] }), order.delivery && order.delivery_source && (0, jsx_runtime_1.jsxs)("span", { className: "text-zinc-500 text-xs", children: ["\u2014 ", DELIVERY_SOURCE_LABELS[order.delivery_source] ?? order.delivery_source] }), order.delivery_source === 'ifood' && (0, jsx_runtime_1.jsx)("span", { className: "bg-red-500/10 text-red-400 text-xs font-medium px-1.5 py-0.5 rounded", children: "iFood" }), order.payment_method && (0, jsx_runtime_1.jsxs)("span", { className: "text-zinc-500 text-xs", children: ["\u2014 ", PAYMENT_LABELS[order.payment_method] ?? order.payment_method] }), (0, jsx_runtime_1.jsxs)("div", { className: "ml-auto flex items-center gap-2 flex-wrap justify-end", children: [order.delivery && order.order_mode !== 'pickup' && mtEnabled && (mtMeta?.id ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("span", { className: "bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Bike, { size: 13 }), " MT #", mtMeta.id] }), mtMeta.tracking && ((0, jsx_runtime_1.jsxs)("a", { href: mtMeta.tracking, target: "_blank", rel: "noreferrer", className: "text-cyan-400 hover:text-cyan-300 text-xs flex items-center gap-1", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ExternalLink, { size: 13 }), " Rastrear"] }))] })) : mtMeta?.status === 'requesting' || mtMeta?.status === 'ambiguous' ? ((0, jsx_runtime_1.jsxs)("span", { className: "bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-medium px-2 py-1 rounded-lg flex items-center gap-1", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Bike, { size: 13 }), " MT \u2014 verificar central"] })) : ((0, jsx_runtime_1.jsxs)("button", { onClick: () => setDispatchOrder(order), disabled: order.status === 'cancelled' || order.status === 'delivered', className: "bg-[#FFE500] hover:bg-[#FFD000] text-black disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Bike, { size: 14 }), " Chamar motoboy"] }))), (0, jsx_runtime_1.jsxs)("button", { onClick: () => setViewOrder(order), className: "text-zinc-400 hover:text-[#FFE500] text-xs flex items-center gap-1 transition-colors", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Eye, { size: 14 }), " Ver detalhes"] }), (0, jsx_runtime_1.jsxs)("button", { onClick: () => setPrintOrder(order), className: "text-zinc-400 hover:text-[#FFE500] text-xs flex items-center gap-1 transition-colors", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Printer, { size: 14 }), " Imprimir"] })] })] })] }, order.id));
                }) })), viewOrder && ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm", onClick: () => setViewOrder(null), children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto", onClick: e => e.stopPropagation(), children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-white font-bold text-lg", children: "Detalhes do Pedido" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setViewOrder(null), className: "text-zinc-400 hover:text-white", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { size: 20 }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "p-6 space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs", children: "Cliente" }), (0, jsx_runtime_1.jsx)("p", { className: "text-white font-bold", children: viewOrder.customer_name }), viewOrder.customer_phone && (0, jsx_runtime_1.jsxs)("p", { className: "text-zinc-400 text-sm flex items-center gap-1 mt-1", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Phone, { size: 12 }), " ", viewOrder.customer_phone] })] }), viewOrder.delivery && viewOrder.address && ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs", children: "Endere\u00E7o de entrega" }), (0, jsx_runtime_1.jsxs)("p", { className: "text-white text-sm flex items-center gap-1", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.MapPin, { size: 12 }), " ", viewOrder.address] }), viewOrder.customer_reference && (0, jsx_runtime_1.jsxs)("p", { className: "text-zinc-400 text-xs mt-1", children: ["Ref: ", viewOrder.customer_reference] })] })), viewOrder.order_mode === 'pickup' && ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs", children: "Tipo" }), (0, jsx_runtime_1.jsx)("p", { className: "text-white text-sm", children: "Retirada no local" })] })), viewOrder.payment_method && ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs", children: "Pagamento" }), (0, jsx_runtime_1.jsx)("p", { className: "text-white text-sm", children: PAYMENT_LABELS[viewOrder.payment_method] ?? viewOrder.payment_method })] })), viewOrder.delivery && viewOrder.order_mode !== 'pickup' && mtEnabled && (() => {
                                    const mtMeta = (0, MtDeliveryModal_1.getMtMeta)(viewOrder.notes);
                                    return ((0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-800/60 border border-zinc-700 rounded-xl p-3", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs mb-2", children: "MT Entregas" }), mtMeta?.id ? ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between gap-2", children: [(0, jsx_runtime_1.jsxs)("span", { className: "text-green-400 text-sm font-bold flex items-center gap-1.5", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Bike, { size: 15 }), " Motoboy solicitado \u2014 #", mtMeta.id] }), mtMeta.tracking && ((0, jsx_runtime_1.jsxs)("a", { href: mtMeta.tracking, target: "_blank", rel: "noreferrer", className: "text-cyan-400 text-xs flex items-center gap-1", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ExternalLink, { size: 13 }), " Rastreio"] }))] })) : mtMeta?.status === 'requesting' || mtMeta?.status === 'ambiguous' ? ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("p", { className: "text-orange-400 text-sm flex items-center gap-1.5", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Bike, { size: 15 }), " Solicita\u00E7\u00E3o bloqueada por seguran\u00E7a."] }), (0, jsx_runtime_1.jsx)("p", { className: "text-orange-200/70 text-xs mt-1", children: "Confira a central MT Entregas antes de fazer uma nova chamada, pois a resposta anterior pode ter sido interrompida." })] })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [mtMeta?.error && (0, jsx_runtime_1.jsx)("p", { className: "text-red-400 text-xs mb-2", children: mtMeta.error }), (0, jsx_runtime_1.jsxs)("button", { onClick: () => { setDispatchOrder(viewOrder); setViewOrder(null); }, disabled: viewOrder.status === 'cancelled' || viewOrder.status === 'delivered', className: "w-full bg-[#FFE500] hover:bg-[#FFD000] text-black disabled:opacity-40 font-bold text-sm rounded-lg py-2.5 flex items-center justify-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Bike, { size: 16 }), " Chamar motoboy pela MT"] })] }))] }));
                                })(), (0, MtDeliveryModal_1.withoutMtMeta)(viewOrder.notes) && ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs", children: "Observa\u00E7\u00F5es" }), (0, jsx_runtime_1.jsx)("p", { className: "text-white text-sm", children: (0, MtDeliveryModal_1.withoutMtMeta)(viewOrder.notes) })] })), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs mb-2", children: "Itens" }), (0, jsx_runtime_1.jsx)("div", { className: "space-y-2", children: Array.isArray(viewOrder.items) && viewOrder.items.map((item, i) => ((0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("p", { className: "text-white text-sm font-medium", children: [item.quantity, "x ", item.name] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-[#FFE500] text-sm", children: ["R$ ", (item.price * item.quantity).toFixed(2)] })] }), item.addons && item.addons.length > 0 && ((0, jsx_runtime_1.jsx)("div", { className: "mt-1 pl-3", children: item.addons.map((a, j) => ((0, jsx_runtime_1.jsxs)("p", { className: "text-zinc-500 text-xs", children: ["+ ", a.name, " ", a.price > 0 && `(R$ ${a.price.toFixed(2)})`] }, j))) }))] }, i))) }), (viewOrder.subtotal > 0 || viewOrder.discount_amount > 0 || (viewOrder.coupon_discount ?? 0) > 0 || viewOrder.delivery_fee > 0) && ((0, jsx_runtime_1.jsxs)("div", { className: "mt-3 pt-3 border-t border-zinc-800 space-y-1 text-sm", children: [viewOrder.subtotal > 0 && (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between text-zinc-400", children: [(0, jsx_runtime_1.jsx)("span", { children: "Subtotal" }), (0, jsx_runtime_1.jsxs)("span", { children: ["R$ ", viewOrder.subtotal.toFixed(2)] })] }), (viewOrder.coupon_discount ?? 0) > 0 && (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between text-green-400", children: [(0, jsx_runtime_1.jsxs)("span", { children: ["Cupom", viewOrder.coupon_code ? ` (${viewOrder.coupon_code})` : ''] }), (0, jsx_runtime_1.jsxs)("span", { children: ["- R$ ", (viewOrder.coupon_discount ?? 0).toFixed(2)] })] }), viewOrder.discount_amount > 0 && (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between text-green-400", children: [(0, jsx_runtime_1.jsxs)("span", { children: ["Desconto PIX (", viewOrder.pix_discount_percent ?? 0, "%)"] }), (0, jsx_runtime_1.jsxs)("span", { children: ["- R$ ", viewOrder.discount_amount.toFixed(2)] })] }), viewOrder.delivery_fee > 0 && (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between text-zinc-400", children: [(0, jsx_runtime_1.jsx)("span", { children: "Taxa de entrega" }), (0, jsx_runtime_1.jsxs)("span", { children: ["R$ ", viewOrder.delivery_fee.toFixed(2)] })] })] })), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mt-3 pt-3 border-t border-zinc-800", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-white font-bold", children: "Total" }), (0, jsx_runtime_1.jsxs)("p", { className: "text-[#FFE500] font-bold text-lg", children: ["R$ ", viewOrder.total.toFixed(2)] })] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs mb-2", children: "Status do pedido" }), (0, jsx_runtime_1.jsx)("div", { className: "flex flex-wrap gap-2", children: STATUS_FLOW.map(s => ((0, jsx_runtime_1.jsx)("button", { onClick: () => updateStatus(viewOrder, s.key), className: `text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${viewOrder.status === s.key ? 'bg-[#FFE500] text-black' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`, children: s.label }, s.key))) })] }), (0, jsx_runtime_1.jsxs)("button", { onClick: () => { setPrintOrder(viewOrder); setViewOrder(null); }, className: "w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-lg py-2.5 flex items-center justify-center gap-2 transition-colors", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Printer, { size: 16 }), " Imprimir comanda"] })] })] }) })), dispatchOrder && ((0, jsx_runtime_1.jsx)(MtDeliveryModal_1.default, { order: dispatchOrder, franchiseId: franchiseId, onClose: () => setDispatchOrder(null), onSuccess: async () => { await load(); } })), printOrder && franchise && ((0, jsx_runtime_1.jsx)(PrintableComanda_1.default, { order: printOrder, franchise: franchise, onClose: () => setPrintOrder(null) }))] }));
}

},
"/src/components/franchisee/FranchiseeProducts.tsx": function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = FranchiseeProducts;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const supabase_1 = require("@/lib/supabase");
const lucide_react_1 = require("lucide-react");
function FranchiseeProducts({ franchiseId }) {
    const [products, setProducts] = (0, react_1.useState)([]);
    const [categories, setCategories] = (0, react_1.useState)([]);
    const [groups, setGroups] = (0, react_1.useState)([]);
    const [addons, setAddons] = (0, react_1.useState)([]);
    const [links, setLinks] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [showForm, setShowForm] = (0, react_1.useState)(false);
    const [editing, setEditing] = (0, react_1.useState)(null);
    const [managingGroups, setManagingGroups] = (0, react_1.useState)(null);
    const [form, setForm] = (0, react_1.useState)({
        name: '', description: '', price: '', discount_price: '', category_id: '', stock: '0', image: null,
        long_description: '', ingredients: '', nutritional_info: '', usage_instructions: '',
        brand: '', flavor: '', weight: '',
    });
    const [imageUrl, setImageUrl] = (0, react_1.useState)(null);
    const [galleryFiles, setGalleryFiles] = (0, react_1.useState)([]);
    const [galleryUrls, setGalleryUrls] = (0, react_1.useState)([]);
    const [videoFiles, setVideoFiles] = (0, react_1.useState)([]);
    const [videoUrls, setVideoUrls] = (0, react_1.useState)([]);
    const [saving, setSaving] = (0, react_1.useState)(false);
    const load = async () => {
        const [{ data: prods }, { data: cats }, { data: grps }, { data: adns }, { data: lnks }] = await Promise.all([
            supabase_1.supabase.from('franchise_products').select('*').eq('franchise_id', franchiseId).order('sort_order', { ascending: true }),
            supabase_1.supabase.from('franchise_categories').select('*').eq('franchise_id', franchiseId).order('sort_order', { ascending: true }).order('created_at', { ascending: true }).order('id', { ascending: true }),
            supabase_1.supabase.from('franchise_groups').select('*').eq('franchise_id', franchiseId).order('name'),
            supabase_1.supabase.from('franchise_addons').select('*').order('name'),
            supabase_1.supabase.from('product_group_links').select('*'),
        ]);
        if (prods)
            setProducts(prods);
        if (cats)
            setCategories(cats);
        if (grps)
            setGroups(grps);
        if (adns)
            setAddons(adns);
        if (lnks)
            setLinks(lnks);
        setLoading(false);
    };
    (0, react_1.useEffect)(() => { load(); }, [franchiseId]);
    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        let img = imageUrl;
        if (form.image) {
            const ext = form.image.name.split('.').pop();
            const path = `${franchiseId}/${Date.now()}.${ext}`;
            const { error } = await supabase_1.supabase.storage.from('franchise-products').upload(path, form.image);
            if (!error)
                img = supabase_1.supabase.storage.from('franchise-products').getPublicUrl(path).data.publicUrl;
        }
        // Upload gallery images
        const uploadedGallery = [...galleryUrls];
        for (const file of galleryFiles) {
            const ext = file.name.split('.').pop();
            const path = `${franchiseId}/gallery-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
            const { error } = await supabase_1.supabase.storage.from('franchise-products').upload(path, file);
            if (!error)
                uploadedGallery.push(supabase_1.supabase.storage.from('franchise-products').getPublicUrl(path).data.publicUrl);
        }
        // Upload videos
        const uploadedVideos = [...videoUrls];
        for (const file of videoFiles) {
            const ext = file.name.split('.').pop() || 'mp4';
            const path = `${franchiseId}/video-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
            const { error } = await supabase_1.supabase.storage.from('franchise-products').upload(path, file);
            if (!error)
                uploadedVideos.push(supabase_1.supabase.storage.from('franchise-products').getPublicUrl(path).data.publicUrl);
        }
        const payload = {
            franchise_id: franchiseId,
            category_id: form.category_id || null,
            name: form.name,
            description: form.description || null,
            price: parseFloat(form.price) || 0,
            discount_price: form.discount_price ? parseFloat(form.discount_price) : null,
            stock: parseInt(form.stock) || 0,
            image_url: img,
            sort_order: editing?.sort_order ?? products.length,
            long_description: form.long_description || null,
            ingredients: form.ingredients || null,
            nutritional_info: form.nutritional_info || null,
            usage_instructions: form.usage_instructions || null,
            brand: form.brand || null,
            flavor: form.flavor || null,
            weight: form.weight || null,
            gallery_urls: uploadedGallery.length > 0 ? uploadedGallery : null,
            video_urls: uploadedVideos.length > 0 ? uploadedVideos : null,
        };
        if (editing) {
            await supabase_1.supabase.from('franchise_products').update(payload).eq('id', editing.id);
        }
        else {
            await supabase_1.supabase.from('franchise_products').insert(payload);
        }
        setForm({ name: '', description: '', price: '', discount_price: '', category_id: '', stock: '0', image: null, long_description: '', ingredients: '', nutritional_info: '', usage_instructions: '', brand: '', flavor: '', weight: '' });
        setImageUrl(null);
        setGalleryFiles([]);
        setGalleryUrls([]);
        setVideoFiles([]);
        setVideoUrls([]);
        setEditing(null);
        setShowForm(false);
        setSaving(false);
        load();
    };
    const moveGalleryImage = (index, direction) => {
        const nextIndex = direction === 'left' ? index - 1 : index + 1;
        if (nextIndex < 0 || nextIndex >= galleryUrls.length)
            return;
        const next = [...galleryUrls];
        [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
        setGalleryUrls(next);
    };
    const handleDelete = async (p) => {
        if (!confirm(`Excluir "${p.name}"?`))
            return;
        await supabase_1.supabase.from('franchise_products').delete().eq('id', p.id);
        load();
    };
    const moveProduct = async (p, dir) => {
        const sorted = [...products].sort((a, b) => a.sort_order - b.sort_order);
        const idx = sorted.findIndex(x => x.id === p.id);
        const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
        if (swapIdx < 0 || swapIdx >= sorted.length)
            return;
        const swap = sorted[swapIdx];
        await Promise.all([
            supabase_1.supabase.from('franchise_products').update({ sort_order: swap.sort_order }).eq('id', p.id),
            supabase_1.supabase.from('franchise_products').update({ sort_order: p.sort_order }).eq('id', swap.id),
        ]);
        load();
    };
    const toggleLink = async (productId, groupId) => {
        const existing = links.find(l => l.product_id === productId && l.group_id === groupId);
        if (existing) {
            await supabase_1.supabase.from('product_group_links').delete().eq('id', existing.id);
        }
        else {
            await supabase_1.supabase.from('product_group_links').insert({ product_id: productId, group_id: groupId });
        }
        load();
    };
    const catName = (id) => categories.find(c => c.id === id)?.name ?? 'Sem categoria';
    const addonsInGroup = (gid) => addons.filter(a => a.group_id === gid);
    const linkedGroups = (pid) => links.filter(l => l.product_id === pid).map(l => l.group_id);
    return ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-4", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-white font-bold text-lg", children: "Produtos" }), (0, jsx_runtime_1.jsxs)("button", { onClick: () => { if (editing) {
                            setEditing(null);
                            setForm({ name: '', description: '', price: '', category_id: '', stock: '0', image: null, long_description: '', ingredients: '', nutritional_info: '', usage_instructions: '', brand: '', flavor: '', weight: '' });
                            setImageUrl(null);
                            setGalleryUrls([]);
                            setGalleryFiles([]);
                            setVideoUrls([]);
                            setVideoFiles([]);
                        } setShowForm(!showForm); }, className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 flex items-center gap-1.5 transition-all", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { size: 16 }), " ", editing ? 'Editando...' : 'Novo Produto'] })] }), showForm && ((0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSave, className: "bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4 space-y-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Nome" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: form.name, onChange: e => setForm({ ...form, name: e.target.value }), required: true, className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Categoria" }), (0, jsx_runtime_1.jsxs)("select", { value: form.category_id, onChange: e => setForm({ ...form, category_id: e.target.value }), className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]", children: [(0, jsx_runtime_1.jsx)("option", { value: "", children: "Sem categoria" }), categories.map(c => (0, jsx_runtime_1.jsx)("option", { value: c.id, children: c.name }, c.id))] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Pre\u00E7o (R$)" }), (0, jsx_runtime_1.jsx)("input", { type: "number", step: "0.01", value: form.price, onChange: e => setForm({ ...form, price: e.target.value }), required: true, className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Pre\u00E7o promocional" }), (0, jsx_runtime_1.jsx)("input", { type: "number", step: "0.01", value: form.discount_price, onChange: e => setForm({ ...form, discount_price: e.target.value }), placeholder: "Opcional", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Estoque" }), (0, jsx_runtime_1.jsx)("input", { type: "number", value: form.stock, onChange: e => setForm({ ...form, stock: e.target.value }), className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Descri\u00E7\u00E3o" }), (0, jsx_runtime_1.jsx)("textarea", { value: form.description, onChange: e => setForm({ ...form, description: e.target.value }), rows: 2, className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500] resize-none" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("label", { className: "flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 cursor-pointer hover:border-[#FFE500]/50 transition-colors", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Upload, { size: 16, className: "text-zinc-400" }), (0, jsx_runtime_1.jsx)("span", { className: "text-zinc-400 text-sm", children: form.image ? form.image.name : imageUrl ? 'Capa atual — clique para trocar' : 'Imagem principal (opcional)' }), (0, jsx_runtime_1.jsx)("input", { type: "file", accept: "image/*", className: "hidden", onChange: e => setForm({ ...form, image: e.target.files?.[0] ?? null }) })] }), (form.image || imageUrl) && (0, jsx_runtime_1.jsxs)("div", { className: "mt-2 flex items-center gap-3 bg-zinc-800/50 rounded-lg p-2", children: [(0, jsx_runtime_1.jsx)("img", { src: form.image ? URL.createObjectURL(form.image) : imageUrl ?? '', alt: "Pr\u00E9via da capa", className: "w-16 h-16 rounded-lg object-cover" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-white text-xs font-medium", children: "Capa do produto" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs", children: "Esta imagem aparece no card\u00E1pio." })] })] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Galeria de imagens (opcional)" }), (0, jsx_runtime_1.jsxs)("label", { className: "flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 cursor-pointer hover:border-[#FFE500]/50 transition-colors", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ImageIcon, { size: 16, className: "text-zinc-400" }), (0, jsx_runtime_1.jsx)("span", { className: "text-zinc-400 text-sm", children: galleryFiles.length > 0 ? `${galleryFiles.length} nova(s) imagem(ns)` : 'Adicionar múltiplas fotos' }), (0, jsx_runtime_1.jsx)("input", { type: "file", accept: "image/*", multiple: true, className: "hidden", onChange: e => setGalleryFiles([...galleryFiles, ...Array.from(e.target.files ?? [])]) })] }), (galleryUrls.length > 0 || galleryFiles.length > 0) && ((0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2 mt-2 flex-wrap", children: [galleryUrls.map((url, i) => ((0, jsx_runtime_1.jsxs)("div", { className: "relative w-20 h-20 rounded-lg overflow-hidden group border border-zinc-700", children: [(0, jsx_runtime_1.jsx)("img", { src: url, alt: `Imagem ${i + 1}`, className: "w-full h-full object-cover" }), (0, jsx_runtime_1.jsxs)("span", { className: "absolute top-1 left-1 bg-black/70 text-white text-[10px] font-bold rounded px-1.5 py-0.5", children: [i + 1, "\u00BA"] }), (0, jsx_runtime_1.jsxs)("div", { className: "absolute inset-x-0 bottom-0 bg-black/75 flex justify-between items-center px-1 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => moveGalleryImage(i, 'left'), disabled: i === 0, className: "text-white disabled:opacity-30", children: (0, jsx_runtime_1.jsx)(lucide_react_1.ChevronLeft, { size: 14 }) }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setGalleryUrls(galleryUrls.filter((_, idx) => idx !== i)), className: "text-red-300", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { size: 14 }) }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => moveGalleryImage(i, 'right'), disabled: i === galleryUrls.length - 1, className: "text-white disabled:opacity-30", children: (0, jsx_runtime_1.jsx)(lucide_react_1.ChevronRight, { size: 14 }) })] })] }, `u${i}`))), galleryFiles.map((file, i) => ((0, jsx_runtime_1.jsxs)("div", { className: "relative w-20 h-20 rounded-lg overflow-hidden group bg-zinc-800 flex items-center justify-center border border-dashed border-zinc-600", children: [(0, jsx_runtime_1.jsx)("img", { src: URL.createObjectURL(file), alt: `Nova imagem ${i + 1}`, className: "w-full h-full object-cover" }), (0, jsx_runtime_1.jsx)("span", { className: "absolute top-1 left-1 bg-black/70 text-white text-[10px] font-bold rounded px-1.5 py-0.5", children: "nova" }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setGalleryFiles(galleryFiles.filter((_, idx) => idx !== i)), className: "absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { size: 14, className: "text-white" }) })] }, `f${i}`)))] }))] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "V\u00EDdeos curtos do produto (opcional)" }), (0, jsx_runtime_1.jsxs)("label", { className: "flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 cursor-pointer hover:border-[#FFE500]/50 transition-colors", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Video, { size: 16, className: "text-zinc-400" }), (0, jsx_runtime_1.jsx)("span", { className: "text-zinc-400 text-sm", children: videoFiles.length > 0 ? `${videoFiles.length} novo(s) vídeo(s)` : 'Adicionar vídeos curtos' }), (0, jsx_runtime_1.jsx)("input", { type: "file", accept: "video/*", multiple: true, className: "hidden", onChange: e => setVideoFiles([...videoFiles, ...Array.from(e.target.files ?? [])]) })] }), (videoUrls.length > 0 || videoFiles.length > 0) && ((0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2 mt-2 flex-wrap", children: [videoUrls.map((url, i) => ((0, jsx_runtime_1.jsxs)("div", { className: "relative w-20 h-20 rounded-lg overflow-hidden group bg-zinc-800 border border-zinc-700", children: [(0, jsx_runtime_1.jsx)("video", { src: url, className: "w-full h-full object-cover" }), (0, jsx_runtime_1.jsxs)("span", { className: "absolute top-1 left-1 bg-black/70 text-white text-[10px] font-bold rounded px-1.5 py-0.5", children: [i + 1, "\u00BA"] }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setVideoUrls(videoUrls.filter((_, idx) => idx !== i)), className: "absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { size: 14, className: "text-white" }) })] }, `vu${i}`))), videoFiles.map((file, i) => ((0, jsx_runtime_1.jsxs)("div", { className: "relative w-20 h-20 rounded-lg overflow-hidden group bg-zinc-800 flex items-center justify-center border border-dashed border-zinc-600", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Play, { size: 18, className: "text-zinc-500" }), (0, jsx_runtime_1.jsx)("span", { className: "absolute top-1 left-1 bg-black/70 text-white text-[10px] font-bold rounded px-1.5 py-0.5", children: "nova" }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setVideoFiles(videoFiles.filter((_, idx) => idx !== i)), className: "absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { size: 14, className: "text-white" }) })] }, `vf${i}`)))] }))] }), (0, jsx_runtime_1.jsxs)("details", { className: "bg-zinc-800/30 border border-zinc-700 rounded-lg", children: [(0, jsx_runtime_1.jsx)("summary", { className: "cursor-pointer text-zinc-300 text-sm font-medium px-3 py-2 select-none", children: "Informa\u00E7\u00F5es detalhadas (opcional)" }), (0, jsx_runtime_1.jsxs)("div", { className: "p-3 space-y-3", children: [(0, jsx_runtime_1.jsx)("textarea", { value: form.long_description, onChange: e => setForm({ ...form, long_description: e.target.value }), rows: 3, placeholder: "Descri\u00E7\u00E3o detalhada", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500] resize-none" }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3", children: [(0, jsx_runtime_1.jsx)("input", { type: "text", value: form.brand, onChange: e => setForm({ ...form, brand: e.target.value }), placeholder: "Marca", className: "bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: form.flavor, onChange: e => setForm({ ...form, flavor: e.target.value }), placeholder: "Sabor", className: "bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: form.weight, onChange: e => setForm({ ...form, weight: e.target.value }), placeholder: "Peso / Tamanho", className: "bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: form.ingredients, onChange: e => setForm({ ...form, ingredients: e.target.value }), placeholder: "Ingredientes", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: form.nutritional_info, onChange: e => setForm({ ...form, nutritional_info: e.target.value }), placeholder: "Informa\u00E7\u00E3o nutricional", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), (0, jsx_runtime_1.jsx)("textarea", { value: form.usage_instructions, onChange: e => setForm({ ...form, usage_instructions: e.target.value }), rows: 2, placeholder: "Como usar / consumo", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500] resize-none" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2", children: [(0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: saving, className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 disabled:opacity-50", children: saving ? 'Salvando...' : editing ? 'Salvar' : 'Criar produto' }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => { setShowForm(false); setEditing(null); }, className: "bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-medium rounded-lg px-4 py-2", children: "Cancelar" })] })] })), loading ? ((0, jsx_runtime_1.jsx)("div", { className: "flex justify-center py-12", children: (0, jsx_runtime_1.jsx)("div", { className: "w-6 h-6 border-2 border-zinc-700 border-t-[#FFE500] rounded-full animate-spin" }) })) : products.length === 0 ? ((0, jsx_runtime_1.jsxs)("div", { className: "text-center py-12", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Package, { size: 40, className: "mx-auto text-zinc-700 mb-3" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-sm", children: "Nenhum produto criado." })] })) : ((0, jsx_runtime_1.jsx)("div", { className: "space-y-2", children: [...products].sort((a, b) => a.sort_order - b.sort_order).map((p, i, arr) => ((0, jsx_runtime_1.jsx)("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-3", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [p.image_url ? (0, jsx_runtime_1.jsx)("img", { src: p.image_url, alt: p.name, className: "w-12 h-12 rounded-lg object-cover" }) :
                                (0, jsx_runtime_1.jsx)("div", { className: "w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Package, { size: 20, className: "text-zinc-600" }) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1 min-w-0", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-white text-sm font-bold", children: p.name }), (0, jsx_runtime_1.jsxs)("p", { className: "text-zinc-500 text-xs", children: [catName(p.category_id), " \u2014 ", p.discount_price ? (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("span", { className: "text-green-400 font-bold", children: ["R$ ", p.discount_price.toFixed(2)] }), " ", (0, jsx_runtime_1.jsxs)("span", { className: "line-through ml-1", children: ["R$ ", p.price.toFixed(2)] })] }) : `R$ ${p.price.toFixed(2)}`] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 mt-0.5", children: [(0, jsx_runtime_1.jsxs)("span", { className: `text-xs ${p.stock > 0 ? 'text-green-400' : 'text-red-400'}`, children: ["Estoque: ", p.stock] }), (0, jsx_runtime_1.jsx)("span", { className: `text-xs ${p.active ? 'text-green-400' : 'text-zinc-500'}`, children: p.active ? 'Ativo' : 'Inativo' })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-1", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => moveProduct(p, 'up'), disabled: i === 0, className: "text-zinc-500 hover:text-[#FFE500] p-1 disabled:opacity-30", children: (0, jsx_runtime_1.jsx)(lucide_react_1.ArrowUp, { size: 14 }) }), (0, jsx_runtime_1.jsx)("button", { onClick: () => moveProduct(p, 'down'), disabled: i === arr.length - 1, className: "text-zinc-500 hover:text-[#FFE500] p-1 disabled:opacity-30", children: (0, jsx_runtime_1.jsx)(lucide_react_1.ArrowDown, { size: 14 }) }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setManagingGroups(p), className: "text-zinc-500 hover:text-[#FFE500] p-1", title: "Grupos e adicionais", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Link2, { size: 14 }) }), (0, jsx_runtime_1.jsx)("button", { onClick: () => { setEditing(p); setForm({ name: p.name, description: p.description ?? '', price: String(p.price), category_id: p.category_id ?? '', stock: String(p.stock), image: null, long_description: p.long_description ?? '', ingredients: p.ingredients ?? '', nutritional_info: p.nutritional_info ?? '', usage_instructions: p.usage_instructions ?? '', brand: p.brand ?? '', flavor: p.flavor ?? '', weight: p.weight ?? '' }); setImageUrl(p.image_url); setGalleryUrls(p.gallery_urls ?? []); setGalleryFiles([]); setVideoUrls(p.video_urls ?? []); setVideoFiles([]); setShowForm(true); }, className: "text-zinc-500 hover:text-[#FFE500] p-1", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Edit, { size: 14 }) }), (0, jsx_runtime_1.jsx)("button", { onClick: () => handleDelete(p), className: "text-zinc-500 hover:text-red-400 p-1", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { size: 14 }) })] })] }) }, p.id))) })), managingGroups && ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm", onClick: () => setManagingGroups(null), children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto", onClick: e => e.stopPropagation(), children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-white font-bold text-lg", children: "Grupos do produto" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs", children: managingGroups.name })] }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setManagingGroups(null), className: "text-zinc-400 hover:text-white", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { size: 20 }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "p-6 space-y-3", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-sm", children: "Selecione quais grupos de adicionais este produto possui:" }), groups.length === 0 ? ((0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-sm text-center py-4", children: "Nenhum grupo criado. V\u00E1 em \"Grupos e Adicionais\" para criar." })) : (groups.map(g => {
                                    const isLinked = linkedGroups(managingGroups.id).includes(g.id);
                                    return ((0, jsx_runtime_1.jsxs)("div", { className: `border rounded-lg p-3 ${isLinked ? 'border-[#FFE500]/30 bg-[#FFE500]/5' : 'border-zinc-800 bg-zinc-800/50'}`, children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-white text-sm font-bold", children: g.name }), (0, jsx_runtime_1.jsxs)("p", { className: "text-zinc-500 text-xs", children: [addonsInGroup(g.id).length, " adicional(is)"] })] }), (0, jsx_runtime_1.jsx)("button", { onClick: () => toggleLink(managingGroups.id, g.id), className: `text-sm font-bold rounded-lg px-3 py-1.5 transition-colors ${isLinked ? 'bg-[#FFE500] text-black' : 'bg-zinc-700 text-zinc-300 hover:text-white'}`, children: isLinked ? (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Unlink, { size: 14, className: "inline mr-1" }), "Remover"] }) : (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Link2, { size: 14, className: "inline mr-1" }), "Vincular"] }) })] }), isLinked && addonsInGroup(g.id).length > 0 && ((0, jsx_runtime_1.jsx)("div", { className: "mt-2 pl-3 space-y-1", children: addonsInGroup(g.id).map(a => ((0, jsx_runtime_1.jsxs)("p", { className: "text-zinc-400 text-xs", children: ["\u2022 ", a.name, " ", a.is_free ? '(Grátis)' : `R$ ${a.price.toFixed(2)}`] }, a.id))) }))] }, g.id));
                                }))] })] }) }))] }));
}

},
"/src/components/franchisee/FranchiseePromotions.tsx": function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = FranchiseePromotions;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const supabase_1 = require("@/lib/supabase");
const lucide_react_1 = require("lucide-react");
function FranchiseePromotions({ franchiseId }) {
    const [promotions, setPromotions] = (0, react_1.useState)([]);
    const [products, setProducts] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [saving, setSaving] = (0, react_1.useState)(false);
    const [showForm, setShowForm] = (0, react_1.useState)(false);
    const [editing, setEditing] = (0, react_1.useState)(null);
    const [form, setForm] = (0, react_1.useState)({ title: '', description: '', badge_text: 'PROMO', product_id: '', image: null });
    const [imageUrl, setImageUrl] = (0, react_1.useState)(null);
    const load = async () => {
        setLoading(true);
        const [{ data: promos }, { data: prods }] = await Promise.all([
            supabase_1.supabase.from('franchise_promotions').select('*').eq('franchise_id', franchiseId).order('sort_order'),
            supabase_1.supabase.from('franchise_products').select('*').eq('franchise_id', franchiseId).eq('active', true).order('name'),
        ]);
        setPromotions((promos ?? []).filter(p => p.title !== '__SUPLEMENTAAI_NATIONAL_SITE_CONFIG__'));
        setProducts((prods ?? []));
        setLoading(false);
    };
    (0, react_1.useEffect)(() => { load(); }, [franchiseId]);
    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        let img = imageUrl;
        if (form.image) {
            const ext = form.image.name.split('.').pop();
            const path = `${franchiseId}/promo-${Date.now()}.${ext}`;
            const { error } = await supabase_1.supabase.storage.from('franchise-products').upload(path, form.image);
            if (!error)
                img = supabase_1.supabase.storage.from('franchise-products').getPublicUrl(path).data.publicUrl;
        }
        const payload = {
            franchise_id: franchiseId,
            title: form.title,
            description: form.description || null,
            badge_text: form.badge_text || 'PROMO',
            product_id: form.product_id || null,
            image_url: img,
            sort_order: editing?.sort_order ?? promotions.length,
            active: true,
        };
        if (editing) {
            await supabase_1.supabase.from('franchise_promotions').update(payload).eq('id', editing.id);
        }
        else {
            await supabase_1.supabase.from('franchise_promotions').insert(payload);
        }
        setForm({ title: '', description: '', badge_text: 'PROMO', product_id: '', image: null });
        setImageUrl(null);
        setEditing(null);
        setShowForm(false);
        setSaving(false);
        load();
    };
    const toggleActive = async (promo) => {
        await supabase_1.supabase.from('franchise_promotions').update({ active: !promo.active }).eq('id', promo.id);
        load();
    };
    const move = async (promo, dir) => {
        const sorted = [...promotions].sort((a, b) => a.sort_order - b.sort_order);
        const idx = sorted.findIndex(p => p.id === promo.id);
        const swapIdx = idx + dir;
        if (swapIdx < 0 || swapIdx >= sorted.length)
            return;
        const swap = sorted[swapIdx];
        await Promise.all([
            supabase_1.supabase.from('franchise_promotions').update({ sort_order: swap.sort_order }).eq('id', promo.id),
            supabase_1.supabase.from('franchise_promotions').update({ sort_order: promo.sort_order }).eq('id', swap.id),
        ]);
        load();
    };
    const remove = async (id) => {
        await supabase_1.supabase.from('franchise_promotions').delete().eq('id', id);
        load();
    };
    if (loading)
        return (0, jsx_runtime_1.jsx)("div", { className: "text-zinc-400 text-sm", children: "Carregando promo\u00E7\u00F5es..." });
    return ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-white font-bold text-lg", children: "Promo\u00E7\u00F5es" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs mt-0.5", children: "Crie promo\u00E7\u00F5es que aparecem no carrossel do seu cat\u00E1logo online" })] }), (0, jsx_runtime_1.jsxs)("button", { onClick: () => { if (editing) {
                            setEditing(null);
                            setForm({ title: '', description: '', badge_text: 'PROMO', product_id: '', image: null });
                            setImageUrl(null);
                        } setShowForm(!showForm); }, className: "flex items-center gap-2 bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 transition-colors", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { size: 16 }), " ", showForm ? 'Cancelar' : 'Nova promoção'] })] }), showForm && ((0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSave, className: "bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3", children: [(0, jsx_runtime_1.jsx)("input", { required: true, placeholder: "T\u00EDtulo da promo\u00E7\u00E3o", value: form.title, onChange: e => setForm({ ...form, title: e.target.value }), className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), (0, jsx_runtime_1.jsx)("textarea", { placeholder: "Descri\u00E7\u00E3o da promo\u00E7\u00E3o", value: form.description, onChange: e => setForm({ ...form, description: e.target.value }), rows: 2, className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500] resize-none" }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [(0, jsx_runtime_1.jsx)("input", { placeholder: "Texto do selo (ex: OFERTA, PROMO)", value: form.badge_text, onChange: e => setForm({ ...form, badge_text: e.target.value }), className: "bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), (0, jsx_runtime_1.jsxs)("select", { value: form.product_id, onChange: e => setForm({ ...form, product_id: e.target.value }), className: "bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]", children: [(0, jsx_runtime_1.jsx)("option", { value: "", children: "Sem produto vinculado" }), products.map(p => (0, jsx_runtime_1.jsx)("option", { value: p.id, children: p.name }, p.id))] })] }), (0, jsx_runtime_1.jsxs)("label", { className: "flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 cursor-pointer hover:border-[#FFE500]/50 transition-colors", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Upload, { size: 16, className: "text-zinc-400" }), (0, jsx_runtime_1.jsx)("span", { className: "text-zinc-400 text-sm", children: form.image ? form.image.name : 'Imagem do banner (opcional)' }), (0, jsx_runtime_1.jsx)("input", { type: "file", accept: "image/*", className: "hidden", onChange: e => setForm({ ...form, image: e.target.files?.[0] ?? null }) })] }), imageUrl && !form.image && (0, jsx_runtime_1.jsx)("img", { src: imageUrl, alt: "", className: "w-full h-32 object-cover rounded-lg" }), (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: saving, className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 disabled:opacity-50", children: saving ? 'Salvando...' : editing ? 'Salvar' : 'Criar promoção' })] })), promotions.length === 0 ? ((0, jsx_runtime_1.jsxs)("div", { className: "text-center py-12", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Ticket, { size: 32, className: "mx-auto text-zinc-700 mb-3" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-sm", children: "Nenhuma promo\u00E7\u00E3o criada ainda." })] })) : ((0, jsx_runtime_1.jsx)("div", { className: "space-y-2", children: promotions.sort((a, b) => a.sort_order - b.sort_order).map((promo, idx, arr) => ((0, jsx_runtime_1.jsxs)("div", { className: `bg-zinc-900 border rounded-xl p-3 flex items-center gap-3 ${promo.active ? 'border-zinc-800' : 'border-zinc-800 opacity-50'}`, children: [(0, jsx_runtime_1.jsx)("div", { className: "w-16 h-16 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0", children: promo.image_url ? (0, jsx_runtime_1.jsx)("img", { src: promo.image_url, alt: "", className: "w-full h-full object-cover" }) : (0, jsx_runtime_1.jsx)("div", { className: "w-full h-full flex items-center justify-center", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Ticket, { size: 18, className: "text-zinc-600" }) }) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1 min-w-0", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [promo.badge_text && (0, jsx_runtime_1.jsx)("span", { className: "bg-[#FFE500] text-black text-[10px] font-black px-2 py-0.5 rounded-full", children: promo.badge_text }), (0, jsx_runtime_1.jsx)("h3", { className: "text-white text-sm font-bold truncate", children: promo.title })] }), promo.description && (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-xs mt-0.5 truncate", children: promo.description })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-1", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => move(promo, -1), disabled: idx === 0, className: "text-zinc-500 hover:text-white p-1 disabled:opacity-30", children: (0, jsx_runtime_1.jsx)(lucide_react_1.ChevronUp, { size: 16 }) }), (0, jsx_runtime_1.jsx)("button", { onClick: () => move(promo, idx + 1 < arr.length ? 1 : 0), disabled: idx === arr.length - 1, className: "text-zinc-500 hover:text-white p-1 disabled:opacity-30", children: (0, jsx_runtime_1.jsx)(lucide_react_1.ChevronDown, { size: 16 }) }), (0, jsx_runtime_1.jsx)("button", { onClick: () => toggleActive(promo), className: "text-zinc-500 hover:text-[#FFE500] p-1", children: promo.active ? (0, jsx_runtime_1.jsx)(lucide_react_1.ToggleRight, { size: 18 }) : (0, jsx_runtime_1.jsx)(lucide_react_1.ToggleLeft, { size: 18 }) }), (0, jsx_runtime_1.jsx)("button", { onClick: () => { setEditing(promo); setForm({ title: promo.title, description: promo.description ?? '', badge_text: promo.badge_text ?? 'PROMO', product_id: promo.product_id ?? '', image: null }); setImageUrl(promo.image_url); setShowForm(true); }, className: "text-zinc-500 hover:text-[#FFE500] p-1", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Edit, { size: 14 }) }), (0, jsx_runtime_1.jsx)("button", { onClick: () => remove(promo.id), className: "text-zinc-500 hover:text-red-400 p-1", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { size: 14 }) })] })] }, promo.id))) }))] }));
}

},
"/src/components/franchisee/FranchiseeRanking.tsx": function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = FranchiseeRanking;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const supabase_1 = require("@/lib/supabase");
const lucide_react_1 = require("lucide-react");
function FranchiseeRanking({ franchiseId }) {
    const [ranking, setRanking] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [period, setPeriod] = (0, react_1.useState)('month');
    (0, react_1.useEffect)(() => {
        (async () => {
            const [{ data: sales }, { data: franchises }] = await Promise.all([
                supabase_1.supabase.from('sales').select('franchise_id, total, created_at'),
                supabase_1.supabase.from('franchises').select('*'),
            ]);
            if (!sales || !franchises) {
                setLoading(false);
                return;
            }
            const now = new Date();
            const filterDate = new Date();
            if (period === 'week')
                filterDate.setDate(now.getDate() - 7);
            if (period === 'month')
                filterDate.setMonth(now.getMonth() - 1);
            if (period === 'all')
                filterDate.setFullYear(2000);
            const map = new Map();
            for (const f of franchises) {
                map.set(f.id, { franchise_id: f.id, name: f.name, total: 0, count: 0, isMe: f.id === franchiseId });
            }
            for (const s of sales) {
                const d = new Date(s.created_at);
                if (d < filterDate)
                    continue;
                const entry = map.get(s.franchise_id);
                if (entry) {
                    entry.total += s.total;
                    entry.count += 1;
                }
            }
            setRanking(Array.from(map.values()).sort((a, b) => b.total - a.total));
            setLoading(false);
        })();
    }, [period, franchiseId]);
    const myPosition = ranking.findIndex(r => r.isMe) + 1;
    if (loading) {
        return (0, jsx_runtime_1.jsx)("div", { className: "flex justify-center py-12", children: (0, jsx_runtime_1.jsx)("div", { className: "w-6 h-6 border-2 border-zinc-700 border-t-[#FFE500] rounded-full animate-spin" }) });
    }
    return ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-6 flex-wrap gap-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-900 border border-[#FFE500]/30 rounded-xl p-4 flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Trophy, { size: 24, className: "text-[#FFE500]" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs", children: "Sua posi\u00E7\u00E3o" }), (0, jsx_runtime_1.jsx)("p", { className: "text-white font-bold text-lg", children: myPosition > 0 ? `${myPosition}º lugar` : '—' })] })] }), (0, jsx_runtime_1.jsx)("div", { className: "flex gap-2", children: [
                            { key: 'week', label: 'Semana' },
                            { key: 'month', label: 'Mês' },
                            { key: 'all', label: 'Geral' },
                        ].map(p => ((0, jsx_runtime_1.jsx)("button", { onClick: () => { setLoading(true); setPeriod(p.key); }, className: `text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${period === p.key ? 'bg-[#FFE500] text-black' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`, children: p.label }, p.key))) })] }), ranking.length === 0 || ranking.every(r => r.total === 0) ? ((0, jsx_runtime_1.jsxs)("div", { className: "text-center py-12", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.TrendingUp, { size: 40, className: "mx-auto text-zinc-700 mb-3" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-sm", children: "Sem dados de vendas ainda." })] })) : ((0, jsx_runtime_1.jsx)("div", { className: "space-y-2", children: ranking.map((entry, i) => ((0, jsx_runtime_1.jsxs)("div", { className: `flex items-center gap-3 border rounded-lg p-4 transition-colors ${entry.isMe ? 'border-[#FFE500] bg-[#FFE500]/5' : 'border-zinc-800 bg-zinc-900'}`, children: [(0, jsx_runtime_1.jsx)("div", { className: `w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg ${i < 3 ? 'bg-[#FFE500]/20 text-[#FFE500]' : 'bg-zinc-800 text-zinc-500'}`, children: i + 1 }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1", children: [(0, jsx_runtime_1.jsxs)("p", { className: `font-bold text-sm ${entry.isMe ? 'text-[#FFE500]' : 'text-white'}`, children: [entry.name, " ", entry.isMe && '(Você)'] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-zinc-500 text-xs", children: [entry.count, " vendas"] })] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-[#FFE500] font-bold text-lg", children: ["R$ ", entry.total.toFixed(2)] })] }, entry.franchise_id))) }))] }));
}

},
"/src/components/franchisee/MtDeliveryModal.tsx": function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMtMeta = getMtMeta;
exports.withoutMtMeta = withoutMtMeta;
exports.default = MtDeliveryModal;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const lucide_react_1 = require("lucide-react");
const supabase_1 = require("@/lib/supabase");
const MT_TAG = /\n?\[\[MT_ENTREGAS:([^\]]+)\]\]\s*$/s;
function getMtMeta(notes) {
    const match = String(notes ?? '').match(MT_TAG);
    if (!match)
        return null;
    try {
        return JSON.parse(decodeURIComponent(match[1]));
    }
    catch {
        return null;
    }
}
function withoutMtMeta(notes) {
    return String(notes ?? '').replace(MT_TAG, '').trim();
}
function withMtMeta(notes, meta) {
    const clean = withoutMtMeta(notes);
    const tag = `[[MT_ENTREGAS:${encodeURIComponent(JSON.stringify(meta))}]]`;
    return clean ? `${clean}\n${tag}` : tag;
}
const PAYMENT_OPTIONS = [
    { value: 'D', label: 'Dinheiro' },
    { value: 'B', label: 'Débito' },
    { value: 'C', label: 'Crédito' },
    { value: 'X', label: 'PIX' },
    { value: 'P', label: 'PicPay' },
    { value: 'H', label: 'WhatsApp' },
    { value: 'F', label: 'Faturado' },
    { value: 'R', label: 'Carteira de créditos' },
];
const PAYMENT_FROM_ORDER = {
    cash: 'D',
    debit_card: 'B',
    credit_card: 'C',
    pix: 'X',
};
function parseCityState(value) {
    const match = value.trim().match(/^(.+?)(?:\s*[-/]\s*)([A-Za-z]{2})$/);
    if (!match)
        return { city: '', state: '' };
    return { city: match[1].trim(), state: match[2].toUpperCase() };
}
function parseAddress(raw, fallbackCity = '', fallbackState = '') {
    const parts = String(raw ?? '').split(',').map(p => p.trim()).filter(Boolean);
    let city = fallbackCity;
    let state = fallbackState;
    let neighborhood = '';
    let address = String(raw ?? '').trim();
    if (parts.length >= 4) {
        const tail = parseCityState(parts[parts.length - 1]);
        if (tail.city) {
            city = tail.city;
            state = tail.state;
            neighborhood = parts[parts.length - 2];
            address = parts.slice(0, -2).join(', ');
        }
        else {
            neighborhood = parts[parts.length - 1];
            address = parts.slice(0, -1).join(', ');
        }
    }
    else if (parts.length >= 3) {
        neighborhood = parts[parts.length - 1];
        address = parts.slice(0, -1).join(', ');
    }
    return { address, neighborhood, city, state };
}
function errorMessage(data, fallback) {
    if (!data)
        return fallback;
    if (typeof data.error === 'string')
        return data.error;
    if (typeof data.message === 'string')
        return data.message;
    if (Array.isArray(data.errors) && data.errors.length)
        return data.errors.join(', ');
    if (Array.isArray(data.mensagens) && data.mensagens.length)
        return data.mensagens.join(', ');
    return fallback;
}
function findDeliveryId(data) {
    const direct = data?.id_mch ?? data?.delivery_id ?? data?.solicitacao_id ?? data?.data?.id_mch ?? data?.data?.delivery_id ?? data?.data?.id;
    if (direct !== undefined && direct !== null && String(direct).trim())
        return String(direct);
    if (data && typeof data === 'object') {
        for (const value of Object.values(data)) {
            if (value && typeof value === 'object') {
                const nested = findDeliveryId(value);
                if (nested)
                    return nested;
            }
        }
    }
    return null;
}
function findTrackingUrl(data) {
    const candidates = [
        data?.tracking_url,
        data?.link_rastreio,
        data?.link,
        data?.url,
        data?.data?.tracking_url,
        data?.data?.link_rastreio,
        data?.data?.link,
        data?.data?.url,
    ];
    for (const value of candidates) {
        if (typeof value === 'string' && /^https?:\/\//i.test(value))
            return value;
    }
    if (data && typeof data === 'object') {
        for (const value of Object.values(data)) {
            if (value && typeof value === 'object') {
                const nested = findTrackingUrl(value);
                if (nested)
                    return nested;
            }
        }
    }
    return null;
}
function quoteDetails(data) {
    const source = data?.data?.estimativa ?? data?.estimativa ?? data?.data ?? data ?? {};
    return {
        price: source?.estimativa_valor ?? source?.valor ?? source?.preco ?? source?.valor_estimado ?? null,
        minutes: source?.estimativa_tempo_minutos ?? source?.tempo_minutos ?? source?.tempo ?? null,
        km: source?.estimativa_km ?? source?.km ?? source?.distancia ?? null,
    };
}
function money(value) {
    const n = Number(String(value ?? '').replace(',', '.'));
    return Number.isFinite(n) ? `R$ ${n.toFixed(2).replace('.', ',')}` : null;
}
function MtDeliveryModal({ order, franchiseId, onClose, onSuccess }) {
    const existingMeta = getMtMeta(order.notes);
    const [settings, setSettings] = (0, react_1.useState)(null);
    const [loadingSettings, setLoadingSettings] = (0, react_1.useState)(true);
    const [paymentMethod, setPaymentMethod] = (0, react_1.useState)(existingMeta?.payment || PAYMENT_FROM_ORDER[order.payment_method ?? ''] || 'X');
    const [showAddress, setShowAddress] = (0, react_1.useState)(false);
    const [quoteLoading, setQuoteLoading] = (0, react_1.useState)(false);
    const [requesting, setRequesting] = (0, react_1.useState)(false);
    const [quote, setQuote] = (0, react_1.useState)(null);
    const [error, setError] = (0, react_1.useState)('');
    const [result, setResult] = (0, react_1.useState)(null);
    const [location, setLocation] = (0, react_1.useState)({
        pickupAddress: '',
        pickupNeighborhood: '',
        pickupCity: '',
        pickupState: '',
        deliveryAddress: order.address ?? '',
        deliveryNeighborhood: '',
        deliveryCity: '',
        deliveryState: '',
        deliveryReference: order.customer_reference ?? '',
    });
    const credentialsReady = Boolean(settings?.mt_entregas_username && settings?.mt_entregas_password);
    const addressReady = Boolean(location.pickupAddress &&
        (settings?.latitude != null && settings?.longitude != null ? true : location.pickupNeighborhood) &&
        location.pickupCity && location.pickupState &&
        location.deliveryAddress && location.deliveryNeighborhood && location.deliveryCity && location.deliveryState);
    const callMt = async (action, payload) => {
        if (!settings?.mt_entregas_username || !settings?.mt_entregas_password) {
            throw new Error('As credenciais da MT Entregas não estão preenchidas em Delivery.');
        }
        const { data: sessionData } = await supabase_1.supabase.auth.getSession();
        const token = sessionData.session?.access_token;
        const response = await fetch(`${"https://sgvojdgbjvynnoherpqj.supabase.co"}/functions/v1/mt-entregas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNndm9qZGdianZ5bm5vaGVycHFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3NDE4ODIsImV4cCI6MjEwMTMxNzg4Mn0.RuAHGD0VCcDxIL4jfSFXjyiC4ZzVgRAZna3j80ovIf4",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
                action,
                payload: {
                    ...payload,
                    basic_auth: {
                        username: settings.mt_entregas_username,
                        password: settings.mt_entregas_password,
                    },
                },
            }),
        });
        const data = await response.json().catch(() => ({}));
        return { response, data };
    };
    (0, react_1.useEffect)(() => {
        let active = true;
        (async () => {
            setLoadingSettings(true);
            setError('');
            const [{ data, error: loadError }, { data: fiscalData }] = await Promise.all([
                supabase_1.supabase.from('delivery_settings').select('*').eq('franchise_id', franchiseId).maybeSingle(),
                supabase_1.supabase.from('fiscal_settings').select('address, city, uf').eq('franchise_id', franchiseId).maybeSingle(),
            ]);
            if (!active)
                return;
            if (loadError || !data) {
                setError(loadError?.message || 'Configurações de delivery não encontradas.');
                setLoadingSettings(false);
                return;
            }
            const s = data;
            setSettings(s);
            const savedRaw = localStorage.getItem(`mt-entregas-location:${franchiseId}`);
            let saved = {};
            try {
                saved = savedRaw ? JSON.parse(savedRaw) : {};
            }
            catch {
                saved = {};
            }
            const fiscal = fiscalData;
            const storeRawAddress = s.address || fiscal?.address || '';
            const storeParsed = parseAddress(storeRawAddress, fiscal?.city || saved.city || '', fiscal?.uf || saved.state || '');
            const inferredCity = storeParsed.city || fiscal?.city || saved.city || '';
            const inferredState = storeParsed.state || fiscal?.uf || saved.state || '';
            const deliveryParsed = parseAddress(order.address, inferredCity, inferredState);
            setLocation({
                pickupAddress: storeParsed.address || storeRawAddress,
                pickupNeighborhood: storeParsed.neighborhood || saved.pickupNeighborhood || '',
                pickupCity: inferredCity,
                pickupState: inferredState,
                deliveryAddress: deliveryParsed.address || order.address || '',
                deliveryNeighborhood: deliveryParsed.neighborhood || '',
                deliveryCity: deliveryParsed.city || inferredCity,
                deliveryState: deliveryParsed.state || inferredState,
                deliveryReference: order.customer_reference ?? '',
            });
            if (!inferredCity || !inferredState || !deliveryParsed.neighborhood)
                setShowAddress(true);
            setLoadingSettings(false);
        })();
        return () => { active = false; };
    }, [franchiseId, order.address, order.customer_reference]);
    const loadQuote = async () => {
        if (!settings)
            return;
        if (!credentialsReady) {
            setError('Ative e preencha o login e a senha da MT Entregas em Delivery.');
            return;
        }
        if (!addressReady) {
            setShowAddress(true);
            setError('Confira os dados de coleta e destino destacados antes de calcular.');
            return;
        }
        setQuoteLoading(true);
        setQuote(null);
        setError('');
        try {
            localStorage.setItem(`mt-entregas-location:${franchiseId}`, JSON.stringify({
                city: location.pickupCity,
                state: location.pickupState,
                pickupNeighborhood: location.pickupNeighborhood,
            }));
            const { response, data } = await callMt('quote', {
                pickup_address: location.pickupAddress,
                pickup_neighborhood: location.pickupNeighborhood,
                pickup_city: location.pickupCity,
                pickup_state: location.pickupState,
                pickup_lat: settings.latitude,
                pickup_lng: settings.longitude,
                delivery_address: location.deliveryAddress,
                delivery_neighborhood: location.deliveryNeighborhood,
                delivery_city: location.deliveryCity,
                delivery_state: location.deliveryState,
                category_id: settings.mt_entregas_category_id ?? undefined,
            });
            if (!response.ok || data?.success === false)
                throw new Error(errorMessage(data, 'A MT Entregas não aceitou os dados para estimativa.'));
            setQuote(data);
        }
        catch (err) {
            setError(err?.message || 'Não foi possível consultar a estimativa da MT Entregas.');
        }
        finally {
            setQuoteLoading(false);
        }
    };
    (0, react_1.useEffect)(() => {
        if (!loadingSettings && settings && credentialsReady && addressReady && !quote && !quoteLoading) {
            loadQuote();
        }
        // Carrega automaticamente somente quando todos os dados já estão prontos.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loadingSettings]);
    const details = (0, react_1.useMemo)(() => quoteDetails(quote), [quote]);
    const requestDelivery = async () => {
        if (!settings || !quote) {
            setError('Calcule e valide a estimativa antes de solicitar o motoboy.');
            return;
        }
        if (!addressReady) {
            setShowAddress(true);
            setError('Confira o endereço antes de solicitar.');
            return;
        }
        const originalNotes = order.notes;
        const previous = getMtMeta(originalNotes);
        if (previous?.status === 'requesting' || previous?.status === 'ambiguous' || previous?.id) {
            setError('Este pedido já possui uma solicitação MT registrada ou em processamento.');
            return;
        }
        const requestedAt = new Date().toISOString();
        const lockNotes = withMtMeta(originalNotes, { status: 'requesting', requestedAt, payment: paymentMethod });
        setRequesting(true);
        setError('');
        try {
            let lockQuery = supabase_1.supabase.from('customer_orders')
                .update({ notes: lockNotes })
                .eq('id', order.id)
                .eq('franchise_id', franchiseId);
            lockQuery = originalNotes == null ? lockQuery.is('notes', null) : lockQuery.eq('notes', originalNotes);
            const { data: locked, error: lockError } = await lockQuery.select('id').maybeSingle();
            if (lockError)
                throw new Error(`Não foi possível bloquear o pedido para evitar duplicidade: ${lockError.message}`);
            if (!locked)
                throw new Error('O pedido foi alterado em outra tela. Atualize a lista antes de solicitar o motoboy.');
            let response;
            let data;
            try {
                const call = await callMt('create_delivery', {
                    payment_method: paymentMethod,
                    company_id: settings.mt_entregas_company_id ?? undefined,
                    category_id: settings.mt_entregas_category_id ?? undefined,
                    pickup: {
                        address: location.pickupAddress,
                        neighborhood: location.pickupNeighborhood,
                        city: location.pickupCity,
                        state: location.pickupState,
                        reference: 'Coleta Suplementaai',
                        lat: settings.latitude,
                        lng: settings.longitude,
                    },
                    stops: [{
                            address: location.deliveryAddress,
                            neighborhood: location.deliveryNeighborhood,
                            city: location.deliveryCity,
                            state: location.deliveryState,
                            reference: location.deliveryReference,
                            external_id: order.id,
                            notes: `Pedido ${order.id.slice(0, 8).toUpperCase()} - ${Array.isArray(order.items) ? order.items.map((item) => `${item.quantity || 1}x ${item.name}`).join('; ') : ''}`,
                            customer_name: order.customer_name,
                            customer_phone: order.customer_phone || '',
                            amount_to_collect: 0,
                        }],
                    with_return: false,
                });
                response = call.response;
                data = call.data;
            }
            catch (networkError) {
                const ambiguousNotes = withMtMeta(originalNotes, {
                    status: 'ambiguous',
                    requestedAt,
                    payment: paymentMethod,
                    error: 'A conexão caiu antes da confirmação. Verifique a central MT antes de tentar novamente.',
                });
                await supabase_1.supabase.from('customer_orders').update({ notes: ambiguousNotes }).eq('id', order.id).eq('notes', lockNotes);
                throw new Error('A conexão caiu antes de confirmar a resposta da MT. Por segurança, uma nova chamada ficou bloqueada. Confira a central da MT Entregas antes de tentar novamente.');
            }
            if (!response.ok || data?.success === false) {
                const message = errorMessage(data, `A MT Entregas recusou a solicitação (${response.status}).`);
                const failedNotes = withMtMeta(originalNotes, { status: 'failed', requestedAt, payment: paymentMethod, error: message.slice(0, 240) });
                await supabase_1.supabase.from('customer_orders').update({ notes: failedNotes }).eq('id', order.id).eq('notes', lockNotes);
                throw new Error(message);
            }
            const deliveryId = findDeliveryId(data);
            if (!deliveryId) {
                const ambiguousNotes = withMtMeta(originalNotes, {
                    status: 'ambiguous', requestedAt, payment: paymentMethod,
                    error: 'A MT respondeu sem id_mch. Verifique a central antes de reenviar.',
                });
                await supabase_1.supabase.from('customer_orders').update({ notes: ambiguousNotes }).eq('id', order.id).eq('notes', lockNotes);
                throw new Error('A MT confirmou a chamada, mas não retornou o identificador da entrega. Por segurança, não solicite novamente antes de conferir a central MT Entregas.');
            }
            let tracking = findTrackingUrl(data);
            if (!tracking) {
                try {
                    const trackCall = await callMt('tracking_link', { delivery_id: deliveryId });
                    if (trackCall.response.ok)
                        tracking = findTrackingUrl(trackCall.data);
                }
                catch {
                    // O motoboy já foi solicitado; rastreio é complementar.
                }
            }
            const finalNotes = withMtMeta(originalNotes, {
                status: 'created', id: deliveryId, tracking: tracking || undefined,
                requestedAt, payment: paymentMethod,
            });
            const { data: saved, error: saveError } = await supabase_1.supabase.from('customer_orders')
                .update({ notes: finalNotes, status: order.status === 'ready' ? 'delivering' : order.status })
                .eq('id', order.id)
                .eq('notes', lockNotes)
                .select('id')
                .maybeSingle();
            if (saveError || !saved) {
                throw new Error(`A entrega #${deliveryId} foi criada na MT, mas o vínculo não pôde ser salvo no pedido. NÃO SOLICITE NOVAMENTE. Confira a central da MT. ${saveError?.message ?? ''}`.trim());
            }
            setResult({ deliveryId, tracking });
            await onSuccess();
        }
        catch (err) {
            setError(err?.message || 'Não foi possível solicitar o motoboy.');
        }
        finally {
            setRequesting(false);
        }
    };
    if (result) {
        return ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm", onClick: onClose, children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-900 border border-green-500/30 rounded-2xl w-full max-w-md p-6", onClick: e => e.stopPropagation(), children: [(0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle2, { size: 46, className: "text-green-400 mx-auto mb-3" }), (0, jsx_runtime_1.jsx)("h3", { className: "text-white font-bold text-xl text-center", children: "Motoboy solicitado" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-sm text-center mt-2", children: "A MT Entregas confirmou a solicita\u00E7\u00E3o real." }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-800/70 border border-zinc-700 rounded-xl p-4 mt-4 text-center", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs", children: "ID da entrega MT" }), (0, jsx_runtime_1.jsxs)("p", { className: "text-[#FFE500] font-bold text-lg", children: ["#", result.deliveryId] })] }), result.tracking && ((0, jsx_runtime_1.jsxs)("a", { href: result.tracking, target: "_blank", rel: "noreferrer", className: "mt-3 w-full bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg py-2.5 flex items-center justify-center gap-2 text-sm font-bold", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ExternalLink, { size: 15 }), " Abrir rastreio"] })), (0, jsx_runtime_1.jsx)("button", { onClick: onClose, className: "mt-3 w-full bg-[#FFE500] hover:bg-[#FFD000] text-black font-bold rounded-lg py-2.5", children: "Fechar" })] }) }));
    }
    return ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm", onClick: onClose, children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto", onClick: e => e.stopPropagation(), children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between p-5 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("h3", { className: "text-white font-bold text-lg flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Bike, { size: 20, className: "text-[#FFE500]" }), " Solicitar motoboy"] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-zinc-500 text-xs", children: ["Pedido #", order.id.slice(0, 8).toUpperCase()] })] }), (0, jsx_runtime_1.jsx)("button", { onClick: onClose, className: "text-zinc-400 hover:text-white", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { size: 20 }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "p-5 space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-800/60 border border-zinc-700 rounded-xl p-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between gap-3", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs", children: "Cliente" }), (0, jsx_runtime_1.jsx)("p", { className: "text-white font-bold", children: order.customer_name }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-xs mt-0.5", children: order.customer_phone || 'Sem telefone' })] }), (0, jsx_runtime_1.jsxs)("div", { className: "text-right", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs", children: "Pedido" }), (0, jsx_runtime_1.jsxs)("p", { className: "text-[#FFE500] font-bold", children: ["R$ ", Number(order.total).toFixed(2).replace('.', ',')] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-3 pt-3 border-t border-zinc-700", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs", children: "Destino preenchido" }), (0, jsx_runtime_1.jsxs)("p", { className: "text-white text-sm flex gap-1.5 mt-1", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.MapPin, { size: 14, className: "text-orange-400 shrink-0 mt-0.5" }), " ", location.deliveryAddress || 'Endereço não informado'] }), location.deliveryNeighborhood && (0, jsx_runtime_1.jsxs)("p", { className: "text-zinc-400 text-xs ml-5", children: [location.deliveryNeighborhood, location.deliveryCity ? ` — ${location.deliveryCity}/${location.deliveryState}` : ''] })] })] }), loadingSettings ? ((0, jsx_runtime_1.jsxs)("div", { className: "text-zinc-400 text-sm flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Loader2, { size: 16, className: "animate-spin" }), " Carregando integra\u00E7\u00E3o MT..."] })) : !settings?.mt_entregas_enabled ? ((0, jsx_runtime_1.jsx)("div", { className: "bg-orange-500/10 border border-orange-500/25 rounded-lg p-3 text-orange-200 text-xs", children: "A integra\u00E7\u00E3o MT Entregas est\u00E1 desativada em Delivery." })) : !credentialsReady ? ((0, jsx_runtime_1.jsx)("div", { className: "bg-red-500/10 border border-red-500/25 rounded-lg p-3 text-red-300 text-xs", children: "Preencha login e senha da MT Entregas em Delivery antes de solicitar." })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1.5", children: "Forma de pagamento na MT Entregas" }), (0, jsx_runtime_1.jsx)("select", { value: paymentMethod, onChange: e => setPaymentMethod(e.target.value), className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#FFE500]", children: PAYMENT_OPTIONS.map(option => (0, jsx_runtime_1.jsx)("option", { value: option.value, children: option.label }, option.value)) })] }), (0, jsx_runtime_1.jsx)("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-xl p-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between gap-3", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-white text-sm font-bold", children: "Estimativa MT Entregas" }), quoteLoading ? ((0, jsx_runtime_1.jsxs)("p", { className: "text-zinc-500 text-xs mt-1 flex items-center gap-1.5", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Loader2, { size: 12, className: "animate-spin" }), " Consultando..."] })) : quote ? ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-wrap gap-x-4 gap-y-1 mt-1", children: [money(details.price) && (0, jsx_runtime_1.jsx)("span", { className: "text-green-400 text-sm font-bold", children: money(details.price) }), details.minutes != null && (0, jsx_runtime_1.jsxs)("span", { className: "text-zinc-400 text-xs", children: ["~", details.minutes, " min"] }), details.km != null && (0, jsx_runtime_1.jsxs)("span", { className: "text-zinc-400 text-xs", children: [details.km, " km"] }), details.price == null && details.minutes == null && (0, jsx_runtime_1.jsx)("span", { className: "text-green-400 text-xs", children: "Dados aceitos pela MT" })] })) : ((0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs mt-1", children: "Aguardando valida\u00E7\u00E3o." }))] }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: loadQuote, disabled: quoteLoading || requesting, className: "text-zinc-400 hover:text-[#FFE500] p-2 disabled:opacity-50", title: "Recalcular", children: (0, jsx_runtime_1.jsx)(lucide_react_1.RefreshCw, { size: 16, className: quoteLoading ? 'animate-spin' : '' }) })] }) }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setShowAddress(value => !value), className: "text-[#FFE500] text-xs font-bold hover:underline", children: showAddress ? 'Ocultar dados de endereço' : 'Conferir/corrigir endereço' }), showAddress && ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-3 border border-zinc-800 rounded-xl p-4", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-white text-xs font-bold", children: "Coleta (loja)" }), (0, jsx_runtime_1.jsx)("input", { value: location.pickupAddress, onChange: e => setLocation({ ...location, pickupAddress: e.target.value }), placeholder: "Endere\u00E7o da loja", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-2", children: [(0, jsx_runtime_1.jsx)("input", { value: location.pickupNeighborhood, onChange: e => setLocation({ ...location, pickupNeighborhood: e.target.value }), placeholder: "Bairro", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), (0, jsx_runtime_1.jsx)("input", { value: location.pickupCity, onChange: e => setLocation({ ...location, pickupCity: e.target.value, deliveryCity: location.deliveryCity || e.target.value }), placeholder: "Cidade", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), (0, jsx_runtime_1.jsx)("input", { value: location.pickupState, maxLength: 2, onChange: e => { const state = e.target.value.toUpperCase(); setLocation({ ...location, pickupState: state, deliveryState: location.deliveryState || state }); }, placeholder: "UF", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), (0, jsx_runtime_1.jsx)("p", { className: "text-white text-xs font-bold pt-2", children: "Destino (cliente)" }), (0, jsx_runtime_1.jsx)("input", { value: location.deliveryAddress, onChange: e => setLocation({ ...location, deliveryAddress: e.target.value }), placeholder: "Rua e n\u00FAmero", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-2", children: [(0, jsx_runtime_1.jsx)("input", { value: location.deliveryNeighborhood, onChange: e => setLocation({ ...location, deliveryNeighborhood: e.target.value }), placeholder: "Bairro", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), (0, jsx_runtime_1.jsx)("input", { value: location.deliveryCity, onChange: e => setLocation({ ...location, deliveryCity: e.target.value }), placeholder: "Cidade", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), (0, jsx_runtime_1.jsx)("input", { value: location.deliveryState, maxLength: 2, onChange: e => setLocation({ ...location, deliveryState: e.target.value.toUpperCase() }), placeholder: "UF", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), (0, jsx_runtime_1.jsx)("input", { value: location.deliveryReference, onChange: e => setLocation({ ...location, deliveryReference: e.target.value }), placeholder: "Refer\u00EAncia (opcional)", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), (0, jsx_runtime_1.jsxs)("button", { type: "button", onClick: loadQuote, disabled: quoteLoading || !addressReady, className: "w-full bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-bold rounded-lg py-2 flex items-center justify-center gap-2 disabled:opacity-50", children: [quoteLoading ? (0, jsx_runtime_1.jsx)(lucide_react_1.Loader2, { size: 15, className: "animate-spin" }) : (0, jsx_runtime_1.jsx)(lucide_react_1.RefreshCw, { size: 15 }), " Validar endere\u00E7o e recalcular"] })] })), error && (0, jsx_runtime_1.jsx)("div", { className: "bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-300 text-xs", children: error }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-orange-500/10 border border-orange-500/25 rounded-xl p-3 flex gap-2.5", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.AlertTriangle, { size: 17, className: "text-orange-400 shrink-0 mt-0.5" }), (0, jsx_runtime_1.jsxs)("p", { className: "text-orange-200/90 text-xs", children: [(0, jsx_runtime_1.jsx)("strong", { children: "Aten\u00E7\u00E3o:" }), " o bot\u00E3o abaixo envia uma solicita\u00E7\u00E3o REAL para a MT Entregas. Um motoboy poder\u00E1 ser acionado e a opera\u00E7\u00E3o poder\u00E1 gerar cobran\u00E7a."] })] }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: requestDelivery, disabled: requesting || quoteLoading || !quote || !addressReady, className: "w-full bg-[#FFE500] hover:bg-[#FFD000] text-black font-bold rounded-xl py-3 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed", children: requesting ? (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Loader2, { size: 18, className: "animate-spin" }), " Enviando para a MT..."] }) : (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Bike, { size: 18 }), " SOLICITAR MOTOBOY AGORA"] }) })] })), error && (loadingSettings || !settings?.mt_entregas_enabled || !credentialsReady) && ((0, jsx_runtime_1.jsx)("div", { className: "bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-300 text-xs", children: error }))] })] }) }));
}

},
"/src/components/franchisee/PrintableComanda.tsx": function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PrintableComanda;
const jsx_runtime_1 = require("react/jsx-runtime");
const lucide_react_1 = require("lucide-react");
const PAYMENT_LABELS = {
    pix: 'PIX', credit_card: 'Cartão de Crédito', debit_card: 'Cartão de Débito', cash: 'Dinheiro', meal_voucher: 'Vale-refeição',
};
const STATUS_LABELS = {
    pending: 'Pendente', accepted: 'Aceito', preparing: 'Em andamento', ready: 'Pronto', delivering: 'Em entrega', pickup: 'Pode retirar', delivered: 'Entregue', cancelled: 'Cancelado',
};
function PrintableComanda({ order, franchise, onClose }) {
    const handlePrint = () => window.print();
    return ((0, jsx_runtime_1.jsxs)("div", { className: "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto", onClick: onClose, children: [(0, jsx_runtime_1.jsxs)("div", { className: "my-8", onClick: e => e.stopPropagation(), children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-3 no-print", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-white font-bold text-sm", children: "Comanda para impress\u00E3o" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2", children: [(0, jsx_runtime_1.jsxs)("button", { onClick: handlePrint, className: "bg-[#FFE500] hover:bg-[#FFD000] text-black font-bold rounded-lg px-4 py-2 text-sm flex items-center gap-2 transition-colors", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Printer, { size: 16 }), " Imprimir"] }), (0, jsx_runtime_1.jsxs)("button", { onClick: onClose, className: "bg-zinc-800 text-zinc-300 hover:text-white rounded-lg px-3 py-2 text-sm flex items-center gap-1", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.X, { size: 16 }), " Fechar"] })] })] }), (0, jsx_runtime_1.jsxs)("div", { id: "comanda-print", className: "bg-white text-black mx-auto", style: { width: '302px', padding: '12px', fontFamily: '"Courier New", monospace', fontSize: '12px', lineHeight: '1.4' }, children: [(0, jsx_runtime_1.jsxs)("div", { className: "text-center border-b border-dashed border-black pb-2 mb-2", children: [franchise.logo_url && (0, jsx_runtime_1.jsx)("img", { src: franchise.logo_url, alt: "Logo", className: "mx-auto mb-1", style: { maxWidth: '180px', maxHeight: '60px', objectFit: 'contain' } }), (0, jsx_runtime_1.jsx)("p", { className: "font-bold text-sm uppercase tracking-wide", children: franchise.name }), (0, jsx_runtime_1.jsx)("p", { className: "text-[10px] text-gray-600", children: "CAT\u00C1LOGO ONLINE" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mb-2 text-[11px]", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between", children: [(0, jsx_runtime_1.jsx)("span", { children: "Pedido:" }), (0, jsx_runtime_1.jsxs)("span", { className: "font-bold", children: ["#", order.id.slice(0, 8).toUpperCase()] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between", children: [(0, jsx_runtime_1.jsx)("span", { children: "Data:" }), (0, jsx_runtime_1.jsx)("span", { children: new Date(order.created_at).toLocaleString('pt-BR') })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between", children: [(0, jsx_runtime_1.jsx)("span", { children: "Tipo:" }), (0, jsx_runtime_1.jsx)("span", { className: "font-bold", children: order.order_mode === 'pickup' ? 'RETIRADA' : 'ENTREGA' })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between", children: [(0, jsx_runtime_1.jsx)("span", { children: "Status:" }), (0, jsx_runtime_1.jsx)("span", { className: "font-bold", children: STATUS_LABELS[order.status] ?? order.status })] })] }), (0, jsx_runtime_1.jsx)("div", { className: "border-t border-dashed border-black mb-2" }), (0, jsx_runtime_1.jsxs)("div", { className: "mb-2 text-[11px]", children: [(0, jsx_runtime_1.jsx)("p", { className: "font-bold underline", children: "CLIENTE" }), (0, jsx_runtime_1.jsx)("p", { children: order.customer_name }), order.customer_phone && (0, jsx_runtime_1.jsxs)("p", { children: ["Tel: ", order.customer_phone] }), order.order_mode === 'delivery' && order.address && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("p", { className: "font-bold mt-1", children: "ENTREGA:" }), (0, jsx_runtime_1.jsx)("p", { children: order.address }), order.customer_reference && (0, jsx_runtime_1.jsxs)("p", { children: ["Ref: ", order.customer_reference] })] })), order.order_mode === 'pickup' && ((0, jsx_runtime_1.jsx)("p", { className: "font-bold mt-1", children: "RETIRADA NO LOCAL" }))] }), (0, jsx_runtime_1.jsx)("div", { className: "border-t border-dashed border-black mb-2" }), (0, jsx_runtime_1.jsxs)("div", { className: "mb-2", children: [(0, jsx_runtime_1.jsx)("p", { className: "font-bold underline text-[11px]", children: "ITENS" }), Array.isArray(order.items) && order.items.map((item, i) => ((0, jsx_runtime_1.jsxs)("div", { className: "mb-1", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between", children: [(0, jsx_runtime_1.jsxs)("span", { className: "font-bold", children: [item.quantity, "x ", item.name] }), (0, jsx_runtime_1.jsxs)("span", { children: ["R$ ", (item.price * item.quantity).toFixed(2)] })] }), item.addons && item.addons.length > 0 && item.addons.map((a, j) => ((0, jsx_runtime_1.jsxs)("p", { className: "pl-3 text-[10px] text-gray-700", children: ["+ ", a.name, a.price > 0 && ` (R$ ${a.price.toFixed(2)})`] }, j)))] }, i)))] }), (0, jsx_runtime_1.jsx)("div", { className: "border-t border-dashed border-black mb-2" }), (0, jsx_runtime_1.jsxs)("div", { className: "text-[11px] space-y-0.5", children: [order.subtotal > 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between", children: [(0, jsx_runtime_1.jsx)("span", { children: "Subtotal:" }), (0, jsx_runtime_1.jsxs)("span", { children: ["R$ ", order.subtotal.toFixed(2)] })] })), (order.coupon_discount ?? 0) > 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between", children: [(0, jsx_runtime_1.jsxs)("span", { children: ["Cupom", order.coupon_code ? ` (${order.coupon_code})` : '', ":"] }), (0, jsx_runtime_1.jsxs)("span", { children: ["- R$ ", (order.coupon_discount ?? 0).toFixed(2)] })] })), order.discount_amount > 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between", children: [(0, jsx_runtime_1.jsxs)("span", { children: ["Desconto PIX (", order.pix_discount_percent ?? 0, "%):"] }), (0, jsx_runtime_1.jsxs)("span", { children: ["- R$ ", order.discount_amount.toFixed(2)] })] })), order.delivery_fee > 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between", children: [(0, jsx_runtime_1.jsx)("span", { children: "Taxa de entrega:" }), (0, jsx_runtime_1.jsxs)("span", { children: ["R$ ", order.delivery_fee.toFixed(2)] })] })), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between font-bold text-sm border-t border-black pt-1 mt-1", children: [(0, jsx_runtime_1.jsx)("span", { children: "TOTAL:" }), (0, jsx_runtime_1.jsxs)("span", { children: ["R$ ", order.total.toFixed(2)] })] }), order.payment_method && ((0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between mt-1", children: [(0, jsx_runtime_1.jsx)("span", { children: "Pagamento:" }), (0, jsx_runtime_1.jsx)("span", { className: "font-bold", children: PAYMENT_LABELS[order.payment_method] ?? order.payment_method })] }))] }), order.notes && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { className: "border-t border-dashed border-black mt-2 mb-2" }), (0, jsx_runtime_1.jsxs)("div", { className: "text-[11px]", children: [(0, jsx_runtime_1.jsx)("p", { className: "font-bold underline", children: "OBSERVA\u00C7\u00D5ES" }), (0, jsx_runtime_1.jsx)("p", { children: order.notes })] })] })), (0, jsx_runtime_1.jsxs)("div", { className: "border-t border-dashed border-black mt-3 pt-2 text-center text-[10px] text-gray-600", children: [(0, jsx_runtime_1.jsx)("p", { children: "Obrigado pela prefer\u00EAncia!" }), (0, jsx_runtime_1.jsx)("p", { children: "Suplementaai \u2014 Sistema de Franquias" })] })] })] }), (0, jsx_runtime_1.jsx)("style", { children: `
        @media print {
          body * { visibility: hidden; }
          #comanda-print, #comanda-print * { visibility: visible; }
          #comanda-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 302px;
            margin: 0;
            padding: 8px;
          }
          .no-print { display: none !important; }
          @page { margin: 0; size: 80mm auto; }
        }
      ` })] }));
}

},
"/src/components/master/CouponsTool.tsx": function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CouponsTool;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const supabase_1 = require("@/lib/supabase");
const lucide_react_1 = require("lucide-react");
function CouponsTool({ onClose }) {
    const [coupons, setCoupons] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [showForm, setShowForm] = (0, react_1.useState)(false);
    const [editing, setEditing] = (0, react_1.useState)(null);
    const [saving, setSaving] = (0, react_1.useState)(false);
    const [form, setForm] = (0, react_1.useState)({
        code: '', description: '', discount_type: 'percent',
        discount_value: '', min_purchase: '', active: true, franchise_id: '',
    });
    const load = async () => {
        const { data } = await supabase_1.supabase.from('coupons').select('*').order('created_at', { ascending: false });
        setCoupons(data || []);
        setLoading(false);
    };
    (0, react_1.useEffect)(() => { load(); }, []);
    const save = async (e) => {
        e.preventDefault();
        setSaving(true);
        const payload = {
            code: form.code.toUpperCase().trim(),
            description: form.description || null,
            discount_type: form.discount_type,
            discount_value: parseFloat(form.discount_value) || 0,
            min_purchase: parseFloat(form.min_purchase) || 0,
            active: form.active,
            franchise_id: form.franchise_id || null,
        };
        if (editing) {
            await supabase_1.supabase.from('coupons').update(payload).eq('id', editing.id);
        }
        else {
            await supabase_1.supabase.from('coupons').insert(payload);
        }
        setForm({ code: '', description: '', discount_type: 'percent', discount_value: '', min_purchase: '', active: true, franchise_id: '' });
        setEditing(null);
        setShowForm(false);
        setSaving(false);
        load();
    };
    const remove = async (c) => {
        if (!confirm(`Excluir cupom ${c.code}?`))
            return;
        await supabase_1.supabase.from('coupons').delete().eq('id', c.id);
        load();
    };
    return ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm", onClick: onClose, children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto", onClick: e => e.stopPropagation(), children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-10 h-10 rounded-lg bg-[#FFE500]/10 flex items-center justify-center", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Ticket, { size: 20, className: "text-[#FFE500]" }) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h2", { className: "font-bold text-white text-lg", children: "Cupons" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs", children: "Cupons de desconto para o cat\u00E1logo digital" })] })] }), (0, jsx_runtime_1.jsx)("button", { onClick: onClose, className: "text-zinc-400 hover:text-white", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { size: 22 }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "p-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-4", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-sm", children: "Cupons sem franquia (master) valem para todas as unidades. Cupons com franquia valem apenas na loja dela." }), (0, jsx_runtime_1.jsxs)("button", { onClick: () => { setEditing(null); setShowForm(!showForm); }, className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 flex items-center gap-1.5", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { size: 16 }), " Novo Cupom"] })] }), showForm && ((0, jsx_runtime_1.jsxs)("form", { onSubmit: save, className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 mb-4 space-y-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-3", children: [(0, jsx_runtime_1.jsx)("input", { type: "text", value: form.code, onChange: e => setForm({ ...form, code: e.target.value }), required: true, placeholder: "C\u00F3digo (ex: BEMVINDO10)", className: "bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: form.description, onChange: e => setForm({ ...form, description: e.target.value }), placeholder: "Descri\u00E7\u00E3o (opcional)", className: "bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-3 gap-3", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs mb-1", children: "Tipo" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setForm({ ...form, discount_type: 'percent' }), className: `flex-1 text-xs py-2 ${form.discount_type === 'percent' ? 'bg-[#FFE500] text-black' : 'text-zinc-400'}`, children: (0, jsx_runtime_1.jsx)(lucide_react_1.Percent, { size: 12, className: "inline" }) }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setForm({ ...form, discount_type: 'fixed' }), className: `flex-1 text-xs py-2 ${form.discount_type === 'fixed' ? 'bg-[#FFE500] text-black' : 'text-zinc-400'}`, children: (0, jsx_runtime_1.jsx)(lucide_react_1.DollarSign, { size: 12, className: "inline" }) })] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("label", { className: "block text-zinc-300 text-xs mb-1", children: ["Valor ", form.discount_type === 'percent' ? '(%)' : '(R$)'] }), (0, jsx_runtime_1.jsx)("input", { type: "number", step: "0.01", value: form.discount_value, onChange: e => setForm({ ...form, discount_value: e.target.value }), required: true, placeholder: "0", className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs mb-1", children: "Compra m\u00EDn. (R$)" }), (0, jsx_runtime_1.jsx)("input", { type: "number", step: "0.01", value: form.min_purchase, onChange: e => setForm({ ...form, min_purchase: e.target.value }), placeholder: "0", className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] })] }), (0, jsx_runtime_1.jsxs)("label", { className: "flex items-center gap-2 cursor-pointer", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: form.active, onChange: e => setForm({ ...form, active: e.target.checked }), className: "w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-[#FFE500]" }), (0, jsx_runtime_1.jsx)("span", { className: "text-zinc-300 text-sm", children: "Cupom ativo" })] }), (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: saving, className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 disabled:opacity-50", children: saving ? 'Salvando...' : editing ? 'Salvar' : 'Criar cupom' })] })), loading ? (0, jsx_runtime_1.jsx)("div", { className: "flex justify-center py-8", children: (0, jsx_runtime_1.jsx)("div", { className: "w-6 h-6 border-2 border-zinc-700 border-t-[#FFE500] rounded-full animate-spin" }) }) :
                            coupons.length === 0 ? (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-sm text-center py-8", children: "Nenhum cupom criado." }) :
                                (0, jsx_runtime_1.jsx)("div", { className: "space-y-2", children: coupons.map(c => ((0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-10 h-10 rounded-lg bg-[#FFE500]/10 flex items-center justify-center", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Ticket, { size: 18, className: "text-[#FFE500]" }) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-white text-sm font-bold", children: c.code }), (0, jsx_runtime_1.jsxs)("p", { className: "text-zinc-500 text-xs", children: [c.discount_type === 'percent' ? `${c.discount_value}% de desconto` : `R$ ${c.discount_value} de desconto`, c.min_purchase > 0 ? ` • Compra mín: R$ ${c.min_purchase}` : '', " \u2022 ", c.franchise_id ? 'Franquia específica' : 'Todas as franquias', " \u2022 ", c.active ? 'Ativo' : 'Inativo'] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-1", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => { setEditing(c); setForm({ code: c.code, description: c.description ?? '', discount_type: c.discount_type, discount_value: String(c.discount_value), min_purchase: String(c.min_purchase), active: c.active, franchise_id: c.franchise_id ?? '' }); setShowForm(true); }, className: "text-zinc-400 hover:text-[#FFE500] p-1.5", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Edit, { size: 14 }) }), (0, jsx_runtime_1.jsx)("button", { onClick: () => remove(c), className: "text-zinc-400 hover:text-red-400 p-1.5", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { size: 14 }) })] })] }, c.id))) })] })] }) }));
}

},
"/src/components/master/CoursesTool.tsx": function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CoursesTool;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const supabase_1 = require("@/lib/supabase");
const lucide_react_1 = require("lucide-react");
function CoursesTool({ onClose }) {
    const [courses, setCourses] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [showCreate, setShowCreate] = (0, react_1.useState)(false);
    const [editing, setEditing] = (0, react_1.useState)(null);
    const [form, setForm] = (0, react_1.useState)({ title: '', description: '', video_url: '', category_name: 'Geral', module_name: 'Módulo 1', order_index: '0' });
    const [mediaFile, setMediaFile] = (0, react_1.useState)(null);
    const [saving, setSaving] = (0, react_1.useState)(false);
    const load = async () => {
        const { data } = await supabase_1.supabase.from('courses').select('*').order('order_index', { ascending: true });
        if (data)
            setCourses(data);
        setLoading(false);
    };
    (0, react_1.useEffect)(() => { load(); }, []);
    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        let mediaUrl = form.video_url;
        let mediaType = 'youtube';
        if (mediaFile) {
            const extension = mediaFile.name.split('.').pop() || 'mp4';
            const path = `courses/${Date.now()}.${extension}`;
            const { error: uploadError } = await supabase_1.supabase.storage.from('marketing-files').upload(path, mediaFile);
            if (uploadError) {
                setSaving(false);
                return;
            }
            mediaUrl = supabase_1.supabase.storage.from('marketing-files').getPublicUrl(path).data.publicUrl;
            mediaType = 'upload';
        }
        const payload = {
            title: form.title,
            description: form.description || null,
            video_url: mediaUrl,
            category_name: form.category_name,
            module_name: form.module_name,
            media_type: mediaType,
            order_index: parseInt(form.order_index) || 0,
        };
        if (editing) {
            await supabase_1.supabase.from('courses').update(payload).eq('id', editing.id);
        }
        else {
            await supabase_1.supabase.from('courses').insert(payload);
        }
        setForm({ title: '', description: '', video_url: '', category_name: 'Geral', module_name: 'Módulo 1', order_index: '0' });
        setMediaFile(null);
        setEditing(null);
        setShowCreate(false);
        setSaving(false);
        load();
    };
    const handleEdit = (c) => {
        setEditing(c);
        setForm({ title: c.title, description: c.description ?? '', video_url: c.video_url, category_name: c.category_name ?? 'Geral', module_name: c.module_name, order_index: String(c.order_index) });
        setMediaFile(null);
        setShowCreate(true);
    };
    const handleDelete = async (c) => {
        if (!confirm('Excluir este curso?'))
            return;
        await supabase_1.supabase.from('courses').delete().eq('id', c.id);
        load();
    };
    const modules = Array.from(new Set(courses.map(c => c.module_name)));
    return ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm", onClick: onClose, children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto", onClick: e => e.stopPropagation(), children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-10 h-10 rounded-lg bg-[#FFE500]/10 flex items-center justify-center", children: (0, jsx_runtime_1.jsx)(lucide_react_1.GraduationCap, { size: 20, className: "text-[#FFE500]" }) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h2", { className: "font-bold text-white text-lg", children: "Cursos" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs", children: "Treinamentos para os franqueados" })] })] }), (0, jsx_runtime_1.jsx)("button", { onClick: onClose, className: "text-zinc-400 hover:text-white transition-colors", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { size: 22 }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "p-6", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex justify-end mb-4", children: (0, jsx_runtime_1.jsxs)("button", { onClick: () => { if (editing) {
                                    setEditing(null);
                                    setForm({ title: '', description: '', video_url: '', module_name: 'Geral', order_index: '0' });
                                } setShowCreate(!showCreate); }, className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 flex items-center gap-1.5 transition-all", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { size: 16 }), " ", editing ? 'Editando...' : 'Novo Curso'] }) }), showCreate && ((0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSave, className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 mb-4 space-y-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "T\u00EDtulo" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: form.title, onChange: e => setForm({ ...form, title: e.target.value }), required: true, className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Categoria principal" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: form.category_name, onChange: e => setForm({ ...form, category_name: e.target.value }), required: true, className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "M\u00F3dulo" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: form.module_name, onChange: e => setForm({ ...form, module_name: e.target.value }), required: true, className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "V\u00EDdeo ou arquivo" }), (0, jsx_runtime_1.jsx)("input", { type: "url", value: form.video_url, onChange: e => setForm({ ...form, video_url: e.target.value }), required: !mediaFile, placeholder: "https://youtube.com/watch?v=...", className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), (0, jsx_runtime_1.jsxs)("label", { className: "mt-2 flex items-center gap-2 text-xs text-zinc-400 cursor-pointer", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Upload, { size: 14 }), mediaFile ? mediaFile.name : 'Ou enviar vídeo/arquivo', (0, jsx_runtime_1.jsx)("input", { type: "file", accept: "video/*,.pdf", className: "hidden", onChange: e => setMediaFile(e.target.files?.[0] ?? null) })] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Descri\u00E7\u00E3o" }), (0, jsx_runtime_1.jsx)("textarea", { value: form.description, onChange: e => setForm({ ...form, description: e.target.value }), rows: 2, className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500] resize-none" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Ordem" }), (0, jsx_runtime_1.jsx)("input", { type: "number", value: form.order_index, onChange: e => setForm({ ...form, order_index: e.target.value }), className: "w-24 bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2", children: [(0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: saving, className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 transition-all disabled:opacity-50", children: saving ? 'Salvando...' : editing ? 'Salvar alterações' : 'Criar curso' }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => { setShowCreate(false); setEditing(null); }, className: "bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors", children: "Cancelar" })] })] })), loading ? ((0, jsx_runtime_1.jsx)("div", { className: "flex justify-center py-8", children: (0, jsx_runtime_1.jsx)("div", { className: "w-6 h-6 border-2 border-zinc-700 border-t-[#FFE500] rounded-full animate-spin" }) })) : courses.length === 0 ? ((0, jsx_runtime_1.jsxs)("div", { className: "text-center py-12", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.GraduationCap, { size: 40, className: "mx-auto text-zinc-700 mb-3" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-sm", children: "Nenhum curso criado ainda." })] })) : ((0, jsx_runtime_1.jsx)("div", { className: "space-y-6", children: modules.map(mod => ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-[#FFE500] font-bold text-sm uppercase tracking-wide mb-3", children: mod }), (0, jsx_runtime_1.jsx)("div", { className: "space-y-2", children: courses.filter(c => c.module_name === mod).map(c => ((0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Youtube, { size: 18, className: "text-red-400" }) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-white text-sm font-medium", children: c.title }), c.description && (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs", children: c.description })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-1", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => handleEdit(c), className: "text-zinc-400 hover:text-[#FFE500] p-1.5 transition-colors", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Edit, { size: 15 }) }), (0, jsx_runtime_1.jsx)("button", { onClick: () => handleDelete(c), className: "text-zinc-400 hover:text-red-400 p-1.5 transition-colors", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { size: 15 }) })] })] }, c.id))) })] }, mod))) }))] })] }) }));
}

},
"/src/components/master/CreateFranchiseModal.tsx": function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CreateFranchiseModal;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const supabase_1 = require("@/lib/supabase");
const lucide_react_1 = require("lucide-react");
function slugify(text) {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
function CreateFranchiseModal({ onClose, onCreated }) {
    const [step, setStep] = (0, react_1.useState)(1);
    const [franchiseName, setFranchiseName] = (0, react_1.useState)('');
    const [userName, setUserName] = (0, react_1.useState)('');
    const [email, setEmail] = (0, react_1.useState)('');
    const [phone, setPhone] = (0, react_1.useState)('');
    const [password, setPassword] = (0, react_1.useState)('');
    const [showPass, setShowPass] = (0, react_1.useState)(false);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)('');
    const [createdCredentials, setCreatedCredentials] = (0, react_1.useState)(null);
    const handleCreate = async () => {
        setLoading(true);
        setError('');
        try {
            const { data: franData, error: franError } = await supabase_1.supabase
                .from('franchises')
                .insert({ name: franchiseName, slug: slugify(franchiseName) })
                .select()
                .single();
            if (franError || !franData) {
                setError('Erro ao criar franquia: ' + (franError?.message || ''));
                setLoading(false);
                return;
            }
            const { data: fnData, error: fnError } = await supabase_1.supabase.functions.invoke('create-franchise-user', {
                body: { email: email.trim().toLowerCase(), password, name: userName, phone, franchise_id: franData.id, action: 'create_user' },
            });
            if (fnError || fnData?.error) {
                setError('Franquia criada, mas erro ao criar usuário: ' + (fnData?.error || fnError?.message || ''));
                setLoading(false);
                return;
            }
            onCreated();
            setCreatedCredentials({ email: email.trim().toLowerCase(), password });
        }
        catch (err) {
            setError('Erro inesperado.');
        }
        setLoading(false);
    };
    return ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm", onClick: onClose, children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto", onClick: e => e.stopPropagation(), children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between p-6 border-b border-zinc-800", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-10 h-10 rounded-lg bg-[#FFE500]/10 flex items-center justify-center", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Store, { size: 20, className: "text-[#FFE500]" }) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h2", { className: "font-bold text-white text-lg", children: "Nova Franquia" }), (0, jsx_runtime_1.jsxs)("p", { className: "text-zinc-500 text-xs", children: ["Passo ", step, " de 2"] })] })] }), (0, jsx_runtime_1.jsx)("button", { onClick: onClose, className: "text-zinc-400 hover:text-white transition-colors", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { size: 22 }) })] }), (0, jsx_runtime_1.jsx)("div", { className: "px-6 pt-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2", children: [(0, jsx_runtime_1.jsx)("div", { className: `h-1.5 flex-1 rounded-full transition-colors ${step >= 1 ? 'bg-[#FFE500]' : 'bg-zinc-800'}` }), (0, jsx_runtime_1.jsx)("div", { className: `h-1.5 flex-1 rounded-full transition-colors ${step >= 2 ? 'bg-[#FFE500]' : 'bg-zinc-800'}` })] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "p-6", children: [createdCredentials ? ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "rounded-xl border border-green-500/30 bg-green-500/10 p-4", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-green-300 font-bold", children: "Franquia criada" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-300 text-sm mt-1", children: "Copie estes dados e entregue ao franqueado. Voc\u00EA tamb\u00E9m poder\u00E1 visualiz\u00E1-los depois em \"Ver credenciais\"." })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-3", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs", children: "E-mail" }), (0, jsx_runtime_1.jsx)("p", { className: "text-white font-medium select-all", children: createdCredentials.email })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs", children: "Senha criada" }), (0, jsx_runtime_1.jsx)("p", { className: "text-white font-medium select-all", children: createdCredentials.password })] })] }), (0, jsx_runtime_1.jsx)("button", { onClick: onClose, className: "w-full bg-[#FFE500] hover:bg-[#FFD000] text-black font-bold rounded-lg py-3", children: "Concluir" })] })) : step === 1 && ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-white font-bold mb-1", children: "Dados da franquia" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-sm mb-4", children: "D\u00EA um nome \u00E0 nova unidade." })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-sm font-medium mb-1.5", children: "Nome da franquia" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: franchiseName, onChange: e => setFranchiseName(e.target.value), placeholder: "Ex: Suplementaai - Centro", autoFocus: true, className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-3 text-sm placeholder-zinc-500 focus:outline-none focus:border-[#FFE500] transition-colors" })] }), (0, jsx_runtime_1.jsxs)("button", { onClick: () => setStep(2), disabled: !franchiseName.trim(), className: "w-full bg-[#FFE500] hover:bg-[#FFD000] text-black font-bold rounded-lg py-3 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed", children: ["Avan\u00E7ar", (0, jsx_runtime_1.jsx)(lucide_react_1.ArrowRight, { size: 18 })] })] })), step === 2 && ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-white font-bold mb-1", children: "Dados do franqueado" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-sm mb-4", children: "Crie o acesso que ser\u00E1 entregue ao respons\u00E1vel." })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-sm font-medium mb-1.5", children: "Nome completo" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: userName, onChange: e => setUserName(e.target.value), placeholder: "Nome do respons\u00E1vel", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-3 text-sm placeholder-zinc-500 focus:outline-none focus:border-[#FFE500] transition-colors" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-sm font-medium mb-1.5", children: "E-mail" }), (0, jsx_runtime_1.jsx)("input", { type: "email", value: email, onChange: e => setEmail(e.target.value), placeholder: "email@exemplo.com", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-3 text-sm placeholder-zinc-500 focus:outline-none focus:border-[#FFE500] transition-colors" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-sm font-medium mb-1.5", children: "Telefone" }), (0, jsx_runtime_1.jsx)("input", { type: "tel", value: phone, onChange: e => setPhone(e.target.value), placeholder: "(00) 00000-0000", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-3 text-sm placeholder-zinc-500 focus:outline-none focus:border-[#FFE500] transition-colors" })] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-sm font-medium mb-1.5", children: "Senha" }), (0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsx)("input", { type: showPass ? 'text' : 'password', value: password, onChange: e => setPassword(e.target.value), placeholder: "M\u00EDnimo 6 caracteres", minLength: 6, className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-3 pr-12 text-sm placeholder-zinc-500 focus:outline-none focus:border-[#FFE500] transition-colors" }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setShowPass(!showPass), className: "absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white", children: showPass ? '🙈' : '👁' })] })] }), error && (0, jsx_runtime_1.jsx)("p", { className: "text-red-400 text-sm", children: error }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-3", children: [(0, jsx_runtime_1.jsxs)("button", { onClick: () => setStep(1), className: "bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg py-3 px-5 flex items-center gap-2 transition-colors", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ArrowLeft, { size: 18 }), "Voltar"] }), (0, jsx_runtime_1.jsx)("button", { onClick: handleCreate, disabled: !userName.trim() || !email.trim() || !password.trim() || loading, className: "flex-1 bg-[#FFE500] hover:bg-[#FFD000] text-black font-bold rounded-lg py-3 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed", children: loading ? ((0, jsx_runtime_1.jsx)("div", { className: "w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" })) : ('Criar franquia') })] })] }))] })] }) }));
}

},
"/src/components/master/ExportContactsTool.tsx": function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ExportContactsTool;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const supabase_1 = require("@/lib/supabase");
const lucide_react_1 = require("lucide-react");
function ExportContactsTool({ onClose }) {
    const [customers, setCustomers] = (0, react_1.useState)([]);
    const [franchises, setFranchises] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [filterFran, setFilterFran] = (0, react_1.useState)('all');
    (0, react_1.useEffect)(() => {
        (async () => {
            try {
                const [{ data: franData }, allCustomers] = await Promise.all([
                    supabase_1.supabase.from('franchises').select('*').order('name'),
                    (async () => {
                        const rows = [];
                        for (let from = 0;; from += 1000) {
                            const { data, error } = await supabase_1.supabase
                                .from('customers')
                                .select('*')
                                .order('created_at', { ascending: false })
                                .order('id', { ascending: true })
                                .range(from, from + 999);
                            if (error)
                                throw error;
                            const page = (data ?? []);
                            rows.push(...page);
                            if (page.length < 1000)
                                break;
                        }
                        return rows;
                    })(),
                ]);
                setCustomers(allCustomers);
                if (franData)
                    setFranchises(franData);
            }
            catch (error) {
                console.error('Erro ao carregar todos os contatos:', error);
            }
            finally {
                setLoading(false);
            }
        })();
    }, []);
    const franName = (id) => franchises.find(f => f.id === id)?.name ?? '—';
    const filtered = filterFran === 'all' ? customers : customers.filter(c => c.franchise_id === filterFran);
    const exportCSV = () => {
        const headers = ['Nome', 'Telefone', 'Email', 'Franquia', 'Cadastro'];
        const rows = filtered.map(c => [
            c.name,
            c.phone ?? '',
            c.email ?? '',
            franName(c.franchise_id),
            new Date(c.created_at).toLocaleDateString('pt-BR'),
        ]);
        const csv = [headers, ...rows].map(r => r.map(field => `"${field.replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `contatos-clientes-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };
    return ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm", onClick: onClose, children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto", onClick: e => e.stopPropagation(), children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-10 h-10 rounded-lg bg-[#FFE500]/10 flex items-center justify-center", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Users, { size: 20, className: "text-[#FFE500]" }) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h2", { className: "font-bold text-white text-lg", children: "Exportar Contatos" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs", children: "Baixe a lista de clientes para marketing" })] })] }), (0, jsx_runtime_1.jsx)("button", { onClick: onClose, className: "text-zinc-400 hover:text-white transition-colors", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { size: 22 }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "p-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-4 flex-wrap gap-2", children: [(0, jsx_runtime_1.jsxs)("select", { value: filterFran, onChange: e => setFilterFran(e.target.value), className: "bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]", children: [(0, jsx_runtime_1.jsx)("option", { value: "all", children: "Todas as franquias" }), franchises.map(f => (0, jsx_runtime_1.jsx)("option", { value: f.id, children: f.name }, f.id))] }), (0, jsx_runtime_1.jsxs)("button", { onClick: exportCSV, disabled: filtered.length === 0, className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 flex items-center gap-1.5 transition-all disabled:opacity-50", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Download, { size: 16 }), " Exportar CSV (", filtered.length, ")"] })] }), loading ? ((0, jsx_runtime_1.jsx)("div", { className: "flex justify-center py-8", children: (0, jsx_runtime_1.jsx)("div", { className: "w-6 h-6 border-2 border-zinc-700 border-t-[#FFE500] rounded-full animate-spin" }) })) : filtered.length === 0 ? ((0, jsx_runtime_1.jsxs)("div", { className: "text-center py-12", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Users, { size: 40, className: "mx-auto text-zinc-700 mb-3" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-sm", children: "Nenhum cliente cadastrado." })] })) : ((0, jsx_runtime_1.jsx)("div", { className: "space-y-2", children: filtered.map(c => ((0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-9 h-9 rounded-full bg-[#FFE500]/10 flex items-center justify-center text-[#FFE500] text-sm font-bold", children: c.name.charAt(0).toUpperCase() }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-white text-sm font-medium", children: c.name }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs", children: franName(c.franchise_id) })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3 text-zinc-400 text-xs", children: [c.phone && (0, jsx_runtime_1.jsxs)("span", { className: "flex items-center gap-1", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Phone, { size: 11 }), " ", c.phone] }), c.email && (0, jsx_runtime_1.jsxs)("span", { className: "flex items-center gap-1", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Mail, { size: 11 }), " ", c.email] })] })] }, c.id))) }))] })] }) }));
}

},
"/src/components/master/FactoryOrdersTool.tsx": function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = FactoryOrdersTool;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const supabase_1 = require("@/lib/supabase");
const lucide_react_1 = require("lucide-react");
const STATUS_LABELS = {
    pending: 'Pendente', processing: 'Em preparo', shipped: 'Enviado', delivered: 'Entregue', cancelled: 'Cancelado',
};
const STATUS_COLORS = {
    pending: 'bg-yellow-500/10 text-yellow-400', processing: 'bg-blue-500/10 text-blue-400', shipped: 'bg-purple-500/10 text-purple-400', delivered: 'bg-green-500/10 text-green-400', cancelled: 'bg-red-500/10 text-red-400',
};
function FactoryOrdersTool({ onClose }) {
    const [tab, setTab] = (0, react_1.useState)('orders');
    return ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm", onClick: onClose, children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto", onClick: e => e.stopPropagation(), children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-10 h-10 rounded-lg bg-[#FFE500]/10 flex items-center justify-center", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Factory, { size: 20, className: "text-[#FFE500]" }) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h2", { className: "font-bold text-white text-lg", children: "Pedidos de F\u00E1brica" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs", children: "Gerencie produtos e pedidos das franquias" })] })] }), (0, jsx_runtime_1.jsx)("button", { onClick: onClose, className: "text-zinc-400 hover:text-white transition-colors", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { size: 22 }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2 p-4 border-b border-zinc-800", children: [(0, jsx_runtime_1.jsxs)("button", { onClick: () => setTab('orders'), className: `flex items-center gap-2 text-sm font-bold rounded-lg px-4 py-2 transition-colors ${tab === 'orders' ? 'bg-[#FFE500] text-black' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ClipboardList, { size: 16 }), " Pedidos"] }), (0, jsx_runtime_1.jsxs)("button", { onClick: () => setTab('products'), className: `flex items-center gap-2 text-sm font-bold rounded-lg px-4 py-2 transition-colors ${tab === 'products' ? 'bg-[#FFE500] text-black' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Package, { size: 16 }), " Produtos"] }), (0, jsx_runtime_1.jsxs)("button", { onClick: () => setTab('policy'), className: `flex items-center gap-2 text-sm font-bold rounded-lg px-4 py-2 transition-colors ${tab === 'policy' ? 'bg-[#FFE500] text-black' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.FileText, { size: 16 }), " Pol\u00EDtica"] })] }), tab === 'orders' ? (0, jsx_runtime_1.jsx)(OrdersTab, {}) : tab === 'products' ? (0, jsx_runtime_1.jsx)(ProductsTab, {}) : (0, jsx_runtime_1.jsx)(PolicyTab, {})] }) }));
}
function OrdersTab() {
    const [orders, setOrders] = (0, react_1.useState)([]);
    const [franchises, setFranchises] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [viewOrder, setViewOrder] = (0, react_1.useState)(null);
    const [filterStatus, setFilterStatus] = (0, react_1.useState)('all');
    const load = async () => {
        const [{ data: orderData }, { data: franData }] = await Promise.all([
            supabase_1.supabase.from('factory_orders').select('*').order('created_at', { ascending: false }),
            supabase_1.supabase.from('franchises').select('*').order('name'),
        ]);
        if (orderData)
            setOrders(orderData);
        if (franData)
            setFranchises(franData);
        setLoading(false);
    };
    (0, react_1.useEffect)(() => { load(); }, []);
    const franName = (id) => franchises.find(f => f.id === id)?.name ?? '—';
    const updateStatus = async (order, status) => {
        await supabase_1.supabase.from('factory_orders').update({ status, updated_at: new Date().toISOString() }).eq('id', order.id);
        setViewOrder({ ...order, status: status });
        load();
    };
    const filtered = filterStatus === 'all' ? orders : orders.filter(o => o.status === filterStatus);
    const pendingCount = orders.filter(o => o.status === 'pending').length;
    return ((0, jsx_runtime_1.jsxs)("div", { className: "p-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2 mb-4 flex-wrap items-center", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => setFilterStatus('all'), className: `text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${filterStatus === 'all' ? 'bg-[#FFE500] text-black' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`, children: "Todos" }), Object.entries(STATUS_LABELS).map(([key, label]) => ((0, jsx_runtime_1.jsxs)("button", { onClick: () => setFilterStatus(key), className: `text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${filterStatus === key ? 'bg-[#FFE500] text-black' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`, children: [label, key === 'pending' && pendingCount > 0 && ` (${pendingCount})`] }, key)))] }), loading ? ((0, jsx_runtime_1.jsx)("div", { className: "flex justify-center py-8", children: (0, jsx_runtime_1.jsx)("div", { className: "w-6 h-6 border-2 border-zinc-700 border-t-[#FFE500] rounded-full animate-spin" }) })) : filtered.length === 0 ? ((0, jsx_runtime_1.jsxs)("div", { className: "text-center py-12", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Package, { size: 40, className: "mx-auto text-zinc-700 mb-3" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-sm", children: "Nenhum pedido recebido." })] })) : ((0, jsx_runtime_1.jsx)("div", { className: "space-y-3", children: filtered.map(order => ((0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-start justify-between mb-2", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 mb-1", children: [(0, jsx_runtime_1.jsx)("h4", { className: "text-white font-bold text-sm", children: franName(order.franchise_id) }), (0, jsx_runtime_1.jsx)("span", { className: `text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status]}`, children: STATUS_LABELS[order.status] })] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-zinc-500 text-xs", children: [new Date(order.created_at).toLocaleString('pt-BR'), " \u2014 ", order.items?.length ?? 0, " item(ns)"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [order.total > 0 && (0, jsx_runtime_1.jsxs)("span", { className: "text-[#FFE500] font-bold text-sm", children: ["R$ ", order.total.toFixed(2)] }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setViewOrder(order), className: "text-zinc-400 hover:text-[#FFE500] p-1.5 transition-colors", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Eye, { size: 15 }) })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-1.5 mt-2 flex-wrap", children: [order.status === 'pending' && ((0, jsx_runtime_1.jsxs)("button", { onClick: () => updateStatus(order, 'processing'), className: "text-xs bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg px-3 py-1.5 flex items-center gap-1 transition-colors", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Check, { size: 12 }), " Aceitar"] })), order.status === 'processing' && ((0, jsx_runtime_1.jsxs)("button", { onClick: () => updateStatus(order, 'shipped'), className: "text-xs bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 rounded-lg px-3 py-1.5 flex items-center gap-1 transition-colors", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Truck, { size: 12 }), " Despachar"] })), order.status === 'shipped' && ((0, jsx_runtime_1.jsxs)("button", { onClick: () => updateStatus(order, 'delivered'), className: "text-xs bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg px-3 py-1.5 flex items-center gap-1 transition-colors", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.PackageCheck, { size: 12 }), " Entregue"] })), (order.status === 'pending' || order.status === 'processing') && ((0, jsx_runtime_1.jsxs)("button", { onClick: () => updateStatus(order, 'cancelled'), className: "text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg px-3 py-1.5 flex items-center gap-1 transition-colors", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Ban, { size: 12 }), " Cancelar"] }))] })] }, order.id))) })), viewOrder && ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm", onClick: () => setViewOrder(null), children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto", onClick: e => e.stopPropagation(), children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900", children: [(0, jsx_runtime_1.jsxs)("h3", { className: "text-white font-bold text-lg", children: ["Pedido \u2014 ", franName(viewOrder.franchise_id)] }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setViewOrder(null), className: "text-zinc-400 hover:text-white", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { size: 20 }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "p-6 space-y-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("span", { className: `text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[viewOrder.status]}`, children: STATUS_LABELS[viewOrder.status] }), (0, jsx_runtime_1.jsx)("span", { className: "text-zinc-500 text-xs", children: new Date(viewOrder.created_at).toLocaleString('pt-BR') })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [Array.isArray(viewOrder.items) && viewOrder.items.map((item, i) => ((0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between", children: [(0, jsx_runtime_1.jsxs)("p", { className: "text-white text-sm font-medium", children: [item.quantity, "x ", item.name ?? item.title ?? `Item ${i + 1}`] }), item.price && (0, jsx_runtime_1.jsxs)("p", { className: "text-[#FFE500] text-sm", children: ["R$ ", ((item.price ?? 0) * (item.quantity ?? 1)).toFixed(2)] })] }), item.notes && (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs mt-1", children: item.notes })] }, i))), (!viewOrder.items || viewOrder.items.length === 0) && (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-sm", children: "Sem detalhes de itens." })] }), viewOrder.total > 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between border-t border-zinc-800 pt-3", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-white font-bold", children: "Total" }), (0, jsx_runtime_1.jsxs)("span", { className: "text-[#FFE500] font-bold", children: ["R$ ", viewOrder.total.toFixed(2)] })] })), viewOrder.notes && ((0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-800/50 rounded-lg p-3", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs mb-1", children: "Observa\u00E7\u00F5es" }), (0, jsx_runtime_1.jsx)("p", { className: "text-white text-sm", children: viewOrder.notes })] })), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-2", children: "Alterar status" }), (0, jsx_runtime_1.jsx)("div", { className: "flex flex-wrap gap-2", children: Object.entries(STATUS_LABELS).map(([key, label]) => ((0, jsx_runtime_1.jsx)("button", { onClick: () => updateStatus(viewOrder, key), className: `text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${viewOrder.status === key ? 'bg-[#FFE500] text-black' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`, children: label }, key))) })] })] })] }) }))] }));
}
function ProductsTab() {
    const [products, setProducts] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [showForm, setShowForm] = (0, react_1.useState)(false);
    const [editing, setEditing] = (0, react_1.useState)(null);
    const [form, setForm] = (0, react_1.useState)({ name: '', description: '', price: '', category: '', image: null });
    const [imageUrl, setImageUrl] = (0, react_1.useState)(null);
    const [saving, setSaving] = (0, react_1.useState)(false);
    const load = async () => {
        const { data } = await supabase_1.supabase.from('factory_products').select('*').order('sort_order').order('name');
        if (data)
            setProducts(data);
        setLoading(false);
    };
    (0, react_1.useEffect)(() => { load(); }, []);
    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        let img = imageUrl;
        if (form.image) {
            const ext = form.image.name.split('.').pop();
            const path = `factory/factory-${Date.now()}.${ext}`;
            const { error } = await supabase_1.supabase.storage.from('franchise-products').upload(path, form.image);
            if (!error)
                img = supabase_1.supabase.storage.from('franchise-products').getPublicUrl(path).data.publicUrl;
        }
        const payload = {
            name: form.name,
            description: form.description || null,
            price: parseFloat(form.price) || 0,
            category: form.category || null,
            image_url: img,
            active: true,
            sort_order: editing?.sort_order ?? products.length,
        };
        if (editing) {
            await supabase_1.supabase.from('factory_products').update(payload).eq('id', editing.id);
        }
        else {
            await supabase_1.supabase.from('factory_products').insert(payload);
        }
        setForm({ name: '', description: '', price: '', category: '', image: null });
        setImageUrl(null);
        setEditing(null);
        setShowForm(false);
        setSaving(false);
        load();
    };
    const toggleActive = async (p) => {
        await supabase_1.supabase.from('factory_products').update({ active: !p.active }).eq('id', p.id);
        load();
    };
    const remove = async (id) => {
        if (!confirm('Excluir este produto?'))
            return;
        await supabase_1.supabase.from('factory_products').delete().eq('id', id);
        load();
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "p-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-4", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-sm", children: "Produtos dispon\u00EDveis para as franquias pedirem" }), (0, jsx_runtime_1.jsxs)("button", { onClick: () => { if (editing) {
                            setEditing(null);
                            setForm({ name: '', description: '', price: '', category: '', image: null });
                            setImageUrl(null);
                        } setShowForm(!showForm); }, className: "flex items-center gap-2 bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 transition-colors", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { size: 16 }), " ", showForm ? 'Cancelar' : 'Novo produto'] })] }), showForm && ((0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSave, className: "bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 mb-4 space-y-3", children: [(0, jsx_runtime_1.jsx)("input", { required: true, placeholder: "Nome do produto", value: form.name, onChange: e => setForm({ ...form, name: e.target.value }), className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), (0, jsx_runtime_1.jsx)("textarea", { placeholder: "Descri\u00E7\u00E3o (opcional)", value: form.description, onChange: e => setForm({ ...form, description: e.target.value }), rows: 2, className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500] resize-none" }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-3", children: [(0, jsx_runtime_1.jsx)("input", { required: true, type: "number", step: "0.01", placeholder: "Pre\u00E7o (R$)", value: form.price, onChange: e => setForm({ ...form, price: e.target.value }), className: "bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), (0, jsx_runtime_1.jsx)("input", { placeholder: "Categoria (opcional)", value: form.category, onChange: e => setForm({ ...form, category: e.target.value }), className: "bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), (0, jsx_runtime_1.jsxs)("label", { className: "flex items-center gap-2 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 cursor-pointer hover:border-[#FFE500]/50 transition-colors", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { size: 16, className: "text-zinc-400" }), (0, jsx_runtime_1.jsx)("span", { className: "text-zinc-400 text-sm", children: form.image ? form.image.name : 'Imagem (opcional)' }), (0, jsx_runtime_1.jsx)("input", { type: "file", accept: "image/*", className: "hidden", onChange: e => setForm({ ...form, image: e.target.files?.[0] ?? null }) })] }), imageUrl && !form.image && (0, jsx_runtime_1.jsx)("img", { src: imageUrl, alt: "", className: "w-full h-32 object-cover rounded-lg" }), (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: saving, className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 disabled:opacity-50", children: saving ? 'Salvando...' : editing ? 'Salvar' : 'Criar produto' })] })), loading ? ((0, jsx_runtime_1.jsx)("div", { className: "flex justify-center py-8", children: (0, jsx_runtime_1.jsx)("div", { className: "w-6 h-6 border-2 border-zinc-700 border-t-[#FFE500] rounded-full animate-spin" }) })) : products.length === 0 ? ((0, jsx_runtime_1.jsxs)("div", { className: "text-center py-12", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Package, { size: 40, className: "mx-auto text-zinc-700 mb-3" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-sm", children: "Nenhum produto cadastrado." })] })) : ((0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3", children: products.map(p => ((0, jsx_runtime_1.jsxs)("div", { className: `bg-zinc-800/50 border rounded-xl p-3 ${p.active ? 'border-zinc-700' : 'border-zinc-800 opacity-50'}`, children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-start gap-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-14 h-14 rounded-lg overflow-hidden bg-zinc-900 flex-shrink-0", children: p.image_url ? (0, jsx_runtime_1.jsx)("img", { src: p.image_url, alt: "", className: "w-full h-full object-cover" }) : (0, jsx_runtime_1.jsx)("div", { className: "w-full h-full flex items-center justify-center", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Package, { size: 18, className: "text-zinc-600" }) }) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1 min-w-0", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-white text-sm font-bold truncate", children: p.name }), p.category && (0, jsx_runtime_1.jsx)("span", { className: "text-zinc-500 text-xs", children: p.category }), (0, jsx_runtime_1.jsxs)("p", { className: "text-[#FFE500] text-sm font-bold mt-0.5", children: ["R$ ", p.price.toFixed(2)] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-1 mt-2", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => toggleActive(p), className: "text-zinc-500 hover:text-[#FFE500] p-1", children: p.active ? (0, jsx_runtime_1.jsx)(lucide_react_1.ToggleRight, { size: 18 }) : (0, jsx_runtime_1.jsx)(lucide_react_1.ToggleLeft, { size: 18 }) }), (0, jsx_runtime_1.jsx)("button", { onClick: () => { setEditing(p); setForm({ name: p.name, description: p.description ?? '', price: String(p.price), category: p.category ?? '', image: null }); setImageUrl(p.image_url); setShowForm(true); }, className: "text-zinc-500 hover:text-[#FFE500] p-1", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Edit, { size: 14 }) }), (0, jsx_runtime_1.jsx)("button", { onClick: () => remove(p.id), className: "text-zinc-500 hover:text-red-400 p-1", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { size: 14 }) })] })] }, p.id))) }))] }));
}
function PolicyTab() {
    const [policies, setPolicies] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [editing, setEditing] = (0, react_1.useState)(null);
    const [form, setForm] = (0, react_1.useState)({ title: '', content: '', active: true });
    const [saving, setSaving] = (0, react_1.useState)(false);
    const load = async () => {
        const { data } = await supabase_1.supabase.from('factory_commercial_policy').select('*').order('created_at');
        setPolicies(data || []);
        setLoading(false);
    };
    (0, react_1.useEffect)(() => { load(); }, []);
    const save = async (e) => {
        e.preventDefault();
        setSaving(true);
        if (editing) {
            await supabase_1.supabase.from('factory_commercial_policy').update({ ...form, updated_at: new Date().toISOString() }).eq('id', editing.id);
        }
        else {
            await supabase_1.supabase.from('factory_commercial_policy').insert(form);
        }
        setForm({ title: '', content: '', active: true });
        setEditing(null);
        setSaving(false);
        load();
    };
    const remove = async (id) => {
        if (!confirm('Excluir esta política?'))
            return;
        await supabase_1.supabase.from('factory_commercial_policy').delete().eq('id', id);
        load();
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "p-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-4", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-sm", children: "Pol\u00EDtica comercial e ofertas do m\u00EAs \u2014 vis\u00EDvel para todas as franquias" }), (0, jsx_runtime_1.jsxs)("button", { onClick: () => { setEditing(null); setForm({ title: '', content: '', active: true }); }, className: "flex items-center gap-2 bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { size: 16 }), " Nova"] })] }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: save, className: "bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 mb-4 space-y-3", children: [(0, jsx_runtime_1.jsx)("input", { type: "text", value: form.title, onChange: e => setForm({ ...form, title: e.target.value }), required: true, placeholder: "T\u00EDtulo (ex: Pol\u00EDtica Comercial, Ofertas do M\u00EAs)", className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), (0, jsx_runtime_1.jsx)("textarea", { value: form.content, onChange: e => setForm({ ...form, content: e.target.value }), required: true, placeholder: "Conte\u00FAdo da pol\u00EDtica/oferta", rows: 4, className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500] resize-none" }), (0, jsx_runtime_1.jsxs)("label", { className: "flex items-center gap-2 cursor-pointer", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: form.active, onChange: e => setForm({ ...form, active: e.target.checked }), className: "w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-[#FFE500]" }), (0, jsx_runtime_1.jsx)("span", { className: "text-zinc-300 text-sm", children: "Ativo" })] }), (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: saving, className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 disabled:opacity-50", children: saving ? 'Salvando...' : editing ? 'Salvar' : 'Criar' })] }), loading ? (0, jsx_runtime_1.jsx)("div", { className: "flex justify-center py-8", children: (0, jsx_runtime_1.jsx)("div", { className: "w-6 h-6 border-2 border-zinc-700 border-t-[#FFE500] rounded-full animate-spin" }) }) :
                policies.length === 0 ? (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-sm text-center py-8", children: "Nenhuma pol\u00EDtica criada." }) :
                    (0, jsx_runtime_1.jsx)("div", { className: "space-y-2", children: policies.map(p => ((0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { className: "min-w-0", children: [(0, jsx_runtime_1.jsxs)("p", { className: "text-white text-sm font-bold", children: [p.title, " ", !p.active && (0, jsx_runtime_1.jsx)("span", { className: "text-zinc-500 text-xs", children: "(inativo)" })] }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs truncate", children: p.content })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-1", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => { setEditing(p); setForm({ title: p.title, content: p.content, active: p.active }); }, className: "text-zinc-400 hover:text-[#FFE500] p-1.5", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Edit, { size: 14 }) }), (0, jsx_runtime_1.jsx)("button", { onClick: () => remove(p.id), className: "text-zinc-400 hover:text-red-400 p-1.5", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { size: 14 }) })] })] }, p.id))) })] }));
}

},
"/src/components/master/ManageFranchiseModal.tsx": function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ManageFranchiseModal;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const supabase_1 = require("@/lib/supabase");
const lucide_react_1 = require("lucide-react");
function ManageFranchiseModal({ franchise, onClose, onUpdate }) {
    const [users, setUsers] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [showCreateUser, setShowCreateUser] = (0, react_1.useState)(false);
    const [name, setName] = (0, react_1.useState)('');
    const [email, setEmail] = (0, react_1.useState)('');
    const [phone, setPhone] = (0, react_1.useState)('');
    const [password, setPassword] = (0, react_1.useState)('');
    const [showPass, setShowPass] = (0, react_1.useState)(false);
    const [creating, setCreating] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)('');
    const [showDeleteConfirm, setShowDeleteConfirm] = (0, react_1.useState)(false);
    const [deleting, setDeleting] = (0, react_1.useState)(false);
    const [logoFile, setLogoFile] = (0, react_1.useState)(null);
    const [logoUrl, setLogoUrl] = (0, react_1.useState)(franchise.logo_url ?? '');
    const [savingLogo, setSavingLogo] = (0, react_1.useState)(false);
    const [logoFeedback, setLogoFeedback] = (0, react_1.useState)(null);
    const [resettingUserId, setResettingUserId] = (0, react_1.useState)(null);
    const [viewingUserId, setViewingUserId] = (0, react_1.useState)(null);
    const [temporaryPassword, setTemporaryPassword] = (0, react_1.useState)(null);
    const loadUsers = async () => {
        const { data, error } = await supabase_1.supabase
            .from('franchise_users')
            .select('*')
            .eq('franchise_id', franchise.id)
            .order('created_at', { ascending: true });
        if (!error && data)
            setUsers(data);
        setLoading(false);
    };
    (0, react_1.useEffect)(() => { loadUsers(); }, [franchise.id]);
    const handleCreateUser = async (e) => {
        e.preventDefault();
        setCreating(true);
        setError('');
        try {
            const { data: fnData, error: fnError } = await supabase_1.supabase.functions.invoke('create-franchise-user', {
                body: { email: email.trim().toLowerCase(), password, name, phone, franchise_id: franchise.id, action: 'create_user' },
            });
            if (fnError || fnData?.error) {
                setError('Erro ao criar usuário: ' + (fnData?.error || fnError?.message || ''));
                setCreating(false);
                return;
            }
            setName('');
            setEmail('');
            setPhone('');
            setPassword('');
            setShowCreateUser(false);
            loadUsers();
            onUpdate();
        }
        catch (err) {
            setError('Erro inesperado.');
        }
        setCreating(false);
    };
    const handleSaveLogo = async () => {
        if (!logoFile)
            return;
        setSavingLogo(true);
        setLogoFeedback(null);
        const extension = logoFile.name.split('.').pop() || 'png';
        const path = `franchise-logos/${franchise.id}.${extension}`;
        const { error: uploadError } = await supabase_1.supabase.storage.from('franchise-products').upload(path, logoFile, { upsert: true });
        if (uploadError) {
            setLogoFeedback({ type: 'error', msg: 'Erro ao enviar imagem: ' + uploadError.message });
            setSavingLogo(false);
            return;
        }
        const publicUrl = supabase_1.supabase.storage.from('franchise-products').getPublicUrl(path).data.publicUrl + `?t=${Date.now()}`;
        const { error: dbError } = await supabase_1.supabase.from('franchises').update({ logo_url: publicUrl }).eq('id', franchise.id);
        if (dbError) {
            setLogoFeedback({ type: 'error', msg: 'Erro ao salvar: ' + dbError.message });
            setSavingLogo(false);
            return;
        }
        setLogoUrl(publicUrl);
        setLogoFile(null);
        setLogoFeedback({ type: 'success', msg: 'Logo atualizada com sucesso!' });
        onUpdate();
        setSavingLogo(false);
        setTimeout(() => setLogoFeedback(null), 4000);
    };
    const handleDeleteUser = async (u) => {
        if (!confirm(`Remover o acesso de ${u.name}?`))
            return;
        if (u.auth_user_id) {
            await supabase_1.supabase.functions.invoke('create-franchise-user', {
                body: { action: 'delete_user', user_id: u.auth_user_id },
            });
        }
        await supabase_1.supabase.from('franchise_users').delete().eq('id', u.id);
        loadUsers();
    };
    const handleViewCredentials = async (user) => {
        if (!user.auth_user_id) {
            setError('Este usuário não tem vínculo de autenticação.');
            return;
        }
        setViewingUserId(user.id);
        setTemporaryPassword(null);
        setError('');
        try {
            const { data, error: functionError } = await supabase_1.supabase.functions.invoke('create-franchise-user', {
                body: { action: 'get_credentials', user_id: user.auth_user_id },
            });
            if (functionError || !data?.password) {
                const msg = data?.error || functionError?.message || 'Erro desconhecido';
                setError('Não foi possível obter credenciais: ' + msg);
            }
            else {
                setTemporaryPassword({ userId: user.id, password: data.password });
            }
        }
        catch {
            setError('Falha de conexão ao obter credenciais.');
        }
        setViewingUserId(null);
    };
    const handleResetPassword = async (user) => {
        if (!user.auth_user_id) {
            setError('Este usuário não tem vínculo de autenticação.');
            return;
        }
        if (!confirm('Gerar uma nova senha para este usuário? A senha atual será substituída.'))
            return;
        setResettingUserId(user.id);
        setTemporaryPassword(null);
        setError('');
        try {
            const { data, error: functionError } = await supabase_1.supabase.functions.invoke('create-franchise-user', {
                body: { action: 'reset_password', user_id: user.auth_user_id },
            });
            if (functionError || !data?.password) {
                const msg = data?.error || functionError?.message || 'Erro desconhecido';
                setError('Não foi possível gerar senha: ' + msg);
            }
            else {
                setTemporaryPassword({ userId: user.id, password: data.password });
            }
        }
        catch {
            setError('Falha de conexão ao gerar senha.');
        }
        setResettingUserId(null);
    };
    const handleDeleteFranchise = async () => {
        setDeleting(true);
        for (const u of users) {
            if (u.auth_user_id) {
                await supabase_1.supabase.functions.invoke('create-franchise-user', {
                    body: { action: 'delete_user', user_id: u.auth_user_id },
                });
            }
        }
        await supabase_1.supabase.from('franchises').delete().eq('id', franchise.id);
        setDeleting(false);
        onUpdate();
        onClose();
    };
    return ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm", onClick: onClose, children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto", onClick: e => e.stopPropagation(), children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-10 h-10 rounded-lg bg-[#FFE500]/10 flex items-center justify-center", children: (0, jsx_runtime_1.jsx)(lucide_react_1.User, { size: 20, className: "text-[#FFE500]" }) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h2", { className: "font-bold text-white text-lg", children: franchise.name }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs", children: "Gerenciar acesso da franquia" })] })] }), (0, jsx_runtime_1.jsx)("button", { onClick: onClose, className: "text-zinc-400 hover:text-white transition-colors", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { size: 22 }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "p-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-800/50 rounded-lg p-4 mb-6 grid grid-cols-2 gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs", children: "Status" }), (0, jsx_runtime_1.jsx)("span", { className: `text-sm font-medium ${franchise.status === 'active' ? 'text-green-400' : 'text-red-400'}`, children: franchise.status === 'active' ? 'Ativa' : 'Inativa' })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs", children: "Criada em" }), (0, jsx_runtime_1.jsx)("p", { className: "text-white text-sm", children: new Date(franchise.created_at).toLocaleDateString('pt-BR') })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-800/50 rounded-lg p-4 mb-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3 mb-3", children: [logoUrl ? (0, jsx_runtime_1.jsx)("img", { src: logoUrl, alt: "Logo da loja", className: "w-12 h-12 rounded-lg object-contain bg-[#FFE500]" }) : (0, jsx_runtime_1.jsx)("div", { className: "w-12 h-12 rounded-lg bg-[#FFE500]/10 flex items-center justify-center", children: (0, jsx_runtime_1.jsx)(lucide_react_1.User, { size: 20, className: "text-[#FFE500]" }) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-white text-sm font-bold", children: "Logo da loja" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs", children: "Ela aparecer\u00E1 no link p\u00FAblico da loja." })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-wrap gap-2", children: [(0, jsx_runtime_1.jsxs)("label", { className: "bg-zinc-900 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-sm rounded-lg px-3 py-2 flex items-center gap-2 cursor-pointer", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Upload, { size: 14 }), logoFile ? logoFile.name : 'Escolher logo', (0, jsx_runtime_1.jsx)("input", { type: "file", accept: "image/png,image/jpeg,image/webp", className: "hidden", onChange: e => setLogoFile(e.target.files?.[0] ?? null) })] }), (0, jsx_runtime_1.jsx)("button", { onClick: handleSaveLogo, disabled: !logoFile || savingLogo, className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-3 py-2 disabled:opacity-50", children: savingLogo ? 'Salvando...' : 'Salvar logo' }), (0, jsx_runtime_1.jsxs)("a", { href: `/loja/${franchise.slug}`, target: "_blank", rel: "noreferrer", className: "bg-zinc-900 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-sm rounded-lg px-3 py-2 flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ExternalLink, { size: 14 }), "Abrir link da loja"] })] }), logoFeedback && (0, jsx_runtime_1.jsx)("div", { className: `mt-3 text-xs font-medium rounded-lg px-3 py-2 ${logoFeedback.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`, children: logoFeedback.msg })] }), (0, jsx_runtime_1.jsxs)("div", { className: "border border-red-500/20 rounded-lg p-4 mb-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 mb-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.AlertTriangle, { size: 16, className: "text-red-400" }), (0, jsx_runtime_1.jsx)("p", { className: "text-red-400 text-sm font-bold", children: "Zona de exclus\u00E3o" })] }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-xs mb-3", children: "Excluir a franquia remove permanentemente todos os dados vinculados (usu\u00E1rios, produtos, pedidos, financeiro, etc). Esta a\u00E7\u00E3o n\u00E3o pode ser desfeita." }), !showDeleteConfirm ? ((0, jsx_runtime_1.jsx)("button", { onClick: () => setShowDeleteConfirm(true), className: "bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-bold rounded-lg px-4 py-2 transition-colors", children: "Excluir franquia" })) : ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-white text-sm font-bold", children: "Tem certeza? Digite o nome da franquia para confirmar:" }), (0, jsx_runtime_1.jsx)("input", { type: "text", placeholder: franchise.name, onKeyDown: e => { if (e.key === 'Enter' && e.target.value === franchise.name)
                                                handleDeleteFranchise(); }, className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2", children: [(0, jsx_runtime_1.jsx)("button", { onClick: handleDeleteFranchise, disabled: deleting, className: "bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-lg px-4 py-2 transition-colors disabled:opacity-50", children: deleting ? 'Excluindo...' : 'Confirmar exclusão' }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setShowDeleteConfirm(false), className: "bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors", children: "Cancelar" })] })] }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-4", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-white font-bold", children: "Usu\u00E1rios com acesso" }), (0, jsx_runtime_1.jsxs)("button", { onClick: () => setShowCreateUser(!showCreateUser), className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 flex items-center gap-1.5 transition-all", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { size: 16 }), "Novo Usu\u00E1rio"] })] }), showCreateUser && ((0, jsx_runtime_1.jsxs)("form", { onSubmit: handleCreateUser, className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 mb-4 space-y-3", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Nome completo" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: name, onChange: e => setName(e.target.value), required: true, className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500] transition-colors" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "E-mail" }), (0, jsx_runtime_1.jsx)("input", { type: "email", value: email, onChange: e => setEmail(e.target.value), required: true, className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500] transition-colors" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Telefone" }), (0, jsx_runtime_1.jsx)("input", { type: "tel", value: phone, onChange: e => setPhone(e.target.value), placeholder: "(00) 00000-0000", className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500] transition-colors" })] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Senha" }), (0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsx)("input", { type: showPass ? 'text' : 'password', value: password, onChange: e => setPassword(e.target.value), required: true, minLength: 6, className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:border-[#FFE500] transition-colors" }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setShowPass(!showPass), className: "absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white", children: showPass ? (0, jsx_runtime_1.jsx)(lucide_react_1.EyeOff, { size: 16 }) : (0, jsx_runtime_1.jsx)(lucide_react_1.Eye, { size: 16 }) })] })] }), error && (0, jsx_runtime_1.jsx)("p", { className: "text-red-400 text-xs", children: error }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2", children: [(0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: creating, className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 transition-all disabled:opacity-50", children: creating ? 'Criando...' : 'Criar acesso' }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setShowCreateUser(false), className: "bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors", children: "Cancelar" })] })] })), error && (0, jsx_runtime_1.jsx)("p", { className: "text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 mb-3", children: error }), loading ? ((0, jsx_runtime_1.jsx)("div", { className: "flex justify-center py-8", children: (0, jsx_runtime_1.jsx)("div", { className: "w-6 h-6 border-2 border-zinc-700 border-t-[#FFE500] rounded-full animate-spin" }) })) : users.length === 0 ? ((0, jsx_runtime_1.jsx)("div", { className: "text-center py-8 text-zinc-500 text-sm", children: "Nenhum usu\u00E1rio com acesso ainda. Crie o primeiro acima." })) : ((0, jsx_runtime_1.jsx)("div", { className: "space-y-3", children: users.map(u => ((0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 space-y-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-start justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-10 h-10 rounded-full bg-[#FFE500]/10 flex items-center justify-center text-[#FFE500] font-bold", children: u.name.charAt(0).toUpperCase() }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-white font-medium", children: u.name }), (0, jsx_runtime_1.jsxs)("p", { className: "text-zinc-400 text-xs flex items-center gap-1 mt-0.5", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Mail, { size: 12 }), " ", u.email] }), u.phone && (0, jsx_runtime_1.jsxs)("p", { className: "text-zinc-500 text-xs flex items-center gap-1", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Phone, { size: 12 }), " ", u.phone] })] })] }), (0, jsx_runtime_1.jsx)("button", { onClick: () => handleDeleteUser(u), className: "text-zinc-500 hover:text-red-400 p-1.5 transition-colors", title: "Remover acesso", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { size: 16 }) })] }), temporaryPassword?.userId === u.id ? ((0, jsx_runtime_1.jsxs)("div", { className: "rounded-lg border border-green-500/30 bg-green-500/10 p-3 space-y-2", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-green-300 text-sm font-bold", children: "Credenciais de acesso" }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-black/30 rounded-lg p-3 space-y-1", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-zinc-400 text-xs", children: "E-mail" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => navigator.clipboard.writeText(u.email), className: "text-[10px] text-zinc-500 hover:text-white", children: "Copiar" })] }), (0, jsx_runtime_1.jsx)("p", { className: "text-white font-mono text-sm select-all", children: u.email }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mt-2", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-zinc-400 text-xs", children: "Senha" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => navigator.clipboard.writeText(temporaryPassword.password), className: "text-[10px] text-zinc-500 hover:text-white", children: "Copiar" })] }), (0, jsx_runtime_1.jsx)("p", { className: "text-[#FFE500] font-mono text-lg font-bold select-all tracking-wider", children: temporaryPassword.password })] }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-[11px]", children: "Copie e passe ao franqueado." })] })) : ((0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => handleViewCredentials(u), disabled: viewingUserId === u.id, className: "flex-1 flex items-center justify-center gap-2 bg-zinc-700/50 hover:bg-zinc-700 text-zinc-300 hover:text-white text-sm font-medium rounded-lg py-2.5 transition-colors disabled:opacity-50", children: viewingUserId === u.id ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.RefreshCw, { size: 14, className: "animate-spin" }), "Carregando..."] })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Eye, { size: 14 }), "Ver credenciais"] })) }), (0, jsx_runtime_1.jsx)("button", { onClick: () => handleResetPassword(u), disabled: resettingUserId === u.id, className: "flex items-center justify-center gap-2 bg-zinc-700/50 hover:bg-zinc-700 text-zinc-300 hover:text-white text-sm font-medium rounded-lg py-2.5 px-3 transition-colors disabled:opacity-50", title: "Gerar nova senha", children: resettingUserId === u.id ? ((0, jsx_runtime_1.jsx)(lucide_react_1.RefreshCw, { size: 14, className: "animate-spin" })) : ((0, jsx_runtime_1.jsx)(lucide_react_1.KeyRound, { size: 14 })) })] }))] }, u.id))) }))] })] }) }));
}

},
"/src/components/master/MarketingTool.tsx": function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MarketingTool;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const supabase_1 = require("@/lib/supabase");
const lucide_react_1 = require("lucide-react");
function MarketingTool({ onClose }) {
    const [categories, setCategories] = (0, react_1.useState)([]);
    const [files, setFiles] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [selectedCat, setSelectedCat] = (0, react_1.useState)(null);
    const [showCreateCat, setShowCreateCat] = (0, react_1.useState)(false);
    const [showUpload, setShowUpload] = (0, react_1.useState)(false);
    const [catName, setCatName] = (0, react_1.useState)('');
    const [uploadTitle, setUploadTitle] = (0, react_1.useState)('');
    const [uploadFile, setUploadFile] = (0, react_1.useState)(null);
    const [saving, setSaving] = (0, react_1.useState)(false);
    const load = async () => {
        const [{ data: catData }, { data: fileData }] = await Promise.all([
            supabase_1.supabase.from('marketing_categories').select('*').order('name'),
            supabase_1.supabase.from('marketing_files').select('*').order('created_at', { ascending: false }),
        ]);
        if (catData)
            setCategories(catData);
        if (fileData)
            setFiles(fileData);
        setLoading(false);
    };
    (0, react_1.useEffect)(() => { load(); }, []);
    const handleCreateCat = async (e) => {
        e.preventDefault();
        setSaving(true);
        const { error } = await supabase_1.supabase.from('marketing_categories').insert({ name: catName });
        if (!error) {
            setCatName('');
            setShowCreateCat(false);
            load();
        }
        setSaving(false);
    };
    const handleDeleteCat = async (cat) => {
        if (!confirm(`Excluir categoria "${cat.name}" e todos os seus arquivos?`))
            return;
        await supabase_1.supabase.from('marketing_categories').delete().eq('id', cat.id);
        if (selectedCat === cat.id)
            setSelectedCat(null);
        load();
    };
    const handleUpload = async (e) => {
        e.preventDefault();
        if (!uploadFile || !selectedCat)
            return;
        setSaving(true);
        const ext = uploadFile.name.split('.').pop();
        const path = `${selectedCat}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase_1.supabase.storage.from('marketing-files').upload(path, uploadFile);
        if (!upErr) {
            const url = supabase_1.supabase.storage.from('marketing-files').getPublicUrl(path).data.publicUrl;
            const isImage = uploadFile.type.startsWith('image/');
            await supabase_1.supabase.from('marketing_files').insert({
                category_id: selectedCat,
                title: uploadTitle,
                file_url: url,
                file_type: isImage ? 'image' : 'file',
                file_name: uploadFile.name,
            });
            setUploadTitle('');
            setUploadFile(null);
            setShowUpload(false);
            load();
        }
        setSaving(false);
    };
    const handleDeleteFile = async (file) => {
        if (!confirm('Excluir este arquivo?'))
            return;
        await supabase_1.supabase.from('marketing_files').delete().eq('id', file.id);
        load();
    };
    const filesInCat = (catId) => files.filter(f => f.category_id === catId);
    return ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm", onClick: onClose, children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto", onClick: e => e.stopPropagation(), children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-10 h-10 rounded-lg bg-[#FFE500]/10 flex items-center justify-center", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Folder, { size: 20, className: "text-[#FFE500]" }) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h2", { className: "font-bold text-white text-lg", children: "Banco de Marketing" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs", children: "Materiais para as franquias" })] })] }), (0, jsx_runtime_1.jsx)("button", { onClick: onClose, className: "text-zinc-400 hover:text-white transition-colors", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { size: 22 }) })] }), (0, jsx_runtime_1.jsx)("div", { className: "p-6", children: selectedCat ? ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-4 flex-wrap gap-2", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => setSelectedCat(null), className: "text-zinc-400 hover:text-white text-sm flex items-center gap-1 transition-colors", children: "\u2190 Voltar" }), (0, jsx_runtime_1.jsxs)("button", { onClick: () => setShowUpload(!showUpload), className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 flex items-center gap-1.5 transition-all", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { size: 16 }), " Enviar arquivo"] })] }), (0, jsx_runtime_1.jsx)("h3", { className: "text-white font-bold mb-3", children: categories.find(c => c.id === selectedCat)?.name }), showUpload && ((0, jsx_runtime_1.jsxs)("form", { onSubmit: handleUpload, className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 mb-4 space-y-3", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "T\u00EDtulo do arquivo" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: uploadTitle, onChange: e => setUploadTitle(e.target.value), required: true, placeholder: "Ex: Banner promocional", className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Arquivo" }), (0, jsx_runtime_1.jsxs)("label", { className: "flex items-center gap-2 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 cursor-pointer hover:border-[#FFE500]/50 transition-colors", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Upload, { size: 16, className: "text-zinc-400" }), (0, jsx_runtime_1.jsx)("span", { className: "text-zinc-400 text-sm truncate", children: uploadFile ? uploadFile.name : 'Selecionar arquivo...' }), (0, jsx_runtime_1.jsx)("input", { type: "file", accept: "image/*,video/*,.pdf,.zip,.doc,.docx,.ppt,.pptx", onChange: e => setUploadFile(e.target.files?.[0] ?? null), required: true, className: "hidden" })] })] }), (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: saving, className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 transition-all disabled:opacity-50", children: saving ? 'Enviando...' : 'Enviar' })] })), filesInCat(selectedCat).length === 0 ? ((0, jsx_runtime_1.jsxs)("div", { className: "text-center py-12", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.FileText, { size: 40, className: "mx-auto text-zinc-700 mb-3" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-sm", children: "Nenhum arquivo nesta categoria ainda." })] })) : ((0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: filesInCat(selectedCat).map(file => ((0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex items-start justify-between mb-2", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [file.file_type === 'image' ? ((0, jsx_runtime_1.jsx)("img", { src: file.file_url, alt: file.title, className: "w-12 h-12 rounded object-cover" })) : ((0, jsx_runtime_1.jsx)("div", { className: "w-12 h-12 rounded bg-zinc-700 flex items-center justify-center", children: (0, jsx_runtime_1.jsx)(lucide_react_1.FileText, { size: 20, className: "text-zinc-400" }) })), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-white text-sm font-medium", children: file.title }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs", children: file.file_name })] })] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2 mt-2", children: [(0, jsx_runtime_1.jsxs)("a", { href: file.file_url, download: true, target: "_blank", rel: "noopener noreferrer", className: "flex-1 bg-zinc-700 hover:bg-zinc-600 text-white text-xs font-medium rounded-lg py-1.5 flex items-center justify-center gap-1 transition-colors", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Download, { size: 12 }), " Baixar"] }), (0, jsx_runtime_1.jsx)("button", { onClick: () => handleDeleteFile(file), className: "bg-zinc-700 hover:bg-red-600 text-zinc-400 hover:text-white rounded-lg px-2.5 py-1.5 transition-colors", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { size: 12 }) })] })] }, file.id))) }))] })) : ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-4", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-white font-bold", children: "Categorias" }), (0, jsx_runtime_1.jsxs)("button", { onClick: () => setShowCreateCat(!showCreateCat), className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 flex items-center gap-1.5 transition-all", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { size: 16 }), " Nova categoria"] })] }), showCreateCat && ((0, jsx_runtime_1.jsxs)("form", { onSubmit: handleCreateCat, className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 mb-4 flex gap-2", children: [(0, jsx_runtime_1.jsx)("input", { type: "text", value: catName, onChange: e => setCatName(e.target.value), required: true, placeholder: "Nome da categoria", className: "flex-1 bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: saving, className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 transition-all disabled:opacity-50", children: "Criar" })] })), loading ? ((0, jsx_runtime_1.jsx)("div", { className: "flex justify-center py-8", children: (0, jsx_runtime_1.jsx)("div", { className: "w-6 h-6 border-2 border-zinc-700 border-t-[#FFE500] rounded-full animate-spin" }) })) : categories.length === 0 ? ((0, jsx_runtime_1.jsxs)("div", { className: "text-center py-12", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Folder, { size: 40, className: "mx-auto text-zinc-700 mb-3" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-sm", children: "Nenhuma categoria criada ainda." })] })) : ((0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: categories.map(cat => ((0, jsx_runtime_1.jsx)("div", { className: "bg-zinc-800/50 border border-zinc-700 hover:border-[#FFE500]/30 rounded-lg p-4 cursor-pointer transition-all group", onClick: () => setSelectedCat(cat.id), children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-10 h-10 rounded-lg bg-[#FFE500]/10 flex items-center justify-center", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Folder, { size: 18, className: "text-[#FFE500]" }) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-white font-bold text-sm", children: cat.name }), (0, jsx_runtime_1.jsxs)("p", { className: "text-zinc-500 text-xs", children: [filesInCat(cat.id).length, " arquivo(s)"] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-1", onClick: e => e.stopPropagation(), children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ChevronRight, { size: 18, className: "text-zinc-600 group-hover:text-[#FFE500] transition-colors" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => handleDeleteCat(cat), className: "text-zinc-500 hover:text-red-400 p-1 transition-colors", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { size: 14 }) })] })] }) }, cat.id))) }))] })) })] }) }));
}

},
"/src/components/master/MonthlyFeesTool.tsx": function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MonthlyFeesTool;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const supabase_1 = require("@/lib/supabase");
const lucide_react_1 = require("lucide-react");
function MonthlyFeesTool({ onClose }) {
    const [fees, setFees] = (0, react_1.useState)([]);
    const [franchises, setFranchises] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [showCreate, setShowCreate] = (0, react_1.useState)(false);
    const [search, setSearch] = (0, react_1.useState)('');
    const [copiedPix, setCopiedPix] = (0, react_1.useState)(null);
    const [form, setForm] = (0, react_1.useState)({
        franchise_id: '',
        description: 'Mensalidade',
        amount: '',
        due_date: '',
        pix_key: '',
    });
    const [saving, setSaving] = (0, react_1.useState)(false);
    const [proofFile, setProofFile] = (0, react_1.useState)(null);
    const [uploadingId, setUploadingId] = (0, react_1.useState)(null);
    const load = async () => {
        const [{ data: feeData }, { data: franData }] = await Promise.all([
            supabase_1.supabase.from('monthly_fees').select('*').order('due_date', { ascending: false }),
            supabase_1.supabase.from('franchises').select('*').order('name'),
        ]);
        if (feeData)
            setFees(feeData);
        if (franData)
            setFranchises(franData);
        setLoading(false);
    };
    (0, react_1.useEffect)(() => { load(); }, []);
    const handleCreate = async (e) => {
        e.preventDefault();
        setSaving(true);
        const { error } = await supabase_1.supabase.from('monthly_fees').insert({
            franchise_id: form.franchise_id,
            description: form.description,
            amount: parseFloat(form.amount),
            due_date: form.due_date,
            pix_key: form.pix_key || null,
        });
        if (!error) {
            setForm({ franchise_id: '', description: 'Mensalidade', amount: '', due_date: '', pix_key: '' });
            setShowCreate(false);
            load();
        }
        setSaving(false);
    };
    const handleDelete = async (fee) => {
        if (!confirm('Excluir esta mensalidade?'))
            return;
        await supabase_1.supabase.from('monthly_fees').delete().eq('id', fee.id);
        load();
    };
    const handleUploadProof = async (fee, file) => {
        setUploadingId(fee.id);
        const ext = file.name.split('.').pop();
        const path = `${fee.id}.${ext}`;
        const { error: upErr } = await supabase_1.supabase.storage.from('fee-proofs').upload(path, file, { upsert: true });
        if (!upErr) {
            const url = supabase_1.supabase.storage.from('fee-proofs').getPublicUrl(path).data.publicUrl;
            await supabase_1.supabase.from('monthly_fees').update({
                proof_file_url: url,
                status: 'paid',
                paid_at: new Date().toISOString(),
            }).eq('id', fee.id);
            load();
        }
        setUploadingId(null);
    };
    const copyPix = (key) => {
        navigator.clipboard.writeText(key);
        setCopiedPix(key);
        setTimeout(() => setCopiedPix(null), 2000);
    };
    const franName = (id) => franchises.find(f => f.id === id)?.name ?? '—';
    const filtered = fees.filter(f => franName(f.franchise_id).toLowerCase().includes(search.toLowerCase()) ||
        f.description.toLowerCase().includes(search.toLowerCase()));
    const statusColor = (s) => {
        if (s === 'paid')
            return 'bg-green-500/10 text-green-400';
        if (s === 'overdue')
            return 'bg-red-500/10 text-red-400';
        return 'bg-yellow-500/10 text-yellow-400';
    };
    const statusLabel = (s) => s === 'paid' ? 'Paga' : s === 'overdue' ? 'Vencida' : 'Pendente';
    return ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm", onClick: onClose, children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto", onClick: e => e.stopPropagation(), children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-10 h-10 rounded-lg bg-[#FFE500]/10 flex items-center justify-center", children: (0, jsx_runtime_1.jsx)(lucide_react_1.DollarSign, { size: 20, className: "text-[#FFE500]" }) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h2", { className: "font-bold text-white text-lg", children: "Mensalidades" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs", children: "Gerencie cobran\u00E7as e comprovantes" })] })] }), (0, jsx_runtime_1.jsx)("button", { onClick: onClose, className: "text-zinc-400 hover:text-white transition-colors", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { size: 22 }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "p-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-4 gap-3 flex-wrap", children: [(0, jsx_runtime_1.jsxs)("div", { className: "relative flex-1 min-w-[200px]", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Search, { size: 16, className: "absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: search, onChange: e => setSearch(e.target.value), placeholder: "Buscar...", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-[#FFE500]/50" })] }), (0, jsx_runtime_1.jsxs)("button", { onClick: () => setShowCreate(!showCreate), className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 flex items-center gap-1.5 transition-all", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { size: 16 }), " Nova Mensalidade"] })] }), showCreate && ((0, jsx_runtime_1.jsxs)("form", { onSubmit: handleCreate, className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 mb-4 space-y-3", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Franquia" }), (0, jsx_runtime_1.jsxs)("select", { value: form.franchise_id, onChange: e => setForm({ ...form, franchise_id: e.target.value }), required: true, className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]", children: [(0, jsx_runtime_1.jsx)("option", { value: "", children: "Selecione..." }), franchises.map(f => (0, jsx_runtime_1.jsx)("option", { value: f.id, children: f.name }, f.id))] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Descri\u00E7\u00E3o" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: form.description, onChange: e => setForm({ ...form, description: e.target.value }), required: true, className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Valor (R$)" }), (0, jsx_runtime_1.jsx)("input", { type: "number", step: "0.01", value: form.amount, onChange: e => setForm({ ...form, amount: e.target.value }), required: true, className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Vencimento" }), (0, jsx_runtime_1.jsx)("input", { type: "date", value: form.due_date, onChange: e => setForm({ ...form, due_date: e.target.value }), required: true, className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Chave PIX" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: form.pix_key, onChange: e => setForm({ ...form, pix_key: e.target.value }), placeholder: "email, telefone, CPF ou aleat\u00F3ria", className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2", children: [(0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: saving, className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 transition-all disabled:opacity-50", children: saving ? 'Criando...' : 'Criar mensalidade' }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setShowCreate(false), className: "bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors", children: "Cancelar" })] })] })), loading ? ((0, jsx_runtime_1.jsx)("div", { className: "flex justify-center py-8", children: (0, jsx_runtime_1.jsx)("div", { className: "w-6 h-6 border-2 border-zinc-700 border-t-[#FFE500] rounded-full animate-spin" }) })) : filtered.length === 0 ? ((0, jsx_runtime_1.jsxs)("div", { className: "text-center py-12", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.DollarSign, { size: 40, className: "mx-auto text-zinc-700 mb-3" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-sm", children: "Nenhuma mensalidade criada ainda." })] })) : ((0, jsx_runtime_1.jsx)("div", { className: "space-y-3", children: filtered.map(fee => ((0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-start justify-between mb-3", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 mb-1", children: [(0, jsx_runtime_1.jsx)("h4", { className: "text-white font-bold text-sm", children: franName(fee.franchise_id) }), (0, jsx_runtime_1.jsx)("span", { className: `text-xs px-2 py-0.5 rounded-full ${statusColor(fee.status)}`, children: statusLabel(fee.status) })] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-zinc-400 text-xs", children: [fee.description, " \u2014 Venc.: ", new Date(fee.due_date).toLocaleDateString('pt-BR')] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-[#FFE500] font-bold text-lg mt-1", children: ["R$ ", fee.amount.toFixed(2)] })] }), (0, jsx_runtime_1.jsx)("button", { onClick: () => handleDelete(fee), className: "text-zinc-400 hover:text-red-400 p-1.5 transition-colors", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { size: 15 }) })] }), fee.pix_key && ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 mb-3", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-zinc-500 text-xs", children: "PIX:" }), (0, jsx_runtime_1.jsx)("span", { className: "text-white text-xs flex-1 truncate", children: fee.pix_key }), (0, jsx_runtime_1.jsx)("button", { onClick: () => copyPix(fee.pix_key), className: "text-zinc-400 hover:text-[#FFE500] transition-colors", children: copiedPix === fee.pix_key ? (0, jsx_runtime_1.jsx)(lucide_react_1.Check, { size: 14, className: "text-green-400" }) : (0, jsx_runtime_1.jsx)(lucide_react_1.Copy, { size: 14 }) })] })), fee.proof_file_url ? ((0, jsx_runtime_1.jsx)("div", { className: "flex items-center gap-2", children: (0, jsx_runtime_1.jsxs)("a", { href: fee.proof_file_url, target: "_blank", rel: "noopener noreferrer", className: "flex items-center gap-1.5 text-green-400 text-xs hover:text-green-300 transition-colors", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Eye, { size: 14 }), " Ver comprovante"] }) })) : ((0, jsx_runtime_1.jsxs)("label", { className: "flex items-center gap-1.5 text-zinc-400 text-xs hover:text-[#FFE500] cursor-pointer transition-colors", children: [uploadingId === fee.id ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { className: "w-3 h-3 border-2 border-zinc-600 border-t-[#FFE500] rounded-full animate-spin" }), " Enviando..."] })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Upload, { size: 14 }), " Anexar comprovante"] })), (0, jsx_runtime_1.jsx)("input", { type: "file", accept: "image/*,.pdf", className: "hidden", onChange: e => e.target.files?.[0] && handleUploadProof(fee, e.target.files[0]) })] }))] }, fee.id))) }))] })] }) }));
}

},
"/src/components/master/ProductLinkTool.tsx": function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ProductLinkTool;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const supabase_1 = require("@/lib/supabase");
const lucide_react_1 = require("lucide-react");
function ProductLinkTool({ onClose }) {
    const [products, setProducts] = (0, react_1.useState)([]);
    const [categories, setCategories] = (0, react_1.useState)([]);
    const [franchises, setFranchises] = (0, react_1.useState)([]);
    const [franchiseProducts, setFranchiseProducts] = (0, react_1.useState)([]);
    const [franchiseCategories, setFranchiseCategories] = (0, react_1.useState)([]);
    const [franchiseGroups, setFranchiseGroups] = (0, react_1.useState)([]);
    const [franchiseAddons, setFranchiseAddons] = (0, react_1.useState)([]);
    const [franchiseLinks, setFranchiseLinks] = (0, react_1.useState)([]);
    const [masterGroups, setMasterGroups] = (0, react_1.useState)([]);
    const [masterAddons, setMasterAddons] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [search, setSearch] = (0, react_1.useState)('');
    const [categoryFilter, setCategoryFilter] = (0, react_1.useState)('');
    const [expandedProduct, setExpandedProduct] = (0, react_1.useState)(null);
    const [saving, setSaving] = (0, react_1.useState)(false);
    const [bulkMode, setBulkMode] = (0, react_1.useState)(false);
    const [bulkSelectedFranchises, setBulkSelectedFranchises] = (0, react_1.useState)(new Set());
    const [bulkSelectedProducts, setBulkSelectedProducts] = (0, react_1.useState)(new Set());
    const [feedback, setFeedback] = (0, react_1.useState)(null);
    const load = async () => {
        const [{ data: prods }, { data: cats }, { data: frans }, { data: fp }, { data: fCats }, { data: fGrps }, { data: fAdns }, { data: fLinks }, { data: mGrps }, { data: mAdns }] = await Promise.all([
            supabase_1.supabase.from('products').select('*').order('name'),
            supabase_1.supabase.from('product_categories').select('*').order('name'),
            supabase_1.supabase.from('franchises').select('*').order('name'),
            supabase_1.supabase.from('franchise_products').select('*'),
            supabase_1.supabase.from('franchise_categories').select('*'),
            supabase_1.supabase.from('franchise_groups').select('*'),
            supabase_1.supabase.from('franchise_addons').select('*'),
            supabase_1.supabase.from('product_group_links').select('*'),
            supabase_1.supabase.from('product_groups').select('*').order('name'),
            supabase_1.supabase.from('product_addons').select('*').order('name'),
        ]);
        if (prods)
            setProducts(prods);
        if (cats)
            setCategories(cats);
        if (frans)
            setFranchises(frans);
        if (fp)
            setFranchiseProducts(fp);
        if (fCats)
            setFranchiseCategories(fCats);
        if (fGrps)
            setFranchiseGroups(fGrps);
        if (fAdns)
            setFranchiseAddons(fAdns);
        if (fLinks)
            setFranchiseLinks(fLinks);
        if (mGrps)
            setMasterGroups(mGrps);
        if (mAdns)
            setMasterAddons(mAdns);
        setLoading(false);
    };
    (0, react_1.useEffect)(() => { load(); }, []);
    const isLinked = (productId, franchiseId) => {
        return franchiseProducts.find(fp => fp.franchise_id === franchiseId && fp.source_product_id === productId) ?? null;
    };
    const getLinkState = (productId) => {
        return franchises.map(f => {
            const fp = isLinked(productId, f.id);
            return { productId, franchiseId: f.id, linked: !!fp, franchiseProductId: fp?.id ?? null };
        });
    };
    const syncProductToFranchise = async (product, franchiseId, ctx) => {
        let franchiseCategoryId = null;
        if (product.category_id) {
            const masterCat = categories.find(c => c.id === product.category_id);
            if (masterCat) {
                let existing = ctx.fCats.find(fc => fc.franchise_id === franchiseId && fc.name === masterCat.name);
                if (!existing) {
                    const maxSort = ctx.fCats.filter(fc => fc.franchise_id === franchiseId).reduce((max, fc) => Math.max(max, fc.sort_order), 0);
                    const { data: newCat } = await supabase_1.supabase.from('franchise_categories').insert({
                        franchise_id: franchiseId, name: masterCat.name, sort_order: maxSort + 1,
                    }).select().single();
                    if (newCat) {
                        existing = newCat;
                        ctx.fCats.push(existing);
                    }
                }
                if (existing)
                    franchiseCategoryId = existing.id;
            }
        }
        const existingProduct = ctx.fProds.find(fp => fp.franchise_id === franchiseId && fp.source_product_id === product.id);
        const payload = {
            franchise_id: franchiseId, category_id: franchiseCategoryId,
            name: product.name, description: product.description, price: product.price,
            discount_price: product.discount_price, image_url: product.image_url,
            gallery_urls: product.gallery_urls, long_description: product.long_description,
            ingredients: product.ingredients, nutritional_info: product.nutritional_info,
            usage_instructions: product.usage_instructions, brand: product.brand,
            flavor: product.flavor, weight: product.weight, video_urls: product.video_urls,
            source_product_id: product.id,
        };
        const { data: fpData } = existingProduct
            ? await supabase_1.supabase.from('franchise_products').update(payload).eq('id', existingProduct.id).select().maybeSingle()
            : await supabase_1.supabase.from('franchise_products').insert({ ...payload, stock: 0, sort_order: ctx.fProds.filter(fp => fp.franchise_id === franchiseId).reduce((max, fp) => Math.max(max, fp.sort_order), 0) + 1, active: true }).select().maybeSingle();
        if (!fpData)
            return null;
        const newFp = fpData;
        if (existingProduct) {
            const index = ctx.fProds.findIndex(fp => fp.id === existingProduct.id);
            if (index >= 0)
                ctx.fProds[index] = newFp;
        }
        else {
            ctx.fProds.push(newFp);
        }
        const categoryGroups = masterGroups.filter(g => g.category_id === product.category_id);
        for (const masterGroup of categoryGroups) {
            let existingGroup = ctx.fGrps.find(fg => fg.franchise_id === franchiseId && fg.name === masterGroup.name);
            if (!existingGroup) {
                const { data: newGroup } = await supabase_1.supabase.from('franchise_groups').insert({
                    franchise_id: franchiseId, name: masterGroup.name,
                }).select().single();
                if (newGroup) {
                    existingGroup = newGroup;
                    ctx.fGrps.push(existingGroup);
                }
            }
            if (!existingGroup)
                continue;
            const groupAddons = masterAddons.filter(a => a.group_id === masterGroup.id);
            for (const addon of groupAddons) {
                const exists = ctx.fAdns.find(fa => fa.group_id === existingGroup.id && fa.name === addon.name);
                if (!exists) {
                    const { data: newAddon } = await supabase_1.supabase.from('franchise_addons').insert({
                        group_id: existingGroup.id, name: addon.name, price: addon.price, is_free: addon.price === 0,
                    }).select().single();
                    if (newAddon)
                        ctx.fAdns.push(newAddon);
                }
            }
            const linkExists = ctx.fLinks.some(l => l.product_id === newFp.id && l.group_id === existingGroup.id);
            if (!linkExists) {
                const { data: newLink } = await supabase_1.supabase.from('product_group_links').insert({
                    product_id: newFp.id, group_id: existingGroup.id,
                }).select().single();
                if (newLink)
                    ctx.fLinks.push(newLink);
            }
        }
        return newFp;
    };
    const toggleLink = async (productId, franchiseId) => {
        setSaving(true);
        setFeedback(null);
        const existing = isLinked(productId, franchiseId);
        const product = products.find(p => p.id === productId);
        if (!product) {
            setSaving(false);
            return;
        }
        if (existing) {
            await supabase_1.supabase.from('franchise_products').delete().eq('id', existing.id);
            setFeedback(`"${product.name}" removido de ${franchises.find(f => f.id === franchiseId)?.name}`);
        }
        else {
            const ctx = {
                fCats: [...franchiseCategories],
                fGrps: [...franchiseGroups],
                fAdns: [...franchiseAddons],
                fProds: [...franchiseProducts],
                fLinks: [...franchiseLinks],
            };
            const newFp = await syncProductToFranchise(product, franchiseId, ctx);
            if (newFp) {
                setFranchiseCategories(ctx.fCats);
                setFranchiseGroups(ctx.fGrps);
                setFranchiseAddons(ctx.fAdns);
                setFranchiseProducts(ctx.fProds);
                setFranchiseLinks(ctx.fLinks);
            }
            setFeedback(`"${product.name}" vinculado a ${franchises.find(f => f.id === franchiseId)?.name}`);
        }
        setSaving(false);
        setTimeout(() => setFeedback(null), 3000);
    };
    const handleBulkLink = async () => {
        if (bulkSelectedProducts.size === 0 || bulkSelectedFranchises.size === 0)
            return;
        setSaving(true);
        setFeedback(null);
        let inserted = 0;
        let skipped = 0;
        const selectedProducts = products.filter(p => bulkSelectedProducts.has(p.id));
        const selectedFranchises = franchises.filter(f => bulkSelectedFranchises.has(f.id));
        const ctx = {
            fCats: [...franchiseCategories],
            fGrps: [...franchiseGroups],
            fAdns: [...franchiseAddons],
            fProds: [...franchiseProducts],
            fLinks: [...franchiseLinks],
        };
        for (const product of selectedProducts) {
            for (const franchise of selectedFranchises) {
                if (isLinked(product.id, franchise.id)) {
                    skipped++;
                    continue;
                }
                const newFp = await syncProductToFranchise(product, franchise.id, ctx);
                if (newFp)
                    inserted++;
            }
        }
        setFranchiseCategories(ctx.fCats);
        setFranchiseGroups(ctx.fGrps);
        setFranchiseAddons(ctx.fAdns);
        setFranchiseProducts(ctx.fProds);
        setFranchiseLinks(ctx.fLinks);
        setFeedback(`${inserted} produto(s) vinculado(s) a ${bulkSelectedFranchises.size} franquia(s)${skipped > 0 ? `, ${skipped} já estavam vinculados` : ''}`);
        setBulkSelectedProducts(new Set());
        setBulkSelectedFranchises(new Set());
        setSaving(false);
        setTimeout(() => setFeedback(null), 4000);
    };
    const toggleBulkProduct = (id) => {
        const next = new Set(bulkSelectedProducts);
        next.has(id) ? next.delete(id) : next.add(id);
        setBulkSelectedProducts(next);
    };
    const toggleBulkFranchise = (id) => {
        const next = new Set(bulkSelectedFranchises);
        next.has(id) ? next.delete(id) : next.add(id);
        setBulkSelectedFranchises(next);
    };
    const selectAllFranchises = () => {
        if (bulkSelectedFranchises.size === franchises.length) {
            setBulkSelectedFranchises(new Set());
        }
        else {
            setBulkSelectedFranchises(new Set(franchises.map(f => f.id)));
        }
    };
    const filteredProducts = products.filter(p => {
        const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = !categoryFilter || p.category_id === categoryFilter;
        return matchesSearch && matchesCategory;
    });
    const catName = (id) => categories.find(c => c.id === id)?.name ?? 'Sem categoria';
    const linkedCount = (productId) => getLinkState(productId).filter(s => s.linked).length;
    return ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm", onClick: onClose, children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto", onClick: e => e.stopPropagation(), children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-10 h-10 rounded-lg bg-[#FFE500]/10 flex items-center justify-center", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Link2, { size: 20, className: "text-[#FFE500]" }) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h2", { className: "font-bold text-white text-lg", children: "Vincular Produtos" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs", children: "Distribua produtos do cat\u00E1logo master para as franquias" })] })] }), (0, jsx_runtime_1.jsx)("button", { onClick: onClose, className: "text-zinc-400 hover:text-white transition-colors", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { size: 22 }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "p-6 space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => setBulkMode(false), className: `flex-1 text-sm font-bold rounded-lg py-2.5 transition-all ${!bulkMode ? 'bg-[#FFE500] text-black' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`, children: "Individual" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setBulkMode(true), className: `flex-1 text-sm font-bold rounded-lg py-2.5 transition-all ${bulkMode ? 'bg-[#FFE500] text-black' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`, children: "Em Lote" })] }), feedback && ((0, jsx_runtime_1.jsxs)("div", { className: "bg-green-500/10 border border-green-500/20 rounded-lg p-3 flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle2, { size: 16, className: "text-green-400" }), (0, jsx_runtime_1.jsx)("p", { className: "text-green-400 text-sm", children: feedback })] })), bulkMode && ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-xl p-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-3", children: [(0, jsx_runtime_1.jsxs)("h4", { className: "text-white font-bold text-sm flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Store, { size: 16, className: "text-[#FFE500]" }), " Franquias (", bulkSelectedFranchises.size, "/", franchises.length, ")"] }), (0, jsx_runtime_1.jsx)("button", { onClick: selectAllFranchises, className: "text-xs text-[#FFE500] hover:underline font-medium", children: bulkSelectedFranchises.size === franchises.length ? 'Desmarcar todas' : 'Selecionar todas' })] }), (0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-2", children: franchises.map(f => {
                                                const selected = bulkSelectedFranchises.has(f.id);
                                                return ((0, jsx_runtime_1.jsxs)("button", { onClick: () => toggleBulkFranchise(f.id), className: `flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all border ${selected ? 'bg-[#FFE500]/10 border-[#FFE500]/40 text-white' : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-600'}`, children: [(0, jsx_runtime_1.jsx)("div", { className: `w-4 h-4 rounded border flex items-center justify-center ${selected ? 'bg-[#FFE500] border-[#FFE500]' : 'border-zinc-600'}`, children: selected && (0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle2, { size: 12, className: "text-black" }) }), (0, jsx_runtime_1.jsx)("span", { className: "truncate", children: f.name })] }, f.id));
                                            }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-xl p-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-3", children: [(0, jsx_runtime_1.jsxs)("h4", { className: "text-white font-bold text-sm flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Package, { size: 16, className: "text-[#FFE500]" }), " Produtos (", bulkSelectedProducts.size, ")"] }), (0, jsx_runtime_1.jsx)("button", { onClick: () => bulkSelectedProducts.size === filteredProducts.length ? setBulkSelectedProducts(new Set()) : setBulkSelectedProducts(new Set(filteredProducts.map(p => p.id))), className: "text-xs text-[#FFE500] hover:underline font-medium", children: bulkSelectedProducts.size === filteredProducts.length && filteredProducts.length > 0 ? 'Desmarcar todos' : 'Selecionar todos' })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2 mb-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "relative flex-1", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Search, { size: 14, className: "absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: search, onChange: e => setSearch(e.target.value), placeholder: "Buscar produto...", className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), (0, jsx_runtime_1.jsxs)("select", { value: categoryFilter, onChange: e => setCategoryFilter(e.target.value), className: "bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]", children: [(0, jsx_runtime_1.jsx)("option", { value: "", children: "Todas categorias" }), categories.map(c => (0, jsx_runtime_1.jsx)("option", { value: c.id, children: c.name }, c.id))] })] }), (0, jsx_runtime_1.jsx)("div", { className: "max-h-48 overflow-y-auto space-y-1.5", children: filteredProducts.length === 0 ? (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-sm text-center py-4", children: "Nenhum produto encontrado." }) :
                                                filteredProducts.map(p => {
                                                    const selected = bulkSelectedProducts.has(p.id);
                                                    return ((0, jsx_runtime_1.jsxs)("button", { onClick: () => toggleBulkProduct(p.id), className: `w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all border ${selected ? 'bg-[#FFE500]/10 border-[#FFE500]/40' : 'bg-zinc-900 border-zinc-700 hover:border-zinc-600'}`, children: [(0, jsx_runtime_1.jsx)("div", { className: `w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${selected ? 'bg-[#FFE500] border-[#FFE500]' : 'border-zinc-600'}`, children: selected && (0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle2, { size: 12, className: "text-black" }) }), p.image_url ? (0, jsx_runtime_1.jsx)("img", { src: p.image_url, alt: p.name, className: "w-8 h-8 rounded object-cover" }) :
                                                                (0, jsx_runtime_1.jsx)("div", { className: "w-8 h-8 rounded bg-zinc-700 flex items-center justify-center", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Package, { size: 14, className: "text-zinc-400" }) }), (0, jsx_runtime_1.jsx)("span", { className: "text-white font-medium truncate flex-1 text-left", children: p.name }), (0, jsx_runtime_1.jsxs)("span", { className: "text-[#FFE500] text-xs font-bold", children: ["R$ ", p.price.toFixed(2)] })] }, p.id));
                                                }) })] }), (0, jsx_runtime_1.jsx)("button", { onClick: handleBulkLink, disabled: saving || bulkSelectedProducts.size === 0 || bulkSelectedFranchises.size === 0, className: "w-full bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg py-3 flex items-center justify-center gap-2 transition-all disabled:opacity-50", children: saving ? (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { className: "w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" }), " Vinculando..."] }) : (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Link2, { size: 16 }), " Vincular ", bulkSelectedProducts.size, " produto(s) a ", bulkSelectedFranchises.size, " franquia(s)"] }) })] })), !bulkMode && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2", children: [(0, jsx_runtime_1.jsxs)("div", { className: "relative flex-1", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Search, { size: 14, className: "absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: search, onChange: e => setSearch(e.target.value), placeholder: "Buscar produto...", className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), (0, jsx_runtime_1.jsxs)("select", { value: categoryFilter, onChange: e => setCategoryFilter(e.target.value), className: "bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]", children: [(0, jsx_runtime_1.jsx)("option", { value: "", children: "Todas categorias" }), categories.map(c => (0, jsx_runtime_1.jsx)("option", { value: c.id, children: c.name }, c.id))] })] }), loading ? (0, jsx_runtime_1.jsx)("div", { className: "flex justify-center py-12", children: (0, jsx_runtime_1.jsx)("div", { className: "w-6 h-6 border-2 border-zinc-700 border-t-[#FFE500] rounded-full animate-spin" }) }) :
                                    filteredProducts.length === 0 ? ((0, jsx_runtime_1.jsxs)("div", { className: "text-center py-12 bg-zinc-800/50 border border-zinc-700 rounded-xl", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Package, { size: 40, className: "mx-auto text-zinc-700 mb-3" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-sm", children: "Nenhum produto cadastrado no master." })] })) : ((0, jsx_runtime_1.jsx)("div", { className: "space-y-2", children: filteredProducts.map(p => {
                                            const expanded = expandedProduct === p.id;
                                            const count = linkedCount(p.id);
                                            return ((0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-xl overflow-hidden", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between p-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3 flex-1 min-w-0", children: [p.image_url ? (0, jsx_runtime_1.jsx)("img", { src: p.image_url, alt: p.name, className: "w-10 h-10 rounded-lg object-cover flex-shrink-0" }) :
                                                                        (0, jsx_runtime_1.jsx)("div", { className: "w-10 h-10 rounded-lg bg-zinc-700 flex items-center justify-center flex-shrink-0", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Package, { size: 18, className: "text-zinc-400" }) }), (0, jsx_runtime_1.jsxs)("div", { className: "min-w-0", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-white font-medium text-sm truncate", children: p.name }), (0, jsx_runtime_1.jsxs)("p", { className: "text-zinc-500 text-xs", children: [catName(p.category_id), " \u2014 R$ ", p.price.toFixed(2)] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3 flex-shrink-0", children: [(0, jsx_runtime_1.jsxs)("span", { className: `text-xs font-bold px-2.5 py-1 rounded-full ${count > 0 ? 'bg-green-500/10 text-green-400' : 'bg-zinc-700 text-zinc-400'}`, children: [count, "/", franchises.length] }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setExpandedProduct(expanded ? null : p.id), className: "text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-700 transition-colors", children: expanded ? (0, jsx_runtime_1.jsx)(lucide_react_1.ChevronUp, { size: 16 }) : (0, jsx_runtime_1.jsx)(lucide_react_1.ChevronDown, { size: 16 }) })] })] }), expanded && ((0, jsx_runtime_1.jsxs)("div", { className: "border-t border-zinc-700 p-3 space-y-1.5 bg-zinc-900/50", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs mb-2", children: "Selecione as franquias para vincular este produto:" }), franchises.map(f => {
                                                                const linked = isLinked(p.id, f.id);
                                                                return ((0, jsx_runtime_1.jsxs)("button", { onClick: () => toggleLink(p.id, f.id), disabled: saving, className: `w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-all border ${linked ? 'bg-green-500/10 border-green-500/30' : 'bg-zinc-800 border-zinc-700 hover:border-zinc-600'} disabled:opacity-50`, children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Store, { size: 14, className: linked ? 'text-green-400' : 'text-zinc-500' }), (0, jsx_runtime_1.jsx)("span", { className: linked ? 'text-white' : 'text-zinc-300', children: f.name })] }), linked ? ((0, jsx_runtime_1.jsxs)("span", { className: "flex items-center gap-1 text-green-400 text-xs font-bold", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle2, { size: 14 }), " Vinculado"] })) : ((0, jsx_runtime_1.jsx)("span", { className: "text-zinc-500 text-xs", children: "Clique para vincular" }))] }, f.id));
                                                            })] }))] }, p.id));
                                        }) }))] }))] })] }) }));
}

},
"/src/components/master/RankingTool.tsx": function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RankingTool;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const supabase_1 = require("@/lib/supabase");
const lucide_react_1 = require("lucide-react");
function RankingTool({ onClose }) {
    const [ranking, setRanking] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [period, setPeriod] = (0, react_1.useState)('month');
    const load = async () => {
        const { data: sales } = await supabase_1.supabase.from('sales').select('franchise_id, total, created_at');
        const { data: franchises } = await supabase_1.supabase.from('franchises').select('*');
        if (!sales || !franchises) {
            setLoading(false);
            return;
        }
        const now = new Date();
        const filterDate = new Date();
        if (period === 'week')
            filterDate.setDate(now.getDate() - 7);
        if (period === 'month')
            filterDate.setMonth(now.getMonth() - 1);
        if (period === 'all')
            filterDate.setFullYear(2000);
        const map = new Map();
        for (const f of franchises) {
            map.set(f.id, { franchise_id: f.id, name: f.name, total: 0, count: 0 });
        }
        for (const s of sales) {
            const d = new Date(s.created_at);
            if (d < filterDate)
                continue;
            const entry = map.get(s.franchise_id);
            if (entry) {
                entry.total += s.total;
                entry.count += 1;
            }
        }
        setRanking(Array.from(map.values()).sort((a, b) => b.total - a.total));
        setLoading(false);
    };
    (0, react_1.useEffect)(() => { load(); }, [period]);
    const medal = (i) => {
        if (i === 0)
            return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
        if (i === 1)
            return 'bg-zinc-400/20 text-zinc-300 border-zinc-400/30';
        if (i === 2)
            return 'bg-orange-600/20 text-orange-400 border-orange-600/30';
        return 'bg-zinc-800 text-zinc-500 border-zinc-700';
    };
    return ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm", onClick: onClose, children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto", onClick: e => e.stopPropagation(), children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-10 h-10 rounded-lg bg-[#FFE500]/10 flex items-center justify-center", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trophy, { size: 20, className: "text-[#FFE500]" }) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h2", { className: "font-bold text-white text-lg", children: "Ranking de Faturamento" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs", children: "Competi\u00E7\u00E3o entre as unidades" })] })] }), (0, jsx_runtime_1.jsx)("button", { onClick: onClose, className: "text-zinc-400 hover:text-white transition-colors", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { size: 22 }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "p-6", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex gap-2 mb-4", children: [
                                { key: 'week', label: 'Semana' },
                                { key: 'month', label: 'Mês' },
                                { key: 'all', label: 'Geral' },
                            ].map(p => ((0, jsx_runtime_1.jsx)("button", { onClick: () => { setLoading(true); setPeriod(p.key); }, className: `text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${period === p.key ? 'bg-[#FFE500] text-black' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`, children: p.label }, p.key))) }), loading ? ((0, jsx_runtime_1.jsx)("div", { className: "flex justify-center py-8", children: (0, jsx_runtime_1.jsx)("div", { className: "w-6 h-6 border-2 border-zinc-700 border-t-[#FFE500] rounded-full animate-spin" }) })) : ranking.length === 0 || ranking.every(r => r.total === 0) ? ((0, jsx_runtime_1.jsxs)("div", { className: "text-center py-12", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.TrendingUp, { size: 40, className: "mx-auto text-zinc-700 mb-3" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-sm", children: "Sem dados de vendas ainda." })] })) : ((0, jsx_runtime_1.jsx)("div", { className: "space-y-2", children: ranking.map((entry, i) => ((0, jsx_runtime_1.jsxs)("div", { className: `flex items-center gap-3 border rounded-lg p-3 ${medal(i)}`, children: [(0, jsx_runtime_1.jsx)("div", { className: `w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg ${i < 3 ? '' : 'bg-zinc-700/50'}`, children: i + 1 }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-white font-bold text-sm", children: entry.name }), (0, jsx_runtime_1.jsxs)("p", { className: "text-zinc-500 text-xs", children: [entry.count, " vendas"] })] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-[#FFE500] font-bold text-lg", children: ["R$ ", entry.total.toFixed(2)] })] }, entry.franchise_id))) }))] })] }) }));
}

},
"/src/components/master/ReportsTool.tsx": function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ReportsTool;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const supabase_1 = require("@/lib/supabase");
const lucide_react_1 = require("lucide-react");
function ReportsTool({ onClose }) {
    const [sales, setSales] = (0, react_1.useState)([]);
    const [franchises, setFranchises] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [filterFran, setFilterFran] = (0, react_1.useState)('all');
    const [filterStart, setFilterStart] = (0, react_1.useState)('');
    const [filterEnd, setFilterEnd] = (0, react_1.useState)('');
    const [filterProduct, setFilterProduct] = (0, react_1.useState)('');
    const [filterCampaign, setFilterCampaign] = (0, react_1.useState)('');
    const [filterDeliverySource, setFilterDeliverySource] = (0, react_1.useState)('all');
    const [filterPaymentMethod, setFilterPaymentMethod] = (0, react_1.useState)('all');
    const [filterSaleType, setFilterSaleType] = (0, react_1.useState)('all');
    const [filterUser, setFilterUser] = (0, react_1.useState)('all');
    const [franchiseUsers, setFranchiseUsers] = (0, react_1.useState)([]);
    const [showDetails, setShowDetails] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        (async () => {
            const [{ data: saleData }, { data: franData }, { data: userData }] = await Promise.all([
                supabase_1.supabase.from('sales').select('*'),
                supabase_1.supabase.from('franchises').select('*').order('name'),
                supabase_1.supabase.from('franchise_users').select('*').order('name'),
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
    const filtered = (0, react_1.useMemo)(() => {
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
    const byPaymentMethod = (0, react_1.useMemo)(() => {
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
    const bySaleType = (0, react_1.useMemo)(() => {
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
    const byDeliverySource = (0, react_1.useMemo)(() => {
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
    const byFranchise = (0, react_1.useMemo)(() => {
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
    const byMonth = (0, react_1.useMemo)(() => {
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
    return ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm", onClick: onClose, children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto", onClick: e => e.stopPropagation(), children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-10 h-10 rounded-lg bg-[#FFE500]/10 flex items-center justify-center", children: (0, jsx_runtime_1.jsx)(lucide_react_1.BarChart3, { size: 20, className: "text-[#FFE500]" }) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h2", { className: "font-bold text-white text-lg", children: "Relat\u00F3rios" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs", children: "Vis\u00E3o geral e unificada das unidades" })] })] }), (0, jsx_runtime_1.jsx)("button", { onClick: onClose, className: "text-zinc-400 hover:text-white transition-colors", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { size: 22 }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "p-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 mb-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 mb-3", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Filter, { size: 16, className: "text-[#FFE500]" }), (0, jsx_runtime_1.jsx)("span", { className: "text-white text-sm font-medium", children: "Filtros" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Franquia" }), (0, jsx_runtime_1.jsxs)("select", { value: filterFran, onChange: e => setFilterFran(e.target.value), className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]", children: [(0, jsx_runtime_1.jsx)("option", { value: "all", children: "Todas" }), franchises.map(f => (0, jsx_runtime_1.jsx)("option", { value: f.id, children: f.name }, f.id))] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "De" }), (0, jsx_runtime_1.jsx)("input", { type: "date", value: filterStart, onChange: e => setFilterStart(e.target.value), className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "At\u00E9" }), (0, jsx_runtime_1.jsx)("input", { type: "date", value: filterEnd, onChange: e => setFilterEnd(e.target.value), className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Produto" }), (0, jsx_runtime_1.jsx)("input", { value: filterProduct, onChange: e => setFilterProduct(e.target.value), placeholder: "Nome do produto", className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Campanha" }), (0, jsx_runtime_1.jsx)("input", { value: filterCampaign, onChange: e => setFilterCampaign(e.target.value), placeholder: "Nome da campanha", className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Origem da venda" }), (0, jsx_runtime_1.jsxs)("select", { value: filterDeliverySource, onChange: e => setFilterDeliverySource(e.target.value), className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]", children: [(0, jsx_runtime_1.jsx)("option", { value: "all", children: "Todas" }), (0, jsx_runtime_1.jsx)("option", { value: "counter", children: "Balc\u00E3o (sem entrega)" }), (0, jsx_runtime_1.jsx)("option", { value: "delivery", children: "Delivery (todas plataformas)" }), (0, jsx_runtime_1.jsx)("option", { value: "whatsapp", children: "WhatsApp" }), (0, jsx_runtime_1.jsx)("option", { value: "ifood", children: "iFood" }), (0, jsx_runtime_1.jsx)("option", { value: "uber_eats", children: "Uber Eats" }), (0, jsx_runtime_1.jsx)("option", { value: "rappi", children: "Rappi" }), (0, jsx_runtime_1.jsx)("option", { value: "99delivery", children: "99 Delivery" }), (0, jsx_runtime_1.jsx)("option", { value: "phone", children: "Telefone" }), (0, jsx_runtime_1.jsx)("option", { value: "other", children: "Outro" })] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Forma de pagamento" }), (0, jsx_runtime_1.jsxs)("select", { value: filterPaymentMethod, onChange: e => setFilterPaymentMethod(e.target.value), className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]", children: [(0, jsx_runtime_1.jsx)("option", { value: "all", children: "Todas" }), (0, jsx_runtime_1.jsx)("option", { value: "pix", children: "PIX" }), (0, jsx_runtime_1.jsx)("option", { value: "credit_card", children: "Cart\u00E3o de Cr\u00E9dito" }), (0, jsx_runtime_1.jsx)("option", { value: "debit_card", children: "Cart\u00E3o de D\u00E9bito" }), (0, jsx_runtime_1.jsx)("option", { value: "cash", children: "Dinheiro" }), (0, jsx_runtime_1.jsx)("option", { value: "meal_voucher", children: "Vale-refei\u00E7\u00E3o" })] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Tipo de opera\u00E7\u00E3o" }), (0, jsx_runtime_1.jsxs)("select", { value: filterSaleType, onChange: e => setFilterSaleType(e.target.value), className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]", children: [(0, jsx_runtime_1.jsx)("option", { value: "all", children: "Todas" }), (0, jsx_runtime_1.jsx)("option", { value: "counter", children: "Balc\u00E3o" }), (0, jsx_runtime_1.jsx)("option", { value: "sponsorship", children: "Patroc\u00EDnio" }), (0, jsx_runtime_1.jsx)("option", { value: "tasting", children: "Degusta\u00E7\u00E3o" }), (0, jsx_runtime_1.jsx)("option", { value: "gift", children: "Brindes" })] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Usu\u00E1rio" }), (0, jsx_runtime_1.jsxs)("select", { value: filterUser, onChange: e => setFilterUser(e.target.value), className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]", children: [(0, jsx_runtime_1.jsx)("option", { value: "all", children: "Todos" }), franchiseUsers.map(u => (0, jsx_runtime_1.jsx)("option", { value: u.id, children: u.name }, u.id))] })] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-xl p-5", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-2", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-sm", children: "Faturamento" }), (0, jsx_runtime_1.jsx)(lucide_react_1.DollarSign, { size: 20, className: "text-[#FFE500]" })] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-2xl font-bold text-white", children: ["R$ ", totalRevenue.toFixed(2)] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-xl p-5", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-2", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-sm", children: "Vendas" }), (0, jsx_runtime_1.jsx)(lucide_react_1.TrendingUp, { size: 20, className: "text-[#FFE500]" })] }), (0, jsx_runtime_1.jsx)("p", { className: "text-2xl font-bold text-white", children: totalSales })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-xl p-5", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-2", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-sm", children: "Ticket m\u00E9dio" }), (0, jsx_runtime_1.jsx)(lucide_react_1.Store, { size: 20, className: "text-[#FFE500]" })] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-2xl font-bold text-white", children: ["R$ ", avgTicket.toFixed(2)] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-xl p-5", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-2", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-sm", children: "Descontos" }), (0, jsx_runtime_1.jsx)(lucide_react_1.DollarSign, { size: 20, className: "text-[#FFE500]" })] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-2xl font-bold text-white", children: ["R$ ", totalDiscount.toFixed(2)] })] })] }), totalDeliveryFee > 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 mb-6", children: [(0, jsx_runtime_1.jsxs)("h3", { className: "text-white font-bold text-sm mb-4 flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Bike, { size: 16, className: "text-[#FFE500]" }), " Taxas de Entrega"] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-xs", children: "Total em taxas" }), (0, jsx_runtime_1.jsxs)("p", { className: "text-white font-bold text-lg", children: ["R$ ", totalDeliveryFee.toFixed(2)] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-xs", children: "Pago pelo cliente" }), (0, jsx_runtime_1.jsxs)("p", { className: "text-green-400 font-bold text-lg", children: ["R$ ", customerPaidDelivery.toFixed(2)] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-xs", children: "Absorvido pela loja" }), (0, jsx_runtime_1.jsxs)("p", { className: "text-red-400 font-bold text-lg", children: ["R$ ", storePaidDelivery.toFixed(2)] })] })] })] })), byPaymentMethod.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 mb-6", children: [(0, jsx_runtime_1.jsxs)("h3", { className: "text-white font-bold text-sm mb-4 flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.CreditCard, { size: 16, className: "text-[#FFE500]" }), " Vendas por forma de pagamento"] }), (0, jsx_runtime_1.jsx)("div", { className: "space-y-3", children: byPaymentMethod.map(pm => ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-1", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-zinc-300 text-sm", children: pm.label }), (0, jsx_runtime_1.jsxs)("span", { className: "text-[#FFE500] text-sm font-bold", children: ["R$ ", pm.total.toFixed(2), " ", (0, jsx_runtime_1.jsxs)("span", { className: "text-zinc-500 font-normal ml-1", children: ["(", pm.count, "x)"] })] })] }), (0, jsx_runtime_1.jsx)("div", { className: "h-3 bg-zinc-900 rounded-full overflow-hidden", children: (0, jsx_runtime_1.jsx)("div", { className: "h-full bg-[#FFE500] rounded-full transition-all duration-500", style: { width: `${(pm.total / Math.max(...byPaymentMethod.map(p => p.total), 1)) * 100}%` } }) })] }, pm.key))) })] })), bySaleType.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 mb-6", children: [(0, jsx_runtime_1.jsxs)("h3", { className: "text-white font-bold text-sm mb-4 flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Receipt, { size: 16, className: "text-[#FFE500]" }), " Vendas por tipo de opera\u00E7\u00E3o"] }), (0, jsx_runtime_1.jsx)("div", { className: "space-y-3", children: bySaleType.map(st => ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-1", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-zinc-300 text-sm", children: st.label }), (0, jsx_runtime_1.jsxs)("span", { className: "text-[#FFE500] text-sm font-bold", children: ["R$ ", st.total.toFixed(2), " ", (0, jsx_runtime_1.jsxs)("span", { className: "text-zinc-500 font-normal ml-1", children: ["(", st.count, "x)"] })] })] }), (0, jsx_runtime_1.jsx)("div", { className: "h-3 bg-zinc-900 rounded-full overflow-hidden", children: (0, jsx_runtime_1.jsx)("div", { className: "h-full bg-[#FFE500] rounded-full transition-all duration-500", style: { width: `${(st.total / Math.max(...bySaleType.map(s => s.total), 1)) * 100}%` } }) })] }, st.key))) })] })), (0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 mb-6", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-white font-bold text-sm mb-4", children: "Faturamento por franquia" }), byFranchise.length === 0 || byFranchise.every(f => f.total === 0) ? ((0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-sm text-center py-8", children: "Sem dados para exibir." })) : ((0, jsx_runtime_1.jsx)("div", { className: "space-y-3", children: byFranchise.filter(f => f.total > 0).map((f, i) => ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-1", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-zinc-300 text-sm", children: f.name }), (0, jsx_runtime_1.jsxs)("span", { className: "text-[#FFE500] text-sm font-bold", children: ["R$ ", f.total.toFixed(2)] })] }), (0, jsx_runtime_1.jsx)("div", { className: "h-3 bg-zinc-900 rounded-full overflow-hidden", children: (0, jsx_runtime_1.jsx)("div", { className: "h-full bg-[#FFE500] rounded-full transition-all duration-500", style: { width: `${(f.total / maxFran) * 100}%` } }) })] }, i))) }))] }), byDeliverySource.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 mb-6", children: [(0, jsx_runtime_1.jsxs)("h3", { className: "text-white font-bold text-sm mb-4 flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Bike, { size: 16, className: "text-[#FFE500]" }), " Origem das vendas"] }), (0, jsx_runtime_1.jsx)("div", { className: "space-y-3", children: byDeliverySource.map(d => ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-1", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-zinc-300 text-sm", children: d.label }), (0, jsx_runtime_1.jsxs)("span", { className: "text-[#FFE500] text-sm font-bold", children: ["R$ ", d.total.toFixed(2), " ", (0, jsx_runtime_1.jsxs)("span", { className: "text-zinc-500 font-normal ml-1", children: ["(", d.count, "x)"] })] })] }), (0, jsx_runtime_1.jsx)("div", { className: "h-3 bg-zinc-900 rounded-full overflow-hidden", children: (0, jsx_runtime_1.jsx)("div", { className: "h-full bg-[#FFE500] rounded-full transition-all duration-500", style: { width: `${(d.total / maxSource) * 100}%` } }) })] }, d.key))) })] })), (0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 mb-6", children: [(0, jsx_runtime_1.jsxs)("button", { onClick: () => setShowDetails(!showDetails), className: "w-full flex items-center justify-between mb-4", children: [(0, jsx_runtime_1.jsxs)("h3", { className: "text-white font-bold text-sm flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Eye, { size: 16, className: "text-[#FFE500]" }), " Detalhamento de vendas"] }), (0, jsx_runtime_1.jsx)("span", { className: "text-zinc-400 text-xs", children: showDetails ? 'Ocultar' : 'Mostrar' })] }), showDetails && ((0, jsx_runtime_1.jsx)("div", { className: "space-y-2 max-h-96 overflow-y-auto", children: filtered.length === 0 ? ((0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-sm text-center py-4", children: "Sem dados." })) : filtered.map(s => {
                                        const PAY_LABELS = { pix: 'PIX', credit_card: 'Crédito', debit_card: 'Débito', cash: 'Dinheiro', meal_voucher: 'VR' };
                                        const TYPE_LABELS = { counter: 'Balcão', sponsorship: 'Patrocínio', tasting: 'Degustação', gift: 'Brindes' };
                                        const SRC_LABELS = { whatsapp: 'WhatsApp', ifood: 'iFood', uber_eats: 'Uber Eats', rappi: 'Rappi', '99delivery': '99 Delivery', phone: 'Telefone', other: 'Outro' };
                                        return ((0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-900/50 border border-zinc-800 rounded-lg p-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-start justify-between mb-1", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-white text-sm font-bold", children: franName(s.franchise_id) }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs", children: new Date(s.created_at).toLocaleString('pt-BR') }), s.user_name && (0, jsx_runtime_1.jsxs)("p", { className: "text-zinc-500 text-xs flex items-center gap-1", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.User, { size: 10 }), " ", s.user_name] })] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-[#FFE500] font-bold text-sm", children: ["R$ ", s.total.toFixed(2)] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-wrap gap-1.5 mt-2", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full", children: TYPE_LABELS[s.sale_type] ?? s.sale_type }), s.payment_method && (0, jsx_runtime_1.jsx)("span", { className: "text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full", children: PAY_LABELS[s.payment_method] ?? s.payment_method }), s.delivery_source && (0, jsx_runtime_1.jsx)("span", { className: "text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full", children: SRC_LABELS[s.delivery_source] ?? s.delivery_source }), (s.discount ?? 0) > 0 && (0, jsx_runtime_1.jsxs)("span", { className: "text-xs bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full", children: ["Desc: R$ ", (s.discount ?? 0).toFixed(2)] }), (s.delivery_fee ?? 0) > 0 && (0, jsx_runtime_1.jsxs)("span", { className: "text-xs bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded-full", children: ["Taxa: R$ ", (s.delivery_fee ?? 0).toFixed(2), " (", s.delivery_fee_payer === 'store' ? 'loja' : 'cliente', ")"] }), s.payment_method === 'cash' && (s.change ?? 0) > 0 && (0, jsx_runtime_1.jsxs)("span", { className: "text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full", children: ["Troco: R$ ", (s.change ?? 0).toFixed(2)] }), s.campaign_name && (0, jsx_runtime_1.jsx)("span", { className: "text-xs bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full", children: s.campaign_name })] }), (0, jsx_runtime_1.jsx)("div", { className: "mt-2 text-xs text-zinc-500", children: Array.isArray(s.items) && s.items.map((item, i) => ((0, jsx_runtime_1.jsxs)("span", { children: [i > 0 && ' • ', item.quantity, "x ", item.name] }, i))) })] }, s.id));
                                    }) }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-xl p-5", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-white font-bold text-sm mb-4", children: "Faturamento mensal (\u00FAltimos 6 meses)" }), byMonth.length === 0 ? ((0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-sm text-center py-8", children: "Sem dados para exibir." })) : ((0, jsx_runtime_1.jsx)("div", { className: "flex items-end justify-between gap-2 h-40", children: byMonth.map(([key, val]) => ((0, jsx_runtime_1.jsxs)("div", { className: "flex-1 flex flex-col items-center gap-2", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-full bg-[#FFE500] rounded-t-lg transition-all duration-500", style: { height: `${(val / maxMonth) * 100}%` } }), (0, jsx_runtime_1.jsx)("span", { className: "text-zinc-500 text-xs", children: monthLabel(key) }), (0, jsx_runtime_1.jsxs)("span", { className: "text-[#FFE500] text-xs font-bold", children: ["R$ ", val.toFixed(0)] })] }, key))) }))] })] })] }) }));
}

},
"/src/components/master/SiteManagerTool.tsx": function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SiteManagerTool;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const supabase_1 = require("@/lib/supabase");
const siteCompat_1 = require("@/lib/siteCompat");
const lucide_react_1 = require("lucide-react");
const sectionTypes = [
    { type: 'benefits', label: 'Faixa de benefícios' },
    { type: 'products', label: 'Vitrine de produtos', source: 'all' },
    { type: 'categories', label: 'Categorias' },
    { type: 'objectives', label: 'Objetivos' },
    { type: 'banners', label: 'Banners duplos' },
    { type: 'content', label: 'Bloco de texto' },
];
function SiteManagerTool({ onClose }) {
    const [tab, setTab] = (0, react_1.useState)('general');
    const [config, setConfig] = (0, react_1.useState)(siteCompat_1.DEFAULT_SITE_CONFIG);
    const [recordId, setRecordId] = (0, react_1.useState)(null);
    const [franchises, setFranchises] = (0, react_1.useState)([]);
    const [products, setProducts] = (0, react_1.useState)([]);
    const [categories, setCategories] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [catalogLoading, setCatalogLoading] = (0, react_1.useState)(false);
    const [saving, setSaving] = (0, react_1.useState)(false);
    const [message, setMessage] = (0, react_1.useState)('');
    const [error, setError] = (0, react_1.useState)('');
    const [search, setSearch] = (0, react_1.useState)('');
    const [previewDevice, setPreviewDevice] = (0, react_1.useState)('desktop');
    (0, react_1.useEffect)(() => {
        (async () => {
            setLoading(true);
            try {
                const [{ config: saved, recordId: rid }, { data: fra }] = await Promise.all([
                    (0, siteCompat_1.loadSiteConfig)(),
                    supabase_1.supabase.from('franchises').select('*').eq('status', 'active').order('name'),
                ]);
                setConfig(saved);
                setRecordId(rid);
                setFranchises((fra || []));
            }
            catch (e) {
                setError(e.message || 'Não foi possível carregar o gerenciador do site.');
            }
            setLoading(false);
        })();
    }, []);
    (0, react_1.useEffect)(() => {
        if (!config.fulfillmentFranchiseId) {
            setProducts([]);
            setCategories([]);
            return;
        }
        (async () => {
            setCatalogLoading(true);
            const [{ data: prod }, { data: cat }] = await Promise.all([
                supabase_1.supabase.from('franchise_products').select('*').eq('franchise_id', config.fulfillmentFranchiseId).order('sort_order').order('name'),
                supabase_1.supabase.from('franchise_categories').select('*').eq('franchise_id', config.fulfillmentFranchiseId).order('sort_order').order('name'),
            ]);
            setProducts((prod || []));
            setCategories((cat || []));
            setCatalogLoading(false);
        })();
    }, [config.fulfillmentFranchiseId]);
    const publish = async () => {
        setSaving(true);
        setMessage('');
        setError('');
        try {
            const id = await (0, siteCompat_1.saveSiteConfig)(config, recordId);
            setRecordId(id);
            setMessage('Site publicado. As alterações já estão disponíveis no e-commerce.');
        }
        catch (e) {
            setError(e.message || 'Não foi possível publicar o site.');
        }
        setSaving(false);
    };
    const upload = async (file) => {
        const ext = file.name.split('.').pop() || 'jpg';
        const path = `site/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: upErr } = await supabase_1.supabase.storage.from('franchise-products').upload(path, file, { upsert: false });
        if (upErr)
            throw upErr;
        return supabase_1.supabase.storage.from('franchise-products').getPublicUrl(path).data.publicUrl;
    };
    const productOverride = (id) => config.productOverrides[id] || {};
    const patchProduct = (id, patch) => setConfig(c => ({ ...c, productOverrides: { ...c.productOverrides, [id]: { ...(c.productOverrides[id] || {}), ...patch } } }));
    const filteredProducts = (0, react_1.useMemo)(() => products.filter(p => !search.trim() || [p.name, p.brand, p.flavor, p.weight].filter(Boolean).join(' ').toLowerCase().includes(search.toLowerCase())), [products, search]);
    if (loading)
        return (0, jsx_runtime_1.jsx)(Shell, { onClose: onClose, children: (0, jsx_runtime_1.jsx)("div", { className: "py-28 text-center text-zinc-500", children: "Carregando editor do site..." }) });
    return (0, jsx_runtime_1.jsx)(Shell, { onClose: onClose, children: (0, jsx_runtime_1.jsxs)("div", { className: "grid lg:grid-cols-[230px_1fr] min-h-[78vh]", children: [(0, jsx_runtime_1.jsxs)("aside", { className: "border-r border-zinc-800 p-3 lg:p-4 flex lg:block gap-2 overflow-x-auto", children: [[
                            ['general', lucide_react_1.Settings2, 'Geral'], ['layout', lucide_react_1.LayoutGrid, 'Estrutura'], ['banners', lucide_react_1.Image, 'Banners'], ['products', lucide_react_1.Package, 'Produtos'], ['appearance', lucide_react_1.Palette, 'Aparência'],
                        ].map(([key, Icon, label]) => (0, jsx_runtime_1.jsxs)("button", { onClick: () => setTab(key), className: `flex-shrink-0 w-auto lg:w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold mb-1 ${tab === key ? 'bg-[#FFE500] text-black' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'}`, children: [(0, jsx_runtime_1.jsx)(Icon, { size: 18 }), label] }, key)), (0, jsx_runtime_1.jsxs)("div", { className: "hidden lg:block mt-5 p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl text-xs text-zinc-500 leading-relaxed", children: [(0, jsx_runtime_1.jsx)("strong", { className: "text-zinc-300", children: "Sem Supabase manual." }), (0, jsx_runtime_1.jsx)("br", {}), "A configura\u00E7\u00E3o \u00E9 criada e atualizada automaticamente pelo painel."] })] }), (0, jsx_runtime_1.jsxs)("main", { className: "p-4 sm:p-6 lg:p-8 overflow-y-auto", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col xl:flex-row xl:items-center justify-between gap-3 mb-6", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-xl font-black", children: tab === 'general' ? 'Configurações gerais' : tab === 'layout' ? 'Estrutura da página' : tab === 'banners' ? 'Banners e campanhas' : tab === 'products' ? 'Produtos do e-commerce' : 'Identidade visual' }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs mt-1", children: "Tudo \u00E9 gerenciado pelo Master e publicado no site nacional." })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2", children: [(0, jsx_runtime_1.jsxs)("a", { href: "/site", target: "_blank", className: "px-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-sm font-bold flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Eye, { size: 16 }), " Abrir site"] }), (0, jsx_runtime_1.jsxs)("button", { onClick: publish, disabled: saving, className: "px-4 py-2.5 rounded-lg bg-[#FFE500] text-black text-sm font-black flex items-center gap-2 disabled:opacity-50", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Save, { size: 16 }), " ", saving ? 'Publicando...' : 'Publicar alterações'] })] })] }), message && (0, jsx_runtime_1.jsx)(Notice, { tone: "ok", children: message }), error && (0, jsx_runtime_1.jsx)(Notice, { tone: "error", children: error }), tab === 'general' && (0, jsx_runtime_1.jsx)(General, { config: config, setConfig: setConfig, franchises: franchises }), tab === 'layout' && (0, jsx_runtime_1.jsx)(Layout, { config: config, setConfig: setConfig }), tab === 'banners' && (0, jsx_runtime_1.jsx)(Banners, { config: config, setConfig: setConfig, upload: upload }), tab === 'products' && (0, jsx_runtime_1.jsx)(Products, { config: config, products: filteredProducts, categories: categories, loading: catalogLoading, search: search, setSearch: setSearch, patchProduct: patchProduct, upload: upload }), tab === 'appearance' && (0, jsx_runtime_1.jsx)(Appearance, { config: config, setConfig: setConfig, upload: upload, previewDevice: previewDevice, setPreviewDevice: setPreviewDevice })] })] }) });
}
function General({ config, setConfig, franchises }) {
    return (0, jsx_runtime_1.jsxs)("div", { className: "grid xl:grid-cols-2 gap-5", children: [(0, jsx_runtime_1.jsxs)(Card, { title: "Opera\u00E7\u00E3o do site", children: [(0, jsx_runtime_1.jsx)(Input, { label: "Nome do site", value: config.siteName, onChange: v => setConfig({ ...config, siteName: v }) }), (0, jsx_runtime_1.jsx)(Input, { label: "Dom\u00EDnio", value: config.domain, onChange: v => setConfig({ ...config, domain: v }) }), (0, jsx_runtime_1.jsxs)("label", { className: "block", children: [(0, jsx_runtime_1.jsx)(Label, { children: "Central/unidade respons\u00E1vel pelos pedidos e estoque" }), (0, jsx_runtime_1.jsxs)("select", { value: config.fulfillmentFranchiseId, onChange: e => setConfig({ ...config, fulfillmentFranchiseId: e.target.value }), className: "Field", children: [(0, jsx_runtime_1.jsx)("option", { value: "", children: "Selecione..." }), franchises.map(f => (0, jsx_runtime_1.jsx)("option", { value: f.id, children: f.name }, f.id))] }), (0, jsx_runtime_1.jsx)("p", { className: "text-[11px] text-zinc-500 mt-1", children: "Os produtos, estoque e pedidos do site ser\u00E3o ligados a essa unidade." })] }), (0, jsx_runtime_1.jsx)(Toggle, { label: "Site ativo", checked: config.active, onChange: v => setConfig({ ...config, active: v }) })] }), (0, jsx_runtime_1.jsxs)(Card, { title: "Comercial e contato", children: [(0, jsx_runtime_1.jsx)(NumberInput, { label: "Desconto PIX (%)", value: config.pixDiscountPercent, onChange: v => setConfig({ ...config, pixDiscountPercent: v }) }), (0, jsx_runtime_1.jsx)(NumberInput, { label: "Frete fixo (R$)", value: config.shippingFlatFee, onChange: v => setConfig({ ...config, shippingFlatFee: v }) }), (0, jsx_runtime_1.jsx)(NumberInput, { label: "Frete gr\u00E1tis acima de (R$)", value: config.freeShippingThreshold, onChange: v => setConfig({ ...config, freeShippingThreshold: v }) }), (0, jsx_runtime_1.jsx)(Input, { label: "Texto de parcelamento", value: config.installmentsText, onChange: v => setConfig({ ...config, installmentsText: v }) }), (0, jsx_runtime_1.jsx)(Input, { label: "WhatsApp", value: config.whatsapp, onChange: v => setConfig({ ...config, whatsapp: v }) }), (0, jsx_runtime_1.jsx)(Input, { label: "Instagram", value: config.instagram, onChange: v => setConfig({ ...config, instagram: v }) }), (0, jsx_runtime_1.jsx)(Input, { label: "E-mail de suporte", value: config.supportEmail, onChange: v => setConfig({ ...config, supportEmail: v }) })] }), (0, jsx_runtime_1.jsxs)(Card, { title: "Barra superior e busca", children: [(0, jsx_runtime_1.jsx)(Toggle, { label: "Exibir barra de aviso", checked: config.announcementEnabled, onChange: v => setConfig({ ...config, announcementEnabled: v }) }), (0, jsx_runtime_1.jsx)(TextArea, { label: "Texto da barra", value: config.announcementText, onChange: v => setConfig({ ...config, announcementText: v }) }), (0, jsx_runtime_1.jsx)(Input, { label: "Placeholder da busca", value: config.searchPlaceholder, onChange: v => setConfig({ ...config, searchPlaceholder: v }) })] }), (0, jsx_runtime_1.jsxs)(Card, { title: "SEO e rodap\u00E9", children: [(0, jsx_runtime_1.jsx)(Input, { label: "T\u00EDtulo SEO", value: config.seo.title, onChange: v => setConfig({ ...config, seo: { ...config.seo, title: v } }) }), (0, jsx_runtime_1.jsx)(TextArea, { label: "Descri\u00E7\u00E3o SEO", value: config.seo.description, onChange: v => setConfig({ ...config, seo: { ...config.seo, description: v } }) }), (0, jsx_runtime_1.jsx)(TextArea, { label: "Sobre a Suplementaai", value: config.footer.about, onChange: v => setConfig({ ...config, footer: { ...config.footer, about: v } }) }), (0, jsx_runtime_1.jsx)(Input, { label: "Endere\u00E7o/identifica\u00E7\u00E3o", value: config.footer.address, onChange: v => setConfig({ ...config, footer: { ...config.footer, address: v } }) }), (0, jsx_runtime_1.jsx)(Input, { label: "Telefone do rodap\u00E9", value: config.footer.phone, onChange: v => setConfig({ ...config, footer: { ...config.footer, phone: v } }) })] })] });
}
function Layout({ config, setConfig }) {
    const sections = [...config.homeSections].sort((a, b) => a.sortOrder - b.sortOrder);
    const setSections = (arr) => setConfig({ ...config, homeSections: arr.map((s, i) => ({ ...s, sortOrder: i })) });
    const move = (idx, dir) => { const next = [...sections]; const j = idx + dir; if (j < 0 || j >= next.length)
        return; [next[idx], next[j]] = [next[j], next[idx]]; setSections(next); };
    const add = () => setSections([...sections, { id: `section-${Date.now()}`, type: 'products', title: 'NOVA VITRINE', source: 'all', enabled: true, sortOrder: sections.length }]);
    return (0, jsx_runtime_1.jsxs)("div", { className: "grid xl:grid-cols-[1fr_340px] gap-5", children: [(0, jsx_runtime_1.jsxs)("div", { className: "space-y-3", children: [sections.map((s, idx) => (0, jsx_runtime_1.jsx)("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-3 items-start", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col gap-1", children: [(0, jsx_runtime_1.jsx)("button", { disabled: idx === 0, onClick: () => move(idx, -1), className: "IconBtn disabled:opacity-20", children: (0, jsx_runtime_1.jsx)(lucide_react_1.ArrowUp, { size: 15 }) }), (0, jsx_runtime_1.jsx)("button", { disabled: idx === sections.length - 1, onClick: () => move(idx, 1), className: "IconBtn disabled:opacity-20", children: (0, jsx_runtime_1.jsx)(lucide_react_1.ArrowDown, { size: 15 }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1 grid md:grid-cols-[180px_1fr] gap-3", children: [(0, jsx_runtime_1.jsx)("select", { value: s.type, onChange: e => { const type = e.target.value; setSections(sections.map(x => x.id === s.id ? { ...x, type } : x)); }, className: "Field", children: sectionTypes.map(t => (0, jsx_runtime_1.jsx)("option", { value: t.type, children: t.label }, t.type)) }), (0, jsx_runtime_1.jsx)("input", { value: s.title, onChange: e => setSections(sections.map(x => x.id === s.id ? { ...x, title: e.target.value } : x)), className: "Field", placeholder: "T\u00EDtulo da se\u00E7\u00E3o" }), s.type === 'products' && (0, jsx_runtime_1.jsxs)("select", { value: s.source || 'all', onChange: e => setSections(sections.map(x => x.id === s.id ? { ...x, source: e.target.value } : x)), className: "Field md:col-start-2", children: [(0, jsx_runtime_1.jsx)("option", { value: "all", children: "Todos" }), (0, jsx_runtime_1.jsx)("option", { value: "offers", children: "Ofertas" }), (0, jsx_runtime_1.jsx)("option", { value: "bestseller", children: "Mais vendidos" }), (0, jsx_runtime_1.jsx)("option", { value: "featured", children: "Destaques" }), (0, jsx_runtime_1.jsx)("option", { value: "new", children: "Novidades" })] }), s.type === 'content' && (0, jsx_runtime_1.jsx)("textarea", { value: s.body || '', onChange: e => setSections(sections.map(x => x.id === s.id ? { ...x, body: e.target.value } : x)), className: "Field md:col-start-2 min-h-20", placeholder: "Conte\u00FAdo do bloco" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => setSections(sections.map(x => x.id === s.id ? { ...x, enabled: !x.enabled } : x)), className: `px-3 py-2 rounded-lg text-xs font-bold ${s.enabled ? 'bg-green-500/15 text-green-300' : 'bg-zinc-800 text-zinc-500'}`, children: s.enabled ? 'Visível' : 'Oculto' }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setSections(sections.filter(x => x.id !== s.id)), className: "IconBtn text-red-400", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { size: 15 }) })] })] }) }, s.id)), (0, jsx_runtime_1.jsxs)("button", { onClick: add, className: "w-full border border-dashed border-zinc-700 rounded-xl p-4 text-zinc-400 hover:text-white hover:border-zinc-500 flex justify-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { size: 18 }), " Adicionar se\u00E7\u00E3o"] })] }), (0, jsx_runtime_1.jsxs)(Card, { title: "Como funciona", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm text-zinc-400 leading-relaxed", children: "A ordem aqui \u00E9 a ordem real da Home. Voc\u00EA pode subir, descer, ocultar, renomear e criar vitrines. O layout \u00E9 responsivo e usa a mesma sequ\u00EAncia no desktop e no celular." }), (0, jsx_runtime_1.jsx)("div", { className: "mt-4 p-3 rounded-lg bg-[#FFE500]/10 border border-[#FFE500]/20 text-[#FFE500] text-xs", children: "A estrutura comercial segue o padr\u00E3o de grandes lojas de suplementos: header forte, categorias, vitrines, banners, objetivos, conte\u00FAdo e rodap\u00E9 \u2014 com identidade pr\u00F3pria da Suplementaai." })] })] });
}
function Banners({ config, setConfig, upload }) {
    const setHeroes = (h) => setConfig({ ...config, heroSlides: h });
    const addHero = () => setHeroes([...config.heroSlides, { id: `hero-${Date.now()}`, eyebrow: 'SUPLEMENTAAI', title: 'NOVO DESTAQUE', subtitle: 'Edite o texto e envie uma imagem.', buttonText: 'VER AGORA', buttonLink: '#produtos', imageUrl: '', enabled: true }]);
    const addPromo = () => setConfig({ ...config, promoBanners: [...config.promoBanners, { id: `promo-${Date.now()}`, title: 'NOVO BANNER', subtitle: 'Edite este destaque', imageUrl: '', link: '#produtos', enabled: true }] });
    const addObjective = () => setConfig({ ...config, objectives: [...config.objectives, { id: `objective-${Date.now()}`, title: 'Novo objetivo', subtitle: 'Descrição do objetivo', icon: '⚡', query: '', enabled: true }] });
    return (0, jsx_runtime_1.jsxs)("div", { className: "space-y-6", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-3", children: [(0, jsx_runtime_1.jsx)("h4", { className: "font-black", children: "Banner principal" }), (0, jsx_runtime_1.jsxs)("button", { onClick: addHero, className: "SmallYellow", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { size: 15 }), " Novo slide"] })] }), (0, jsx_runtime_1.jsx)("div", { className: "space-y-4", children: config.heroSlides.map((h, idx) => (0, jsx_runtime_1.jsxs)(Card, { title: `Slide ${idx + 1}`, children: [(0, jsx_runtime_1.jsxs)("div", { className: "grid md:grid-cols-2 gap-3", children: [(0, jsx_runtime_1.jsx)(Input, { label: "Chamada pequena", value: h.eyebrow, onChange: v => setHeroes(config.heroSlides.map(x => x.id === h.id ? { ...x, eyebrow: v } : x)) }), (0, jsx_runtime_1.jsx)(Input, { label: "T\u00EDtulo", value: h.title, onChange: v => setHeroes(config.heroSlides.map(x => x.id === h.id ? { ...x, title: v } : x)) }), (0, jsx_runtime_1.jsx)(Input, { label: "Bot\u00E3o", value: h.buttonText, onChange: v => setHeroes(config.heroSlides.map(x => x.id === h.id ? { ...x, buttonText: v } : x)) }), (0, jsx_runtime_1.jsx)(Input, { label: "Link do bot\u00E3o", value: h.buttonLink, onChange: v => setHeroes(config.heroSlides.map(x => x.id === h.id ? { ...x, buttonLink: v } : x)) })] }), (0, jsx_runtime_1.jsx)(TextArea, { label: "Subt\u00EDtulo", value: h.subtitle, onChange: v => setHeroes(config.heroSlides.map(x => x.id === h.id ? { ...x, subtitle: v } : x)) }), (0, jsx_runtime_1.jsx)(UploadField, { label: "Imagem desktop/mobile", url: h.imageUrl, upload: upload, onUploaded: url => setHeroes(config.heroSlides.map(x => x.id === h.id ? { ...x, imageUrl: url } : x)) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2", children: [(0, jsx_runtime_1.jsx)(Toggle, { label: "Exibir", checked: h.enabled, onChange: v => setHeroes(config.heroSlides.map(x => x.id === h.id ? { ...x, enabled: v } : x)) }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setHeroes(config.heroSlides.filter(x => x.id !== h.id)), className: "IconBtn text-red-400", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { size: 15 }) })] })] }, h.id)) })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-3", children: [(0, jsx_runtime_1.jsx)("h4", { className: "font-black", children: "Banners intermedi\u00E1rios" }), (0, jsx_runtime_1.jsxs)("button", { onClick: addPromo, className: "SmallYellow", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { size: 15 }), " Novo banner"] })] }), (0, jsx_runtime_1.jsx)("div", { className: "grid xl:grid-cols-2 gap-4", children: config.promoBanners.map(b => (0, jsx_runtime_1.jsxs)(Card, { title: b.title || 'Banner', children: [(0, jsx_runtime_1.jsx)(Input, { label: "T\u00EDtulo", value: b.title, onChange: v => setConfig({ ...config, promoBanners: config.promoBanners.map(x => x.id === b.id ? { ...x, title: v } : x) }) }), (0, jsx_runtime_1.jsx)(Input, { label: "Subt\u00EDtulo", value: b.subtitle, onChange: v => setConfig({ ...config, promoBanners: config.promoBanners.map(x => x.id === b.id ? { ...x, subtitle: v } : x) }) }), (0, jsx_runtime_1.jsx)(Input, { label: "Link", value: b.link, onChange: v => setConfig({ ...config, promoBanners: config.promoBanners.map(x => x.id === b.id ? { ...x, link: v } : x) }) }), (0, jsx_runtime_1.jsx)(UploadField, { label: "Imagem", url: b.imageUrl, upload: upload, onUploaded: url => setConfig({ ...config, promoBanners: config.promoBanners.map(x => x.id === b.id ? { ...x, imageUrl: url } : x) }) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2", children: [(0, jsx_runtime_1.jsx)(Toggle, { label: "Exibir", checked: b.enabled, onChange: v => setConfig({ ...config, promoBanners: config.promoBanners.map(x => x.id === b.id ? { ...x, enabled: v } : x) }) }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setConfig({ ...config, promoBanners: config.promoBanners.filter(x => x.id !== b.id) }), className: "IconBtn text-red-400", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { size: 15 }) })] })] }, b.id)) })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-3", children: [(0, jsx_runtime_1.jsx)("h4", { className: "font-black", children: "Compre por objetivo" }), (0, jsx_runtime_1.jsxs)("button", { onClick: addObjective, className: "SmallYellow", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { size: 15 }), " Novo objetivo"] })] }), (0, jsx_runtime_1.jsx)("div", { className: "grid md:grid-cols-2 gap-4", children: config.objectives.map(o => (0, jsx_runtime_1.jsxs)(Card, { title: o.title, children: [(0, jsx_runtime_1.jsx)(Input, { label: "\u00CDcone/emoji", value: o.icon, onChange: v => setConfig({ ...config, objectives: config.objectives.map(x => x.id === o.id ? { ...x, icon: v } : x) }) }), (0, jsx_runtime_1.jsx)(Input, { label: "T\u00EDtulo", value: o.title, onChange: v => setConfig({ ...config, objectives: config.objectives.map(x => x.id === o.id ? { ...x, title: v } : x) }) }), (0, jsx_runtime_1.jsx)(Input, { label: "Subt\u00EDtulo", value: o.subtitle, onChange: v => setConfig({ ...config, objectives: config.objectives.map(x => x.id === o.id ? { ...x, subtitle: v } : x) }) }), (0, jsx_runtime_1.jsx)(Input, { label: "Termos de busca", value: o.query, onChange: v => setConfig({ ...config, objectives: config.objectives.map(x => x.id === o.id ? { ...x, query: v } : x) }) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2", children: [(0, jsx_runtime_1.jsx)(Toggle, { label: "Exibir", checked: o.enabled, onChange: v => setConfig({ ...config, objectives: config.objectives.map(x => x.id === o.id ? { ...x, enabled: v } : x) }) }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setConfig({ ...config, objectives: config.objectives.filter(x => x.id !== o.id) }), className: "IconBtn text-red-400", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { size: 15 }) })] })] }, o.id)) })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h4", { className: "font-black mb-3", children: "Faixa de benef\u00EDcios" }), (0, jsx_runtime_1.jsx)("div", { className: "grid md:grid-cols-2 gap-4", children: config.benefits.map(b => (0, jsx_runtime_1.jsxs)(Card, { title: b.title, children: [(0, jsx_runtime_1.jsx)(Input, { label: "T\u00EDtulo", value: b.title, onChange: v => setConfig({ ...config, benefits: config.benefits.map(x => x.id === b.id ? { ...x, title: v } : x) }) }), (0, jsx_runtime_1.jsx)(Input, { label: "Texto", value: b.text, onChange: v => setConfig({ ...config, benefits: config.benefits.map(x => x.id === b.id ? { ...x, text: v } : x) }) })] }, b.id)) })] })] });
}
function Products({ config, products, categories, loading, search, setSearch, patchProduct, upload }) {
    const catMap = new Map(categories.map(c => [c.id, c.name]));
    if (!config.fulfillmentFranchiseId)
        return (0, jsx_runtime_1.jsx)(Empty, { icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Package, { size: 40 }), title: "Escolha a central do site", text: "Na aba Geral, escolha a unidade/central que fornecer\u00E1 produtos e receber\u00E1 os pedidos." });
    return (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "relative mb-4", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Search, { size: 17, className: "absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" }), (0, jsx_runtime_1.jsx)("input", { value: search, onChange: e => setSearch(e.target.value), placeholder: "Buscar produto, marca, sabor...", className: "w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-3 py-3 text-sm" })] }), loading ? (0, jsx_runtime_1.jsx)("div", { className: "py-20 text-center text-zinc-500", children: "Carregando cat\u00E1logo..." }) : (0, jsx_runtime_1.jsxs)("div", { className: "space-y-3", children: [products.map(p => { const o = config.productOverrides[p.id] || {}; return (0, jsx_runtime_1.jsxs)("details", { className: "bg-zinc-900 border border-zinc-800 rounded-xl group", children: [(0, jsx_runtime_1.jsxs)("summary", { className: "list-none cursor-pointer p-3 sm:p-4 flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-14 h-14 bg-white rounded-lg overflow-hidden flex-shrink-0", children: (o.customImageUrl || p.image_url) ? (0, jsx_runtime_1.jsx)("img", { src: o.customImageUrl || p.image_url || '', className: "w-full h-full object-contain" }) : null }), (0, jsx_runtime_1.jsxs)("div", { className: "min-w-0 flex-1", children: [(0, jsx_runtime_1.jsx)("p", { className: "font-bold truncate", children: o.customName || p.name }), (0, jsx_runtime_1.jsxs)("p", { className: "text-xs text-zinc-500", children: [catMap.get(p.category_id || '') || 'Sem categoria', " \u2022 R$ ", Number(o.customDiscountPrice ?? o.customPrice ?? p.discount_price ?? p.price).toFixed(2).replace('.', ','), " \u2022 estoque ", p.stock] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "hidden md:flex gap-1", children: [o.bestseller && (0, jsx_runtime_1.jsx)(Tag, { children: "MAIS VENDIDO" }), o.featured && (0, jsx_runtime_1.jsx)(Tag, { children: "DESTAQUE" }), o.newArrival && (0, jsx_runtime_1.jsx)(Tag, { children: "NOVO" })] }), (0, jsx_runtime_1.jsx)("button", { onClick: e => { e.preventDefault(); patchProduct(p.id, { visible: o.visible === false ? true : false }); }, className: `px-3 py-2 rounded-lg text-xs font-black ${o.visible === false ? 'bg-zinc-800 text-zinc-500' : 'bg-green-500/15 text-green-300'}`, children: o.visible === false ? 'Oculto' : 'No site' })] }), (0, jsx_runtime_1.jsxs)("div", { className: "p-4 pt-0 border-t border-zinc-800 grid lg:grid-cols-2 gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "space-y-3 pt-4", children: [(0, jsx_runtime_1.jsx)(Input, { label: "Nome espec\u00EDfico no site (opcional)", value: o.customName || '', onChange: v => patchProduct(p.id, { customName: v }) }), (0, jsx_runtime_1.jsx)(TextArea, { label: "Descri\u00E7\u00E3o curta espec\u00EDfica", value: o.customDescription || '', onChange: v => patchProduct(p.id, { customDescription: v }) }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-3", children: [(0, jsx_runtime_1.jsx)(NumberInput, { label: "Pre\u00E7o espec\u00EDfico", value: o.customPrice ?? Number(p.price), onChange: v => patchProduct(p.id, { customPrice: v }) }), (0, jsx_runtime_1.jsx)(NumberInput, { label: "Pre\u00E7o promocional", value: o.customDiscountPrice ?? Number(p.discount_price || 0), onChange: v => patchProduct(p.id, { customDiscountPrice: v || null }) })] }), (0, jsx_runtime_1.jsx)(Input, { label: "Selo (ex: OFERTA)", value: o.badgeText || '', onChange: v => patchProduct(p.id, { badgeText: v }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-3 pt-4", children: [(0, jsx_runtime_1.jsx)(UploadField, { label: "Imagem espec\u00EDfica do site", url: o.customImageUrl || p.image_url || '', upload: upload, onUploaded: url => patchProduct(p.id, { customImageUrl: url }) }), (0, jsx_runtime_1.jsxs)("div", { className: "grid sm:grid-cols-3 gap-2", children: [(0, jsx_runtime_1.jsx)(Flag, { label: "Mais vendido", checked: !!o.bestseller, onChange: v => patchProduct(p.id, { bestseller: v }) }), (0, jsx_runtime_1.jsx)(Flag, { label: "Destaque", checked: !!o.featured, onChange: v => patchProduct(p.id, { featured: v }) }), (0, jsx_runtime_1.jsx)(Flag, { label: "Lan\u00E7amento", checked: !!o.newArrival, onChange: v => patchProduct(p.id, { newArrival: v }) })] })] })] })] }, p.id); }), products.length === 0 && (0, jsx_runtime_1.jsx)(Empty, { icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Package, { size: 40 }), title: "Nenhum produto na central", text: "Cadastre ou vincule produtos \u00E0 unidade escolhida para exibi-los no site." })] })] });
}
function Appearance({ config, setConfig, upload, previewDevice, setPreviewDevice }) {
    return (0, jsx_runtime_1.jsxs)("div", { className: "grid xl:grid-cols-[430px_1fr] gap-5", children: [(0, jsx_runtime_1.jsxs)("div", { className: "space-y-5", children: [(0, jsx_runtime_1.jsxs)(Card, { title: "Marca", children: [(0, jsx_runtime_1.jsx)(UploadField, { label: "Logomarca", url: config.logoUrl, upload: upload, onUploaded: url => setConfig({ ...config, logoUrl: url }) }), (0, jsx_runtime_1.jsx)(UploadField, { label: "Favicon", url: config.faviconUrl, upload: upload, onUploaded: url => setConfig({ ...config, faviconUrl: url }) })] }), (0, jsx_runtime_1.jsxs)(Card, { title: "Cores e estilo", children: [(0, jsx_runtime_1.jsx)(Color, { label: "Amarelo / cor principal", value: config.primaryColor, onChange: v => setConfig({ ...config, primaryColor: v }) }), (0, jsx_runtime_1.jsx)(Color, { label: "Cor escura", value: config.secondaryColor, onChange: v => setConfig({ ...config, secondaryColor: v }) }), (0, jsx_runtime_1.jsx)(Color, { label: "Cor de pre\u00E7o/PIX", value: config.accentColor, onChange: v => setConfig({ ...config, accentColor: v }) }), (0, jsx_runtime_1.jsx)(Color, { label: "Fundo", value: config.backgroundColor, onChange: v => setConfig({ ...config, backgroundColor: v }) }), (0, jsx_runtime_1.jsx)(Color, { label: "Texto", value: config.textColor, onChange: v => setConfig({ ...config, textColor: v }) }), (0, jsx_runtime_1.jsxs)("label", { className: "block", children: [(0, jsx_runtime_1.jsx)(Label, { children: "Fonte" }), (0, jsx_runtime_1.jsxs)("select", { value: config.fontFamily, onChange: e => setConfig({ ...config, fontFamily: e.target.value }), className: "Field", children: [(0, jsx_runtime_1.jsx)("option", { value: "Inter, Arial, sans-serif", children: "Inter / Moderna" }), (0, jsx_runtime_1.jsx)("option", { value: "Arial, sans-serif", children: "Arial / Direta" }), (0, jsx_runtime_1.jsx)("option", { value: "'Trebuchet MS', Arial, sans-serif", children: "Trebuchet / Esportiva" }), (0, jsx_runtime_1.jsx)("option", { value: "Georgia, serif", children: "Georgia / Editorial" })] })] }), (0, jsx_runtime_1.jsx)(NumberInput, { label: "Arredondamento dos cards (px)", value: config.radius, onChange: v => setConfig({ ...config, radius: Math.max(0, Math.min(30, v)) }) })] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2 mb-3", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => setPreviewDevice('desktop'), className: `IconBtn ${previewDevice === 'desktop' ? 'text-[#FFE500]' : ''}`, children: (0, jsx_runtime_1.jsx)(lucide_react_1.Monitor, { size: 18 }) }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setPreviewDevice('mobile'), className: `IconBtn ${previewDevice === 'mobile' ? 'text-[#FFE500]' : ''}`, children: (0, jsx_runtime_1.jsx)(lucide_react_1.Smartphone, { size: 18 }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: `mx-auto bg-white text-black overflow-hidden shadow-2xl transition-all ${previewDevice === 'mobile' ? 'max-w-[390px]' : 'w-full'}`, style: { borderRadius: config.radius }, children: [(0, jsx_runtime_1.jsx)("div", { className: "p-1 text-center text-[8px] font-bold text-white", style: { backgroundColor: config.secondaryColor }, children: config.announcementText }), (0, jsx_runtime_1.jsxs)("div", { className: "p-3 border-b flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)("img", { src: config.logoUrl || '/assets/logo.png', className: "w-20 h-10 object-contain" }), (0, jsx_runtime_1.jsx)("div", { className: "flex-1 h-8 bg-neutral-100 rounded-full" }), (0, jsx_runtime_1.jsx)("div", { className: "w-8 h-8 rounded-full", style: { backgroundColor: config.primaryColor } })] }), (0, jsx_runtime_1.jsx)("div", { className: "h-56 flex items-center p-8 bg-neutral-900 text-white", children: (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-[10px] font-black tracking-[.2em]", style: { color: config.primaryColor }, children: "SUPLEMENTAAI" }), (0, jsx_runtime_1.jsx)("h4", { className: "text-2xl font-black max-w-sm mt-2", children: config.heroSlides[0]?.title }), (0, jsx_runtime_1.jsx)("button", { className: "mt-4 px-4 py-2 text-xs font-black text-black", style: { backgroundColor: config.primaryColor, borderRadius: config.radius }, children: config.heroSlides[0]?.buttonText })] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "p-5", style: { backgroundColor: config.backgroundColor }, children: [(0, jsx_runtime_1.jsx)("h4", { className: "font-black text-xl", children: "OFERTAS EM DESTAQUE" }), (0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-2 gap-3 mt-3", children: [1, 2, 3, 4].map(n => (0, jsx_runtime_1.jsxs)("div", { className: "bg-white border p-3", style: { borderRadius: config.radius }, children: [(0, jsx_runtime_1.jsx)("div", { className: "aspect-square bg-neutral-100", style: { borderRadius: config.radius } }), (0, jsx_runtime_1.jsx)("div", { className: "h-2 bg-neutral-200 mt-3 w-3/4" }), (0, jsx_runtime_1.jsx)("div", { className: "font-black mt-3", children: "R$ 99,90" }), (0, jsx_runtime_1.jsx)("div", { className: "text-xs font-black", style: { color: config.accentColor }, children: "R$ 94,90 no PIX" })] }, n)) })] })] })] })] });
}
function Shell({ onClose, children }) { return (0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 z-50 bg-black/80 p-2 sm:p-4 overflow-y-auto", children: (0, jsx_runtime_1.jsxs)("div", { className: "max-w-[1500px] mx-auto bg-zinc-950 border border-zinc-800 rounded-2xl text-white min-h-[92vh] overflow-hidden", children: [(0, jsx_runtime_1.jsxs)("div", { className: "p-5 border-b border-zinc-800 flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-xl font-black", children: "Gerenciar Site" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs", children: "suplementaai.com.br \u2022 e-commerce nacional integrado ao sistema" })] }), (0, jsx_runtime_1.jsx)("button", { onClick: onClose, className: "p-2 bg-zinc-900 rounded-lg", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { size: 19 }) })] }), children] }) }); }
function Card({ title, children }) { return (0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-5", children: [(0, jsx_runtime_1.jsx)("h4", { className: "font-black mb-4", children: title }), (0, jsx_runtime_1.jsx)("div", { className: "space-y-3", children: children })] }); }
function Label({ children }) { return (0, jsx_runtime_1.jsx)("span", { className: "block text-[11px] font-bold uppercase tracking-wide text-zinc-500 mb-1.5", children: children }); }
function Input({ label, value, onChange }) { return (0, jsx_runtime_1.jsxs)("label", { className: "block", children: [(0, jsx_runtime_1.jsx)(Label, { children: label }), (0, jsx_runtime_1.jsx)("input", { value: value || '', onChange: e => onChange(e.target.value), className: "Field" })] }); }
function NumberInput({ label, value, onChange }) { return (0, jsx_runtime_1.jsxs)("label", { className: "block", children: [(0, jsx_runtime_1.jsx)(Label, { children: label }), (0, jsx_runtime_1.jsx)("input", { type: "number", step: "0.01", value: Number.isFinite(value) ? value : 0, onChange: e => onChange(Number(e.target.value)), className: "Field" })] }); }
function TextArea({ label, value, onChange }) { return (0, jsx_runtime_1.jsxs)("label", { className: "block", children: [(0, jsx_runtime_1.jsx)(Label, { children: label }), (0, jsx_runtime_1.jsx)("textarea", { rows: 3, value: value || '', onChange: e => onChange(e.target.value), className: "Field resize-y" })] }); }
function Toggle({ label, checked, onChange }) { return (0, jsx_runtime_1.jsxs)("label", { className: "flex items-center justify-between gap-3 bg-zinc-950/50 border border-zinc-800 rounded-lg px-3 py-2.5", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-sm font-bold", children: label }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => onChange(!checked), className: `w-11 h-6 rounded-full p-1 transition ${checked ? 'bg-[#FFE500]' : 'bg-zinc-700'}`, children: (0, jsx_runtime_1.jsx)("span", { className: `block w-4 h-4 rounded-full bg-black transition ${checked ? 'translate-x-5' : ''}` }) })] }); }
function Flag({ label, checked, onChange }) { return (0, jsx_runtime_1.jsxs)("button", { type: "button", onClick: () => onChange(!checked), className: `p-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 ${checked ? 'border-[#FFE500]/40 bg-[#FFE500]/10 text-[#FFE500]' : 'border-zinc-800 text-zinc-500'}`, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Star, { size: 14, fill: checked ? 'currentColor' : 'none' }), label] }); }
function Color({ label, value, onChange }) { return (0, jsx_runtime_1.jsxs)("label", { className: "block", children: [(0, jsx_runtime_1.jsx)(Label, { children: label }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2", children: [(0, jsx_runtime_1.jsx)("input", { type: "color", value: value, onChange: e => onChange(e.target.value), className: "w-12 h-10 bg-transparent border-0" }), (0, jsx_runtime_1.jsx)("input", { value: value, onChange: e => onChange(e.target.value), className: "Field" })] })] }); }
function UploadField({ label, url, upload, onUploaded }) { const [busy, setBusy] = (0, react_1.useState)(false); return (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(Label, { children: label }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-3 items-center", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-24 h-16 bg-white rounded-lg overflow-hidden border border-zinc-700 flex-shrink-0", children: url ? (0, jsx_runtime_1.jsx)("img", { src: url, className: "w-full h-full object-contain" }) : (0, jsx_runtime_1.jsx)("div", { className: "h-full flex items-center justify-center text-zinc-500", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Image, { size: 20 }) }) }), (0, jsx_runtime_1.jsxs)("label", { className: "flex-1 border border-dashed border-zinc-700 rounded-lg p-3 text-xs text-zinc-400 cursor-pointer hover:border-[#FFE500]/50 flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Upload, { size: 15 }), busy ? 'Enviando...' : 'Escolher imagem', (0, jsx_runtime_1.jsx)("input", { type: "file", accept: "image/*", className: "hidden", disabled: busy, onChange: async (e) => { const f = e.target.files?.[0]; if (!f)
                                return; setBusy(true); try {
                                onUploaded(await upload(f));
                            }
                            finally {
                                setBusy(false);
                            } } })] })] })] }); }
function Tag({ children }) { return (0, jsx_runtime_1.jsx)("span", { className: "px-2 py-1 rounded bg-[#FFE500]/10 text-[#FFE500] text-[9px] font-black", children: children }); }
function Notice({ tone, children }) { return (0, jsx_runtime_1.jsxs)("div", { className: `mb-5 p-3 rounded-lg border text-sm flex items-center gap-2 ${tone === 'ok' ? 'bg-green-500/10 border-green-500/20 text-green-300' : 'bg-red-500/10 border-red-500/20 text-red-300'}`, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Check, { size: 16 }), children] }); }
function Empty({ icon, title, text }) { return (0, jsx_runtime_1.jsxs)("div", { className: "py-20 text-center text-zinc-500", children: [icon, (0, jsx_runtime_1.jsx)("h4", { className: "font-black text-white mt-3", children: title }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm mt-2 max-w-md mx-auto", children: text })] }); }

},
"/src/components/master/SiteOrdersTool.tsx": function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SiteOrdersTool;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const supabase_1 = require("@/lib/supabase");
const siteCompat_1 = require("@/lib/siteCompat");
const lucide_react_1 = require("lucide-react");
const PAGE = 50;
const money = (v) => `R$ ${Number(v || 0).toFixed(2).replace('.', ',')}`;
const statusLabel = { pending: 'Novo', accepted: 'Pagamento aprovado', preparing: 'Separando', ready: 'Pronto', delivering: 'Enviado', pickup: 'Retirada', delivered: 'Entregue', cancelled: 'Cancelado' };
const orderNumber = (o) => o.notes?.match(/PEDIDO SITE:\s*([^\n]+)/i)?.[1]?.trim() || `SITE-${o.id.slice(0, 8).toUpperCase()}`;
function SiteOrdersTool({ onClose }) {
    const [orders, setOrders] = (0, react_1.useState)([]);
    const [count, setCount] = (0, react_1.useState)(0);
    const [page, setPage] = (0, react_1.useState)(0);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [search, setSearch] = (0, react_1.useState)('');
    const [detail, setDetail] = (0, react_1.useState)(null);
    const load = async () => {
        setLoading(true);
        const { data, count: total } = await supabase_1.supabase.from('customer_orders').select('*', { count: 'exact' }).eq('order_type', 'public').eq('campaign_name', siteCompat_1.SITE_ORDER_CAMPAIGN).order('created_at', { ascending: false }).range(page * PAGE, page * PAGE + PAGE - 1);
        setOrders((data || []));
        setCount(total || 0);
        setLoading(false);
    };
    (0, react_1.useEffect)(() => { load(); }, [page]);
    const updateStatus = async (order, status) => {
        const { error } = await supabase_1.supabase.from('customer_orders').update({ status }).eq('id', order.id);
        if (!error) {
            setDetail(prev => prev?.id === order.id ? { ...prev, status } : prev);
            load();
        }
    };
    const filtered = (0, react_1.useMemo)(() => orders.filter(o => !search.trim() || [orderNumber(o), o.customer_name, o.customer_phone, o.payer_email, o.payer_cpf].filter(Boolean).join(' ').toLowerCase().includes(search.toLowerCase())), [orders, search]);
    const pages = Math.max(1, Math.ceil(count / PAGE));
    return (0, jsx_runtime_1.jsxs)("div", { className: "fixed inset-0 z-50 bg-black/80 p-3 sm:p-6 overflow-y-auto", children: [(0, jsx_runtime_1.jsxs)("div", { className: "max-w-7xl mx-auto bg-zinc-950 border border-zinc-800 rounded-2xl min-h-[85vh] text-white overflow-hidden", children: [(0, jsx_runtime_1.jsxs)("div", { className: "p-5 border-b border-zinc-800 flex items-center justify-between sticky top-0 bg-zinc-950 z-10", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-xl font-black", children: "Pedidos Site" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs", children: "Pedidos recebidos pelo e-commerce suplementaai.com.br" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2", children: [(0, jsx_runtime_1.jsx)("button", { onClick: load, className: "p-2 bg-zinc-900 rounded-lg", children: (0, jsx_runtime_1.jsx)(lucide_react_1.RefreshCw, { size: 18 }) }), (0, jsx_runtime_1.jsx)("button", { onClick: onClose, className: "p-2 bg-zinc-900 rounded-lg", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { size: 18 }) })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "p-5", children: [(0, jsx_runtime_1.jsxs)("div", { className: "grid sm:grid-cols-4 gap-3 mb-5", children: [(0, jsx_runtime_1.jsx)(Stat, { label: "Total de pedidos", value: count }), (0, jsx_runtime_1.jsx)(Stat, { label: "Novos nesta p\u00E1gina", value: orders.filter(o => o.status === 'pending').length }), (0, jsx_runtime_1.jsx)(Stat, { label: "Pagamentos aprovados", value: orders.filter(o => o.mp_payment_status === 'approved').length }), (0, jsx_runtime_1.jsx)(Stat, { label: "Faturamento exibido", value: money(orders.reduce((s, o) => s + Number(o.total), 0)) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "relative mb-4", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Search, { size: 17, className: "absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" }), (0, jsx_runtime_1.jsx)("input", { value: search, onChange: e => setSearch(e.target.value), placeholder: "Buscar pedido, cliente, telefone, CPF ou e-mail", className: "w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-3 py-3 text-sm outline-none focus:border-[#FFE500]/50" })] }), loading ? (0, jsx_runtime_1.jsx)("div", { className: "py-20 text-center text-zinc-500", children: "Carregando pedidos..." }) : filtered.length === 0 ? (0, jsx_runtime_1.jsx)("div", { className: "py-20 text-center text-zinc-500", children: "Nenhum pedido do site encontrado." }) : (0, jsx_runtime_1.jsx)("div", { className: "overflow-x-auto", children: (0, jsx_runtime_1.jsxs)("table", { className: "w-full text-sm", children: [(0, jsx_runtime_1.jsx)("thead", { children: (0, jsx_runtime_1.jsxs)("tr", { className: "text-zinc-500 border-b border-zinc-800 text-left", children: [(0, jsx_runtime_1.jsx)("th", { className: "py-3", children: "Pedido" }), (0, jsx_runtime_1.jsx)("th", { children: "Cliente" }), (0, jsx_runtime_1.jsx)("th", { children: "Pagamento" }), (0, jsx_runtime_1.jsx)("th", { children: "Total" }), (0, jsx_runtime_1.jsx)("th", { children: "Status" }), (0, jsx_runtime_1.jsx)("th", { children: "Data" }), (0, jsx_runtime_1.jsx)("th", {})] }) }), (0, jsx_runtime_1.jsx)("tbody", { children: filtered.map(o => (0, jsx_runtime_1.jsxs)("tr", { className: "border-b border-zinc-900 hover:bg-zinc-900/50", children: [(0, jsx_runtime_1.jsx)("td", { className: "py-4 font-bold text-[#FFE500]", children: orderNumber(o) }), (0, jsx_runtime_1.jsxs)("td", { children: [(0, jsx_runtime_1.jsx)("p", { className: "font-semibold", children: o.customer_name }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-zinc-500", children: o.customer_phone })] }), (0, jsx_runtime_1.jsxs)("td", { children: [(0, jsx_runtime_1.jsx)("p", { className: "uppercase font-semibold", children: o.payment_method || '-' }), (0, jsx_runtime_1.jsx)("p", { className: `text-xs ${o.mp_payment_status === 'approved' ? 'text-green-400' : 'text-zinc-500'}`, children: o.mp_payment_status || 'aguardando' })] }), (0, jsx_runtime_1.jsx)("td", { className: "font-bold", children: money(o.total) }), (0, jsx_runtime_1.jsx)("td", { children: (0, jsx_runtime_1.jsx)("span", { className: "px-2 py-1 rounded-full bg-zinc-900 text-xs", children: statusLabel[o.status] || o.status }) }), (0, jsx_runtime_1.jsx)("td", { className: "text-zinc-400 text-xs", children: new Date(o.created_at).toLocaleString('pt-BR') }), (0, jsx_runtime_1.jsx)("td", { children: (0, jsx_runtime_1.jsx)("button", { onClick: () => setDetail(o), className: "p-2 bg-zinc-900 rounded", children: (0, jsx_runtime_1.jsx)(lucide_react_1.ExternalLink, { size: 15 }) }) })] }, o.id)) })] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mt-5 text-sm text-zinc-500", children: [(0, jsx_runtime_1.jsxs)("span", { children: [count, " pedidos \u2022 p\u00E1gina ", page + 1, " de ", pages] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2", children: [(0, jsx_runtime_1.jsx)("button", { disabled: page === 0, onClick: () => setPage(p => Math.max(0, p - 1)), className: "p-2 bg-zinc-900 rounded disabled:opacity-30", children: (0, jsx_runtime_1.jsx)(lucide_react_1.ChevronLeft, { size: 18 }) }), (0, jsx_runtime_1.jsx)("button", { disabled: page + 1 >= pages, onClick: () => setPage(p => p + 1), className: "p-2 bg-zinc-900 rounded disabled:opacity-30", children: (0, jsx_runtime_1.jsx)(lucide_react_1.ChevronRight, { size: 18 }) })] })] })] })] }), detail && (0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 z-[60] bg-black/80 p-4 flex items-center justify-center", onClick: () => setDetail(null), children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6", onClick: e => e.stopPropagation(), children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-[#FFE500] font-black", children: orderNumber(detail) }), (0, jsx_runtime_1.jsx)("h3", { className: "text-xl font-black mt-1", children: detail.customer_name })] }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setDetail(null), children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, {}) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid sm:grid-cols-2 gap-4 mt-5 text-sm", children: [(0, jsx_runtime_1.jsx)(Info, { label: "Telefone", value: detail.customer_phone }), (0, jsx_runtime_1.jsx)(Info, { label: "E-mail", value: detail.payer_email }), (0, jsx_runtime_1.jsx)(Info, { label: "CPF", value: detail.payer_cpf }), (0, jsx_runtime_1.jsx)(Info, { label: "Endere\u00E7o/CEP", value: detail.address }), (0, jsx_runtime_1.jsx)(Info, { label: "Refer\u00EAncia", value: detail.customer_reference }), (0, jsx_runtime_1.jsx)(Info, { label: "Observa\u00E7\u00F5es", value: detail.notes?.replace(/PEDIDO SITE:[^\n]+\n?/i, '').trim() })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-6", children: [(0, jsx_runtime_1.jsx)("h4", { className: "font-black uppercase text-sm", children: "Itens" }), (0, jsx_runtime_1.jsx)("div", { className: "mt-2 space-y-2", children: (detail.items || []).map((i, idx) => (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between bg-zinc-900 rounded-lg p-3", children: [(0, jsx_runtime_1.jsxs)("span", { children: [i.quantity, "x ", i.name] }), (0, jsx_runtime_1.jsx)("span", { className: "font-bold", children: money(Number(i.price) * Number(i.quantity)) })] }, idx)) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-5 border-t border-zinc-800 pt-4 space-y-2 text-sm", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between", children: [(0, jsx_runtime_1.jsx)("span", { children: "Subtotal" }), (0, jsx_runtime_1.jsx)("span", { children: money(detail.subtotal) })] }), Number(detail.coupon_discount || 0) > 0 && (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between text-green-400", children: [(0, jsx_runtime_1.jsxs)("span", { children: ["Cupom ", detail.coupon_code] }), (0, jsx_runtime_1.jsxs)("span", { children: ["- ", money(detail.coupon_discount)] })] }), Number(detail.discount_amount || 0) > 0 && (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between text-green-400", children: [(0, jsx_runtime_1.jsx)("span", { children: "PIX" }), (0, jsx_runtime_1.jsxs)("span", { children: ["- ", money(detail.discount_amount)] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between", children: [(0, jsx_runtime_1.jsx)("span", { children: "Frete" }), (0, jsx_runtime_1.jsx)("span", { children: money(detail.delivery_fee) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between text-xl font-black pt-2", children: [(0, jsx_runtime_1.jsx)("span", { children: "Total" }), (0, jsx_runtime_1.jsx)("span", { children: money(detail.total) })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-6", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-xs font-black uppercase text-zinc-500 mb-2", children: "Atualizar status" }), (0, jsx_runtime_1.jsx)("div", { className: "flex flex-wrap gap-2", children: ['pending', 'accepted', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled'].map(s => (0, jsx_runtime_1.jsx)("button", { onClick: () => updateStatus(detail, s), className: `px-3 py-2 rounded-lg text-xs font-bold ${detail.status === s ? 'bg-[#FFE500] text-black' : 'bg-zinc-900 text-zinc-300'}`, children: statusLabel[s] }, s)) })] })] }) })] });
}
function Stat({ label, value }) { return (0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-4", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs", children: label }), (0, jsx_runtime_1.jsx)("p", { className: "font-black text-xl mt-1", children: value })] }); }
function Info({ label, value }) { return (0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-900 rounded-lg p-3", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs", children: label }), (0, jsx_runtime_1.jsx)("p", { className: "mt-1 whitespace-pre-line", children: value || '-' })] }); }

},
"/src/components/master/TemplatesTool.tsx": function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TemplatesTool;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const supabase_1 = require("@/lib/supabase");
const lucide_react_1 = require("lucide-react");
const ProductLinkTool_1 = __importDefault(require("./ProductLinkTool"));
function TemplatesTool({ onClose }) {
    const [categories, setCategories] = (0, react_1.useState)([]);
    const [groups, setGroups] = (0, react_1.useState)([]);
    const [addons, setAddons] = (0, react_1.useState)([]);
    const [products, setProducts] = (0, react_1.useState)([]);
    const [franchises, setFranchises] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [view, setView] = (0, react_1.useState)('menu');
    const [showCreate, setShowCreate] = (0, react_1.useState)(false);
    const [editing, setEditing] = (0, react_1.useState)(null);
    const [saving, setSaving] = (0, react_1.useState)(false);
    const [showProductLink, setShowProductLink] = (0, react_1.useState)(false);
    const [syncing, setSyncing] = (0, react_1.useState)(false);
    const [syncResult, setSyncResult] = (0, react_1.useState)(null);
    const [movingCategoryId, setMovingCategoryId] = (0, react_1.useState)(null);
    const syncAll = async () => {
        setSyncing(true);
        setSyncResult(null);
        try {
            const { data, error } = await supabase_1.supabase.rpc('force_full_sync');
            if (error)
                throw error;
            if (data) {
                const r = data;
                setSyncResult(`Sincronização concluída: ${r.categories_created} categoria(s) criada(s), ${r.categories_synced} atualizada(s), ${r.products_created} produto(s) criado(s), ${r.products_synced} atualizado(s).`);
            }
            else {
                setSyncResult('Sincronização concluída.');
            }
        }
        catch (err) {
            setSyncResult(`Erro: ${err.message}`);
        }
        setSyncing(false);
    };
    const [catForm, setCatForm] = (0, react_1.useState)({ name: '' });
    const [groupForm, setGroupForm] = (0, react_1.useState)({ category_id: '', name: '' });
    const [addonForm, setAddonForm] = (0, react_1.useState)({ group_id: '', name: '', price: '' });
    const [prodForm, setProdForm] = (0, react_1.useState)({
        category_id: '', name: '', description: '', price: '', discount_price: '', franchise_id: '',
        image: null,
        long_description: '', ingredients: '', nutritional_info: '', usage_instructions: '',
        brand: '', flavor: '', weight: '',
    });
    const [imageUrl, setImageUrl] = (0, react_1.useState)(null);
    const [galleryFiles, setGalleryFiles] = (0, react_1.useState)([]);
    const [galleryUrls, setGalleryUrls] = (0, react_1.useState)([]);
    const [videoFiles, setVideoFiles] = (0, react_1.useState)([]);
    const [videoUrls, setVideoUrls] = (0, react_1.useState)([]);
    const load = async () => {
        const [{ data: cats }, { data: grps }, { data: adns }, { data: prods }, { data: frans }] = await Promise.all([
            supabase_1.supabase.from('product_categories').select('*').order('sort_order').order('name'),
            supabase_1.supabase.from('product_groups').select('*').order('name'),
            supabase_1.supabase.from('product_addons').select('*').order('name'),
            supabase_1.supabase.from('products').select('*').order('created_at', { ascending: false }),
            supabase_1.supabase.from('franchises').select('*').order('name'),
        ]);
        if (cats)
            setCategories(cats);
        if (grps)
            setGroups(grps);
        if (adns)
            setAddons(adns);
        if (prods)
            setProducts(prods);
        if (frans)
            setFranchises(frans);
        setLoading(false);
    };
    (0, react_1.useEffect)(() => { load(); }, []);
    const saveCategory = async (e) => {
        e.preventDefault();
        setSaving(true);
        if (editing) {
            await supabase_1.supabase.from('product_categories').update({ name: catForm.name }).eq('id', editing.id);
        }
        else {
            const maxSort = categories.reduce((max, c) => Math.max(max, c.sort_order ?? 0), 0);
            await supabase_1.supabase.from('product_categories').insert({ name: catForm.name, sort_order: maxSort + 1 });
        }
        setCatForm({ name: '' });
        setEditing(null);
        setShowCreate(false);
        setSaving(false);
        load();
    };
    const moveCategory = async (id, direction) => {
        if (movingCategoryId)
            return;
        const sorted = [...categories].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
        const idx = sorted.findIndex(category => category.id === id);
        const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (idx < 0 || targetIdx < 0 || targetIdx >= sorted.length)
            return;
        const reordered = [...sorted];
        const [moved] = reordered.splice(idx, 1);
        reordered.splice(targetIdx, 0, moved);
        setMovingCategoryId(id);
        try {
            const results = await Promise.all(reordered.map((category, position) => supabase_1.supabase.from('product_categories').update({ sort_order: position }).eq('id', category.id)));
            const failed = results.find(result => result.error);
            if (failed?.error)
                throw failed.error;
            setCategories(reordered.map((category, position) => ({ ...category, sort_order: position })));
        }
        catch (error) {
            console.error('Erro ao reordenar categorias do catálogo:', error);
            alert('Não foi possível alterar a ordem da categoria. Tente novamente.');
            await load();
        }
        finally {
            setMovingCategoryId(null);
        }
    };
    const saveGroup = async (e) => {
        e.preventDefault();
        setSaving(true);
        if (editing) {
            await supabase_1.supabase.from('product_groups').update({ category_id: groupForm.category_id, name: groupForm.name }).eq('id', editing.id);
        }
        else {
            await supabase_1.supabase.from('product_groups').insert({ category_id: groupForm.category_id, name: groupForm.name });
        }
        setGroupForm({ category_id: '', name: '' });
        setEditing(null);
        setShowCreate(false);
        setSaving(false);
        load();
    };
    const saveAddon = async (e) => {
        e.preventDefault();
        setSaving(true);
        const payload = { group_id: addonForm.group_id, name: addonForm.name, price: parseFloat(addonForm.price) || 0 };
        if (editing) {
            await supabase_1.supabase.from('product_addons').update(payload).eq('id', editing.id);
        }
        else {
            await supabase_1.supabase.from('product_addons').insert(payload);
        }
        setAddonForm({ group_id: '', name: '', price: '' });
        setEditing(null);
        setShowCreate(false);
        setSaving(false);
        load();
    };
    const saveProduct = async (e) => {
        e.preventDefault();
        setSaving(true);
        let img = imageUrl;
        if (prodForm.image) {
            const ext = prodForm.image.name.split('.').pop();
            const path = `${Date.now()}.${ext}`;
            const { error } = await supabase_1.supabase.storage.from('product-images').upload(path, prodForm.image);
            if (!error)
                img = supabase_1.supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl;
        }
        // Upload gallery images
        const uploadedGallery = [...galleryUrls];
        for (const file of galleryFiles) {
            const ext = file.name.split('.').pop();
            const path = `gallery-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
            const { error } = await supabase_1.supabase.storage.from('product-images').upload(path, file);
            if (!error)
                uploadedGallery.push(supabase_1.supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl);
        }
        // Upload videos
        const uploadedVideos = [...videoUrls];
        for (const file of videoFiles) {
            const ext = file.name.split('.').pop() || 'mp4';
            const path = `videos-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
            const { error } = await supabase_1.supabase.storage.from('product-images').upload(path, file);
            if (!error)
                uploadedVideos.push(supabase_1.supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl);
        }
        const payload = {
            category_id: prodForm.category_id || null,
            name: prodForm.name,
            description: prodForm.description || null,
            price: parseFloat(prodForm.price) || 0,
            discount_price: prodForm.discount_price ? parseFloat(prodForm.discount_price) : null,
            image_url: img,
            franchise_id: prodForm.franchise_id || null,
            long_description: prodForm.long_description || null,
            ingredients: prodForm.ingredients || null,
            nutritional_info: prodForm.nutritional_info || null,
            usage_instructions: prodForm.usage_instructions || null,
            brand: prodForm.brand || null,
            flavor: prodForm.flavor || null,
            weight: prodForm.weight || null,
            gallery_urls: uploadedGallery.length > 0 ? uploadedGallery : null,
            video_urls: uploadedVideos.length > 0 ? uploadedVideos : null,
        };
        if (editing) {
            await supabase_1.supabase.from('products').update(payload).eq('id', editing.id);
        }
        else {
            await supabase_1.supabase.from('products').insert(payload);
        }
        setProdForm({ category_id: '', name: '', description: '', price: '', discount_price: '', franchise_id: '', image: null, long_description: '', ingredients: '', nutritional_info: '', usage_instructions: '', brand: '', flavor: '', weight: '' });
        setImageUrl(null);
        setGalleryFiles([]);
        setGalleryUrls([]);
        setVideoFiles([]);
        setVideoUrls([]);
        setEditing(null);
        setShowCreate(false);
        setSaving(false);
        load();
    };
    const moveGalleryImage = (index, direction) => {
        const nextIndex = direction === 'up' ? index - 1 : index + 1;
        if (nextIndex < 0 || nextIndex >= galleryUrls.length)
            return;
        const next = [...galleryUrls];
        [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
        setGalleryUrls(next);
    };
    const deleteItem = async (table, id) => {
        if (!confirm('Excluir este item?'))
            return;
        await supabase_1.supabase.from(table).delete().eq('id', id);
        load();
    };
    const catName = (id) => categories.find(c => c.id === id)?.name ?? '—';
    const groupName = (id) => groups.find(g => g.id === id)?.name ?? '—';
    const franName = (id) => id ? (franchises.find(f => f.id === id)?.name ?? '—') : 'Todas as franquias';
    return ((0, jsx_runtime_1.jsxs)("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm", onClick: onClose, children: [(0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto", onClick: e => e.stopPropagation(), children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-10 h-10 rounded-lg bg-[#FFE500]/10 flex items-center justify-center", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Layers, { size: 20, className: "text-[#FFE500]" }) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h2", { className: "font-bold text-white text-lg", children: "Templates de Produtos" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs", children: "Categorias, grupos, adicionais e produtos" })] })] }), (0, jsx_runtime_1.jsx)("button", { onClick: onClose, className: "text-zinc-400 hover:text-white transition-colors", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { size: 22 }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "p-6", children: [view === 'menu' && ((0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [[
                                        { key: 'categories', icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Tag, { size: 22 }), label: 'Categorias', desc: 'Categorias de produtos' },
                                        { key: 'groups', icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Layers, { size: 22 }), label: 'Grupos', desc: 'Grupos de adicionais' },
                                        { key: 'addons', icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { size: 22 }), label: 'Adicionais', desc: 'Opções dentro dos grupos' },
                                        { key: 'products', icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Package, { size: 22 }), label: 'Produtos', desc: 'Produtos para as franquias' },
                                        { key: 'link', icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Link2, { size: 22 }), label: 'Vincular produtos', desc: 'Distribua produtos para uma ou todas as franquias' },
                                    ].map(item => ((0, jsx_runtime_1.jsxs)("button", { onClick: () => {
                                            if (item.key === 'link') {
                                                setShowProductLink(true);
                                            }
                                            else {
                                                setView(item.key);
                                                setShowCreate(false);
                                                setEditing(null);
                                            }
                                        }, className: "bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-[#FFE500]/30 rounded-xl p-5 text-left transition-all group", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-12 h-12 rounded-lg bg-[#FFE500]/10 flex items-center justify-center mb-3 group-hover:bg-[#FFE500]/20 transition-colors text-[#FFE500]", children: item.icon }), (0, jsx_runtime_1.jsx)("h3", { className: "text-white font-bold", children: item.label }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-sm mt-1", children: item.desc })] }, item.key))), (0, jsx_runtime_1.jsxs)("div", { className: "sm:col-span-2 mt-2", children: [(0, jsx_runtime_1.jsxs)("button", { onClick: syncAll, disabled: syncing, className: "w-full bg-[#FFE500]/10 hover:bg-[#FFE500]/20 border border-[#FFE500]/30 hover:border-[#FFE500]/50 rounded-xl p-5 text-left transition-all group flex items-center gap-4 disabled:opacity-60", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-12 h-12 rounded-lg bg-[#FFE500]/10 flex items-center justify-center group-hover:bg-[#FFE500]/20 transition-colors text-[#FFE500]", children: syncing ? (0, jsx_runtime_1.jsx)("div", { className: "w-6 h-6 border-2 border-[#FFE500]/30 border-t-[#FFE500] rounded-full animate-spin" }) : (0, jsx_runtime_1.jsx)(lucide_react_1.RefreshCw, { size: 22 }) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-white font-bold", children: "Sincronizar tudo para as unidades" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-sm mt-1", children: "Envia todas as categorias e produtos do master para todas as franquias ativas" })] })] }), syncResult && ((0, jsx_runtime_1.jsx)("div", { className: "mt-3 bg-zinc-800/50 border border-zinc-700 rounded-lg p-3", children: (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-300 text-sm", children: syncResult }) }))] })] })), view !== 'menu' && ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-4 flex-wrap gap-2", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => setView('menu'), className: "text-zinc-400 hover:text-white text-sm transition-colors", children: "\u2190 Voltar" }), (0, jsx_runtime_1.jsxs)("button", { onClick: () => { setEditing(null); setShowCreate(!showCreate); }, className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 flex items-center gap-1.5 transition-all", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { size: 16 }), " Novo"] })] }), view === 'categories' && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [showCreate && ((0, jsx_runtime_1.jsxs)("form", { onSubmit: saveCategory, className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 mb-4 flex gap-2", children: [(0, jsx_runtime_1.jsx)("input", { type: "text", value: catForm.name, onChange: e => setCatForm({ name: e.target.value }), required: true, placeholder: "Nome da categoria", className: "flex-1 bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: saving, className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 disabled:opacity-50", children: saving ? '...' : 'Criar' })] })), loading ? (0, jsx_runtime_1.jsx)("div", { className: "flex justify-center py-8", children: (0, jsx_runtime_1.jsx)("div", { className: "w-6 h-6 border-2 border-zinc-700 border-t-[#FFE500] rounded-full animate-spin" }) }) :
                                                categories.length === 0 ? (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-sm text-center py-8", children: "Nenhuma categoria." }) :
                                                    (0, jsx_runtime_1.jsx)("div", { className: "space-y-2", children: categories.map((c, i) => ((0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Tag, { size: 16, className: "text-[#FFE500]" }), (0, jsx_runtime_1.jsx)("p", { className: "text-white text-sm font-medium", children: c.name })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-1", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => moveCategory(c.id, 'up'), disabled: i === 0 || movingCategoryId !== null, className: "text-zinc-400 hover:text-[#FFE500] p-1.5 disabled:opacity-30", children: (0, jsx_runtime_1.jsx)(lucide_react_1.ArrowUp, { size: 14 }) }), (0, jsx_runtime_1.jsx)("button", { onClick: () => moveCategory(c.id, 'down'), disabled: i === categories.length - 1 || movingCategoryId !== null, className: "text-zinc-400 hover:text-[#FFE500] p-1.5 disabled:opacity-30", children: (0, jsx_runtime_1.jsx)(lucide_react_1.ArrowDown, { size: 14 }) }), (0, jsx_runtime_1.jsx)("button", { onClick: () => { setEditing(c); setCatForm({ name: c.name }); setShowCreate(true); }, className: "text-zinc-400 hover:text-[#FFE500] p-1.5", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Edit, { size: 14 }) }), (0, jsx_runtime_1.jsx)("button", { onClick: () => deleteItem('product_categories', c.id), className: "text-zinc-400 hover:text-red-400 p-1.5", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { size: 14 }) })] })] }, c.id))) })] })), view === 'groups' && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [showCreate && ((0, jsx_runtime_1.jsxs)("form", { onSubmit: saveGroup, className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 mb-4 space-y-3", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Categoria" }), (0, jsx_runtime_1.jsxs)("select", { value: groupForm.category_id, onChange: e => setGroupForm({ ...groupForm, category_id: e.target.value }), required: true, className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]", children: [(0, jsx_runtime_1.jsx)("option", { value: "", children: "Selecione..." }), categories.map(c => (0, jsx_runtime_1.jsx)("option", { value: c.id, children: c.name }, c.id))] })] }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: groupForm.name, onChange: e => setGroupForm({ ...groupForm, name: e.target.value }), required: true, placeholder: "Nome do grupo", className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: saving, className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 disabled:opacity-50", children: "Criar" })] })), loading ? (0, jsx_runtime_1.jsx)("div", { className: "flex justify-center py-8", children: (0, jsx_runtime_1.jsx)("div", { className: "w-6 h-6 border-2 border-zinc-700 border-t-[#FFE500] rounded-full animate-spin" }) }) :
                                                groups.length === 0 ? (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-sm text-center py-8", children: "Nenhum grupo." }) :
                                                    (0, jsx_runtime_1.jsx)("div", { className: "space-y-2", children: groups.map(g => ((0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-white text-sm font-medium", children: g.name }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs", children: catName(g.category_id) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-1", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => { setEditing(g); setGroupForm({ category_id: g.category_id, name: g.name }); setShowCreate(true); }, className: "text-zinc-400 hover:text-[#FFE500] p-1.5", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Edit, { size: 14 }) }), (0, jsx_runtime_1.jsx)("button", { onClick: () => deleteItem('product_groups', g.id), className: "text-zinc-400 hover:text-red-400 p-1.5", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { size: 14 }) })] })] }, g.id))) })] })), view === 'addons' && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [showCreate && ((0, jsx_runtime_1.jsxs)("form", { onSubmit: saveAddon, className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 mb-4 space-y-3", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Grupo" }), (0, jsx_runtime_1.jsxs)("select", { value: addonForm.group_id, onChange: e => setAddonForm({ ...addonForm, group_id: e.target.value }), required: true, className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]", children: [(0, jsx_runtime_1.jsx)("option", { value: "", children: "Selecione..." }), groups.map(g => (0, jsx_runtime_1.jsxs)("option", { value: g.id, children: [g.name, " (", catName(g.category_id), ")"] }, g.id))] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-3", children: [(0, jsx_runtime_1.jsx)("input", { type: "text", value: addonForm.name, onChange: e => setAddonForm({ ...addonForm, name: e.target.value }), required: true, placeholder: "Nome do adicional", className: "bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), (0, jsx_runtime_1.jsx)("input", { type: "number", step: "0.01", value: addonForm.price, onChange: e => setAddonForm({ ...addonForm, price: e.target.value }), required: true, placeholder: "Pre\u00E7o", className: "bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: saving, className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 disabled:opacity-50", children: "Criar" })] })), loading ? (0, jsx_runtime_1.jsx)("div", { className: "flex justify-center py-8", children: (0, jsx_runtime_1.jsx)("div", { className: "w-6 h-6 border-2 border-zinc-700 border-t-[#FFE500] rounded-full animate-spin" }) }) :
                                                addons.length === 0 ? (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-sm text-center py-8", children: "Nenhum adicional." }) :
                                                    (0, jsx_runtime_1.jsx)("div", { className: "space-y-2", children: addons.map(a => ((0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-white text-sm font-medium", children: a.name }), (0, jsx_runtime_1.jsxs)("p", { className: "text-zinc-500 text-xs", children: [groupName(a.group_id), " \u2014 R$ ", a.price.toFixed(2)] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-1", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => { setEditing(a); setAddonForm({ group_id: a.group_id, name: a.name, price: String(a.price) }); setShowCreate(true); }, className: "text-zinc-400 hover:text-[#FFE500] p-1.5", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Edit, { size: 14 }) }), (0, jsx_runtime_1.jsx)("button", { onClick: () => deleteItem('product_addons', a.id), className: "text-zinc-400 hover:text-red-400 p-1.5", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { size: 14 }) })] })] }, a.id))) })] })), view === 'products' && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [showCreate && ((0, jsx_runtime_1.jsxs)("form", { onSubmit: saveProduct, className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 mb-4 space-y-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Categoria" }), (0, jsx_runtime_1.jsxs)("select", { value: prodForm.category_id, onChange: e => setProdForm({ ...prodForm, category_id: e.target.value }), className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]", children: [(0, jsx_runtime_1.jsx)("option", { value: "", children: "Sem categoria" }), categories.map(c => (0, jsx_runtime_1.jsx)("option", { value: c.id, children: c.name }, c.id))] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Aplicar a" }), (0, jsx_runtime_1.jsxs)("select", { value: prodForm.franchise_id, onChange: e => setProdForm({ ...prodForm, franchise_id: e.target.value }), className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]", children: [(0, jsx_runtime_1.jsx)("option", { value: "", children: "Todas as franquias" }), franchises.map(f => (0, jsx_runtime_1.jsx)("option", { value: f.id, children: f.name }, f.id))] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [(0, jsx_runtime_1.jsx)("input", { type: "text", value: prodForm.name, onChange: e => setProdForm({ ...prodForm, name: e.target.value }), required: true, placeholder: "Nome do produto", className: "bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), (0, jsx_runtime_1.jsx)("input", { type: "number", step: "0.01", value: prodForm.price, onChange: e => setProdForm({ ...prodForm, price: e.target.value }), required: true, placeholder: "Pre\u00E7o", className: "bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), (0, jsx_runtime_1.jsx)("input", { type: "number", step: "0.01", value: prodForm.discount_price, onChange: e => setProdForm({ ...prodForm, discount_price: e.target.value }), placeholder: "Pre\u00E7o promocional (opcional)", className: "bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), (0, jsx_runtime_1.jsx)("textarea", { value: prodForm.description, onChange: e => setProdForm({ ...prodForm, description: e.target.value }), rows: 2, placeholder: "Descri\u00E7\u00E3o curta", className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500] resize-none" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("label", { className: "flex items-center gap-2 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 cursor-pointer hover:border-[#FFE500]/50 transition-colors", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Upload, { size: 16, className: "text-zinc-400" }), (0, jsx_runtime_1.jsx)("span", { className: "text-zinc-400 text-sm", children: prodForm.image ? prodForm.image.name : imageUrl ? 'Capa atual — clique para trocar' : 'Imagem principal (opcional)' }), (0, jsx_runtime_1.jsx)("input", { type: "file", accept: "image/*", className: "hidden", onChange: e => setProdForm({ ...prodForm, image: e.target.files?.[0] ?? null }) })] }), (prodForm.image || imageUrl) && (0, jsx_runtime_1.jsxs)("div", { className: "mt-2 flex items-center gap-3 bg-zinc-900/50 rounded-lg p-2", children: [(0, jsx_runtime_1.jsx)("img", { src: prodForm.image ? URL.createObjectURL(prodForm.image) : imageUrl ?? '', alt: "Pr\u00E9via da capa", className: "w-16 h-16 rounded-lg object-cover" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-white text-xs font-medium", children: "Capa atual" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs", children: "Esta imagem aparece no cat\u00E1logo." })] })] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Galeria de imagens (opcional)" }), (0, jsx_runtime_1.jsxs)("label", { className: "flex items-center gap-2 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 cursor-pointer hover:border-[#FFE500]/50 transition-colors", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ImageIcon, { size: 16, className: "text-zinc-400" }), (0, jsx_runtime_1.jsx)("span", { className: "text-zinc-400 text-sm", children: galleryFiles.length > 0 ? `${galleryFiles.length} nova(s) imagem(ns)` : 'Adicionar múltiplas fotos' }), (0, jsx_runtime_1.jsx)("input", { type: "file", accept: "image/*", multiple: true, className: "hidden", onChange: e => setGalleryFiles([...galleryFiles, ...Array.from(e.target.files ?? [])]) })] }), (galleryUrls.length > 0 || galleryFiles.length > 0) && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs mt-2", children: "A ordem acima ser\u00E1 usada no cat\u00E1logo: 1\u00AA, 2\u00AA, 3\u00AA..." }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2 mt-2 flex-wrap", children: [galleryUrls.map((url, i) => ((0, jsx_runtime_1.jsxs)("div", { className: "relative w-20 h-20 rounded-lg overflow-hidden group border border-zinc-700", children: [(0, jsx_runtime_1.jsx)("img", { src: url, alt: `Imagem ${i + 1}`, className: "w-full h-full object-cover" }), (0, jsx_runtime_1.jsxs)("span", { className: "absolute top-1 left-1 bg-black/70 text-white text-[10px] font-bold rounded px-1.5 py-0.5", children: [i + 1, "\u00BA"] }), (0, jsx_runtime_1.jsxs)("div", { className: "absolute inset-x-0 bottom-0 bg-black/75 flex justify-between items-center px-1 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => moveGalleryImage(i, 'up'), disabled: i === 0, className: "text-white disabled:opacity-30", children: (0, jsx_runtime_1.jsx)(lucide_react_1.ChevronUp, { size: 14 }) }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setGalleryUrls(galleryUrls.filter((_, idx) => idx !== i)), className: "text-red-300", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { size: 14 }) }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => moveGalleryImage(i, 'down'), disabled: i === galleryUrls.length - 1, className: "text-white disabled:opacity-30", children: (0, jsx_runtime_1.jsx)(lucide_react_1.ChevronDown, { size: 14 }) })] })] }, `u${i}`))), galleryFiles.map((file, i) => ((0, jsx_runtime_1.jsxs)("div", { className: "relative w-14 h-14 rounded-lg overflow-hidden group bg-zinc-800 flex items-center justify-center", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-xs text-zinc-400 truncate px-1", children: file.name.slice(0, 10) }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setGalleryFiles(galleryFiles.filter((_, idx) => idx !== i)), className: "absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { size: 14, className: "text-white" }) })] }, `f${i}`)))] })] }))] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "V\u00EDdeos do produto (opcional)" }), (0, jsx_runtime_1.jsxs)("label", { className: "flex items-center gap-2 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 cursor-pointer hover:border-[#FFE500]/50 transition-colors", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Video, { size: 16, className: "text-zinc-400" }), (0, jsx_runtime_1.jsx)("span", { className: "text-zinc-400 text-sm", children: videoFiles.length > 0 ? `${videoFiles.length} novo(s) vídeo(s)` : 'Adicionar vídeos do produto' }), (0, jsx_runtime_1.jsx)("input", { type: "file", accept: "video/*", multiple: true, className: "hidden", onChange: e => setVideoFiles([...videoFiles, ...Array.from(e.target.files ?? [])]) })] }), (videoUrls.length > 0 || videoFiles.length > 0) && ((0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2 mt-2 flex-wrap", children: [videoUrls.map((url, i) => ((0, jsx_runtime_1.jsxs)("div", { className: "relative w-20 h-20 rounded-lg overflow-hidden group border border-zinc-700 bg-zinc-800 flex items-center justify-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Video, { size: 18, className: "text-zinc-500" }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setVideoUrls(videoUrls.filter((_, idx) => idx !== i)), className: "absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { size: 14, className: "text-white" }) })] }, `vu${i}`))), videoFiles.map((file, i) => ((0, jsx_runtime_1.jsxs)("div", { className: "relative w-14 h-14 rounded-lg overflow-hidden group bg-zinc-800 flex items-center justify-center", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-xs text-zinc-400 truncate px-1", children: file.name.slice(0, 10) }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setVideoFiles(videoFiles.filter((_, idx) => idx !== i)), className: "absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { size: 14, className: "text-white" }) })] }, `vf${i}`)))] }))] }), (0, jsx_runtime_1.jsxs)("details", { className: "bg-zinc-900/50 border border-zinc-700 rounded-lg", children: [(0, jsx_runtime_1.jsx)("summary", { className: "cursor-pointer text-zinc-300 text-sm font-medium px-3 py-2 select-none", children: "Informa\u00E7\u00F5es detalhadas (opcional)" }), (0, jsx_runtime_1.jsxs)("div", { className: "p-3 space-y-3", children: [(0, jsx_runtime_1.jsx)("textarea", { value: prodForm.long_description, onChange: e => setProdForm({ ...prodForm, long_description: e.target.value }), rows: 3, placeholder: "Descri\u00E7\u00E3o detalhada", className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500] resize-none" }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3", children: [(0, jsx_runtime_1.jsx)("input", { type: "text", value: prodForm.brand, onChange: e => setProdForm({ ...prodForm, brand: e.target.value }), placeholder: "Marca", className: "bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: prodForm.flavor, onChange: e => setProdForm({ ...prodForm, flavor: e.target.value }), placeholder: "Sabor", className: "bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: prodForm.weight, onChange: e => setProdForm({ ...prodForm, weight: e.target.value }), placeholder: "Peso / Tamanho", className: "bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: prodForm.ingredients, onChange: e => setProdForm({ ...prodForm, ingredients: e.target.value }), placeholder: "Ingredientes", className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: prodForm.nutritional_info, onChange: e => setProdForm({ ...prodForm, nutritional_info: e.target.value }), placeholder: "Informa\u00E7\u00E3o nutricional", className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), (0, jsx_runtime_1.jsx)("textarea", { value: prodForm.usage_instructions, onChange: e => setProdForm({ ...prodForm, usage_instructions: e.target.value }), rows: 2, placeholder: "Como usar / consumo", className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500] resize-none" })] })] }), (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: saving, className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 disabled:opacity-50", children: saving ? 'Salvando...' : editing ? 'Salvar' : 'Criar produto' })] })), loading ? (0, jsx_runtime_1.jsx)("div", { className: "flex justify-center py-8", children: (0, jsx_runtime_1.jsx)("div", { className: "w-6 h-6 border-2 border-zinc-700 border-t-[#FFE500] rounded-full animate-spin" }) }) :
                                                products.length === 0 ? (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-sm text-center py-8", children: "Nenhum produto." }) :
                                                    (0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: products.map(p => ((0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-start justify-between mb-2", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [p.image_url ? (0, jsx_runtime_1.jsx)("img", { src: p.image_url, alt: p.name, className: "w-12 h-12 rounded object-cover" }) :
                                                                                    (0, jsx_runtime_1.jsx)("div", { className: "w-12 h-12 rounded bg-zinc-700 flex items-center justify-center", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Package, { size: 18, className: "text-zinc-400" }) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-white text-sm font-medium", children: p.name }), (0, jsx_runtime_1.jsxs)("p", { className: "text-[#FFE500] text-xs font-bold", children: ["R$ ", (p.discount_price ?? p.price).toFixed(2), " ", p.discount_price && (0, jsx_runtime_1.jsxs)("span", { className: "text-zinc-500 line-through ml-1", children: ["R$ ", p.price.toFixed(2)] })] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-1", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => {
                                                                                        setEditing(p);
                                                                                        setProdForm({ category_id: p.category_id ?? '', name: p.name, description: p.description ?? '', price: String(p.price), discount_price: p.discount_price ? String(p.discount_price) : '', franchise_id: p.franchise_id ?? '', image: null, long_description: p.long_description ?? '', ingredients: p.ingredients ?? '', nutritional_info: p.nutritional_info ?? '', usage_instructions: p.usage_instructions ?? '', brand: p.brand ?? '', flavor: p.flavor ?? '', weight: p.weight ?? '' });
                                                                                        setImageUrl(p.image_url);
                                                                                        setGalleryUrls(p.gallery_urls ?? []);
                                                                                        setGalleryFiles([]);
                                                                                        setVideoUrls(p.video_urls ?? []);
                                                                                        setVideoFiles([]);
                                                                                        setShowCreate(true);
                                                                                    }, className: "text-zinc-400 hover:text-[#FFE500] p-1.5", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Edit, { size: 14 }) }), (0, jsx_runtime_1.jsx)("button", { onClick: () => deleteItem('products', p.id), className: "text-zinc-400 hover:text-red-400 p-1.5", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { size: 14 }) })] })] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-zinc-500 text-xs", children: [catName(p.category_id), " \u2014 ", franName(p.franchise_id)] })] }, p.id))) })] }))] }))] })] }), showProductLink && (0, jsx_runtime_1.jsx)(ProductLinkTool_1.default, { onClose: () => setShowProductLink(false) })] }));
}

},
"/src/components/master/ToolsMenu.tsx": function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ToolsMenu;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const lucide_react_1 = require("lucide-react");
const MonthlyFeesTool_1 = __importDefault(require("./MonthlyFeesTool"));
const MarketingTool_1 = __importDefault(require("./MarketingTool"));
const FactoryOrdersTool_1 = __importDefault(require("./FactoryOrdersTool"));
const RankingTool_1 = __importDefault(require("./RankingTool"));
const CoursesTool_1 = __importDefault(require("./CoursesTool"));
const TemplatesTool_1 = __importDefault(require("./TemplatesTool"));
const ReportsTool_1 = __importDefault(require("./ReportsTool"));
const ExportContactsTool_1 = __importDefault(require("./ExportContactsTool"));
const CouponsTool_1 = __importDefault(require("./CouponsTool"));
const SiteOrdersTool_1 = __importDefault(require("./SiteOrdersTool"));
const SiteManagerTool_1 = __importDefault(require("./SiteManagerTool"));
const TOOLS = [
    { key: 'announcements', icon: lucide_react_1.Megaphone, label: 'Comunicados', desc: 'Avisos que aparecem como popup nas franquias', component: null },
    { key: 'monthlyFees', icon: lucide_react_1.DollarSign, label: 'Mensalidades', desc: 'Cobranças, vencimentos e comprovantes', component: MonthlyFeesTool_1.default },
    { key: 'marketing', icon: lucide_react_1.Folder, label: 'Banco de Marketing', desc: 'Materiais para download pelas franquias', component: MarketingTool_1.default },
    { key: 'factoryOrders', icon: lucide_react_1.Factory, label: 'Pedidos de Fábrica', desc: 'Pedidos enviados pelas franquias', component: FactoryOrdersTool_1.default },
    { key: 'ranking', icon: lucide_react_1.Trophy, label: 'Ranking', desc: 'Ranking de faturamento entre unidades', component: RankingTool_1.default },
    { key: 'courses', icon: lucide_react_1.GraduationCap, label: 'Cursos', desc: 'Treinamentos em vídeo para franqueados', component: CoursesTool_1.default },
    { key: 'templates', icon: lucide_react_1.Layers, label: 'Templates', desc: 'Produtos, categorias e adicionais', component: TemplatesTool_1.default },
    { key: 'reports', icon: lucide_react_1.BarChart3, label: 'Relatórios', desc: 'Relatórios unificados com gráficos', component: ReportsTool_1.default },
    { key: 'coupons', icon: lucide_react_1.Ticket, label: 'Cupons', desc: 'Cupons de desconto para o catálogo', component: CouponsTool_1.default },
    { key: 'siteManager', icon: lucide_react_1.Paintbrush, label: 'Gerenciar Site', desc: 'Layout, banners, produtos, cores e conteúdo do e-commerce', component: SiteManagerTool_1.default },
    { key: 'siteOrders', icon: lucide_react_1.Globe2, label: 'Pedidos Site', desc: 'Pedidos recebidos em suplementaai.com.br', component: SiteOrdersTool_1.default },
    { key: 'aiChatbot', icon: lucide_react_1.MessageCircle, label: 'IA Chatbot', desc: 'Integração com IA via OpenRouter — em breve', component: null },
    { key: 'export', icon: lucide_react_1.Users, label: 'Exportar Contatos', desc: 'Lista de clientes para marketing', component: ExportContactsTool_1.default },
];
function ToolsMenu({ onClose }) {
    const [activeTool, setActiveTool] = (0, react_1.useState)(null);
    const ActiveComponent = TOOLS.find(t => t.key === activeTool)?.component;
    if (ActiveComponent) {
        return (0, jsx_runtime_1.jsx)(ActiveComponent, { onClose: () => setActiveTool(null) });
    }
    return ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm", onClick: onClose, children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto", onClick: e => e.stopPropagation(), children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h2", { className: "font-bold text-white text-lg", children: "Ferramentas" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs", children: "Fun\u00E7\u00F5es do painel master" })] }), (0, jsx_runtime_1.jsx)("button", { onClick: onClose, className: "text-zinc-400 hover:text-white transition-colors", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { size: 22 }) })] }), (0, jsx_runtime_1.jsx)("div", { className: "p-6", children: (0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", children: TOOLS.map(tool => {
                            const Icon = tool.icon;
                            return ((0, jsx_runtime_1.jsxs)("button", { onClick: () => tool.component ? setActiveTool(tool.key) : null, className: `bg-zinc-800 border border-zinc-700 rounded-xl p-5 text-left transition-all group ${tool.component ? 'hover:bg-zinc-700 hover:border-[#FFE500]/30 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`, children: [(0, jsx_runtime_1.jsx)("div", { className: "w-12 h-12 rounded-lg bg-[#FFE500]/10 flex items-center justify-center mb-3 group-hover:bg-[#FFE500]/20 transition-colors", children: (0, jsx_runtime_1.jsx)(Icon, { size: 22, className: "text-[#FFE500]" }) }), (0, jsx_runtime_1.jsx)("h3", { className: "text-white font-bold text-sm", children: tool.label }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-xs mt-1", children: tool.desc })] }, tool.key));
                        }) }) })] }) }));
}

},
"/src/contexts/AuthContext.tsx": function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthProvider = AuthProvider;
exports.useAuth = useAuth;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const supabase_1 = require("@/lib/supabase");
const AuthContext = (0, react_1.createContext)(null);
function AuthProvider({ children }) {
    const [session, setSession] = (0, react_1.useState)(null);
    const [franchiseId, setFranchiseId] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const resolveSession = async (s) => {
        setSession(s);
        if (s) {
            const role = s.user.user_metadata?.role;
            if (role !== 'master') {
                const { data } = await supabase_1.supabase
                    .from('franchise_users')
                    .select('franchise_id')
                    .eq('auth_user_id', s.user.id)
                    .maybeSingle();
                setFranchiseId(data?.franchise_id ?? null);
            }
            else {
                setFranchiseId(null);
            }
        }
        else {
            setFranchiseId(null);
        }
    };
    (0, react_1.useEffect)(() => {
        supabase_1.supabase.auth.getSession().then(({ data: { session: s } }) => {
            (async () => {
                await resolveSession(s);
                setLoading(false);
            })();
        });
        const { data: { subscription } } = supabase_1.supabase.auth.onAuthStateChange((_event, s) => {
            (async () => {
                await resolveSession(s);
                setLoading(false);
            })();
        });
        return () => subscription.unsubscribe();
    }, []);
    const signIn = async (email, password) => {
        const { error } = await supabase_1.supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
        if (error)
            return { error: error.message };
        return { error: null };
    };
    const signOut = async () => {
        await supabase_1.supabase.auth.signOut();
    };
    const isMaster = session?.user.user_metadata?.role === 'master';
    return ((0, jsx_runtime_1.jsx)(AuthContext.Provider, { value: { session, user: session?.user ?? null, isMaster, franchiseId, loading, signIn, signOut }, children: children }));
}
function useAuth() {
    const ctx = (0, react_1.useContext)(AuthContext);
    if (!ctx)
        throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}

},
"/src/lib/mtClient.ts": function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseStoredPickupAddress = parseStoredPickupAddress;
exports.serializePickupAddress = serializePickupAddress;
exports.parseMtQuote = parseMtQuote;
exports.callExistingMt = callExistingMt;
exports.quoteExistingMt = quoteExistingMt;
exports.customerDeliveryPortion = customerDeliveryPortion;
exports.fallbackDeliveryFee = fallbackDeliveryFee;
exports.haversineKm = haversineKm;
const supabase_1 = require("@/lib/supabase");
// Mantém compatibilidade com o banco atual: os quatro campos exigidos pela MT
// ficam serializados no delivery_settings.address como:
// "Rua e número - Bairro - Cidade/UF". Nenhuma coluna nova é necessária.
function parseStoredPickupAddress(value) {
    const raw = String(value || '').trim();
    const parts = raw.split(/\s+-\s+/).map(x => x.trim()).filter(Boolean);
    const address = parts[0] || '';
    const neighborhood = parts[1] || '';
    const cityState = parts.slice(2).join(' - ');
    const match = cityState.match(/^(.+?)\s*\/\s*([A-Za-z]{2})$/);
    return { address, neighborhood, city: match?.[1]?.trim() || '', state: match?.[2]?.toUpperCase() || '' };
}
function serializePickupAddress(parts) {
    const address = parts.address.trim();
    const neighborhood = parts.neighborhood.trim();
    const city = parts.city.trim();
    const state = parts.state.trim().toUpperCase();
    return [address, neighborhood, city && state ? `${city}/${state}` : city || state].filter(Boolean).join(' - ');
}
const n = (value) => {
    const parsed = typeof value === 'string' ? Number(value.replace(',', '.')) : Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};
function parseMtQuote(payload) {
    const root = payload?.data ?? payload?.result ?? payload?.resultado ?? payload ?? {};
    const nested = root?.data ?? root?.estimativa ?? root;
    const fee = n(nested?.estimativa_valor ?? nested?.valor_estimativa ?? nested?.valor ?? nested?.preco ??
        root?.estimativa_valor ?? root?.valor_estimativa ?? root?.valor ?? root?.preco);
    const km = n(nested?.estimativa_km ?? nested?.km ?? nested?.distancia_km ?? root?.estimativa_km ?? root?.km);
    const minutes = n(nested?.estimativa_minutos ?? nested?.tempo_minutos ?? nested?.minutos ?? root?.estimativa_minutos ?? root?.minutos);
    if (fee == null || fee <= 0)
        throw new Error('A MT Entregas não retornou uma taxa positiva para esta rota. Confira os endereços e a configuração da central.');
    return { fee, km, minutes, raw: payload };
}
async function callExistingMt(settings, action, payload) {
    if (!settings.mt_entregas_enabled)
        throw new Error('MT Entregas está desativada nesta unidade.');
    if (!settings.mt_entregas_username || !settings.mt_entregas_password)
        throw new Error('Login e senha da MT Entregas não estão configurados nesta unidade.');
    const { data, error } = await supabase_1.supabase.functions.invoke('mt-entregas', {
        body: {
            action,
            payload: {
                ...payload,
                basic_auth: {
                    username: settings.mt_entregas_username,
                    password: settings.mt_entregas_password,
                },
            },
        },
    });
    if (error)
        throw new Error(error.message || 'Falha ao acessar a integração MT Entregas.');
    if (data?.success === false)
        throw new Error(data?.error || data?.errors?.join?.(', ') || 'A MT Entregas recusou a solicitação.');
    return data;
}
async function quoteExistingMt(settings, destination) {
    const pickup = parseStoredPickupAddress(settings.address);
    if (!pickup.address || !pickup.neighborhood || !pickup.city || !pickup.state) {
        throw new Error('Complete o endereço de retirada em Delivery: endereço, bairro, cidade e UF.');
    }
    const data = await callExistingMt(settings, 'quote', {
        pickup_address: pickup.address,
        pickup_neighborhood: pickup.neighborhood,
        pickup_city: pickup.city,
        pickup_state: pickup.state,
        pickup_lat: settings.latitude ?? undefined,
        pickup_lng: settings.longitude ?? undefined,
        delivery_address: destination.address,
        delivery_neighborhood: destination.neighborhood || undefined,
        delivery_city: destination.city || undefined,
        delivery_state: destination.state || undefined,
        delivery_lat: destination.lat ?? undefined,
        delivery_lng: destination.lng ?? undefined,
        category_id: settings.mt_entregas_category_id ?? undefined,
    });
    return parseMtQuote(data);
}
function customerDeliveryPortion(rawFee, storePercent = 0) {
    const pct = Math.min(100, Math.max(0, Number(storePercent) || 0));
    return Math.round(rawFee * (1 - pct / 100) * 100) / 100;
}
function fallbackDeliveryFee(settings, args) {
    if (!settings?.enabled)
        return 0;
    if (settings.fee_type === 'neighborhood') {
        const target = (args.neighborhood || '').trim().toLocaleLowerCase('pt-BR');
        const rows = Array.isArray(settings.neighborhood_fees) ? settings.neighborhood_fees : [];
        const row = rows.find((item) => String(item?.name || '').trim().toLocaleLowerCase('pt-BR') === target);
        return Number(row?.fee) || 0;
    }
    const distance = args.distanceKm;
    if (distance == null || !Number.isFinite(distance))
        return 0;
    if (settings.fee_type === 'km')
        return Math.round(distance * (Number(settings.fee_value) || 0) * 100) / 100;
    if (settings.fee_type === 'range') {
        const rows = (Array.isArray(settings.fee_ranges) ? settings.fee_ranges : [])
            .map((item) => ({ up: Number(item?.up_to_km), fee: Number(item?.fee) }))
            .filter((item) => Number.isFinite(item.up) && Number.isFinite(item.fee))
            .sort((a, b) => a.up - b.up);
        const row = rows.find((item) => distance <= item.up);
        return row?.fee || 0;
    }
    return 0;
}
function haversineKm(lat1, lng1, lat2, lng2) {
    if ([lat1, lng1, lat2, lng2].some(v => v == null || !Number.isFinite(Number(v))))
        return null;
    const toRad = (d) => d * Math.PI / 180;
    const R = 6371;
    const dLat = toRad(Number(lat2) - Number(lat1));
    const dLng = toRad(Number(lng2) - Number(lng1));
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(Number(lat1))) * Math.cos(toRad(Number(lat2))) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

},
"/src/lib/siteCompat.ts": function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_SITE_CONFIG = exports.SITE_ORDER_CAMPAIGN = exports.SITE_CONFIG_TITLE = void 0;
exports.loadSiteConfig = loadSiteConfig;
exports.saveSiteConfig = saveSiteConfig;
exports.mergeSiteProduct = mergeSiteProduct;
const supabase_1 = require("@/lib/supabase");
exports.SITE_CONFIG_TITLE = '__SUPLEMENTAAI_NATIONAL_SITE_CONFIG__';
exports.SITE_ORDER_CAMPAIGN = 'SUPLEMENTAAI_SITE';
exports.DEFAULT_SITE_CONFIG = {
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
    ...exports.DEFAULT_SITE_CONFIG,
    ...(raw || {}),
    heroSlides: raw?.heroSlides?.length ? raw.heroSlides : exports.DEFAULT_SITE_CONFIG.heroSlides,
    homeSections: raw?.homeSections?.length ? raw.homeSections : exports.DEFAULT_SITE_CONFIG.homeSections,
    promoBanners: raw?.promoBanners?.length ? raw.promoBanners : exports.DEFAULT_SITE_CONFIG.promoBanners,
    objectives: raw?.objectives?.length ? raw.objectives : exports.DEFAULT_SITE_CONFIG.objectives,
    benefits: raw?.benefits?.length ? raw.benefits : exports.DEFAULT_SITE_CONFIG.benefits,
    footer: { ...exports.DEFAULT_SITE_CONFIG.footer, ...(raw?.footer || {}) },
    seo: { ...exports.DEFAULT_SITE_CONFIG.seo, ...(raw?.seo || {}) },
    productOverrides: raw?.productOverrides || {},
});
async function loadSiteConfig() {
    const { data, error } = await supabase_1.supabase
        .from('franchise_promotions')
        .select('id,franchise_id,description,created_at')
        .eq('title', exports.SITE_CONFIG_TITLE)
        .order('created_at', { ascending: false })
        .limit(1);
    if (error)
        throw error;
    const row = data?.[0];
    if (!row)
        return { config: exports.DEFAULT_SITE_CONFIG, recordId: null };
    try {
        const parsed = JSON.parse(row.description || '{}');
        return { config: normalize({ ...parsed, fulfillmentFranchiseId: parsed.fulfillmentFranchiseId || row.franchise_id || '' }), recordId: row.id };
    }
    catch {
        return { config: { ...exports.DEFAULT_SITE_CONFIG, fulfillmentFranchiseId: row.franchise_id || '' }, recordId: row.id };
    }
}
async function saveSiteConfig(config, recordId) {
    if (!config.fulfillmentFranchiseId)
        throw new Error('Escolha a central/unidade responsável pelo site antes de publicar.');
    const payload = {
        franchise_id: config.fulfillmentFranchiseId,
        title: exports.SITE_CONFIG_TITLE,
        description: JSON.stringify({ ...config, version: 2 }),
        badge_text: 'INTERNO',
        image_url: null,
        product_id: null,
        sort_order: 999999,
        active: false,
    };
    if (recordId) {
        const { data, error } = await supabase_1.supabase.from('franchise_promotions').update(payload).eq('id', recordId).select('id').single();
        if (error)
            throw error;
        return data.id;
    }
    const { data, error } = await supabase_1.supabase.from('franchise_promotions').insert(payload).select('id').single();
    if (error)
        throw error;
    return data.id;
}
function mergeSiteProduct(product, config) {
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

},
"/src/lib/supabase.ts": function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const supabaseUrl = "https://sgvojdgbjvynnoherpqj.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNndm9qZGdianZ5bm5vaGVycHFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3NDE4ODIsImV4cCI6MjEwMTMxNzg4Mn0.RuAHGD0VCcDxIL4jfSFXjyiC4ZzVgRAZna3j80ovIf4";
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseAnonKey);

},
"/src/main.tsx": function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const client_1 = require("react-dom/client");
const App_tsx_1 = __importDefault(require("./App.tsx"));
(0, client_1.createRoot)(document.getElementById('root')).render((0, jsx_runtime_1.jsx)(react_1.StrictMode, { children: (0, jsx_runtime_1.jsx)(App_tsx_1.default, {}) }));
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).then(registration => registration.update()).catch(() => { });
    });
}

},
"/src/pages/EcommerceStorefront.tsx": function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = EcommerceStorefront;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const supabase_1 = require("@/lib/supabase");
const siteCompat_1 = require("@/lib/siteCompat");
const lucide_react_1 = require("lucide-react");
const money = (v) => `R$ ${Number(v || 0).toFixed(2).replace('.', ',')}`;
const round = (v) => Math.round((v + Number.EPSILON) * 100) / 100;
const compareCategory = (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || (a.created_at || '').localeCompare(b.created_at || '') || a.id.localeCompare(b.id);
function EcommerceStorefront() {
    const [config, setConfig] = (0, react_1.useState)(null);
    const [products, setProducts] = (0, react_1.useState)([]);
    const [categories, setCategories] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [search, setSearch] = (0, react_1.useState)('');
    const [activeCategory, setActiveCategory] = (0, react_1.useState)('all');
    const [heroIndex, setHeroIndex] = (0, react_1.useState)(0);
    const [mobileMenu, setMobileMenu] = (0, react_1.useState)(false);
    const [cart, setCart] = (0, react_1.useState)([]);
    const [cartOpen, setCartOpen] = (0, react_1.useState)(false);
    const [detail, setDetail] = (0, react_1.useState)(null);
    const [checkoutOpen, setCheckoutOpen] = (0, react_1.useState)(false);
    const [coupon, setCoupon] = (0, react_1.useState)(null);
    const [couponCode, setCouponCode] = (0, react_1.useState)('');
    const [couponMessage, setCouponMessage] = (0, react_1.useState)('');
    const [submitting, setSubmitting] = (0, react_1.useState)(false);
    const [orderMessage, setOrderMessage] = (0, react_1.useState)('');
    const [form, setForm] = (0, react_1.useState)({ name: '', phone: '', email: '', cpf: '', zip: '', address: '', city: '', state: '', reference: '', notes: '', payment: 'pix' });
    (0, react_1.useEffect)(() => {
        (async () => {
            setLoading(true);
            try {
                const { config: saved } = await (0, siteCompat_1.loadSiteConfig)();
                const cfg = saved || siteCompat_1.DEFAULT_SITE_CONFIG;
                setConfig(cfg);
                if (!cfg.fulfillmentFranchiseId) {
                    setLoading(false);
                    return;
                }
                const [{ data: prod }, { data: cats }] = await Promise.all([
                    supabase_1.supabase.from('franchise_products').select('*').eq('franchise_id', cfg.fulfillmentFranchiseId).eq('active', true).order('sort_order').order('name'),
                    supabase_1.supabase.from('franchise_categories').select('*').eq('franchise_id', cfg.fulfillmentFranchiseId).order('sort_order').order('name'),
                ]);
                const merged = (prod || []).map(p => (0, siteCompat_1.mergeSiteProduct)(p, cfg)).filter(p => p.site.visible !== false).sort((a, b) => (a.site.sortOrder ?? a.sort_order ?? 999999) - (b.site.sortOrder ?? b.sort_order ?? 999999) || a.displayName.localeCompare(b.displayName, 'pt-BR'));
                setProducts(merged);
                setCategories((cats || []).sort(compareCategory));
                document.title = cfg.seo.title || cfg.siteName;
                const desc = document.querySelector('meta[name="description"]');
                if (desc)
                    desc.setAttribute('content', cfg.seo.description || '');
            }
            catch (e) {
                console.error('Site load error', e);
            }
            setLoading(false);
        })();
    }, []);
    (0, react_1.useEffect)(() => {
        if (!config)
            return;
        const enabled = config.heroSlides.filter(h => h.enabled);
        if (enabled.length < 2)
            return;
        const timer = window.setInterval(() => setHeroIndex(i => (i + 1) % enabled.length), 6500);
        return () => window.clearInterval(timer);
    }, [config]);
    const pixPercent = Number(config?.pixDiscountPercent ?? 5);
    const basePrice = (p) => Number(p.displayDiscountPrice != null && p.displayDiscountPrice > 0 ? p.displayDiscountPrice : p.displayPrice || 0);
    const pixPrice = (p) => round(basePrice(p) * (1 - pixPercent / 100));
    const categoryMap = (0, react_1.useMemo)(() => new Map(categories.map(c => [c.id, c.name])), [categories]);
    const filtered = (0, react_1.useMemo)(() => {
        const q = search.trim().toLowerCase();
        return products.filter(p => (activeCategory === 'all' || p.category_id === activeCategory) && (!q || [p.displayName, p.brand, p.flavor, p.weight, p.displayDescription, categoryMap.get(p.category_id || '')].filter(Boolean).join(' ').toLowerCase().includes(q)));
    }, [products, activeCategory, search, categoryMap]);
    const add = (p) => { setCart(lines => { const found = lines.find(x => x.id === p.id); return found ? lines.map(x => x.id === p.id ? { ...x, quantity: x.quantity + 1 } : x) : [...lines, { ...p, quantity: 1 }]; }); setCartOpen(true); };
    const qty = (id, diff) => setCart(lines => lines.map(x => x.id === id ? { ...x, quantity: x.quantity + diff } : x).filter(x => x.quantity > 0));
    const cartCount = cart.reduce((s, x) => s + x.quantity, 0);
    const subtotal = round(cart.reduce((s, x) => s + basePrice(x) * x.quantity, 0));
    const couponRaw = coupon ? coupon.discount_type === 'percent' ? subtotal * Number(coupon.discount_value) / 100 : Number(coupon.discount_value) : 0;
    const couponDiscount = round(Math.min(Math.max(couponRaw, 0), subtotal));
    const afterCoupon = round(Math.max(0, subtotal - couponDiscount));
    const pixDiscount = form.payment === 'pix' ? round(afterCoupon * pixPercent / 100) : 0;
    const shipping = afterCoupon >= Number(config?.freeShippingThreshold || 0) && Number(config?.freeShippingThreshold || 0) > 0 ? 0 : Number(config?.shippingFlatFee || 0);
    const total = round(Math.max(0, afterCoupon - pixDiscount + shipping));
    (0, react_1.useEffect)(() => { if (coupon && Number(coupon.min_purchase || 0) > subtotal) {
        setCoupon(null);
        setCouponMessage('Cupom removido: o carrinho ficou abaixo do valor mínimo.');
    } }, [subtotal, coupon]);
    const applyCoupon = async () => {
        setCouponMessage('');
        if (!couponCode.trim())
            return;
        const { data, error } = await supabase_1.supabase.from('coupons').select('*').eq('code', couponCode.toUpperCase().trim()).eq('active', true).is('franchise_id', null).maybeSingle();
        if (error || !data) {
            setCoupon(null);
            setCouponMessage('Cupom inválido ou indisponível.');
            return;
        }
        const c = data;
        if (c.expires_at && new Date(c.expires_at).getTime() < Date.now()) {
            setCoupon(null);
            setCouponMessage('Cupom expirado.');
            return;
        }
        if (Number(c.min_purchase || 0) > subtotal) {
            setCoupon(null);
            setCouponMessage(`Compra mínima de ${money(Number(c.min_purchase))}.`);
            return;
        }
        setCoupon(c);
        setCouponMessage('Cupom aplicado com sucesso.');
    };
    const submitOrder = async (e) => {
        e.preventDefault();
        if (!config?.fulfillmentFranchiseId || !cart.length)
            return;
        setSubmitting(true);
        setOrderMessage('');
        const orderNumber = `SITE-${Date.now().toString().slice(-8)}`;
        const addressFull = `CEP ${form.zip.trim()} • ${form.address.trim()} • ${form.city.trim()}/${form.state.trim().toUpperCase()}`;
        const notes = [`PEDIDO SITE: ${orderNumber}`, form.reference.trim() ? `Referência: ${form.reference.trim()}` : '', form.notes.trim() ? `Observações: ${form.notes.trim()}` : ''].filter(Boolean).join('\n');
        const payload = {
            franchise_id: config.fulfillmentFranchiseId,
            customer_name: form.name.trim(), customer_phone: form.phone.trim() || null,
            payer_email: form.email.trim() || null, payer_cpf: form.cpf.trim() || null,
            items: cart.map(x => ({ product_id: x.id, source_product_id: x.source_product_id, name: x.displayName, price: basePrice(x), quantity: x.quantity, image_url: x.displayImage })),
            subtotal, coupon_code: coupon?.code || null, coupon_discount: couponDiscount, discount_amount: pixDiscount, delivery_fee: shipping, total,
            status: 'pending', delivery: true, address: addressFull, customer_reference: form.reference.trim() || null, notes,
            order_type: 'public', campaign_name: siteCompat_1.SITE_ORDER_CAMPAIGN, order_mode: 'delivery', payment_method: form.payment,
            pix_discount_percent: form.payment === 'pix' ? pixPercent : 0, delivery_payment_method: 'online', delivery_fee_payer: 'customer',
            delivery_source: 'other', delivery_source_detail: 'Site suplementaai.com.br',
        };
        const { data: inserted, error } = await supabase_1.supabase.from('customer_orders').insert(payload).select().single();
        if (error || !inserted) {
            setOrderMessage(error?.message || 'Não foi possível criar o pedido.');
            setSubmitting(false);
            return;
        }
        if (total <= 0) {
            await supabase_1.supabase.from('customer_orders').update({ mp_payment_status: 'approved' }).eq('id', inserted.id);
            setOrderMessage(`Pedido ${orderNumber} criado com sucesso.`);
            setCart([]);
            setSubmitting(false);
            return;
        }
        try {
            const apiUrl = `${"https://sgvojdgbjvynnoherpqj.supabase.co"}/functions/v1/mercadopago`;
            const mpResp = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNndm9qZGdianZ5bm5vaGVycHFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3NDE4ODIsImV4cCI6MjEwMTMxNzg4Mn0.RuAHGD0VCcDxIL4jfSFXjyiC4ZzVgRAZna3j80ovIf4" }, body: JSON.stringify({ action: 'create_preference', items: [{ id: inserted.id, title: `Pedido ${orderNumber} - Suplementaai`, description: cart.map(x => `${x.quantity}x ${x.displayName}`).join(', ').slice(0, 250), quantity: 1, unit_price: total }], payer: { email: form.email.trim(), cpf: form.cpf.trim() }, external_reference: inserted.id, payment_method: form.payment === 'pix' ? 'pix' : undefined, notification_url: `${"https://sgvojdgbjvynnoherpqj.supabase.co"}/functions/v1/mercadopago-webhook` }) });
            if (!mpResp.ok)
                throw new Error((await mpResp.json().catch(() => ({}))).error || 'Falha ao iniciar Mercado Pago.');
            const mp = await mpResp.json();
            await supabase_1.supabase.from('customer_orders').update({ mp_preference_id: mp.preference_id }).eq('id', inserted.id);
            const url = mp.init_point || mp.sandbox_init_point;
            if (!url)
                throw new Error('Mercado Pago não retornou o checkout.');
            window.location.href = url;
        }
        catch (err) {
            setOrderMessage(`${err.message || 'Erro no pagamento.'} O pedido ${orderNumber} foi salvo.`);
            setSubmitting(false);
        }
    };
    if (loading)
        return (0, jsx_runtime_1.jsx)("div", { className: "min-h-screen bg-neutral-950 flex items-center justify-center", children: (0, jsx_runtime_1.jsx)("div", { className: "w-10 h-10 border-2 border-white/20 border-t-[#FFE500] rounded-full animate-spin" }) });
    if (!config?.fulfillmentFranchiseId)
        return (0, jsx_runtime_1.jsx)("div", { className: "min-h-screen bg-neutral-950 text-white flex items-center justify-center p-6", children: (0, jsx_runtime_1.jsxs)("div", { className: "max-w-md text-center", children: [(0, jsx_runtime_1.jsx)("img", { src: "/assets/logo.png", className: "w-36 mx-auto mb-6" }), (0, jsx_runtime_1.jsx)("h1", { className: "font-black text-2xl", children: "LOJA EM CONFIGURA\u00C7\u00C3O" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 mt-3", children: "O e-commerce ser\u00E1 liberado assim que a central respons\u00E1vel for escolhida no Painel Master." })] }) });
    if (!config.active)
        return (0, jsx_runtime_1.jsx)("div", { className: "min-h-screen bg-neutral-950 text-white flex items-center justify-center text-center p-6", children: "A loja est\u00E1 temporariamente indispon\u00EDvel." });
    const heroes = config.heroSlides.filter(h => h.enabled);
    const hero = heroes[heroIndex % Math.max(heroes.length, 1)];
    const sections = [...config.homeSections].filter(s => s.enabled).sort((a, b) => a.sortOrder - b.sortOrder);
    const sourceProducts = (source) => {
        let list = products;
        if (source === 'offers')
            list = products.filter(p => p.displayDiscountPrice != null && p.displayDiscountPrice > 0 && p.displayDiscountPrice < p.displayPrice);
        if (source === 'bestseller')
            list = products.filter(p => p.site.bestseller);
        if (source === 'featured')
            list = products.filter(p => p.site.featured);
        if (source === 'new')
            list = products.filter(p => p.site.newArrival);
        return (list.length ? list : products).slice(0, 12);
    };
    const radius = `${config.radius}px`;
    return (0, jsx_runtime_1.jsxs)("div", { className: "min-h-screen", style: { backgroundColor: config.backgroundColor, color: config.textColor, fontFamily: config.fontFamily, ['--site-primary']: config.primaryColor, ['--site-dark']: config.secondaryColor, ['--site-accent']: config.accentColor, ['--site-radius']: radius }, children: [config.announcementEnabled && (0, jsx_runtime_1.jsx)("div", { className: "py-2 px-4 text-center text-[11px] sm:text-xs font-black tracking-[.08em] text-white", style: { backgroundColor: config.secondaryColor }, children: config.announcementText }), (0, jsx_runtime_1.jsxs)("header", { className: "bg-white sticky top-0 z-40 shadow-sm border-b border-black/10", children: [(0, jsx_runtime_1.jsxs)("div", { className: "max-w-[1500px] mx-auto px-3 sm:px-5 lg:px-8 py-3 lg:py-4 flex items-center gap-3 lg:gap-6", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => setMobileMenu(true), className: "lg:hidden p-2", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Menu, {}) }), (0, jsx_runtime_1.jsx)("a", { href: "#top", className: "w-28 sm:w-36 lg:w-44 flex-shrink-0", children: (0, jsx_runtime_1.jsx)("img", { src: config.logoUrl || '/assets/logo.png', alt: config.siteName, className: "w-full h-12 lg:h-14 object-contain" }) }), (0, jsx_runtime_1.jsxs)("div", { className: "hidden sm:flex flex-1 relative", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Search, { size: 20, className: "absolute left-4 top-1/2 -translate-y-1/2 opacity-40" }), (0, jsx_runtime_1.jsx)("input", { value: search, onChange: e => { setSearch(e.target.value); setActiveCategory('all'); }, placeholder: config.searchPlaceholder, className: "w-full bg-neutral-100 border border-neutral-200 rounded-full pl-12 pr-5 py-3.5 text-sm outline-none focus:border-black/30" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "ml-auto flex items-center gap-1 sm:gap-3", children: [(0, jsx_runtime_1.jsxs)("a", { href: config.whatsapp ? `https://wa.me/${config.whatsapp.replace(/\D/g, '')}` : '#', target: config.whatsapp ? '_blank' : undefined, className: "hidden lg:flex items-center gap-2 text-xs font-bold px-3 py-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Headphones, { size: 21 }), (0, jsx_runtime_1.jsxs)("span", { children: ["Atendimento", (0, jsx_runtime_1.jsx)("br", {}), (0, jsx_runtime_1.jsx)("b", { children: "Fale conosco" })] })] }), (0, jsx_runtime_1.jsxs)("button", { onClick: () => setCartOpen(true), className: "relative p-3 rounded-full", style: { backgroundColor: config.primaryColor }, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ShoppingCart, { size: 21 }), (0, jsx_runtime_1.jsx)("span", { className: "absolute -right-1 -top-1 bg-black text-white min-w-5 h-5 px-1 rounded-full text-[10px] flex items-center justify-center font-black", children: cartCount })] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "sm:hidden px-3 pb-3 relative", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Search, { size: 18, className: "absolute left-7 top-1/2 -translate-y-[calc(50%+6px)] opacity-40" }), (0, jsx_runtime_1.jsx)("input", { value: search, onChange: e => { setSearch(e.target.value); setActiveCategory('all'); }, placeholder: config.searchPlaceholder, className: "w-full bg-neutral-100 rounded-full pl-11 pr-4 py-3 text-sm" })] }), (0, jsx_runtime_1.jsx)("nav", { className: "hidden lg:block border-t border-black/5", children: (0, jsx_runtime_1.jsxs)("div", { className: "max-w-[1500px] mx-auto px-8 flex items-center", children: [(0, jsx_runtime_1.jsx)("a", { href: "#ofertas", className: "py-3 px-4 text-xs font-black uppercase", style: { backgroundColor: config.primaryColor }, children: "OFERTAS" }), (0, jsx_runtime_1.jsxs)("button", { onClick: () => { setActiveCategory('all'); document.getElementById('produtos')?.scrollIntoView({ behavior: 'smooth' }); }, className: "py-3 px-4 text-xs font-black uppercase flex gap-1 items-center", children: ["TODOS OS PRODUTOS ", (0, jsx_runtime_1.jsx)(lucide_react_1.ChevronDown, { size: 13 })] }), categories.slice(0, 8).map(c => (0, jsx_runtime_1.jsx)("button", { onClick: () => { setActiveCategory(c.id); document.getElementById('produtos')?.scrollIntoView({ behavior: 'smooth' }); }, className: "py-3 px-4 text-xs font-black uppercase hover:bg-neutral-100", children: c.name }, c.id))] }) })] }), (0, jsx_runtime_1.jsx)("main", { id: "top", children: search.trim() || activeCategory !== 'all' ? (0, jsx_runtime_1.jsx)(SearchResults, { products: filtered, title: search.trim() ? `Resultados para “${search}”` : categoryMap.get(activeCategory) || 'Produtos', config: config, basePrice: basePrice, pixPrice: pixPrice, onDetail: setDetail, onAdd: add, onClear: () => { setSearch(''); setActiveCategory('all'); } }) : (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [hero && (0, jsx_runtime_1.jsxs)("section", { className: "relative min-h-[420px] sm:min-h-[520px] lg:min-h-[580px] overflow-hidden bg-neutral-950 text-white flex items-center", children: [(0, jsx_runtime_1.jsxs)("div", { className: "absolute inset-0", children: [hero.imageUrl ? (0, jsx_runtime_1.jsx)("img", { src: hero.imageUrl, className: "w-full h-full object-cover" }) : (0, jsx_runtime_1.jsx)("div", { className: "w-full h-full bg-[radial-gradient(circle_at_78%_45%,#3d3d3d_0%,#111_38%,#050505_80%)]" }), (0, jsx_runtime_1.jsx)("div", { className: "absolute inset-0 bg-gradient-to-r from-black via-black/75 to-black/15" })] }), (0, jsx_runtime_1.jsx)("div", { className: "relative max-w-[1500px] mx-auto w-full px-5 sm:px-8 lg:px-12 py-16", children: (0, jsx_runtime_1.jsxs)("div", { className: "max-w-2xl", children: [(0, jsx_runtime_1.jsx)("p", { className: "font-black tracking-[.25em] text-xs sm:text-sm", style: { color: config.primaryColor }, children: hero.eyebrow }), (0, jsx_runtime_1.jsx)("h1", { className: "text-4xl sm:text-6xl lg:text-7xl font-black leading-[.95] mt-4 uppercase", children: hero.title }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm sm:text-lg text-white/70 max-w-xl mt-5 leading-relaxed", children: hero.subtitle }), (0, jsx_runtime_1.jsx)("a", { href: hero.buttonLink || '#produtos', className: "inline-flex mt-7 px-7 py-4 text-black text-xs sm:text-sm font-black uppercase", style: { backgroundColor: config.primaryColor, borderRadius: radius }, children: hero.buttonText })] }) }), heroes.length > 1 && (0, jsx_runtime_1.jsx)("div", { className: "absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2", children: heroes.map((h, i) => (0, jsx_runtime_1.jsx)("button", { onClick: () => setHeroIndex(i), className: `h-2 rounded-full transition-all ${i === heroIndex ? 'w-8' : 'w-2 bg-white/50'}`, style: i === heroIndex ? { backgroundColor: config.primaryColor } : undefined }, h.id)) })] }), sections.map(section => (0, jsx_runtime_1.jsx)(SectionRenderer, { section: section, config: config, products: products, categories: categories, sourceProducts: sourceProducts, basePrice: basePrice, pixPrice: pixPrice, onDetail: setDetail, onAdd: add, onCategory: id => { setActiveCategory(id); document.getElementById('produtos')?.scrollIntoView({ behavior: 'smooth' }); }, onObjective: q => { setSearch(q.split(' ')[0]); setActiveCategory('all'); window.scrollTo({ top: 0, behavior: 'smooth' }); } }, section.id)), (0, jsx_runtime_1.jsxs)("section", { id: "produtos", className: "max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-14", children: [(0, jsx_runtime_1.jsx)(SectionTitle, { eyebrow: "CAT\u00C1LOGO COMPLETO", children: "TODOS OS PRODUTOS" }), (0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5 mt-7", children: products.slice(0, 30).map(p => (0, jsx_runtime_1.jsx)(ProductCard, { product: p, config: config, basePrice: basePrice, pixPrice: pixPrice, onDetail: setDetail, onAdd: add }, p.id)) })] }), (0, jsx_runtime_1.jsx)("section", { className: "bg-neutral-950 text-white", children: (0, jsx_runtime_1.jsxs)("div", { className: "max-w-[1500px] mx-auto px-5 lg:px-8 py-16 grid lg:grid-cols-2 gap-10 items-center", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-xs font-black tracking-[.2em]", style: { color: config.primaryColor }, children: "SUPLEMENTAAI" }), (0, jsx_runtime_1.jsx)("h2", { className: "text-3xl sm:text-5xl font-black mt-3 uppercase", children: "SUPLEMENTA\u00C7\u00C3O PARA QUEM LEVA O RESULTADO A S\u00C9RIO." }), (0, jsx_runtime_1.jsx)("p", { className: "text-white/60 mt-5 leading-relaxed max-w-2xl", children: config.footer.about })] }), (0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-2 gap-3", children: ['Produtos selecionados', 'Compra online segura', 'Desconto real no PIX', 'Atendimento Suplementaai'].map((x, i) => (0, jsx_runtime_1.jsxs)("div", { className: "border border-white/10 p-5", style: { borderRadius: radius }, children: [(0, jsx_runtime_1.jsxs)("p", { className: "text-3xl font-black", style: { color: config.primaryColor }, children: ["0", i + 1] }), (0, jsx_runtime_1.jsx)("p", { className: "font-black mt-3 text-sm uppercase", children: x })] }, x)) })] }) })] }) }), (0, jsx_runtime_1.jsxs)("footer", { className: "bg-black text-white", children: [(0, jsx_runtime_1.jsxs)("div", { className: "max-w-[1500px] mx-auto px-5 lg:px-8 py-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-8", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("img", { src: config.logoUrl || '/assets/logo.png', className: "w-36 h-20 object-contain bg-[var(--site-primary)] p-2", style: { borderRadius: radius } }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-white/55 leading-relaxed mt-4", children: config.footer.about })] }), (0, jsx_runtime_1.jsx)(FooterCol, { title: "INSTITUCIONAL", items: ['Quem somos', 'Política de privacidade', 'Trocas e devoluções', 'Termos de uso'] }), (0, jsx_runtime_1.jsx)(FooterCol, { title: "ATENDIMENTO", items: [config.footer.phone || config.whatsapp || 'Fale conosco', config.supportEmail || 'Suporte online', config.footer.address || 'Brasil'] }), (0, jsx_runtime_1.jsx)(FooterCol, { title: "COMPRE COM SEGURAN\u00C7A", items: ['Mercado Pago', 'PIX com desconto', 'Cartão de crédito', 'Pedido acompanhado'] })] }), (0, jsx_runtime_1.jsx)("div", { className: "border-t border-white/10 py-5 text-center text-xs text-white/40", children: config.footer.copyright })] }), mobileMenu && (0, jsx_runtime_1.jsx)(MobileMenu, { config: config, categories: categories, onClose: () => setMobileMenu(false), onCategory: id => { setActiveCategory(id); setMobileMenu(false); setTimeout(() => document.getElementById('produtos')?.scrollIntoView({ behavior: 'smooth' }), 50); } }), cartOpen && (0, jsx_runtime_1.jsx)(CartDrawer, { config: config, cart: cart, subtotal: subtotal, qty: qty, basePrice: basePrice, pixPrice: pixPrice, onClose: () => setCartOpen(false), onCheckout: () => { setCartOpen(false); setCheckoutOpen(true); } }), detail && (0, jsx_runtime_1.jsx)(ProductDetail, { product: detail, config: config, basePrice: basePrice, pixPrice: pixPrice, onClose: () => setDetail(null), onAdd: () => { add(detail); setDetail(null); } }), checkoutOpen && (0, jsx_runtime_1.jsx)(Checkout, { config: config, cart: cart, subtotal: subtotal, couponCode: couponCode, setCouponCode: setCouponCode, coupon: coupon, couponMessage: couponMessage, applyCoupon: applyCoupon, couponDiscount: couponDiscount, pixDiscount: pixDiscount, shipping: shipping, total: total, form: form, setForm: setForm, submitting: submitting, orderMessage: orderMessage, submitOrder: submitOrder, onClose: () => setCheckoutOpen(false) })] });
}
function SectionRenderer({ section, config, products, categories, sourceProducts, basePrice, pixPrice, onDetail, onAdd, onCategory, onObjective }) {
    if (section.type === 'benefits')
        return (0, jsx_runtime_1.jsx)(Benefits, { config: config });
    if (section.type === 'products')
        return (0, jsx_runtime_1.jsx)(ProductRail, { id: section.source === 'offers' ? 'ofertas' : undefined, title: section.title, products: sourceProducts(section.source), config: config, basePrice: basePrice, pixPrice: pixPrice, onDetail: onDetail, onAdd: onAdd });
    if (section.type === 'categories')
        return (0, jsx_runtime_1.jsx)(CategorySection, { title: section.title, categories: categories, products: products, config: config, onCategory: onCategory });
    if (section.type === 'objectives')
        return (0, jsx_runtime_1.jsx)(Objectives, { title: section.title, config: config, onObjective: onObjective });
    if (section.type === 'banners')
        return (0, jsx_runtime_1.jsx)(PromoBanners, { config: config });
    if (section.type === 'content')
        return (0, jsx_runtime_1.jsxs)("section", { className: "max-w-[1500px] mx-auto px-5 lg:px-8 py-12", children: [(0, jsx_runtime_1.jsx)(SectionTitle, { eyebrow: "SUPLEMENTAAI", children: section.title }), (0, jsx_runtime_1.jsx)("p", { className: "max-w-4xl mt-5 opacity-65 whitespace-pre-line leading-relaxed", children: section.body })] });
    return null;
}
function Benefits({ config }) { const icon = { truck: (0, jsx_runtime_1.jsx)(lucide_react_1.Truck, {}), pix: (0, jsx_runtime_1.jsx)(lucide_react_1.Zap, {}), shield: (0, jsx_runtime_1.jsx)(lucide_react_1.ShieldCheck, {}), support: (0, jsx_runtime_1.jsx)(lucide_react_1.Headphones, {}) }; return (0, jsx_runtime_1.jsx)("section", { className: "bg-white border-y border-black/5", children: (0, jsx_runtime_1.jsx)("div", { className: "max-w-[1500px] mx-auto grid grid-cols-2 lg:grid-cols-4", children: config.benefits.map(b => (0, jsx_runtime_1.jsxs)("div", { className: "p-4 sm:p-6 flex items-center gap-3 border-r border-b lg:border-b-0 border-black/5", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-11 h-11 flex-shrink-0 rounded-full flex items-center justify-center", style: { backgroundColor: config.primaryColor }, children: icon[b.icon] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "font-black text-[11px] sm:text-sm", children: b.title }), (0, jsx_runtime_1.jsx)("p", { className: "text-[10px] sm:text-xs opacity-50 mt-1", children: b.text })] })] }, b.id)) }) }); }
function SectionTitle({ eyebrow, children }) { return (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-[10px] sm:text-xs font-black tracking-[.2em] opacity-40", children: eyebrow }), (0, jsx_runtime_1.jsx)("h2", { className: "text-2xl sm:text-3xl lg:text-4xl font-black uppercase mt-1", children: children })] }); }
function ProductRail({ id, title, products, config, basePrice, pixPrice, onDetail, onAdd }) { return (0, jsx_runtime_1.jsxs)("section", { id: id, className: "max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-12", children: [(0, jsx_runtime_1.jsx)(SectionTitle, { eyebrow: "SUPLEMENTAAI", children: title }), (0, jsx_runtime_1.jsx)("div", { className: "flex gap-3 sm:gap-5 overflow-x-auto pb-4 mt-7 snap-x", children: products.map((p) => (0, jsx_runtime_1.jsx)("div", { className: "min-w-[190px] sm:min-w-[245px] lg:min-w-[270px] snap-start", children: (0, jsx_runtime_1.jsx)(ProductCard, { product: p, config: config, basePrice: basePrice, pixPrice: pixPrice, onDetail: onDetail, onAdd: onAdd }) }, p.id)) })] }); }
function ProductCard({ product, config, basePrice, pixPrice, onDetail, onAdd }) { return (0, jsx_runtime_1.jsxs)("article", { className: "bg-white border border-black/[.08] h-full flex flex-col group hover:shadow-xl transition", style: { borderRadius: config.radius }, children: [(0, jsx_runtime_1.jsxs)("button", { onClick: () => onDetail(product), className: "relative aspect-square p-3 overflow-hidden", children: [(0, jsx_runtime_1.jsxs)("div", { className: "absolute z-10 top-3 left-3 flex flex-col items-start gap-1", children: [product.site.badgeText && (0, jsx_runtime_1.jsx)("span", { className: "px-2 py-1 text-[9px] font-black text-black", style: { backgroundColor: config.primaryColor, borderRadius: Math.max(3, config.radius / 2) }, children: product.site.badgeText }), product.site.bestseller && (0, jsx_runtime_1.jsx)("span", { className: "px-2 py-1 text-[9px] font-black bg-black text-white", children: "MAIS VENDIDO" })] }), product.displayImage ? (0, jsx_runtime_1.jsx)("img", { src: product.displayImage, alt: product.displayName, className: "w-full h-full object-contain group-hover:scale-105 transition duration-300" }) : (0, jsx_runtime_1.jsx)("div", { className: "h-full bg-neutral-100 flex items-center justify-center opacity-20", children: (0, jsx_runtime_1.jsx)(lucide_react_1.ShoppingBag, { size: 50 }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "p-3 sm:p-4 flex-1 flex flex-col", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-[9px] sm:text-[10px] font-black uppercase tracking-wider opacity-40", children: product.brand || 'SUPLEMENTAAI' }), (0, jsx_runtime_1.jsx)("button", { onClick: () => onDetail(product), className: "text-left font-bold text-xs sm:text-sm mt-1 leading-snug line-clamp-2 min-h-9", children: product.displayName }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-auto pt-4", children: [product.displayDiscountPrice != null && product.displayDiscountPrice > 0 && product.displayDiscountPrice < product.displayPrice && (0, jsx_runtime_1.jsx)("p", { className: "text-[10px] sm:text-xs line-through opacity-35", children: money(product.displayPrice) }), (0, jsx_runtime_1.jsx)("p", { className: "font-black text-base sm:text-xl", children: money(basePrice(product)) }), (0, jsx_runtime_1.jsxs)("p", { className: "font-black text-xs sm:text-sm", style: { color: config.accentColor }, children: [money(pixPrice(product)), " no PIX"] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-[9px] sm:text-[10px] font-bold opacity-55", children: [config.pixDiscountPercent, "% de desconto \u00E0 vista"] }), product.stock <= 0 ? (0, jsx_runtime_1.jsx)("button", { disabled: true, className: "w-full mt-3 py-3 bg-neutral-200 text-neutral-500 text-[10px] font-black uppercase", style: { borderRadius: config.radius }, children: "Indispon\u00EDvel" }) : (0, jsx_runtime_1.jsx)("button", { onClick: () => onAdd(product), className: "w-full mt-3 py-3 text-black text-[10px] sm:text-xs font-black uppercase", style: { backgroundColor: config.primaryColor, borderRadius: config.radius }, children: "Adicionar ao carrinho" })] })] })] }); }
function CategorySection({ title, categories, products, config, onCategory }) { return (0, jsx_runtime_1.jsx)("section", { className: "bg-white py-14", children: (0, jsx_runtime_1.jsxs)("div", { className: "max-w-[1500px] mx-auto px-5 lg:px-8", children: [(0, jsx_runtime_1.jsx)(SectionTitle, { eyebrow: "ENCONTRE MAIS R\u00C1PIDO", children: title }), (0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mt-7", children: categories.slice(0, 12).map((c) => { const pic = products.find((p) => p.category_id === c.id)?.displayImage; return (0, jsx_runtime_1.jsxs)("button", { onClick: () => onCategory(c.id), className: "group border border-black/10 p-4 text-center bg-white hover:-translate-y-1 transition", style: { borderRadius: config.radius }, children: [(0, jsx_runtime_1.jsx)("div", { className: "aspect-square bg-neutral-50 p-3", style: { borderRadius: config.radius }, children: pic ? (0, jsx_runtime_1.jsx)("img", { src: pic, className: "w-full h-full object-contain group-hover:scale-105 transition" }) : (0, jsx_runtime_1.jsx)("div", { className: "h-full flex items-center justify-center opacity-20", children: (0, jsx_runtime_1.jsx)(lucide_react_1.PackageCheck, { size: 42 }) }) }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs font-black uppercase mt-3", children: c.name })] }, c.id); }) })] }) }); }
function PromoBanners({ config }) { return (0, jsx_runtime_1.jsx)("section", { className: "max-w-[1500px] mx-auto px-5 lg:px-8 py-8 grid md:grid-cols-2 gap-4", children: config.promoBanners.filter(b => b.enabled).map((b, i) => (0, jsx_runtime_1.jsxs)("a", { href: b.link || '#produtos', className: "relative min-h-[260px] sm:min-h-[330px] overflow-hidden bg-neutral-900 text-white flex items-end", style: { borderRadius: config.radius }, children: [b.imageUrl ? (0, jsx_runtime_1.jsx)("img", { src: b.imageUrl, className: "absolute inset-0 w-full h-full object-cover" }) : (0, jsx_runtime_1.jsx)("div", { className: `absolute inset-0 ${i % 2 ? 'bg-gradient-to-br from-neutral-800 to-black' : 'bg-gradient-to-br from-yellow-300 to-yellow-600'}` }), (0, jsx_runtime_1.jsx)("div", { className: "absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" }), (0, jsx_runtime_1.jsxs)("div", { className: "relative p-6 sm:p-8", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-2xl sm:text-4xl font-black uppercase", children: b.title }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-white/70 mt-2", children: b.subtitle }), (0, jsx_runtime_1.jsx)("span", { className: "inline-block mt-4 border-b-2 text-xs font-black uppercase", style: { borderColor: config.primaryColor }, children: "Ver produtos" })] })] }, b.id)) }); }
function Objectives({ title, config, onObjective }) { return (0, jsx_runtime_1.jsx)("section", { className: "bg-neutral-950 text-white py-14", children: (0, jsx_runtime_1.jsxs)("div", { className: "max-w-[1500px] mx-auto px-5 lg:px-8", children: [(0, jsx_runtime_1.jsx)(SectionTitle, { eyebrow: "QUAL \u00C9 O SEU FOCO?", children: title }), (0, jsx_runtime_1.jsx)("div", { className: "grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-7", children: config.objectives.filter((o) => o.enabled).map((o) => (0, jsx_runtime_1.jsxs)("button", { onClick: () => onObjective(o.query), className: "text-left border border-white/10 p-5 hover:border-white/25 transition", style: { borderRadius: config.radius }, children: [(0, jsx_runtime_1.jsx)("span", { className: "text-4xl", children: o.icon }), (0, jsx_runtime_1.jsx)("p", { className: "font-black text-lg uppercase mt-4", children: o.title }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-white/50 mt-1", children: o.subtitle }), (0, jsx_runtime_1.jsx)("p", { className: "mt-4 text-xs font-black", style: { color: config.primaryColor }, children: "ENCONTRAR PRODUTOS \u2192" })] }, o.id)) })] }) }); }
function SearchResults({ products, title, config, basePrice, pixPrice, onDetail, onAdd, onClear }) { return (0, jsx_runtime_1.jsxs)("section", { className: "max-w-[1500px] mx-auto px-5 lg:px-8 py-12 min-h-[65vh]", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between gap-4", children: [(0, jsx_runtime_1.jsx)(SectionTitle, { eyebrow: `${products.length} PRODUTOS`, children: title }), (0, jsx_runtime_1.jsx)("button", { onClick: onClear, className: "text-xs font-black underline", children: "LIMPAR BUSCA" })] }), (0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5 mt-7", children: products.map((p) => (0, jsx_runtime_1.jsx)(ProductCard, { product: p, config: config, basePrice: basePrice, pixPrice: pixPrice, onDetail: onDetail, onAdd: onAdd }, p.id)) }), products.length === 0 && (0, jsx_runtime_1.jsx)("div", { className: "py-24 text-center opacity-50", children: "Nenhum produto encontrado." })] }); }
function FooterCol({ title, items }) { return (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h4", { className: "font-black text-sm", children: title }), (0, jsx_runtime_1.jsx)("div", { className: "mt-4 space-y-2 text-sm text-white/50", children: items.filter(Boolean).map(i => (0, jsx_runtime_1.jsx)("p", { children: i }, i)) })] }); }
function MobileMenu({ config, categories, onClose, onCategory }) { return (0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 z-[70] bg-black/60", onClick: onClose, children: (0, jsx_runtime_1.jsxs)("div", { className: "w-[88%] max-w-sm h-full bg-white p-5 overflow-y-auto", onClick: e => e.stopPropagation(), children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)("img", { src: config.logoUrl || '/assets/logo.png', className: "w-32 h-14 object-contain" }), (0, jsx_runtime_1.jsx)("button", { onClick: onClose, children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, {}) })] }), (0, jsx_runtime_1.jsx)("button", { onClick: () => onCategory('all'), className: "w-full text-left py-4 border-b font-black uppercase", children: "Todos os produtos" }), categories.map((c) => (0, jsx_runtime_1.jsx)("button", { onClick: () => onCategory(c.id), className: "w-full text-left py-4 border-b text-sm font-bold uppercase", children: c.name }, c.id)), (0, jsx_runtime_1.jsx)("div", { className: "mt-6 p-4 text-xs font-bold", style: { backgroundColor: config.primaryColor, borderRadius: config.radius }, children: config.announcementText })] }) }); }
function CartDrawer({ config, cart, subtotal, qty, basePrice, pixPrice, onClose, onCheckout }) { return (0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 z-[70] bg-black/60", onClick: onClose, children: (0, jsx_runtime_1.jsxs)("aside", { className: "ml-auto w-full max-w-md h-full bg-white flex flex-col", onClick: e => e.stopPropagation(), children: [(0, jsx_runtime_1.jsxs)("div", { className: "p-5 border-b flex justify-between items-center", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-xl font-black uppercase", children: "Seu carrinho" }), (0, jsx_runtime_1.jsxs)("p", { className: "text-xs opacity-50", children: [cart.reduce((s, x) => s + x.quantity, 0), " itens"] })] }), (0, jsx_runtime_1.jsx)("button", { onClick: onClose, children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, {}) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1 overflow-y-auto p-4 space-y-3", children: [cart.map((x) => (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-3 border-b pb-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-20 h-20 bg-neutral-50", children: x.displayImage && (0, jsx_runtime_1.jsx)("img", { src: x.displayImage, className: "w-full h-full object-contain" }) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1", children: [(0, jsx_runtime_1.jsx)("p", { className: "font-bold text-sm line-clamp-2", children: x.displayName }), (0, jsx_runtime_1.jsx)("p", { className: "font-black mt-1", children: money(basePrice(x)) }), (0, jsx_runtime_1.jsxs)("p", { className: "text-xs font-black", style: { color: config.accentColor }, children: [money(pixPrice(x)), " no PIX"] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 mt-2", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => qty(x.id, -1), className: "p-1 border rounded", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Minus, { size: 14 }) }), (0, jsx_runtime_1.jsx)("span", { className: "text-sm font-black", children: x.quantity }), (0, jsx_runtime_1.jsx)("button", { onClick: () => qty(x.id, 1), className: "p-1 border rounded", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { size: 14 }) })] })] })] }, x.id)), !cart.length && (0, jsx_runtime_1.jsxs)("div", { className: "py-24 text-center opacity-45", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ShoppingCart, { size: 42, className: "mx-auto" }), (0, jsx_runtime_1.jsx)("p", { className: "mt-3 font-bold", children: "Seu carrinho est\u00E1 vazio." })] })] }), cart.length > 0 && (0, jsx_runtime_1.jsxs)("div", { className: "p-5 border-t", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between font-black text-xl", children: [(0, jsx_runtime_1.jsx)("span", { children: "Subtotal" }), (0, jsx_runtime_1.jsx)("span", { children: money(subtotal) })] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-xs mt-1", style: { color: config.accentColor }, children: ["No PIX voc\u00EA ainda recebe ", config.pixDiscountPercent, "% de desconto."] }), (0, jsx_runtime_1.jsx)("button", { onClick: onCheckout, className: "w-full py-4 mt-4 text-black font-black uppercase text-sm", style: { backgroundColor: config.primaryColor, borderRadius: config.radius }, children: "Finalizar compra" })] })] }) }); }
function ProductDetail({ product, config, basePrice, pixPrice, onClose, onAdd }) { const gallery = [product.displayImage, ...(product.gallery_urls || [])].filter(Boolean); const [idx, setIdx] = (0, react_1.useState)(0); return (0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 z-[80] bg-black/70 p-2 sm:p-5 overflow-y-auto", onClick: onClose, children: (0, jsx_runtime_1.jsxs)("div", { className: "max-w-6xl mx-auto bg-white my-3 overflow-hidden", style: { borderRadius: config.radius }, onClick: e => e.stopPropagation(), children: [(0, jsx_runtime_1.jsxs)("div", { className: "p-4 flex justify-between border-b", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-xs font-black uppercase opacity-45", children: "SUPLEMENTAAI \u2022 PRODUTO" }), (0, jsx_runtime_1.jsx)("button", { onClick: onClose, children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, {}) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid lg:grid-cols-[1.05fr_.95fr] gap-5 p-4 sm:p-7 lg:p-10", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "aspect-square bg-neutral-50 relative flex items-center justify-center overflow-hidden", style: { borderRadius: config.radius }, children: [gallery[idx] && (0, jsx_runtime_1.jsx)("img", { src: gallery[idx], className: "w-full h-full object-contain" }), gallery.length > 1 && (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => setIdx((idx - 1 + gallery.length) % gallery.length), className: "absolute left-3 p-2 bg-white shadow rounded-full", children: (0, jsx_runtime_1.jsx)(lucide_react_1.ChevronLeft, {}) }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setIdx((idx + 1) % gallery.length), className: "absolute right-3 p-2 bg-white shadow rounded-full", children: (0, jsx_runtime_1.jsx)(lucide_react_1.ChevronRight, {}) })] })] }), gallery.length > 1 && (0, jsx_runtime_1.jsx)("div", { className: "flex gap-2 overflow-x-auto mt-3", children: gallery.map((g, i) => (0, jsx_runtime_1.jsx)("button", { onClick: () => setIdx(i), className: `w-16 h-16 border-2 ${i === idx ? 'border-black' : 'border-transparent'}`, children: (0, jsx_runtime_1.jsx)("img", { src: g, className: "w-full h-full object-contain" }) }, g + i)) })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-xs font-black tracking-[.15em] opacity-40", children: product.brand || 'SUPLEMENTAAI' }), (0, jsx_runtime_1.jsx)("h1", { className: "text-3xl sm:text-4xl lg:text-5xl font-black leading-tight mt-2", children: product.displayName }), product.flavor && (0, jsx_runtime_1.jsxs)("p", { className: "text-sm opacity-60 mt-3", children: ["Sabor: ", (0, jsx_runtime_1.jsx)("b", { children: product.flavor })] }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm opacity-60 mt-4 leading-relaxed", children: product.displayDescription }), (0, jsx_runtime_1.jsxs)("div", { className: "border-y py-5 my-6", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm opacity-50", children: "Pre\u00E7o" }), product.displayDiscountPrice && product.displayDiscountPrice < product.displayPrice && (0, jsx_runtime_1.jsx)("p", { className: "line-through opacity-35", children: money(product.displayPrice) }), (0, jsx_runtime_1.jsx)("p", { className: "text-3xl font-black", children: money(basePrice(product)) }), (0, jsx_runtime_1.jsxs)("p", { className: "text-xl font-black mt-1", style: { color: config.accentColor }, children: [money(pixPrice(product)), " no PIX"] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-xs font-bold", style: { color: config.accentColor }, children: ["economize ", config.pixDiscountPercent, "% pagando \u00E0 vista"] }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs opacity-50 mt-2", children: config.installmentsText })] }), (0, jsx_runtime_1.jsx)("button", { onClick: onAdd, disabled: product.stock <= 0, className: "w-full py-4 text-black font-black uppercase text-sm disabled:bg-neutral-200 disabled:text-neutral-500", style: product.stock > 0 ? { backgroundColor: config.primaryColor, borderRadius: config.radius } : { borderRadius: config.radius }, children: product.stock > 0 ? 'Comprar agora' : 'Produto indisponível' }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-3 gap-2 mt-4 text-center text-[9px] font-bold", children: [(0, jsx_runtime_1.jsxs)("div", { className: "bg-neutral-50 p-3", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ShieldCheck, { className: "mx-auto mb-1", size: 18 }), "Compra segura"] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-neutral-50 p-3", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Truck, { className: "mx-auto mb-1", size: 18 }), "Envio acompanhado"] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-neutral-50 p-3", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Zap, { className: "mx-auto mb-1", size: 18 }), "PIX com desconto"] })] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "border-t p-5 sm:p-8 lg:p-10 grid lg:grid-cols-2 gap-8 text-sm", children: [product.long_description && (0, jsx_runtime_1.jsx)(Info, { title: "Descri\u00E7\u00E3o completa", text: product.long_description }), product.usage_instructions && (0, jsx_runtime_1.jsx)(Info, { title: "Como usar", text: product.usage_instructions }), product.ingredients && (0, jsx_runtime_1.jsx)(Info, { title: "Ingredientes", text: product.ingredients }), product.nutritional_info && (0, jsx_runtime_1.jsx)(Info, { title: "Informa\u00E7\u00E3o nutricional", text: product.nutritional_info })] })] }) }); }
function Info({ title, text }) { return (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h3", { className: "font-black uppercase", children: title }), (0, jsx_runtime_1.jsx)("p", { className: "opacity-60 whitespace-pre-line leading-relaxed mt-2", children: text })] }); }
function Checkout({ config, cart, subtotal, couponCode, setCouponCode, coupon, couponMessage, applyCoupon, couponDiscount, pixDiscount, shipping, total, form, setForm, submitting, orderMessage, submitOrder, onClose }) { return (0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 z-[90] bg-black/70 p-2 sm:p-5 overflow-y-auto", onClick: onClose, children: (0, jsx_runtime_1.jsxs)("div", { className: "max-w-5xl mx-auto bg-white my-3 overflow-hidden", style: { borderRadius: config.radius }, onClick: e => e.stopPropagation(), children: [(0, jsx_runtime_1.jsxs)("div", { className: "p-5 border-b flex justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-xs font-black tracking-[.15em] opacity-40", children: "CHECKOUT SEGURO" }), (0, jsx_runtime_1.jsx)("h2", { className: "text-2xl font-black uppercase", children: "Finalizar pedido" })] }), (0, jsx_runtime_1.jsx)("button", { onClick: onClose, children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, {}) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid lg:grid-cols-[1fr_390px]", children: [(0, jsx_runtime_1.jsxs)("form", { onSubmit: submitOrder, className: "p-5 sm:p-7 space-y-5", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h3", { className: "font-black uppercase mb-3", children: "1. Seus dados" }), (0, jsx_runtime_1.jsxs)("div", { className: "grid sm:grid-cols-2 gap-3", children: [(0, jsx_runtime_1.jsx)(Field, { label: "Nome completo", value: form.name, onChange: (v) => setForm({ ...form, name: v }), required: true }), (0, jsx_runtime_1.jsx)(Field, { label: "Telefone", value: form.phone, onChange: (v) => setForm({ ...form, phone: v }), required: true }), (0, jsx_runtime_1.jsx)(Field, { label: "E-mail", type: "email", value: form.email, onChange: (v) => setForm({ ...form, email: v }), required: true }), (0, jsx_runtime_1.jsx)(Field, { label: "CPF", value: form.cpf, onChange: (v) => setForm({ ...form, cpf: v }), required: true })] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h3", { className: "font-black uppercase mb-3", children: "2. Entrega" }), (0, jsx_runtime_1.jsxs)("div", { className: "grid sm:grid-cols-2 gap-3", children: [(0, jsx_runtime_1.jsx)(Field, { label: "CEP", value: form.zip, onChange: (v) => setForm({ ...form, zip: v }), required: true }), (0, jsx_runtime_1.jsx)(Field, { label: "Endere\u00E7o completo", value: form.address, onChange: (v) => setForm({ ...form, address: v }), required: true }), (0, jsx_runtime_1.jsx)(Field, { label: "Cidade", value: form.city, onChange: (v) => setForm({ ...form, city: v }), required: true }), (0, jsx_runtime_1.jsx)(Field, { label: "UF", value: form.state, onChange: (v) => setForm({ ...form, state: v }), required: true }), (0, jsx_runtime_1.jsx)(Field, { label: "Refer\u00EAncia", value: form.reference, onChange: (v) => setForm({ ...form, reference: v }) }), (0, jsx_runtime_1.jsx)(Field, { label: "Observa\u00E7\u00F5es", value: form.notes, onChange: (v) => setForm({ ...form, notes: v }) })] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h3", { className: "font-black uppercase mb-3", children: "3. Pagamento online" }), (0, jsx_runtime_1.jsxs)("div", { className: "grid sm:grid-cols-2 gap-3", children: [(0, jsx_runtime_1.jsxs)("button", { type: "button", onClick: () => setForm({ ...form, payment: 'pix' }), className: `p-4 border-2 text-left ${form.payment === 'pix' ? 'border-black' : 'border-neutral-200'}`, style: { borderRadius: config.radius }, children: [(0, jsx_runtime_1.jsx)("p", { className: "font-black", children: "PIX" }), (0, jsx_runtime_1.jsxs)("p", { className: "text-xs mt-1", style: { color: config.accentColor }, children: [config.pixDiscountPercent, "% de desconto no valor dos produtos"] })] }), (0, jsx_runtime_1.jsxs)("button", { type: "button", onClick: () => setForm({ ...form, payment: 'credit_card' }), className: `p-4 border-2 text-left ${form.payment === 'credit_card' ? 'border-black' : 'border-neutral-200'}`, style: { borderRadius: config.radius }, children: [(0, jsx_runtime_1.jsx)("p", { className: "font-black", children: "CART\u00C3O DE CR\u00C9DITO" }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs opacity-50 mt-1", children: "Pagamento processado pelo Mercado Pago" })] })] })] }), orderMessage && (0, jsx_runtime_1.jsx)("div", { className: "p-3 bg-amber-50 border border-amber-200 text-amber-800 text-sm", style: { borderRadius: config.radius }, children: orderMessage }), (0, jsx_runtime_1.jsx)("button", { disabled: submitting, className: "w-full py-4 text-black font-black uppercase disabled:opacity-50", style: { backgroundColor: config.primaryColor, borderRadius: config.radius }, children: submitting ? 'Processando...' : `Ir para pagamento • ${money(total)}` })] }), (0, jsx_runtime_1.jsxs)("aside", { className: "bg-neutral-50 p-5 sm:p-7 border-l", children: [(0, jsx_runtime_1.jsx)("h3", { className: "font-black uppercase", children: "Resumo" }), (0, jsx_runtime_1.jsx)("div", { className: "space-y-2 mt-4 max-h-48 overflow-y-auto", children: cart.map((x) => (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2 text-xs", children: [(0, jsx_runtime_1.jsxs)("span", { className: "font-bold", children: [x.quantity, "x"] }), (0, jsx_runtime_1.jsx)("span", { className: "flex-1 line-clamp-1", children: x.displayName })] }, x.id)) }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-5 flex gap-2", children: [(0, jsx_runtime_1.jsx)("input", { value: couponCode, onChange: e => setCouponCode(e.target.value.toUpperCase()), placeholder: "Cupom", className: "flex-1 border rounded-lg px-3 py-2 text-sm" }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: applyCoupon, className: "px-3 py-2 bg-black text-white text-xs font-black rounded-lg", children: "APLICAR" })] }), couponMessage && (0, jsx_runtime_1.jsx)("p", { className: `text-xs mt-2 ${coupon ? 'text-green-700' : 'text-red-600'}`, children: couponMessage }), (0, jsx_runtime_1.jsxs)("div", { className: "border-t mt-5 pt-4 space-y-2 text-sm", children: [(0, jsx_runtime_1.jsx)(Row, { label: "Subtotal", value: money(subtotal) }), couponDiscount > 0 && (0, jsx_runtime_1.jsx)(Row, { label: `Cupom ${coupon?.code || ''}`, value: `- ${money(couponDiscount)}`, green: true }), pixDiscount > 0 && (0, jsx_runtime_1.jsx)(Row, { label: `Desconto PIX (${config.pixDiscountPercent}%)`, value: `- ${money(pixDiscount)}`, green: true }), (0, jsx_runtime_1.jsx)(Row, { label: "Frete", value: shipping > 0 ? money(shipping) : 'GRÁTIS' }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between text-xl font-black pt-3 border-t", children: [(0, jsx_runtime_1.jsx)("span", { children: "Total" }), (0, jsx_runtime_1.jsx)("span", { children: money(total) })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-5 p-3 bg-white border text-xs opacity-60", style: { borderRadius: config.radius }, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ShieldCheck, { size: 18, className: "mb-2" }), "O pagamento \u00E9 iniciado pelo fluxo Mercado Pago j\u00E1 integrado ao sistema."] })] })] })] }) }); }
function Field({ label, value, onChange, required, type = 'text' }) { return (0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("span", { className: "block text-xs font-bold mb-1", children: label }), (0, jsx_runtime_1.jsx)("input", { required: required, type: type, value: value, onChange: e => onChange(e.target.value), className: "w-full border border-neutral-300 px-3 py-3 text-sm outline-none focus:border-black rounded-lg" })] }); }
function Row({ label, value, green }) { return (0, jsx_runtime_1.jsxs)("div", { className: `flex justify-between ${green ? 'text-green-700' : ''}`, children: [(0, jsx_runtime_1.jsx)("span", { children: label }), (0, jsx_runtime_1.jsx)("b", { children: value })] }); }

},
"/src/pages/FranchiseeDashboard.tsx": function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = FranchiseeDashboard;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const supabase_1 = require("@/lib/supabase");
const AuthContext_1 = require("@/contexts/AuthContext");
const lucide_react_1 = require("lucide-react");
const FranchiseeOrders_1 = __importDefault(require("@/components/franchisee/FranchiseeOrders"));
const FranchiseeManualOrder_1 = __importDefault(require("@/components/franchisee/FranchiseeManualOrder"));
const FranchiseeProducts_1 = __importDefault(require("@/components/franchisee/FranchiseeProducts"));
const FranchiseeCategories_1 = __importDefault(require("@/components/franchisee/FranchiseeCategories"));
const FranchiseeGroups_1 = __importDefault(require("@/components/franchisee/FranchiseeGroups"));
const FranchiseeCustomers_1 = __importDefault(require("@/components/franchisee/FranchiseeCustomers"));
const FranchiseeFinancial_1 = __importDefault(require("@/components/franchisee/FranchiseeFinancial"));
const FranchiseeDelivery_1 = __importDefault(require("@/components/franchisee/FranchiseeDelivery"));
const FranchiseeRanking_1 = __importDefault(require("@/components/franchisee/FranchiseeRanking"));
const FranchiseeCourses_1 = __importDefault(require("@/components/franchisee/FranchiseeCourses"));
const FranchiseeMarketing_1 = __importDefault(require("@/components/franchisee/FranchiseeMarketing"));
const FranchiseeFactoryOrder_1 = __importDefault(require("@/components/franchisee/FranchiseeFactoryOrder"));
const FranchiseeFees_1 = __importDefault(require("@/components/franchisee/FranchiseeFees"));
const FranchiseeCashRegister_1 = __importDefault(require("@/components/franchisee/FranchiseeCashRegister"));
const FranchiseeFiscal_1 = __importDefault(require("@/components/franchisee/FranchiseeFiscal"));
const FranchiseeIntegrations_1 = __importDefault(require("@/components/franchisee/FranchiseeIntegrations"));
const FranchiseePromotions_1 = __importDefault(require("@/components/franchisee/FranchiseePromotions"));
const FranchiseeCoupons_1 = __importDefault(require("@/components/franchisee/FranchiseeCoupons"));
const TABS = [
    { key: 'orders', label: 'Pedidos online', icon: lucide_react_1.ClipboardList },
    { key: 'manual-order', label: 'Lançar pedido', icon: lucide_react_1.ClipboardList },
    { key: 'products', label: 'Produtos', icon: lucide_react_1.Package },
    { key: 'promotions', label: 'Promoções', icon: lucide_react_1.Ticket },
    { key: 'coupons', label: 'Cupons', icon: lucide_react_1.Ticket },
    { key: 'categories', label: 'Categorias', icon: lucide_react_1.Tag },
    { key: 'groups', label: 'Grupos e Adicionais', icon: lucide_react_1.Layers },
    { key: 'customers', label: 'Clientes', icon: lucide_react_1.Users },
    { key: 'financial', label: 'Relatório', icon: lucide_react_1.BarChart3 },
    { key: 'delivery', label: 'Delivery', icon: lucide_react_1.Bike },
    { key: 'cash', label: 'Caixa', icon: lucide_react_1.Store },
    { key: 'ranking', label: 'Ranking', icon: lucide_react_1.Trophy },
    { key: 'courses', label: 'Aulas', icon: lucide_react_1.GraduationCap },
    { key: 'announcements', label: 'Comunicados', icon: lucide_react_1.Megaphone },
    { key: 'marketing', label: 'Marketing', icon: lucide_react_1.Folder },
    { key: 'factory', label: 'Pedidos Fábrica', icon: lucide_react_1.Factory },
    { key: 'fees', label: 'Mensalidades', icon: lucide_react_1.BarChart3 },
    { key: 'fiscal', label: 'Notas Fiscais', icon: lucide_react_1.FileText },
    { key: 'integrations', label: 'Integrações', icon: lucide_react_1.Plug },
];
function FranchiseeDashboard() {
    const { signOut, franchiseId, user } = (0, AuthContext_1.useAuth)();
    const [franchiseName, setFranchiseName] = (0, react_1.useState)('');
    const [franchiseSlug, setFranchiseSlug] = (0, react_1.useState)('');
    const [popupAnnouncement, setPopupAnnouncement] = (0, react_1.useState)(null);
    const [showAnnouncements, setShowAnnouncements] = (0, react_1.useState)(false);
    const [allAnnouncements, setAllAnnouncements] = (0, react_1.useState)([]);
    const [activeTab, setActiveTab] = (0, react_1.useState)('orders');
    const [sidebarOpen, setSidebarOpen] = (0, react_1.useState)(false);
    const [contentBadges, setContentBadges] = (0, react_1.useState)({ courses: 0, marketing: 0, announcements: 0 });
    (0, react_1.useEffect)(() => {
        if (!franchiseId)
            return;
        supabase_1.supabase
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
            const { data } = await supabase_1.supabase
                .from('announcements')
                .select('*')
                .eq('active', true)
                .order('created_at', { ascending: false });
            if (data && data.length > 0) {
                setAllAnnouncements(data);
                const unread = [];
                for (const a of data) {
                    const { data: read } = await supabase_1.supabase
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
            supabase_1.supabase.from('courses').select('id', { count: 'exact', head: true }),
            supabase_1.supabase.from('marketing_files').select('id', { count: 'exact', head: true }),
        ]).then(([courses, marketing]) => setContentBadges(current => ({ ...current, courses: courses.count ?? 0, marketing: marketing.count ?? 0 })));
    }, [franchiseId]);
    const dismissAnnouncement = async (a) => {
        if (franchiseId) {
            await supabase_1.supabase
                .from('announcement_reads')
                .insert({ announcement_id: a.id, franchise_id: franchiseId });
        }
        setPopupAnnouncement(null);
    };
    const tabContent = {
        orders: (0, jsx_runtime_1.jsx)(FranchiseeOrders_1.default, { franchiseId: franchiseId }),
        'manual-order': (0, jsx_runtime_1.jsx)(FranchiseeManualOrder_1.default, { franchiseId: franchiseId }),
        products: (0, jsx_runtime_1.jsx)(FranchiseeProducts_1.default, { franchiseId: franchiseId }),
        categories: (0, jsx_runtime_1.jsx)(FranchiseeCategories_1.default, { franchiseId: franchiseId }),
        groups: (0, jsx_runtime_1.jsx)(FranchiseeGroups_1.default, { franchiseId: franchiseId }),
        customers: (0, jsx_runtime_1.jsx)(FranchiseeCustomers_1.default, { franchiseId: franchiseId }),
        financial: (0, jsx_runtime_1.jsx)(FranchiseeFinancial_1.default, { franchiseId: franchiseId }),
        delivery: (0, jsx_runtime_1.jsx)(FranchiseeDelivery_1.default, { franchiseId: franchiseId }),
        cash: (0, jsx_runtime_1.jsx)(FranchiseeCashRegister_1.default, { franchiseId: franchiseId }),
        ranking: (0, jsx_runtime_1.jsx)(FranchiseeRanking_1.default, { franchiseId: franchiseId }),
        courses: (0, jsx_runtime_1.jsx)(FranchiseeCourses_1.default, { franchiseId: franchiseId }),
        announcements: ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-3", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-white font-bold text-lg mb-4", children: "Comunicados" }), allAnnouncements.length === 0 ? ((0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-sm text-center py-8", children: "Nenhum comunicado no momento." })) : (allAnnouncements.map(a => ((0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-900 border border-zinc-800 rounded-lg p-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 mb-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Megaphone, { size: 14, className: "text-[#FFE500]" }), (0, jsx_runtime_1.jsx)("span", { className: "text-zinc-500 text-xs", children: new Date(a.created_at).toLocaleDateString('pt-BR') })] }), (0, jsx_runtime_1.jsx)("h4", { className: "text-white font-bold text-sm mb-1", children: a.title }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-sm whitespace-pre-wrap", children: a.message })] }, a.id))))] })),
        marketing: (0, jsx_runtime_1.jsx)(FranchiseeMarketing_1.default, { franchiseId: franchiseId }),
        factory: (0, jsx_runtime_1.jsx)(FranchiseeFactoryOrder_1.default, { franchiseId: franchiseId }),
        fees: (0, jsx_runtime_1.jsx)(FranchiseeFees_1.default, { franchiseId: franchiseId }),
        fiscal: (0, jsx_runtime_1.jsx)(FranchiseeFiscal_1.default, { franchiseId: franchiseId }),
        integrations: (0, jsx_runtime_1.jsx)(FranchiseeIntegrations_1.default, { franchiseId: franchiseId }),
        promotions: (0, jsx_runtime_1.jsx)(FranchiseePromotions_1.default, { franchiseId: franchiseId }),
        coupons: (0, jsx_runtime_1.jsx)(FranchiseeCoupons_1.default, { franchiseId: franchiseId }),
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "min-h-screen bg-black text-white", children: [(0, jsx_runtime_1.jsx)("header", { className: "bg-zinc-900 border-b border-zinc-800 sticky top-0 z-30", children: (0, jsx_runtime_1.jsxs)("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => setSidebarOpen(!sidebarOpen), className: "lg:hidden text-zinc-400 hover:text-white", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Menu, { size: 22 }) }), (0, jsx_runtime_1.jsx)("div", { className: "w-10 h-10 rounded-lg overflow-hidden border border-[#FFE500]/30", children: (0, jsx_runtime_1.jsx)("img", { src: "/assets/logo.png", alt: "Logo", className: "w-full h-full object-contain bg-[#FFE500]" }) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-[#FFE500] font-black text-lg leading-none", children: "Suplementaai" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs mt-0.5", children: franchiseName || 'Franquia' })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [franchiseId && (0, jsx_runtime_1.jsxs)("a", { href: `${window.location.origin}/loja/${franchiseSlug}`, target: "_blank", rel: "noreferrer", className: "hidden sm:flex items-center gap-2 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-300 hover:text-white hover:border-[#FFE500]/50 transition-colors", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Store, { size: 14 }), " Abrir loja"] }), (0, jsx_runtime_1.jsxs)("button", { onClick: () => setShowAnnouncements(true), className: "text-zinc-400 hover:text-[#FFE500] transition-colors relative", title: "Comunicados", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Bell, { size: 20 }), allAnnouncements.length > 0 && ((0, jsx_runtime_1.jsx)("span", { className: "absolute -top-1 -right-1 w-4 h-4 bg-[#FFE500] text-black text-[10px] font-bold rounded-full flex items-center justify-center", children: allAnnouncements.length }))] }), (0, jsx_runtime_1.jsxs)("button", { onClick: signOut, className: "flex items-center gap-2 text-zinc-400 hover:text-white text-sm transition-colors", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.LogOut, { size: 18 }), (0, jsx_runtime_1.jsx)("span", { className: "hidden sm:inline", children: "Sair" })] })] })] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 py-8 flex gap-6", children: [(0, jsx_runtime_1.jsx)("aside", { className: `${sidebarOpen ? 'block' : 'hidden'} lg:block w-56 flex-shrink-0`, children: (0, jsx_runtime_1.jsx)("nav", { className: "space-y-1 sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pb-4", children: TABS.map(tab => {
                                const Icon = tab.icon;
                                return ((0, jsx_runtime_1.jsxs)("button", { onClick: () => { setActiveTab(tab.key); setSidebarOpen(false); }, className: `w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.key ? 'bg-[#FFE500] text-black' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}`, children: [(0, jsx_runtime_1.jsx)(Icon, { size: 18 }), (0, jsx_runtime_1.jsx)("span", { className: "flex-1 text-left", children: tab.label }), ['courses', 'marketing', 'announcements'].includes(tab.key) && contentBadges[tab.key] > 0 && (0, jsx_runtime_1.jsx)("span", { className: "min-w-5 h-5 px-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center", children: contentBadges[tab.key] })] }, tab.key));
                            }) }) }), (0, jsx_runtime_1.jsx)("main", { className: "flex-1 min-w-0", children: franchiseId ? tabContent[activeTab] : (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400", children: "Carregando..." }) })] }), popupAnnouncement && ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm", children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-900 border border-[#FFE500]/30 rounded-2xl w-full max-w-md p-6 shadow-2xl", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-10 h-10 rounded-lg bg-[#FFE500]/10 flex items-center justify-center", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Megaphone, { size: 20, className: "text-[#FFE500]" }) }), (0, jsx_runtime_1.jsx)("span", { className: "text-[#FFE500] font-bold text-sm uppercase tracking-wide", children: "Comunicado" })] }), (0, jsx_runtime_1.jsx)("button", { onClick: () => dismissAnnouncement(popupAnnouncement), className: "text-zinc-400 hover:text-white transition-colors", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { size: 20 }) })] }), (0, jsx_runtime_1.jsx)("h2", { className: "text-white font-bold text-xl mb-2", children: popupAnnouncement.title }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-300 text-sm whitespace-pre-wrap mb-6", children: popupAnnouncement.message }), (0, jsx_runtime_1.jsx)("button", { onClick: () => dismissAnnouncement(popupAnnouncement), className: "w-full bg-[#FFE500] hover:bg-[#FFD000] text-black font-bold rounded-lg py-3 transition-all", children: "Entendi" })] }) })), showAnnouncements && ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm", onClick: () => setShowAnnouncements(false), children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto", onClick: e => e.stopPropagation(), children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900", children: [(0, jsx_runtime_1.jsx)("h2", { className: "font-bold text-white text-lg", children: "Comunicados" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setShowAnnouncements(false), className: "text-zinc-400 hover:text-white", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { size: 22 }) })] }), (0, jsx_runtime_1.jsx)("div", { className: "p-6 space-y-3", children: allAnnouncements.length === 0 ? ((0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-sm text-center py-8", children: "Nenhum comunicado no momento." })) : (allAnnouncements.map(a => ((0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 mb-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Megaphone, { size: 14, className: "text-[#FFE500]" }), (0, jsx_runtime_1.jsx)("span", { className: "text-zinc-500 text-xs", children: new Date(a.created_at).toLocaleDateString('pt-BR') })] }), (0, jsx_runtime_1.jsx)("h4", { className: "text-white font-bold text-sm mb-1", children: a.title }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-sm whitespace-pre-wrap", children: a.message })] }, a.id)))) })] }) }))] }));
}

},
"/src/pages/Login.tsx": function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Login;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const AuthContext_1 = require("@/contexts/AuthContext");
const lucide_react_1 = require("lucide-react");
function Login() {
    const { signIn } = (0, AuthContext_1.useAuth)();
    const [email, setEmail] = (0, react_1.useState)('');
    const [password, setPassword] = (0, react_1.useState)('');
    const [showPass, setShowPass] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)('');
    const [loading, setLoading] = (0, react_1.useState)(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const { error: err } = await signIn(email, password);
        if (err)
            setError('E-mail ou senha incorretos.');
        setLoading(false);
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "min-h-screen bg-black flex items-center justify-center p-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "absolute inset-0 overflow-hidden", children: [(0, jsx_runtime_1.jsx)("div", { className: "absolute -top-40 -right-40 w-96 h-96 bg-[#FFE500]/5 rounded-full blur-3xl" }), (0, jsx_runtime_1.jsx)("div", { className: "absolute -bottom-40 -left-40 w-96 h-96 bg-[#FFE500]/5 rounded-full blur-3xl" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "relative w-full max-w-md", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col items-center mb-8", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-24 h-24 rounded-2xl overflow-hidden mb-4 border-2 border-[#FFE500]/30", children: (0, jsx_runtime_1.jsx)("img", { src: "/assets/logo.png", alt: "Suplementaai", className: "w-full h-full object-contain bg-[#FFE500]" }) }), (0, jsx_runtime_1.jsx)("h1", { className: "text-[#FFE500] text-2xl font-black tracking-tight uppercase", children: "Suplementaai" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-sm mt-1", children: "Sistema de Gest\u00E3o de Franquias" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-white text-xl font-bold mb-1", children: "Entrar no sistema" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-sm mb-6", children: "Acesse com suas credenciais" }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSubmit, className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-sm font-medium mb-1.5", children: "E-mail" }), (0, jsx_runtime_1.jsx)("input", { type: "email", value: email, onChange: e => setEmail(e.target.value), required: true, placeholder: "seu@email.com", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-3 text-sm placeholder-zinc-500 focus:outline-none focus:border-[#FFE500] transition-colors" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-sm font-medium mb-1.5", children: "Senha" }), (0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsx)("input", { type: showPass ? 'text' : 'password', value: password, onChange: e => setPassword(e.target.value), required: true, placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-3 pr-12 text-sm placeholder-zinc-500 focus:outline-none focus:border-[#FFE500] transition-colors" }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setShowPass(!showPass), className: "absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors", children: showPass ? (0, jsx_runtime_1.jsx)(lucide_react_1.EyeOff, { size: 18 }) : (0, jsx_runtime_1.jsx)(lucide_react_1.Eye, { size: 18 }) })] })] }), error && ((0, jsx_runtime_1.jsx)("div", { className: "bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3", children: error })), (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: loading, className: "w-full bg-[#FFE500] hover:bg-[#FFD000] text-black font-bold rounded-lg py-3 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed", children: loading ? ((0, jsx_runtime_1.jsx)("div", { className: "w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.LogIn, { size: 18 }), "Entrar"] })) })] })] }), (0, jsx_runtime_1.jsx)("p", { className: "text-center text-zinc-600 text-xs mt-6", children: "\u00A9 2025 Suplementaai. Todos os direitos reservados." })] })] }));
}

},
"/src/pages/MasterDashboard.tsx": function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MasterDashboard;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const supabase_1 = require("@/lib/supabase");
const AuthContext_1 = require("@/contexts/AuthContext");
const lucide_react_1 = require("lucide-react");
const ManageFranchiseModal_1 = __importDefault(require("@/components/master/ManageFranchiseModal"));
const CreateFranchiseModal_1 = __importDefault(require("@/components/master/CreateFranchiseModal"));
const ToolsMenu_1 = __importDefault(require("@/components/master/ToolsMenu"));
const SiteManagerTool_1 = __importDefault(require("@/components/master/SiteManagerTool"));
const SiteOrdersTool_1 = __importDefault(require("@/components/master/SiteOrdersTool"));
function MasterDashboard() {
    const { signOut } = (0, AuthContext_1.useAuth)();
    const [franchises, setFranchises] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [search, setSearch] = (0, react_1.useState)('');
    const [manageFranchise, setManageFranchise] = (0, react_1.useState)(null);
    const [showCreate, setShowCreate] = (0, react_1.useState)(false);
    const [showTools, setShowTools] = (0, react_1.useState)(false);
    const [quickSiteTool, setQuickSiteTool] = (0, react_1.useState)(null);
    const loadFranchises = async () => {
        const { data, error } = await supabase_1.supabase.from('franchises').select('*').order('created_at', { ascending: false });
        if (!error && data)
            setFranchises(data);
        setLoading(false);
    };
    (0, react_1.useEffect)(() => { loadFranchises(); }, []);
    const filtered = franchises.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));
    const toggleStatus = async (f) => {
        const newStatus = f.status === 'active' ? 'inactive' : 'active';
        await supabase_1.supabase.from('franchises').update({ status: newStatus }).eq('id', f.id);
        loadFranchises();
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "min-h-screen bg-black text-white", children: [(0, jsx_runtime_1.jsx)("header", { className: "bg-zinc-900 border-b border-zinc-800 sticky top-0 z-30", children: (0, jsx_runtime_1.jsxs)("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-10 h-10 rounded-lg overflow-hidden border border-[#FFE500]/30", children: (0, jsx_runtime_1.jsx)("img", { src: "/assets/logo.png", alt: "Logo", className: "w-full h-full object-contain bg-[#FFE500]" }) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-[#FFE500] font-black text-lg leading-none", children: "Suplementaai" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs mt-0.5", children: "Painel Master" })] })] }), (0, jsx_runtime_1.jsxs)("button", { onClick: signOut, className: "flex items-center gap-2 text-zinc-400 hover:text-white text-sm transition-colors", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.LogOut, { size: 18 }), (0, jsx_runtime_1.jsx)("span", { className: "hidden sm:inline", children: "Sair" })] })] }) }), (0, jsx_runtime_1.jsxs)("main", { className: "max-w-7xl mx-auto px-4 sm:px-6 py-8", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-2xl font-bold", children: "Franquias" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-sm mt-1", children: "Gerencie todas as unidades da rede" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-wrap gap-3", children: [(0, jsx_runtime_1.jsxs)("button", { onClick: () => setQuickSiteTool('manager'), className: "bg-[#FFE500] hover:bg-[#FFD000] text-black font-bold rounded-lg px-4 py-2.5 flex items-center gap-2 transition-all text-sm", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Paintbrush, { size: 18 }), " Gerenciar Site"] }), (0, jsx_runtime_1.jsxs)("button", { onClick: () => setQuickSiteTool('orders'), className: "bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-lg px-4 py-2.5 flex items-center gap-2 transition-all text-sm border border-zinc-700", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Globe2, { size: 18 }), " Pedidos Site"] }), (0, jsx_runtime_1.jsxs)("button", { onClick: () => setShowCreate(true), className: "bg-[#FFE500] hover:bg-[#FFD000] text-black font-bold rounded-lg px-5 py-2.5 flex items-center gap-2 transition-all text-sm", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { size: 18 }), "Nova Franquia"] }), (0, jsx_runtime_1.jsxs)("button", { onClick: () => setShowTools(true), className: "bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-lg px-5 py-2.5 flex items-center gap-2 transition-all text-sm border border-zinc-700", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Settings, { size: 18 }), (0, jsx_runtime_1.jsx)("span", { className: "hidden sm:inline", children: "Ferramentas" })] })] })] }), (0, jsx_runtime_1.jsx)("section", { className: "mb-8 rounded-2xl border border-[#FFE500]/30 bg-gradient-to-r from-[#FFE500]/10 via-zinc-900 to-zinc-900 p-5 sm:p-6", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col lg:flex-row lg:items-center justify-between gap-5", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-[#FFE500] text-xs font-black uppercase tracking-[.18em]", children: "E-commerce Suplementaai" }), (0, jsx_runtime_1.jsx)("h3", { className: "text-xl sm:text-2xl font-black mt-1", children: "Site nacional e pedidos online" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-sm mt-2 max-w-2xl", children: "Gerencie layout, banners, produtos e conte\u00FAdo do site e acompanhe os pedidos recebidos pelo e-commerce." })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid sm:grid-cols-2 gap-3 min-w-full lg:min-w-[390px]", children: [(0, jsx_runtime_1.jsxs)("button", { type: "button", onClick: () => setQuickSiteTool('manager'), className: "bg-[#FFE500] hover:bg-[#FFD000] text-black font-black rounded-xl px-5 py-4 flex items-center justify-center gap-2 transition-all", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Paintbrush, { size: 19 }), " Gerenciar Site"] }), (0, jsx_runtime_1.jsxs)("button", { type: "button", onClick: () => setQuickSiteTool('orders'), className: "bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-black rounded-xl px-5 py-4 flex items-center justify-center gap-2 transition-all", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Globe2, { size: 19 }), " Pedidos Site"] })] })] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8", children: [(0, jsx_runtime_1.jsx)(StatCard, { label: "Total de Franquias", value: franchises.length, icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Store, { size: 20 }) }), (0, jsx_runtime_1.jsx)(StatCard, { label: "Ativas", value: franchises.filter(f => f.status === 'active').length, icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Power, { size: 20 }) }), (0, jsx_runtime_1.jsx)(StatCard, { label: "Inativas", value: franchises.filter(f => f.status === 'inactive').length, icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Power, { size: 20 }) }), (0, jsx_runtime_1.jsx)(StatCard, { label: "Comunicados", value: 0, icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Megaphone, { size: 20 }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "relative mb-6", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Search, { size: 18, className: "absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: search, onChange: e => setSearch(e.target.value), placeholder: "Buscar franquia...", className: "w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg pl-10 pr-4 py-3 text-sm placeholder-zinc-500 focus:outline-none focus:border-[#FFE500]/50 transition-colors" })] }), loading ? ((0, jsx_runtime_1.jsx)("div", { className: "flex justify-center py-20", children: (0, jsx_runtime_1.jsx)("div", { className: "w-8 h-8 border-2 border-zinc-700 border-t-[#FFE500] rounded-full animate-spin" }) })) : filtered.length === 0 ? ((0, jsx_runtime_1.jsxs)("div", { className: "text-center py-20", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Store, { size: 48, className: "mx-auto text-zinc-700 mb-4" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400", children: "Nenhuma franquia encontrada." })] })) : ((0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: filtered.map(f => ((0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-[#FFE500]/30 transition-all group", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex items-start justify-between mb-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-12 h-12 rounded-lg bg-[#FFE500]/10 flex items-center justify-center", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Store, { size: 22, className: "text-[#FFE500]" }) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h3", { className: "font-bold text-white", children: f.name }), (0, jsx_runtime_1.jsx)("span", { className: `text-xs px-2 py-0.5 rounded-full inline-block mt-1 ${f.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`, children: f.status === 'active' ? 'Ativa' : 'Inativa' })] })] }) }), (0, jsx_runtime_1.jsxs)("p", { className: "text-zinc-500 text-xs mb-4", children: ["Criada em ", new Date(f.created_at).toLocaleDateString('pt-BR')] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2", children: [(0, jsx_runtime_1.jsxs)("button", { onClick: () => setManageFranchise(f), className: "flex-1 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-lg py-2 flex items-center justify-center gap-1.5 transition-colors", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Edit, { size: 14 }), "Gerenciar"] }), (0, jsx_runtime_1.jsx)("button", { onClick: () => toggleStatus(f), className: "bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg px-3 py-2 transition-colors", title: f.status === 'active' ? 'Desativar' : 'Ativar', children: (0, jsx_runtime_1.jsx)(lucide_react_1.Power, { size: 14, className: f.status === 'active' ? 'text-green-400' : 'text-red-400' }) })] })] }, f.id))) }))] }), manageFranchise && ((0, jsx_runtime_1.jsx)(ManageFranchiseModal_1.default, { franchise: manageFranchise, onClose: () => setManageFranchise(null), onUpdate: loadFranchises })), showCreate && ((0, jsx_runtime_1.jsx)(CreateFranchiseModal_1.default, { onClose: () => setShowCreate(false), onCreated: loadFranchises })), showTools && ((0, jsx_runtime_1.jsx)(ToolsMenu_1.default, { onClose: () => setShowTools(false) })), quickSiteTool === 'manager' && (0, jsx_runtime_1.jsx)(SiteManagerTool_1.default, { onClose: () => setQuickSiteTool(null) }), quickSiteTool === 'orders' && (0, jsx_runtime_1.jsx)(SiteOrdersTool_1.default, { onClose: () => setQuickSiteTool(null) })] }));
}
function StatCard({ label, value, icon }) {
    return ((0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-5", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-2", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-sm", children: label }), (0, jsx_runtime_1.jsx)("div", { className: "text-[#FFE500]", children: icon })] }), (0, jsx_runtime_1.jsx)("p", { className: "text-3xl font-bold text-white", children: value })] }));
}

},
"/src/pages/PublicStore.tsx": function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PublicStore;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const supabase_1 = require("@/lib/supabase");
const mtClient_1 = require("@/lib/mtClient");
const lucide_react_1 = require("lucide-react");
const defaultLogo = '/assets/logo.png';
// Desconto comercial da Suplementaai para pagamento online via PIX.
// Mantido centralizado para que catálogo, checkout, pedido e Mercado Pago usem a mesma regra.
const PIX_DISCOUNT_PERCENT = 5;
// Uma única regra de ordenação para qualquer largura de tela. O desempate
// evita que duas categorias com o mesmo sort_order mudem de posição entre
// consultas/dispositivos.
const compareCategories = (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) ||
    (a.created_at ?? '').localeCompare(b.created_at ?? '') ||
    a.id.localeCompare(b.id);
function PublicStore() {
    const [store, setStore] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [notFound, setNotFound] = (0, react_1.useState)(false);
    const [cart, setCart] = (0, react_1.useState)([]);
    const [showCart, setShowCart] = (0, react_1.useState)(false);
    const [submitted, setSubmitted] = (0, react_1.useState)(false);
    const [copied, setCopied] = (0, react_1.useState)(false);
    const [detailProduct, setDetailProduct] = (0, react_1.useState)(null);
    const [detailImageIndex, setDetailImageIndex] = (0, react_1.useState)(0);
    const [detailMediaTab, setDetailMediaTab] = (0, react_1.useState)('photos');
    const [activeVideoIndex, setActiveVideoIndex] = (0, react_1.useState)(0);
    const [couponCode, setCouponCode] = (0, react_1.useState)('');
    const [appliedCoupon, setAppliedCoupon] = (0, react_1.useState)(null);
    const [couponError, setCouponError] = (0, react_1.useState)('');
    const [searchQuery, setSearchQuery] = (0, react_1.useState)('');
    const [activeCategory, setActiveCategory] = (0, react_1.useState)('all');
    const [promoIndex, setPromoIndex] = (0, react_1.useState)(0);
    const promoTimer = (0, react_1.useRef)(null);
    const categoryScrollRef = (0, react_1.useRef)(null);
    const [submitting, setSubmitting] = (0, react_1.useState)(false);
    const [submitError, setSubmitError] = (0, react_1.useState)('');
    const [mpReturnStatus, setMpReturnStatus] = (0, react_1.useState)(null);
    const [mtQuote, setMtQuote] = (0, react_1.useState)(null);
    const [mtQuoteLoading, setMtQuoteLoading] = (0, react_1.useState)(false);
    const [mtQuoteError, setMtQuoteError] = (0, react_1.useState)('');
    const [addressSuggestions, setAddressSuggestions] = (0, react_1.useState)([]);
    const [addressSearching, setAddressSearching] = (0, react_1.useState)(false);
    const [form, setForm] = (0, react_1.useState)({
        name: '', phone: '', zip: '', address: '', addressNumber: '', neighborhood: '', city: '', state: '', addressLat: '', addressLng: '', reference: '', notes: '',
        orderMode: 'delivery',
        paymentChannel: 'store',
        storePaymentMethod: 'cash',
        onlinePaymentMethod: 'pix',
        customerEmail: '', customerCpf: '',
    });
    const slug = window.location.pathname.replace(/^\/+|\/+$/g, '').split('/')[1] ?? '';
    (0, react_1.useEffect)(() => {
        const loadStore = async () => {
            const { data: franchiseData } = await supabase_1.supabase.from('franchises').select('*').eq('slug', slug).eq('status', 'active').maybeSingle();
            if (!franchiseData) {
                setNotFound(true);
                setLoading(false);
                return;
            }
            const franchise = franchiseData;
            const [{ data: categoryData }, { data: productData }, { data: deliveryData }, { data: promoData }] = await Promise.all([
                supabase_1.supabase.from('franchise_categories').select('*').eq('franchise_id', franchise.id).order('sort_order', { ascending: true }).order('created_at', { ascending: true }).order('id', { ascending: true }),
                supabase_1.supabase.from('franchise_products').select('*').eq('franchise_id', franchise.id).eq('active', true).order('sort_order'),
                supabase_1.supabase.from('delivery_settings').select('*').eq('franchise_id', franchise.id).maybeSingle(),
                supabase_1.supabase.from('franchise_promotions').select('*').eq('franchise_id', franchise.id).eq('active', true).order('sort_order'),
            ]);
            const categories = (categoryData ?? []).slice().sort(compareCategories);
            setStore({ franchise, categories, products: (productData ?? []), delivery: deliveryData ?? null, promotions: (promoData ?? []) });
            setLoading(false);
        };
        loadStore();
    }, [slug]);
    (0, react_1.useEffect)(() => {
        if (!store)
            return;
        const logo = store.franchise.logo_url || defaultLogo;
        document.title = `${store.franchise.name} | Suplementaai`;
        document.querySelector('link[rel="icon"]')?.setAttribute('href', logo);
        document.querySelector('meta[property="og:title"]')?.setAttribute('content', store.franchise.name);
        document.querySelector('meta[property="og:image"]')?.setAttribute('content', logo);
        document.querySelector('meta[name="twitter:image"]')?.setAttribute('content', logo);
    }, [store]);
    // Auto-rotate promotions
    (0, react_1.useEffect)(() => {
        if (!store || store.promotions.length <= 1)
            return;
        promoTimer.current = setInterval(() => {
            setPromoIndex(prev => (prev + 1) % store.promotions.length);
        }, 5000);
        return () => { if (promoTimer.current)
            clearInterval(promoTimer.current); };
    }, [store]);
    const hiddenCategoryIds = (0, react_1.useMemo)(() => new Set((store?.categories ?? []).filter(category => /\bml\b/i.test(category.name)).map(category => category.id)), [store]);
    const filteredProducts = (0, react_1.useMemo)(() => {
        if (!store)
            return [];
        let list = store.products;
        if (activeCategory !== 'all')
            list = list.filter(p => (p.category_id ?? 'others') === activeCategory);
        if (searchQuery.trim())
            list = list.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.description ?? '').toLowerCase().includes(searchQuery.toLowerCase()));
        return list;
    }, [store, activeCategory, searchQuery]);
    const filteredByCategory = (0, react_1.useMemo)(() => {
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
    const storePercent = store?.delivery?.fee_store_percent ?? 0;
    const selectedLat = form.addressLat ? Number(form.addressLat) : null;
    const selectedLng = form.addressLng ? Number(form.addressLng) : null;
    const fallbackDistance = store?.delivery ? (0, mtClient_1.haversineKm)(store.delivery.latitude, store.delivery.longitude, selectedLat, selectedLng) : null;
    const staticRawFee = (0, mtClient_1.fallbackDeliveryFee)(store?.delivery ?? null, { neighborhood: form.neighborhood, distanceKm: fallbackDistance });
    const rawDeliveryFee = mtQuote?.fee ?? staticRawFee;
    const deliveryFee = roundMoney(form.orderMode === 'delivery' ? (0, mtClient_1.customerDeliveryPortion)(rawDeliveryFee, storePercent) : 0);
    const total = roundMoney(Math.max(0, subtotal - couponDiscount - pixDiscount + deliveryFee));
    const mtRequired = Boolean(form.orderMode === 'delivery' && store?.delivery?.enabled && store?.delivery?.mt_entregas_enabled);
    const fullDeliveryAddress = [form.address.trim(), form.addressNumber.trim()].filter(Boolean).join(', ');
    const mtAddressReady = Boolean(fullDeliveryAddress && form.neighborhood.trim() && form.city.trim() && form.state.trim());
    // Sugestão de endereço enquanto o cliente digita. A sugestão apenas completa o endereço;
    // o valor da entrega vem da integração MT Entregas.
    (0, react_1.useEffect)(() => {
        if (form.orderMode !== 'delivery' || form.address.trim().length < 4) {
            setAddressSuggestions([]);
            return;
        }
        const timer = window.setTimeout(async () => {
            setAddressSearching(true);
            try {
                const query = [form.address.trim(), form.city.trim(), form.state.trim(), 'Brasil'].filter(Boolean).join(', ');
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&countrycodes=br&accept-language=pt-BR&q=${encodeURIComponent(query)}`);
                const rows = response.ok ? await response.json() : [];
                setAddressSuggestions(Array.isArray(rows) ? rows : []);
            }
            catch {
                setAddressSuggestions([]);
            }
            finally {
                setAddressSearching(false);
            }
        }, 750);
        return () => window.clearTimeout(timer);
    }, [form.address, form.city, form.state, form.orderMode]);
    // CEP é um atalho confiável para preencher rua/bairro/cidade/UF.
    (0, react_1.useEffect)(() => {
        const cep = form.zip.replace(/\D/g, '');
        if (cep.length !== 8)
            return;
        const timer = window.setTimeout(async () => {
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = response.ok ? await response.json() : null;
                if (data && !data.erro)
                    setForm(current => ({ ...current, address: data.logradouro || current.address, neighborhood: data.bairro || current.neighborhood, city: data.localidade || current.city, state: data.uf || current.state }));
            }
            catch { /* endereço continua editável manualmente */ }
        }, 250);
        return () => window.clearTimeout(timer);
    }, [form.zip]);
    // A cotação é automática assim que o destino tem os campos mínimos exigidos.
    (0, react_1.useEffect)(() => {
        if (!store?.delivery || !mtRequired || !mtAddressReady) {
            setMtQuote(null);
            setMtQuoteError('');
            return;
        }
        const timer = window.setTimeout(async () => {
            setMtQuoteLoading(true);
            setMtQuoteError('');
            setMtQuote(null);
            try {
                const quote = await (0, mtClient_1.quoteExistingMt)(store.delivery, {
                    address: fullDeliveryAddress,
                    neighborhood: form.neighborhood.trim(), city: form.city.trim(), state: form.state.trim().toUpperCase(),
                    lat: selectedLat, lng: selectedLng,
                });
                setMtQuote(quote);
            }
            catch (error) {
                setMtQuoteError(error?.message || 'Não foi possível calcular a taxa na MT Entregas.');
            }
            finally {
                setMtQuoteLoading(false);
            }
        }, 850);
        return () => window.clearTimeout(timer);
    }, [store?.delivery, mtRequired, mtAddressReady, fullDeliveryAddress, form.neighborhood, form.city, form.state, form.addressLat, form.addressLng]);
    // Se o cliente alterar o carrinho depois de aplicar um cupom com compra mínima,
    // revalidamos automaticamente para impedir que o desconto permaneça indevidamente.
    (0, react_1.useEffect)(() => {
        if (appliedCoupon && appliedCoupon.min_purchase > 0 && subtotal < appliedCoupon.min_purchase) {
            setAppliedCoupon(null);
            setCouponError(`Este cupom exige compra mínima de R$ ${appliedCoupon.min_purchase.toFixed(2)}.`);
        }
    }, [subtotal, appliedCoupon]);
    (0, react_1.useEffect)(() => {
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
        const { data } = await supabase_1.supabase.from('coupons').select('*').eq('code', couponCode.toUpperCase().trim()).eq('active', true).or(`franchise_id.is.null,franchise_id.eq.${store.franchise.id}`).maybeSingle();
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
        if (form.orderMode === 'delivery' && !mtAddressReady) {
            setSubmitError('Preencha rua, número, bairro, cidade e UF para calcular a entrega.');
            return;
        }
        if (mtRequired && (mtQuoteLoading || !mtQuote)) {
            setSubmitError(mtQuoteLoading ? 'Aguarde a MT Entregas terminar o cálculo da taxa.' : (mtQuoteError || 'A taxa da MT Entregas precisa ser calculada antes de finalizar.'));
            return;
        }
        setSubmitting(true);
        setSubmitError('');
        const orderData = {
            franchise_id: store.franchise.id,
            customer_name: form.name.trim(), customer_phone: form.phone.trim() || null,
            items: cart.map(item => ({ product_id: item.id, name: item.name, price: item.price, quantity: item.quantity })),
            subtotal, discount_amount: pixDiscount, delivery_fee: deliveryFee, total,
            status: 'pending', delivery: form.orderMode === 'delivery',
            address: form.orderMode === 'delivery' ? [fullDeliveryAddress, form.neighborhood.trim(), `${form.city.trim()}/${form.state.trim().toUpperCase()}`, form.zip.trim() ? `CEP ${form.zip.trim()}` : ''].filter(Boolean).join(' - ') : null,
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
        const { data: inserted, error } = await supabase_1.supabase.from('customer_orders').insert(orderData).select().single();
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
            setForm({ name: '', phone: '', zip: '', address: '', addressNumber: '', neighborhood: '', city: '', state: '', addressLat: '', addressLng: '', reference: '', notes: '', orderMode: 'delivery', paymentChannel: 'store', storePaymentMethod: 'cash', onlinePaymentMethod: 'pix', customerEmail: '', customerCpf: '' });
            setSubmitting(false);
            return;
        }
        // Se o cupom zerar os produtos e não houver taxa de entrega, não existe valor
        // positivo para o Mercado Pago cobrar. O pedido continua válido e é registrado
        // como aprovado sem abrir uma preferência de R$ 0,00.
        if (total <= 0) {
            await supabase_1.supabase.from('customer_orders').update({ mp_payment_status: 'approved' }).eq('id', inserted.id);
            setSubmitted(true);
            setCart([]);
            setAppliedCoupon(null);
            setCouponCode('');
            setForm({ name: '', phone: '', zip: '', address: '', addressNumber: '', neighborhood: '', city: '', state: '', addressLat: '', addressLng: '', reference: '', notes: '', orderMode: 'delivery', paymentChannel: 'store', storePaymentMethod: 'cash', onlinePaymentMethod: 'pix', customerEmail: '', customerCpf: '' });
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
            await supabase_1.supabase.from('customer_orders').update({ mp_preference_id: mpData.preference_id }).eq('id', inserted.id);
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
        return (0, jsx_runtime_1.jsx)("div", { className: "min-h-screen bg-black flex items-center justify-center", children: (0, jsx_runtime_1.jsx)("div", { className: "w-8 h-8 border-2 border-zinc-700 border-t-[#FFE500] rounded-full animate-spin" }) });
    if (notFound || !store)
        return (0, jsx_runtime_1.jsx)("div", { className: "min-h-screen bg-black text-white flex items-center justify-center p-6", children: (0, jsx_runtime_1.jsxs)("div", { className: "text-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.AlertCircle, { size: 40, className: "mx-auto text-[#FFE500] mb-3" }), (0, jsx_runtime_1.jsx)("h1", { className: "text-xl font-bold", children: "Loja n\u00E3o encontrada" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-sm mt-2", children: "Confira o link e tente novamente." })] }) });
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
    return (0, jsx_runtime_1.jsxs)("div", { className: "min-h-screen bg-zinc-950 text-white", children: [mpReturnStatus && ((0, jsx_runtime_1.jsx)("div", { className: `px-4 py-3 text-center text-sm font-bold ${mpReturnStatus === 'success' ? 'bg-green-500/20 text-green-400 border-b border-green-500/30' : mpReturnStatus === 'pending' ? 'bg-amber-500/20 text-amber-400 border-b border-amber-500/30' : 'bg-red-500/20 text-red-400 border-b border-red-500/30'}`, children: mpReturnStatus === 'success' ? 'Pagamento aprovado! A loja foi notificada e vai preparar seu pedido.' : mpReturnStatus === 'pending' ? 'Pagamento pendente. Você receberá a confirmação por e-mail.' : 'Pagamento não concluído. Tente novamente.' })), (0, jsx_runtime_1.jsxs)("header", { className: "bg-black border-b border-zinc-800 sticky top-0 z-20", children: [(0, jsx_runtime_1.jsxs)("div", { className: "max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)("img", { src: logo, alt: `Logo ${store.franchise.name}`, className: "w-12 h-12 rounded-xl object-contain bg-[#FFE500] border border-[#FFE500]/30" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-lg font-black text-[#FFE500]", children: store.franchise.name }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs", children: "Suplementaai" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2", children: [(0, jsx_runtime_1.jsxs)("button", { onClick: copyLink, className: "border border-zinc-700 text-zinc-300 hover:text-white rounded-lg px-3 py-2 text-sm flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Link2, { size: 15 }), copied ? 'Link copiado' : 'Compartilhar'] }), (0, jsx_runtime_1.jsxs)("button", { onClick: () => setShowCart(true), className: "relative bg-[#FFE500] text-black font-bold rounded-lg px-3 py-2 text-sm flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ShoppingBag, { size: 16 }), "Sacola", cart.length > 0 && (0, jsx_runtime_1.jsx)("span", { className: "absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center", children: cart.reduce((sum, item) => sum + item.quantity, 0) })] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "max-w-5xl mx-auto px-4 pb-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Search, { size: 18, className: "absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: searchQuery, onChange: e => setSearchQuery(e.target.value), placeholder: "Buscar produtos...", className: "w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg pl-10 pr-4 py-2.5 text-sm placeholder-zinc-500 focus:outline-none focus:border-[#FFE500]/50" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "relative mt-3 group/category-nav", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", "aria-label": "Ver categorias anteriores", onClick: () => categoryScrollRef.current?.scrollBy({ left: -280, behavior: 'smooth' }), className: "hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 items-center justify-center rounded-full bg-[#FFE500] text-black shadow-lg shadow-black/40 opacity-0 group-hover/category-nav:opacity-100 transition-opacity hover:bg-[#FFD000]", children: (0, jsx_runtime_1.jsx)(lucide_react_1.ChevronLeft, { size: 18 }) }), (0, jsx_runtime_1.jsxs)("div", { ref: categoryScrollRef, className: "category-scroll flex gap-2 overflow-x-auto pb-3 -mx-1 px-1 md:px-10", style: { scrollbarWidth: 'thin', scrollbarColor: '#FFE500 #27272a' }, children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => setActiveCategory('all'), className: `flex-shrink-0 text-sm font-medium rounded-full px-4 py-1.5 transition-colors ${activeCategory === 'all' ? 'bg-[#FFE500] text-black' : 'bg-transparent text-zinc-400 border border-zinc-800 hover:text-white'}`, children: "Todas" }), categoryList.map(cat => ((0, jsx_runtime_1.jsx)("button", { onClick: () => setActiveCategory(cat.id), className: `flex-shrink-0 text-sm font-medium rounded-full px-4 py-1.5 transition-colors ${activeCategory === cat.id ? 'bg-[#FFE500] text-black' : 'bg-transparent text-zinc-400 border border-zinc-800 hover:text-white'}`, children: cat.name }, cat.id)))] }), (0, jsx_runtime_1.jsx)("button", { type: "button", "aria-label": "Ver pr\u00F3ximas categorias", onClick: () => categoryScrollRef.current?.scrollBy({ left: 280, behavior: 'smooth' }), className: "hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 items-center justify-center rounded-full bg-[#FFE500] text-black shadow-lg shadow-black/40 opacity-0 group-hover/category-nav:opacity-100 transition-opacity hover:bg-[#FFD000]", children: (0, jsx_runtime_1.jsx)(lucide_react_1.ChevronRight, { size: 18 }) })] })] })] }), (0, jsx_runtime_1.jsxs)("main", { className: "max-w-5xl mx-auto px-4 py-8 space-y-8", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex flex-wrap gap-3 text-sm text-zinc-300", children: [store.delivery?.address && (0, jsx_runtime_1.jsxs)("span", { className: "flex items-center gap-1.5", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.MapPin, { size: 15, className: "text-[#FFE500]" }), store.delivery.address] }), store.delivery?.contact_phone && (0, jsx_runtime_1.jsxs)("a", { href: `tel:${store.delivery.contact_phone}`, className: "flex items-center gap-1.5 hover:text-[#FFE500]", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Phone, { size: 15, className: "text-[#FFE500]" }), store.delivery.contact_phone] }), store.delivery?.enabled && (0, jsx_runtime_1.jsxs)("span", { className: "flex items-center gap-1.5 text-green-400", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Bike, { size: 15 }), "Delivery dispon\u00EDvel"] })] }), activeCategory === 'all' && !searchQuery && activePromotions.length > 0 && ((0, jsx_runtime_1.jsxs)("section", { className: "relative rounded-2xl overflow-hidden", children: [(0, jsx_runtime_1.jsx)("div", { className: "relative h-56 sm:h-64", children: activePromotions.map((promo, idx) => ((0, jsx_runtime_1.jsxs)("div", { className: `absolute inset-0 transition-opacity duration-700 ${idx === promoIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'}`, children: [(0, jsx_runtime_1.jsx)("div", { className: "absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900" }), promo.image_url && (0, jsx_runtime_1.jsx)("img", { src: promo.image_url, alt: promo.title, className: "absolute inset-0 w-full h-full object-cover opacity-60" }), (0, jsx_runtime_1.jsx)("div", { className: "absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" }), (0, jsx_runtime_1.jsxs)("div", { className: "relative h-full flex flex-col justify-end p-6", children: [promo.badge_text && (0, jsx_runtime_1.jsxs)("span", { className: "inline-flex items-center gap-1 bg-[#FFE500] text-black text-xs font-black px-3 py-1 rounded-full w-fit mb-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Ticket, { size: 12 }), promo.badge_text] }), (0, jsx_runtime_1.jsx)("h2", { className: "text-2xl font-black text-white mb-1", children: promo.title }), promo.description && (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-200 text-sm line-clamp-2", children: promo.description })] })] }, promo.id))) }), activePromotions.length > 1 && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => setPromoIndex((promoIndex - 1 + activePromotions.length) % activePromotions.length), className: "absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors", children: (0, jsx_runtime_1.jsx)(lucide_react_1.ChevronLeft, { size: 20 }) }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setPromoIndex((promoIndex + 1) % activePromotions.length), className: "absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors", children: (0, jsx_runtime_1.jsx)(lucide_react_1.ChevronRight, { size: 20 }) }), (0, jsx_runtime_1.jsx)("div", { className: "absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5", children: activePromotions.map((_, idx) => ((0, jsx_runtime_1.jsx)("button", { onClick: () => setPromoIndex(idx), className: `h-1.5 rounded-full transition-all ${idx === promoIndex ? 'w-6 bg-[#FFE500]' : 'w-1.5 bg-white/40'}` }, idx))) })] }))] })), (0, jsx_runtime_1.jsxs)("section", { className: "space-y-8", children: [categoryList.map(category => { const products = filteredByCategory.get(category.id) ?? []; if (products.length === 0)
                                return null; return (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-xl font-bold mb-4", children: category.name }), (0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", children: products.map(product => (0, jsx_runtime_1.jsxs)("article", { onClick: () => { setDetailProduct(product); setDetailImageIndex(0); setDetailMediaTab('photos'); setActiveVideoIndex(0); }, className: "bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-[#FFE500]/40 transition-all cursor-pointer group", children: [(0, jsx_runtime_1.jsx)("div", { className: "aspect-square bg-zinc-800 overflow-hidden flex items-center justify-center", children: product.image_url ? (0, jsx_runtime_1.jsx)("img", { src: product.image_url, alt: product.name, className: "w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" }) : (0, jsx_runtime_1.jsx)("div", { className: "h-full flex items-center justify-center", children: (0, jsx_runtime_1.jsx)(lucide_react_1.ShoppingBag, { size: 32, className: "text-zinc-600" }) }) }), (0, jsx_runtime_1.jsxs)("div", { className: "p-4", children: [(0, jsx_runtime_1.jsx)("h3", { className: "font-bold", children: product.name }), product.description && (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-sm mt-1 line-clamp-2", children: product.description }), (product.brand || product.flavor || product.weight) && (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-wrap gap-1.5 mt-2", children: [product.brand && (0, jsx_runtime_1.jsx)("span", { className: "text-xs bg-zinc-800 text-zinc-300 rounded px-2 py-0.5", children: product.brand }), product.flavor && (0, jsx_runtime_1.jsx)("span", { className: "text-xs bg-zinc-800 text-zinc-300 rounded px-2 py-0.5", children: product.flavor }), product.weight && (0, jsx_runtime_1.jsx)("span", { className: "text-xs bg-zinc-800 text-zinc-300 rounded px-2 py-0.5", children: product.weight })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mt-3", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("p", { className: "text-green-400 font-black", children: ["R$ ", getProductPixPrice(product).toFixed(2), " ", (0, jsx_runtime_1.jsx)("span", { className: "text-xs font-bold", children: "no PIX" })] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-zinc-500 text-xs", children: ["R$ ", getProductBasePrice(product).toFixed(2), " nos demais pagamentos", product.discount_price ? (0, jsx_runtime_1.jsxs)("span", { className: "ml-1 text-zinc-600 line-through", children: ["R$ ", product.price.toFixed(2)] }) : null] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-green-500/80 text-[11px] font-semibold", children: [PIX_DISCOUNT_PERCENT, "% de desconto no PIX"] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-zinc-600 text-[11px]", children: ["at\u00E9 3x sem juros de R$ ", (getProductBasePrice(product) / 3).toFixed(2)] })] }), (0, jsx_runtime_1.jsx)("span", { className: "text-zinc-500 text-xs group-hover:text-[#FFE500] transition-colors", children: "Ver detalhes" })] })] })] }, product.id)) })] }, category.id); }), filteredProducts.length === 0 && (0, jsx_runtime_1.jsxs)("div", { className: "text-center py-16", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Store, { size: 40, className: "mx-auto text-zinc-700 mb-3" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400", children: searchQuery ? 'Nenhum produto encontrado para sua busca.' : 'O cardápio desta loja ainda está sendo preparado.' })] })] })] }), detailProduct && (() => {
                const imgs = allImages(detailProduct);
                const activeImg = imgs[detailImageIndex] ?? imgs[0] ?? null;
                const vids = allVideos(detailProduct);
                return ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4", onClick: () => { setDetailProduct(null); setDetailImageIndex(0); }, children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto", onClick: e => e.stopPropagation(), children: [(0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => { setDetailProduct(null); setDetailImageIndex(0); }, className: "absolute top-3 left-3 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 transition-colors z-10", children: (0, jsx_runtime_1.jsx)(lucide_react_1.ChevronLeft, { size: 20 }) }), (0, jsx_runtime_1.jsx)("button", { onClick: () => { setDetailProduct(null); setDetailImageIndex(0); }, className: "absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 transition-colors z-10", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { size: 20 }) }), detailMediaTab === 'photos' ? ((0, jsx_runtime_1.jsxs)("div", { className: "w-full aspect-square bg-black flex items-center justify-center", children: [activeImg ? (0, jsx_runtime_1.jsx)("img", { src: activeImg, alt: detailProduct.name, className: "w-full h-full object-contain" }) : (0, jsx_runtime_1.jsx)("div", { className: "w-full h-full bg-zinc-800 flex items-center justify-center", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Package, { size: 48, className: "text-zinc-600" }) }), imgs.length > 1 && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => setDetailImageIndex((detailImageIndex - 1 + imgs.length) % imgs.length), className: "absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors", children: (0, jsx_runtime_1.jsx)(lucide_react_1.ChevronLeft, { size: 20 }) }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setDetailImageIndex((detailImageIndex + 1) % imgs.length), className: "absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors", children: (0, jsx_runtime_1.jsx)(lucide_react_1.ChevronRight, { size: 20 }) })] }))] })) : ((0, jsx_runtime_1.jsx)("div", { className: "w-full aspect-square bg-black flex items-center justify-center", children: vids.length > 0 ? ((0, jsx_runtime_1.jsx)("video", { src: vids[activeVideoIndex], controls: true, autoPlay: true, className: "w-full h-full object-contain" })) : ((0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-sm", children: "Nenhum v\u00EDdeo dispon\u00EDvel." })) }))] }), (imgs.length > 0 || vids.length > 0) && ((0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2 p-3 overflow-x-auto", children: [imgs.length > 0 && imgs.map((img, idx) => ((0, jsx_runtime_1.jsx)("button", { onClick: () => { setDetailMediaTab('photos'); setDetailImageIndex(idx); }, className: `flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${detailMediaTab === 'photos' && idx === detailImageIndex ? 'border-[#FFE500]' : 'border-transparent'}`, children: (0, jsx_runtime_1.jsx)("img", { src: img, alt: "", className: "w-full h-full object-cover" }) }, `img${idx}`))), vids.length > 0 && vids.map((vid, idx) => ((0, jsx_runtime_1.jsx)("button", { onClick: () => { setDetailMediaTab('videos'); setActiveVideoIndex(idx); }, className: `flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors flex items-center justify-center bg-zinc-800 ${detailMediaTab === 'videos' && idx === activeVideoIndex ? 'border-[#FFE500]' : 'border-transparent'}`, children: (0, jsx_runtime_1.jsx)(lucide_react_1.Play, { size: 18, className: "text-white" }) }, `vid${idx}`)))] })), (0, jsx_runtime_1.jsxs)("div", { className: "p-5 space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-xl font-black text-white", children: detailProduct.name }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-1", children: [(0, jsx_runtime_1.jsxs)("p", { className: "text-green-400 text-xl font-black", children: ["R$ ", getProductPixPrice(detailProduct).toFixed(2), " ", (0, jsx_runtime_1.jsx)("span", { className: "text-sm font-bold", children: "no PIX" })] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-zinc-400 text-sm", children: ["R$ ", getProductBasePrice(detailProduct).toFixed(2), " nos demais pagamentos ", detailProduct.discount_price ? (0, jsx_runtime_1.jsxs)("span", { className: "text-zinc-600 line-through ml-1", children: ["R$ ", detailProduct.price.toFixed(2)] }) : null] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-green-500/80 text-xs font-semibold mt-0.5", children: [PIX_DISCOUNT_PERCENT, "% de desconto no PIX"] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-zinc-500 text-xs mt-1", children: ["at\u00E9 3x sem juros de R$ ", (getProductBasePrice(detailProduct) / 3).toFixed(2)] })] })] }), detailProduct.description && (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-300 text-sm", children: detailProduct.description }), detailProduct.long_description && (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-white font-bold text-sm mb-1", children: "Detalhes" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-sm whitespace-pre-wrap", children: detailProduct.long_description })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [detailProduct.brand && (0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-800/50 rounded-lg p-3", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs", children: "Marca" }), (0, jsx_runtime_1.jsx)("p", { className: "text-white text-sm font-medium", children: detailProduct.brand })] }), detailProduct.flavor && (0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-800/50 rounded-lg p-3", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs", children: "Sabor" }), (0, jsx_runtime_1.jsx)("p", { className: "text-white text-sm font-medium", children: detailProduct.flavor })] }), detailProduct.weight && (0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-800/50 rounded-lg p-3", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs", children: "Peso / Tamanho" }), (0, jsx_runtime_1.jsx)("p", { className: "text-white text-sm font-medium", children: detailProduct.weight })] }), detailProduct.ingredients && (0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-800/50 rounded-lg p-3", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs", children: "Ingredientes" }), (0, jsx_runtime_1.jsx)("p", { className: "text-white text-sm font-medium", children: detailProduct.ingredients })] }), detailProduct.nutritional_info && (0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-800/50 rounded-lg p-3", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs", children: "Informa\u00E7\u00E3o Nutricional" }), (0, jsx_runtime_1.jsx)("p", { className: "text-white text-sm font-medium", children: detailProduct.nutritional_info })] }), detailProduct.usage_instructions && (0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-800/50 rounded-lg p-3", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs", children: "Como Usar" }), (0, jsx_runtime_1.jsx)("p", { className: "text-white text-sm font-medium", children: detailProduct.usage_instructions })] })] }), (0, jsx_runtime_1.jsxs)("button", { onClick: () => { addToCart(detailProduct); setDetailProduct(null); setDetailImageIndex(0); setShowCart(true); }, className: "w-full bg-[#FFE500] hover:bg-[#FFD000] text-black font-bold rounded-lg py-3 flex items-center justify-center gap-2 transition-all", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { size: 18 }), " Adicionar \u00E0 sacola \u2014 R$ ", getProductBasePrice(detailProduct).toFixed(2)] }), (0, jsx_runtime_1.jsxs)("button", { onClick: () => { setDetailProduct(null); setDetailImageIndex(0); }, className: "w-full bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg py-2.5 flex items-center justify-center gap-2 transition-all", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ChevronLeft, { size: 16 }), " Voltar ao card\u00E1pio"] })] })] }) }));
            })(), showCart && (0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4", onClick: () => { setShowCart(false); setSubmitted(false); }, children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto", onClick: event => event.stopPropagation(), children: [(0, jsx_runtime_1.jsxs)("div", { className: "p-5 border-b border-zinc-800 flex justify-between", children: [(0, jsx_runtime_1.jsx)("h2", { className: "font-bold text-lg", children: submitted ? 'Pedido enviado' : 'Sua sacola' }), (0, jsx_runtime_1.jsx)("button", { onClick: () => { setShowCart(false); setSubmitted(false); }, children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { size: 20 }) })] }), submitted ? (0, jsx_runtime_1.jsxs)("div", { className: "p-8 text-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Check, { size: 42, className: "mx-auto text-green-400 mb-3" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-300", children: "A loja recebeu seu pedido e entrar\u00E1 em contato." }), (0, jsx_runtime_1.jsx)("button", { onClick: () => { setShowCart(false); setSubmitted(false); }, className: "mt-4 bg-[#FFE500] hover:bg-[#FFD000] text-black font-bold rounded-lg px-4 py-2 text-sm", children: "Fazer novo pedido" })] }) : (0, jsx_runtime_1.jsx)("div", { className: "p-5 space-y-4", children: cart.length === 0 ? (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400 text-center py-6", children: "Adicione produtos para fazer um pedido." }) : (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { className: "space-y-2", children: cart.map(item => (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3 bg-zinc-800/60 rounded-lg p-3", children: [item.image_url ? (0, jsx_runtime_1.jsx)("img", { src: item.image_url, alt: item.name, className: "w-12 h-12 rounded-lg object-contain bg-zinc-900 flex-shrink-0" }) : (0, jsx_runtime_1.jsx)("div", { className: "w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Package, { size: 18, className: "text-zinc-600" }) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1 min-w-0", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm font-medium truncate", children: item.name }), (0, jsx_runtime_1.jsxs)("p", { className: "text-[#FFE500] text-xs", children: ["R$ ", (item.price * item.quantity).toFixed(2)] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => changeQuantity(item.id, -1), className: "w-7 h-7 rounded bg-zinc-700 flex items-center justify-center", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Minus, { size: 13 }) }), (0, jsx_runtime_1.jsx)("span", { className: "text-sm", children: item.quantity }), (0, jsx_runtime_1.jsx)("button", { onClick: () => changeQuantity(item.id, 1), className: "w-7 h-7 rounded bg-zinc-700 flex items-center justify-center", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { size: 13 }) })] })] }, item.id)) }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: submitOrder, className: "space-y-3", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1.5", children: "Tipo de pedido" }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-2", children: [(0, jsx_runtime_1.jsxs)("button", { type: "button", onClick: () => setForm({ ...form, orderMode: 'pickup', storePaymentMethod: 'cash' }), className: `flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold border transition-all ${form.orderMode === 'pickup' ? 'bg-[#FFE500] text-black border-[#FFE500]' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Store, { size: 16 }), " Retirada"] }), (0, jsx_runtime_1.jsxs)("button", { type: "button", onClick: () => setForm({ ...form, orderMode: 'delivery' }), className: `flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold border transition-all ${form.orderMode === 'delivery' ? 'bg-[#FFE500] text-black border-[#FFE500]' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Truck, { size: 16 }), " Entrega"] })] })] }), (0, jsx_runtime_1.jsx)("input", { required: true, placeholder: "Seu nome", value: form.name, onChange: e => setForm({ ...form, name: e.target.value }), className: "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), (0, jsx_runtime_1.jsx)("input", { required: true, placeholder: "Telefone / WhatsApp", value: form.phone, onChange: e => setForm({ ...form, phone: e.target.value }), className: "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), form.orderMode === 'delivery' && (0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-[120px_1fr] gap-2", children: [(0, jsx_runtime_1.jsx)("input", { placeholder: "CEP", value: form.zip, onChange: e => setForm({ ...form, zip: e.target.value }), inputMode: "numeric", className: "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), (0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsx)("input", { required: true, placeholder: "Rua / avenida", value: form.address, onChange: e => { setForm({ ...form, address: e.target.value, addressLat: '', addressLng: '' }); }, className: "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), (addressSearching || addressSuggestions.length > 0) && (0, jsx_runtime_1.jsxs)("div", { className: "absolute z-30 top-full mt-1 w-full bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl max-h-52 overflow-y-auto", children: [addressSearching && (0, jsx_runtime_1.jsx)("p", { className: "px-3 py-2 text-xs text-zinc-500", children: "Buscando endere\u00E7o..." }), addressSuggestions.map((suggestion) => (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => { const a = suggestion.address || {}; setForm(current => ({ ...current, address: a.road || a.pedestrian || a.residential || current.address, neighborhood: a.suburb || a.neighbourhood || a.quarter || current.neighborhood, city: a.city || a.town || a.municipality || current.city, state: (a.state_code || '').replace('BR-', '') || current.state, zip: a.postcode || current.zip, addressLat: String(suggestion.lat || ''), addressLng: String(suggestion.lon || '') })); setAddressSuggestions([]); }, className: "w-full text-left px-3 py-2 hover:bg-zinc-800 border-b border-zinc-800 last:border-0", children: (0, jsx_runtime_1.jsx)("p", { className: "text-white text-xs font-medium", children: suggestion.display_name }) }, `${suggestion.place_id}-${suggestion.lat}`))] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-[110px_1fr] gap-2", children: [(0, jsx_runtime_1.jsx)("input", { required: true, placeholder: "N\u00FAmero", value: form.addressNumber, onChange: e => setForm({ ...form, addressNumber: e.target.value }), className: "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), (0, jsx_runtime_1.jsx)("input", { required: true, placeholder: "Bairro", value: form.neighborhood, onChange: e => setForm({ ...form, neighborhood: e.target.value }), className: "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-[1fr_80px] gap-2", children: [(0, jsx_runtime_1.jsx)("input", { required: true, placeholder: "Cidade", value: form.city, onChange: e => setForm({ ...form, city: e.target.value }), className: "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), (0, jsx_runtime_1.jsx)("input", { required: true, maxLength: 2, placeholder: "UF", value: form.state, onChange: e => setForm({ ...form, state: e.target.value.toUpperCase() }), className: "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm uppercase focus:outline-none focus:border-[#FFE500]" })] }), (0, jsx_runtime_1.jsx)("input", { placeholder: "Ponto de refer\u00EAncia", value: form.reference, onChange: e => setForm({ ...form, reference: e.target.value }), className: "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), mtRequired && (0, jsx_runtime_1.jsx)("div", { className: `rounded-lg border px-3 py-2 text-xs ${mtQuote ? 'bg-green-500/10 border-green-500/20 text-green-400' : mtQuoteError ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-zinc-800 border-zinc-700 text-zinc-400'}`, children: mtQuoteLoading ? 'Calculando taxa real com a MT Entregas...' : mtQuote ? `MT Entregas: R$ ${deliveryFee.toFixed(2)}${mtQuote.km != null ? ` • ${mtQuote.km.toFixed(1)} km` : ''}${mtQuote.minutes != null ? ` • aprox. ${Math.round(mtQuote.minutes)} min` : ''}` : mtQuoteError || 'A taxa será calculada automaticamente após preencher o endereço completo.' })] }), (0, jsx_runtime_1.jsx)("textarea", { placeholder: "Observa\u00E7\u00F5es", value: form.notes, onChange: e => setForm({ ...form, notes: e.target.value }), rows: 2, className: "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-[#FFE500]" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1.5", children: "Cupom de desconto" }), appliedCoupon ? ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-2", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("p", { className: "text-green-400 text-sm font-bold", children: [appliedCoupon.code, " aplicado!"] }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs", children: appliedCoupon.discount_type === 'percent' ? `${appliedCoupon.discount_value}% de desconto` : `R$ ${appliedCoupon.discount_value} de desconto` })] }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => { setAppliedCoupon(null); setCouponCode(''); }, className: "text-red-400", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { size: 16 }) })] })) : ((0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2", children: [(0, jsx_runtime_1.jsx)("input", { type: "text", value: couponCode, onChange: e => setCouponCode(e.target.value), placeholder: "Digite o cupom", className: "flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: applyCoupon, className: "bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-bold rounded-lg px-4 py-2", children: "Aplicar" })] })), couponError && (0, jsx_runtime_1.jsx)("p", { className: "text-red-400 text-xs mt-1", children: couponError })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-zinc-300 text-xs font-medium mb-1.5", children: "Forma de pagamento" }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-2", children: [(0, jsx_runtime_1.jsxs)("button", { type: "button", onClick: () => setForm({ ...form, paymentChannel: 'store' }), className: `flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-bold border transition-all ${form.paymentChannel === 'store' ? 'bg-[#FFE500] text-black border-[#FFE500]' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Store, { size: 16 }), " Pagamento na loja"] }), (0, jsx_runtime_1.jsxs)("button", { type: "button", onClick: () => setForm({ ...form, paymentChannel: 'online' }), className: `flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-bold border transition-all ${form.paymentChannel === 'online' ? 'bg-[#FFE500] text-black border-[#FFE500]' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Wallet, { size: 16 }), " Online e PIX"] })] }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-500 text-xs mt-1.5", children: form.paymentChannel === 'store'
                                                            ? 'O entregador leva a maquininha para pagar no cliente (cartão ou dinheiro).'
                                                            : 'Pagamento via Mercado Pago (PIX, cartão de crédito ou débito) — o pedido é confirmado após o pagamento.' })] }), form.paymentChannel === 'store' && ((0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-3 gap-2", children: [
                                                    { key: 'credit_card', label: 'Crédito', icon: (0, jsx_runtime_1.jsx)(lucide_react_1.CreditCard, { size: 15 }) },
                                                    { key: 'debit_card', label: 'Débito', icon: (0, jsx_runtime_1.jsx)(lucide_react_1.CreditCard, { size: 15 }) },
                                                    { key: 'cash', label: 'Dinheiro', icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Banknote, { size: 15 }) },
                                                ].map(pm => ((0, jsx_runtime_1.jsxs)("button", { type: "button", onClick: () => setForm({ ...form, storePaymentMethod: pm.key }), className: `flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold border transition-all ${form.storePaymentMethod === pm.key ? 'bg-[#FFE500] text-black border-[#FFE500]' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`, children: [pm.icon, " ", pm.label] }, pm.key))) })), form.paymentChannel === 'online' && ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-3 gap-2", children: [
                                                            { key: 'pix', label: `PIX -${PIX_DISCOUNT_PERCENT}%`, icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Wallet, { size: 15 }) },
                                                            { key: 'credit_card', label: 'Crédito', icon: (0, jsx_runtime_1.jsx)(lucide_react_1.CreditCard, { size: 15 }) },
                                                            { key: 'debit_card', label: 'Débito', icon: (0, jsx_runtime_1.jsx)(lucide_react_1.CreditCard, { size: 15 }) },
                                                        ].map(pm => ((0, jsx_runtime_1.jsxs)("button", { type: "button", onClick: () => setForm({ ...form, onlinePaymentMethod: pm.key }), className: `flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold border transition-all ${form.onlinePaymentMethod === pm.key ? 'bg-[#FFE500] text-black border-[#FFE500]' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`, children: [pm.icon, " ", pm.label] }, pm.key))) }), (0, jsx_runtime_1.jsx)("input", { type: "email", required: true, placeholder: "E-mail para receber a cobran\u00E7a", value: form.customerEmail, onChange: e => setForm({ ...form, customerEmail: e.target.value }), className: "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), (0, jsx_runtime_1.jsx)("input", { type: "text", required: true, placeholder: "CPF do pagador", value: form.customerCpf, onChange: e => setForm({ ...form, customerCpf: e.target.value }), className: "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), (0, jsx_runtime_1.jsx)("div", { className: `${isPixPayment ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'} border rounded-lg p-2.5 text-xs`, children: isPixPayment
                                                            ? `PIX selecionado: ${PIX_DISCOUNT_PERCENT}% de desconto aplicado automaticamente ao valor dos produtos. Você pagará o total final já descontado no Mercado Pago.`
                                                            : 'Após enviar o pedido, você será redirecionado para o checkout do Mercado Pago para concluir o pagamento.' })] })), (0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-800/50 rounded-lg p-3 space-y-1.5 text-sm", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between text-zinc-400", children: [(0, jsx_runtime_1.jsx)("span", { children: "Subtotal" }), (0, jsx_runtime_1.jsxs)("span", { children: ["R$ ", subtotal.toFixed(2)] })] }), couponDiscount > 0 && (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between text-green-400", children: [(0, jsx_runtime_1.jsxs)("span", { children: ["Cupom (", appliedCoupon?.code, ")"] }), (0, jsx_runtime_1.jsxs)("span", { children: ["- R$ ", couponDiscount.toFixed(2)] })] }), pixDiscount > 0 && (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between text-green-400 font-medium", children: [(0, jsx_runtime_1.jsxs)("span", { children: ["Desconto PIX (", PIX_DISCOUNT_PERCENT, "%)"] }), (0, jsx_runtime_1.jsxs)("span", { children: ["- R$ ", pixDiscount.toFixed(2)] })] }), deliveryFee > 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between text-zinc-400", children: [(0, jsx_runtime_1.jsxs)("span", { children: ["Taxa de entrega", storePercent > 0 ? ` (loja paga ${storePercent}%)` : ''] }), (0, jsx_runtime_1.jsxs)("span", { children: ["R$ ", deliveryFee.toFixed(2)] })] })), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between text-white font-bold border-t border-zinc-700 pt-1.5", children: [(0, jsx_runtime_1.jsx)("span", { children: "Total" }), (0, jsx_runtime_1.jsxs)("span", { className: "text-[#FFE500]", children: ["R$ ", total.toFixed(2)] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between border-t border-zinc-800 pt-3", children: [(0, jsx_runtime_1.jsxs)("span", { className: "font-bold", children: ["Total R$ ", total.toFixed(2)] }), (0, jsx_runtime_1.jsxs)("button", { type: "submit", disabled: submitting, className: "bg-[#FFE500] text-black font-bold rounded-lg px-4 py-2 disabled:opacity-60 flex items-center gap-2", children: [submitting && (0, jsx_runtime_1.jsx)("div", { className: "w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" }), submitting ? 'Processando...' : form.paymentChannel === 'online' ? 'Ir para pagamento' : 'Enviar pedido'] })] }), submitError && (0, jsx_runtime_1.jsx)("p", { className: "text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2", children: submitError })] })] }) })] }) })] });
}

}
};
const __externals={ 'react':React, 'react/jsx-runtime':JSXRuntime, 'react-dom/client':ReactDOMClient, '@supabase/supabase-js':SupabaseJS, 'lucide-react':LucideReact };
const __cache={};
function __norm(p){ const out=[]; for(const part of p.split('/')){ if(!part||part==='.') continue; if(part==='..') out.pop(); else out.push(part); } return '/'+out.join('/'); }
function __resolve(from,req){ if(__externals[req]) return req; if(req.endsWith('.css')) return '__css__'; let base; if(req.startsWith('@/')) base='/src/'+req.slice(2); else if(req.startsWith('.')) base=__norm(from.slice(0,from.lastIndexOf('/')+1)+req); else base=req; const c=[base,base+'.ts',base+'.tsx',base+'/index.ts',base+'/index.tsx']; for(const x of c) if(__modules[x]) return x; throw new Error('Módulo local não encontrado: '+req+' a partir de '+from); }
function __load(id){ if(id==='__css__') return {}; if(__externals[id]) return __externals[id]; if(__cache[id]) return __cache[id].exports; const fn=__modules[id]; if(!fn) throw new Error('Módulo não registrado: '+id); const module={exports:{}}; __cache[id]=module; const req=(r)=>__load(__resolve(id,r)); fn(req,module,module.exports); return module.exports; }
__load('/src/main.tsx');
