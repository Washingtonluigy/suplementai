import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AuthProvider, useAuth } from '/app/contexts/AuthContext.js';
import Login from '/app/pages/Login.js';
import MasterDashboard from '/app/pages/MasterDashboard.js';
import FranchiseeDashboard from '/app/pages/FranchiseeDashboard.js';
import PublicStore from '/app/pages/PublicStore.js';
import EcommerceStorefront from '/app/pages/EcommerceStorefront.js';
function AppContent() {
    const { session, isMaster, franchiseId, loading } = useAuth();
    const isPublicStore = window.location.pathname.startsWith('/loja/');
    const host = window.location.hostname.toLowerCase();
    const isAdminPath = window.location.pathname.startsWith('/admin');
    const isNationalSite = window.location.pathname.startsWith('/site') || (!isAdminPath && (host === 'suplementaai.com.br' || host === 'www.suplementaai.com.br'));
    if (isPublicStore)
        return _jsx(PublicStore, {});
    if (isNationalSite)
        return _jsx(EcommerceStorefront, {});
    if (loading) {
        return (_jsx("div", { className: "min-h-screen bg-black flex items-center justify-center", children: _jsx("div", { className: "w-10 h-10 border-2 border-zinc-700 border-t-[#FFE500] rounded-full animate-spin" }) }));
    }
    if (!session)
        return _jsx(Login, {});
    if (isMaster)
        return _jsx(MasterDashboard, {});
    if (franchiseId)
        return _jsx(FranchiseeDashboard, {});
    return (_jsx("div", { className: "min-h-screen bg-black flex items-center justify-center text-white p-4", children: _jsxs("div", { className: "text-center max-w-sm", children: [_jsx("h2", { className: "text-xl font-bold mb-2", children: "Acesso n\u00E3o vinculado" }), _jsx("p", { className: "text-zinc-400 text-sm", children: "Seu usu\u00E1rio n\u00E3o est\u00E1 vinculado a nenhuma franquia. Entre em contato com o administrador." })] }) }));
}
export default function App() {
    return (_jsx(AuthProvider, { children: _jsx(AppContent, {}) }));
}
