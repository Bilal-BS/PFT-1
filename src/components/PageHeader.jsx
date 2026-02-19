import React from 'react';

const PageHeader = ({ title, description, actions, children }) => {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
            <div>
                <h1 className="text-4xl font-black text-[var(--text-main)] tracking-tighter mb-1 italic">
                    {title}<span className="text-[var(--accent)]">.</span>
                </h1>
                {description && (
                    <p className="text-[var(--text-muted)] font-bold text-sm uppercase tracking-widest opacity-60">
                        {description}
                    </p>
                )}
                {children}
            </div>
            {actions && (
                <div className="flex items-center gap-3">
                    {actions}
                </div>
            )}
        </div>
    );
};

export default PageHeader;
