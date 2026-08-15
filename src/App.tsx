import AppProviders from '@/app/providers/AppProviders';
import AppRoutes from '@/core/router/AppRoutes';
import OnboardingTour from '@/shared/components/Onboarding/OnboardingTour';

export default function App() {
  return (
    <AppProviders>
      <OnboardingTour />
      <AppRoutes />
    </AppProviders>
  );
}
