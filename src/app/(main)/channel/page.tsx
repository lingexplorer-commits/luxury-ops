'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { BarChart3, TrendingUp, Award, Hotel } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { hotels, destinationBoards } from '@/lib/mock-data/hotels';
import { PriceAdvantageBar } from '@/components/hotel';

// Stat card component
function StatCard({
    title,
    value,
    subValue,
    icon: Icon,
    trend,
    trendUp,
    className
}: {
    title: string;
    value: string | number;
    subValue?: string;
    icon: React.ElementType;
    trend?: string;
    trendUp?: boolean;
    className?: string;
}) {
    return (
        <Card className={className}>
            <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">{title}</p>
                        <p className="text-3xl font-bold mt-1">{value}</p>
                        {subValue && <p className="text-sm text-muted-foreground">{subValue}</p>}
                        {trend && (
                            <p className={cn("text-sm mt-1", trendUp ? "text-green-600" : "text-red-600")}>
                                {trendUp ? '↑' : '↓'} {trend}
                            </p>
                        )}
                    </div>
                    <div className="p-2 bg-muted rounded-lg">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function ChannelPage() {
    // Calculate channel statistics
    const stats = useMemo(() => {
        const total = hotels.length;
        const excellent = hotels.filter(h => h.advantage_level === 'excellent').length;
        const good = hotels.filter(h => h.advantage_level === 'good').length;
        const avgAdvantage = Math.round(hotels.reduce((sum, h) => sum + h.avg_advantage_percent, 0) / total);
        const advantageHotels = excellent + good;

        return { total, excellent, good, avgAdvantage, advantageHotels };
    }, []);

    // Sort hotels by advantage
    const rankedHotels = useMemo(() => {
        return [...hotels].sort((a, b) => b.avg_advantage_percent - a.avg_advantage_percent);
    }, []);

    // Board analysis
    const boardStats = useMemo(() => {
        return destinationBoards.map(board => {
            const boardHotels = hotels.filter(h => h.destination_board === board.board_id);
            const avgAdvantage = Math.round(
                boardHotels.reduce((sum, h) => sum + h.avg_advantage_percent, 0) / boardHotels.length
            );
            const excellentCount = boardHotels.filter(h => h.advantage_level === 'excellent' || h.advantage_level === 'good').length;

            return {
                ...board,
                avgAdvantage,
                excellentCount,
                hotelCount: boardHotels.length,
            };
        }).sort((a, b) => b.avgAdvantage - a.avgAdvantage);
    }, []);

    // Channel distribution
    const channelDistribution = useMemo(() => {
        const channels: Record<string, number> = {};
        hotels.forEach(h => {
            const channel = h.our_primary_channel;
            channels[channel] = (channels[channel] || 0) + 1;
        });
        return Object.entries(channels)
            .map(([name, count]) => ({ name, count, percent: Math.round((count / hotels.length) * 100) }))
            .sort((a, b) => b.count - a.count);
    }, []);

    const getAdvantageColor = (percent: number) => {
        if (percent >= 25) return 'text-amber-600';
        if (percent >= 15) return 'text-green-600';
        if (percent >= 10) return 'text-blue-600';
        return 'text-gray-500';
    };

    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <BarChart3 className="h-6 w-6" />
                <h1 className="text-2xl font-bold">📊 渠道分析</h1>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-4">
                <StatCard
                    title="覆盖酒店"
                    value={stats.total}
                    subValue="家"
                    icon={Hotel}
                />
                <StatCard
                    title="优势酒店"
                    value={stats.advantageHotels}
                    subValue={`${Math.round((stats.advantageHotels / stats.total) * 100)}% 有优势`}
                    icon={Award}
                    className="ring-2 ring-amber-200"
                />
                <StatCard
                    title="平均优势"
                    value={`${stats.avgAdvantage}%`}
                    icon={TrendingUp}
                    trend="比上月+2%"
                    trendUp={true}
                />
                <StatCard
                    title="超强优势(≥25%)"
                    value={stats.excellent}
                    subValue="家酒店"
                    icon={Award}
                    className="bg-amber-50"
                />
            </div>

            {/* Main Content */}
            <Tabs defaultValue="ranking">
                <TabsList>
                    <TabsTrigger value="ranking">🏆 优势排行</TabsTrigger>
                    <TabsTrigger value="boards">🗺️ 板块分析</TabsTrigger>
                    <TabsTrigger value="channels">📡 渠道分布</TabsTrigger>
                </TabsList>

                {/* Ranking Tab */}
                <TabsContent value="ranking" className="mt-6 space-y-4">
                    <div className="text-sm text-muted-foreground mb-4">
                        按价格优势排序，展示我们相对公开价格的竞争力
                    </div>

                    {rankedHotels.map((hotel, index) => {
                        const publicPrice = Math.round(hotel.price_range_typical / (1 - hotel.avg_advantage_percent / 100));
                        const estimatedProfit = Math.round((publicPrice - hotel.price_range_typical) * 0.7);

                        return (
                            <Card key={hotel.hotel_id} className={cn(index < 3 && "border-amber-200")}>
                                <CardContent className="py-4">
                                    <div className="flex items-center gap-4">
                                        {/* Rank */}
                                        <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0",
                                            index === 0 ? "bg-amber-100 text-amber-700" :
                                                index === 1 ? "bg-gray-100 text-gray-700" :
                                                    index === 2 ? "bg-orange-100 text-orange-700" :
                                                        "bg-muted text-muted-foreground"
                                        )}>
                                            {index < 3 ? ['🥇', '🥈', '🥉'][index] : index + 1}
                                        </div>

                                        {/* Hotel Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <Link href={`/hotels/${hotel.hotel_id}`} className="font-semibold hover:underline">
                                                    {hotel.name_cn}
                                                </Link>
                                                <Badge variant="outline" className="text-xs">
                                                    {destinationBoards.find(b => b.board_id === hotel.destination_board)?.name}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground truncate">
                                                {hotel.area_tag} · {hotel.brand}
                                            </p>
                                        </div>

                                        {/* Advantage Bar */}
                                        <div className="w-64">
                                            <PriceAdvantageBar
                                                ourCost={hotel.price_range_typical}
                                                publicPrice={publicPrice}
                                                advantagePercent={hotel.avg_advantage_percent}
                                                advantageLevel={hotel.advantage_level}
                                            />
                                        </div>

                                        {/* Stats */}
                                        <div className="text-right shrink-0 w-32">
                                            <div className={cn("text-2xl font-bold", getAdvantageColor(hotel.avg_advantage_percent))}>
                                                {hotel.avg_advantage_percent}%
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                毛利 ¥{(estimatedProfit / 1000).toFixed(0)}K/晚
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </TabsContent>

                {/* Boards Tab */}
                <TabsContent value="boards" className="mt-6">
                    <div className="grid grid-cols-2 gap-4">
                        {boardStats.map((board, index) => (
                            <Card key={board.board_id} className={cn(index === 0 && "ring-2 ring-amber-400")}>
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg">{board.name}</CardTitle>
                                        {index === 0 && <Badge className="bg-amber-500">🏆 最优</Badge>}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div>
                                            <div className="text-2xl font-bold">{board.hotelCount}</div>
                                            <div className="text-xs text-muted-foreground">酒店数</div>
                                        </div>
                                        <div>
                                            <div className={cn("text-2xl font-bold", getAdvantageColor(board.avgAdvantage))}>
                                                {board.avgAdvantage}%
                                            </div>
                                            <div className="text-xs text-muted-foreground">平均优势</div>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-green-600">{board.excellentCount}</div>
                                            <div className="text-xs text-muted-foreground">优势酒店</div>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span>优势覆盖率</span>
                                            <span>{Math.round((board.excellentCount / board.hotelCount) * 100)}%</span>
                                        </div>
                                        <Progress
                                            value={(board.excellentCount / board.hotelCount) * 100}
                                            className="h-2"
                                        />
                                    </div>

                                    <div className="text-sm text-muted-foreground">
                                        {board.description}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Channels Tab */}
                <TabsContent value="channels" className="mt-6">
                    <div className="grid grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>主要渠道分布</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {channelDistribution.map(channel => (
                                    <div key={channel.name} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">{channel.name}</span>
                                            <span className="text-muted-foreground">{channel.count}家 ({channel.percent}%)</span>
                                        </div>
                                        <Progress value={channel.percent} className="h-2" />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>渠道优势说明</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="p-3 bg-muted/50 rounded-lg">
                                        <div className="font-medium">ikyu_b2b (一休B2B)</div>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            主力渠道，覆盖虹夕诺雅、安缦、FUFU等品牌，平均优势22%
                                        </p>
                                    </div>
                                    <div className="p-3 bg-muted/50 rounded-lg">
                                        <div className="font-medium">jalan_b2b (Jalan B2B)</div>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            性价比酒店渠道，覆盖富士吟景、鶴雅等，平均优势16%
                                        </p>
                                    </div>
                                    <div className="p-3 bg-muted/50 rounded-lg">
                                        <div className="font-medium">direct (直采)</div>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            国际品牌直签，柏悦、半岛、四季等，优势较小但稳定
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
