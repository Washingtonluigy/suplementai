import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { supabase } from '/app/lib/supabase.js';
import { DollarSign, Copy, Check, Upload, Eye, AlertCircle } from 'lucide-react';
export default function FranchiseeFees({ franchiseId }) {
    const [fees, setFees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copiedPix, setCopiedPix] = useState(null);
    const [uploadingId, setUploadingId] = useState(null);
    const load = async () => {
        const { data } = await supabase
            .from('monthly_fees')
            .select('*')
            .eq('franchise_id', franchiseId)
            .order('due_date', { ascending: false });
        if (data)
            setFees(data);
        setLoading(false);
    };
    useEffect(() => { load(); }, [franchiseId]);
    const copyPix = (key) => {
        navigator.clipboard.writeText(key);
        setCopiedPix(key);
        setTimeout(() => setCopiedPix(null), 2000);
    };
    const handleUploadProof = async (fee, file) => {
        setUploadingId(fee.id);
        const ext = file.name.split('.').pop();
        const path = `${fee.id}.${ext}`;
        const { error } = await supabase.storage.from('fee-proofs').upload(path, file, { upsert: true });
        if (!error) {
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
    const statusColor = (s) => {
        if (s === 'paid')
            return 'bg-green-500/10 text-green-400';
        if (s === 'overdue')
            return 'bg-red-500/10 text-red-400';
        return 'bg-yellow-500/10 text-yellow-400';
    };
    const statusLabel = (s) => s === 'paid' ? 'Paga' : s === 'overdue' ? 'Vencida' : 'Pendente';
    if (loading) {
        return _jsx("div", { className: "flex justify-center py-12", children: _jsx("div", { className: "w-6 h-6 border-2 border-zinc-700 border-t-[#FFE500] rounded-full animate-spin" }) });
    }
    if (fees.length === 0) {
        return (_jsxs("div", { className: "text-center py-12", children: [_jsx(DollarSign, { size: 40, className: "mx-auto text-zinc-700 mb-3" }), _jsx("p", { className: "text-zinc-400 text-sm", children: "Nenhuma mensalidade no momento." })] }));
    }
    return (_jsx("div", { className: "space-y-3", children: fees.map(fee => (_jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-5", children: [_jsxs("div", { className: "flex items-start justify-between mb-3", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx("h4", { className: "text-white font-bold", children: fee.description }), _jsx("span", { className: `text-xs px-2 py-0.5 rounded-full ${statusColor(fee.status)}`, children: statusLabel(fee.status) })] }), _jsxs("p", { className: "text-zinc-500 text-xs", children: ["Vencimento: ", new Date(fee.due_date).toLocaleDateString('pt-BR')] })] }), _jsxs("p", { className: "text-[#FFE500] font-bold text-xl", children: ["R$ ", fee.amount.toFixed(2)] })] }), fee.pix_key && fee.status !== 'paid' && (_jsxs("div", { className: "flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 mb-3", children: [_jsx("span", { className: "text-zinc-500 text-xs", children: "Chave PIX:" }), _jsx("span", { className: "text-white text-sm flex-1 truncate", children: fee.pix_key }), _jsx("button", { onClick: () => copyPix(fee.pix_key), className: "text-zinc-400 hover:text-[#FFE500] transition-colors", children: copiedPix === fee.pix_key ? _jsx(Check, { size: 16, className: "text-green-400" }) : _jsx(Copy, { size: 16 }) })] })), fee.status === 'overdue' && (_jsxs("div", { className: "flex items-center gap-2 text-red-400 text-xs mb-3", children: [_jsx(AlertCircle, { size: 14 }), " Mensalidade vencida \u2014 regularize para evitar bloqueio da loja."] })), fee.proof_file_url ? (_jsx("div", { className: "flex items-center gap-2", children: _jsxs("a", { href: fee.proof_file_url, target: "_blank", rel: "noopener noreferrer", className: "flex items-center gap-1.5 text-green-400 text-sm hover:text-green-300 transition-colors", children: [_jsx(Eye, { size: 16 }), " Ver comprovante enviado"] }) })) : fee.status !== 'paid' && (_jsxs("label", { className: "inline-flex items-center gap-1.5 bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 cursor-pointer transition-all", children: [uploadingId === fee.id ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" }), " Enviando..."] })) : (_jsxs(_Fragment, { children: [_jsx(Upload, { size: 16 }), " Enviar comprovante"] })), _jsx("input", { type: "file", accept: "image/*,.pdf", className: "hidden", onChange: e => e.target.files?.[0] && handleUploadProof(fee, e.target.files[0]) })] }))] }, fee.id))) }));
}
