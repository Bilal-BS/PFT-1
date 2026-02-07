
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

export default function CategoryExpenseChart({ transactions }) {
    const expenses = transactions.filter(t => t.type === 'expense')
    const categories = Array.from(new Set(expenses.map(t => t.category || 'Other')))

    const data = categories.map(cat => ({
        name: cat,
        value: expenses.filter(t => t.category === cat).reduce((acc, t) => acc + t.amount, 0)
    })).filter(d => d.value > 0).sort((a, b) => b.value - a.value)

    const COLORS = ['#064E3B', '#059669', '#10B981', '#34D399', '#6EE7B7', '#A7F3D0']

    return (
        <div className="p-6 h-full flex flex-col">
            <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '10px' }} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
