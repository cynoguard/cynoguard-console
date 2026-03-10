import { apiPost } from './client';
import type { OnboardingApiRequest, OnboardingApiResponse } from '@/types/onboarding';

const ONBOARDING_ENDPOINT = '/onboarding/setup-organization';

/**
 * Submit onboarding data to the backend
 * @param data - The onboarding form data
 * @returns Promise with the API response
 */
export async function submitOnboardingData(
    data: OnboardingApiRequest
): Promise<OnboardingApiResponse> {
    return apiPost<OnboardingApiResponse>(ONBOARDING_ENDPOINT, data);
}
