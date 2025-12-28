'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    MapPin,
    Calendar,
    Wallet,
    Users,
    BarChart3,
    Settings,
    Search,
    Bell,
    Terminal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const navItems = [
    { href: '/destinations', label: '目的地', icon: MapPin },
    { href: '/calendar', label: '日历', icon: Calendar },
    { href: '/budget', label: '预算匹配', icon: Wallet },
    { href: '/inquiries', label: '客户需求', icon: Users },
    { href: '/channel', label: '渠道分析', icon: BarChart3 },
    { href: '/console', label: '控制台', icon: Terminal },
];

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-background">
            {/* Top Navigation */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex h-14 items-center px-4 gap-4">
                    {/* Logo */}
                    <Link href="/destinations" className="flex items-center gap-2 font-semibold">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                            <span className="text-primary-foreground text-sm font-bold">L</span>
                        </div>
                        <span className="hidden md:inline-block">Luxury Ops</span>
                    </Link>

                    {/* Main Navigation */}
                    <nav className="flex items-center gap-1 ml-4">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname?.startsWith(item.href);
                            const isConsole = item.href === '/console';

                            return (
                                <Link key={item.href} href={item.href}>
                                    <Button
                                        variant={isActive ? "secondary" : "ghost"}
                                        size="sm"
                                        className={cn(
                                            "gap-2",
                                            isConsole && "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        <Icon className="h-4 w-4" />
                                        <span className="hidden lg:inline-block">{item.label}</span>
                                    </Button>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Right Side */}
                    <div className="ml-auto flex items-center gap-2">
                        {/* Search */}
                        <div className="relative hidden md:block">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="搜索酒店..."
                                className="w-[200px] lg:w-[280px] pl-8 h-9"
                            />
                        </div>

                        {/* Notifications */}
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="h-4 w-4" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                        </Button>

                        {/* Settings */}
                        <Link href="/settings">
                            <Button variant="ghost" size="icon">
                                <Settings className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1">
                {children}
            </main>
        </div>
    );
}
