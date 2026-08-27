import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { supabase } from '/app/lib/supabase.js';
import { X, Plus, Trash2, Folder, FileText, Download, Upload, ChevronRight } from 'lucide-react';
export default function MarketingTool({ onClose }) {
    const [categories, setCategories] = useState([]);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCat, setSelectedCat] = useState(null);
    const [showCreateCat, setShowCreateCat] = useState(false);
    const [showUpload, setShowUpload] = useState(false);
    const [catName, setCatName] = useState('');
    const [uploadTitle, setUploadTitle] = useState('');
    const [uploadFile, setUploadFile] = useState(null);
    const [saving, setSaving] = useState(false);
    const load = async () => {
        const [{ data: catData }, { data: fileData }] = await Promise.all([
            supabase.from('marketing_categories').select('*').order('name'),
            supabase.from('marketing_files').select('*').order('created_at', { ascending: false }),
        ]);
        if (catData)
            setCategories(catData);
        if (fileData)
            setFiles(fileData);
        setLoading(false);
    };
    useEffect(() => { load(); }, []);
    const handleCreateCat = async (e) => {
        e.preventDefault();
        setSaving(true);
        const { error } = await supabase.from('marketing_categories').insert({ name: catName });
        if (!error) {
            setCatName('');
            setShowCreateCat(false);
            load();
        }
        setSaving(false);
    };
    const handleDeleteCat = async (cat) => {
        if (!confirm(`Excluir categoria "${cat.name}" e todos os seus arquivos?`))
            return;
        await supabase.from('marketing_categories').delete().eq('id', cat.id);
        if (selectedCat === cat.id)
            setSelectedCat(null);
        load();
    };
    const handleUpload = async (e) => {
        e.preventDefault();
        if (!uploadFile || !selectedCat)
            return;
        setSaving(true);
        const ext = uploadFile.name.split('.').pop();
        const path = `${selectedCat}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from('marketing-files').upload(path, uploadFile);
        if (!upErr) {
            const url = supabase.storage.from('marketing-files').getPublicUrl(path).data.publicUrl;
            const isImage = uploadFile.type.startsWith('image/');
            await supabase.from('marketing_files').insert({
                category_id: selectedCat,
                title: uploadTitle,
                file_url: url,
                file_type: isImage ? 'image' : 'file',
                file_name: uploadFile.name,
            });
            setUploadTitle('');
            setUploadFile(null);
            setShowUpload(false);
            load();
        }
        setSaving(false);
    };
    const handleDeleteFile = async (file) => {
        if (!confirm('Excluir este arquivo?'))
            return;
        await supabase.from('marketing_files').delete().eq('id', file.id);
        load();
    };
    const filesInCat = (catId) => files.filter(f => f.category_id === catId);
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm", onClick: onClose, children: _jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto", onClick: e => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center justify-between p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-lg bg-[#FFE500]/10 flex items-center justify-center", children: _jsx(Folder, { size: 20, className: "text-[#FFE500]" }) }), _jsxs("div", { children: [_jsx("h2", { className: "font-bold text-white text-lg", children: "Banco de Marketing" }), _jsx("p", { className: "text-zinc-500 text-xs", children: "Materiais para as franquias" })] })] }), _jsx("button", { onClick: onClose, className: "text-zinc-400 hover:text-white transition-colors", children: _jsx(X, { size: 22 }) })] }), _jsx("div", { className: "p-6", children: selectedCat ? (_jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-4 flex-wrap gap-2", children: [_jsx("button", { onClick: () => setSelectedCat(null), className: "text-zinc-400 hover:text-white text-sm flex items-center gap-1 transition-colors", children: "\u2190 Voltar" }), _jsxs("button", { onClick: () => setShowUpload(!showUpload), className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 flex items-center gap-1.5 transition-all", children: [_jsx(Plus, { size: 16 }), " Enviar arquivo"] })] }), _jsx("h3", { className: "text-white font-bold mb-3", children: categories.find(c => c.id === selectedCat)?.name }), showUpload && (_jsxs("form", { onSubmit: handleUpload, className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 mb-4 space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "T\u00EDtulo do arquivo" }), _jsx("input", { type: "text", value: uploadTitle, onChange: e => setUploadTitle(e.target.value), required: true, placeholder: "Ex: Banner promocional", className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Arquivo" }), _jsxs("label", { className: "flex items-center gap-2 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 cursor-pointer hover:border-[#FFE500]/50 transition-colors", children: [_jsx(Upload, { size: 16, className: "text-zinc-400" }), _jsx("span", { className: "text-zinc-400 text-sm truncate", children: uploadFile ? uploadFile.name : 'Selecionar arquivo...' }), _jsx("input", { type: "file", accept: "image/*,video/*,.pdf,.zip,.doc,.docx,.ppt,.pptx", onChange: e => setUploadFile(e.target.files?.[0] ?? null), required: true, className: "hidden" })] })] }), _jsx("button", { type: "submit", disabled: saving, className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 transition-all disabled:opacity-50", children: saving ? 'Enviando...' : 'Enviar' })] })), filesInCat(selectedCat).length === 0 ? (_jsxs("div", { className: "text-center py-12", children: [_jsx(FileText, { size: 40, className: "mx-auto text-zinc-700 mb-3" }), _jsx("p", { className: "text-zinc-400 text-sm", children: "Nenhum arquivo nesta categoria ainda." })] })) : (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: filesInCat(selectedCat).map(file => (_jsxs("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-3", children: [_jsx("div", { className: "flex items-start justify-between mb-2", children: _jsxs("div", { className: "flex items-center gap-2", children: [file.file_type === 'image' ? (_jsx("img", { src: file.file_url, alt: file.title, className: "w-12 h-12 rounded object-cover" })) : (_jsx("div", { className: "w-12 h-12 rounded bg-zinc-700 flex items-center justify-center", children: _jsx(FileText, { size: 20, className: "text-zinc-400" }) })), _jsxs("div", { children: [_jsx("p", { className: "text-white text-sm font-medium", children: file.title }), _jsx("p", { className: "text-zinc-500 text-xs", children: file.file_name })] })] }) }), _jsxs("div", { className: "flex gap-2 mt-2", children: [_jsxs("a", { href: file.file_url, download: true, target: "_blank", rel: "noopener noreferrer", className: "flex-1 bg-zinc-700 hover:bg-zinc-600 text-white text-xs font-medium rounded-lg py-1.5 flex items-center justify-center gap-1 transition-colors", children: [_jsx(Download, { size: 12 }), " Baixar"] }), _jsx("button", { onClick: () => handleDeleteFile(file), className: "bg-zinc-700 hover:bg-red-600 text-zinc-400 hover:text-white rounded-lg px-2.5 py-1.5 transition-colors", children: _jsx(Trash2, { size: 12 }) })] })] }, file.id))) }))] })) : (_jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h3", { className: "text-white font-bold", children: "Categorias" }), _jsxs("button", { onClick: () => setShowCreateCat(!showCreateCat), className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 flex items-center gap-1.5 transition-all", children: [_jsx(Plus, { size: 16 }), " Nova categoria"] })] }), showCreateCat && (_jsxs("form", { onSubmit: handleCreateCat, className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 mb-4 flex gap-2", children: [_jsx("input", { type: "text", value: catName, onChange: e => setCatName(e.target.value), required: true, placeholder: "Nome da categoria", className: "flex-1 bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), _jsx("button", { type: "submit", disabled: saving, className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 transition-all disabled:opacity-50", children: "Criar" })] })), loading ? (_jsx("div", { className: "flex justify-center py-8", children: _jsx("div", { className: "w-6 h-6 border-2 border-zinc-700 border-t-[#FFE500] rounded-full animate-spin" }) })) : categories.length === 0 ? (_jsxs("div", { className: "text-center py-12", children: [_jsx(Folder, { size: 40, className: "mx-auto text-zinc-700 mb-3" }), _jsx("p", { className: "text-zinc-400 text-sm", children: "Nenhuma categoria criada ainda." })] })) : (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: categories.map(cat => (_jsx("div", { className: "bg-zinc-800/50 border border-zinc-700 hover:border-[#FFE500]/30 rounded-lg p-4 cursor-pointer transition-all group", onClick: () => setSelectedCat(cat.id), children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-lg bg-[#FFE500]/10 flex items-center justify-center", children: _jsx(Folder, { size: 18, className: "text-[#FFE500]" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-white font-bold text-sm", children: cat.name }), _jsxs("p", { className: "text-zinc-500 text-xs", children: [filesInCat(cat.id).length, " arquivo(s)"] })] })] }), _jsxs("div", { className: "flex items-center gap-1", onClick: e => e.stopPropagation(), children: [_jsx(ChevronRight, { size: 18, className: "text-zinc-600 group-hover:text-[#FFE500] transition-colors" }), _jsx("button", { onClick: () => handleDeleteCat(cat), className: "text-zinc-500 hover:text-red-400 p-1 transition-colors", children: _jsx(Trash2, { size: 14 }) })] })] }) }, cat.id))) }))] })) })] }) }));
}
