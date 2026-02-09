"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  ProgressIndicator,
  NavigationButtons,
  OrganizationNameStep,
  TeamSizeStep,
  BusinessDetailsStep,
  UseCaseStep,
} from "@/components/onboarding";
import { submitOnboardingData } from "@/services/api";
import type { OnboardingFormData } from "@/types/onboarding";

const TOTAL_STEPS = 4;

const stepConfig = {
  1: {
    title: "Organization Setup",
    description: "Let's start by setting up your organization",
  },
  2: {
    title: "Team Information",
    description: "Tell us about your team size",
  },
  3: {
    title: "Business Details",
    description: "Help us understand your business",
  },
  4: {
    title: "Primary Use Cases",
    description: "Select the features you'd like to use",
  },
};

const Page = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<OnboardingFormData>({
    organizationName: '',
    teamSize: '',
    businessType: '',
    primaryUses: [],
  });

  const currentStepConfig = stepConfig[step as keyof typeof stepConfig];

  const isStepValid = (): boolean => {
    switch (step) {
      case 1:
        return formData.organizationName.trim().length > 0;
      case 2:
        return formData.teamSize.length > 0;
      case 3:
        return formData.businessType.length > 0;
      case 4:
        return formData.primaryUses.length > 0;
      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (!isStepValid()) return;

    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    } else {
      await handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    const payload = {
      organizationName: formData.organizationName,
      teamSize: formData.teamSize,
      businessType: formData.businessType,
      primaryUses: formData.primaryUses,
    };

    // Log the payload for testing/debugging
    console.log('='.repeat(50));
    console.log('ONBOARDING FORM SUBMISSION');
    console.log('='.repeat(50));
    console.log('Payload:', JSON.stringify(payload, null, 2));
    console.log('='.repeat(50));

    try {
      const response = await submitOnboardingData(payload);
      console.log('✅ Onboarding submitted successfully:', response);

      // Navigate to dashboard on success
      router.push('/dashboard');
    } catch (error) {
      console.error('❌ Failed to submit onboarding data:');
      console.error('Error:', error);
      console.log('');
      console.log('📋 Form data that would have been submitted:');
      console.table(payload);
      console.log('Primary Uses:', payload.primaryUses);

      // Redirect to error page
      router.push('/error/server-unavailable');
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = <K extends keyof OnboardingFormData>(
    field: K,
    value: OnboardingFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100",
      "flex items-center justify-center p-6"
    )}>
      <div className={cn("w-full max-w-2xl")}>
        {/* Progress Indicator */}
        <ProgressIndicator
          currentStep={step}
          totalSteps={TOTAL_STEPS}
          className="mb-8"
        />

        {/* Form Card */}
        <Card className={cn(
          "border-0 shadow-2xl shadow-black/10",
          "backdrop-blur-sm bg-white/90",
          "rounded-2xl overflow-hidden"
        )}>
          <CardHeader className={cn("text-center space-y-3 pb-6 pt-8")}>
            <CardTitle className={cn(
              "text-2xl font-bold tracking-tight text-slate-900"
            )}>
              {currentStepConfig.title}
            </CardTitle>
            <CardDescription className={cn("text-base text-slate-500")}>
              {currentStepConfig.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            {/* Step Content with Animation */}
            <div
              key={step}
              className="animate-in fade-in-0 slide-in-from-right-4 duration-300"
            >
              {step === 1 && (
                <OrganizationNameStep
                  value={formData.organizationName}
                  onChange={(value) => updateField('organizationName', value)}
                />
              )}

              {step === 2 && (
                <TeamSizeStep
                  value={formData.teamSize}
                  onChange={(value) => updateField('teamSize', value)}
                />
              )}

              {step === 3 && (
                <BusinessDetailsStep
                  value={formData.businessType}
                  onChange={(value) => updateField('businessType', value)}
                />
              )}

              {step === 4 && (
                <UseCaseStep
                  selectedUseCases={formData.primaryUses}
                  onChange={(useCases) => updateField('primaryUses', useCases)}
                />
              )}
            </div>

            {/* Navigation Buttons */}
            <NavigationButtons
              currentStep={step}
              totalSteps={TOTAL_STEPS}
              onBack={handleBack}
              onNext={handleNext}
              isLoading={isLoading}
              nextDisabled={!isStepValid()}
            />
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-slate-400 mt-6">
          You can always update these settings later in your dashboard.
        </p>
      </div>
    </div>
  );
};

export default Page;
