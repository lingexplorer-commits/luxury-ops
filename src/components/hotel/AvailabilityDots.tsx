'use client';

import { cn } from '@/lib/utils';
import { DatePriceAvailability, AvailabilityStatus } from '@/lib/types';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface AvailabilityDotsProps {
    data: DatePriceAvailability[];
    maxDots?: number;
    className?: string;
}

const statusColors: Record<AvailabilityStatus, string> = {
    available: 'bg-green-500',
    last_few: 'bg-green-500',
    unavailable: 'bg-red-500',
    on_request: 'bg-yellow-500',
    unknown: 'bg-gray-300',
};

const statusLabels: Record<AvailabilityStatus, string> = {
    available: '有房',
    last_few: '仅剩几间',
    unavailable: '无房',
    on_request: '待确认',
    unknown: '未知',
};

export function AvailabilityDots({
    data,
    maxDots = 14,
    className,
}: AvailabilityDotsProps) {
    const displayData = data.slice(0, maxDots);

    // Check if any dots need the "tryable" color (unavailable but high release rate)
    const getColor = (item: DatePriceAvailability) => {
        if (item.availability_status === 'unavailable') {
            if (item.historical_availability_rate && item.historical_availability_rate >= 50) {
                return 'bg-yellow-500'; // Tryable
            }
            return 'bg-red-500';
        }
        return statusColors[item.availability_status];
    };

    const getLabel = (item: DatePriceAvailability) => {
        const date = new Date(item.date);
        const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;

        if (item.availability_status === 'unavailable' && item.historical_availability_rate) {
            return `${dateStr}: 无房 (出房率${item.historical_availability_rate}%)`;
        }

        return `${dateStr}: ${statusLabels[item.availability_status]}`;
    };

    return (
        <TooltipProvider>
            <div className={cn("flex items-center gap-0.5", className)}>
                {displayData.map((item) => (
                    <Tooltip key={item.id}>
                        <TooltipTrigger asChild>
                            <div
                                className={cn(
                                    "w-2 h-2 rounded-full cursor-pointer transition-transform hover:scale-150",
                                    getColor(item)
                                )}
                            />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="text-xs">{getLabel(item)}</p>
                        </TooltipContent>
                    </Tooltip>
                ))}
                {data.length > maxDots && (
                    <span className="text-xs text-muted-foreground ml-1">
                        ...
                    </span>
                )}
            </div>
        </TooltipProvider>
    );
}
