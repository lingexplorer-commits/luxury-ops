'use client';

import { useState } from 'react';
import { Plus, Hotel, Calendar, RefreshCcw, Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { hotels } from '@/lib/mock-data/hotels';

const dataSourceOptions = [
    { value: 'ikyu', label: '一休 (Ikyu)' },
    { value: 'jalan', label: 'Jalan' },
    { value: 'rakuten', label: '乐天 (Rakuten)' },
    { value: 'official', label: '官网' },
];

const checkIntervalOptions = [
    { value: '15', label: '15分钟' },
    { value: '30', label: '30分钟' },
    { value: '60', label: '1小时' },
    { value: '120', label: '2小时' },
];

interface NewMonitoringDialogProps {
    trigger?: React.ReactNode;
    onSubmit?: (data: any) => void;
}

export function NewMonitoringDialog({ trigger, onSubmit }: NewMonitoringDialogProps) {
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        hotelId: '',
        roomType: 'all',
        dateFrom: '',
        dateTo: '',
        dataSource: 'ikyu',
        checkInterval: '30',
        notifyOnAvailable: true,
        notifyOnPriceChange: true,
        priceChangeThreshold: 10,
        autoBook: false,
        maxPrice: '',
    });

    const selectedHotel = hotels.find(h => h.hotel_id === formData.hotelId);

    const handleSubmit = () => {
        console.log('New monitoring task:', formData);
        onSubmit?.(formData);
        setOpen(false);
        // Reset form
        setFormData({
            hotelId: '',
            roomType: 'all',
            dateFrom: '',
            dateTo: '',
            dataSource: 'ikyu',
            checkInterval: '30',
            notifyOnAvailable: true,
            notifyOnPriceChange: true,
            priceChangeThreshold: 10,
            autoBook: false,
            maxPrice: '',
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-2" />
                        新建监控
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>新建刷房监控</DialogTitle>
                    <DialogDescription>配置房态监控任务</DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Hotel Selection */}
                    <div className="space-y-4">
                        <h4 className="font-medium flex items-center gap-2">
                            <Hotel className="h-4 w-4" />
                            酒店选择
                        </h4>
                        <div className="space-y-2">
                            <Label>酒店 *</Label>
                            <Select
                                value={formData.hotelId}
                                onValueChange={v => setFormData({ ...formData, hotelId: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="选择酒店" />
                                </SelectTrigger>
                                <SelectContent>
                                    {hotels.map(hotel => (
                                        <SelectItem key={hotel.hotel_id} value={hotel.hotel_id}>
                                            {hotel.name_cn}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>房型</Label>
                            <Select
                                value={formData.roomType}
                                onValueChange={v => setFormData({ ...formData, roomType: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">全部房型</SelectItem>
                                    <SelectItem value="standard">标准房</SelectItem>
                                    <SelectItem value="deluxe">豪华房</SelectItem>
                                    <SelectItem value="suite">套房</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Separator />

                    {/* Date Range */}
                    <div className="space-y-4">
                        <h4 className="font-medium flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            监控日期
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>开始日期 *</Label>
                                <Input
                                    type="date"
                                    value={formData.dateFrom}
                                    onChange={e => setFormData({ ...formData, dateFrom: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>结束日期 *</Label>
                                <Input
                                    type="date"
                                    value={formData.dateTo}
                                    onChange={e => setFormData({ ...formData, dateTo: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Monitoring Settings */}
                    <div className="space-y-4">
                        <h4 className="font-medium flex items-center gap-2">
                            <RefreshCcw className="h-4 w-4" />
                            监控设置
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>数据源</Label>
                                <Select
                                    value={formData.dataSource}
                                    onValueChange={v => setFormData({ ...formData, dataSource: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {dataSourceOptions.map(opt => (
                                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>检查间隔</Label>
                                <Select
                                    value={formData.checkInterval}
                                    onValueChange={v => setFormData({ ...formData, checkInterval: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {checkIntervalOptions.map(opt => (
                                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Notifications */}
                    <div className="space-y-4">
                        <h4 className="font-medium flex items-center gap-2">
                            <Bell className="h-4 w-4" />
                            通知设置
                        </h4>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-medium text-sm">有房通知</div>
                                    <div className="text-xs text-muted-foreground">检测到有房时发送通知</div>
                                </div>
                                <Switch
                                    checked={formData.notifyOnAvailable}
                                    onCheckedChange={v => setFormData({ ...formData, notifyOnAvailable: v })}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-medium text-sm">价格变动通知</div>
                                    <div className="text-xs text-muted-foreground">价格波动超过阈值时通知</div>
                                </div>
                                <Switch
                                    checked={formData.notifyOnPriceChange}
                                    onCheckedChange={v => setFormData({ ...formData, notifyOnPriceChange: v })}
                                />
                            </div>
                            {formData.notifyOnPriceChange && (
                                <div className="space-y-2 pl-4">
                                    <Label>价格变动阈值 (%)</Label>
                                    <Input
                                        type="number"
                                        value={formData.priceChangeThreshold}
                                        onChange={e => setFormData({ ...formData, priceChangeThreshold: parseInt(e.target.value) })}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* Auto Book */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-medium">自动订房</div>
                                <div className="text-sm text-muted-foreground">有房时自动下单（需配置订房规则）</div>
                            </div>
                            <Switch
                                checked={formData.autoBook}
                                onCheckedChange={v => setFormData({ ...formData, autoBook: v })}
                            />
                        </div>
                        {formData.autoBook && (
                            <div className="space-y-2 pl-4">
                                <Label>最高价格限制 (日元)</Label>
                                <Input
                                    type="number"
                                    placeholder="不限制"
                                    value={formData.maxPrice}
                                    onChange={e => setFormData({ ...formData, maxPrice: e.target.value })}
                                />
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>取消</Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!formData.hotelId || !formData.dateFrom || !formData.dateTo}
                    >
                        创建监控
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
