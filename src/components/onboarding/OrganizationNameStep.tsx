"use client";

import React from 'react';
import {
    Field,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from '@/lib/utils';
import { Building2 } from 'lucide-react';

interface OrganizationNameStepProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

export function OrganizationNameStep({
    value,
    onChange,
    className
}: OrganizationNameStepProps) {
    return (
        <div className={cn("space-y-6", className)}>
            {/* Decorative Icon */}
            <div className="flex justify-center mb-2">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 shadow-inner">
                    <Building2 className="w-8 h-8 text-slate-600" />
                </div>
            </div>

            <FieldGroup>
                <Field>
                    <FieldLabel
                        htmlFor="organizationName"
                        className="text-sm font-semibold text-slate-700 mb-2 block"
                    >
                        Organization Name
                    </FieldLabel>
                    <Input
                        id="organizationName"
                        name="organizationName"
                        type="text"
                        placeholder="Enter your organization name"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        required
                        className={cn(
                            "h-12 text-base px-4 rounded-xl border-2 border-slate-200",
                            "bg-white text-slate-900",
                            "focus:border-black focus:ring-4 focus:ring-black/10",
                            "placeholder:text-slate-400 transition-all duration-200"
                        )}
                    />
                    <p className="text-sm text-slate-500 mt-2">
                        This will be displayed across your dashboard and reports.
                    </p>
                </Field>
            </FieldGroup>
        </div>
    );
}
