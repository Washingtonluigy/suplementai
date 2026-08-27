import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { supabase } from '/app/lib/supabase.js';
import { GraduationCap, Youtube, Play } from 'lucide-react';
export default function FranchiseeCourses({ franchiseId: _franchiseId }) {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [playing, setPlaying] = useState(null);
    useEffect(() => {
        (async () => {
            const { data } = await supabase.from('courses').select('*').order('order_index', { ascending: true });
            if (data)
                setCourses(data);
            setLoading(false);
        })();
    }, []);
    const modules = Array.from(new Set(courses.map(c => c.module_name)));
    const getEmbedUrl = (url) => {
        const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
        return match ? `https://www.youtube.com/embed/${match[1]}` : url;
    };
    if (loading) {
        return _jsx("div", { className: "flex justify-center py-12", children: _jsx("div", { className: "w-6 h-6 border-2 border-zinc-700 border-t-[#FFE500] rounded-full animate-spin" }) });
    }
    if (playing) {
        return (_jsxs("div", { children: [_jsx("button", { onClick: () => setPlaying(null), className: "text-zinc-400 hover:text-white text-sm mb-4 transition-colors", children: "\u2190 Voltar" }), _jsx("div", { className: "aspect-video rounded-xl overflow-hidden border border-zinc-800 mb-4", children: _jsx("iframe", { src: getEmbedUrl(playing.video_url), className: "w-full h-full", allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture", allowFullScreen: true }) }), _jsx("h3", { className: "text-white font-bold text-lg", children: playing.title }), playing.description && _jsx("p", { className: "text-zinc-400 text-sm mt-2", children: playing.description })] }));
    }
    if (courses.length === 0) {
        return (_jsxs("div", { className: "text-center py-12", children: [_jsx(GraduationCap, { size: 40, className: "mx-auto text-zinc-700 mb-3" }), _jsx("p", { className: "text-zinc-400 text-sm", children: "Nenhum curso dispon\u00EDvel." })] }));
    }
    return (_jsx("div", { className: "space-y-6", children: modules.map(mod => (_jsxs("div", { children: [_jsx("h3", { className: "text-[#FFE500] font-bold text-sm uppercase tracking-wide mb-3", children: mod }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", children: courses.filter(c => c.module_name === mod).map(c => (_jsxs("button", { onClick: () => setPlaying(c), className: "bg-zinc-900 border border-zinc-800 hover:border-[#FFE500]/30 rounded-xl p-4 text-left transition-all group", children: [_jsxs("div", { className: "flex items-center gap-3 mb-3", children: [_jsx("div", { className: "w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center", children: _jsx(Youtube, { size: 20, className: "text-red-400" }) }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-white font-bold text-sm", children: c.title }), c.description && _jsx("p", { className: "text-zinc-500 text-xs line-clamp-2", children: c.description })] })] }), _jsxs("div", { className: "flex items-center gap-1.5 text-[#FFE500] text-xs font-bold group-hover:gap-2.5 transition-all", children: [_jsx(Play, { size: 14 }), " Assistir curso"] })] }, c.id))) })] }, mod))) }));
}
