import {
    Sun, Moon, Zap, ShieldCheck, Globe,
    Sparkles, Box, Layout, Terminal,
    Scroll, Ghost, FlaskConical, Command,
    Layers, Aperture, Star
} from 'lucide-react';

export const THEME_CATEGORIES = [
    {
        name: 'Design Personalities',
        themes: [
            { id: 'light', name: 'Modern Minimal', icon: <Sun size={14} />, color: 'bg-indigo-500', type: 'free' },
            { id: 'ios', name: 'iOS Glass', icon: <Aperture size={14} />, color: 'bg-blue-400', type: 'premium' },
            { id: 'neumorphic', name: 'Neumorphic', icon: <Box size={14} />, color: 'bg-slate-300', type: 'premium' },
            { id: 'brutalist', name: 'Brutalist', icon: <Command size={14} />, color: 'bg-yellow-400', type: 'premium' },
            { id: 'liquid', name: 'Liquid Flow', icon: <Layers size={14} />, color: 'bg-indigo-600', type: 'premium' },
        ]
    },
    {
        name: 'Platform Spirits',
        themes: [
            { id: 'material', name: 'Material You', icon: <Sun size={14} />, color: 'bg-purple-500', type: 'free' },
            { id: 'fluent', name: 'Fluent UI', icon: <Layout size={14} />, color: 'bg-sky-600', type: 'premium' },
            { id: 'swiss', name: 'Corporate Swiss', icon: <Globe size={14} />, color: 'bg-slate-900', type: 'free' },
            { id: 'lab', name: 'Laboratory', icon: <FlaskConical size={14} />, color: 'bg-emerald-500', type: 'free' },
        ]
    },
    {
        name: 'The Underworld',
        themes: [
            { id: 'cyber', name: 'Cyber Neon', icon: <Zap size={14} />, color: 'bg-cyan-400', type: 'premium' },
            { id: 'matrix', name: 'Matrix Terminal', icon: <Terminal size={14} />, color: 'bg-emerald-600', type: 'premium' },
            { id: 'stealth', name: 'Matte Stealth', icon: <Moon size={14} />, color: 'bg-slate-800', type: 'free' },
            { id: 'glitch', name: 'Cyber Glitch', icon: <Sparkles size={14} />, color: 'bg-yellow-500', type: 'premium' },
        ]
    },
    {
        name: 'Heritage',
        themes: [
            { id: 'gold', name: 'Royal Luxury', icon: <Star size={14} />, color: 'bg-amber-600', type: 'premium' },
            { id: 'ledger', name: 'Paper Ledger', icon: <Scroll size={14} />, color: 'bg-orange-800', type: 'free' },
            { id: 'dark', name: 'Classic Dark', icon: <Moon size={14} />, color: 'bg-slate-900', type: 'free' },
        ]
    }
];

export const ALL_THEMES = THEME_CATEGORIES.flatMap(c => c.themes);
