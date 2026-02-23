"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import { ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';

interface NavigationButtonsProps {
    currentStep: number;
    totalSteps: number;
    onBack: () => void;
    onNext: () => void;
    isLoading?: boolean;
    nextDisabled?: boolean;
    className?: string;
}

export function NavigationButtons({
    currentStep,
    totalSteps,
    onBack,
    onNext,
    isLoading = false,
    nextDisabled = false,
    className,
}: NavigationButtonsProps) {
    const isLastStep = currentStep === totalSteps;

    return (
        <div className={cn(
            "flex items-center justify-between mt-8 pt-6 border-t border-slate-200",
            className
        )}>
            <Button
                type="button"
                variant="outline"
                onClick={onBack}
                disabled={currentStep === 1 || isLoading}
                className={cn(
                    "flex items-center gap-2 h-11 px-6 font-medium transition-all duration-200",
                    "hover:bg-slate-50 hover:border-slate-300",
                    currentStep === 1 && "opacity-0 pointer-events-none"
                )}
            >
                <ChevronLeft className="w-4 h-4" />
                Back
            </Button>

            <Button
                type="button"
                onClick={onNext}
                disabled={nextDisabled || isLoading}
                className={cn(
                    "flex items-center justify-center gap-2 h-12 px-8 font-semibold text-base",
                    "bg-black text-white hover:bg-slate-800 transition-all duration-200",
                    "shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30",
                    "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                )}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                    </>
                ) : isLastStep ? (
                    'Complete Setup'
                ) : (
                    <>
                        Continue
                        <ChevronRight className="w-4 h-4" />
                    </>
                )}
            </Button>
        </div>
    );
}
