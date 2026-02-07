import { useSearchParams } from 'react-router-dom';
import TopBar from './dashboard/TopBar';

export default function MainLayout({ children }) {
    const [searchParams] = useSearchParams();
    const isCustomizing = searchParams.get('customize') === 'true';

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
            <TopBar />
            <main
                className="flex-1 min-w-0 transition-all duration-300 ease-in-out"
            >
                {!isCustomizing ? (
                    <div className="max-w-[1700px] mx-auto p-6 lg:p-12">
                        {children}
                    </div>
                ) : (
                    children
                )}
            </main>
        </div>
    );
}
