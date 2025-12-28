'use client';

import { Activity, CheckCircle, AlertTriangle, RefreshCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Console-styled stat card
function StatCard({
    title,
    value,
    icon: Icon,
    trend,
    trendUp
}: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    trend?: string;
    trendUp?: boolean;
}) {
    return (
        <div className="console-card rounded-lg border p-4 space-y-2">
            <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--console-text-muted)]">{title}</span>
                <Icon className="h-4 w-4 text-[var(--console-text-muted)]" />
            </div>
            <div className="text-3xl font-bold text-[var(--console-text)]">{value}</div>
            {trend && (
                <div className={`text-xs ${trendUp ? 'text-green-400' : 'text-red-400'}`}>
                    {trendUp ? '↑' : '↓'} {trend}
                </div>
            )}
        </div>
    );
}

// Alert item
function AlertItem({
    icon: Icon,
    message,
    time,
    color
}: {
    icon: React.ElementType;
    message: string;
    time: string;
    color: string;
}) {
    return (
        <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-[var(--console-border)] transition-colors">
            <Icon className={`h-5 w-5 mt-0.5 ${color}`} />
            <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--console-text)]">{message}</p>
                <p className="text-xs text-[var(--console-text-muted)]">{time}</p>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-[var(--console-text-muted)]">
                <RefreshCcw className="h-4 w-4" />
            </Button>
        </div>
    );
}

export default function ConsolePage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--console-text)]">控制台总览</h1>
                    <p className="text-[var(--console-text-muted)] text-sm">监控自动化任务运行状态</p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-[var(--console-border)] text-[var(--console-text-muted)]">
                        今天
                    </Badge>
                    <Button variant="outline" size="sm" className="border-[var(--console-border)] text-[var(--console-text)]">
                        <RefreshCcw className="h-4 w-4 mr-2" />
                        刷新
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-4">
                <StatCard
                    title="监控中"
                    value={13}
                    icon={Activity}
                    trend="5 新增"
                    trendUp={true}
                />
                <StatCard
                    title="有房"
                    value={7}
                    icon={CheckCircle}
                    trend="3 新发现"
                    trendUp={true}
                />
                <StatCard
                    title="异常"
                    value={3}
                    icon={AlertTriangle}
                    trend="1 已解决"
                    trendUp={false}
                />
                <StatCard
                    title="今日检查"
                    value="2,093"
                    icon={RefreshCcw}
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-2 gap-4">
                <Card className="console-card border-[var(--console-border)]">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-[var(--console-text)]">
                            监控状态分布
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Placeholder for pie chart */}
                        <div className="h-48 flex items-center justify-center">
                            <div className="text-center space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                        <span className="text-[var(--console-text-muted)]">有房 (7)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                        <span className="text-[var(--console-text-muted)]">监控中 (13)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                        <span className="text-[var(--console-text-muted)]">无房 (5)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                        <span className="text-[var(--console-text-muted)]">异常 (3)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                                        <span className="text-[var(--console-text-muted)]">已暂停 (2)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="console-card border-[var(--console-border)]">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-[var(--console-text)]">
                            检查趋势 (24h)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Placeholder for line chart */}
                        <div className="h-48 flex items-center justify-center">
                            <div className="text-center space-y-2">
                                <div className="flex items-center justify-center gap-6 text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-0.5 bg-green-500"></div>
                                        <span className="text-[var(--console-text-muted)]">有房发现</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-0.5 bg-blue-500"></div>
                                        <span className="text-[var(--console-text-muted)]">检查次数</span>
                                    </div>
                                </div>
                                <p className="text-xs text-[var(--console-text-muted)]">
                                    图表功能开发中...
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Alerts */}
            <Card className="console-card border-[var(--console-border)]">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-[var(--console-text)]">
                        异常与告警
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                    <AlertItem
                        icon={AlertTriangle}
                        message="自动订房执行失败：库存已被抢完"
                        time="55分钟前"
                        color="text-yellow-500"
                    />
                    <AlertItem
                        icon={AlertTriangle}
                        message="坐忘林刷房失败：连续3次请求超时"
                        time="1小时前"
                        color="text-red-500"
                    />
                    <AlertItem
                        icon={AlertTriangle}
                        message="FUFU 河口湖价格异常波动 (+25%)"
                        time="2小时前"
                        color="text-yellow-500"
                    />
                </CardContent>
            </Card>
        </div>
    );
}
