
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

export default function FinancialVelocity({ data }) {
    const chartData = data.slice(0, 15).reverse()

    return (
        <div className="p-8 h-full flex flex-col">
            <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ left: -20, top: 10 }}>
                        <defs>
                            <linearGradient id="colorArchitect" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(255,255,255,0.03)" />
                        <XAxis
                            dataKey="transaction_date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 8, fontWeight: '900' }}
                            tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }).toUpperCase()}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 8, fontWeight: '900' }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#16191E',
                                borderRadius: '12px',
                                border: '1px solid rgba(255,255,255,0.05)',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                                fontSize: '10px',
                                fontWeight: '900',
                                color: '#fff',
                                textTransform: 'uppercase'
                            }}
                            itemStyle={{ color: '#6366f1' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="amount"
                            stroke="#6366f1"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorArchitect)"
                            animationDuration={2000}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

