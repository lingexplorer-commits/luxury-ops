'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Wallet, SlidersHorizontal, ArrowUpDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { hotels, destinationBoards } from '@/lib/mock-data/hotels';
import { PriceAdvantageBar } from '@/components/hotel';

type SortOption = 'profit' | 'advantage' | 'price_asc' | 'price_desc';

export default function BudgetPage() {
    const [budgetRange, setBudgetRange] = useState([50000, 120000]);
    const [selectedBoard, setSelectedBoard] = useState<string>('all');
    const [sortBy, setSortBy] = useState<SortOption>('profit');
    const [nights, setNights] = useState(2);

    // Filter and sort hotels
    const filteredHotels = useMemo(() => {
        let result = hotels.filter(hotel => {
            // Budget filter
            if (hotel.price_range_typical < budgetRange[0] || hotel.price_range_typical > budgetRange[1]) {
                return false;
            }
            // Board filter
            if (selectedBoard !== 'all' && hotel.destination_board !== selectedBoard) {
                return false;
            }
            return true;
        });

        // Sort
        result.sort((a, b) => {
            switch (sortBy) {
                case 'profit':
                    // Estimate profit based on advantage
                    const profitA = a.price_range_typical * (a.avg_advantage_percent / 100) * 0.7;
                    const profitB = b.price_range_typical * (b.avg_advantage_percent / 100) * 0.7;
                    return profitB - profitA;
                case 'advantage':
                    return b.avg_advantage_percent - a.avg_advantage_percent;
                case 'price_asc':
                    return a.price_range_typical - b.price_range_typical;
                case 'price_desc':
                    return b.price_range_typical - a.price_range_typical;
                default:
                    return 0;
            }
        });

        return result;
    }, [budgetRange, selectedBoard, sortBy]);

    const formatPrice = (price: number) => `¥${(price / 1000).toFixed(0)}K`;

    // Calculate estimated profit
    const getEstimatedProfit = (hotel: typeof hotels[0]) => {
        const publicPrice = Math.round(hotel.price_range_typical / (1 - hotel.avg_advantage_percent / 100));
        return Math.round((publicPrice - hotel.price_range_typical) * 0.7);
    };

    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Wallet className="h-6 w-6" />
                    <h1 className="text-2xl font-bold">💰 预算匹配</h1>
                </div>
            </div>

            {/* Filters Card */}
            <Card>
                <CardContent className="pt-6 space-y-6">
                    {/* Budget Slider */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <SlidersHorizontal className="h-4 w-4" />
                                <span className="font-medium">客人预算 (每晚)</span>
                            </div>
                            <div className="font-medium text-lg">
                                {formatPrice(budgetRange[0])} - {formatPrice(budgetRange[1])}
                            </div>
                        </div>
                        <Slider
                            value={budgetRange}
                            onValueChange={setBudgetRange}
                            min={20000}
                            max={200000}
                            step={5000}
                            className="py-4"
                        />
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>¥20K</span>
                            <span>¥200K</span>
                        </div>
                    </div>

                    <Separator />

                    {/* Other Filters */}
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">目的地:</span>
                            <Select value={selectedBoard} onValueChange={setSelectedBoard}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">全部</SelectItem>
                                    {destinationBoards.map(board => (
                                        <SelectItem key={board.board_id} value={board.board_id}>
                                            {board.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">入住:</span>
                            <Select value={nights.toString()} onValueChange={v => setNights(parseInt(v))}>
                                <SelectTrigger className="w-[100px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">1晚</SelectItem>
                                    <SelectItem value="2">2晚</SelectItem>
                                    <SelectItem value="3">3晚</SelectItem>
                                    <SelectItem value="4">4晚</SelectItem>
                                    <SelectItem value="5">5晚</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Separator orientation="vertical" className="h-8" />

                        <div className="flex items-center gap-2">
                            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">排序:</span>
                            <Select value={sortBy} onValueChange={v => setSortBy(v as SortOption)}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="profit">💰 利润优先</SelectItem>
                                    <SelectItem value="advantage">⭐ 优势优先</SelectItem>
                                    <SelectItem value="price_asc">💴 价格↑</SelectItem>
                                    <SelectItem value="price_desc">💴 价格↓</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Results Summary */}
            <div className="flex items-center justify-between">
                <div className="text-muted-foreground">
                    找到 <span className="font-medium text-foreground">{filteredHotels.length}</span> 家酒店符合预算
                </div>
                <div className="text-sm text-muted-foreground">
                    💡 按<span className="text-amber-600 font-medium">利润</span>排序，优先推荐利润空间大的酒店
                </div>
            </div>

            {/* Results Grid */}
            <div className="space-y-4">
                {filteredHotels.map((hotel, index) => {
                    const publicPrice = Math.round(hotel.price_range_typical / (1 - hotel.avg_advantage_percent / 100));
                    const estimatedProfit = getEstimatedProfit(hotel);
                    const totalCost = hotel.price_range_typical * nights;
                    const totalProfit = estimatedProfit * nights;
                    const suggestedPrice = Math.round(hotel.price_range_typical + estimatedProfit);

                    return (
                        <Card key={hotel.hotel_id} className={cn(index === 0 && "ring-2 ring-amber-400")}>
                            <CardContent className="py-4">
                                <div className="flex items-start gap-6">
                                    {/* Rank Badge */}
                                    <div className={cn(
                                        "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold",
                                        index === 0 ? "bg-amber-100 text-amber-700" :
                                            index <= 2 ? "bg-green-100 text-green-700" :
                                                "bg-muted text-muted-foreground"
                                    )}>
                                        #{index + 1}
                                    </div>

                                    {/* Hotel Info */}
                                    <div className="flex-1 min-w-0 space-y-2">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <Link href={`/hotels/${hotel.hotel_id}`} className="hover:underline">
                                                    <h3 className="font-semibold text-lg">🏨 {hotel.name_cn}</h3>
                                                </Link>
                                                <p className="text-sm text-muted-foreground">
                                                    {hotel.area_tag} · &ldquo;{hotel.positioning_short}&rdquo;
                                                </p>
                                            </div>
                                            {index === 0 && (
                                                <Badge className="bg-amber-500">🏆 最佳推荐</Badge>
                                            )}
                                        </div>

                                        {/* Price Advantage Bar */}
                                        <div className="max-w-md">
                                            <PriceAdvantageBar
                                                ourCost={hotel.price_range_typical}
                                                publicPrice={publicPrice}
                                                advantagePercent={hotel.avg_advantage_percent}
                                                advantageLevel={hotel.advantage_level}
                                                estimatedProfit={estimatedProfit}
                                                showDetail
                                            />
                                        </div>

                                        {/* Tags */}
                                        <div className="flex flex-wrap gap-1.5">
                                            {hotel.target_guests.slice(0, 3).map((guest, i) => (
                                                <Badge key={i} variant="outline" className="text-xs">
                                                    🎯 {guest}
                                                </Badge>
                                            ))}
                                            {hotel.booking_difficulty === 'easy' && (
                                                <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                                                    📅 易订
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    {/* Pricing Summary */}
                                    <div className="flex-shrink-0 text-right space-y-2 min-w-[200px]">
                                        <div>
                                            <div className="text-sm text-muted-foreground">{nights}晚总成本</div>
                                            <div className="text-lg font-bold">{formatPrice(totalCost)}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-muted-foreground">建议报价</div>
                                            <div className="text-lg font-bold text-blue-600">{formatPrice(suggestedPrice * nights)}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-muted-foreground">预计利润</div>
                                            <div className="text-xl font-bold text-amber-600">{formatPrice(totalProfit)}</div>
                                        </div>
                                        <Button size="sm" className="mt-2">
                                            <Plus className="h-4 w-4 mr-1" />
                                            添加到需求
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {filteredHotels.length === 0 && (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        没有找到符合预算的酒店，请调整预算范围或目的地筛选。
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
