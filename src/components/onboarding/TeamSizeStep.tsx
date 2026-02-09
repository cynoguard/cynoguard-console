"use client";

import React from 'react';
import { RadioGroup } from './RadioGroup';
import { cn } from '@/lib/utils';
import { Users } from 'lucide-react';

const teamSizeOptions = [
    { value: '1-10', label: '1-10 employees', description: 'Small team or startup' },
    { value: '11-50', label: '11-50 employees', description: 'Growing team' },
    { value: '51-200', label: '51-200 employees', description: 'Mid-size company' },
    { value: '201-500', label: '201-500 employees', description: 'Large organization' },
    { value: '500+', label: '500+ employees', description: 'Enterprise' },
];

interface TeamSizeStepProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

export function TeamSizeStep({
    value,
    onChange,
    className
}: TeamSizeStepProps) {
    return (
        <div className={cn("space-y-6", className)}>
            {/* Decorative Icon */}
            <div className="flex justify-center mb-2">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 shadow-inner">
                    <Users className="w-8 h-8 text-slate-600" />
                </div>
            </div>

            <div>
                <label className="text-sm font-semibold text-slate-700 mb-4 block">
                    How many people are in your team?
                </label>
                <RadioGroup
                    name="teamSize"
                    value={value}
                    onChange={onChange}
                    options={teamSizeOptions}
                />
            </div>
        </div>
    );
}
