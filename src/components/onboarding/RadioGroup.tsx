"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface RadioOption {
    value: string;
    label: string;
    description?: string;
}

interface RadioGroupProps {
    name: string;
    value: string;
    onChange: (value: string) => void;
    options: RadioOption[];
    className?: string;
}

export function RadioGroup({
    name,
    value,
    onChange,
    options,
    className
}: RadioGroupProps) {
    return (
        <div className={cn("grid gap-3", className)}>
            {options.map((option) => (
                <label
                    key={option.value}
                    className={cn(
                        "relative flex items-center gap-4 p-4 cursor-pointer rounded-xl border-2 transition-all duration-200",
                        "hover:shadow-md hover:border-slate-300",
                        value === option.value
                            ? "border-black bg-slate-50 shadow-sm"
                            : "border-slate-200 bg-white"
                    )}
                >
                    <input
                        type="radio"
                        name={name}
                        value={option.value}
                        checked={value === option.value}
                        onChange={(e) => onChange(e.target.value)}
                        className="sr-only"
                    />

                    {/* Custom Radio Circle */}
                    <div
                        className={cn(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200",
                            value === option.value
                                ? "border-black bg-black"
                                : "border-slate-300 bg-white"
                        )}
                    >
                        {value === option.value && (
                            <div className="w-2 h-2 rounded-full bg-white animate-in zoom-in-50 duration-200" />
                        )}
                    </div>

                    <div className="flex-1">
                        <span className={cn(
                            "font-medium text-base block",
                            value === option.value ? "text-slate-900" : "text-slate-700"
                        )}>
                            {option.label}
                        </span>
                        {option.description && (
                            <span className="text-sm text-slate-500 mt-0.5 block">
                                {option.description}
                            </span>
                        )}
                    </div>

                    {/* Selected Indicator */}
                    {value === option.value && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <svg
                                className="w-5 h-5 text-black animate-in zoom-in-50 duration-200"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                    )}
                </label>
            ))}
        </div>
    );
}
