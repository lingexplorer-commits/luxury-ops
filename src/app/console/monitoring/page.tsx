'use client';

import { Plus, RefreshCcw, Pause, Play, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NewMonitoringDialog } from '@/components/dialogs';

// Mock monitoring tasks
const mockTasks = [
    {
        id: '1',
        hotel: 'FUFU 河口湖',
        roomType: '富士景观房',
        dates: '3/20-22',
        status: 'available',
        lastCheck: '2分钟前',
        nextCheck: '28分后',
        price: '¥72,000',
    },
    {
        id: '2',
        hotel: '安缦京都',
        roomType: '全部房型',
        dates: '3/25-28',
        status: 'unavailable',
        lastCheck: '5分钟前',
        nextCheck: '25分后',
        price: null,
    },
    {
        id: '3',
        hotel: '虹夕诺雅 京都',
        roomType: '水之庭',
        dates: '4/1-3',
        status: 'error',
        lastCheck: '10分钟前',
        nextCheck: '-',
        price: null,
    },
    {
        id: '4',
        hotel: '星野轻井泽',
        roomType: '标准双床',
        dates: '4/5-7',
        status: 'monitoring',
        lastCheck: '1分钟前',
        nextCheck: '29分后',
        price: null,
    },
    {
        id: '5',
        hotel: '坐忘林',
        roomType: '露天风吕套房',
        dates: '4/10-12',
        status: 'paused',
        lastCheck: '2小时前',
        nextCheck: '-',
        price: null,
    },
];

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    available: { label: '🟢 有房', color: 'text-green-400', bg: 'bg-green-500/20' },
    unavailable: { label: '🔴 无房', color: 'text-red-400', bg: 'bg-red-500/20' },
    monitoring: { label: '🔵 监控中', color: 'text-blue-400', bg: 'bg-blue-500/20' },
    error: { label: '⚠️ 异常', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
    paused: { label: '⚫ 已暂停', color: 'text-gray-400', bg: 'bg-gray-500/20' },
};

export default function MonitoringPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--console-text)]">刷房监控</h1>
                    <p className="text-[var(--console-text-muted)] text-sm">管理房态监控任务</p>
                </div>
                <div className="flex items-center gap-2">
                    <NewMonitoringDialog />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="border-[var(--console-border)] text-[var(--console-text)]">
                                批量操作
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem>暂停选中</DropdownMenuItem>
                            <DropdownMenuItem>恢复选中</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-500">删除选中</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-[var(--console-border)] text-[var(--console-text-muted)]">
                    状态: 全部
                </Badge>
                <Badge variant="outline" className="border-[var(--console-border)] text-[var(--console-text-muted)]">
                    酒店: 全部
                </Badge>
                <Badge variant="outline" className="border-[var(--console-border)] text-[var(--console-text-muted)]">
                    数据源: 全部
                </Badge>
            </div>

            {/* Table */}
            <div className="console-card rounded-lg border border-[var(--console-border)] overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="border-[var(--console-border)] hover:bg-transparent">
                            <TableHead className="w-12 text-[var(--console-text-muted)]">
                                <Checkbox />
                            </TableHead>
                            <TableHead className="text-[var(--console-text-muted)]">酒店</TableHead>
                            <TableHead className="text-[var(--console-text-muted)]">房型</TableHead>
                            <TableHead className="text-[var(--console-text-muted)]">日期</TableHead>
                            <TableHead className="text-[var(--console-text-muted)]">状态</TableHead>
                            <TableHead className="text-[var(--console-text-muted)]">最后检查</TableHead>
                            <TableHead className="text-[var(--console-text-muted)]">下次检查</TableHead>
                            <TableHead className="text-[var(--console-text-muted)]">价格</TableHead>
                            <TableHead className="text-[var(--console-text-muted)]">操作</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockTasks.map((task) => {
                            const status = statusConfig[task.status];
                            return (
                                <TableRow
                                    key={task.id}
                                    className="border-[var(--console-border)] hover:bg-[var(--console-border)]"
                                >
                                    <TableCell>
                                        <Checkbox />
                                    </TableCell>
                                    <TableCell className="text-[var(--console-text)] font-medium">
                                        {task.hotel}
                                    </TableCell>
                                    <TableCell className="text-[var(--console-text-muted)]">
                                        {task.roomType}
                                    </TableCell>
                                    <TableCell className="text-[var(--console-text-muted)]">
                                        {task.dates}
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={`${status.bg} ${status.color} border-0`}>
                                            {status.label}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-[var(--console-text-muted)]">
                                        {task.lastCheck}
                                    </TableCell>
                                    <TableCell className="text-[var(--console-text-muted)]">
                                        {task.nextCheck}
                                    </TableCell>
                                    <TableCell className="text-[var(--console-text)]">
                                        {task.price || '-'}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-[var(--console-text-muted)] hover:text-[var(--console-text)]"
                                            >
                                                <RefreshCcw className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-[var(--console-text-muted)] hover:text-[var(--console-text)]"
                                            >
                                                {task.status === 'paused' ? (
                                                    <Play className="h-4 w-4" />
                                                ) : (
                                                    <Pause className="h-4 w-4" />
                                                )}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-[var(--console-text-muted)] hover:text-red-400"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
