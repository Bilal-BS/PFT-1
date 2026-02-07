
import React from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function SidebarDock({ side, isOpen, toggle, children }) {
    return (
        <motion.aside
            initial={false}
            animate={{ width: isOpen ? 280 : 0 }}
            className={`relative h-full bg-[#16191E] border-${side === 'left' ? 'r' : 'l'} border-white/5 flex flex-col z-40`}
        >
            <div className={`flex-1 overflow-y-auto ${!isOpen ? 'hidden' : 'block'}`}>
                {children}
            </div>

            {/* Dock Toggle Handle */}
            <button
                onClick={toggle}
                className={`absolute top-1/2 -translate-y-1/2 ${side === 'left' ? '-right-4' : '-left-4'
                    } w-4 h-12 bg-[#16191E] border border-white/5 rounded-${side === 'left' ? 'r' : 'l'
                    }-lg flex items-center justify-center text-white/20 hover:text-white transition-colors group z-50`}
            >
                {side === 'left' ? (
                    isOpen ? <ChevronLeft size={12} /> : <ChevronRight size={12} className="ml-1" />
                ) : (
                    isOpen ? <ChevronRight size={12} /> : <ChevronLeft size={12} className="-ml-1" />
                )}
            </button>
        </motion.aside>
    )
}
