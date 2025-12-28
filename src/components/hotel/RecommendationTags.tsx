'use client';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { RecommendationTag, TagColor } from '@/lib/types';

interface RecommendationTagsProps {
    tags: RecommendationTag[];
    maxDisplay?: number;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const colorMap: Record<TagColor, string> = {
    gold: 'bg-amber-100 text-amber-700 border-amber-200',
    green: 'bg-green-100 text-green-700 border-green-200',
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    purple: 'bg-purple-100 text-purple-700 border-purple-200',
    yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    red: 'bg-red-100 text-red-700 border-red-200',
    gray: 'bg-gray-100 text-gray-600 border-gray-200',
};

const sizeMap = {
    sm: 'text-[10px] px-1.5 py-0',
    md: 'text-xs px-2 py-0.5',
    lg: 'text-sm px-2.5 py-1',
};

export function RecommendationTags({
    tags,
    maxDisplay = 4,
    size = 'md',
    className,
}: RecommendationTagsProps) {
    // Sort by priority and take top N
    const sortedTags = [...tags].sort((a, b) => b.priority - a.priority);
    const displayTags = sortedTags.slice(0, maxDisplay);
    const remainingCount = tags.length - maxDisplay;

    return (
        <div className={cn("flex flex-wrap gap-1", className)}>
            {displayTags.map((tag) => (
                <Badge
                    key={tag.tag_id}
                    variant="outline"
                    className={cn(
                        "font-normal border",
                        colorMap[tag.tag_color],
                        sizeMap[size]
                    )}
                >
                    {tag.tag_label}
                </Badge>
            ))}
            {remainingCount > 0 && (
                <Badge
                    variant="outline"
                    className={cn("font-normal", colorMap.gray, sizeMap[size])}
                >
                    +{remainingCount}
                </Badge>
            )}
        </div>
    );
}

// Pre-built tag generators for common scenarios
export function generateAdvantageTag(level: string, percent: number): RecommendationTag {
    if (percent >= 25) {
        return {
            tag_id: 'adv-excellent',
            tag_type: 'price_advantage',
            tag_label: '💎 价格优势大',
            tag_color: 'gold',
            score_contribution: 30,
            priority: 100,
        };
    }
    if (percent >= 15) {
        return {
            tag_id: 'adv-good',
            tag_type: 'price_advantage',
            tag_label: '💰 有优势',
            tag_color: 'green',
            score_contribution: 20,
            priority: 90,
        };
    }
    if (percent >= 10) {
        return {
            tag_id: 'adv-fair',
            tag_type: 'price_advantage',
            tag_label: '⭐ 有一定优势',
            tag_color: 'blue',
            score_contribution: 10,
            priority: 80,
        };
    }
    return {
        tag_id: 'adv-none',
        tag_type: 'price_advantage',
        tag_label: '⚪ 无价格优势',
        tag_color: 'gray',
        score_contribution: 0,
        priority: 10,
    };
}

export function generateProfitTag(profit: number): RecommendationTag | null {
    if (profit >= 20000) {
        return {
            tag_id: 'profit-high',
            tag_type: 'high_profit',
            tag_label: '💵 高利润',
            tag_color: 'gold',
            score_contribution: 15,
            priority: 85,
        };
    }
    return null;
}

export function generateAvailabilityTag(status: string, rate?: number | null): RecommendationTag {
    if (status === 'available' || status === 'last_few') {
        return {
            tag_id: 'avail-yes',
            tag_type: 'availability',
            tag_label: '🟢 有房',
            tag_color: 'green',
            score_contribution: 20,
            priority: 95,
        };
    }
    if (rate && rate >= 50) {
        return {
            tag_id: 'avail-tryable',
            tag_type: 'availability',
            tag_label: '🟡 值得刷',
            tag_color: 'yellow',
            score_contribution: 10,
            priority: 70,
        };
    }
    return {
        tag_id: 'avail-hard',
        tag_type: 'availability',
        tag_label: '🔴 难订',
        tag_color: 'red',
        score_contribution: -10,
        priority: 60,
    };
}
