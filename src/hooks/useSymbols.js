// src/hooks/useSymbols.js
import { useQuery } from '@tanstack/react-query';
import { fetchSymbols } from '../api/spikes';

export const useSymbols = () =>
    useQuery({
        queryKey: ['symbols'],
        queryFn: fetchSymbols,
        staleTime: 60_000,
        retry: 2,
    });
