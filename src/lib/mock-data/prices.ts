// ============================================
// Luxury Ops - Mock Price/Availability Data
// ============================================

import { DatePriceAvailability, DateTag, AvailabilityStatus, AdvantageLevel } from '@/lib/types';
import { hotels } from './hotels';
import { addDays, format, isWeekend, getDay } from 'date-fns';

// === Price Configuration per Hotel ===
const hotelPriceConfig: Record<string, {
    baseCost: number;
    basePublicPrice: number;
    weekendMultiplier: number;
    peakMultiplier: number;
    availabilityRate: number; // base availability rate
}> = {
    'hoshinoya-tokyo': { baseCost: 72000, basePublicPrice: 95000, weekendMultiplier: 1.15, peakMultiplier: 1.35, availabilityRate: 0.75 },
    'peninsula-tokyo': { baseCost: 68000, basePublicPrice: 75000, weekendMultiplier: 1.10, peakMultiplier: 1.25, availabilityRate: 0.85 },
    'aman-tokyo': { baseCost: 135000, basePublicPrice: 158000, weekendMultiplier: 1.12, peakMultiplier: 1.40, availabilityRate: 0.70 },
    'park-hyatt-tokyo': { baseCost: 52000, basePublicPrice: 55000, weekendMultiplier: 1.08, peakMultiplier: 1.20, availabilityRate: 0.88 },
    'hoshinoya-kyoto': { baseCost: 85000, basePublicPrice: 120000, weekendMultiplier: 1.18, peakMultiplier: 1.50, availabilityRate: 0.60 },
    'four-seasons-kyoto': { baseCost: 78000, basePublicPrice: 88000, weekendMultiplier: 1.12, peakMultiplier: 1.30, availabilityRate: 0.75 },
    'aman-kyoto': { baseCost: 165000, basePublicPrice: 198000, weekendMultiplier: 1.15, peakMultiplier: 1.45, availabilityRate: 0.55 },
    'hiiragiya': { baseCost: 55000, basePublicPrice: 58000, weekendMultiplier: 1.10, peakMultiplier: 1.35, availabilityRate: 0.50 },
    'fufu-kawaguchiko': { baseCost: 52000, basePublicPrice: 72000, weekendMultiplier: 1.20, peakMultiplier: 1.40, availabilityRate: 0.65 },
    'hoshinoya-fuji': { baseCost: 68000, basePublicPrice: 95000, weekendMultiplier: 1.18, peakMultiplier: 1.45, availabilityRate: 0.60 },
    'fugaku': { baseCost: 35000, basePublicPrice: 42000, weekendMultiplier: 1.15, peakMultiplier: 1.30, availabilityRate: 0.80 },
    'zaborin': { baseCost: 72000, basePublicPrice: 98000, weekendMultiplier: 1.20, peakMultiplier: 1.50, availabilityRate: 0.55 },
    'bourou-noguchi': { baseCost: 55000, basePublicPrice: 72000, weekendMultiplier: 1.15, peakMultiplier: 1.35, availabilityRate: 0.70 },
    'tsuruga-resort': { baseCost: 38000, basePublicPrice: 45000, weekendMultiplier: 1.12, peakMultiplier: 1.25, availabilityRate: 0.82 },
};

// === Special Date Ranges (2025) ===
const specialDates = {
    cherryBlossom: { start: '2025-03-20', end: '2025-04-10' },
    goldenWeek: { start: '2025-04-29', end: '2025-05-05' },
    autumnLeaves: { start: '2025-11-10', end: '2025-11-30' },
    newYear: { start: '2024-12-28', end: '2025-01-03' },
    skiSeason: { start: '2024-12-15', end: '2025-03-15' },
};

function isInDateRange(date: Date, range: { start: string; end: string }): boolean {
    const dateStr = format(date, 'yyyy-MM-dd');
    return dateStr >= range.start && dateStr <= range.end;
}

function getDateTags(date: Date, hotelId: string): DateTag[] {
    const tags: DateTag[] = [];
    const dayOfWeek = getDay(date);

    // Weekend
    if (dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0) {
        tags.push({
            tag_type: 'weekend',
            tag_label: '周末',
            tag_color: '#3b82f6',
        });
    }

    // Cherry blossom
    if (isInDateRange(date, specialDates.cherryBlossom)) {
        tags.push({
            tag_type: 'cherry_blossom',
            tag_label: '樱花季',
            tag_color: '#f472b6',
        });
    }

    // Golden week
    if (isInDateRange(date, specialDates.goldenWeek)) {
        tags.push({
            tag_type: 'golden_week',
            tag_label: '黄金周',
            tag_color: '#f59e0b',
        });
    }

    // Autumn leaves
    if (isInDateRange(date, specialDates.autumnLeaves)) {
        tags.push({
            tag_type: 'autumn_leaves',
            tag_label: '红叶季',
            tag_color: '#ef4444',
        });
    }

    // New year
    if (isInDateRange(date, specialDates.newYear)) {
        tags.push({
            tag_type: 'new_year',
            tag_label: '新年',
            tag_color: '#dc2626',
        });
    }

    return tags;
}

function isPeakSeason(date: Date): boolean {
    return (
        isInDateRange(date, specialDates.cherryBlossom) ||
        isInDateRange(date, specialDates.goldenWeek) ||
        isInDateRange(date, specialDates.autumnLeaves) ||
        isInDateRange(date, specialDates.newYear)
    );
}

function getAdvantageLevel(percent: number): AdvantageLevel {
    if (percent >= 25) return 'excellent';
    if (percent >= 15) return 'good';
    if (percent >= 10) return 'fair';
    return 'none';
}

function generateAvailabilityStatus(
    baseRate: number,
    isWeekendDay: boolean,
    isPeak: boolean,
    randomSeed: number
): { status: AvailabilityStatus; roomsLeft: number | null; historicalRate: number | null } {
    // Reduce availability on weekends and peak
    let effectiveRate = baseRate;
    if (isWeekendDay) effectiveRate -= 0.15;
    if (isPeak) effectiveRate -= 0.25;

    // Use deterministic "random" based on seed
    const pseudoRandom = Math.sin(randomSeed) * 10000;
    const rand = pseudoRandom - Math.floor(pseudoRandom);

    if (rand < effectiveRate) {
        // Available
        const roomsLeft = rand < 0.2 ? Math.floor(rand * 10) + 1 : null;
        return {
            status: roomsLeft && roomsLeft <= 3 ? 'last_few' : 'available',
            roomsLeft,
            historicalRate: null,
        };
    } else {
        // Unavailable - calculate historical release rate
        const historicalRate = Math.floor(30 + rand * 50); // 30-80%
        return {
            status: 'unavailable',
            roomsLeft: null,
            historicalRate,
        };
    }
}

// === Generate 90 days of price data ===
export function generatePriceData(): DatePriceAvailability[] {
    const data: DatePriceAvailability[] = [];
    const today = new Date();

    for (const hotel of hotels) {
        const config = hotelPriceConfig[hotel.hotel_id];
        if (!config) continue;

        for (let i = 0; i < 90; i++) {
            const date = addDays(today, i);
            const dateStr = format(date, 'yyyy-MM-dd');
            const isWeekendDay = isWeekend(date);
            const isPeak = isPeakSeason(date);

            // Calculate prices
            let costMultiplier = 1;
            let publicMultiplier = 1;

            if (isWeekendDay) {
                costMultiplier *= config.weekendMultiplier;
                publicMultiplier *= config.weekendMultiplier;
            }
            if (isPeak) {
                costMultiplier *= config.peakMultiplier;
                publicMultiplier *= config.peakMultiplier;
            }

            // Add some variance
            const variance = 0.95 + (Math.sin(i * 0.5 + hotel.hotel_id.length) * 0.05);

            const ourCost = Math.round(config.baseCost * costMultiplier * variance);
            const lowestPublicPrice = Math.round(config.basePublicPrice * publicMultiplier * variance);

            const priceAdvantage = lowestPublicPrice - ourCost;
            const priceAdvantagePercent = Math.round((priceAdvantage / lowestPublicPrice) * 100);

            // Suggested price: cost + 60-80% of advantage
            const profitMargin = 0.6 + Math.sin(i) * 0.1;
            const suggestedSellingPrice = Math.round(ourCost + priceAdvantage * profitMargin);
            const estimatedProfit = suggestedSellingPrice - ourCost;
            const profitMarginPercent = Math.round((estimatedProfit / suggestedSellingPrice) * 100);

            // Generate availability
            const seed = i * 1000 + hotel.hotel_id.length * 100 + hotel.hotel_id.charCodeAt(0);
            const availability = generateAvailabilityStatus(
                config.availabilityRate,
                isWeekendDay,
                isPeak,
                seed
            );

            // Date tags
            const dateTags = getDateTags(date, hotel.hotel_id);
            if (availability.status === 'last_few') {
                dateTags.push({
                    tag_type: 'last_few',
                    tag_label: '仅剩几间',
                    tag_color: '#ef4444',
                });
            }

            // Release prediction for unavailable dates
            let releasePrediction: 'high' | 'medium' | 'low' | 'very_low' | null = null;
            if (availability.status === 'unavailable' && availability.historicalRate) {
                if (availability.historicalRate >= 65) releasePrediction = 'high';
                else if (availability.historicalRate >= 50) releasePrediction = 'medium';
                else if (availability.historicalRate >= 30) releasePrediction = 'low';
                else releasePrediction = 'very_low';
            }

            const entry: DatePriceAvailability = {
                id: `${hotel.hotel_id}-${dateStr}`,
                hotel_id: hotel.hotel_id,
                room_type_id: `${hotel.hotel_id}-standard`, // simplified: one room type per hotel
                date: dateStr,

                availability_status: availability.status,
                rooms_left: availability.roomsLeft,
                last_checked_at: new Date().toISOString(),

                our_cost: ourCost,
                our_channel: hotel.our_primary_channel,
                cost_updated_at: new Date().toISOString(),

                public_prices: [
                    { channel: 'ikyu_public', price: lowestPublicPrice, updated_at: new Date().toISOString() },
                    { channel: 'booking', price: Math.round(lowestPublicPrice * 1.05), updated_at: new Date().toISOString() },
                    { channel: 'official', price: Math.round(lowestPublicPrice * 1.08), updated_at: new Date().toISOString() },
                ],
                lowest_public_price: lowestPublicPrice,
                lowest_public_channel: 'ikyu_public',

                price_advantage: priceAdvantage,
                price_advantage_percent: priceAdvantagePercent,
                advantage_level: getAdvantageLevel(priceAdvantagePercent),

                suggested_selling_price: suggestedSellingPrice,
                estimated_profit: estimatedProfit,
                profit_margin_percent: profitMarginPercent,

                historical_availability_rate: availability.historicalRate,
                avg_days_before_release: availability.historicalRate ? Math.floor(3 + Math.random() * 4) : null,
                release_prediction: releasePrediction,

                date_tags: dateTags,
                is_peak_season: isPeak,
                is_weekend: isWeekendDay,
                is_holiday: isInDateRange(date, specialDates.goldenWeek) || isInDateRange(date, specialDates.newYear),
                is_blackout: false,
                is_special_rate: false,

                min_nights: isPeak ? 2 : 1,
                is_check_in_allowed: true,
            };

            data.push(entry);
        }
    }

    return data;
}

// Pre-generate the data
let _priceDataCache: DatePriceAvailability[] | null = null;

export function getPriceData(): DatePriceAvailability[] {
    if (!_priceDataCache) {
        _priceDataCache = generatePriceData();
    }
    return _priceDataCache;
}

export function getPriceDataForHotel(hotelId: string): DatePriceAvailability[] {
    return getPriceData().filter(p => p.hotel_id === hotelId);
}

// Alias for getAllPriceData
export function getAllPriceData(): DatePriceAvailability[] {
    return getPriceData();
}

export function getPriceDataForDate(date: string): DatePriceAvailability[] {
    return getPriceData().filter(p => p.date === date);
}

export function getPriceDataForHotelAndDateRange(
    hotelId: string,
    startDate: string,
    endDate: string
): DatePriceAvailability[] {
    return getPriceData().filter(
        p => p.hotel_id === hotelId && p.date >= startDate && p.date <= endDate
    );
}

// === Summary Calculations ===
export function calculateDateRangeSummary(priceData: DatePriceAvailability[]) {
    const totalNights = priceData.length;
    const availableNights = priceData.filter(p => p.availability_status === 'available' || p.availability_status === 'last_few').length;
    const needsMonitoringNights = priceData.filter(p => p.availability_status === 'unavailable' && (p.historical_availability_rate ?? 0) >= 50).length;
    const unavailableNights = totalNights - availableNights;

    const totalCost = priceData.reduce((sum, p) => sum + (p.our_cost ?? 0), 0);
    const totalPublicPrice = priceData.reduce((sum, p) => sum + p.lowest_public_price, 0);
    const totalAdvantage = totalPublicPrice - totalCost;
    const suggestedTotalPrice = priceData.reduce((sum, p) => sum + p.suggested_selling_price, 0);
    const estimatedTotalProfit = suggestedTotalPrice - totalCost;

    return {
        total_nights: totalNights,
        available_nights: availableNights,
        needs_monitoring_nights: needsMonitoringNights,
        unavailable_nights: unavailableNights,
        total_cost: totalCost,
        total_public_price: totalPublicPrice,
        total_advantage: totalAdvantage,
        suggested_total_price: suggestedTotalPrice,
        estimated_total_profit: estimatedTotalProfit,
    };
}
