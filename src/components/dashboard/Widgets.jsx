import React from 'react';

export const IncomeWidget = () => (
  <div className="h-full flex flex-col justify-between">
    <div>
      <p className="text-xs opacity-60">TOTAL INCOME (THIS MONTH)</p>
      <p className="text-2xl font-bold mt-2">$12,450.00</p>
    </div>
    <div className="text-xs opacity-60">
      <span className="text-green-500">↑ 12%</span> from last month
    </div>
  </div>
);

export const ExpenseWidget = () => (
  <div className="h-full flex flex-col justify-between">
    <div>
      <p className="text-xs opacity-60">TOTAL EXPENSES (THIS MONTH)</p>
      <p className="text-2xl font-bold mt-2">$8,320.00</p>
    </div>
    <div className="text-xs opacity-60">
      <span className="text-red-500">↑ 5%</span> from last month
    </div>
  </div>
);

export const BalanceWidget = () => (
  <div className="h-full flex flex-col justify-between">
    <div>
      <p className="text-xs opacity-60">NET BALANCE</p>
      <p className="text-2xl font-bold mt-2">$24,130.50</p>
    </div>
    <div className="text-xs opacity-60">
      As of today
    </div>
  </div>
);

export const BankWidget = () => (
  <div className="h-full flex flex-col justify-between">
    <div>
      <p className="text-xs opacity-60">CASH + BANK BALANCE</p>
      <p className="text-2xl font-bold mt-2">$45,670.25</p>
    </div>
    <div className="grid grid-cols-2 gap-4 mt-4 text-xs">
      <div>
        <p className="opacity-60">Cash</p>
        <p className="font-semibold">$5,230.00</p>
      </div>
      <div>
        <p className="opacity-60">Bank</p>
        <p className="font-semibold">$40,440.25</p>
      </div>
    </div>
  </div>
);

export const InvestmentWidget = () => (
  <div className="h-full flex flex-col justify-between">
    <div>
      <p className="text-xs opacity-60">INVESTMENT SUMMARY</p>
      <p className="text-2xl font-bold mt-2">+$3,450.80</p>
    </div>
    <div className="text-xs opacity-60">
      <span className="text-green-500">+8.5%</span> profit
    </div>
  </div>
);

export const LoansWidget = () => (
  <div className="h-full flex flex-col justify-between">
    <div>
      <p className="text-xs opacity-60">LOANS OVERVIEW</p>
    </div>
    <div className="grid grid-cols-2 gap-4 mt-4 text-xs">
      <div>
        <p className="opacity-60">Given</p>
        <p className="font-semibold text-lg">$15,000</p>
      </div>
      <div>
        <p className="opacity-60">Collected</p>
        <p className="font-semibold text-lg">$8,500</p>
      </div>
    </div>
    <div className="text-xs opacity-60 mt-2">
      Outstanding: $6,500
    </div>
  </div>
);

export const TransactionsWidget = () => (
  <div className="h-full flex flex-col">
    <div className="space-y-3 flex-1 overflow-y-auto">
      {[
        { id: 1, description: 'Salary', amount: '+$3,500', type: 'income' },
        { id: 2, description: 'Groceries', amount: '-$245', type: 'expense' },
        { id: 3, description: 'Rent', amount: '-$1,200', type: 'expense' },
        { id: 4, description: 'Freelance', amount: '+$850', type: 'income' },
      ].map(tx => (
        <div key={tx.id} className="flex justify-between items-center text-xs py-2 border-b border-gray-700">
          <span>{tx.description}</span>
          <span className={tx.type === 'income' ? 'text-green-500' : 'text-red-500'}>
            {tx.amount}
          </span>
        </div>
      ))}
    </div>
  </div>
);

export const ChartWidget = ({ title }) => (
  <div className="h-full flex items-center justify-center">
    <div className="text-center opacity-60">
      <p className="text-sm font-semibold mb-2">{title}</p>
      <p className="text-xs">📊 Chart would render here</p>
    </div>
  </div>
);

export const AlertsWidget = () => (
  <div className="h-full flex flex-col space-y-2">
    {[
      { type: 'warning', msg: 'Budget limit reached for Food' },
      { type: 'info', msg: 'New investment opportunity available' },
      { type: 'alert', msg: 'Loan payment due in 3 days' }
    ].map((alert, i) => (
      <div key={i} className={`p-2 rounded text-xs ${
        alert.type === 'warning' ? 'bg-yellow-500/10 text-yellow-500' :
        alert.type === 'alert' ? 'bg-red-500/10 text-red-500' :
        'bg-blue-500/10 text-blue-500'
      }`}>
        {alert.msg}
      </div>
    ))}
  </div>
);

export const AIInsightsWidget = () => (
  <div className="h-full flex flex-col space-y-3">
    <div className="text-xs">
      <p className="font-semibold mb-2">🧠 AI Insights</p>
      <p className="opacity-60 text-xs leading-relaxed">
        Your spending increased 5% this month. Consider reviewing subscription services to optimize expenses.
      </p>
    </div>
  </div>
);

// Widget mapper
export const getWidget = (type, title) => {
  switch (type) {
    case 'income':
      return <IncomeWidget />;
    case 'expense':
      return <ExpenseWidget />;
    case 'balance':
      return <BalanceWidget />;
    case 'bank':
      return <BankWidget />;
    case 'investment':
      return <InvestmentWidget />;
    case 'loans':
      return <LoansWidget />;
    case 'transactions':
      return <TransactionsWidget />;
    case 'chart':
      return <ChartWidget title={title} />;
    case 'alerts':
      return <AlertsWidget />;
    case 'ai_insights':
      return <AIInsightsWidget />;
    default:
      return <div className="text-center opacity-50">Unknown widget type</div>;
  }
};
