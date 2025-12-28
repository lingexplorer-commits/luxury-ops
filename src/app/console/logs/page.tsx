'use client';

import { RefreshCcw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

// Mock logs
const mockLogs = [
    {
        id: '1',
        timestamp: '2024-12-29 03:05:32',
        level: 'success',
        category: 'monitoring',
        message: 'FUFU河口湖 3/22 检测到有房 - 价格 ¥72,000',
        hotel: 'FUFU 河口湖',
    },
    {
        id: '2',
        timestamp: '2024-12-29 03:04:15',
        level: 'info',
        category: 'monitoring',
        message: '开始执行监控任务：安缦京都 3/25-28',
        hotel: '安缦京都',
    },
    {
        id: '3',
        timestamp: '2024-12-29 03:02:08',
        level: 'warning',
        category: 'price',
        message: 'FUFU河口湖价格变动 +25%（¥72,000 → ¥90,000）',
        hotel: 'FUFU 河口湖',
    },
    {
        id: '4',
        timestamp: '2024-12-29 03:00:45',
        level: 'error',
        category: 'monitoring',
        message: '坐忘林监控失败：请求超时（第3次）',
        hotel: '坐忘林',
    },
    {
        id: '5',
        timestamp: '2024-12-29 02:58:22',
        level: 'info',
        category: 'booking',
        message: '自动订房规则触发：FUFU河口湖 3/22',
        hotel: 'FUFU 河口湖',
    },
    {
        id: '6',
        timestamp: '2024-12-29 02:55:10',
        level: 'success',
        category: 'booking',
        message: '自动订房成功：FUFU河口湖 3/22 - 订单号 ORD-20241229-001',
        hotel: 'FUFU 河口湖',
    },
    {
        id: '7',
        timestamp: '2024-12-29 02:50:33',
        level: 'info',
        category: 'sync',
        message: '价格同步完成：14家酒店，2,847条价格更新',
        hotel: null,
    },
    {
        id: '8',
        timestamp: '2024-12-29 02:45:18',
        level: 'warning',
        category: 'system',
        message: 'API请求频率接近限制（85%）',
        hotel: null,
    },
];

const levelConfig: Record<string, { label: string; color: string; bg: string }> = {
    info: { label: 'INFO', color: 'text-blue-400', bg: 'bg-blue-500/20' },
    success: { label: 'SUCCESS', color: 'text-green-400', bg: 'bg-green-500/20' },
    warning: { label: 'WARN', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
    error: { label: 'ERROR', color: 'text-red-400', bg: 'bg-red-500/20' },
};

const categoryConfig: Record<string, string> = {
    monitoring: '监控',
    booking: '订房',
    sync: '同步',
    price: '价格',
    system: '系统',
};

export default function LogsPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--console-text)]">系统日志</h1>
                    <p className="text-[var(--console-text-muted)] text-sm">查看系统运行日志</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="border-[var(--console-border)] text-[var(--console-text)]">
                        <Download className="h-4 w-4 mr-2" />
                        导出
                    </Button>
                    <Button variant="outline" size="sm" className="border-[var(--console-border)] text-[var(--console-text)]">
                        <RefreshCcw className="h-4 w-4 mr-2" />
                        刷新
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <Select defaultValue="all">
                    <SelectTrigger className="w-[120px] bg-[var(--console-card)] border-[var(--console-border)] text-[var(--console-text)]">
                        <SelectValue placeholder="级别" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">全部级别</SelectItem>
                        <SelectItem value="info">INFO</SelectItem>
                        <SelectItem value="success">SUCCESS</SelectItem>
                        <SelectItem value="warning">WARNING</SelectItem>
                        <SelectItem value="error">ERROR</SelectItem>
                    </SelectContent>
                </Select>

                <Select defaultValue="all">
                    <SelectTrigger className="w-[120px] bg-[var(--console-card)] border-[var(--console-border)] text-[var(--console-text)]">
                        <SelectValue placeholder="类别" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">全部类别</SelectItem>
                        <SelectItem value="monitoring">监控</SelectItem>
                        <SelectItem value="booking">订房</SelectItem>
                        <SelectItem value="sync">同步</SelectItem>
                        <SelectItem value="price">价格</SelectItem>
                        <SelectItem value="system">系统</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Log Entries */}
            <div className="console-card rounded-lg border border-[var(--console-border)] overflow-hidden">
                <div className="font-mono text-sm">
                    {mockLogs.map((log) => {
                        const level = levelConfig[log.level];
                        return (
                            <div
                                key={log.id}
                                className="flex items-start gap-4 px-4 py-3 border-b border-[var(--console-border)] last:border-b-0 hover:bg-[var(--console-border)] transition-colors"
                            >
                                {/* Timestamp */}
                                <span className="text-[var(--console-text-muted)] shrink-0 w-[160px]">
                                    {log.timestamp}
                                </span>

                                {/* Level Badge */}
                                <Badge
                                    className={`${level.bg} ${level.color} border-0 w-[70px] justify-center shrink-0`}
                                >
                                    {level.label}
                                </Badge>

                                {/* Category */}
                                <Badge
                                    variant="outline"
                                    className="border-[var(--console-border)] text-[var(--console-text-muted)] w-[60px] justify-center shrink-0"
                                >
                                    {categoryConfig[log.category]}
                                </Badge>

                                {/* Message */}
                                <span className="text-[var(--console-text)] flex-1">
                                    {log.message}
                                </span>

                                {/* Hotel Tag */}
                                {log.hotel && (
                                    <Badge
                                        variant="outline"
                                        className="border-[var(--console-border)] text-[var(--console-text-muted)] shrink-0"
                                    >
                                        {log.hotel}
                                    </Badge>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Load More */}
            <div className="text-center">
                <Button
                    variant="outline"
                    className="border-[var(--console-border)] text-[var(--console-text-muted)]"
                >
                    加载更多
                </Button>
            </div>
        </div>
    );
}
