import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { supabase } from '/app/lib/supabase.js';
import { Folder, FileText, Download, ChevronRight } from 'lucide-react';
export default function FranchiseeMarketing({ franchiseId: _franchiseId }) {
    const [categories, setCategories] = useState([]);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCat, setSelectedCat] = useState(null);
    useEffect(() => {
        (async () => {
            const [{ data: catData }, { data: fileData }] = await Promise.all([
                supabase.from('marketing_categories').select('*').order('name'),
                supabase.from('marketing_files').select('*').order('created_at', { ascending: false }),
            ]);
            if (catData)
                setCategories(catData);
            if (fileData)
                setFiles(fileData);
            setLoading(false);
        })();
    }, []);
    const filesInCat = (catId) => files.filter(f => f.category_id === catId);
    if (loading) {
        return _jsx("div", { className: "flex justify-center py-12", children: _jsx("div", { className: "w-6 h-6 border-2 border-zinc-700 border-t-[#FFE500] rounded-full animate-spin" }) });
    }
    if (selectedCat) {
        const cat = categories.find(c => c.id === selectedCat);
        return (_jsxs("div", { children: [_jsx("button", { onClick: () => setSelectedCat(null), className: "text-zinc-400 hover:text-white text-sm mb-4 transition-colors", children: "\u2190 Voltar" }), _jsx("h3", { className: "text-white font-bold text-lg mb-4", children: cat?.name }), filesInCat(selectedCat).length === 0 ? (_jsxs("div", { className: "text-center py-12", children: [_jsx(FileText, { size: 40, className: "mx-auto text-zinc-700 mb-3" }), _jsx("p", { className: "text-zinc-400 text-sm", children: "Nenhum arquivo nesta categoria." })] })) : (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", children: filesInCat(selectedCat).map(file => (_jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-4", children: [_jsxs("div", { className: "flex items-center gap-3 mb-3", children: [file.file_type === 'image' ? (_jsx("img", { src: file.file_url, alt: file.title, className: "w-14 h-14 rounded-lg object-cover" })) : (_jsx("div", { className: "w-14 h-14 rounded-lg bg-zinc-800 flex items-center justify-center", children: _jsx(FileText, { size: 22, className: "text-zinc-400" }) })), _jsxs("div", { children: [_jsx("p", { className: "text-white font-bold text-sm", children: file.title }), _jsx("p", { className: "text-zinc-500 text-xs", children: file.file_name })] })] }), _jsxs("a", { href: file.file_url, download: true, target: "_blank", rel: "noopener noreferrer", className: "w-full bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg py-2 flex items-center justify-center gap-1.5 transition-all", children: [_jsx(Download, { size: 16 }), " Baixar"] })] }, file.id))) }))] }));
    }
    if (categories.length === 0) {
        return (_jsxs("div", { className: "text-center py-12", children: [_jsx(Folder, { size: 40, className: "mx-auto text-zinc-700 mb-3" }), _jsx("p", { className: "text-zinc-400 text-sm", children: "Nenhum material de marketing dispon\u00EDvel." })] }));
    }
    return (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", children: categories.map(cat => (_jsx("button", { onClick: () => setSelectedCat(cat.id), className: "bg-zinc-900 border border-zinc-800 hover:border-[#FFE500]/30 rounded-xl p-5 text-left transition-all group", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-12 h-12 rounded-lg bg-[#FFE500]/10 flex items-center justify-center", children: _jsx(Folder, { size: 22, className: "text-[#FFE500]" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-white font-bold text-sm", children: cat.name }), _jsxs("p", { className: "text-zinc-500 text-xs", children: [filesInCat(cat.id).length, " arquivo(s)"] })] })] }), _jsx(ChevronRight, { size: 18, className: "text-zinc-600 group-hover:text-[#FFE500] transition-colors" })] }) }, cat.id))) }));
}
