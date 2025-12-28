'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { format, addDays, isSameDay, isWithinInterval } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { CalendarDays, ChevronLeft, ChevronRight, X, Plus, CalendarIcon, Bell, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Switch } from '@/components/ui/switch';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { hotels, destinationBoards, getHotelsByBoard } from '@/lib/mock-data/hotels';
import { getPriceDataForHotel } from '@/lib/mock-data/prices';
import { getRoomTypesByHotel } from '@/lib/mock-data/room-types';
import { toast } from 'sonner';

// Calendar configuration
const VISIBLE_DAYS = 14;
const WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六'];

export default function CalendarPage() {
    // Multi-board selection
    const [selectedBoards, setSelectedBoards] = useState<string[]>(['all']);
    const [startDate, setStartDate] = useState(new Date());
    const [selectedRange, setSelectedRange] = useState<{ start: Date | null; end: Date | null }>({
        start: null,
        end: null,
    });
    const [selectionStart, setSelectionStart] = useState<Date | null>(null);
    const [datePickerOpen, setDatePickerOpen] = useState(false);

    // Filter options
    const [onlyShowOnsen, setOnlyShowOnsen] = useState(false);

    // Toggle board selection
    const toggleBoard = (boardId: string) => {
        if (boardId === 'all') {
            setSelectedBoards(['all']);
            return;
        }

        let newSelection = selectedBoards.filter(b => b !== 'all');

        if (newSelection.includes(boardId)) {
            newSelection = newSelection.filter(b => b !== boardId);
        } else {
            newSelection.push(boardId);
        }

        if (newSelection.length === 0) {
            setSelectedBoards(['all']);
        } else {
            setSelectedBoards(newSelection);
        }
    };

    // Check if hotel has onsen rooms
    const hotelHasOnsen = (hotelId: string): boolean => {
        const roomTypes = getRoomTypesByHotel(hotelId);
        return roomTypes.some(r => r.has_onsen);
    };

    // Get onsen room names for hotel
    const getOnsenRoomNames = (hotelId: string): string[] => {
        const roomTypes = getRoomTypesByHotel(hotelId);
        return roomTypes.filter(r => r.has_onsen).map(r => r.room_name_cn);
    };

    // Get hotels to display
    const displayHotels = useMemo(() => {
        let result = [];

        if (selectedBoards.includes('all')) {
            result = hotels;
        } else {
            result = hotels.filter(h => selectedBoards.includes(h.destination_board));
        }

        // Filter by onsen if enabled
        if (onlyShowOnsen) {
            result = result.filter(h => hotelHasOnsen(h.hotel_id));
        }

        return result.slice(0, 12); // Limit for performance
    }, [selectedBoards, onlyShowOnsen]);

    // Generate date range for display
    const dateRange = useMemo(() => {
        const dates: Date[] = [];
        for (let i = 0; i < VISIBLE_DAYS; i++) {
            dates.push(addDays(startDate, i));
        }
        return dates;
    }, [startDate]);

    // Handle date click for range selection
    const handleDateClick = (date: Date) => {
        if (!selectionStart) {
            setSelectionStart(date);
            setSelectedRange({ start: date, end: null });
        } else {
            if (date < selectionStart) {
                setSelectedRange({ start: date, end: selectionStart });
            } else {
                setSelectedRange({ start: selectionStart, end: date });
            }
            setSelectionStart(null);
        }
    };

    // Check if date is in selected range
    const isInRange = (date: Date) => {
        if (!selectedRange.start) return false;
        if (!selectedRange.end) return isSameDay(date, selectedRange.start);
        return isWithinInterval(date, { start: selectedRange.start, end: selectedRange.end });
    };

    // Navigate dates
    const moveDates = (days: number) => {
        setStartDate(addDays(startDate, days));
    };

    // Handle date picker selection
    const handleDatePickerSelect = (date: Date | undefined) => {
        if (date) {
            setStartDate(date);
            setDatePickerOpen(false);
        }
    };

    // Clear selection
    const clearSelection = () => {
        setSelectedRange({ start: null, end: null });
        setSelectionStart(null);
    };

    // Handle monitoring start
    const handleStartMonitoring = (hotelId: string, hotelName: string, date: Date) => {
        toast.success(`已添加监控: ${hotelName}，${format(date, 'M/d')}`);
    };

    // Calculate summary for selected range
    const calculateSummary = (hotelId: string) => {
        if (!selectedRange.start || !selectedRange.end) return null;

        const priceData = getPriceDataForHotel(hotelId);
        const startStr = format(selectedRange.start, 'yyyy-MM-dd');
        const endStr = format(selectedRange.end, 'yyyy-MM-dd');

        const rangeData = priceData.filter(p => p.date >= startStr && p.date <= endStr);
        if (rangeData.length === 0) return null;

        const totalCost = rangeData.reduce((sum, p) => sum + (p.our_cost || 0), 0);
        const availableNights = rangeData.filter(p =>
            p.availability_status === 'available' || p.availability_status === 'last_few'
        ).length;
        const totalNights = rangeData.length;
        const avgAdvantage = Math.round(rangeData.reduce((sum, p) => sum + p.price_advantage_percent, 0) / rangeData.length);

        // Default 15% markup
        const sellingPrice = Math.round(totalCost * 1.15);
        const profit = sellingPrice - totalCost;

        return {
            totalNights,
            availableNights,
            totalCost,
            sellingPrice,
            profit,
            avgAdvantage,
        };
    };

    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <CalendarDays className="h-6 w-6" />
                    <h1 className="text-2xl font-bold">📅 日历视图</h1>
                </div>
            </div>

            {/* Multi-Board Selection */}
            <Card>
                <CardHeader className="py-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        板块筛选 (可多选)
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant={selectedBoards.includes('all') ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => toggleBoard('all')}
                        >
                            全部
                        </Button>
                        {destinationBoards.map(board => (
                            <Button
                                key={board.board_id}
                                variant={selectedBoards.includes(board.board_id) ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => toggleBoard(board.board_id)}
                            >
                                {board.name}
                            </Button>
                        ))}
                        <Separator orientation="vertical" className="h-8 mx-2" />
                        {/* Onsen filter */}
                        <div className="flex items-center gap-2 px-3 py-1 border rounded-md">
                            <span className="text-sm">♨️ 仅私汤房</span>
                            <Switch
                                checked={onlyShowOnsen}
                                onCheckedChange={setOnlyShowOnsen}
                            />
                        </div>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                        已选: {selectedBoards.includes('all') ? '全部' : selectedBoards.map(b => destinationBoards.find(db => db.board_id === b)?.name).join(', ')}
                        {onlyShowOnsen && ' · 仅显示有私汤的酒店'}
                        {' · '}共 {displayHotels.length} 家酒店
                    </div>
                </CardContent>
            </Card>

            {/* Date Navigation - Enhanced with Date Picker */}
            <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                <Button variant="ghost" onClick={() => moveDates(-7)}>
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    上一周
                </Button>

                <div className="flex items-center gap-4">
                    {/* Date Picker Button */}
                    <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4" />
                                <span className="font-medium">
                                    {format(startDate, 'yyyy年M月d日', { locale: zhCN })} - {format(addDays(startDate, VISIBLE_DAYS - 1), 'M月d日', { locale: zhCN })}
                                </span>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="center">
                            <Calendar
                                mode="single"
                                selected={startDate}
                                onSelect={handleDatePickerSelect}
                                locale={zhCN}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>

                    <Button variant="outline" size="sm" onClick={() => setStartDate(new Date())}>
                        今天
                    </Button>
                </div>

                <Button variant="ghost" onClick={() => moveDates(7)}>
                    下一周
                    <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
            </div>

            {/* Selection Info */}
            {selectedRange.start && (
                <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="py-3 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <span className="font-medium text-blue-700">
                                已选择: {format(selectedRange.start, 'M/d')}
                                {selectedRange.end && ` - ${format(selectedRange.end, 'M/d')}`}
                                {selectedRange.end && (
                                    <span className="text-muted-foreground ml-2">
                                        ({Math.ceil((selectedRange.end.getTime() - selectedRange.start.getTime()) / (1000 * 60 * 60 * 24)) + 1}晚)
                                    </span>
                                )}
                            </span>
                            <Button variant="ghost" size="sm" onClick={clearSelection}>
                                <X className="h-4 w-4 mr-1" />
                                清除
                            </Button>
                        </div>
                        {selectionStart && (
                            <span className="text-sm text-blue-600">请点击结束日期...</span>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Calendar Matrix */}
            <div className="border rounded-lg overflow-hidden overflow-x-auto">
                {/* Header Row - Dates */}
                <div className="grid min-w-[1000px]" style={{ gridTemplateColumns: `220px repeat(${VISIBLE_DAYS}, minmax(60px, 1fr))` }}>
                    <div className="p-3 bg-muted font-medium border-b border-r sticky left-0 z-10">酒店</div>
                    {dateRange.map((date, i) => {
                        const dayOfWeek = date.getDay();
                        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                        const isSelected = isInRange(date);
                        const isToday = isSameDay(date, new Date());

                        return (
                            <div
                                key={i}
                                onClick={() => handleDateClick(date)}
                                className={cn(
                                    "p-2 text-center border-b cursor-pointer transition-colors",
                                    isWeekend ? "bg-orange-50" : "bg-muted",
                                    isSelected && "bg-blue-100",
                                    isToday && "ring-2 ring-inset ring-blue-500"
                                )}
                            >
                                <div className="text-xs text-muted-foreground">{WEEK_DAYS[dayOfWeek]}</div>
                                <div className={cn(
                                    "font-medium",
                                    isWeekend && "text-orange-600",
                                    isToday && "text-blue-600 font-bold"
                                )}>
                                    {format(date, 'd')}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Hotel Rows */}
                {displayHotels.map((hotel) => {
                    const priceData = getPriceDataForHotel(hotel.hotel_id);
                    const summary = calculateSummary(hotel.hotel_id);
                    const hasOnsen = hotelHasOnsen(hotel.hotel_id);
                    const onsenRooms = getOnsenRoomNames(hotel.hotel_id);

                    return (
                        <div key={hotel.hotel_id} className="grid min-w-[1000px] border-b last:border-b-0" style={{ gridTemplateColumns: `220px repeat(${VISIBLE_DAYS}, minmax(60px, 1fr))` }}>
                            {/* Hotel Name Cell */}
                            <div className={cn(
                                "p-2 border-r bg-background sticky left-0 z-10",
                                hasOnsen && "border-l-4 border-l-orange-400"
                            )}>
                                <Link href={`/hotels/${hotel.hotel_id}`} className="hover:underline">
                                    <div className="font-medium text-sm truncate">{hotel.name_cn}</div>
                                </Link>
                                <div className="text-xs text-muted-foreground truncate">{hotel.area_tag}</div>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {hasOnsen && (
                                        <Badge className="bg-orange-500 text-[9px] px-1 py-0">
                                            ♨️ 私汤
                                        </Badge>
                                    )}
                                    {hotel.advantage_level === 'excellent' || hotel.advantage_level === 'good' ? (
                                        <Badge variant="secondary" className="text-[9px] px-1 py-0">
                                            ⭐ {hotel.avg_advantage_percent}%
                                        </Badge>
                                    ) : null}
                                </div>
                                {/* Onsen room names */}
                                {hasOnsen && onsenRooms.length > 0 && (
                                    <div className="text-[9px] text-orange-600 mt-1 truncate">
                                        {onsenRooms.join('、')}
                                    </div>
                                )}
                                {/* Summary when range selected */}
                                {summary && (
                                    <div className="mt-2 pt-2 border-t text-xs space-y-0.5">
                                        <div className={summary.availableNights === summary.totalNights ? 'text-green-600' : 'text-yellow-600'}>
                                            ✓ {summary.availableNights}/{summary.totalNights}晚有房
                                        </div>
                                        <div>报价: ¥{(summary.sellingPrice / 1000).toFixed(0)}K</div>
                                        <div className="text-amber-600">利润: ¥{(summary.profit / 1000).toFixed(0)}K</div>
                                    </div>
                                )}
                            </div>

                            {/* Date Cells */}
                            {dateRange.map((date, i) => {
                                const dateStr = format(date, 'yyyy-MM-dd');
                                const data = priceData.find(p => p.date === dateStr);
                                const isSelected = isInRange(date);

                                if (!data) {
                                    return (
                                        <div
                                            key={i}
                                            onClick={() => handleDateClick(date)}
                                            className={cn(
                                                "p-1 text-center text-xs cursor-pointer",
                                                isSelected && "bg-blue-50"
                                            )}
                                        >
                                            <span className="text-gray-400">-</span>
                                        </div>
                                    );
                                }

                                const isAvailable = data.availability_status === 'available' || data.availability_status === 'last_few';
                                const isTryable = !isAvailable && data.historical_availability_rate && data.historical_availability_rate >= 50;

                                const bgColor = isAvailable
                                    ? 'bg-green-50 hover:bg-green-100'
                                    : isTryable
                                        ? 'bg-yellow-50 hover:bg-yellow-100'
                                        : 'bg-red-50 hover:bg-red-100';

                                const statusIcon = isAvailable ? '🟢' : isTryable ? '🟡' : '🔴';

                                return (
                                    <div
                                        key={i}
                                        onClick={() => handleDateClick(date)}
                                        className={cn(
                                            "p-1 text-center cursor-pointer transition-colors border-l relative group",
                                            bgColor,
                                            isSelected && "ring-2 ring-blue-400 ring-inset"
                                        )}
                                    >
                                        <div className="text-[10px]">{statusIcon}</div>
                                        <div className="text-xs font-medium">
                                            {(data.our_cost! / 1000).toFixed(0)}K
                                        </div>
                                        {hasOnsen && (
                                            <div className="text-[8px] text-orange-500">♨️</div>
                                        )}
                                        {data.price_advantage_percent >= 20 && (
                                            <div className="text-[9px] text-amber-600">⭐</div>
                                        )}
                                        {/* Monitoring button on hover for unavailable */}
                                        {!isAvailable && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-blue-500/80 text-white text-[10px] flex items-center justify-center"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleStartMonitoring(hotel.hotel_id, hotel.name_cn, date);
                                                }}
                                            >
                                                <Bell className="h-3 w-3 mr-0.5" />
                                                刷房
                                            </Button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground flex-wrap">
                <span>🟢 有房</span>
                <span>🟡 可刷(≥50%)</span>
                <span>🔴 难订</span>
                <span>⭐ 优势20%+</span>
                <span className="text-orange-500">♨️ 私汤房</span>
                <Separator orientation="vertical" className="h-4" />
                <span className="text-blue-600">点击日期选择范围 | 悬停无房单元格可刷房</span>
            </div>

            {/* Selected Range Summary */}
            {selectedRange.start && selectedRange.end && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center justify-between">
                            <span>
                                📊 选定日期汇总: {format(selectedRange.start, 'M/d')} - {format(selectedRange.end, 'M/d')}
                            </span>
                            <Button size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                添加到需求
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {displayHotels.slice(0, 4).map(hotel => {
                                const summary = calculateSummary(hotel.hotel_id);
                                const hasOnsen = hotelHasOnsen(hotel.hotel_id);
                                if (!summary) return null;

                                return (
                                    <div key={hotel.hotel_id} className={cn(
                                        "p-3 bg-muted/50 rounded-lg",
                                        hasOnsen && "border-l-4 border-l-orange-400"
                                    )}>
                                        <div className="font-medium truncate flex items-center gap-1">
                                            {hotel.name_cn}
                                            {hasOnsen && <span className="text-orange-500">♨️</span>}
                                        </div>
                                        <div className="text-sm text-muted-foreground mt-1">
                                            {summary.availableNights}/{summary.totalNights}晚有房
                                        </div>
                                        <div className="text-lg font-bold mt-1">
                                            ¥{(summary.sellingPrice / 1000).toFixed(0)}K
                                        </div>
                                        <div className="text-xs text-amber-600">
                                            利润 ¥{(summary.profit / 1000).toFixed(0)}K
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
