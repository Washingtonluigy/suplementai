import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { supabase } from '/app/lib/supabase.js';
import { X, Store, ArrowRight, ArrowLeft } from 'lucide-react';
function slugify(text) {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
export default function CreateFranchiseModal({ onClose, onCreated }) {
    const [step, setStep] = useState(1);
    const [franchiseName, setFranchiseName] = useState('');
    const [userName, setUserName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [createdCredentials, setCreatedCredentials] = useState(null);
    const handleCreate = async () => {
        setLoading(true);
        setError('');
        try {
            const { data: franData, error: franError } = await supabase
                .from('franchises')
                .insert({ name: franchiseName, slug: slugify(franchiseName) })
                .select()
                .single();
            if (franError || !franData) {
                setError('Erro ao criar franquia: ' + (franError?.message || ''));
                setLoading(false);
                return;
            }
            const { data: fnData, error: fnError } = await supabase.functions.invoke('create-franchise-user', {
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
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm", onClick: onClose, children: _jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto", onClick: e => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center justify-between p-6 border-b border-zinc-800", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-lg bg-[#FFE500]/10 flex items-center justify-center", children: _jsx(Store, { size: 20, className: "text-[#FFE500]" }) }), _jsxs("div", { children: [_jsx("h2", { className: "font-bold text-white text-lg", children: "Nova Franquia" }), _jsxs("p", { className: "text-zinc-500 text-xs", children: ["Passo ", step, " de 2"] })] })] }), _jsx("button", { onClick: onClose, className: "text-zinc-400 hover:text-white transition-colors", children: _jsx(X, { size: 22 }) })] }), _jsx("div", { className: "px-6 pt-4", children: _jsxs("div", { className: "flex gap-2", children: [_jsx("div", { className: `h-1.5 flex-1 rounded-full transition-colors ${step >= 1 ? 'bg-[#FFE500]' : 'bg-zinc-800'}` }), _jsx("div", { className: `h-1.5 flex-1 rounded-full transition-colors ${step >= 2 ? 'bg-[#FFE500]' : 'bg-zinc-800'}` })] }) }), _jsxs("div", { className: "p-6", children: [createdCredentials ? (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "rounded-xl border border-green-500/30 bg-green-500/10 p-4", children: [_jsx("h3", { className: "text-green-300 font-bold", children: "Franquia criada" }), _jsx("p", { className: "text-zinc-300 text-sm mt-1", children: "Copie estes dados e entregue ao franqueado. Voc\u00EA tamb\u00E9m poder\u00E1 visualiz\u00E1-los depois em \"Ver credenciais\"." })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("p", { className: "text-zinc-500 text-xs", children: "E-mail" }), _jsx("p", { className: "text-white font-medium select-all", children: createdCredentials.email })] }), _jsxs("div", { children: [_jsx("p", { className: "text-zinc-500 text-xs", children: "Senha criada" }), _jsx("p", { className: "text-white font-medium select-all", children: createdCredentials.password })] })] }), _jsx("button", { onClick: onClose, className: "w-full bg-[#FFE500] hover:bg-[#FFD000] text-black font-bold rounded-lg py-3", children: "Concluir" })] })) : step === 1 && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-white font-bold mb-1", children: "Dados da franquia" }), _jsx("p", { className: "text-zinc-400 text-sm mb-4", children: "D\u00EA um nome \u00E0 nova unidade." })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-sm font-medium mb-1.5", children: "Nome da franquia" }), _jsx("input", { type: "text", value: franchiseName, onChange: e => setFranchiseName(e.target.value), placeholder: "Ex: Suplementaai - Centro", autoFocus: true, className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-3 text-sm placeholder-zinc-500 focus:outline-none focus:border-[#FFE500] transition-colors" })] }), _jsxs("button", { onClick: () => setStep(2), disabled: !franchiseName.trim(), className: "w-full bg-[#FFE500] hover:bg-[#FFD000] text-black font-bold rounded-lg py-3 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed", children: ["Avan\u00E7ar", _jsx(ArrowRight, { size: 18 })] })] })), step === 2 && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-white font-bold mb-1", children: "Dados do franqueado" }), _jsx("p", { className: "text-zinc-400 text-sm mb-4", children: "Crie o acesso que ser\u00E1 entregue ao respons\u00E1vel." })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-sm font-medium mb-1.5", children: "Nome completo" }), _jsx("input", { type: "text", value: userName, onChange: e => setUserName(e.target.value), placeholder: "Nome do respons\u00E1vel", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-3 text-sm placeholder-zinc-500 focus:outline-none focus:border-[#FFE500] transition-colors" })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-sm font-medium mb-1.5", children: "E-mail" }), _jsx("input", { type: "email", value: email, onChange: e => setEmail(e.target.value), placeholder: "email@exemplo.com", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-3 text-sm placeholder-zinc-500 focus:outline-none focus:border-[#FFE500] transition-colors" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-sm font-medium mb-1.5", children: "Telefone" }), _jsx("input", { type: "tel", value: phone, onChange: e => setPhone(e.target.value), placeholder: "(00) 00000-0000", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-3 text-sm placeholder-zinc-500 focus:outline-none focus:border-[#FFE500] transition-colors" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-sm font-medium mb-1.5", children: "Senha" }), _jsxs("div", { className: "relative", children: [_jsx("input", { type: showPass ? 'text' : 'password', value: password, onChange: e => setPassword(e.target.value), placeholder: "M\u00EDnimo 6 caracteres", minLength: 6, className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-3 pr-12 text-sm placeholder-zinc-500 focus:outline-none focus:border-[#FFE500] transition-colors" }), _jsx("button", { type: "button", onClick: () => setShowPass(!showPass), className: "absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white", children: showPass ? '🙈' : '👁' })] })] }), error && _jsx("p", { className: "text-red-400 text-sm", children: error }), _jsxs("div", { className: "flex gap-3", children: [_jsxs("button", { onClick: () => setStep(1), className: "bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg py-3 px-5 flex items-center gap-2 transition-colors", children: [_jsx(ArrowLeft, { size: 18 }), "Voltar"] }), _jsx("button", { onClick: handleCreate, disabled: !userName.trim() || !email.trim() || !password.trim() || loading, className: "flex-1 bg-[#FFE500] hover:bg-[#FFD000] text-black font-bold rounded-lg py-3 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed", children: loading ? (_jsx("div", { className: "w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" })) : ('Criar franquia') })] })] }))] })] }) }));
}
