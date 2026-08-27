import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { supabase } from '/app/lib/supabase.js';
import { Plug, Save, Plus, Trash2, RefreshCw, CheckCircle2, AlertCircle, Bike, Store, Link2, Unlink, Settings2, ChevronDown, ChevronUp, Upload } from 'lucide-react';
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
export default function FranchiseeIntegrations({ franchiseId }) {
    const [integrations, setIntegrations] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(null);
    const [expandedLog, setExpandedLog] = useState(null);
    const [syncing, setSyncing] = useState(false);
    const [syncResult, setSyncResult] = useState(null);
    const load = async () => {
        const [{ data: intData }, { data: logData }] = await Promise.all([
            supabase.from('delivery_integrations').select('*').eq('franchise_id', franchiseId).order('platform', { ascending: true }),
            supabase.from('delivery_sync_logs').select('*, delivery_integrations!inner(platform)').order('created_at', { ascending: false }).limit(50),
        ]);
        if (intData)
            setIntegrations(intData);
        if (logData)
            setLogs(logData);
        setLoading(false);
    };
    useEffect(() => { load(); }, [franchiseId]);
    const handleAdd = async (platform) => {
        await supabase.from('delivery_integrations').insert({
            franchise_id: franchiseId,
            platform,
            enabled: false,
            sync_status: 'disconnected',
        });
        load();
    };
    const handleSave = async (integ) => {
        setSaving(integ.id);
        await supabase.from('delivery_integrations').update({
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
        await supabase.from('delivery_integrations').update({
            enabled: newEnabled,
            sync_status: newStatus,
            updated_at: new Date().toISOString(),
        }).eq('id', integ.id);
        load();
    };
    const handleDelete = async (integ) => {
        if (!confirm(`Remover a integração com ${PLATFORMS.find(p => p.value === integ.platform)?.label}?`))
            return;
        await supabase.from('delivery_integrations').delete().eq('id', integ.id);
        load();
    };
    const callEdgeFunction = async (action, integrationId) => {
        const apiUrl = `${"https://sgvojdgbjvynnoherpqj.supabase.co"}/functions/v1/delivery-sync`;
        const { data: session } = await supabase.auth.getSession();
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
        return _jsx("div", { className: "flex justify-center py-12", children: _jsx("div", { className: "w-6 h-6 border-2 border-zinc-700 border-t-[#FFE500] rounded-full animate-spin" }) });
    }
    const availablePlatforms = PLATFORMS.filter(p => !integrations.some(i => i.platform === p.value));
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("h3", { className: "text-white font-bold text-lg flex items-center gap-2", children: [_jsx(Plug, { size: 20, className: "text-[#FFE500]" }), " Integra\u00E7\u00F5es de Entrega"] }), availablePlatforms.length > 0 && (_jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-4", children: [_jsx("h4", { className: "text-white font-bold text-sm mb-3", children: "Adicionar Plataforma" }), _jsx("div", { className: "flex flex-wrap gap-2", children: availablePlatforms.map(p => (_jsxs("button", { onClick: () => handleAdd(p.value), className: "bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-lg px-4 py-2 flex items-center gap-2 transition-colors border border-zinc-700", children: [_jsx(Plus, { size: 14 }), " ", p.label] }, p.value))) })] })), integrations.length === 0 ? (_jsxs("div", { className: "text-center py-12 bg-zinc-900 border border-zinc-800 rounded-xl", children: [_jsx(Bike, { size: 40, className: "mx-auto text-zinc-700 mb-3" }), _jsx("p", { className: "text-zinc-400 text-sm", children: "Nenhuma integra\u00E7\u00E3o configurada. Adicione uma plataforma acima." })] })) : (_jsx("div", { className: "space-y-4", children: integrations.map(integ => {
                    const platform = PLATFORMS.find(p => p.value === integ.platform);
                    const si = SYNC_STATUS_INFO[integ.sync_status];
                    return (_jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: `w-10 h-10 rounded-lg ${platform.color} flex items-center justify-center`, children: _jsx(Store, { size: 18, className: "text-white" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-white font-bold text-sm", children: platform.label }), _jsxs("div", { className: "flex items-center gap-1.5 mt-0.5", children: [_jsx("div", { className: `w-2 h-2 rounded-full ${si.dot} ${integ.sync_status === 'syncing' ? 'animate-pulse' : ''}` }), _jsx("span", { className: `text-xs ${si.color}`, children: si.label }), integ.last_sync_at && _jsxs("span", { className: "text-zinc-500 text-xs", children: ["\u2014 \u00FAltima sync: ", new Date(integ.last_sync_at).toLocaleString('pt-BR')] })] })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { onClick: () => handleTest(integ), disabled: syncing, className: "text-zinc-400 hover:text-green-400 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-30", title: "Testar conex\u00E3o", children: _jsx(Plug, { size: 16 }) }), _jsx("button", { onClick: () => handleSyncMenu(integ), disabled: syncing, className: "text-zinc-400 hover:text-blue-400 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-30", title: "Sincronizar card\u00E1pio (categorias, produtos, grupos e adicionais)", children: _jsx(Upload, { size: 16 }) }), _jsx("button", { onClick: () => handleSync(integ), disabled: syncing, className: "text-zinc-400 hover:text-[#FFE500] p-1.5 rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-30", title: "Sincronizar pedidos agora", children: _jsx(RefreshCw, { size: 16, className: syncing ? 'animate-spin' : '' }) }), _jsx("button", { onClick: () => handleToggle(integ), className: `text-sm font-bold rounded-lg px-3 py-1.5 flex items-center gap-1.5 transition-all ${integ.enabled ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`, children: integ.enabled ? _jsxs(_Fragment, { children: [_jsx(Link2, { size: 14 }), " Ativado"] }) : _jsxs(_Fragment, { children: [_jsx(Unlink, { size: 14 }), " Ativar"] }) }), _jsx("button", { onClick: () => handleDelete(integ), className: "text-zinc-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors", children: _jsx(Trash2, { size: 16 }) })] })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Client ID" }), _jsx("input", { type: "text", value: integ.client_id, onChange: e => setIntegrations(integrations.map(i => i.id === integ.id ? { ...i, client_id: e.target.value } : i)), className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Client Secret" }), _jsx("input", { type: "password", value: integ.client_secret, onChange: e => setIntegrations(integrations.map(i => i.id === integ.id ? { ...i, client_secret: e.target.value } : i)), className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Store / Merchant ID" }), _jsx("input", { type: "text", value: integ.store_id, onChange: e => setIntegrations(integrations.map(i => i.id === integ.id ? { ...i, store_id: e.target.value } : i)), className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] })] }), integ.platform === 'ifood' && integ.enabled && (_jsxs("div", { className: "bg-zinc-800/40 border border-zinc-700/50 rounded-lg p-3", children: [_jsx("p", { className: "text-zinc-300 text-xs font-medium mb-1", children: "URL do Webhook (configure no portal do iFood):" }), _jsxs("code", { className: "text-[#FFE500] text-xs break-all", children: ["https://sgvojdgbjvynnoherpqj.supabase.co", "/functions/v1/delivery-sync?action=webhook"] }), _jsx("p", { className: "text-zinc-500 text-xs mt-1", children: "Aponte os webhooks de pedido do iFood para esta URL para receber pedidos em tempo real." })] })), _jsxs("div", { className: "flex flex-wrap gap-4", children: [_jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: integ.auto_accept_orders, onChange: e => setIntegrations(integrations.map(i => i.id === integ.id ? { ...i, auto_accept_orders: e.target.checked } : i)), className: "w-4 h-4 accent-[#FFE500]" }), _jsx("span", { className: "text-zinc-300 text-sm", children: "Aceitar pedidos automaticamente" })] }), _jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: integ.sync_menu, onChange: e => setIntegrations(integrations.map(i => i.id === integ.id ? { ...i, sync_menu: e.target.checked } : i)), className: "w-4 h-4 accent-[#FFE500]" }), _jsx("span", { className: "text-zinc-300 text-sm", children: "Sincronizar card\u00E1pio" })] })] }), integ.error_message && (_jsxs("div", { className: "bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-2", children: [_jsx(AlertCircle, { size: 16, className: "text-red-400 mt-0.5 flex-shrink-0" }), _jsx("p", { className: "text-red-400 text-xs", children: integ.error_message })] })), syncResult && (_jsxs("div", { className: `rounded-lg p-3 flex items-start gap-2 ${syncResult.ok ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`, children: [syncResult.ok ? _jsx(CheckCircle2, { size: 16, className: "text-green-400 mt-0.5 flex-shrink-0" }) : _jsx(AlertCircle, { size: 16, className: "text-red-400 mt-0.5 flex-shrink-0" }), _jsx("p", { className: `text-xs ${syncResult.ok ? 'text-green-400' : 'text-red-400'}`, children: syncResult.message })] })), _jsxs("button", { onClick: () => handleSave(integ), disabled: saving === integ.id, className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 flex items-center gap-2 transition-all disabled:opacity-50", children: [saving === integ.id ? _jsx("div", { className: "w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" }) : _jsx(Save, { size: 14 }), "Salvar"] })] }, integ.id));
                }) })), logs.length > 0 && (_jsxs("div", { children: [_jsxs("h4", { className: "text-white font-bold text-sm mb-3 flex items-center gap-2", children: [_jsx(Settings2, { size: 16, className: "text-[#FFE500]" }), " Hist\u00F3rico de Sincroniza\u00E7\u00E3o"] }), _jsx("div", { className: "space-y-1.5", children: logs.map(log => (_jsxs("div", { children: [_jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 flex items-center justify-between cursor-pointer hover:border-zinc-700", onClick: () => setExpandedLog(expandedLog === log.id ? null : log.id), children: [_jsxs("div", { className: "flex items-center gap-2", children: [log.status === 'success' ? _jsx(CheckCircle2, { size: 14, className: "text-green-400" }) : _jsx(AlertCircle, { size: 14, className: "text-red-400" }), _jsx("span", { className: "text-white text-xs font-medium", children: log.action.replace(/_/g, ' ') }), log.platform_order_id && _jsxs("span", { className: "text-zinc-500 text-xs", children: ["#", log.platform_order_id] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-zinc-500 text-xs", children: new Date(log.created_at).toLocaleString('pt-BR') }), expandedLog === log.id ? _jsx(ChevronUp, { size: 14, className: "text-zinc-500" }) : _jsx(ChevronDown, { size: 14, className: "text-zinc-500" })] })] }), expandedLog === log.id && (_jsxs("div", { className: "bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 mt-1", children: [log.message && _jsx("p", { className: "text-zinc-300 text-xs mb-2", children: log.message }), _jsx("pre", { className: "text-zinc-500 text-xs overflow-x-auto", children: JSON.stringify(log.payload, null, 2) })] }))] }, log.id))) })] }))] }));
}
