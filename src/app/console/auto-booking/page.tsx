'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

// Mock rules
const mockRules = [
    {
        id: '1',
        name: 'FUFU河口湖 自动抢房',
        hotel: 'FUFU 河口湖',
        roomTypes: ['富士景观房', '标准双床房'],
        dates: '3/20-4/30',
        triggerType: '有房即订',
        actionMode: '自动下单',
        enabled: true,
        triggerCount: 3,
        lastTriggered: '2天前',
    },
    {
        id: '2',
        name: '虹夕诺雅京都 低价提醒',
        hotel: '虹夕诺雅 京都',
        roomTypes: null,
        dates: '4/1-4/15',
        triggerType: '价格低于 ¥100,000',
        actionMode: '仅通知',
        enabled: true,
        triggerCount: 1,
        lastTriggered: '5天前',
    },
    {
        id: '3',
        name: '安缦京都 草稿订单',
        hotel: '安缦京都',
        roomTypes: ['套房'],
        dates: '5/1-5/5',
        triggerType: '有房即订',
        actionMode: '生成草稿',
        enabled: false,
        triggerCount: 0,
        lastTriggered: null,
    },
];

// Mock execution records
const mockRecords = [
    {
        id: '1',
        ruleName: 'FUFU河口湖 自动抢房',
        hotel: 'FUFU 河口湖',
        date: '3/22',
        status: 'success',
        action: '已自动下单',
        price: '¥72,000',
        time: '2天前 14:32',
    },
    {
        id: '2',
        ruleName: 'FUFU河口湖 自动抢房',
        hotel: 'FUFU 河口湖',
        date: '3/21',
        status: 'failed',
        action: '下单失败：库存已被抢完',
        price: '¥72,000',
        time: '3天前 09:15',
    },
    {
        id: '3',
        ruleName: '虹夕诺雅京都 低价提醒',
        hotel: '虹夕诺雅 京都',
        date: '4/5',
        status: 'notified',
        action: '已发送通知',
        price: '¥95,000',
        time: '5天前 16:45',
    },
];

export default function AutoBookingPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--console-text)]">自动订房</h1>
                    <p className="text-[var(--console-text-muted)] text-sm">配置自动订房规则与执行记录</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    新建规则
                </Button>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="rules">
                <TabsList className="bg-[var(--console-card)] border border-[var(--console-border)]">
                    <TabsTrigger
                        value="rules"
                        className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                    >
                        规则管理
                    </TabsTrigger>
                    <TabsTrigger
                        value="records"
                        className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                    >
                        执行记录
                    </TabsTrigger>
                </TabsList>

                {/* Rules Tab */}
                <TabsContent value="rules" className="mt-6 space-y-4">
                    {mockRules.map((rule) => (
                        <Card key={rule.id} className="console-card border-[var(--console-border)]">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg text-[var(--console-text)]">
                                        {rule.name}
                                    </CardTitle>
                                    <Switch checked={rule.enabled} />
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <span className="text-[var(--console-text-muted)]">酒店:</span>
                                        <span className="ml-2 text-[var(--console-text)]">{rule.hotel}</span>
                                    </div>
                                    <div>
                                        <span className="text-[var(--console-text-muted)]">房型:</span>
                                        <span className="ml-2 text-[var(--console-text)]">
                                            {rule.roomTypes ? rule.roomTypes.join(', ') : '全部'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-[var(--console-text-muted)]">日期:</span>
                                        <span className="ml-2 text-[var(--console-text)]">{rule.dates}</span>
                                    </div>
                                    <div>
                                        <span className="text-[var(--console-text-muted)]">触发:</span>
                                        <span className="ml-2 text-[var(--console-text)]">{rule.triggerType}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-[var(--console-border)]">
                                    <div className="flex items-center gap-4 text-sm">
                                        <Badge
                                            variant="outline"
                                            className={`border-0 ${rule.actionMode === '自动下单'
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : rule.actionMode === '生成草稿'
                                                        ? 'bg-blue-500/20 text-blue-400'
                                                        : 'bg-yellow-500/20 text-yellow-400'
                                                }`}
                                        >
                                            {rule.actionMode}
                                        </Badge>
                                        <span className="text-[var(--console-text-muted)]">
                                            触发 {rule.triggerCount} 次
                                        </span>
                                        {rule.lastTriggered && (
                                            <span className="text-[var(--console-text-muted)]">
                                                上次: {rule.lastTriggered}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-[var(--console-text-muted)] hover:text-[var(--console-text)]"
                                        >
                                            编辑
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-[var(--console-text-muted)] hover:text-red-400"
                                        >
                                            删除
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>

                {/* Records Tab */}
                <TabsContent value="records" className="mt-6 space-y-3">
                    {mockRecords.map((record) => (
                        <div
                            key={record.id}
                            className="console-card rounded-lg border border-[var(--console-border)] p-4"
                        >
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-[var(--console-text)]">
                                            {record.ruleName}
                                        </span>
                                        <Badge
                                            variant="outline"
                                            className={`border-0 ${record.status === 'success'
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : record.status === 'failed'
                                                        ? 'bg-red-500/20 text-red-400'
                                                        : 'bg-blue-500/20 text-blue-400'
                                                }`}
                                        >
                                            {record.status === 'success' ? '成功' : record.status === 'failed' ? '失败' : '已通知'}
                                        </Badge>
                                    </div>
                                    <div className="text-sm text-[var(--console-text-muted)]">
                                        {record.hotel} · {record.date} · {record.price}
                                    </div>
                                    <div className="text-sm text-[var(--console-text-muted)]">
                                        {record.action}
                                    </div>
                                </div>
                                <div className="text-sm text-[var(--console-text-muted)]">
                                    {record.time}
                                </div>
                            </div>
                        </div>
                    ))}
                </TabsContent>
            </Tabs>
        </div>
    );
}
