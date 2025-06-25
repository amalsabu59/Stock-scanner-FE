import React, { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import Table from './SharedTable';
import toast, { Toaster } from 'react-hot-toast';

const EquityPage = () => {
    const [spikes, setSpikes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [search, setSearch] = useState('');
    const [dateOption, setDateOption] = useState('today');
    const [volumeThreshold, setVolumeThreshold] = useState(100000);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 100;

    const seenSpikesRef = useRef(new Set()); // Stores "symbol:volumeDelta"
    const skipNextToastRef = useRef(true); // Skip toast on first load & filter changes

    const fetchEquitySpikes = async (showLoader = false) => {
        if (showLoader) setLoading(true);

        const daysAgo = dateOption === 'today' ? 0 : 1;
        const from = new Date();
        from.setDate(from.getDate() - daysAgo);
        from.setHours(0, 0, 0, 0);

        const url = `https://stock-scanner-be-r8iz.onrender.com/api/spikes?segment=Equity&volume=${volumeThreshold}&from=${from.toISOString()}&page=${page}&limit=${limit}`;

        try {
            const res = await fetch(url);
            const { spikes: newSpikes, total } = await res.json();

            if (skipNextToastRef.current) {
                // Skip toast but mark all as seen
                newSpikes.forEach(s => {
                    const key = `${s.symbol}:${s.volumeDelta}`;
                    seenSpikesRef.current.add(key);
                });
                skipNextToastRef.current = false;
            } else {
                const newSpikesToNotify = newSpikes.filter(spike => {
                    const key = `${spike.symbol}:${spike.volumeDelta}`;
                    return !seenSpikesRef.current.has(key);
                });

                newSpikesToNotify.slice(0, 3).forEach(spike => {
                    const key = `${spike.symbol}:${spike.volumeDelta}`;
                    showDesktopNotification(spike);

                    toast.custom(t => (
                        <div className="bg-white dark:bg-gray-900 border dark:border-gray-700 shadow-lg rounded px-4 py-3 flex items-center justify-between w-[320px] animate-slide-in-left">
                            <div className="text-sm text-gray-800 dark:text-gray-200">
                                📊 <strong>{spike.symbol}</strong> spiked with <strong>{spike.volumeDelta.toLocaleString()}</strong> volume
                            </div>
                            <button
                                onClick={() => toast.dismiss(t.id)}
                                className="ml-3 text-gray-500 hover:text-red-500 text-sm"
                            >
                                ✕
                            </button>
                        </div>
                    ), { duration: 5000, position: 'bottom-left' });

                    seenSpikesRef.current.add(key);
                });
            }

            setSpikes(newSpikes);
            setTotal(total);
            setLastUpdated(new Date());
        } catch (err) {
            console.error(err);
        } finally {
            if (showLoader) setLoading(false);
        }
    };

    // 🔔 Ask permission on mount
    useEffect(() => {
        if ("Notification" in window && Notification.permission !== "granted") {
            Notification.requestPermission();
        }

    }, []);

    // 🔔 Desktop notification + sound
    const showDesktopNotification = (spike) => {
        const title = `📈 ${spike.symbol} spiked!`;
        const body = `Volume: ${spike.volumeDelta.toLocaleString()}`;

        if ("Notification" in window && Notification.permission === "granted") {
            new Notification(title, { body });
        }

        // 🔊 Play sound
        const audio = new Audio('/notification.mp3');
        audio.play().catch((err) => console.warn("Sound play failed:", err));
    };

    useEffect(() => {
        fetchEquitySpikes(true);
    }, [volumeThreshold, dateOption, page]);

    useEffect(() => {
        setPage(1);
        skipNextToastRef.current = true; // skip toast on dropdown change
    }, [volumeThreshold, dateOption]);

    useEffect(() => {
        skipNextToastRef.current = true; // skip toast on page change
    }, [page]);

    useEffect(() => {
        const interval = setInterval(() => fetchEquitySpikes(false), 10000);
        return () => clearInterval(interval);
    }, [volumeThreshold, dateOption, page]);

    const filtered = spikes.filter((s) =>
        s.symbol.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <section className="max-w-6xl mx-auto px-4">
            <Toaster /> {/* Toast container */}

            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
                    📊 Equity Volume Spikes
                </h1>
                {/* <button
                    onClick={() => showDesktopNotification({
                        symbol: 'TEST',
                        volumeDelta: 123456
                    })}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                    🔔 Test Notification
                </button> */}

                <div className="flex gap-3">
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
                placeholder="🔍 Search equity symbols..."
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

export default EquityPage;
