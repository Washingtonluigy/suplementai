import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { supabase } from '/app/lib/supabase.js';
import { X, Plus, Trash2, GraduationCap, Youtube, Edit, Upload } from 'lucide-react';
export default function CoursesTool({ onClose }) {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ title: '', description: '', video_url: '', category_name: 'Geral', module_name: 'Módulo 1', order_index: '0' });
    const [mediaFile, setMediaFile] = useState(null);
    const [saving, setSaving] = useState(false);
    const load = async () => {
        const { data } = await supabase.from('courses').select('*').order('order_index', { ascending: true });
        if (data)
            setCourses(data);
        setLoading(false);
    };
    useEffect(() => { load(); }, []);
    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        let mediaUrl = form.video_url;
        let mediaType = 'youtube';
        if (mediaFile) {
            const extension = mediaFile.name.split('.').pop() || 'mp4';
            const path = `courses/${Date.now()}.${extension}`;
            const { error: uploadError } = await supabase.storage.from('marketing-files').upload(path, mediaFile);
            if (uploadError) {
                setSaving(false);
                return;
            }
            mediaUrl = supabase.storage.from('marketing-files').getPublicUrl(path).data.publicUrl;
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
            await supabase.from('courses').update(payload).eq('id', editing.id);
        }
        else {
            await supabase.from('courses').insert(payload);
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
        await supabase.from('courses').delete().eq('id', c.id);
        load();
    };
    const modules = Array.from(new Set(courses.map(c => c.module_name)));
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm", onClick: onClose, children: _jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto", onClick: e => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center justify-between p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-lg bg-[#FFE500]/10 flex items-center justify-center", children: _jsx(GraduationCap, { size: 20, className: "text-[#FFE500]" }) }), _jsxs("div", { children: [_jsx("h2", { className: "font-bold text-white text-lg", children: "Cursos" }), _jsx("p", { className: "text-zinc-500 text-xs", children: "Treinamentos para os franqueados" })] })] }), _jsx("button", { onClick: onClose, className: "text-zinc-400 hover:text-white transition-colors", children: _jsx(X, { size: 22 }) })] }), _jsxs("div", { className: "p-6", children: [_jsx("div", { className: "flex justify-end mb-4", children: _jsxs("button", { onClick: () => { if (editing) {
                                    setEditing(null);
                                    setForm({ title: '', description: '', video_url: '', module_name: 'Geral', order_index: '0' });
                                } setShowCreate(!showCreate); }, className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 flex items-center gap-1.5 transition-all", children: [_jsx(Plus, { size: 16 }), " ", editing ? 'Editando...' : 'Novo Curso'] }) }), showCreate && (_jsxs("form", { onSubmit: handleSave, className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 mb-4 space-y-3", children: [_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "T\u00EDtulo" }), _jsx("input", { type: "text", value: form.title, onChange: e => setForm({ ...form, title: e.target.value }), required: true, className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Categoria principal" }), _jsx("input", { type: "text", value: form.category_name, onChange: e => setForm({ ...form, category_name: e.target.value }), required: true, className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "M\u00F3dulo" }), _jsx("input", { type: "text", value: form.module_name, onChange: e => setForm({ ...form, module_name: e.target.value }), required: true, className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "V\u00EDdeo ou arquivo" }), _jsx("input", { type: "url", value: form.video_url, onChange: e => setForm({ ...form, video_url: e.target.value }), required: !mediaFile, placeholder: "https://youtube.com/watch?v=...", className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), _jsxs("label", { className: "mt-2 flex items-center gap-2 text-xs text-zinc-400 cursor-pointer", children: [_jsx(Upload, { size: 14 }), mediaFile ? mediaFile.name : 'Ou enviar vídeo/arquivo', _jsx("input", { type: "file", accept: "video/*,.pdf", className: "hidden", onChange: e => setMediaFile(e.target.files?.[0] ?? null) })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Descri\u00E7\u00E3o" }), _jsx("textarea", { value: form.description, onChange: e => setForm({ ...form, description: e.target.value }), rows: 2, className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500] resize-none" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Ordem" }), _jsx("input", { type: "number", value: form.order_index, onChange: e => setForm({ ...form, order_index: e.target.value }), className: "w-24 bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { type: "submit", disabled: saving, className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 transition-all disabled:opacity-50", children: saving ? 'Salvando...' : editing ? 'Salvar alterações' : 'Criar curso' }), _jsx("button", { type: "button", onClick: () => { setShowCreate(false); setEditing(null); }, className: "bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors", children: "Cancelar" })] })] })), loading ? (_jsx("div", { className: "flex justify-center py-8", children: _jsx("div", { className: "w-6 h-6 border-2 border-zinc-700 border-t-[#FFE500] rounded-full animate-spin" }) })) : courses.length === 0 ? (_jsxs("div", { className: "text-center py-12", children: [_jsx(GraduationCap, { size: 40, className: "mx-auto text-zinc-700 mb-3" }), _jsx("p", { className: "text-zinc-400 text-sm", children: "Nenhum curso criado ainda." })] })) : (_jsx("div", { className: "space-y-6", children: modules.map(mod => (_jsxs("div", { children: [_jsx("h3", { className: "text-[#FFE500] font-bold text-sm uppercase tracking-wide mb-3", children: mod }), _jsx("div", { className: "space-y-2", children: courses.filter(c => c.module_name === mod).map(c => (_jsxs("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center", children: _jsx(Youtube, { size: 18, className: "text-red-400" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-white text-sm font-medium", children: c.title }), c.description && _jsx("p", { className: "text-zinc-500 text-xs", children: c.description })] })] }), _jsxs("div", { className: "flex gap-1", children: [_jsx("button", { onClick: () => handleEdit(c), className: "text-zinc-400 hover:text-[#FFE500] p-1.5 transition-colors", children: _jsx(Edit, { size: 15 }) }), _jsx("button", { onClick: () => handleDelete(c), className: "text-zinc-400 hover:text-red-400 p-1.5 transition-colors", children: _jsx(Trash2, { size: 15 }) })] })] }, c.id))) })] }, mod))) }))] })] }) }));
}
