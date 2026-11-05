import { useEffect, useState } from "react"

export const useFetch = (url) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    console.log(url);
    const fetchData = async () => {
        try {
            const response = await fetch(url);
            if(!response.ok){
                throw new Error(`HTTP ${response.statusText}`)
            }
            const data = await response.json();
            setData(data);
            setError(null)
        } catch (error) {
            console.log(error.message);
            setError(error.message);
        }
        setLoading(false);
    }

    useEffect(() => {
        fetchData();
    }, [url]);

    return { data, loading, error }
}

/*
import { useEffect, useState } from "react"

export const useFetch = (url) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    console.log(url);
    const fetchData = async () => {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const data = await response.json();
            setData(data);
            setError(null);
        } catch (error) {
            console.log(error);
            setError(error.message);
        }
        setLoading(false);
    }

    useEffect(() => {
        fetchData();
    }, [url]);

    return { data, loading, error }
}
*/

/*
// hooks/useFetch.js
import { useCallback, useEffect, useState } from 'react';

export function useFetch(url) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(url));
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!url) return;                       // null URL = skip
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    fetch(url, { signal: controller.signal })
      .then(res => {
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        return res.json();
      })
      .then(json => { setData(json); setIsLoading(false); })
      .catch(err => {
        if (err.name === 'AbortError') return;
        setError(err.message);
        setIsLoading(false);
      });

    return () => controller.abort();
  }, [url, reloadKey]);

  const refetch = useCallback(() => setReloadKey(k => k + 1), []);
  return { data, isLoading, error, refetch };
}

*/