import React, { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import toast, { Toaster } from 'react-hot-toast';
import { useSpikes } from '../hooks/useSpikes';
import { useSymbols } from '../hooks/useSymbols';
import Table from '../components/SharedTable';
import Select from 'react-select';
import { getCustomSelectStyles } from '../styles/reactSelectStyles';

const EquityPage = () => {
    const isDark = document.documentElement.classList.contains('dark');
    const [selectedSymbols, setSelectedSymbols] = useState([]);
    const [volumeThreshold, setVolumeThreshold] = useState(100000);
    const [dateOption, setDateOption] = useState('today');
    const [sortBy, setSortBy] = useState('timestamp');
    const [sortOrder, setSortOrder] = useState('desc');
    const [page, setPage] = useState(1);
    const [limit] = useState(100);

    const seenSpikesRef = useRef(new Set());
    const isInitialLoadRef = useRef(true);
    const lastPageRef = useRef(page);

    const from = new Date();
    from.setDate(from.getDate() - (dateOption === 'today' ? 0 : 1));
    from.setHours(0, 0, 0, 0);

    const { data: symbolsData = [], isLoading: loadingSymbols } = useSymbols();
    const symbolOptions = symbolsData.map(sym => ({ label: sym, value: sym }));
    const selectedSymbolValues = selectedSymbols.map(s => s.value);

    // Main data for UI (only poll if on page 1)
    const {
        data: spikesData,
        isLoading,
    } = useSpikes({
        segment: 'Equity',
        volume: volumeThreshold,
        from: from.toISOString(),
        page,
        limit,
        symbols: selectedSymbolValues,
        sortBy,
        sortOrder,
    }, false); // no polling for main UI query


    // Background polling for page 1 (for notifications)
    // Background polling for page 1 (for notifications) — always fetch latest first
    const {
        data: latestSpikesData,
    } = useSpikes({
        segment: 'Equity',
        volume: volumeThreshold,
        from: from.toISOString(),
        page: 1,
        limit,
        symbols: selectedSymbolValues,
        sortBy: 'timestamp',
        sortOrder: 'desc',
    }, true);


    // Notifications from polling page 1
    useEffect(() => {
        if (!latestSpikesData?.spikes) return;

        const now = Date.now();

        const newSpikes = latestSpikesData.spikes.filter(spike => {
            const key = `${spike.symbol}:${spike.volumeDelta}`;
            const spikeTime = new Date(spike.timestamp).getTime();
            let isRecent = now - spikeTime <= 180_000; // within last 3 mins
            isRecent = true

            return isRecent && !seenSpikesRef.current.has(key);
        });

        newSpikes.slice(0, 3).forEach(spike => {
            const key = `${spike.symbol}:${spike.volumeDelta}`;
            seenSpikesRef.current.add(key);

            showDesktopNotification(spike);

            toast.custom(t => (
                <div className="bg-white dark:bg-gray-900 border dark:border-gray-700 shadow-lg rounded px-4 py-3 flex items-center justify-between w-[360px] animate-slide-in-left">
                    <div className="text-sm text-gray-800 dark:text-gray-200">
                        📊 <strong>{spike.symbol}</strong> spiked with <strong>{spike.volumeDelta.toLocaleString()}</strong> volume
                    </div>
                    <button
                        onClick={() => {
                            setPage(1);
                            setSelectedSymbols(prev => {
                                const alreadyIncluded = prev.some(s => s.value === spike.symbol);
                                if (alreadyIncluded) return prev;
                                return [...prev, { label: spike.symbol, value: spike.symbol }];
                            });
                            toast.dismiss(t.id);
                        }}
                        className="ml-3 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                    >
                        View
                    </button>
                </div>
            ), { duration: 6000, position: 'bottom-left' });
        });
    }, [latestSpikesData]);



    // Mark spikes on page load to avoid duplicate notification
    useEffect(() => {
        if (!spikesData?.spikes) return;
        const isPageChange = lastPageRef.current !== page;
        lastPageRef.current = page;

        if (isInitialLoadRef.current || isPageChange) {
            spikesData.spikes.forEach(spike => {
                const key = `${spike.symbol}:${spike.volumeDelta}`;
                seenSpikesRef.current.add(key);
            });
            isInitialLoadRef.current = false;
        }
    }, [spikesData, page]);

    useEffect(() => {
        Notification.requestPermission();
    }, []);

    useEffect(() => {
        isInitialLoadRef.current = true;
        setPage(1);
    }, [volumeThreshold, dateOption, selectedSymbols, sortBy, sortOrder]);

    const showDesktopNotification = (spike) => {
        const title = `📈 ${spike.symbol} spiked!`;
        const body = `Volume: ${spike.volumeDelta.toLocaleString()}`;

        if ("Notification" in window && Notification.permission === "granted") {
            new Notification(title, { body });
        }

        const audio = new Audio('/notification.mp3');
        audio.play().catch(err => console.warn("Sound play failed:", err));
    };

    return (
        <section className="max-w-6xl mx-auto px-4">
            <Toaster />
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
                    📊 Equity Volume Spikes
                </h1>
                <div className="flex gap-3 items-center">
                    <select
                        value={volumeThreshold}
                        onChange={(e) => setVolumeThreshold(Number(e.target.value))}
                        className="p-2 rounded dark:bg-gray-800 border dark:border-gray-600"
                    >
                        <option value={50000}>50K</option>
                        <option value={100000}>100K</option>
                        <option value={200000}>200K</option>
                    </select>
                    <select
                        value={dateOption}
                        onChange={(e) => setDateOption(e.target.value)}
                        className="p-2 rounded dark:bg-gray-800 border dark:border-gray-600"
                    >
                        <option value="today">Today</option>
                        <option value="yesterday">Yesterday</option>
                    </select>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="p-2 rounded dark:bg-gray-800 border dark:border-gray-600"
                    >
                        <option value="timestamp">Sort by Time</option>
                        <option value="volumeDelta">Sort by Volume</option>
                    </select>
                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="p-2 rounded dark:bg-gray-800 border dark:border-gray-600"
                    >
                        <option value="desc">🔽 Desc</option>
                        <option value="asc">🔼 Asc</option>
                    </select>
                </div>
            </div>

            <div className="mb-4">
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                    Filter by symbols
                </label>
                <Select
                    options={symbolOptions}
                    isMulti
                    isLoading={loadingSymbols}
                    value={selectedSymbols}
                    onChange={setSelectedSymbols}
                    placeholder="🔍 Search and select symbols..."
                    styles={getCustomSelectStyles(isDark)}
                />
            </div>

            <Table rows={spikesData?.spikes || []} loading={isLoading} />

            {!isLoading && spikesData?.total > limit && (
                <div className="flex justify-center items-center gap-4 mt-4">
                    <button
                        onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
                        disabled={page === 1}
                    >
                        ⬅ Prev
                    </button>
                    <span className="text-gray-700 dark:text-gray-300">
                        Page {page} of {Math.ceil(spikesData.total / limit)}
                    </span>
                    <button
                        onClick={() => setPage(prev => prev + 1)}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
                        disabled={page >= Math.ceil(spikesData.total / limit)}
                    >
                        Next ➡
                    </button>
                </div>
            )}

            {spikesData?.lastUpdated && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                    Last updated at <span className="font-mono">{format(new Date(spikesData.lastUpdated), 'HH:mm:ss')}</span>
                </p>
            )}
        </section>
    );
};

export default EquityPage;
