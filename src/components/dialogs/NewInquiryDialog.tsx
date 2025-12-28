'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Plus, Calendar, MapPin, Users, Wallet, Heart, X } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const destinationOptions = ['东京', '京都', '大阪', '北海道', '富士山', '冲绳', '箱根', '轻井泽'];
const styleOptions = ['日式传统', '现代设计', '温泉', '隐私', '亲子友好', '蜜月', '商务', '自然'];
const sourceOptions = ['微信', '电话', '邮件', '转介绍', '网站', '其他'];
const priorityOptions = [
    { value: 'VIP', label: 'VIP' },
    { value: '紧急', label: '紧急' },
    { value: '普通', label: '普通' },
];

interface NewInquiryDialogProps {
    trigger?: React.ReactNode;
    onSubmit?: (data: any) => void;
}

export function NewInquiryDialog({ trigger, onSubmit }: NewInquiryDialogProps) {
    const [open, setOpen] = useState(false);
    const [selectedDestinations, setSelectedDestinations] = useState<string[]>([]);
    const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        customerName: '',
        customerContact: '',
        customerWechat: '',
        dateFrom: '',
        dateTo: '',
        adults: 2,
        children: 0,
        budgetMin: 50000,
        budgetMax: 100000,
        mustHave: '',
        avoid: '',
        specialRequests: '',
        priority: '普通',
        source: '微信',
    });

    const toggleDestination = (dest: string) => {
        setSelectedDestinations(prev =>
            prev.includes(dest)
                ? prev.filter(d => d !== dest)
                : [...prev, dest]
        );
    };

    const toggleStyle = (style: string) => {
        setSelectedStyles(prev =>
            prev.includes(style)
                ? prev.filter(s => s !== style)
                : [...prev, style]
        );
    };

    const handleSubmit = () => {
        const inquiry = {
            ...formData,
            destinations: selectedDestinations,
            styles: selectedStyles,
        };
        console.log('New inquiry:', inquiry);
        onSubmit?.(inquiry);
        setOpen(false);
        // Reset form
        setSelectedDestinations([]);
        setSelectedStyles([]);
        setFormData({
            customerName: '',
            customerContact: '',
            customerWechat: '',
            dateFrom: '',
            dateTo: '',
            adults: 2,
            children: 0,
            budgetMin: 50000,
            budgetMax: 100000,
            mustHave: '',
            avoid: '',
            specialRequests: '',
            priority: '普通',
            source: '微信',
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        新建需求
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>新建客户需求</DialogTitle>
                    <DialogDescription>填写客户旅行需求信息</DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Customer Info */}
                    <div className="space-y-4">
                        <h4 className="font-medium flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            客户信息
                        </h4>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>客户姓名 *</Label>
                                <Input
                                    placeholder="张先生"
                                    value={formData.customerName}
                                    onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>联系电话</Label>
                                <Input
                                    placeholder="138****5678"
                                    value={formData.customerContact}
                                    onChange={e => setFormData({ ...formData, customerContact: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>微信号</Label>
                                <Input
                                    placeholder="wechat_id"
                                    value={formData.customerWechat}
                                    onChange={e => setFormData({ ...formData, customerWechat: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Travel Info */}
                    <div className="space-y-4">
                        <h4 className="font-medium flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            旅行信息
                        </h4>

                        {/* Destinations */}
                        <div className="space-y-2">
                            <Label>目的地 *</Label>
                            <div className="flex flex-wrap gap-2">
                                {destinationOptions.map(dest => (
                                    <Badge
                                        key={dest}
                                        variant={selectedDestinations.includes(dest) ? 'default' : 'outline'}
                                        className="cursor-pointer"
                                        onClick={() => toggleDestination(dest)}
                                    >
                                        {dest}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>入住日期 *</Label>
                                <Input
                                    type="date"
                                    value={formData.dateFrom}
                                    onChange={e => setFormData({ ...formData, dateFrom: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>退房日期 *</Label>
                                <Input
                                    type="date"
                                    value={formData.dateTo}
                                    onChange={e => setFormData({ ...formData, dateTo: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Travelers */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>成人人数</Label>
                                <Select
                                    value={formData.adults.toString()}
                                    onValueChange={v => setFormData({ ...formData, adults: parseInt(v) })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[1, 2, 3, 4, 5, 6].map(n => (
                                            <SelectItem key={n} value={n.toString()}>{n}人</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>儿童人数</Label>
                                <Select
                                    value={formData.children.toString()}
                                    onValueChange={v => setFormData({ ...formData, children: parseInt(v) })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[0, 1, 2, 3, 4].map(n => (
                                            <SelectItem key={n} value={n.toString()}>{n}人</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Budget */}
                    <div className="space-y-4">
                        <h4 className="font-medium flex items-center gap-2">
                            <Wallet className="h-4 w-4" />
                            预算 (日元/晚)
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>最低预算</Label>
                                <Input
                                    type="number"
                                    value={formData.budgetMin}
                                    onChange={e => setFormData({ ...formData, budgetMin: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>最高预算</Label>
                                <Input
                                    type="number"
                                    value={formData.budgetMax}
                                    onChange={e => setFormData({ ...formData, budgetMax: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Preferences */}
                    <div className="space-y-4">
                        <h4 className="font-medium flex items-center gap-2">
                            <Heart className="h-4 w-4" />
                            偏好
                        </h4>

                        {/* Styles */}
                        <div className="space-y-2">
                            <Label>风格偏好</Label>
                            <div className="flex flex-wrap gap-2">
                                {styleOptions.map(style => (
                                    <Badge
                                        key={style}
                                        variant={selectedStyles.includes(style) ? 'default' : 'outline'}
                                        className="cursor-pointer"
                                        onClick={() => toggleStyle(style)}
                                    >
                                        {style}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>必须要有</Label>
                                <Textarea
                                    placeholder="私汤、怀石料理..."
                                    value={formData.mustHave}
                                    onChange={e => setFormData({ ...formData, mustHave: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>要避免</Label>
                                <Textarea
                                    placeholder="商务酒店、太吵..."
                                    value={formData.avoid}
                                    onChange={e => setFormData({ ...formData, avoid: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>特殊要求</Label>
                            <Textarea
                                placeholder="蜜月旅行，希望有惊喜布置..."
                                value={formData.specialRequests}
                                onChange={e => setFormData({ ...formData, specialRequests: e.target.value })}
                            />
                        </div>
                    </div>

                    <Separator />

                    {/* Meta */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>优先级</Label>
                            <Select
                                value={formData.priority}
                                onValueChange={v => setFormData({ ...formData, priority: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {priorityOptions.map(opt => (
                                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>来源</Label>
                            <Select
                                value={formData.source}
                                onValueChange={v => setFormData({ ...formData, source: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {sourceOptions.map(src => (
                                        <SelectItem key={src} value={src}>{src}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>取消</Button>
                    <Button onClick={handleSubmit}>创建需求</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
