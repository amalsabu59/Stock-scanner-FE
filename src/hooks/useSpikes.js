// src/hooks/useSpikes.js
import { useQuery } from '@tanstack/react-query';
import { fetchSpikes } from '../api/spikes';

export const useSpikes = (params, enablePolling = false) => {
    return useQuery({
        queryKey: ['spikes', params],
        queryFn: () => fetchSpikes(params),
        keepPreviousData: true,
        refetchInterval: enablePolling ? 10_000 : false,
    });
};
