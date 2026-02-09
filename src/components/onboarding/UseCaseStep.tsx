"use client";

import React from 'react';
import { CheckboxCard } from './CheckboxCard';
import { cn } from '@/lib/utils';
import { Shield, Globe, Zap, Sparkles } from 'lucide-react';

const useCaseOptions = [
    {
        id: 'domain-monitoring',
        title: 'Domain Monitoring System',
        description: 'Real-time monitoring for typo-squatting, lookalike domains, and domain threats.',
        icon: <Shield className="w-6 h-6" />,
    },
    {
        id: 'social-monitoring',
        title: 'Social Media Monitoring',
        description: 'Track phishing discussions and brand mentions across Reddit, X, and other platforms.',
        icon: <Globe className="w-6 h-6" />,
    },
    {
        id: 'bot-detection',
        title: 'Bot Detection',
        description: 'Advanced AI-powered bot detection and prevention for your applications.',
        icon: <Zap className="w-6 h-6" />,
    },
];

interface UseCaseStepProps {
    selectedUseCases: string[];
    onChange: (useCases: string[]) => void;
    className?: string;
}

export function UseCaseStep({
    selectedUseCases,
    onChange,
    className
}: UseCaseStepProps) {
    const handleToggle = (id: string, checked: boolean) => {
        if (checked) {
            onChange([...selectedUseCases, id]);
        } else {
            onChange(selectedUseCases.filter((useCase) => useCase !== id));
        }
    };

    return (
        <div className={cn("space-y-6", className)}>
            {/* Decorative Icon */}
            <div className="flex justify-center mb-2">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 shadow-inner">
                    <Sparkles className="w-8 h-8 text-slate-600" />
                </div>
            </div>

            <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">
                    What features would you like to use?
                </label>
                <p className="text-sm text-slate-500 mb-4">
                    Select one or more features that match your security needs.
                </p>

                <div className="grid gap-4">
                    {useCaseOptions.map((option) => (
                        <CheckboxCard
                            key={option.id}
                            id={option.id}
                            title={option.title}
                            description={option.description}
                            icon={option.icon}
                            checked={selectedUseCases.includes(option.id)}
                            onChange={handleToggle}
                        />
                    ))}
                </div>

                {selectedUseCases.length > 0 && (
                    <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <p className="text-sm text-slate-600">
                            <span className="font-semibold">{selectedUseCases.length}</span> feature{selectedUseCases.length > 1 ? 's' : ''} selected
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
