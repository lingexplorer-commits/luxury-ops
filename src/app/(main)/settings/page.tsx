'use client';

import { useState } from 'react';
import { Settings as SettingsIcon, User, Bell, Palette, Database, Key, DollarSign, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { currencies, exchangeRateLastUpdate, MARKUP_PRESETS } from '@/lib/currency';
import { toast } from 'sonner';

export default function SettingsPage() {
    // Exchange rates state (editable)
    const [rates, setRates] = useState({
        JPY: currencies.JPY.rate_to_cny,
        USD: currencies.USD.rate_to_cny,
        EUR: currencies.EUR.rate_to_cny,
        HKD: currencies.HKD.rate_to_cny,
        THB: currencies.THB.rate_to_cny,
    });

    // Default markup settings
    const [defaultMarkup, setDefaultMarkup] = useState(15);

    const handleSave = () => {
        toast.success('设置已保存');
    };

    return (
        <div className="container mx-auto py-6 max-w-4xl space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <SettingsIcon className="h-6 w-6" />
                <h1 className="text-2xl font-bold">⚙️ 设置</h1>
            </div>

            {/* Currency & Exchange Rate Settings - NEW */}
            <Card className="border-amber-200">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        <CardTitle>💱 货币与汇率</CardTitle>
                    </div>
                    <CardDescription>
                        所有报价以人民币 (CNY) 为最终计价标准
                        <Badge variant="outline" className="ml-2">
                            最后更新: {exchangeRateLastUpdate}
                        </Badge>
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                🇯🇵 日元 (JPY)
                            </Label>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">1 JPY =</span>
                                <Input
                                    type="number"
                                    step="0.001"
                                    value={rates.JPY}
                                    onChange={(e) => setRates({ ...rates, JPY: parseFloat(e.target.value) || 0 })}
                                    className="w-24"
                                />
                                <span className="text-sm">CNY</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                🇺🇸 美元 (USD)
                            </Label>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">1 USD =</span>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={rates.USD}
                                    onChange={(e) => setRates({ ...rates, USD: parseFloat(e.target.value) || 0 })}
                                    className="w-24"
                                />
                                <span className="text-sm">CNY</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                🇪🇺 欧元 (EUR)
                            </Label>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">1 EUR =</span>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={rates.EUR}
                                    onChange={(e) => setRates({ ...rates, EUR: parseFloat(e.target.value) || 0 })}
                                    className="w-24"
                                />
                                <span className="text-sm">CNY</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                🇭🇰 港币 (HKD)
                            </Label>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">1 HKD =</span>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={rates.HKD}
                                    onChange={(e) => setRates({ ...rates, HKD: parseFloat(e.target.value) || 0 })}
                                    className="w-24"
                                />
                                <span className="text-sm">CNY</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                🇹🇭 泰铢 (THB)
                            </Label>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">1 THB =</span>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={rates.THB}
                                    onChange={(e) => setRates({ ...rates, THB: parseFloat(e.target.value) || 0 })}
                                    className="w-24"
                                />
                                <span className="text-sm">CNY</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                        💡 汇率用于将原币种价格转换为人民币，建议每日更新
                    </div>
                </CardContent>
            </Card>

            {/* Markup Settings - NEW */}
            <Card className="border-green-200">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Percent className="h-5 w-5" />
                        <CardTitle>📈 加价设置</CardTitle>
                    </div>
                    <CardDescription>配置报价时的默认加价参数</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium">默认加价率</div>
                            <div className="text-sm text-muted-foreground">新建报价时的默认加价比例</div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                value={defaultMarkup}
                                onChange={(e) => setDefaultMarkup(parseInt(e.target.value) || 0)}
                                className="w-20"
                            />
                            <span>%</span>
                        </div>
                    </div>
                    <Separator />
                    <div>
                        <div className="font-medium mb-2">快捷加价按钮</div>
                        <div className="flex flex-wrap gap-2">
                            {MARKUP_PRESETS.map((preset) => (
                                <Badge key={preset.value} variant="outline">
                                    {preset.label}
                                </Badge>
                            ))}
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                            这些预设按钮会显示在报价页面，可快速切换加价率
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* User Settings */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        <CardTitle>用户信息</CardTitle>
                    </div>
                    <CardDescription>管理您的账户信息</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>用户名</Label>
                            <Input value="小王" disabled />
                        </div>
                        <div className="space-y-2">
                            <Label>角色</Label>
                            <Input value="销售顾问" disabled />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>邮箱</Label>
                        <Input type="email" placeholder="your@email.com" />
                    </div>
                </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        <CardTitle>通知设置</CardTitle>
                    </div>
                    <CardDescription>配置系统通知方式</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium">有房通知</div>
                            <div className="text-sm text-muted-foreground">监控到有房时发送通知</div>
                        </div>
                        <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium">价格变动通知</div>
                            <div className="text-sm text-muted-foreground">价格波动超过10%时通知</div>
                        </div>
                        <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium">自动订房通知</div>
                            <div className="text-sm text-muted-foreground">自动订房执行后发送通知</div>
                        </div>
                        <Switch defaultChecked />
                    </div>
                </CardContent>
            </Card>

            {/* Display Settings */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Palette className="h-5 w-5" />
                        <CardTitle>显示设置</CardTitle>
                    </div>
                    <CardDescription>自定义界面显示</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium">默认首页</div>
                            <div className="text-sm text-muted-foreground">登录后默认显示的页面</div>
                        </div>
                        <Select defaultValue="destinations">
                            <SelectTrigger className="w-[180px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="destinations">目的地视图</SelectItem>
                                <SelectItem value="calendar">日历视图</SelectItem>
                                <SelectItem value="inquiries">客户需求</SelectItem>
                                <SelectItem value="console">控制台</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium">默认显示原币种</div>
                            <div className="text-sm text-muted-foreground">报价页是否默认显示原币种价格</div>
                        </div>
                        <Switch />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium">价格显示格式</div>
                            <div className="text-sm text-muted-foreground">价格数字格式</div>
                        </div>
                        <Select defaultValue="k">
                            <SelectTrigger className="w-[180px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="full">完整 (¥72,000)</SelectItem>
                                <SelectItem value="k">简写 (¥72K)</SelectItem>
                                <SelectItem value="w">万元 (¥7.2万)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Data Settings */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Database className="h-5 w-5" />
                        <CardTitle>数据设置</CardTitle>
                    </div>
                    <CardDescription>管理数据同步和缓存</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium">价格自动同步</div>
                            <div className="text-sm text-muted-foreground">自动从渠道同步最新价格</div>
                        </div>
                        <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium">同步频率</div>
                            <div className="text-sm text-muted-foreground">价格数据更新间隔</div>
                        </div>
                        <Select defaultValue="6h">
                            <SelectTrigger className="w-[180px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1h">每小时</SelectItem>
                                <SelectItem value="6h">每6小时</SelectItem>
                                <SelectItem value="12h">每12小时</SelectItem>
                                <SelectItem value="24h">每天</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* API Settings */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Key className="h-5 w-5" />
                        <CardTitle>API 密钥</CardTitle>
                    </div>
                    <CardDescription>管理渠道 API 连接</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>一休 B2B API Key</Label>
                        <Input type="password" value="••••••••••••••••" disabled />
                    </div>
                    <div className="space-y-2">
                        <Label>Jalan B2B API Key</Label>
                        <Input type="password" value="••••••••••••••••" disabled />
                    </div>
                    <div className="text-sm text-muted-foreground">
                        API 密钥由管理员配置，如需修改请联系技术支持
                    </div>
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end gap-4">
                <Button variant="outline">取消</Button>
                <Button onClick={handleSave}>保存设置</Button>
            </div>
        </div>
    );
}
