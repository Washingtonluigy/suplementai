import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { X, Megaphone, DollarSign, Folder, Factory, Trophy, GraduationCap, Layers, BarChart3, Users, Ticket, Globe2, MessageCircle } from 'lucide-react';
import MonthlyFeesTool from './MonthlyFeesTool.js';
import MarketingTool from './MarketingTool.js';
import FactoryOrdersTool from './FactoryOrdersTool.js';
import RankingTool from './RankingTool.js';
import CoursesTool from './CoursesTool.js';
import TemplatesTool from './TemplatesTool.js';
import ReportsTool from './ReportsTool.js';
import ExportContactsTool from './ExportContactsTool.js';
import CouponsTool from './CouponsTool.js';
const TOOLS = [
    { key: 'announcements', icon: Megaphone, label: 'Comunicados', desc: 'Avisos que aparecem como popup nas franquias', component: null },
    { key: 'monthlyFees', icon: DollarSign, label: 'Mensalidades', desc: 'Cobranças, vencimentos e comprovantes', component: MonthlyFeesTool },
    { key: 'marketing', icon: Folder, label: 'Banco de Marketing', desc: 'Materiais para download pelas franquias', component: MarketingTool },
    { key: 'factoryOrders', icon: Factory, label: 'Pedidos de Fábrica', desc: 'Pedidos enviados pelas franquias', component: FactoryOrdersTool },
    { key: 'ranking', icon: Trophy, label: 'Ranking', desc: 'Ranking de faturamento entre unidades', component: RankingTool },
    { key: 'courses', icon: GraduationCap, label: 'Cursos', desc: 'Treinamentos em vídeo para franqueados', component: CoursesTool },
    { key: 'templates', icon: Layers, label: 'Templates', desc: 'Produtos, categorias e adicionais', component: TemplatesTool },
    { key: 'reports', icon: BarChart3, label: 'Relatórios', desc: 'Relatórios unificados com gráficos', component: ReportsTool },
    { key: 'coupons', icon: Ticket, label: 'Cupons', desc: 'Cupons de desconto para o catálogo', component: CouponsTool },
    { key: 'siteOrders', icon: Globe2, label: 'Pedidos Site', desc: 'Pedidos recebidos pelo site externo — em breve', component: null },
    { key: 'aiChatbot', icon: MessageCircle, label: 'IA Chatbot', desc: 'Integração com IA via OpenRouter — em breve', component: null },
    { key: 'export', icon: Users, label: 'Exportar Contatos', desc: 'Lista de clientes para marketing', component: ExportContactsTool },
];
export default function ToolsMenu({ onClose }) {
    const [activeTool, setActiveTool] = useState(null);
    const ActiveComponent = TOOLS.find(t => t.key === activeTool)?.component;
    if (ActiveComponent) {
        return _jsx(ActiveComponent, { onClose: () => setActiveTool(null) });
    }
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm", onClick: onClose, children: _jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto", onClick: e => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center justify-between p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10", children: [_jsxs("div", { children: [_jsx("h2", { className: "font-bold text-white text-lg", children: "Ferramentas" }), _jsx("p", { className: "text-zinc-500 text-xs", children: "Fun\u00E7\u00F5es do painel master" })] }), _jsx("button", { onClick: onClose, className: "text-zinc-400 hover:text-white transition-colors", children: _jsx(X, { size: 22 }) })] }), _jsx("div", { className: "p-6", children: _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", children: TOOLS.map(tool => {
                            const Icon = tool.icon;
                            return (_jsxs("button", { onClick: () => tool.component ? setActiveTool(tool.key) : null, className: `bg-zinc-800 border border-zinc-700 rounded-xl p-5 text-left transition-all group ${tool.component ? 'hover:bg-zinc-700 hover:border-[#FFE500]/30 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`, children: [_jsx("div", { className: "w-12 h-12 rounded-lg bg-[#FFE500]/10 flex items-center justify-center mb-3 group-hover:bg-[#FFE500]/20 transition-colors", children: _jsx(Icon, { size: 22, className: "text-[#FFE500]" }) }), _jsx("h3", { className: "text-white font-bold text-sm", children: tool.label }), _jsx("p", { className: "text-zinc-400 text-xs mt-1", children: tool.desc })] }, tool.key));
                        }) }) })] }) }));
}
