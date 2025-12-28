'use client';

import { cn } from '@/lib/utils';
import { AdvantageLevel } from '@/lib/types';

interface PriceAdvantageBarProps {
    ourCost: number;
    publicPrice: number;
    advantagePercent: number;
    advantageLevel: AdvantageLevel;
    estimatedProfit?: number;
    showDetail?: boolean;
    className?: string;
}

const levelConfig = {
    excellent: { label: '⭐⭐⭐ 超强优势', color: 'bg-amber-500', textColor: 'text-amber-600' },
    good: { label: '⭐⭐ Good', color: 'bg-green-500', textColor: 'text-green-600' },
    fair: { label: '⭐ Fair', color: 'bg-blue-500', textColor: 'text-blue-600' },
    none: { label: '⚪ 无优势', color: 'bg-gray-300', textColor: 'text-gray-500' },
};

export function PriceAdvantageBar({
    ourCost,
    publicPrice,
    advantagePercent,
    advantageLevel,
    estimatedProfit,
    showDetail = false,
    className,
}: PriceAdvantageBarProps) {
    const config = levelConfig[advantageLevel];
    const barWidth = Math.min(advantagePercent * 3, 100); // Scale for visual effect

    const formatPrice = (price: number) => {
        return `¥${(price / 1000).toFixed(0)}K`;
    };

    return (
        <div className={cn("space-y-1.5", className)}>
            {showDetail && (
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                        成本: <span className="font-medium text-foreground">{formatPrice(ourCost)}</span>
                    </span>
                    <span className="text-muted-foreground">
                        公开: <span className="font-medium text-foreground">{formatPrice(publicPrice)}</span>
                    </span>
                </div>
            )}

            <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                    className={cn("h-full rounded-full transition-all duration-500", config.color)}
                    style={{ width: `${barWidth}%` }}
                />
            </div>

            <div className="flex items-center justify-between text-xs">
                <span className={cn("font-medium", config.textColor)}>
                    {advantagePercent}% {config.label}
                </span>
                {estimatedProfit && (
                    <span className="text-muted-foreground">
                        毛利: <span className="font-medium text-amber-600">{formatPrice(estimatedProfit)}</span>
                    </span>
                )}
            </div>
        </div>
    );
}
