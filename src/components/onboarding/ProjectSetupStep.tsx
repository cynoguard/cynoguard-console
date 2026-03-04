"use client";

import {
    Field,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from '@/lib/utils';
import { Package } from 'lucide-react';

interface ProjectSetupStepProps {
    projectName: string;
    primaryDomain: string;
    environmentType: string;
    industryNiche: string;
    onProjectNameChange: (value: string) => void;
    onPrimaryDomainChange: (value: string) => void;
    onEnvironmentTypeChange: (value: string) => void;
    onIndustryNicheChange: (value: string) => void;
    className?: string;
}

export function ProjectSetupStep({
    projectName,
    primaryDomain,
    environmentType,
    industryNiche,
    onProjectNameChange,
    onPrimaryDomainChange,
    onEnvironmentTypeChange,
    onIndustryNicheChange,
    className
}: ProjectSetupStepProps) {
    return (
        <div className={cn("space-y-6", className)}>
            {/* Decorative Icon */}
            <div className="flex justify-center mb-2">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 shadow-inner">
                    <Package className="w-8 h-8 text-slate-600" />
                </div>
            </div>

            <FieldGroup className="space-y-6">
                {/* Project Name */}
                <Field>
                    <FieldLabel
                        htmlFor="projectName"
                        className="text-sm font-semibold text-slate-700 mb-2 block"
                    >
                        Project Name <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Input
                        id="projectName"
                        name="projectName"
                        type="text"
                        placeholder="e.g., Main Web App"
                        value={projectName}
                        onChange={(e) => onProjectNameChange(e.target.value)}
                        required
                        className={cn(
                            "h-12 text-base px-4 rounded-xl border-2 border-slate-200",
                            "bg-white text-slate-900",
                            "focus:border-black focus:ring-4 focus:ring-black/10",
                            "placeholder:text-slate-400 transition-all duration-200"
                        )}
                    />
                    <p className="text-sm text-slate-500 mt-2">
                        Used for UI labeling throughout your dashboard.
                    </p>
                </Field>

                {/* Primary Domain/URL */}
                <Field>
                    <FieldLabel
                        htmlFor="primaryDomain"
                        className="text-sm font-semibold text-slate-700 mb-2 block"
                    >
                        Primary Domain/URL <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Input
                        id="primaryDomain"
                        name="primaryDomain"
                        type="text"
                        placeholder="e.g., xyz.com"
                        value={primaryDomain}
                        onChange={(e) => onPrimaryDomainChange(e.target.value)}
                        required
                        className={cn(
                            "h-12 text-base px-4 rounded-xl border-2 border-slate-200",
                            "bg-white text-slate-900",
                            "focus:border-black focus:ring-4 focus:ring-black/10",
                            "placeholder:text-slate-400 transition-all duration-200"
                        )}
                    />
                    <p className="text-sm text-slate-500 mt-2">
                        The domain you are protecting. Used for CORS validation and identifying log sources.
                    </p>
                </Field>

                {/* Environment Type */}
                <Field>
                    <FieldLabel
                        htmlFor="environmentType"
                        className="text-sm font-semibold text-slate-700 mb-2 block"
                    >
                        Environment Type <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Select value={environmentType} onValueChange={onEnvironmentTypeChange}>
                        <SelectTrigger
                            id="environmentType"
                            className={cn(
                                "h-12 text-base px-4 rounded-xl border-2 border-slate-200",
                                "bg-white text-slate-900",
                                "focus:border-black focus:ring-4 focus:ring-black/10",
                                "placeholder:text-slate-400 transition-all duration-200"
                            )}
                        >
                            <SelectValue placeholder="Select environment type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="production">Production</SelectItem>
                            <SelectItem value="staging">Staging</SelectItem>
                            <SelectItem value="development">Development</SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-sm text-slate-500 mt-2">
                        Helps our ML engine distinguish between testing noise and actual attacks.
                    </p>
                </Field>

                {/* Industry/Niche */}
                <Field>
                    <FieldLabel
                        htmlFor="industryNiche"
                        className="text-sm font-semibold text-slate-700 mb-2 block"
                    >
                        Industry/Niche <span className="text-slate-400 text-xs font-normal">(Optional)</span>
                    </FieldLabel>
                    <Select value={industryNiche} onValueChange={onIndustryNicheChange}>
                        <SelectTrigger
                            id="industryNiche"
                            className={cn(
                                "h-12 text-base px-4 rounded-xl border-2 border-slate-200",
                                "bg-white text-slate-900",
                                "focus:border-black focus:ring-4 focus:ring-black/10",
                                "placeholder:text-slate-400 transition-all duration-200"
                            )}
                        >
                            <SelectValue placeholder="Select industry or leave blank" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="e-commerce">E-Commerce</SelectItem>
                            <SelectItem value="fintech">Fintech</SelectItem>
                            <SelectItem value="healthcare">Healthcare</SelectItem>
                            <SelectItem value="saas">SaaS</SelectItem>
                            <SelectItem value="media">Media & Entertainment</SelectItem>
                            <SelectItem value="education">Education</SelectItem>
                            <SelectItem value="real-estate">Real Estate</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-sm text-slate-500 mt-2">
                        Pre-applies industry-specific security rules for better protection.
                    </p>
                </Field>
            </FieldGroup>
        </div>
    );
}
