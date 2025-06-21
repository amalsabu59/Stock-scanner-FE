import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import Table from './SharedTable';

const OptionsPage = () => {
    const [spikes, setSpikes] = useState([]);
    const [loading, setLoading] = useState(true); // used only for first-time load or user actions
    const [lastUpdated, setLastUpdated] = useState(null);
    const [search, setSearch] = useState('');
    const [volumeThreshold, setVolumeThreshold] = useState(10000);
    const [dateOption, setDateOption] = useState('today');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 20;

    const fetchOptionSpikes = async (showLoader = false) => {
        if (showLoader) setLoading(true);

        const daysAgo = dateOption === 'today' ? 0 : 1;
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - daysAgo);
        fromDate.setHours(0, 0, 0, 0);

        const fromISO = fromDate.toISOString();
        const url = `http://localhost:3000/api/spikes?segment=Options&volume=${volumeThreshold}&from=${fromISO}&page=${page}&limit=${limit}`;

        try {
            const res = await fetch(url);
            const { spikes, total } = await res.json();
            setSpikes(spikes);
            setTotal(total);
            setLastUpdated(new Date());
        } catch (err) {
            console.error(err);
        } finally {
            if (showLoader) setLoading(false);
        }
    };

    useEffect(() => {
        fetchOptionSpikes(true); // show loading only on first load or manual change
    }, [volumeThreshold, dateOption, page]);

    useEffect(() => {
        setPage(1);
    }, [volumeThreshold, dateOption, search]);

    // Poll every 30s in background without loader flickering
    useEffect(() => {
        const interval = setInterval(() => fetchOptionSpikes(false), 10000);
        return () => clearInterval(interval);
    }, [volumeThreshold, dateOption, page]);

    const filtered = spikes.filter((s) =>
        s.symbol.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <section className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
                    📈 Options Volume Spikes
                </h1>
                <div className="flex gap-3">
                    <select
                        value={volumeThreshold}
                        onChange={(e) => setVolumeThreshold(Number(e.target.value))}
                        className="p-2 rounded dark:bg-gray-800 border dark:border-gray-600"
                    >
                        <option value={10000}>10K</option>
                        <option value={20000}>20K</option>
                        <option value={40000}>40K</option>
                        <option value={80000}>80K</option>
                        <option value={100000}>100K</option>
                    </select>
                    <select
                        value={dateOption}
                        onChange={(e) => setDateOption(e.target.value)}
                        className="p-2 rounded dark:bg-gray-800 border dark:border-gray-600"
                    >
                        <option value="today">Today</option>
                        <option value="yesterday">Yesterday</option>
                    </select>
                </div>
            </div>

            {lastUpdated && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Last updated at <span className="font-mono">{format(lastUpdated, 'HH:mm:ss')}</span>
                </p>
            )}

            <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="🔍 Search option symbols..."
                className="mb-4 w-full p-3 rounded-lg bg-white dark:bg-gray-800 border dark:border-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
            />

            <Table rows={filtered} loading={loading} />

            {!loading && total > limit && (
                <div className="flex justify-center items-center gap-4 mt-4">
                    <button
                        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
                        disabled={page === 1}
                    >
                        ⬅ Prev
                    </button>
                    <span className="text-gray-700 dark:text-gray-300">
                        Page {page} of {Math.ceil(total / limit)}
                    </span>
                    <button
                        onClick={() => setPage((prev) => prev + 1)}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
                        disabled={page >= Math.ceil(total / limit)}
                    >
                        Next ➡
                    </button>
                </div>
            )}
        </section>
    );
};

export default OptionsPage;
