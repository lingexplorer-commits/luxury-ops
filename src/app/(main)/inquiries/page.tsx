'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import {
    Users,
    Plus,
    LayoutGrid,
    List,
    Search,
    Filter,
    MoreHorizontal,
    Calendar,
    MapPin,
    Wallet
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { mockInquiries, activeStages, inquiryStages } from '@/lib/mock-data/inquiries';
import { InquiryStage, Inquiry } from '@/lib/types';
import { NewInquiryDialog } from '@/components/dialogs';

type ViewMode = 'kanban' | 'table';

const stageColors: Record<string, string> = {
    '需求确认': 'bg-gray-100 text-gray-700',
    '方案推荐': 'bg-blue-100 text-blue-700',
    '等待反馈': 'bg-yellow-100 text-yellow-700',
    '确认预订': 'bg-purple-100 text-purple-700',
    '订房中': 'bg-green-100 text-green-700',
    '已完成': 'bg-green-200 text-green-800',
    '已流失': 'bg-red-100 text-red-700',
    '已取消': 'bg-gray-200 text-gray-600',
};

const priorityColors: Record<string, string> = {
    'VIP': 'bg-amber-500 text-white',
    '紧急': 'bg-red-500 text-white',
    '普通': 'bg-gray-200 text-gray-700',
};

function InquiryCard({ inquiry }: { inquiry: Inquiry }) {
    const formatPrice = (price: number) => `¥${(price / 1000).toFixed(0)}K`;

    return (
        <Card className={cn(
            "hover:shadow-md transition-shadow cursor-pointer",
            inquiry.priority === 'VIP' && "ring-2 ring-amber-400",
            inquiry.priority === '紧急' && "ring-2 ring-red-400"
        )}>
            <CardContent className="pt-4 space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-semibold">{inquiry.customer_name}</span>
                            <Badge className={priorityColors[inquiry.priority]}>
                                {inquiry.priority}
                            </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">{inquiry.customer_contact}</div>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem>查看详情</DropdownMenuItem>
                            <DropdownMenuItem>添加推荐</DropdownMenuItem>
                            <DropdownMenuItem>更改状态</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Info */}
                <div className="space-y-1.5 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{inquiry.destinations.join(' · ')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>
                            {format(new Date(inquiry.travel_dates.from), 'M/d')} - {format(new Date(inquiry.travel_dates.to), 'M/d')}
                            <span className="ml-1">({inquiry.travel_dates.nights}晚)</span>
                            {inquiry.travel_dates.flexible && <span className="ml-1 text-blue-600">可调</span>}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Wallet className="h-3.5 w-3.5" />
                        <span>
                            {formatPrice(inquiry.budget_per_night.min)} - {formatPrice(inquiry.budget_per_night.max)}/晚
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-3.5 w-3.5" />
                        <span>
                            {inquiry.travelers.adults}成人
                            {inquiry.travelers.children > 0 && ` + ${inquiry.travelers.children}儿童`}
                        </span>
                    </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                    {inquiry.customer_tags.slice(0, 3).map((tag, i) => (
                        <Badge key={i} variant="outline" className="text-[10px] px-1.5">
                            {tag}
                        </Badge>
                    ))}
                </div>

                {/* Recommendations */}
                {inquiry.recommended_hotels.length > 0 && (
                    <div className="text-xs text-muted-foreground pt-1 border-t">
                        已推荐 {inquiry.recommended_hotels.length} 家酒店
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                    <span>负责: {inquiry.assigned_to}</span>
                    <span>{inquiry.source}</span>
                </div>
            </CardContent>
        </Card>
    );
}

export default function InquiriesPage() {
    const [viewMode, setViewMode] = useState<ViewMode>('kanban');
    const [searchQuery, setSearchQuery] = useState('');
    const [stageFilter, setStageFilter] = useState<string>('all');

    // Filter inquiries
    const filteredInquiries = useMemo(() => {
        return mockInquiries.filter(inq => {
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                if (!inq.customer_name.toLowerCase().includes(query) &&
                    !inq.destinations.some(d => d.toLowerCase().includes(query))) {
                    return false;
                }
            }
            if (stageFilter !== 'all' && inq.stage !== stageFilter) {
                return false;
            }
            return true;
        });
    }, [searchQuery, stageFilter]);

    // Group by stage for Kanban
    const groupedByStage = useMemo(() => {
        const groups: Record<string, Inquiry[]> = {};
        activeStages.forEach(stage => {
            groups[stage] = filteredInquiries.filter(inq => inq.stage === stage);
        });
        return groups;
    }, [filteredInquiries]);

    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Users className="h-6 w-6" />
                    <h1 className="text-2xl font-bold">👥 客户需求</h1>
                </div>
                <NewInquiryDialog />
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-1">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="搜索客户或目的地..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    <Select value={stageFilter} onValueChange={setStageFilter}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="状态筛选" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">全部状态</SelectItem>
                            {inquiryStages.map(stage => (
                                <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-1 border rounded-md p-1">
                    <Button
                        variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('kanban')}
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('table')}
                    >
                        <List className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Kanban View */}
            {viewMode === 'kanban' && (
                <div className="grid grid-cols-5 gap-4">
                    {activeStages.map(stage => (
                        <div key={stage} className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Badge className={stageColors[stage]}>
                                    {stage}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                    {groupedByStage[stage]?.length || 0}
                                </span>
                            </div>
                            <div className="space-y-3 min-h-[200px]">
                                {groupedByStage[stage]?.map(inquiry => (
                                    <Link key={inquiry.inquiry_id} href={`/inquiries/${inquiry.inquiry_id}`}>
                                        <InquiryCard inquiry={inquiry} />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Table View */}
            {viewMode === 'table' && (
                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>客户</TableHead>
                                <TableHead>目的地</TableHead>
                                <TableHead>日期</TableHead>
                                <TableHead>预算</TableHead>
                                <TableHead>人数</TableHead>
                                <TableHead>状态</TableHead>
                                <TableHead>优先级</TableHead>
                                <TableHead>负责人</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredInquiries.map(inquiry => (
                                <TableRow key={inquiry.inquiry_id}>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{inquiry.customer_name}</div>
                                            <div className="text-sm text-muted-foreground">{inquiry.customer_contact}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{inquiry.destinations.join(' · ')}</TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            {format(new Date(inquiry.travel_dates.from), 'M/d')} - {format(new Date(inquiry.travel_dates.to), 'M/d')}
                                        </div>
                                        <div className="text-xs text-muted-foreground">{inquiry.travel_dates.nights}晚</div>
                                    </TableCell>
                                    <TableCell>
                                        ¥{(inquiry.budget_per_night.min / 1000).toFixed(0)}K-{(inquiry.budget_per_night.max / 1000).toFixed(0)}K
                                    </TableCell>
                                    <TableCell>
                                        {inquiry.travelers.adults}大{inquiry.travelers.children > 0 ? `${inquiry.travelers.children}小` : ''}
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={stageColors[inquiry.stage]}>{inquiry.stage}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={priorityColors[inquiry.priority]}>{inquiry.priority}</Badge>
                                    </TableCell>
                                    <TableCell>{inquiry.assigned_to}</TableCell>
                                    <TableCell>
                                        <Link href={`/inquiries/${inquiry.inquiry_id}`}>
                                            <Button variant="ghost" size="sm">查看</Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            )}

            {filteredInquiries.length === 0 && (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        没有找到匹配的需求记录
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
