'use client';

import { use, useState, useMemo } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import {
    ArrowLeft,
    MapPin,
    Calendar,
    Wallet,
    Users,
    Star,
    Plus,
    MessageSquare,
    Check,
    X,
    Clock,
    Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getInquiryById } from '@/lib/mock-data/inquiries';
import { hotels, getHotelById } from '@/lib/mock-data/hotels';
import { getPriceDataForHotel, calculateDateRangeSummary } from '@/lib/mock-data/prices';
import { PriceAdvantageBar } from '@/components/hotel';
import { Hotel } from '@/lib/types';

const stageColors: Record<string, string> = {
    '需求确认': 'bg-gray-100 text-gray-700',
    '方案推荐': 'bg-blue-100 text-blue-700',
    '等待反馈': 'bg-yellow-100 text-yellow-700',
    '确认预订': 'bg-purple-100 text-purple-700',
    '订房中': 'bg-green-100 text-green-700',
    '已完成': 'bg-green-200 text-green-800',
    '已流失': 'bg-red-100 text-red-700',
    '已取消': 'bg-gray-200 text-gray-600',
};

const feedbackColors: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    'interested': { color: 'text-green-600', icon: <Check className="h-4 w-4" />, label: '感兴趣' },
    'not_interested': { color: 'text-red-600', icon: <X className="h-4 w-4" />, label: '不感兴趣' },
    'considering': { color: 'text-yellow-600', icon: <Clock className="h-4 w-4" />, label: '考虑中' },
    'booked': { color: 'text-green-700', icon: <Check className="h-4 w-4" />, label: '已预订' },
    'pending': { color: 'text-gray-500', icon: <Clock className="h-4 w-4" />, label: '待反馈' },
};

interface InquiryDetailPageProps {
    params: Promise<{ id: string }>;
}

// Score calculation for smart recommendations
function calculateScore(hotel: Hotel, inquiry: ReturnType<typeof getInquiryById>): number {
    if (!inquiry) return 0;

    let score = 50;

    // Price advantage (0-25 points)
    score += Math.min(hotel.avg_advantage_percent, 25);

    // Budget match (0-20 points)
    if (hotel.price_range_typical >= inquiry.budget_per_night.min &&
        hotel.price_range_typical <= inquiry.budget_per_night.max) {
        score += 20;
    } else if (hotel.price_range_typical < inquiry.budget_per_night.max * 1.2) {
        score += 10;
    }

    // Style match (0-15 points)
    const styleMatches = hotel.style_tags.filter(s =>
        inquiry.style_preferences.some(p => s.includes(p) || p.includes(s))
    ).length;
    score += Math.min(styleMatches * 5, 15);

    // Target guest match (0-10 points)
    const guestMatches = hotel.target_guests.filter(g =>
        inquiry.customer_tags.some(t => g.includes(t) || t.includes(g))
    ).length;
    score += Math.min(guestMatches * 5, 10);

    // Booking ease (0-10 points)
    if (hotel.booking_difficulty === 'easy') score += 10;
    else if (hotel.booking_difficulty === 'moderate') score += 5;

    return Math.min(score, 100);
}

export default function InquiryDetailPage({ params }: InquiryDetailPageProps) {
    const resolvedParams = use(params);
    const inquiry = getInquiryById(resolvedParams.id);
    const [activeTab, setActiveTab] = useState('recommendations');

    // Calculate smart recommendations
    const recommendations = useMemo(() => {
        if (!inquiry) return [];

        // Filter hotels in target destinations
        const destinationHotels = hotels.filter(h =>
            inquiry.destinations.some(d =>
                h.destination_board.includes(d.toLowerCase()) ||
                h.city.includes(d) ||
                h.region.includes(d)
            ) || inquiry.destinations.includes('京都') && h.destination_board === 'kyoto-ancient' ||
            inquiry.destinations.includes('东京') && h.destination_board === 'tokyo-downtown' ||
            inquiry.destinations.includes('富士山') && h.destination_board === 'fuji-area' ||
            inquiry.destinations.includes('北海道') && h.destination_board === 'hokkaido'
        );

        // Score and sort
        return destinationHotels
            .map(hotel => ({
                hotel,
                score: calculateScore(hotel, inquiry),
                priceData: getPriceDataForHotel(hotel.hotel_id).slice(0, 14),
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 6);
    }, [inquiry]);

    if (!inquiry) {
        return (
            <div className="container mx-auto py-6">
                <div className="text-center py-12">
                    <h1 className="text-2xl font-bold mb-2">需求未找到</h1>
                    <Link href="/inquiries">
                        <Button className="mt-4">返回需求列表</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const formatPrice = (price: number) => `¥${(price / 1000).toFixed(0)}K`;

    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Back & Header */}
            <div>
                <Link href="/inquiries" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
                    <ArrowLeft className="h-4 w-4" />
                    返回需求列表
                </Link>

                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold">{inquiry.customer_name}</h1>
                            <Badge className={stageColors[inquiry.stage]}>{inquiry.stage}</Badge>
                            {inquiry.priority !== '普通' && (
                                <Badge className={inquiry.priority === 'VIP' ? 'bg-amber-500' : 'bg-red-500'}>
                                    {inquiry.priority}
                                </Badge>
                            )}
                        </div>
                        <p className="text-muted-foreground mt-1">
                            {inquiry.customer_contact} · 微信: {inquiry.customer_wechat}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            发送消息
                        </Button>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            添加推荐
                        </Button>
                    </div>
                </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <MapPin className="h-4 w-4" />
                            <span className="text-sm">目的地</span>
                        </div>
                        <div className="font-medium">{inquiry.destinations.join(' · ')}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <Calendar className="h-4 w-4" />
                            <span className="text-sm">日期</span>
                        </div>
                        <div className="font-medium">
                            {format(new Date(inquiry.travel_dates.from), 'M/d')} - {format(new Date(inquiry.travel_dates.to), 'M/d')}
                            <span className="text-muted-foreground ml-1">({inquiry.travel_dates.nights}晚)</span>
                        </div>
                        {inquiry.travel_dates.flexible && (
                            <div className="text-xs text-blue-600">可调整 ±{inquiry.travel_dates.flexible_range}天</div>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <Wallet className="h-4 w-4" />
                            <span className="text-sm">预算/晚</span>
                        </div>
                        <div className="font-medium">
                            {formatPrice(inquiry.budget_per_night.min)} - {formatPrice(inquiry.budget_per_night.max)}
                        </div>
                        {inquiry.budget_per_night.flexible && (
                            <div className="text-xs text-blue-600">预算可调</div>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <Users className="h-4 w-4" />
                            <span className="text-sm">人数</span>
                        </div>
                        <div className="font-medium">
                            {inquiry.travelers.adults}成人
                            {inquiry.travelers.children > 0 && ` + ${inquiry.travelers.children}儿童`}
                            {inquiry.travelers.children > 0 && (
                                <span className="text-muted-foreground ml-1">
                                    ({inquiry.travelers.children_ages.join('、')}岁)
                                </span>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Requirements Summary */}
            <Card>
                <CardContent className="pt-4 space-y-4">
                    <div className="grid grid-cols-3 gap-6">
                        <div>
                            <div className="text-sm text-muted-foreground mb-2">风格偏好</div>
                            <div className="flex flex-wrap gap-1">
                                {inquiry.style_preferences.map((s, i) => (
                                    <Badge key={i} variant="outline">{s}</Badge>
                                ))}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground mb-2">必须要有</div>
                            <div className="flex flex-wrap gap-1">
                                {inquiry.must_have.map((m, i) => (
                                    <Badge key={i} className="bg-green-100 text-green-700">{m}</Badge>
                                ))}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground mb-2">要避免</div>
                            <div className="flex flex-wrap gap-1">
                                {inquiry.avoid.map((a, i) => (
                                    <Badge key={i} className="bg-red-100 text-red-700">{a}</Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                    {inquiry.special_requests && (
                        <>
                            <Separator />
                            <div>
                                <div className="text-sm text-muted-foreground mb-1">特殊要求</div>
                                <p>{inquiry.special_requests}</p>
                                {inquiry.special_occasion && (
                                    <Badge className="mt-2 bg-pink-100 text-pink-700">
                                        🎉 {inquiry.special_occasion}
                                    </Badge>
                                )}
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="recommendations">
                        <Sparkles className="h-4 w-4 mr-2" />
                        智能推荐
                    </TabsTrigger>
                    <TabsTrigger value="history">
                        已推荐记录 ({inquiry.recommended_hotels.length})
                    </TabsTrigger>
                </TabsList>

                {/* Smart Recommendations */}
                <TabsContent value="recommendations" className="mt-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                            根据客户需求自动匹配，按综合评分排序
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {recommendations.map(({ hotel, score }, index) => {
                            const publicPrice = Math.round(hotel.price_range_typical / (1 - hotel.avg_advantage_percent / 100));
                            const estimatedProfit = Math.round((publicPrice - hotel.price_range_typical) * 0.7);

                            return (
                                <Card key={hotel.hotel_id} className={cn(index === 0 && "ring-2 ring-amber-400")}>
                                    <CardContent className="pt-4 space-y-3">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <Link href={`/hotels/${hotel.hotel_id}`} className="font-semibold hover:underline">
                                                        🏨 {hotel.name_cn}
                                                    </Link>
                                                    {index === 0 && <Badge className="bg-amber-500">🏆 最匹配</Badge>}
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {hotel.area_tag} · &ldquo;{hotel.positioning_short}&rdquo;
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold">{score}</div>
                                                <div className="text-xs text-muted-foreground">匹配分</div>
                                            </div>
                                        </div>

                                        <PriceAdvantageBar
                                            ourCost={hotel.price_range_typical}
                                            publicPrice={publicPrice}
                                            advantagePercent={hotel.avg_advantage_percent}
                                            advantageLevel={hotel.advantage_level}
                                            estimatedProfit={estimatedProfit}
                                            showDetail
                                        />

                                        <div className="flex flex-wrap gap-1">
                                            {hotel.target_guests.slice(0, 2).map((g, i) => (
                                                <Badge key={i} variant="outline" className="text-xs">{g}</Badge>
                                            ))}
                                            {hotel.booking_difficulty === 'easy' && (
                                                <Badge variant="outline" className="text-xs text-green-600">易订</Badge>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 pt-2">
                                            <Button size="sm" className="flex-1">添加推荐</Button>
                                            <Link href={`/hotels/${hotel.hotel_id}`}>
                                                <Button variant="outline" size="sm">查看详情</Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </TabsContent>

                {/* Recommendation History */}
                <TabsContent value="history" className="mt-6 space-y-4">
                    {inquiry.recommended_hotels.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center text-muted-foreground">
                                暂无推荐记录
                            </CardContent>
                        </Card>
                    ) : (
                        inquiry.recommended_hotels.map((rec, i) => {
                            const hotel = getHotelById(rec.hotel_id);
                            if (!hotel) return null;

                            const feedback = rec.customer_feedback ? feedbackColors[rec.customer_feedback] : null;

                            return (
                                <Card key={i}>
                                    <CardContent className="pt-4">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <Link href={`/hotels/${hotel.hotel_id}`} className="font-semibold hover:underline">
                                                        🏨 {hotel.name_cn}
                                                    </Link>
                                                    {feedback && (
                                                        <div className={cn("flex items-center gap-1", feedback.color)}>
                                                            {feedback.icon}
                                                            <span className="text-sm">{feedback.label}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {format(new Date(rec.dates.from), 'M/d')} - {format(new Date(rec.dates.to), 'M/d')}
                                                    {rec.quoted_price && ` · 报价 ${formatPrice(rec.quoted_price)}`}
                                                </div>
                                                {rec.feedback_note && (
                                                    <div className="text-sm bg-muted/50 p-2 rounded mt-2">
                                                        💬 {rec.feedback_note}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {format(new Date(rec.recommended_at), 'M/d HH:mm')}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
