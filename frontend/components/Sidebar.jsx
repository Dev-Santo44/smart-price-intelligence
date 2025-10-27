"use client";

import Link from "next/link";
import { useState } from "react";
import {
    LayoutDashboard,
    BarChart2,
    Bell,
    Settings,
    Database,
    Users,
    Cpu,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const { role } = useAuth();

    const commonLinks = [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/alerts", label: "Alerts", icon: Bell },
    ];

    const roleBasedLinks = {
        admin: [
            { href: "/dashboard/admin", label: "Admin", icon: Users },
            { href: "/dashboard/admin/system", label: "System ", icon: Cpu },
            { href: "/settings", label: "Settings", icon: Settings },
        ],
        analyst: [
            { href: "/dashboard/analyst", label: "Pricing Analytics", icon: BarChart2 },
            { href: "/dashboard/analyst/recommendations", label: "Recommendations", icon: Cpu },
        ],
        executive: [
            { href: "/dashboard/executive", label: "Strategic Insights", icon: BarChart2 },
            { href: "/reports", label: "Reports", icon: Database },
        ],
        engineer: [
            { href: "/dashboard/data-engineer", label: "ETL Pipelines", icon: Database },
            { href: "/dashboard/data-engineer/quality", label: "Data Quality", icon: Cpu },
        ],
    };

    const allLinks = [...commonLinks, ...(roleBasedLinks[role] || [])];

    return (
        <aside
            className={`${collapsed ? "w-20" : "w-64"
                } bg-white dark:bg-gray-900 h-screen border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300`}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                <span className={`text-lg font-semibold ${collapsed ? "hidden" : "block"}`}>
                    Menu
                </span>
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                    {collapsed ? <ChevronRight /> : <ChevronLeft />}
                </button>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-2">
                {allLinks.map(({ href, label, icon: Icon }) => (
                    <Link
                        key={href}
                        href={href}
                        className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-lg transition-all"
                    >
                        <Icon className="w-5 h-5" />
                        {!collapsed && <span>{label}</span>}
                    </Link>
                ))}
            </nav>
        </aside>
    );
}
