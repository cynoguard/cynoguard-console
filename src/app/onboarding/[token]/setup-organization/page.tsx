"use client"

import {
  BusinessDetailsStep,
  NavigationButtons,
  OrganizationNameStep,
  ProgressIndicator,
  ProjectSetupStep,
  TeamSizeStep,
  UseCaseStep,
} from "@/components/onboarding";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { OnboardingFormData } from "@/types/onboarding";
import axios from "axios";
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const TOTAL_STEPS = 5;

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
  5: {
    title: "Project Setup",
    description: "Let's set up your first project",
  },
};

const Page = () => {
  const router = useRouter();
  const {token} = useParams();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<OnboardingFormData>({
    organizationName: '',
    teamSize: '',
    businessType: '',
    primaryUses: [],
    projectName: '',
    primaryDomain: '',
    environmentType: '',
    industryNiche: '',
  });


  useEffect(()=>{
    if(token){
      sessionStorage.setItem('onboardingToken',token as string);
    }
  },[token]);

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
      case 5:
        return formData.projectName.trim().length > 0 &&
               formData.primaryDomain.trim().length > 0 &&
               formData.environmentType.length > 0;
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
      name: formData.organizationName.trim().toLowerCase(),
      teamSize: formData.teamSize,
      businessType: formData.businessType,
      primaryUses: formData.primaryUses,
      projectName: formData.projectName.trim().toLowerCase(),
      primaryDomain: formData.primaryDomain,
      environmentType: formData.environmentType,
      industryNiche: formData.industryNiche,
    };

    try {
      const response = await axios.put('http://127.0.0.1:4000/api/onboarding/sync',
       payload,
       {
        headers:{
          Authorization:`Bearer ${token}`,
        }
       }
      );


      if (response.data.status === "success") {
        const { auth, organization, project } = response.data.data;

        // encodeURIComponent prevents + and = chars in JWT from breaking the URL
        const params = new URLSearchParams({
          token:     auth.token,
          org:       organization.name,
          project:   project.name,
          projectId: project.id,
        });

        router.push(`/auth-bridge?${params.toString()}`);
      }

      
    } catch (error) {
      // Redirect to error page
      console.log(error)
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

              {step === 5 && (
                <ProjectSetupStep
                  projectName={formData.projectName}
                  primaryDomain={formData.primaryDomain}
                  environmentType={formData.environmentType}
                  industryNiche={formData.industryNiche}
                  onProjectNameChange={(value) => updateField('projectName', value)}
                  onPrimaryDomainChange={(value) => updateField('primaryDomain', value)}
                  onEnvironmentTypeChange={(value) => updateField('environmentType', value)}
                  onIndustryNicheChange={(value) => updateField('industryNiche', value)}
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
