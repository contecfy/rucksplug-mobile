import { Redirect } from 'expo-router';

export default function Index() {
  // In a real app, you would check if the user is authenticated 
  // and if they have seen the onboarding.
  // For now, we redirect to onboarding.
  return <Redirect href="/(auth)/onboarding" />;
}
