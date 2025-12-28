'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Activity,
    Bot,
    ScrollText,
    Settings,
    ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const sidebarItems = [
    { href: '/console', label: '总览', icon: LayoutDashboard, exact: true },
    { href: '/console/monitoring', label: '刷房监控', icon: Activity },
    { href: '/console/auto-booking', label: '自动订房', icon: Bot },
    { href: '/console/logs', label: '日志', icon: ScrollText },
];

export default function ConsoleLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <div className="min-h-screen console-theme">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b border-[var(--console-border)] bg-[var(--console-bg)]">
                <div className="flex h-14 items-center px-4 gap-4">
                    <Link href="/destinations">
                        <Button variant="ghost" size="sm" className="text-[var(--console-text-muted)] hover:text-[var(--console-text)]">
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            返回主界面
                        </Button>
                    </Link>
                    <div className="flex items-center gap-2 font-semibold text-[var(--console-text)]">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                            <span className="text-white text-sm font-bold">⚙</span>
                        </div>
                        <span>Luxury Ops Console</span>
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Sidebar */}
                <aside className="w-56 min-h-[calc(100vh-56px)] border-r border-[var(--console-border)] bg-[var(--console-card)]">
                    <nav className="p-4 space-y-1">
                        {sidebarItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = item.exact
                                ? pathname === item.href
                                : pathname?.startsWith(item.href);

                            return (
                                <Link key={item.href} href={item.href}>
                                    <div
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                                            isActive
                                                ? "bg-blue-600/20 text-blue-400"
                                                : "text-[var(--console-text-muted)] hover:text-[var(--console-text)] hover:bg-[var(--console-border)]"
                                        )}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {item.label}
                                    </div>
                                </Link>
                            );
                        })}

                        <div className="pt-4 border-t border-[var(--console-border)] mt-4">
                            <Link href="/settings">
                                <div className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-[var(--console-text-muted)] hover:text-[var(--console-text)] hover:bg-[var(--console-border)]">
                                    <Settings className="h-4 w-4" />
                                    设置
                                </div>
                            </Link>
                        </div>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
