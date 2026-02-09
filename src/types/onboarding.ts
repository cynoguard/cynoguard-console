export interface OnboardingFormData {
    organizationName: string;
    teamSize: string;
    businessType: string;
    primaryUses: string[];
}

export interface OnboardingApiRequest {
    organizationName: string;
    teamSize: string;
    businessType: string;
    primaryUses: string[];
}

export interface OnboardingApiResponse {
    success: boolean;
    message: string;
    organizationId?: string;
}

export interface TeamSizeOption {
    value: string;
    label: string;
    description?: string;
}

export interface BusinessTypeOption {
    value: string;
    label: string;
}

export interface UseCaseOption {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
}
