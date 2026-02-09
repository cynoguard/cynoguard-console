"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Shield, Zap, Globe, ChevronRight, ChevronLeft } from 'lucide-react';

const Page = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    organizationName: '',
    teamSize: '',
    businessType: '',
    primaryUse: '',
  });

  const teamSizes = [
    { value: '1-10', label: '1-10 employees' },
    { value: '11-50', label: '11-50 employees' },
    { value: '51-200', label: '51-200 employees' },
    { value: '201-500', label: '201-500 employees' },
    { value: '500+', label: '500+ employees' },
  ];

  const businessTypes = [
    { value: 'startup', label: 'Startup' },
    { value: 'smb', label: 'Small & Medium Business' },
    { value: 'enterprise', label: 'Enterprise' },
    { value: 'agency', label: 'Agency' },
    { value: 'other', label: 'Other' },
  ];

  const primaryUses = [
    {
      id: 'bot-detection',
      title: 'Bot Detection',
      description: 'Advanced AI-powered bot detection and prevention',
      icon: <Zap className="w-6 h-6" />,
    },
    {
      id: 'domain-monitoring',
      title: 'Domain Monitoring',
      description: 'Real-time domain threat monitoring and typo-squatting detection',
      icon: <Shield className="w-6 h-6" />,
    },
    {
      id: 'social-monitoring',
      title: 'Social Media Monitoring',
      description: 'Track phishing discussions across Reddit, X, and other platforms',
      icon: <Globe className="w-6 h-6" />,
    },
  ];

  const handleNext = () => {
    if (step === 1 && !formData.organizationName.trim()) {
      return;
    }
    if (step === 2 && !formData.teamSize) {
      return;
    }
    if (step === 3 && !formData.businessType) {
      return;
    }
    if (step === 4 && !formData.primaryUse) {
      return;
    }
    
    if (step < 4) {
      setStep(step + 1);
    } else {
      // Submit form - redirect to dashboard or next step
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    // TODO: Submit to API
    console.log('Form data:', formData);
    // router.push('/dashboard');
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className={cn("min-h-screen bg-white flex items-center justify-center p-6")}>
      <div className={cn("w-full max-w-2xl")}>
        {/* Progress Indicator - Centered */}
        <div className={cn("mb-8 flex flex-col items-center")}>
          <div className={cn("flex items-center justify-center mb-2 w-full max-w-md mx-auto")}>
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className={cn("flex items-center flex-1")}>
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                    s <= step
                      ? "bg-black text-white"
                      : "bg-slate-200 text-slate-500"
                  )}
                >
                  {s}
                </div>
                {s < 4 && (
                  <div
                    className={cn(
                      "flex-1 h-0.5 mx-2 transition-colors",
                      s < step ? "bg-black" : "bg-slate-200"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
          <div className={cn("text-sm text-slate-500")}>
            Step {step} of 4
          </div>
        </div>

        {/* Form Card */}
        <Card className={cn("border-0 shadow-xl shadow-black/5 dark:shadow-black/20 backdrop-blur-sm bg-card/80")}>
          <CardHeader className={cn("text-center space-y-2 pb-6")}>
            <CardTitle className={cn("text-2xl font-bold tracking-tight")}>
              {step === 1 && "Organization Setup"}
              {step === 2 && "Team Information"}
              {step === 3 && "Business Details"}
              {step === 4 && "Primary Use Case"}
            </CardTitle>
            <CardDescription className={cn("text-base")}>
              {step === 1 && "Let's start by setting up your organization"}
              {step === 2 && "Tell us about your team"}
              {step === 3 && "Help us understand your business"}
              {step === 4 && "Select your primary security focus"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Step 1: Organization Name */}
            {step === 1 && (
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="organizationName">Organization Name</FieldLabel>
                  <Input
                    id="organizationName"
                    name="organizationName"
                    type="text"
                    placeholder="Acme Inc."
                    value={formData.organizationName}
                    onChange={(e) => updateFormData('organizationName', e.target.value)}
                    required
                  />
                </Field>
              </FieldGroup>
            )}

            {/* Step 2: Team Size */}
            {step === 2 && (
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="teamSize">Team Size</FieldLabel>
                  <Select
                    id="teamSize"
                    name="teamSize"
                    value={formData.teamSize}
                    onChange={(e) => updateFormData('teamSize', e.target.value)}
                    required
                  >
                    <option value="">Select team size</option>
                    {teamSizes.map((size) => (
                      <option key={size.value} value={size.value}>
                        {size.label}
                      </option>
                    ))}
                  </Select>
                </Field>
              </FieldGroup>
            )}

            {/* Step 3: Business Type */}
            {step === 3 && (
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="businessType">Business Type</FieldLabel>
                  <Select
                    id="businessType"
                    name="businessType"
                    value={formData.businessType}
                    onChange={(e) => updateFormData('businessType', e.target.value)}
                    required
                  >
                    <option value="">Select business type</option>
                    {businessTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </Select>
                </Field>
              </FieldGroup>
            )}

            {/* Step 4: Primary Use */}
            {step === 4 && (
              <FieldGroup>
                <div className={cn("grid grid-cols-1 gap-4")}>
                  {primaryUses.map((use) => (
                    <button
                      key={use.id}
                      type="button"
                      onClick={() => updateFormData('primaryUse', use.id)}
                      className={cn(
                        "text-left p-5 border rounded-lg transition-colors",
                        formData.primaryUse === use.id
                          ? "border-black bg-slate-50"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      )}
                    >
                      <div className={cn("flex items-start gap-4")}>
                        <div
                          className={cn(
                            "p-2.5 rounded-md",
                            formData.primaryUse === use.id
                              ? "bg-black text-white"
                              : "bg-slate-100 text-slate-600"
                          )}
                        >
                          {use.icon}
                        </div>
                        <div className={cn("flex-1")}>
                          <h3
                            className={cn(
                              "font-semibold mb-1 text-base",
                              formData.primaryUse === use.id
                                ? "text-slate-900"
                                : "text-slate-700"
                            )}
                          >
                            {use.title}
                          </h3>
                          <p className={cn("text-sm text-slate-500 leading-relaxed")}>
                            {use.description}
                          </p>
                        </div>
                        {formData.primaryUse === use.id && (
                          <div className={cn("w-5 h-5 rounded-full border-2 border-black flex items-center justify-center flex-shrink-0 mt-0.5")}>
                            <div className={cn("w-2 h-2 rounded-full bg-black")} />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </FieldGroup>
            )}

            {/* Navigation Buttons */}
            <div className={cn("flex items-center justify-between mt-8 pt-6 border-t border-slate-200")}>
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={step === 1}
                className={cn("flex items-center gap-2")}
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
              <Button
                type="button"
                onClick={handleNext}
                className={cn("w-full max-w-[200px] flex items-center justify-center gap-2 bg-black text-white hover:bg-slate-800 h-11 text-base font-medium")}
              >
                {step === 4 ? 'Complete Setup' : 'Next'}
                {step < 4 && <ChevronRight className="w-4 h-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Page;
