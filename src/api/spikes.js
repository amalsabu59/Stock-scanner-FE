// src/api/spikes.js
import axios from 'axios';

// const BASE_URL = "https://stock-scanner-be-r8iz.onrender.com/api";
const BASE_URL = "http://localhost:3000/api"

export const fetchSymbols = async () => {
    const res = await axios.get(`${BASE_URL}/symbols`);
    return res.data.symbols;
};

export const fetchSpikes = async (params) => {
    const res = await axios.get(`${BASE_URL}/spikes`, { params });
    return res.data;
};
