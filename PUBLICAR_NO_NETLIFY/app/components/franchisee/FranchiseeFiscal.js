import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { supabase } from '/app/lib/supabase.js';
import { FileText, Save, Eye, X, AlertCircle, CheckCircle2, Clock, Building2, KeyRound, Shield } from 'lucide-react';
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
    pending: { label: 'Pendente', color: 'text-zinc-400', icon: Clock },
    processing: { label: 'Processando', color: 'text-yellow-400', icon: Clock },
    authorized: { label: 'Autorizada', color: 'text-green-400', icon: CheckCircle2 },
    rejected: { label: 'Rejeitada', color: 'text-red-400', icon: AlertCircle },
    cancelled: { label: 'Cancelada', color: 'text-zinc-500', icon: X },
};
export default function FranchiseeFiscal({ franchiseId }) {
    const [settings, setSettings] = useState(null);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showInvoiceModal, setShowInvoiceModal] = useState(null);
    const [form, setForm] = useState({
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
            supabase.from('fiscal_settings').select('*').eq('franchise_id', franchiseId).maybeSingle(),
            supabase.from('fiscal_invoices').select('*').eq('franchise_id', franchiseId).order('created_at', { ascending: false }),
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
    useEffect(() => { load(); }, [franchiseId]);
    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        const payload = { ...form, franchise_id: franchiseId };
        if (settings) {
            await supabase.from('fiscal_settings').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', settings.id);
        }
        else {
            await supabase.from('fiscal_settings').insert(payload);
        }
        setSaving(false);
        load();
    };
    if (loading) {
        return _jsx("div", { className: "flex justify-center py-12", children: _jsx("div", { className: "w-6 h-6 border-2 border-zinc-700 border-t-[#FFE500] rounded-full animate-spin" }) });
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("h3", { className: "text-white font-bold text-lg flex items-center gap-2", children: [_jsx(FileText, { size: 20, className: "text-[#FFE500]" }), " Notas Fiscais (NFe)"] }), _jsxs("form", { onSubmit: handleSave, className: "space-y-4", children: [_jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3", children: [_jsxs("h4", { className: "text-white font-bold text-sm flex items-center gap-2", children: [_jsx(Building2, { size: 16, className: "text-[#FFE500]" }), " Dados do Emitente"] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [_jsxs("div", { className: "sm:col-span-2", children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Raz\u00E3o Social" }), _jsx("input", { type: "text", value: form.company_name, onChange: e => setForm({ ...form, company_name: e.target.value }), className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "CNPJ" }), _jsx("input", { type: "text", value: form.cnpj, onChange: e => setForm({ ...form, cnpj: e.target.value }), placeholder: "00.000.000/0000-00", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Inscri\u00E7\u00E3o Estadual" }), _jsx("input", { type: "text", value: form.ie, onChange: e => setForm({ ...form, ie: e.target.value }), className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), _jsxs("div", { className: "sm:col-span-2", children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Endere\u00E7o" }), _jsx("input", { type: "text", value: form.address, onChange: e => setForm({ ...form, address: e.target.value }), className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Cidade" }), _jsx("input", { type: "text", value: form.city, onChange: e => setForm({ ...form, city: e.target.value }), className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "UF" }), _jsx("input", { type: "text", maxLength: 2, value: form.uf, onChange: e => setForm({ ...form, uf: e.target.value.toUpperCase() }), className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "CEP" }), _jsx("input", { type: "text", value: form.cep, onChange: e => setForm({ ...form, cep: e.target.value }), placeholder: "00000-000", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Telefone" }), _jsx("input", { type: "text", value: form.phone, onChange: e => setForm({ ...form, phone: e.target.value }), className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "E-mail" }), _jsx("input", { type: "email", value: form.email, onChange: e => setForm({ ...form, email: e.target.value }), className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Regime Tribut\u00E1rio (CRT)" }), _jsx("select", { value: form.crt, onChange: e => setForm({ ...form, crt: e.target.value }), className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]", children: CRT_OPTIONS.map(o => _jsx("option", { value: o.value, children: o.label }, o.value)) })] })] })] }), _jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3", children: [_jsxs("h4", { className: "text-white font-bold text-sm flex items-center gap-2", children: [_jsx(KeyRound, { size: 16, className: "text-[#FFE500]" }), " Provedor de Emiss\u00E3o"] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Provedor" }), _jsx("select", { value: form.provider, onChange: e => setForm({ ...form, provider: e.target.value }), className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]", children: PROVIDERS.map(p => _jsx("option", { value: p.value, children: p.label }, p.value)) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Ambiente" }), _jsxs("select", { value: form.environment, onChange: e => setForm({ ...form, environment: e.target.value }), className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]", children: [_jsx("option", { value: "homologacao", children: "Homologa\u00E7\u00E3o (testes)" }), _jsx("option", { value: "producao", children: "Produ\u00E7\u00E3o" })] })] }), form.provider !== 'manual' && (_jsxs("div", { className: "sm:col-span-2", children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "API Key do Provedor" }), _jsx("input", { type: "password", value: form.provider_api_key, onChange: e => setForm({ ...form, provider_api_key: e.target.value }), placeholder: "Cole aqui a chave de API do provedor", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }))] }), form.provider === 'manual' && (_jsxs("div", { className: "bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 flex items-start gap-2", children: [_jsx(AlertCircle, { size: 16, className: "text-yellow-400 mt-0.5 flex-shrink-0" }), _jsx("p", { className: "text-yellow-400 text-xs", children: "No modo manual, as notas s\u00E3o apenas registradas no sistema. Para emiss\u00E3o autom\u00E1tica via SEFAZ, selecione um provedor e informe a API key." })] }))] }), _jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-4", children: [_jsxs("h4", { className: "text-white font-bold text-sm flex items-center gap-2 mb-3", children: [_jsx(Shield, { size: 16, className: "text-[#FFE500]" }), " Certificado Digital"] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: `w-3 h-3 rounded-full ${settings?.certificate_status === 'active' ? 'bg-green-400' : settings?.certificate_status === 'uploaded' ? 'bg-yellow-400' : 'bg-zinc-600'}` }), _jsx("span", { className: "text-sm text-zinc-300", children: settings?.certificate_status === 'active' ? 'Certificado ativo' :
                                            settings?.certificate_status === 'uploaded' ? 'Certificado enviado (aguardando validação)' :
                                                'Nenhum certificado configurado' })] }), _jsx("p", { className: "text-zinc-500 text-xs mt-2", children: "O certificado A1/CNPJ \u00E9 configurado diretamente no provedor de emiss\u00E3o selecionado." })] }), _jsxs("button", { type: "submit", disabled: saving, className: "bg-[#FFE500] hover:bg-[#FFD000] text-black font-bold rounded-lg px-6 py-3 flex items-center gap-2 transition-all disabled:opacity-50", children: [saving ? _jsx("div", { className: "w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" }) : _jsx(Save, { size: 18 }), "Salvar configura\u00E7\u00F5es fiscais"] })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-white font-bold text-sm mb-3", children: "Notas Fiscais Emitidas" }), invoices.length === 0 ? (_jsxs("div", { className: "text-center py-8 bg-zinc-900 border border-zinc-800 rounded-xl", children: [_jsx(FileText, { size: 36, className: "mx-auto text-zinc-700 mb-2" }), _jsx("p", { className: "text-zinc-400 text-sm", children: "Nenhuma nota fiscal emitida ainda." })] })) : (_jsx("div", { className: "space-y-2", children: invoices.map(inv => {
                            const si = STATUS_INFO[inv.status];
                            const SIcon = si.icon;
                            return (_jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center", children: _jsx(FileText, { size: 16, className: "text-[#FFE500]" }) }), _jsxs("div", { children: [_jsxs("p", { className: "text-white text-sm font-bold", children: ["NF-e ", inv.number || '—', " (S\u00E9rie ", inv.series, ")"] }), _jsxs("p", { className: `text-xs ${si.color} flex items-center gap-1`, children: [_jsx(SIcon, { size: 11 }), " ", si.label, inv.issued_at && ` — ${new Date(inv.issued_at).toLocaleDateString('pt-BR')}`] }), inv.rejection_reason && _jsx("p", { className: "text-red-400 text-xs mt-0.5", children: inv.rejection_reason })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: "text-sm font-bold text-white", children: ["R$ ", inv.total.toFixed(2)] }), _jsx("button", { onClick: () => setShowInvoiceModal(inv), className: "text-zinc-400 hover:text-[#FFE500] p-1", children: _jsx(Eye, { size: 16 }) })] })] }, inv.id));
                        }) }))] }), showInvoiceModal && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm", onClick: () => setShowInvoiceModal(null), children: _jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-6", onClick: e => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h3", { className: "text-white font-bold text-lg", children: "Detalhes da NF-e" }), _jsx("button", { onClick: () => setShowInvoiceModal(null), className: "text-zinc-400 hover:text-white", children: _jsx(X, { size: 20 }) })] }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-zinc-400", children: "N\u00FAmero:" }), _jsx("span", { className: "text-white font-bold", children: showInvoiceModal.number || '—' })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-zinc-400", children: "S\u00E9rie:" }), _jsx("span", { className: "text-white", children: showInvoiceModal.series })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-zinc-400", children: "Status:" }), _jsx("span", { className: STATUS_INFO[showInvoiceModal.status].color, children: STATUS_INFO[showInvoiceModal.status].label })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-zinc-400", children: "Total:" }), _jsxs("span", { className: "text-white font-bold", children: ["R$ ", showInvoiceModal.total.toFixed(2)] })] }), showInvoiceModal.sefaz_protocol && _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-zinc-400", children: "Protocolo SEFAZ:" }), _jsx("span", { className: "text-white text-xs", children: showInvoiceModal.sefaz_protocol })] }), showInvoiceModal.rejection_reason && _jsxs("div", { children: [_jsx("span", { className: "text-zinc-400", children: "Motivo rejei\u00E7\u00E3o:" }), _jsx("p", { className: "text-red-400 mt-1", children: showInvoiceModal.rejection_reason })] }), showInvoiceModal.issued_at && _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-zinc-400", children: "Emitida em:" }), _jsx("span", { className: "text-white", children: new Date(showInvoiceModal.issued_at).toLocaleString('pt-BR') })] })] })] }) }))] }));
}
