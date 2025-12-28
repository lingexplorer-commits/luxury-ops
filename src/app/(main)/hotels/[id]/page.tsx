'use client';

import { use, useMemo, useState } from 'react';
import Link from 'next/link';
import { format, addDays, differenceInDays } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { ArrowLeft, Copy, Plus, MapPin, BedDouble, Calendar as CalendarIcon, Star, Check, Bell, Percent, DollarSign, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { PriceAdvantageBar } from '@/components/hotel';
import { getHotelById, getBoardById } from '@/lib/mock-data/hotels';
import { getPriceDataForHotel } from '@/lib/mock-data/prices';
import { getRoomTypesByHotel } from '@/lib/mock-data/room-types';
import { useCopyToClipboard } from '@/lib/hooks';
import { RoomType } from '@/lib/types';
import { toast } from 'sonner';
import {
    toCNY,
    formatCNY,
    formatPriceK,
    formatOriginalCurrency,
    MARKUP_PRESETS,
    currencies,
    type PriceAdjustmentType
} from '@/lib/currency';

interface HotelDetailPageProps {
    params: Promise<{ id: string }>;
}

export default function HotelDetailPage({ params }: HotelDetailPageProps) {
    const resolvedParams = use(params);
    const hotelId = resolvedParams.id;
    const hotel = getHotelById(hotelId);
    const board = hotel ? getBoardById(hotel.destination_board) : null;
    const priceData = hotel ? getPriceDataForHotel(hotel.hotel_id) : [];
    const roomTypes = hotel ? getRoomTypesByHotel(hotel.hotel_id) : [];

    const [activeTab, setActiveTab] = useState('quote');
    const { copy } = useCopyToClipboard();

    // Date selection state
    const [checkIn, setCheckIn] = useState<Date | undefined>(addDays(new Date(), 30));
    const [checkOut, setCheckOut] = useState<Date | undefined>(addDays(new Date(), 32));

    // Multi-room selection (changed from single to multi)
    const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([]);

    // Price adjustment state - 支持正负和直接金额
    const [adjustmentType, setAdjustmentType] = useState<PriceAdjustmentType>('markup_percent');
    const [markupPercent, setMarkupPercent] = useState(15);
    const [fixedProfitCNY, setFixedProfitCNY] = useState(0); // 直接输入的人民币利润

    // Display options
    const [includeHotelIntro, setIncludeHotelIntro] = useState(true);
    const [showOriginalCurrency, setShowOriginalCurrency] = useState(false);

    if (!hotel) {
        return (
            <div className="container mx-auto py-6">
                <div className="text-center py-12">
                    <h1 className="text-2xl font-bold mb-2">酒店未找到</h1>
                    <p className="text-muted-foreground">ID: {hotelId}</p>
                    <Link href="/destinations">
                        <Button className="mt-4">返回目的地</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;
    const originalCurrency = hotel.currency as 'JPY' | 'CNY';

    // Toggle room selection
    const toggleRoomSelection = (roomId: string) => {
        setSelectedRoomIds(prev =>
            prev.includes(roomId)
                ? prev.filter(id => id !== roomId)
                : [...prev, roomId]
        );
    };

    // Get selected room objects
    const selectedRooms = roomTypes.filter(r => selectedRoomIds.includes(r.room_id));

    // Get price data for dates with currency conversion
    const getRoomPriceForDates = (room: RoomType) => {
        if (!checkIn || !checkOut || nights <= 0) return null;

        let totalCostOriginal = 0;
        let availableNights = 0;

        for (let i = 0; i < nights; i++) {
            const date = addDays(checkIn, i);
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            const baseRate = isWeekend
                ? (room.weekend_rate_min + room.weekend_rate_max) / 2
                : (room.weekday_rate_min + room.weekday_rate_max) / 2;

            const variation = 0.95 + Math.random() * 0.1;
            totalCostOriginal += Math.round(baseRate * variation);

            const dateStr = format(date, 'yyyy-MM-dd');
            const dayData = priceData.find(p => p.date === dateStr);
            if (dayData && (dayData.availability_status === 'available' || dayData.availability_status === 'last_few')) {
                availableNights++;
            }
        }

        // 转换为人民币
        const totalCostCNY = toCNY(totalCostOriginal, originalCurrency);

        // 应用价格调整
        let sellingPriceCNY: number;
        let profit: number;

        if (adjustmentType === 'markup_percent') {
            sellingPriceCNY = Math.round(totalCostCNY * (1 + markupPercent / 100));
            profit = sellingPriceCNY - totalCostCNY;
        } else {
            profit = fixedProfitCNY;
            sellingPriceCNY = totalCostCNY + profit;
        }

        return {
            totalCostOriginal,
            totalCostCNY,
            sellingPriceCNY,
            profit,
            profitPercent: totalCostCNY > 0 ? Math.round((profit / totalCostCNY) * 100) : 0,
            avgPerNightCNY: Math.round(sellingPriceCNY / nights),
            costPerNightCNY: Math.round(totalCostCNY / nights),
            availableNights,
            isFullyAvailable: availableNights === nights,
        };
    };

    // Generate quote text for multiple rooms
    const generateQuoteText = () => {
        if (selectedRooms.length === 0 || !checkIn || !checkOut) return '';

        const dateRange = `${format(checkIn, 'M月d日', { locale: zhCN })} - ${format(checkOut, 'M月d日', { locale: zhCN })}`;
        let quote = '';

        // 酒店介绍（可选）
        if (includeHotelIntro) {
            quote += `【${hotel.name_cn}】

🏨 酒店简介
${hotel.positioning_short}
${hotel.highlights.map(h => `• ${h}`).join('\n')}

📍 位置：${hotel.area_tag}
⏰ 入住/退房：${hotel.checkin_time} / ${hotel.checkout_time}

---

`;
        }

        // 日期信息
        quote += `【报价详情】
📅 日期：${dateRange} (${nights}晚)\n\n`;

        // 多房型报价
        let totalAllRooms = 0;
        selectedRooms.forEach((room, index) => {
            const pricing = getRoomPriceForDates(room);
            if (!pricing) return;

            totalAllRooms += pricing.sellingPriceCNY;

            quote += `【房型${selectedRooms.length > 1 ? index + 1 : ''}】${room.room_name_cn}
${room.area_min_sqm}㎡ | ${room.bed_type} | ${room.view_type}${room.has_onsen ? ' | ♨️私汤' : ''}
💰 价格：${formatCNY(pricing.sellingPriceCNY)} (折合${formatCNY(pricing.avgPerNightCNY)}/晚)
✨ 亮点：${room.highlights.slice(0, 2).join('、')}
📌 包含：${room.rate_note}
${room.is_signature ? '🌟 招牌房型\n' : ''}
`;
        });

        // 总计（多房型时）
        if (selectedRooms.length > 1) {
            quote += `\n---
💰 总计：${formatCNY(totalAllRooms)}`;
        }

        return quote;
    };

    // 发起刷房监控
    const handleStartMonitoring = (room: RoomType) => {
        toast.success(`已添加监控: ${hotel.name_cn} - ${room.room_name_cn}`);
    };

    // 判断酒店是否有私汤房
    const hasOnsenRooms = roomTypes.some(r => r.has_onsen);
    const onsenRooms = roomTypes.filter(r => r.has_onsen);

    // 计算所有选中房型的总价
    const totalSelectedPrice = useMemo(() => {
        return selectedRooms.reduce((sum, room) => {
            const pricing = getRoomPriceForDates(room);
            return sum + (pricing?.sellingPriceCNY || 0);
        }, 0);
    }, [selectedRooms, checkIn, checkOut, adjustmentType, markupPercent, fixedProfitCNY]);

    const totalSelectedCost = useMemo(() => {
        return selectedRooms.reduce((sum, room) => {
            const pricing = getRoomPriceForDates(room);
            return sum + (pricing?.totalCostCNY || 0);
        }, 0);
    }, [selectedRooms, checkIn, checkOut]);

    return (
        <div className="min-h-screen pb-12">
            {/* Back Navigation */}
            <div className="container mx-auto py-4">
                <Link href="/destinations" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="h-4 w-4" />
                    返回{board?.name || '目的地'}
                </Link>
            </div>

            {/* Hotel Header */}
            <div className="container mx-auto space-y-4">
                <Card>
                    <CardContent className="pt-6 space-y-4">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h1 className="text-2xl font-bold">🏨 {hotel.name_cn}</h1>
                                    <span className="text-muted-foreground">{hotel.name_en}</span>
                                    <Badge variant={hotel.status === '在售' ? 'default' : 'secondary'}>
                                        {hotel.status}
                                    </Badge>
                                    {hasOnsenRooms && (
                                        <Badge className="bg-orange-500">♨️ 有私汤房</Badge>
                                    )}
                                </div>
                                <p className="text-lg text-muted-foreground">
                                    &ldquo;{hotel.positioning_short}&rdquo;
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {hotel.area_tag}
                            </div>
                            <div className="flex items-center gap-1">
                                <BedDouble className="h-4 w-4" />
                                {roomTypes.length}种房型
                                {onsenRooms.length > 0 && <span className="text-orange-500">({onsenRooms.length}私汤)</span>}
                            </div>
                            <div className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                原币种: {currencies[originalCurrency].name_cn}
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {hotel.positioning_keywords.map((kw, i) => (
                                <Badge key={i} variant="outline">🎯 {kw}</Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <div className="container mx-auto mt-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
                        <TabsTrigger value="quote">💰 报价生成</TabsTrigger>
                        <TabsTrigger value="rooms">🛏️ 房型详情</TabsTrigger>
                        <TabsTrigger value="calendar">📅 房态日历</TabsTrigger>
                        <TabsTrigger value="info">📋 酒店信息</TabsTrigger>
                    </TabsList>

                    {/* ========== Tab: Quote Generation ========== */}
                    <TabsContent value="quote" className="mt-6 space-y-6">
                        {/* Step 1: Date Selection */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CalendarIcon className="h-5 w-5" />
                                    ① 选择日期
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap items-center gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">入住</label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="w-[160px] justify-start">
                                                    <CalendarIcon className="h-4 w-4 mr-2" />
                                                    {checkIn ? format(checkIn, 'MM/dd') : '选择'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={checkIn}
                                                    onSelect={(date) => {
                                                        setCheckIn(date);
                                                        if (date && checkOut && date >= checkOut) {
                                                            setCheckOut(addDays(date, 2));
                                                        }
                                                    }}
                                                    locale={zhCN}
                                                    disabled={(date) => date < new Date()}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    <span className="text-muted-foreground">→</span>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">退房</label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="w-[160px] justify-start">
                                                    <CalendarIcon className="h-4 w-4 mr-2" />
                                                    {checkOut ? format(checkOut, 'MM/dd') : '选择'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={checkOut}
                                                    onSelect={setCheckOut}
                                                    locale={zhCN}
                                                    disabled={(date) => checkIn ? date <= checkIn : date <= new Date()}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    {nights > 0 && (
                                        <Badge variant="secondary" className="text-lg px-4 py-2">
                                            {nights} 晚
                                        </Badge>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Step 2: Price Adjustment */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Percent className="h-5 w-5" />
                                    ② 价格调整
                                </CardTitle>
                                <CardDescription>支持加价或降价，可按比例或直接输入金额</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Adjustment type toggle */}
                                <div className="flex gap-2">
                                    <Button
                                        variant={adjustmentType === 'markup_percent' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setAdjustmentType('markup_percent')}
                                    >
                                        按比例 %
                                    </Button>
                                    <Button
                                        variant={adjustmentType === 'fixed_amount' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setAdjustmentType('fixed_amount')}
                                    >
                                        固定金额 ¥
                                    </Button>
                                </div>

                                {adjustmentType === 'markup_percent' ? (
                                    <div className="space-y-2">
                                        <div className="flex flex-wrap gap-2">
                                            {MARKUP_PRESETS.map((preset) => (
                                                <Button
                                                    key={preset.value}
                                                    variant={markupPercent === preset.value ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => setMarkupPercent(preset.value)}
                                                >
                                                    {preset.label}
                                                </Button>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm">自定义:</span>
                                            <Input
                                                type="number"
                                                value={markupPercent}
                                                onChange={(e) => setMarkupPercent(parseInt(e.target.value) || 0)}
                                                className="w-24"
                                            />
                                            <span className="text-sm text-muted-foreground">% (负数为降价)</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm">利润金额 (人民币):</span>
                                            <Input
                                                type="number"
                                                value={fixedProfitCNY}
                                                onChange={(e) => setFixedProfitCNY(parseInt(e.target.value) || 0)}
                                                className="w-32"
                                                placeholder="输入人民币金额"
                                            />
                                            <span className="text-sm text-muted-foreground">¥ (负数为降价)</span>
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            售价 = 成本 + 此金额
                                        </div>
                                    </div>
                                )}

                                {/* Display options */}
                                <Separator />
                                <div className="flex flex-wrap gap-4">
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="include-intro"
                                            checked={includeHotelIntro}
                                            onCheckedChange={(c) => setIncludeHotelIntro(!!c)}
                                        />
                                        <label htmlFor="include-intro" className="text-sm">报价含酒店介绍</label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="show-original"
                                            checked={showOriginalCurrency}
                                            onCheckedChange={(c) => setShowOriginalCurrency(!!c)}
                                        />
                                        <label htmlFor="show-original" className="text-sm">显示原币种价格</label>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Step 3: Room Selection (Multi-select) */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BedDouble className="h-5 w-5" />
                                    ③ 选择房型 (可多选)
                                    {selectedRooms.length > 0 && (
                                        <Badge variant="secondary">已选 {selectedRooms.length} 个</Badge>
                                    )}
                                </CardTitle>
                                <CardDescription>
                                    {nights > 0
                                        ? `${format(checkIn!, 'M/d')} - ${format(checkOut!, 'M/d')} · ${nights}晚 · ${adjustmentType === 'markup_percent' ? `${markupPercent >= 0 ? '+' : ''}${markupPercent}%` : `${fixedProfitCNY >= 0 ? '+' : ''}¥${fixedProfitCNY}`}`
                                        : '请先选择日期'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {roomTypes.length === 0 ? (
                                    <p className="text-muted-foreground">该酒店暂无房型数据</p>
                                ) : (
                                    <div className="space-y-3">
                                        {roomTypes.map((room) => {
                                            const pricing = getRoomPriceForDates(room);
                                            const isSelected = selectedRoomIds.includes(room.room_id);

                                            return (
                                                <div
                                                    key={room.room_id}
                                                    onClick={() => toggleRoomSelection(room.room_id)}
                                                    className={cn(
                                                        "p-4 border rounded-lg cursor-pointer transition-all",
                                                        isSelected
                                                            ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                                                            : "hover:border-gray-400",
                                                        room.has_onsen && "border-l-4 border-l-orange-400"
                                                    )}
                                                >
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex items-start gap-3">
                                                            <Checkbox
                                                                checked={isSelected}
                                                                onCheckedChange={() => toggleRoomSelection(room.room_id)}
                                                                className="mt-1"
                                                            />
                                                            <div className="space-y-1.5">
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    <h4 className="font-semibold">{room.room_name_cn}</h4>
                                                                    {room.has_onsen && <Badge className="bg-orange-500 text-xs">♨️私汤</Badge>}
                                                                    {room.is_signature && <Badge className="bg-amber-500 text-xs">招牌</Badge>}
                                                                </div>
                                                                <div className="text-sm text-muted-foreground">
                                                                    {room.area_min_sqm}㎡ · {room.bed_type} · {room.view_type}
                                                                </div>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {room.highlights.slice(0, 2).map((h, i) => (
                                                                        <Badge key={i} variant="secondary" className="text-xs">{h}</Badge>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="text-right min-w-[140px]">
                                                            {pricing ? (
                                                                <div className="space-y-0.5">
                                                                    <div className="text-xl font-bold">
                                                                        {formatCNY(pricing.sellingPriceCNY)}
                                                                    </div>
                                                                    <div className="text-xs text-muted-foreground">
                                                                        {nights}晚
                                                                    </div>
                                                                    {showOriginalCurrency && (
                                                                        <div className="text-xs text-gray-500">
                                                                            原价 {formatOriginalCurrency(pricing.totalCostOriginal, originalCurrency)}
                                                                        </div>
                                                                    )}
                                                                    <div className="text-xs text-muted-foreground">
                                                                        成本 {formatCNY(pricing.totalCostCNY)}
                                                                    </div>
                                                                    <div className={cn(
                                                                        "text-sm font-medium",
                                                                        pricing.profit >= 0 ? "text-amber-600" : "text-red-600"
                                                                    )}>
                                                                        利润 {pricing.profit >= 0 ? '+' : ''}{formatCNY(pricing.profit)}
                                                                    </div>
                                                                    {!pricing.isFullyAvailable && (
                                                                        <div className="text-xs text-red-500 flex items-center gap-1 justify-end">
                                                                            ⚠️ {pricing.availableNights}/{nights}晚
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                className="h-5 text-[10px] text-blue-600 px-1"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleStartMonitoring(room);
                                                                                }}
                                                                            >
                                                                                <Bell className="h-3 w-3" />
                                                                            </Button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <div className="text-sm text-muted-foreground">
                                                                    选择日期
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Step 4: Generate Quote */}
                        {selectedRooms.length > 0 && nights > 0 && (
                            <Card className="border-green-200 bg-green-50">
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between text-green-700">
                                        <span className="flex items-center gap-2">
                                            <Copy className="h-5 w-5" />
                                            ④ 生成报价
                                        </span>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold">{formatCNY(totalSelectedPrice)}</div>
                                            <div className="text-sm font-normal">
                                                {selectedRooms.length}个房型 · 利润 {formatCNY(totalSelectedPrice - totalSelectedCost)}
                                            </div>
                                        </div>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="bg-white p-4 rounded-lg border whitespace-pre-line text-sm max-h-96 overflow-y-auto">
                                        {generateQuoteText()}
                                    </div>
                                    <div className="flex gap-2 mt-4">
                                        <Button
                                            onClick={() => copy(generateQuoteText(), '报价已复制')}
                                            className="flex-1"
                                        >
                                            <Copy className="h-4 w-4 mr-2" />
                                            复制报价
                                        </Button>
                                        <Button variant="outline">
                                            <Plus className="h-4 w-4 mr-2" />
                                            添加到需求
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* ========== Tab: Room Details ========== */}
                    <TabsContent value="rooms" className="mt-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            {roomTypes.map((room) => (
                                <Card key={room.room_id} className={cn(
                                    room.is_signature && "ring-2 ring-amber-400",
                                    room.has_onsen && "border-l-4 border-l-orange-400"
                                )}>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 flex-wrap">
                                            {room.room_name_cn}
                                            {room.has_onsen && <Badge className="bg-orange-500">♨️私汤</Badge>}
                                            {room.is_signature && <Badge className="bg-amber-500">招牌</Badge>}
                                        </CardTitle>
                                        <CardDescription>{room.room_name_en}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div>📐 {room.area_min_sqm}㎡</div>
                                            <div>🛏️ {room.bed_type}</div>
                                            <div>🪟 {room.view_type}</div>
                                            <div>👥 最多{room.max_occupancy}人</div>
                                        </div>
                                        <Separator />
                                        <div className="text-sm">
                                            <div className="font-medium mb-1">✨ 亮点</div>
                                            <ul className="text-muted-foreground space-y-0.5">
                                                {room.highlights.map((h, i) => (
                                                    <li key={i}>• {h}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="pt-2 border-t text-sm space-y-1">
                                            <div>
                                                💴 {formatOriginalCurrency(room.weekday_rate_min, originalCurrency)}-{formatOriginalCurrency(room.weekend_rate_max, originalCurrency)}/晚
                                            </div>
                                            <div className="text-muted-foreground">
                                                ≈ {formatCNY(toCNY(room.weekday_rate_min, originalCurrency))}-{formatCNY(toCNY(room.weekend_rate_max, originalCurrency))}/晚
                                            </div>
                                            <div className="text-xs text-muted-foreground">{room.rate_note}</div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    {/* ========== Tab: Calendar ========== */}
                    <TabsContent value="calendar" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CalendarIcon className="h-5 w-5" />
                                    房态日历 - 未来30天
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-7 gap-1">
                                    {['日', '一', '二', '三', '四', '五', '六'].map(day => (
                                        <div key={day} className="text-center text-sm font-medium py-2 text-muted-foreground">
                                            {day}
                                        </div>
                                    ))}
                                    {priceData.slice(0, 30).map((data) => {
                                        const date = new Date(data.date);
                                        const dayOfMonth = date.getDate();
                                        const isAvailable = data.availability_status === 'available' || data.availability_status === 'last_few';
                                        const isTryable = !isAvailable && data.historical_availability_rate && data.historical_availability_rate >= 50;

                                        const statusColor = isAvailable
                                            ? 'bg-green-100 text-green-700 border-green-200'
                                            : isTryable
                                                ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                                                : 'bg-red-100 text-red-700 border-red-200';

                                        const costCNY = toCNY(data.our_cost || 0, originalCurrency);

                                        return (
                                            <div
                                                key={data.id}
                                                className={cn(
                                                    "p-2 rounded border text-center cursor-pointer hover:shadow-md transition-shadow relative group",
                                                    statusColor
                                                )}
                                                onClick={() => {
                                                    setCheckIn(date);
                                                    setCheckOut(addDays(date, 2));
                                                    setActiveTab('quote');
                                                }}
                                            >
                                                <div className="text-xs font-medium">{dayOfMonth}</div>
                                                <div className="text-[10px]">{isAvailable ? '🟢' : isTryable ? '🟡' : '🔴'}</div>
                                                <div className="text-[10px] font-medium">
                                                    {formatPriceK(costCNY)}
                                                </div>
                                                {!isAvailable && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-blue-500/80 text-white text-[10px]"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toast.success(`已添加监控: ${format(date, 'M/d')}`);
                                                        }}
                                                    >
                                                        <Bell className="h-3 w-3" />
                                                    </Button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="mt-4 text-xs text-muted-foreground">
                                    🟢有房 🟡可刷 🔴难订 · 价格已折算为人民币 · 悬停无房日期可刷房
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ========== Tab: Hotel Info ========== */}
                    <TabsContent value="info" className="mt-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>📍 基本信息</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                    <div><span className="text-muted-foreground">开业:</span> {hotel.opening_year}年</div>
                                    <div><span className="text-muted-foreground">客房数:</span> {hotel.rooms_count}间</div>
                                    <div><span className="text-muted-foreground">入住/退房:</span> {hotel.checkin_time} / {hotel.checkout_time}</div>
                                    <Separator />
                                    <div><span className="text-muted-foreground">地址:</span> {hotel.address_full}</div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>💱 货币信息</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                    <div><span className="text-muted-foreground">原始货币:</span> {currencies[originalCurrency].name_cn} ({originalCurrency})</div>
                                    <div><span className="text-muted-foreground">汇率:</span> 1 {originalCurrency} = ¥{currencies[originalCurrency].rate_to_cny}</div>
                                    <div className="text-xs text-muted-foreground">所有报价以人民币 (CNY) 为最终计价</div>
                                </CardContent>
                            </Card>

                            <Card className="md:col-span-2">
                                <CardHeader>
                                    <CardTitle>💬 酒店介绍</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="p-4 bg-muted/50 rounded-lg text-sm whitespace-pre-line">
                                        {hotel.positioning_short}

                                        🌟 核心亮点：
                                        {hotel.highlights.map(h => `• ${h}`).join('\n')}

                                        📍 位置：{hotel.area_tag}
                                        👥 适合：{hotel.target_guests.join('、')}
                                    </div>
                                    <Button variant="outline" size="sm" className="mt-4" onClick={() => {
                                        const text = `${hotel.name_cn}\n\n${hotel.positioning_short}\n\n🌟 核心亮点：\n${hotel.highlights.map(h => `• ${h}`).join('\n')}\n\n📍 位置：${hotel.area_tag}\n👥 适合：${hotel.target_guests.join('、')}`;
                                        copy(text, '酒店介绍已复制');
                                    }}>
                                        <Copy className="h-4 w-4 mr-2" />
                                        复制介绍
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
