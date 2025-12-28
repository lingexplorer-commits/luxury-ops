'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { MapPin, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Hotel, DatePriceAvailability, RecommendationTag } from '@/lib/types';
import { PriceAdvantageBar } from './PriceAdvantageBar';
import { RecommendationTags, generateAdvantageTag, generateProfitTag } from './RecommendationTags';
import { AvailabilityDots } from './AvailabilityDots';

interface HotelCardProps {
    hotel: Hotel;
    availabilityData?: DatePriceAvailability[];
    score?: number;
    showCalendar?: boolean;
    onAddToInquiry?: () => void;
    className?: string;
}

export function HotelCard({
    hotel,
    availabilityData = [],
    score,
    showCalendar = true,
    onAddToInquiry,
    className,
}: HotelCardProps) {
    // Generate tags based on hotel data
    const tags = useMemo(() => {
        const result: RecommendationTag[] = [];

        // Price advantage tag
        result.push(generateAdvantageTag(hotel.advantage_level, hotel.avg_advantage_percent));

        // High profit tag (estimate based on typical price and advantage)
        const estimatedProfit = hotel.price_range_typical * (hotel.avg_advantage_percent / 100) * 0.7;
        const profitTag = generateProfitTag(estimatedProfit);
        if (profitTag) result.push(profitTag);

        // Target guest tags (top 2)
        hotel.target_guests.slice(0, 2).forEach((guest, i) => {
            result.push({
                tag_id: `guest-${i}`,
                tag_type: 'guest_fit',
                tag_label: `🎯 ${guest}`,
                tag_color: 'purple',
                score_contribution: 10,
                priority: 50 - i,
            });
        });

        // Booking difficulty tag
        if (hotel.booking_difficulty === 'easy') {
            result.push({
                tag_id: 'booking-easy',
                tag_type: 'booking_ease',
                tag_label: '📅 易订',
                tag_color: 'blue',
                score_contribution: 10,
                priority: 40,
            });
        }

        return result;
    }, [hotel]);

    const formatPrice = (price: number) => {
        return `¥${(price / 1000).toFixed(0)}K`;
    };

    // Mock public price (for display)
    const publicPrice = Math.round(hotel.price_range_typical / (1 - hotel.avg_advantage_percent / 100));
    const estimatedProfit = Math.round((publicPrice - hotel.price_range_typical) * 0.7);

    return (
        <Card className={cn("group hover:shadow-lg transition-shadow", className)}>
            <CardContent className="pt-4 pb-2 space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-base truncate">
                                🏨 {hotel.name_cn}
                            </h3>
                            {score && (
                                <Badge variant="secondary" className="shrink-0">
                                    {score}/100
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                            &ldquo;{hotel.positioning_short}&rdquo;
                        </p>
                    </div>
                </div>

                {/* Price Advantage Section */}
                <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span>💰 价格优势</span>
                    </div>
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
                <RecommendationTags tags={tags} maxDisplay={4} size="sm" />

                {/* Location & Price Info */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{hotel.area_tag}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span>👥</span>
                        <span>{hotel.target_guests.slice(0, 2).join('·')}</span>
                    </div>
                </div>
                <div className="text-sm">
                    💴 {formatPrice(hotel.price_range_min)}-{formatPrice(hotel.price_range_max)}/晚
                </div>

                {/* Availability Preview */}
                {showCalendar && availabilityData.length > 0 && (
                    <div className="pt-1">
                        <div className="text-xs text-muted-foreground mb-1">房态预览:</div>
                        <AvailabilityDots data={availabilityData} maxDots={14} />
                    </div>
                )}
            </CardContent>

            {/* Actions */}
            <CardFooter className="pt-0 pb-3 gap-2">
                <Link href={`/hotels/${hotel.hotel_id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                        查看详情
                    </Button>
                </Link>
                <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={onAddToInquiry}
                >
                    添加到需求
                </Button>
                <Link href={`/hotels/${hotel.hotel_id}?tab=calendar`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ExternalLink className="h-4 w-4" />
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    );
}
