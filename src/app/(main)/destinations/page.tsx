'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { HotelCard } from '@/components/hotel';
import { hotels, destinationBoards, getHotelsByBoard } from '@/lib/mock-data/hotels';
import { getPriceDataForHotel } from '@/lib/mock-data/prices';

type SortOption = 'score' | 'advantage' | 'availability' | 'price_asc' | 'price_desc';

const sortOptions = [
    { value: 'score', label: '综合推荐' },
    { value: 'advantage', label: '价格优势↓' },
    { value: 'availability', label: '出房率↓' },
    { value: 'price_asc', label: '价格↑' },
    { value: 'price_desc', label: '价格↓' },
];

export default function DestinationsPage() {
    const [activeBoard, setActiveBoard] = useState(destinationBoards[0].board_id);
    const [sortBy, setSortBy] = useState<SortOption>('score');
    const [country, setCountry] = useState<'japan' | 'europe'>('japan');

    // Get hotels for current board
    const boardHotels = useMemo(() => {
        const filtered = getHotelsByBoard(activeBoard);

        // Sort hotels
        return [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'advantage':
                    return b.avg_advantage_percent - a.avg_advantage_percent;
                case 'price_asc':
                    return a.price_range_typical - b.price_range_typical;
                case 'price_desc':
                    return b.price_range_typical - a.price_range_typical;
                case 'score':
                default:
                    // Score based on advantage + other factors
                    const scoreA = a.avg_advantage_percent * 2 + (a.booking_difficulty === 'easy' ? 10 : 0);
                    const scoreB = b.avg_advantage_percent * 2 + (b.booking_difficulty === 'easy' ? 10 : 0);
                    return scoreB - scoreA;
            }
        });
    }, [activeBoard, sortBy]);

    const currentBoard = destinationBoards.find(b => b.board_id === activeBoard);
    const advantageHotelsCount = boardHotels.filter(h =>
        h.advantage_level === 'excellent' || h.advantage_level === 'good'
    ).length;

    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">🗺️ 目的地视图</h1>

                {/* Country Toggle */}
                <div className="flex items-center gap-2">
                    <Button
                        variant={country === 'japan' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCountry('japan')}
                    >
                        日本
                    </Button>
                    <Button
                        variant={country === 'europe' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCountry('europe')}
                        disabled
                    >
                        欧洲
                    </Button>
                </div>
            </div>

            {/* Board Tabs */}
            <Tabs value={activeBoard} onValueChange={setActiveBoard}>
                <TabsList className="h-auto flex-wrap gap-1 bg-muted/50 p-1">
                    {destinationBoards.map((board) => {
                        const hotelCount = getHotelsByBoard(board.board_id).length;
                        return (
                            <TabsTrigger
                                key={board.board_id}
                                value={board.board_id}
                                className="data-[state=active]:bg-background gap-1.5"
                            >
                                {board.name}
                                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                                    {hotelCount}
                                </Badge>
                            </TabsTrigger>
                        );
                    })}
                </TabsList>
            </Tabs>

            {/* Board Info & Sort */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <span className="text-lg font-medium">{currentBoard?.name}</span>
                    <span className="text-muted-foreground">
                        {boardHotels.length}家酒店
                    </span>
                    <span className="text-muted-foreground">
                        我们优势酒店: <span className="text-amber-600 font-medium">{advantageHotelsCount}家</span>
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">排序:</span>
                    <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                        <SelectTrigger className="w-[140px] h-8">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {sortOptions.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Hotel Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {boardHotels.map((hotel) => {
                    // Get availability data for the hotel (first 14 days)
                    const availabilityData = getPriceDataForHotel(hotel.hotel_id).slice(0, 14);

                    // Calculate a mock score
                    const score = Math.round(
                        50 +
                        hotel.avg_advantage_percent * 1.2 +
                        (hotel.booking_difficulty === 'easy' ? 10 : hotel.booking_difficulty === 'moderate' ? 5 : 0) +
                        (hotel.advantage_level === 'excellent' ? 15 : hotel.advantage_level === 'good' ? 8 : 0)
                    );

                    return (
                        <HotelCard
                            key={hotel.hotel_id}
                            hotel={hotel}
                            availabilityData={availabilityData}
                            score={Math.min(score, 99)}
                            onAddToInquiry={() => {
                                // TODO: Open inquiry modal
                                console.log('Add to inquiry:', hotel.hotel_id);
                            }}
                        />
                    );
                })}
            </div>

            {boardHotels.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    该板块暂无酒店数据
                </div>
            )}
        </div>
    );
}
