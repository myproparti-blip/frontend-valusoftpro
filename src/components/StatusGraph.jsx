import React, { useMemo, useState, memo } from "react";
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    ComposedChart,
    Area,
} from "recharts";
import { Card, CardContent } from "./ui";
import { FaChartBar, FaArrowUp, FaCheckCircle, FaHourglass, FaChartLine, FaFireAlt, FaBolt, FaAward, FaCreditCard, FaBuilding, FaCity, FaCalendarAlt, FaUsers, FaStar } from "react-icons/fa";

const StatusGraph = memo(({ files, isCompact = false }) => {
    const [activeTab, setActiveTab] = useState("status");

    // Prepare data for status distribution (Bar Chart)
    const statusData = useMemo(() => {
        const statusCounts = {
            pending: 0,
            "on-progress": 0,
            approved: 0,
            rejected: 0,
            rework: 0,
        };

        files.forEach((file) => {
            if (statusCounts.hasOwnProperty(file.status)) {
                statusCounts[file.status]++;
            }
        });

        return [
            { name: "Pending", value: statusCounts.pending, fill: "#f59e0b", lightFill: "#fef3c7", darkFill: "#92400e" },
            { name: "In Progress", value: statusCounts["on-progress"], fill: "#3b82f6", lightFill: "#dbeafe", darkFill: "#1e40af" },
            { name: "Approved", value: statusCounts.approved, fill: "#10b981", lightFill: "#d1fae5", darkFill: "#065f46" },
            { name: "Rejected", value: statusCounts.rejected, fill: "#ef4444", lightFill: "#fee2e2", darkFill: "#7f1d1d" },
            { name: "Rework", value: statusCounts.rework, fill: "#8b5cf6", lightFill: "#ede9fe", darkFill: "#4c1d95" },
        ];
    }, [files]);

    // Prepare data for bank distribution (Pie Chart)
    const bankData = useMemo(() => {
        const bankCounts = {};
        const colors = [
            { fill: "#3b82f6", light: "#dbeafe", dark: "#1e40af" },
            { fill: "#10b981", light: "#d1fae5", dark: "#065f46" },
            { fill: "#f59e0b", light: "#fef3c7", dark: "#92400e" },
            { fill: "#ef4444", light: "#fee2e2", dark: "#7f1d1d" },
            { fill: "#8b5cf6", light: "#ede9fe", dark: "#4c1d95" },
            { fill: "#ec4899", light: "#fbcfe8", dark: "#831843" },
            { fill: "#06b6d4", light: "#cffafe", dark: "#164e63" },
        ];

        files.forEach((file) => {
            if (file.bankName) {
                bankCounts[file.bankName] = (bankCounts[file.bankName] || 0) + 1;
            }
        });

        return Object.entries(bankCounts)
            .map(([name, value], idx) => ({
                name,
                value,
                ...colors[idx % colors.length],
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 8);
    }, [files]);

    // Prepare data for city distribution (Bar Chart)
    const cityData = useMemo(() => {
        const cityCounts = {};

        files.forEach((file) => {
            if (file.city) {
                cityCounts[file.city] = (cityCounts[file.city] || 0) + 1;
            }
        });

        return Object.entries(cityCounts)
            .map(([name, value]) => ({
                name,
                count: value,
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
    }, [files]);

    // Enhanced analytics data
    const analyticsData = useMemo(() => {
        const statusCounts = {
            pending: 0,
            "on-progress": 0,
            approved: 0,
            rejected: 0,
            rework: 0,
        };
        const engineerStats = {};
        const monthlyData = {};

        files.forEach((file) => {
            if (statusCounts.hasOwnProperty(file.status)) {
                statusCounts[file.status]++;
            }

            // Engineer stats
            if (file.engineerName) {
                if (!engineerStats[file.engineerName]) {
                    engineerStats[file.engineerName] = { approved: 0, rejected: 0, pending: 0 };
                }
                engineerStats[file.engineerName][file.status]++;
            }

            // Monthly data
            const month = new Date(file.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
            });
            if (!monthlyData[month]) {
                monthlyData[month] = { name: month, submissions: 0, approved: 0, rejected: 0 };
            }
            monthlyData[month].submissions++;
            if (file.status === "approved") monthlyData[month].approved++;
            if (file.status === "rejected") monthlyData[month].rejected++;
        });

        return {
            engineerStats: Object.entries(engineerStats)
                .map(([name, data]) => ({
                    name,
                    ...data,
                    total: data.approved + data.rejected + data.pending,
                    approvalRate: data.total > 0 ? ((data.approved / data.total) * 100).toFixed(1) : 0,
                }))
                .sort((a, b) => b.total - a.total)
                .slice(0, 10),
            monthlyData: Object.values(monthlyData).sort(
                (a, b) => new Date(a.name) - new Date(b.name)
            ),
        };
    }, [files]);

    // Prepare data for payment status (Pie Chart)
    const paymentData = useMemo(() => {
        let collected = 0;
        let notCollected = 0;

        files.forEach((file) => {
            if (file.payment === "yes") {
                collected++;
            } else {
                notCollected++;
            }
        });

        return [
            { name: "Collected", value: collected, fill: "#10b981", light: "#d1fae5", dark: "#065f46" },
            { name: "Not Collected", value: notCollected, fill: "#ef4444", light: "#fee2e2", dark: "#7f1d1d" },
        ];
    }, [files]);

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const isMultiSeries = payload.length > 1;
            return (
                <div className="bg-gradient-to-br from-white to-gray-50 p-3 border-2 border-gray-300 rounded-lg shadow-xl backdrop-blur-md bg-opacity-98">
                    <p className="text-xs font-bold text-gray-800 uppercase tracking-widest mb-1.5">
                        {payload[0].payload.name || payload[0].name}
                    </p>
                    {isMultiSeries ? (
                        <div className="space-y-1">
                            {payload.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.fill || item.color }}></div>
                                    <span className="text-xs font-semibold text-gray-700">
                                        {item.name}: <span className="font-bold text-gray-900">{item.value}</span>
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                            {payload[0].value}
                        </p>
                    )}
                </div>
            );
        }
        return null;
    };

    // Premium Stat Card Component
    const StatCard = ({ icon: Icon, label, value, color, trend }) => {
        const colorClasses = {
            blue: { bg: "from-blue-500 via-blue-400 to-blue-500", light: "from-blue-50 to-blue-100", border: "border-blue-300", text: "text-blue-700", icon: "text-blue-600" },
            green: { bg: "from-green-500 via-green-400 to-green-500", light: "from-green-50 to-green-100", border: "border-green-300", text: "text-green-700", icon: "text-green-600" },
            red: { bg: "from-red-500 via-red-400 to-red-500", light: "from-red-50 to-red-100", border: "border-red-300", text: "text-red-700", icon: "text-red-600" },
            purple: { bg: "from-purple-500 via-purple-400 to-purple-500", light: "from-purple-50 to-purple-100", border: "border-purple-300", text: "text-purple-700", icon: "text-purple-600" },
            amber: { bg: "from-amber-500 via-amber-400 to-amber-500", light: "from-amber-50 to-amber-100", border: "border-amber-300", text: "text-amber-700", icon: "text-amber-600" },
            indigo: { bg: "from-indigo-500 via-indigo-400 to-indigo-500", light: "from-indigo-50 to-indigo-100", border: "border-indigo-300", text: "text-indigo-700", icon: "text-indigo-600" },
            pink: { bg: "from-pink-500 via-pink-400 to-pink-500", light: "from-pink-50 to-pink-100", border: "border-pink-300", text: "text-pink-700", icon: "text-pink-600" },
        };

        const theme = colorClasses[color];

        return (
            <div className={`relative overflow-hidden rounded-xl border-2 ${theme.border} shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-105`}>
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${theme.light} opacity-90`}></div>

                {/* Floating accent */}
                <div className={`absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br ${theme.bg} opacity-15 rounded-full blur-2xl group-hover:scale-110 transition-transform`}></div>

                <div className="relative z-10 p-3 flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold ${theme.text} uppercase tracking-widest`}>{label}</p>
                        <p className="text-2xl font-black text-gray-900 mt-1">{value}</p>
                        {trend && (
                            <p className={`text-xs font-semibold ${theme.text} mt-1.5 flex items-center gap-1`}>
                                <FaArrowUp className="text-green-600 text-xs" />
                                {trend}
                            </p>
                        )}
                    </div>
                    <div className={`relative p-2.5 rounded-lg bg-gradient-to-br ${theme.bg} shadow-md flex-shrink-0`}>
                        <Icon className={`text-lg text-white`} />
                        <div className="absolute inset-0 rounded-lg border-2 border-white/20"></div>
                    </div>
                </div>
            </div>
        );
    };

    const tabButtons = [
        { id: "status", label: "Status", icon: FaChartBar, color: "blue" },
        { id: "payment", label: "Payment", icon: FaCreditCard, color: "green" },
        { id: "banks", label: "Banks", icon: FaBuilding, color: "purple" },
        { id: "cities", label: "Cities", icon: FaCity, color: "amber" },
        { id: "timeline", label: "Timeline", icon: FaCalendarAlt, color: "indigo" },
        { id: "engineers", label: "Engineers", icon: FaUsers, color: "pink" },
    ];

    const getTabColor = (color) => {
        const colors = {
            blue: { bg: "from-slate-500 to-slate-600", hover: "hover:from-slate-600 hover:to-slate-700", text: "text-white", border: "border-slate-500" },
            green: { bg: "from-slate-500 to-slate-600", hover: "hover:from-slate-600 hover:to-slate-700", text: "text-white", border: "border-slate-500" },
            purple: { bg: "from-slate-500 to-slate-600", hover: "hover:from-slate-600 hover:to-slate-700", text: "text-white", border: "border-slate-500" },
            amber: { bg: "from-slate-500 to-slate-600", hover: "hover:from-slate-600 hover:to-slate-700", text: "text-white", border: "border-slate-500" },
            indigo: { bg: "from-slate-500 to-slate-600", hover: "hover:from-slate-600 hover:to-slate-700", text: "text-white", border: "border-slate-500" },
            pink: { bg: "from-slate-500 to-slate-600", hover: "hover:from-slate-600 hover:to-slate-700", text: "text-white", border: "border-slate-500" },
        };
        return colors[color] || colors.blue;
    };

    return (
        <Card className="overflow-hidden border-0 bg-white shadow-none rounded-none sm:rounded-none w-full">
            <CardContent className="p-0 flex flex-col h-full min-h-0 w-full overflow-x-hidden">
                {/* Premium Tab Navigation */}
                <div className="bg-white overflow-x-auto flex gap-1 px-3 py-3 flex-shrink-0 border-b border-slate-200 shadow-sm flex-wrap justify-center sm:justify-start scrollbar-none">
                    {tabButtons.map((tab) => {
                        const tabColor = getTabColor(tab.color);
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`relative px-3 py-1.5 rounded-lg font-semibold transition-all duration-300 whitespace-nowrap flex items-center gap-1 group transform hover:scale-102 text-xs sm:text-xs ${isActive
                                    ? `bg-blue-600 text-white shadow-md scale-100 border border-blue-700 hover:scale-105`
                                    : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 hover:border-slate-400"
                                    }`}
                            >
                                <tab.icon className={`text-sm transition-all group-hover:scale-110 duration-200 ${isActive ? 'text-white' : 'text-slate-600 group-hover:text-slate-900'}`} />
                                <span className="hidden sm:inline">{tab.label}</span>
                                {isActive && (
                                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-white rounded-full shadow-md animate-pulse"></div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 p-3 space-y-3 scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-gray-100">
                    {/* Status Tab */}
                    {activeTab === "status" && (
                        <div className="space-y-2.5">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <FaStar className="text-yellow-400 text-lg" />
                                    <h3 className="text-2xl font-black text-gray-900">Status Distribution</h3>
                                </div>
                                <p className="text-xs text-gray-600 font-medium">Real-time overview of all submissions across different processing stages</p>
                            </div>

                            {/* Premium Chart Container */}
                            <div className="relative overflow-visible rounded-xl border border-slate-200/50 shadow-sm hover:shadow-md transition-all duration-300 group bg-white">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-slate-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="absolute -top-16 -right-16 w-32 h-32 bg-blue-400/5 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-500"></div>
                                <div className="relative z-10 p-4">
                                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200">
                                        <div className="w-1 h-5 bg-gradient-to-b from-blue-600 to-blue-400 rounded-full shadow-md"></div>
                                        <p className="text-xs font-bold text-slate-700 uppercase tracking-widest">Submission Status Breakdown</p>
                                    </div>
                                    <ResponsiveContainer width="100%" height={130}>
                                        <BarChart
                                            data={statusData}
                                            margin={{ top: 6, right: 16, left: 88, bottom: 6 }}
                                            layout="vertical"
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={true} vertical={false} />
                                            <XAxis type="number" stroke="#374151" fontSize={12} fontWeight="700" />
                                            <YAxis type="category" dataKey="name" stroke="#374151" fontSize={11} fontWeight="700" width={85} />
                                            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(59, 130, 246, 0.1)" }} />
                                            <Bar dataKey="value" radius={[0, 12, 12, 0]} animationDuration={1000} isAnimationActive={true}>
                                                {statusData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.fill} opacity={0.9} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Payment Tab */}
                    {activeTab === "payment" && (
                        <div className="space-y-2.5">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <FaStar className="text-yellow-400 text-lg" />
                                    <h3 className="text-2xl font-black text-gray-900">Payment Collection Status</h3>
                                </div>
                                <p className="text-xs text-gray-600 font-medium">Track payment collection metrics across all submissions</p>
                            </div>

                            {/* Payment Stats */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {paymentData.map((item, index) => (
                                    <StatCard
                                        key={index}
                                        icon={FaCreditCard}
                                        label={item.name}
                                        value={item.value}
                                        color={index === 0 ? 'green' : 'red'}
                                        trend={`${((item.value / paymentData.reduce((a, b) => a + b.value, 0)) * 100).toFixed(1)}%`}
                                    />
                                ))}
                            </div>

                            {/* Premium Chart Container */}
                            <div className="relative overflow-visible rounded-xl border border-slate-200/50 shadow-sm hover:shadow-md transition-all duration-300 group bg-white">
                                <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 via-transparent to-slate-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="absolute -top-16 -right-16 w-32 h-32 bg-green-400/5 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-500"></div>
                                <div className="relative z-10 p-4">
                                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200">
                                        <div className="w-1 h-5 bg-gradient-to-b from-green-600 to-green-400 rounded-full shadow-md"></div>
                                        <p className="text-xs font-bold text-slate-700 uppercase tracking-widest">Payment Collection Distribution</p>
                                    </div>
                                    <ResponsiveContainer width="100%" height={145}>
                                        <PieChart>
                                            <Pie
                                                data={paymentData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={true}
                                                label={({ name, value, percent }) =>
                                                    `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                                                }
                                                outerRadius={36}
                                                innerRadius={16}
                                                dataKey="value"
                                                animationDuration={1200}
                                                isAnimationActive={true}
                                            >
                                                {paymentData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.fill} opacity={0.9} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Banks Tab */}
                    {activeTab === "banks" && (
                        <div className="space-y-2.5">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <FaStar className="text-yellow-400 text-lg" />
                                    <h3 className="text-2xl font-black text-gray-900">Top Banks Distribution</h3>
                                </div>
                                <p className="text-xs text-gray-600 font-medium">Market share and submissions across banking partners</p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                {/* Banks Summary Table */}
                                <div className="lg:col-span-1 rounded-2xl border border-neutral-300 shadow-md overflow-hidden hover:shadow-lg transition-all duration-500 group bg-neutral-0">
                                    <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 px-5 py-4 shadow-sm group-hover:shadow-md transition-shadow">
                                        <p className="text-white font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                                            <FaBuilding className="text-base" />
                                            Bank List
                                        </p>
                                    </div>
                                    <div className="max-h-80 bg-white scrollbar-thin scrollbar-thumb-purple-400 scrollbar-track-gray-100 overflow-y-auto">
                                        <table className="w-full">
                                            <thead className="sticky top-0 bg-gradient-to-r from-purple-50 to-purple-100">
                                                <tr className="bg-gradient-to-r from-purple-50 to-purple-100 border-b-2 border-purple-200">
                                                    <th className="px-4 py-2 text-left text-xs font-bold text-purple-900 uppercase tracking-wider">Bank</th>
                                                    <th className="px-4 py-2 text-right text-xs font-bold text-purple-900 uppercase tracking-wider">Count</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {bankData.map((item, index) => (
                                                    <tr key={index} className="border-b border-gray-100 hover:bg-purple-50/50 transition-colors group">
                                                        <td className="px-4 py-3 text-xs font-semibold text-gray-900">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-3 h-3 rounded-md shadow-sm group-hover:scale-110 transition-transform" style={{ backgroundColor: item.fill }}></div>
                                                                <span>{item.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-purple-200 to-purple-100 text-purple-700 font-bold text-xs shadow-sm">{item.value}</span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Banks Pie Chart */}
                                <div className="lg:col-span-2 relative overflow-visible rounded-2xl border border-neutral-300 shadow-md hover:shadow-lg transition-all duration-500 group bg-neutral-0">
                                    <div className="absolute inset-0 bg-gradient-to-br from-neutral-100/60 via-transparent to-neutral-100/60 opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-400/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-500"></div>
                                    <div className="relative z-10 p-3">
                                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-200">
                                            <div className="w-1 h-5 bg-gradient-to-b from-purple-600 to-purple-400 rounded-full shadow-md"></div>
                                            <p className="text-xs font-bold text-gray-800 uppercase tracking-widest">Market Share Distribution</p>
                                        </div>
                                        <ResponsiveContainer width="100%" height={165}>
                                            <PieChart>
                                                <Pie
                                                    data={bankData}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={true}
                                                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                                                    outerRadius={40}
                                                    innerRadius={20}
                                                    dataKey="value"
                                                    animationDuration={1200}
                                                    isAnimationActive={true}
                                                >
                                                    {bankData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.fill} opacity={0.9} />
                                                    ))}
                                                </Pie>
                                                <Tooltip content={<CustomTooltip />} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Cities Tab */}
                    {activeTab === "cities" && cityData.length > 0 && (
                        <div className="space-y-2.5">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <FaStar className="text-yellow-400 text-lg" />
                                    <h3 className="text-2xl font-black text-gray-900">Top Cities Distribution</h3>
                                </div>
                                <p className="text-xs text-gray-600 font-medium">Submission volume analysis across top cities</p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                {/* Cities Summary Table */}
                                <div className="lg:col-span-1 rounded-2xl border border-neutral-300 shadow-md overflow-hidden hover:shadow-lg transition-all duration-500 group bg-neutral-0">
                                    <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 px-5 py-4 shadow-sm group-hover:shadow-md transition-shadow">
                                        <p className="text-white font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                                            <FaCity className="text-base" />
                                            City Rankings
                                        </p>
                                    </div>
                                    <div className="max-h-80 bg-white scrollbar-thin scrollbar-thumb-amber-400 scrollbar-track-gray-100 overflow-y-auto">
                                        <table className="w-full">
                                            <thead className="sticky top-0 bg-gradient-to-r from-amber-50 to-amber-100">
                                                <tr className="bg-gradient-to-r from-amber-50 to-amber-100 border-b-2 border-amber-200">
                                                    <th className="px-4 py-2 text-left text-xs font-bold text-amber-900 uppercase tracking-wider">City</th>
                                                    <th className="px-4 py-2 text-right text-xs font-bold text-amber-900 uppercase tracking-wider">Count</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {cityData.map((item, index) => (
                                                    <tr key={index} className="border-b border-gray-100 hover:bg-amber-50/50 transition-colors">
                                                        <td className="px-4 py-3 text-xs font-semibold text-gray-900">
                                                            <div className="flex items-center gap-2">
                                                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-amber-200 to-amber-100 text-amber-700 font-bold text-xs">{index + 1}</span>
                                                                {item.name}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-amber-200 to-amber-100 text-amber-700 font-bold text-xs shadow-sm">{item.count}</span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Cities Bar Chart */}
                                <div className="lg:col-span-2 relative overflow-visible rounded-2xl border border-neutral-300 shadow-md hover:shadow-lg transition-all duration-500 group bg-neutral-0">
                                    <div className="absolute inset-0 bg-gradient-to-br from-neutral-100/60 via-transparent to-neutral-100/60 opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-amber-400/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-500"></div>
                                    <div className="relative z-10 p-3">
                                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-200">
                                            <div className="w-1 h-5 bg-gradient-to-b from-amber-600 to-amber-400 rounded-full shadow-md"></div>
                                            <p className="text-xs font-bold text-gray-800 uppercase tracking-widest">City-wise Submission Volume</p>
                                        </div>
                                        <ResponsiveContainer width="100%" height={205}>
                                            <BarChart data={cityData} margin={{ top: 8, right: 16, left: 6, bottom: 46 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" horizontal={true} vertical={false} />
                                                <XAxis
                                                    dataKey="name"
                                                    stroke="#b45309"
                                                    fontSize={10}
                                                    fontWeight="700"
                                                    angle={-45}
                                                    textAnchor="end"
                                                    height={46}
                                                />
                                                <YAxis stroke="#b45309" fontSize={11} fontWeight="700" width={28} />
                                                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(251, 146, 60, 0.15)" }} />
                                                <Bar dataKey="count" fill="#f59e0b" radius={[10, 10, 0, 0]} animationDuration={1000} isAnimationActive={true} opacity={0.9} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Timeline Tab */}
                    {activeTab === "timeline" && analyticsData.monthlyData.length > 0 && (
                        <div className="space-y-2.5">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <FaStar className="text-yellow-400 text-lg" />
                                    <h3 className="text-2xl font-black text-gray-900">Submission Timeline & Trends</h3>
                                </div>
                                <p className="text-xs text-gray-600 font-medium">Monthly submission volume and approval patterns</p>
                            </div>

                            {/* KPI Cards */}
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                                <StatCard
                                    icon={FaBolt}
                                    label="Total"
                                    value={files.length}
                                    color="indigo"
                                    trend="All submissions"
                                />
                                <StatCard
                                    icon={FaCheckCircle}
                                    label="Approved"
                                    value={files.filter(f => f.status === "approved").length}
                                    color="green"
                                    trend="Success"
                                />
                                <StatCard
                                    icon={FaFireAlt}
                                    label="Rejected"
                                    value={files.filter(f => f.status === "rejected").length}
                                    color="red"
                                    trend="Issues"
                                />
                                <StatCard
                                    icon={FaAward}
                                    label="Success Rate"
                                    value={`${files.length > 0 ? ((files.filter(f => f.status === "approved").length / files.length) * 100).toFixed(0) : 0}%`}
                                    color="purple"
                                    trend="Performance"
                                />
                            </div>

                            {/* Premium Chart Container */}
                            <div className="relative overflow-visible rounded-xl border border-slate-200/50 shadow-sm hover:shadow-md transition-all duration-300 group bg-white">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 via-transparent to-slate-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="absolute -top-16 -right-16 w-32 h-32 bg-indigo-400/5 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-500"></div>
                                <div className="relative z-10 p-4">
                                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200">
                                        <div className="w-1 h-5 bg-gradient-to-b from-indigo-600 to-indigo-400 rounded-full shadow-md"></div>
                                        <p className="text-xs font-bold text-slate-700 uppercase tracking-widest">Monthly Submission Trends</p>
                                    </div>
                                    <ResponsiveContainer width="100%" height={225}>
                                        <ComposedChart data={analyticsData.monthlyData} margin={{ top: 8, right: 16, left: 6, bottom: 18 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" horizontal={true} vertical={false} />
                                            <XAxis dataKey="name" stroke="#312e81" fontSize={10} fontWeight="700" />
                                            <YAxis stroke="#312e81" fontSize={11} fontWeight="700" width={32} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend wrapperStyle={{ paddingTop: "6px", fontSize: "12px", fontWeight: "600" }} />
                                            <Area type="monotone" dataKey="submissions" fill="#4f46e5" stroke="#4f46e5" fillOpacity={0.2} strokeWidth={1.5} isAnimationActive={true} animationDuration={1000} />
                                            <Bar dataKey="approved" fill="#10b981" radius={[6, 6, 0, 0]} animationDuration={1000} isAnimationActive={true} opacity={0.9} />
                                            <Bar dataKey="rejected" fill="#ef4444" radius={[6, 6, 0, 0]} animationDuration={1000} isAnimationActive={true} opacity={0.9} />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Engineers Tab */}
                    {activeTab === "engineers" && analyticsData.engineerStats.length > 0 && (
                        <div className="space-y-2.5">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <FaStar className="text-yellow-400 text-lg" />
                                    <h3 className="text-2xl font-black text-gray-900">Engineer Performance Analytics</h3>
                                </div>
                                <p className="text-xs text-gray-600 font-medium">Individual engineer statistics and approval metrics</p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                                {/* Engineer Stats Table */}
                                <div className="lg:col-span-2 rounded-2xl border border-neutral-300 shadow-md overflow-hidden hover:shadow-lg transition-all duration-500 group bg-neutral-0">
                                    <div className="bg-gradient-to-r from-pink-600 via-pink-500 to-pink-600 px-5 py-4 shadow-sm group-hover:shadow-md transition-shadow">
                                        <p className="text-white font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                                            <FaUsers className="text-base" />
                                            Engineer Metrics
                                        </p>
                                    </div>
                                    <div className="max-h-80 bg-white scrollbar-thin scrollbar-thumb-pink-400 scrollbar-track-gray-100 overflow-y-auto">
                                        <table className="w-full">
                                            <thead className="sticky top-0 bg-gradient-to-r from-pink-50 to-pink-100">
                                                <tr className="bg-gradient-to-r from-pink-50 to-pink-100 border-b-2 border-pink-200">
                                                    <th className="px-4 py-2 text-left text-xs font-bold text-pink-900 uppercase tracking-wider">Engineer</th>
                                                    <th className="px-4 py-2 text-center text-xs font-bold text-pink-900 uppercase tracking-wider">Stats</th>
                                                    <th className="px-4 py-2 text-right text-xs font-bold text-pink-900 uppercase tracking-wider">Rate</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {analyticsData.engineerStats.map((item, index) => (
                                                    <tr key={index} className="border-b border-gray-100 hover:bg-pink-50/50 transition-colors">
                                                        <td className="px-4 py-3 text-xs font-semibold text-gray-900">{item.name}</td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center justify-center gap-1.5">
                                                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-green-200 to-green-100 text-green-700 font-bold text-xs" title="Approved">{item.approved}</span>
                                                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-red-200 to-red-100 text-red-700 font-bold text-xs" title="Rejected">{item.rejected}</span>
                                                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-amber-200 to-amber-100 text-amber-700 font-bold text-xs" title="Pending">{item.pending}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-pink-200 to-pink-100 text-pink-700 font-bold text-xs shadow-sm">{item.approvalRate}%</span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Engineer Stats Bar Chart */}
                                <div className="lg:col-span-2 relative overflow-visible rounded-2xl border border-neutral-300 shadow-md hover:shadow-lg transition-all duration-500 group bg-neutral-0">
                                    <div className="absolute inset-0 bg-gradient-to-br from-neutral-100/60 via-transparent to-neutral-100/60 opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-pink-400/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-500"></div>
                                    <div className="relative z-10 p-3">
                                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-200">
                                            <div className="w-1 h-5 bg-gradient-to-b from-pink-600 to-pink-400 rounded-full shadow-md"></div>
                                            <p className="text-xs font-bold text-gray-800 uppercase tracking-widest">Performance Distribution</p>
                                        </div>
                                        <ResponsiveContainer width="100%" height={225}>
                                            <BarChart data={analyticsData.engineerStats} margin={{ top: 8, right: 16, left: 6, bottom: 46 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#fbcfe8" horizontal={true} vertical={false} />
                                                <XAxis
                                                    dataKey="name"
                                                    stroke="#be185d"
                                                    fontSize={10}
                                                    fontWeight="700"
                                                    angle={-45}
                                                    textAnchor="end"
                                                    height={46}
                                                />
                                                <YAxis stroke="#be185d" fontSize={11} fontWeight="700" width={30} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Legend wrapperStyle={{ paddingTop: "6px", fontSize: "12px", fontWeight: "600" }} />
                                                <Bar dataKey="approved" fill="#10b981" radius={[6, 6, 0, 0]} animationDuration={1000} isAnimationActive={true} opacity={0.9} />
                                                <Bar dataKey="rejected" fill="#ef4444" radius={[6, 6, 0, 0]} animationDuration={1000} isAnimationActive={true} opacity={0.9} />
                                                <Bar dataKey="pending" fill="#f59e0b" radius={[6, 6, 0, 0]} animationDuration={1000} isAnimationActive={true} opacity={0.9} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
});

StatusGraph.displayName = "StatusGraph";

export default StatusGraph;
