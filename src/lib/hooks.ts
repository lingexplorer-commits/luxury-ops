// ============================================
// Luxury Ops - Custom Hooks
// ============================================

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

// ============================================
// useCopyToClipboard Hook
// ============================================
export function useCopyToClipboard() {
    const [copied, setCopied] = useState(false);

    const copy = useCallback(async (text: string, successMessage?: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            toast.success(successMessage || '已复制到剪贴板');
            setTimeout(() => setCopied(false), 2000);
            return true;
        } catch (err) {
            toast.error('复制失败，请手动复制');
            return false;
        }
    }, []);

    return { copied, copy };
}

// ============================================
// useLocalStorage Hook
// ============================================
export function useLocalStorage<T>(key: string, initialValue: T) {
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === 'undefined') return initialValue;
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.warn(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    const setValue = (value: T | ((val: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch (error) {
            console.warn(`Error setting localStorage key "${key}":`, error);
        }
    };

    return [storedValue, setValue] as const;
}

// ============================================
// useDebounce Hook
// ============================================
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useState(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    });

    return debouncedValue;
}

// ============================================
// useToggle Hook
// ============================================
export function useToggle(initialValue = false) {
    const [value, setValue] = useState(initialValue);

    const toggle = useCallback(() => setValue(v => !v), []);
    const setTrue = useCallback(() => setValue(true), []);
    const setFalse = useCallback(() => setValue(false), []);

    return { value, toggle, setTrue, setFalse, setValue };
}
