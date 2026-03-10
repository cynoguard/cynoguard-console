"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
    currentStep: number;
    totalSteps: number;
    className?: string;
}

export function ProgressIndicator({
    currentStep,
    totalSteps,
    className
}: ProgressIndicatorProps) {
    const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

    return (
        <div className={cn("flex flex-col items-center", className)}>
            <div className="flex items-center justify-center mb-3 w-full max-w-md mx-auto">
                {steps.map((step) => (
                    <div key={step} className="flex items-center flex-1">
                        {/* Step Circle */}
                        <div
                            className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 relative",
                                step < currentStep && "bg-black text-white",
                                step === currentStep && "bg-black text-white ring-4 ring-black/20 scale-110",
                                step > currentStep && "bg-slate-100 text-slate-400 border-2 border-slate-200"
                            )}
                        >
                            {step < currentStep ? (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            ) : (
                                step
                            )}

                            {/* Pulse animation for current step */}
                            {step === currentStep && (
                                <span className="absolute inset-0 rounded-full bg-black/20 animate-ping" />
                            )}
                        </div>

                        {/* Connection Line */}
                        {step < totalSteps && (
                            <div className="flex-1 h-1 mx-2 rounded-full overflow-hidden bg-slate-200">
                                <div
                                    className={cn(
                                        "h-full bg-black transition-all duration-500 ease-out",
                                        step < currentStep ? "w-full" : "w-0"
                                    )}
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="text-sm text-slate-500 font-medium">
                Step {currentStep} of {totalSteps}
            </div>
        </div>
    );
}
