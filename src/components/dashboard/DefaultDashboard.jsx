import { formatCurrency } from '../../lib/utils';
import { supabase } from '../../lib/supabase';

const DefaultDashboard = () => {
  const [timeRange, setTimeRange] = useState('This Month');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ balance: 0, income: 0, expense: 0, savings: 0 });
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [currency, setCurrency] = useState('LKR');

  React.useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [txRes, accRes, profRes] = await Promise.all([
        supabase.from('transactions').select('*').order('transaction_date', { ascending: false }),
        supabase.from('accounts').select('*'),
        supabase.from('profiles').select('base_currency').eq('id', user.id).single()
      ]);

      const txs = txRes.data || [];
      const accs = accRes.data || [];
      const baseCurrency = profRes.data?.base_currency || 'LKR';

      setCurrency(baseCurrency);
      setTransactions(txs.slice(0, 5));
      setAccounts(accs);

      const totalIncome = txs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const totalExpense = txs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      const totalBalance = accs.reduce((sum, a) => sum + (a.balance || 0), 0);

      setStats({
        balance: totalBalance,
        income: totalIncome,
        expense: totalExpense,
        savings: 0
      });

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="h-96 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  );

  const mainChartData = [
    { day: 'Mon', income: 0, expense: 0 },
    { day: 'Tue', income: 0, expense: 0 },
    { day: 'Wed', income: 0, expense: 0 },
    { day: 'Thu', income: 0, expense: 0 },
    { day: 'Fri', income: 0, expense: 0 },
    { day: 'Sat', income: 0, expense: 0 },
    { day: 'Sun', income: 0, expense: 0 },
  ];

  const categoryData = [];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">

      {/* 🟢 TOP ROW: Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        {/* Card: Total Balance */}
        <div className="premium-card p-8 group relative overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl text-indigo-600 group-hover:scale-110 transition-transform">
              <Wallet size={24} />
            </div>
            <button className="text-slate-400 hover:text-slate-900 dark:hover:text-white"><MoreHorizontal size={20} /></button>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Total Balance</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{formatCurrency(stats.balance, currency)}</h2>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Wallet size={120} />
          </div>
        </div>

        {/* Card: Monthly Income */}
        <div className="premium-card p-8 group">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl text-emerald-600">
              <TrendingUp size={24} />
            </div>
            <span className="trend-up">+0%</span>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Monthly Income</p>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight text-emerald-600">{formatCurrency(stats.income, currency)}</h2>
        </div>

        {/* Card: Monthly Expenses */}
        <div className="premium-card p-8 group">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-rose-50 dark:bg-rose-500/10 rounded-2xl text-rose-600">
              <TrendingDown size={24} />
            </div>
            <span className="trend-down">+0%</span>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Monthly Expenses</p>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight text-rose-600">{formatCurrency(stats.expense, currency)}</h2>
        </div>

        {/* Card: Savings Goal Progress */}
        <div className="premium-card p-8 group bg-gradient-to-br from-indigo-600 to-indigo-800 text-white border-none">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-white/20 rounded-2xl">
              <ArrowUpRight size={24} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-1 rounded-full">Active Tier</span>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-100/60 mb-1">Platform Status</p>
          <h2 className="text-4xl font-black tracking-tight uppercase">Real Time</h2>
          <div className="mt-4 h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white w-full" />
          </div>
        </div>

      </div>

      {/* 🔵 MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* LEFT COLUMN (8 Units) */}
        <div className="lg:col-span-8 space-y-10">

          {/* Spending Analysis Chart */}
          <div className="premium-card p-10 text-center flex flex-col items-center justify-center min-h-[400px]">
            <PieIcon size={48} className="text-slate-100 mb-4" />
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Spending Overview</h3>
            <p className="text-sm text-slate-500 font-medium">Add transactions to generate trend analysis.</p>
          </div>

          {/* Recent Activity Section */}
          <div className="premium-card overflow-hidden">
            <div className="p-10 flex items-center justify-between border-b border-slate-50 dark:border-slate-800">
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Recent Activity</h3>
              <Link to="/transactions" className="text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:underline px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl">View All</Link>
            </div>
            <div className="divide-y divide-slate-50 dark:divide-slate-800">
              {transactions.map(tx => (
                <div key={tx.id} className="p-8 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform border border-slate-100 dark:border-slate-700 text-indigo-600">
                      {tx.type === 'income' ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 dark:text-white leading-none mb-1 text-lg truncate max-w-[200px]">{tx.category}</p>
                      <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">{tx.note || 'Cashflow Entry'} • {new Date(tx.transaction_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-black italic tracking-tight ${tx.type === 'income' ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                    </p>
                  </div>
                </div>
              ))}
              {transactions.length === 0 && (
                <div className="p-20 text-center text-slate-400 font-medium italic">No ledger entries recorded yet.</div>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN (4 Units) */}
        <div className="lg:col-span-4 space-y-10">

          {/* Card: Accounts Overview */}
          <div className="premium-card p-10 bg-slate-900 text-white border-none shadow-indigo-500/10">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-lg font-black tracking-tight uppercase tracking-[0.1em]">My Accounts</h3>
              <Link to="/accounts" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20"><TrendingUp size={16} /></Link>
            </div>
            <div className="space-y-6">
              {accounts.map((acc, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-[24px] border border-white/5 hover:border-white/10 transition-all cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform"><Wallet size={20} /></div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">{acc.name}</p>
                      <p className="text-xl font-black italic leading-none">{formatCurrency(acc.balance, currency)}</p>
                    </div>
                  </div>
                </div>
              ))}
              {accounts.length === 0 && (
                <div className="text-center text-slate-500 py-10 italic">No linked accounts.</div>
              )}
            </div>
            <Link to="/accounts" className="block w-full text-center mt-8 py-4 bg-white/10 hover:bg-white text-white hover:text-slate-900 rounded-[20px] font-black text-[10px] uppercase tracking-[0.2em] transition-all">Setup Accounts</Link>
          </div>

          {/* Card: System Alerts Section */}
          <div className="premium-card p-10 border-l-[12px] border-l-slate-200">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">System Status</h3>
              <div className="flex h-10 w-10 bg-indigo-50 rounded-2xl items-center justify-center text-indigo-500"><CheckCircle size={20} /></div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Live Database</p>
              <p className="font-black text-slate-900 dark:text-white">All connections established.</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default DefaultDashboard;
