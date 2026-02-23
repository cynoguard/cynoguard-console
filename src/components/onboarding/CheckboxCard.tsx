"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface CheckboxCardProps {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    checked: boolean;
    onChange: (id: string, checked: boolean) => void;
    className?: string;
}

export function CheckboxCard({
    id,
    title,
    description,
    icon,
    checked,
    onChange,
    className,
}: CheckboxCardProps) {
    return (
        <label
            className={cn(
                "relative flex items-start gap-4 p-5 cursor-pointer rounded-xl border-2 transition-all duration-200",
                "hover:shadow-lg hover:border-slate-300 hover:-translate-y-0.5",
                checked
                    ? "border-black bg-gradient-to-br from-slate-50 to-white shadow-md"
                    : "border-slate-200 bg-white",
                className
            )}
        >
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(id, e.target.checked)}
                className="sr-only"
            />

            {/* Icon Container */}
            <div
                className={cn(
                    "p-3 rounded-xl transition-all duration-200 flex-shrink-0",
                    checked
                        ? "bg-black text-white shadow-lg"
                        : "bg-slate-100 text-slate-600"
                )}
            >
                {icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <h3
                    className={cn(
                        "font-semibold text-base mb-1 transition-colors",
                        checked ? "text-slate-900" : "text-slate-700"
                    )}
                >
                    {title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                    {description}
                </p>
            </div>

            {/* Checkbox Indicator */}
            <div
                className={cn(
                    "w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200",
                    checked
                        ? "border-black bg-black"
                        : "border-slate-300 bg-white"
                )}
            >
                {checked && (
                    <Check
                        className="w-4 h-4 text-white animate-in zoom-in-50 duration-200"
                        strokeWidth={3}
                    />
                )}
            </div>
        </label>
    );
}
