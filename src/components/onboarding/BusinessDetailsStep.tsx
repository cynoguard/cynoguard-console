"use client";

import React from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from '@/lib/utils';
import { Briefcase } from 'lucide-react';

const businessTypes = [
    { value: 'startup', label: 'Startup' },
    { value: 'smb', label: 'Small & Medium Business' },
    { value: 'enterprise', label: 'Enterprise' },
    { value: 'agency', label: 'Agency' },
    { value: 'government', label: 'Government' },
    { value: 'nonprofit', label: 'Non-Profit' },
    { value: 'other', label: 'Other' },
];

interface BusinessDetailsStepProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

export function BusinessDetailsStep({
    value,
    onChange,
    className
}: BusinessDetailsStepProps) {
    return (
        <div className={cn("space-y-6", className)}>
            {/* Decorative Icon */}
            <div className="flex justify-center mb-2">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 shadow-inner">
                    <Briefcase className="w-8 h-8 text-slate-600" />
                </div>
            </div>

            <div className="space-y-3">
                <label
                    htmlFor="businessType"
                    className="text-sm font-semibold text-slate-700 block"
                >
                    Business Type
                </label>

                <Select value={value} onValueChange={onChange}>
                    <SelectTrigger
                        id="businessType"
                        className={cn(
                            "w-full h-12 text-base px-4 rounded-xl border-2 border-slate-200",
                            "focus:border-black focus:ring-4 focus:ring-black/10",
                            "transition-all duration-200 bg-white text-slate-900",
                            !value && "text-slate-400"
                        )}
                    >
                        <SelectValue placeholder="Select your business type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-slate-200 rounded-xl shadow-lg">
                        {businessTypes.map((type) => (
                            <SelectItem
                                key={type.value}
                                value={type.value}
                                className="text-slate-700 hover:bg-slate-50 cursor-pointer py-3 px-4"
                            >
                                {type.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <p className="text-sm text-slate-500">
                    This helps us tailor the experience to your needs.
                </p>
            </div>
        </div>
    );
}
