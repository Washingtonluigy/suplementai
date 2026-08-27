import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { supabase } from '/app/lib/supabase.js';
import { X, Plus, Trash2, DollarSign, Search, Copy, Check, Upload, Eye } from 'lucide-react';
export default function MonthlyFeesTool({ onClose }) {
    const [fees, setFees] = useState([]);
    const [franchises, setFranchises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [search, setSearch] = useState('');
    const [copiedPix, setCopiedPix] = useState(null);
    const [form, setForm] = useState({
        franchise_id: '',
        description: 'Mensalidade',
        amount: '',
        due_date: '',
        pix_key: '',
    });
    const [saving, setSaving] = useState(false);
    const [proofFile, setProofFile] = useState(null);
    const [uploadingId, setUploadingId] = useState(null);
    const load = async () => {
        const [{ data: feeData }, { data: franData }] = await Promise.all([
            supabase.from('monthly_fees').select('*').order('due_date', { ascending: false }),
            supabase.from('franchises').select('*').order('name'),
        ]);
        if (feeData)
            setFees(feeData);
        if (franData)
            setFranchises(franData);
        setLoading(false);
    };
    useEffect(() => { load(); }, []);
    const handleCreate = async (e) => {
        e.preventDefault();
        setSaving(true);
        const { error } = await supabase.from('monthly_fees').insert({
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
        await supabase.from('monthly_fees').delete().eq('id', fee.id);
        load();
    };
    const handleUploadProof = async (fee, file) => {
        setUploadingId(fee.id);
        const ext = file.name.split('.').pop();
        const path = `${fee.id}.${ext}`;
        const { error: upErr } = await supabase.storage.from('fee-proofs').upload(path, file, { upsert: true });
        if (!upErr) {
            const url = supabase.storage.from('fee-proofs').getPublicUrl(path).data.publicUrl;
            await supabase.from('monthly_fees').update({
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
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm", onClick: onClose, children: _jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto", onClick: e => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center justify-between p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-lg bg-[#FFE500]/10 flex items-center justify-center", children: _jsx(DollarSign, { size: 20, className: "text-[#FFE500]" }) }), _jsxs("div", { children: [_jsx("h2", { className: "font-bold text-white text-lg", children: "Mensalidades" }), _jsx("p", { className: "text-zinc-500 text-xs", children: "Gerencie cobran\u00E7as e comprovantes" })] })] }), _jsx("button", { onClick: onClose, className: "text-zinc-400 hover:text-white transition-colors", children: _jsx(X, { size: 22 }) })] }), _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4 gap-3 flex-wrap", children: [_jsxs("div", { className: "relative flex-1 min-w-[200px]", children: [_jsx(Search, { size: 16, className: "absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" }), _jsx("input", { type: "text", value: search, onChange: e => setSearch(e.target.value), placeholder: "Buscar...", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-[#FFE500]/50" })] }), _jsxs("button", { onClick: () => setShowCreate(!showCreate), className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 flex items-center gap-1.5 transition-all", children: [_jsx(Plus, { size: 16 }), " Nova Mensalidade"] })] }), showCreate && (_jsxs("form", { onSubmit: handleCreate, className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 mb-4 space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Franquia" }), _jsxs("select", { value: form.franchise_id, onChange: e => setForm({ ...form, franchise_id: e.target.value }), required: true, className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]", children: [_jsx("option", { value: "", children: "Selecione..." }), franchises.map(f => _jsx("option", { value: f.id, children: f.name }, f.id))] })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Descri\u00E7\u00E3o" }), _jsx("input", { type: "text", value: form.description, onChange: e => setForm({ ...form, description: e.target.value }), required: true, className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Valor (R$)" }), _jsx("input", { type: "number", step: "0.01", value: form.amount, onChange: e => setForm({ ...form, amount: e.target.value }), required: true, className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Vencimento" }), _jsx("input", { type: "date", value: form.due_date, onChange: e => setForm({ ...form, due_date: e.target.value }), required: true, className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Chave PIX" }), _jsx("input", { type: "text", value: form.pix_key, onChange: e => setForm({ ...form, pix_key: e.target.value }), placeholder: "email, telefone, CPF ou aleat\u00F3ria", className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { type: "submit", disabled: saving, className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 transition-all disabled:opacity-50", children: saving ? 'Criando...' : 'Criar mensalidade' }), _jsx("button", { type: "button", onClick: () => setShowCreate(false), className: "bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors", children: "Cancelar" })] })] })), loading ? (_jsx("div", { className: "flex justify-center py-8", children: _jsx("div", { className: "w-6 h-6 border-2 border-zinc-700 border-t-[#FFE500] rounded-full animate-spin" }) })) : filtered.length === 0 ? (_jsxs("div", { className: "text-center py-12", children: [_jsx(DollarSign, { size: 40, className: "mx-auto text-zinc-700 mb-3" }), _jsx("p", { className: "text-zinc-400 text-sm", children: "Nenhuma mensalidade criada ainda." })] })) : (_jsx("div", { className: "space-y-3", children: filtered.map(fee => (_jsxs("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-start justify-between mb-3", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx("h4", { className: "text-white font-bold text-sm", children: franName(fee.franchise_id) }), _jsx("span", { className: `text-xs px-2 py-0.5 rounded-full ${statusColor(fee.status)}`, children: statusLabel(fee.status) })] }), _jsxs("p", { className: "text-zinc-400 text-xs", children: [fee.description, " \u2014 Venc.: ", new Date(fee.due_date).toLocaleDateString('pt-BR')] }), _jsxs("p", { className: "text-[#FFE500] font-bold text-lg mt-1", children: ["R$ ", fee.amount.toFixed(2)] })] }), _jsx("button", { onClick: () => handleDelete(fee), className: "text-zinc-400 hover:text-red-400 p-1.5 transition-colors", children: _jsx(Trash2, { size: 15 }) })] }), fee.pix_key && (_jsxs("div", { className: "flex items-center gap-2 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 mb-3", children: [_jsx("span", { className: "text-zinc-500 text-xs", children: "PIX:" }), _jsx("span", { className: "text-white text-xs flex-1 truncate", children: fee.pix_key }), _jsx("button", { onClick: () => copyPix(fee.pix_key), className: "text-zinc-400 hover:text-[#FFE500] transition-colors", children: copiedPix === fee.pix_key ? _jsx(Check, { size: 14, className: "text-green-400" }) : _jsx(Copy, { size: 14 }) })] })), fee.proof_file_url ? (_jsx("div", { className: "flex items-center gap-2", children: _jsxs("a", { href: fee.proof_file_url, target: "_blank", rel: "noopener noreferrer", className: "flex items-center gap-1.5 text-green-400 text-xs hover:text-green-300 transition-colors", children: [_jsx(Eye, { size: 14 }), " Ver comprovante"] }) })) : (_jsxs("label", { className: "flex items-center gap-1.5 text-zinc-400 text-xs hover:text-[#FFE500] cursor-pointer transition-colors", children: [uploadingId === fee.id ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "w-3 h-3 border-2 border-zinc-600 border-t-[#FFE500] rounded-full animate-spin" }), " Enviando..."] })) : (_jsxs(_Fragment, { children: [_jsx(Upload, { size: 14 }), " Anexar comprovante"] })), _jsx("input", { type: "file", accept: "image/*,.pdf", className: "hidden", onChange: e => e.target.files?.[0] && handleUploadProof(fee, e.target.files[0]) })] }))] }, fee.id))) }))] })] }) }));
}
