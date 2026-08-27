import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { supabase } from '/app/lib/supabase.js';
import { X, Mail, Phone, User, Eye, EyeOff, Plus, Trash2, RefreshCw, AlertTriangle, Upload, ExternalLink, KeyRound } from 'lucide-react';
export default function ManageFranchiseModal({ franchise, onClose, onUpdate }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateUser, setShowCreateUser] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [logoFile, setLogoFile] = useState(null);
    const [logoUrl, setLogoUrl] = useState(franchise.logo_url ?? '');
    const [savingLogo, setSavingLogo] = useState(false);
    const [logoFeedback, setLogoFeedback] = useState(null);
    const [resettingUserId, setResettingUserId] = useState(null);
    const [viewingUserId, setViewingUserId] = useState(null);
    const [temporaryPassword, setTemporaryPassword] = useState(null);
    const loadUsers = async () => {
        const { data, error } = await supabase
            .from('franchise_users')
            .select('*')
            .eq('franchise_id', franchise.id)
            .order('created_at', { ascending: true });
        if (!error && data)
            setUsers(data);
        setLoading(false);
    };
    useEffect(() => { loadUsers(); }, [franchise.id]);
    const handleCreateUser = async (e) => {
        e.preventDefault();
        setCreating(true);
        setError('');
        try {
            const { data: fnData, error: fnError } = await supabase.functions.invoke('create-franchise-user', {
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
        const { error: uploadError } = await supabase.storage.from('franchise-products').upload(path, logoFile, { upsert: true });
        if (uploadError) {
            setLogoFeedback({ type: 'error', msg: 'Erro ao enviar imagem: ' + uploadError.message });
            setSavingLogo(false);
            return;
        }
        const publicUrl = supabase.storage.from('franchise-products').getPublicUrl(path).data.publicUrl + `?t=${Date.now()}`;
        const { error: dbError } = await supabase.from('franchises').update({ logo_url: publicUrl }).eq('id', franchise.id);
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
            await supabase.functions.invoke('create-franchise-user', {
                body: { action: 'delete_user', user_id: u.auth_user_id },
            });
        }
        await supabase.from('franchise_users').delete().eq('id', u.id);
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
            const { data, error: functionError } = await supabase.functions.invoke('create-franchise-user', {
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
            const { data, error: functionError } = await supabase.functions.invoke('create-franchise-user', {
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
                await supabase.functions.invoke('create-franchise-user', {
                    body: { action: 'delete_user', user_id: u.auth_user_id },
                });
            }
        }
        await supabase.from('franchises').delete().eq('id', franchise.id);
        setDeleting(false);
        onUpdate();
        onClose();
    };
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm", onClick: onClose, children: _jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto", onClick: e => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center justify-between p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-lg bg-[#FFE500]/10 flex items-center justify-center", children: _jsx(User, { size: 20, className: "text-[#FFE500]" }) }), _jsxs("div", { children: [_jsx("h2", { className: "font-bold text-white text-lg", children: franchise.name }), _jsx("p", { className: "text-zinc-500 text-xs", children: "Gerenciar acesso da franquia" })] })] }), _jsx("button", { onClick: onClose, className: "text-zinc-400 hover:text-white transition-colors", children: _jsx(X, { size: 22 }) })] }), _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "bg-zinc-800/50 rounded-lg p-4 mb-6 grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-zinc-500 text-xs", children: "Status" }), _jsx("span", { className: `text-sm font-medium ${franchise.status === 'active' ? 'text-green-400' : 'text-red-400'}`, children: franchise.status === 'active' ? 'Ativa' : 'Inativa' })] }), _jsxs("div", { children: [_jsx("p", { className: "text-zinc-500 text-xs", children: "Criada em" }), _jsx("p", { className: "text-white text-sm", children: new Date(franchise.created_at).toLocaleDateString('pt-BR') })] })] }), _jsxs("div", { className: "bg-zinc-800/50 rounded-lg p-4 mb-6", children: [_jsxs("div", { className: "flex items-center gap-3 mb-3", children: [logoUrl ? _jsx("img", { src: logoUrl, alt: "Logo da loja", className: "w-12 h-12 rounded-lg object-contain bg-[#FFE500]" }) : _jsx("div", { className: "w-12 h-12 rounded-lg bg-[#FFE500]/10 flex items-center justify-center", children: _jsx(User, { size: 20, className: "text-[#FFE500]" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-white text-sm font-bold", children: "Logo da loja" }), _jsx("p", { className: "text-zinc-500 text-xs", children: "Ela aparecer\u00E1 no link p\u00FAblico da loja." })] })] }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsxs("label", { className: "bg-zinc-900 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-sm rounded-lg px-3 py-2 flex items-center gap-2 cursor-pointer", children: [_jsx(Upload, { size: 14 }), logoFile ? logoFile.name : 'Escolher logo', _jsx("input", { type: "file", accept: "image/png,image/jpeg,image/webp", className: "hidden", onChange: e => setLogoFile(e.target.files?.[0] ?? null) })] }), _jsx("button", { onClick: handleSaveLogo, disabled: !logoFile || savingLogo, className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-3 py-2 disabled:opacity-50", children: savingLogo ? 'Salvando...' : 'Salvar logo' }), _jsxs("a", { href: `/loja/${franchise.slug}`, target: "_blank", rel: "noreferrer", className: "bg-zinc-900 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-sm rounded-lg px-3 py-2 flex items-center gap-2", children: [_jsx(ExternalLink, { size: 14 }), "Abrir link da loja"] })] }), logoFeedback && _jsx("div", { className: `mt-3 text-xs font-medium rounded-lg px-3 py-2 ${logoFeedback.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`, children: logoFeedback.msg })] }), _jsxs("div", { className: "border border-red-500/20 rounded-lg p-4 mb-6", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(AlertTriangle, { size: 16, className: "text-red-400" }), _jsx("p", { className: "text-red-400 text-sm font-bold", children: "Zona de exclus\u00E3o" })] }), _jsx("p", { className: "text-zinc-400 text-xs mb-3", children: "Excluir a franquia remove permanentemente todos os dados vinculados (usu\u00E1rios, produtos, pedidos, financeiro, etc). Esta a\u00E7\u00E3o n\u00E3o pode ser desfeita." }), !showDeleteConfirm ? (_jsx("button", { onClick: () => setShowDeleteConfirm(true), className: "bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-bold rounded-lg px-4 py-2 transition-colors", children: "Excluir franquia" })) : (_jsxs("div", { className: "space-y-2", children: [_jsx("p", { className: "text-white text-sm font-bold", children: "Tem certeza? Digite o nome da franquia para confirmar:" }), _jsx("input", { type: "text", placeholder: franchise.name, onKeyDown: e => { if (e.key === 'Enter' && e.target.value === franchise.name)
                                                handleDeleteFranchise(); }, className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: handleDeleteFranchise, disabled: deleting, className: "bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-lg px-4 py-2 transition-colors disabled:opacity-50", children: deleting ? 'Excluindo...' : 'Confirmar exclusão' }), _jsx("button", { onClick: () => setShowDeleteConfirm(false), className: "bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors", children: "Cancelar" })] })] }))] }), _jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h3", { className: "text-white font-bold", children: "Usu\u00E1rios com acesso" }), _jsxs("button", { onClick: () => setShowCreateUser(!showCreateUser), className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 flex items-center gap-1.5 transition-all", children: [_jsx(Plus, { size: 16 }), "Novo Usu\u00E1rio"] })] }), showCreateUser && (_jsxs("form", { onSubmit: handleCreateUser, className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 mb-4 space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Nome completo" }), _jsx("input", { type: "text", value: name, onChange: e => setName(e.target.value), required: true, className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500] transition-colors" })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "E-mail" }), _jsx("input", { type: "email", value: email, onChange: e => setEmail(e.target.value), required: true, className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500] transition-colors" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Telefone" }), _jsx("input", { type: "tel", value: phone, onChange: e => setPhone(e.target.value), placeholder: "(00) 00000-0000", className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500] transition-colors" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Senha" }), _jsxs("div", { className: "relative", children: [_jsx("input", { type: showPass ? 'text' : 'password', value: password, onChange: e => setPassword(e.target.value), required: true, minLength: 6, className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:border-[#FFE500] transition-colors" }), _jsx("button", { type: "button", onClick: () => setShowPass(!showPass), className: "absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white", children: showPass ? _jsx(EyeOff, { size: 16 }) : _jsx(Eye, { size: 16 }) })] })] }), error && _jsx("p", { className: "text-red-400 text-xs", children: error }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { type: "submit", disabled: creating, className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 transition-all disabled:opacity-50", children: creating ? 'Criando...' : 'Criar acesso' }), _jsx("button", { type: "button", onClick: () => setShowCreateUser(false), className: "bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors", children: "Cancelar" })] })] })), error && _jsx("p", { className: "text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 mb-3", children: error }), loading ? (_jsx("div", { className: "flex justify-center py-8", children: _jsx("div", { className: "w-6 h-6 border-2 border-zinc-700 border-t-[#FFE500] rounded-full animate-spin" }) })) : users.length === 0 ? (_jsx("div", { className: "text-center py-8 text-zinc-500 text-sm", children: "Nenhum usu\u00E1rio com acesso ainda. Crie o primeiro acima." })) : (_jsx("div", { className: "space-y-3", children: users.map(u => (_jsxs("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 space-y-3", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-full bg-[#FFE500]/10 flex items-center justify-center text-[#FFE500] font-bold", children: u.name.charAt(0).toUpperCase() }), _jsxs("div", { children: [_jsx("p", { className: "text-white font-medium", children: u.name }), _jsxs("p", { className: "text-zinc-400 text-xs flex items-center gap-1 mt-0.5", children: [_jsx(Mail, { size: 12 }), " ", u.email] }), u.phone && _jsxs("p", { className: "text-zinc-500 text-xs flex items-center gap-1", children: [_jsx(Phone, { size: 12 }), " ", u.phone] })] })] }), _jsx("button", { onClick: () => handleDeleteUser(u), className: "text-zinc-500 hover:text-red-400 p-1.5 transition-colors", title: "Remover acesso", children: _jsx(Trash2, { size: 16 }) })] }), temporaryPassword?.userId === u.id ? (_jsxs("div", { className: "rounded-lg border border-green-500/30 bg-green-500/10 p-3 space-y-2", children: [_jsx("p", { className: "text-green-300 text-sm font-bold", children: "Credenciais de acesso" }), _jsxs("div", { className: "bg-black/30 rounded-lg p-3 space-y-1", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-zinc-400 text-xs", children: "E-mail" }), _jsx("button", { onClick: () => navigator.clipboard.writeText(u.email), className: "text-[10px] text-zinc-500 hover:text-white", children: "Copiar" })] }), _jsx("p", { className: "text-white font-mono text-sm select-all", children: u.email }), _jsxs("div", { className: "flex items-center justify-between mt-2", children: [_jsx("span", { className: "text-zinc-400 text-xs", children: "Senha" }), _jsx("button", { onClick: () => navigator.clipboard.writeText(temporaryPassword.password), className: "text-[10px] text-zinc-500 hover:text-white", children: "Copiar" })] }), _jsx("p", { className: "text-[#FFE500] font-mono text-lg font-bold select-all tracking-wider", children: temporaryPassword.password })] }), _jsx("p", { className: "text-zinc-400 text-[11px]", children: "Copie e passe ao franqueado." })] })) : (_jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => handleViewCredentials(u), disabled: viewingUserId === u.id, className: "flex-1 flex items-center justify-center gap-2 bg-zinc-700/50 hover:bg-zinc-700 text-zinc-300 hover:text-white text-sm font-medium rounded-lg py-2.5 transition-colors disabled:opacity-50", children: viewingUserId === u.id ? (_jsxs(_Fragment, { children: [_jsx(RefreshCw, { size: 14, className: "animate-spin" }), "Carregando..."] })) : (_jsxs(_Fragment, { children: [_jsx(Eye, { size: 14 }), "Ver credenciais"] })) }), _jsx("button", { onClick: () => handleResetPassword(u), disabled: resettingUserId === u.id, className: "flex items-center justify-center gap-2 bg-zinc-700/50 hover:bg-zinc-700 text-zinc-300 hover:text-white text-sm font-medium rounded-lg py-2.5 px-3 transition-colors disabled:opacity-50", title: "Gerar nova senha", children: resettingUserId === u.id ? (_jsx(RefreshCw, { size: 14, className: "animate-spin" })) : (_jsx(KeyRound, { size: 14 })) })] }))] }, u.id))) }))] })] }) }));
}
