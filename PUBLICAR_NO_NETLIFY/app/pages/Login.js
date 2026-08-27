import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useAuth } from '/app/contexts/AuthContext.js';
import { Eye, EyeOff, LogIn } from 'lucide-react';
export default function Login() {
    const { signIn } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const { error: err } = await signIn(email, password);
        if (err)
            setError('E-mail ou senha incorretos.');
        setLoading(false);
    };
    return (_jsxs("div", { className: "min-h-screen bg-black flex items-center justify-center p-4", children: [_jsxs("div", { className: "absolute inset-0 overflow-hidden", children: [_jsx("div", { className: "absolute -top-40 -right-40 w-96 h-96 bg-[#FFE500]/5 rounded-full blur-3xl" }), _jsx("div", { className: "absolute -bottom-40 -left-40 w-96 h-96 bg-[#FFE500]/5 rounded-full blur-3xl" })] }), _jsxs("div", { className: "relative w-full max-w-md", children: [_jsxs("div", { className: "flex flex-col items-center mb-8", children: [_jsx("div", { className: "w-24 h-24 rounded-2xl overflow-hidden mb-4 border-2 border-[#FFE500]/30", children: _jsx("img", { src: "/assets/logo.png", alt: "Suplementaai", className: "w-full h-full object-contain bg-[#FFE500]" }) }), _jsx("h1", { className: "text-[#FFE500] text-2xl font-black tracking-tight uppercase", children: "Suplementaai" }), _jsx("p", { className: "text-zinc-400 text-sm mt-1", children: "Sistema de Gest\u00E3o de Franquias" })] }), _jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl", children: [_jsx("h2", { className: "text-white text-xl font-bold mb-1", children: "Entrar no sistema" }), _jsx("p", { className: "text-zinc-400 text-sm mb-6", children: "Acesse com suas credenciais" }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-sm font-medium mb-1.5", children: "E-mail" }), _jsx("input", { type: "email", value: email, onChange: e => setEmail(e.target.value), required: true, placeholder: "seu@email.com", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-3 text-sm placeholder-zinc-500 focus:outline-none focus:border-[#FFE500] transition-colors" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-sm font-medium mb-1.5", children: "Senha" }), _jsxs("div", { className: "relative", children: [_jsx("input", { type: showPass ? 'text' : 'password', value: password, onChange: e => setPassword(e.target.value), required: true, placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-3 pr-12 text-sm placeholder-zinc-500 focus:outline-none focus:border-[#FFE500] transition-colors" }), _jsx("button", { type: "button", onClick: () => setShowPass(!showPass), className: "absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors", children: showPass ? _jsx(EyeOff, { size: 18 }) : _jsx(Eye, { size: 18 }) })] })] }), error && (_jsx("div", { className: "bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3", children: error })), _jsx("button", { type: "submit", disabled: loading, className: "w-full bg-[#FFE500] hover:bg-[#FFD000] text-black font-bold rounded-lg py-3 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed", children: loading ? (_jsx("div", { className: "w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" })) : (_jsxs(_Fragment, { children: [_jsx(LogIn, { size: 18 }), "Entrar"] })) })] })] }), _jsx("p", { className: "text-center text-zinc-600 text-xs mt-6", children: "\u00A9 2025 Suplementaai. Todos os direitos reservados." })] })] }));
}
