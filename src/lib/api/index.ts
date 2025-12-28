// ============================================
// Luxury Ops - API Layer
// ============================================
// This module provides a centralized API abstraction layer
// that can be easily switched between mock data and real APIs

import { Hotel, DatePriceAvailability, Inquiry, DestinationBoard } from '@/lib/types';
import { hotels, destinationBoards, getHotelsByBoard, getHotelById } from '@/lib/mock-data/hotels';
import { getPriceDataForHotel, getAllPriceData, calculateDateRangeSummary } from '@/lib/mock-data/prices';
import { mockInquiries, getInquiriesByStage, getInquiryById } from '@/lib/mock-data/inquiries';

// ============================================
// Configuration
// ============================================
const USE_REAL_API = false; // Toggle for real API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';

// ============================================
// API Response Types
// ============================================
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    error?: string;
    timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
}

// ============================================
// Hotels API
// ============================================
export const hotelsApi = {
    // Get all hotels
    async getAll(): Promise<Hotel[]> {
        if (USE_REAL_API) {
            const res = await fetch(`${API_BASE_URL}/hotels`);
            const json: ApiResponse<Hotel[]> = await res.json();
            return json.data;
        }
        // Mock: simulate network delay
        await delay(100);
        return hotels;
    },

    // Get hotel by ID
    async getById(id: string): Promise<Hotel | undefined> {
        if (USE_REAL_API) {
            const res = await fetch(`${API_BASE_URL}/hotels/${id}`);
            const json: ApiResponse<Hotel> = await res.json();
            return json.data;
        }
        await delay(50);
        return getHotelById(id);
    },

    // Get hotels by board
    async getByBoard(boardId: string): Promise<Hotel[]> {
        if (USE_REAL_API) {
            const res = await fetch(`${API_BASE_URL}/hotels?board=${boardId}`);
            const json: ApiResponse<Hotel[]> = await res.json();
            return json.data;
        }
        await delay(80);
        return getHotelsByBoard(boardId);
    },

    // Search hotels
    async search(query: string, filters?: {
        board?: string;
        priceMin?: number;
        priceMax?: number;
        advantageLevel?: string;
    }): Promise<Hotel[]> {
        if (USE_REAL_API) {
            const params = new URLSearchParams({ q: query, ...filters as any });
            const res = await fetch(`${API_BASE_URL}/hotels/search?${params}`);
            const json: ApiResponse<Hotel[]> = await res.json();
            return json.data;
        }
        await delay(100);
        return hotels.filter(h =>
            h.name_cn.includes(query) ||
            h.name_en.toLowerCase().includes(query.toLowerCase())
        );
    },
};

// ============================================
// Destinations API
// ============================================
export const destinationsApi = {
    // Get all boards
    async getBoards(): Promise<DestinationBoard[]> {
        if (USE_REAL_API) {
            const res = await fetch(`${API_BASE_URL}/destinations`);
            const json: ApiResponse<DestinationBoard[]> = await res.json();
            return json.data;
        }
        await delay(50);
        return destinationBoards;
    },
};

// ============================================
// Prices & Availability API
// ============================================
export const pricesApi = {
    // Get price data for a hotel
    async getForHotel(hotelId: string, startDate?: string, endDate?: string): Promise<DatePriceAvailability[]> {
        if (USE_REAL_API) {
            const params = new URLSearchParams();
            if (startDate) params.set('start', startDate);
            if (endDate) params.set('end', endDate);
            const res = await fetch(`${API_BASE_URL}/hotels/${hotelId}/prices?${params}`);
            const json: ApiResponse<DatePriceAvailability[]> = await res.json();
            return json.data;
        }
        await delay(80);
        let data = getPriceDataForHotel(hotelId);
        if (startDate) {
            data = data.filter(p => p.date >= startDate);
        }
        if (endDate) {
            data = data.filter(p => p.date <= endDate);
        }
        return data;
    },

    // Get summary for date range
    async getSummary(hotelId: string, startDate: string, endDate: string) {
        if (USE_REAL_API) {
            const res = await fetch(`${API_BASE_URL}/hotels/${hotelId}/prices/summary?start=${startDate}&end=${endDate}`);
            const json: ApiResponse<any> = await res.json();
            return json.data;
        }
        await delay(50);
        // Get price data for the date range first
        const priceData = getPriceDataForHotel(hotelId).filter(
            p => p.date >= startDate && p.date <= endDate
        );
        return calculateDateRangeSummary(priceData);
    },

    // Refresh price from channel (trigger sync)
    async refresh(hotelId: string): Promise<{ success: boolean }> {
        if (USE_REAL_API) {
            const res = await fetch(`${API_BASE_URL}/hotels/${hotelId}/prices/refresh`, { method: 'POST' });
            return res.json();
        }
        await delay(200);
        return { success: true };
    },
};

// ============================================
// Inquiries API
// ============================================
export const inquiriesApi = {
    // Get all inquiries
    async getAll(): Promise<Inquiry[]> {
        if (USE_REAL_API) {
            const res = await fetch(`${API_BASE_URL}/inquiries`);
            const json: ApiResponse<Inquiry[]> = await res.json();
            return json.data;
        }
        await delay(100);
        return mockInquiries;
    },

    // Get inquiry by ID
    async getById(id: string): Promise<Inquiry | undefined> {
        if (USE_REAL_API) {
            const res = await fetch(`${API_BASE_URL}/inquiries/${id}`);
            const json: ApiResponse<Inquiry> = await res.json();
            return json.data;
        }
        await delay(50);
        return getInquiryById(id);
    },

    // Create new inquiry
    async create(inquiry: Partial<Inquiry>): Promise<Inquiry> {
        if (USE_REAL_API) {
            const res = await fetch(`${API_BASE_URL}/inquiries`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(inquiry),
            });
            const json: ApiResponse<Inquiry> = await res.json();
            return json.data;
        }
        await delay(100);
        // Mock: return with generated ID
        return {
            ...inquiry,
            inquiry_id: `inq-${Date.now()}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        } as Inquiry;
    },

    // Update inquiry
    async update(id: string, data: Partial<Inquiry>): Promise<Inquiry> {
        if (USE_REAL_API) {
            const res = await fetch(`${API_BASE_URL}/inquiries/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const json: ApiResponse<Inquiry> = await res.json();
            return json.data;
        }
        await delay(100);
        const existing = getInquiryById(id);
        return { ...existing, ...data, updated_at: new Date().toISOString() } as Inquiry;
    },

    // Add recommendation to inquiry
    async addRecommendation(inquiryId: string, recommendation: any): Promise<Inquiry> {
        if (USE_REAL_API) {
            const res = await fetch(`${API_BASE_URL}/inquiries/${inquiryId}/recommendations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(recommendation),
            });
            const json: ApiResponse<Inquiry> = await res.json();
            return json.data;
        }
        await delay(100);
        const existing = getInquiryById(inquiryId);
        if (!existing) throw new Error('Inquiry not found');
        return {
            ...existing,
            recommended_hotels: [...existing.recommended_hotels, recommendation],
        };
    },
};

// ============================================
// Monitoring API
// ============================================
export const monitoringApi = {
    // Get all tasks
    async getTasks() {
        if (USE_REAL_API) {
            const res = await fetch(`${API_BASE_URL}/monitoring/tasks`);
            return res.json();
        }
        await delay(100);
        // Return mock tasks
        return {
            success: true,
            data: [
                { id: '1', hotel_id: 'fufu-kawaguchiko', status: 'available', last_check: new Date().toISOString() },
                { id: '2', hotel_id: 'aman-kyoto', status: 'unavailable', last_check: new Date().toISOString() },
            ],
        };
    },

    // Create monitoring task
    async create(task: any) {
        if (USE_REAL_API) {
            const res = await fetch(`${API_BASE_URL}/monitoring/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(task),
            });
            return res.json();
        }
        await delay(100);
        return { success: true, data: { id: Date.now().toString(), ...task } };
    },

    // Pause/Resume task
    async toggle(taskId: string, paused: boolean) {
        if (USE_REAL_API) {
            const res = await fetch(`${API_BASE_URL}/monitoring/tasks/${taskId}/toggle`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paused }),
            });
            return res.json();
        }
        await delay(50);
        return { success: true };
    },

    // Delete task
    async delete(taskId: string) {
        if (USE_REAL_API) {
            const res = await fetch(`${API_BASE_URL}/monitoring/tasks/${taskId}`, { method: 'DELETE' });
            return res.json();
        }
        await delay(50);
        return { success: true };
    },
};

// ============================================
// Auto-Booking API
// ============================================
export const autoBookingApi = {
    // Get rules
    async getRules() {
        if (USE_REAL_API) {
            const res = await fetch(`${API_BASE_URL}/auto-booking/rules`);
            return res.json();
        }
        await delay(100);
        return { success: true, data: [] };
    },

    // Create rule
    async createRule(rule: any) {
        if (USE_REAL_API) {
            const res = await fetch(`${API_BASE_URL}/auto-booking/rules`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(rule),
            });
            return res.json();
        }
        await delay(100);
        return { success: true, data: { id: Date.now().toString(), ...rule } };
    },

    // Get execution history
    async getHistory() {
        if (USE_REAL_API) {
            const res = await fetch(`${API_BASE_URL}/auto-booking/history`);
            return res.json();
        }
        await delay(100);
        return { success: true, data: [] };
    },
};

// ============================================
// System API
// ============================================
export const systemApi = {
    // Get logs
    async getLogs(filters?: { level?: string; category?: string; limit?: number }) {
        if (USE_REAL_API) {
            const params = new URLSearchParams(filters as any);
            const res = await fetch(`${API_BASE_URL}/system/logs?${params}`);
            return res.json();
        }
        await delay(100);
        return { success: true, data: [] };
    },

    // Get system stats
    async getStats() {
        if (USE_REAL_API) {
            const res = await fetch(`${API_BASE_URL}/system/stats`);
            return res.json();
        }
        await delay(50);
        return {
            success: true,
            data: {
                monitoring_count: 12,
                available_count: 5,
                error_count: 2,
                today_checks: 156,
            },
        };
    },
};

// ============================================
// Utilities
// ============================================
function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Export all APIs
export const api = {
    hotels: hotelsApi,
    destinations: destinationsApi,
    prices: pricesApi,
    inquiries: inquiriesApi,
    monitoring: monitoringApi,
    autoBooking: autoBookingApi,
    system: systemApi,
};

export default api;
