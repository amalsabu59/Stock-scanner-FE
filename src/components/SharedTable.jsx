import React from 'react';
import { format } from 'date-fns';

const SharedTable = ({ rows, loading }) => {
    const formatTime = (d) => format(new Date(d), 'HH:mm:ss');
    const getVolumeColor = (delta) => {
        if (!delta || isNaN(delta)) return 'bg-gray-300 text-gray-700'; // fallback for invalid or 0
        if (delta > 500000) return 'bg-red-500 text-white';
        if (delta > 300000) return 'bg-orange-500 text-white';
        if (delta > 0) return 'bg-green-500 text-white';
        return 'bg-gray-300 text-gray-700';
    };
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-blue-500 mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Fetching volume spikes, please wait...
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Symbol
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            LTP
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Volume Delta
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Time
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Trade Value
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {rows.map((s, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100 text-left">
                                {s.symbol}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300 text-right">
                                {s.ltp.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 text-md text-right">
                                <span className={`
            ${getVolumeColor(s.volumeDelta)}
            text-white text-xs font-semibold px-5 py-0.5 rounded-full
          `}>
                                    {s.volumeDelta}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300 text-right">
                                {formatTime(s.timestamp)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300 text-right">
                                {"₹" + " " + Math.round(s.volumeDelta * s.openPriceofCandle).toLocaleString()}

                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

        </div>
    );
};

export default SharedTable;
