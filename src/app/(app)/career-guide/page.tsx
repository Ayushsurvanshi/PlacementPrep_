import { CareerGuideClient } from './components/career-guide-client';

export default function CareerGuidePage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">AI Smart Career Guide</h1>
        <p className="text-muted-foreground mt-2">
          Get personalized career recommendations based on your skills and interests.
        </p>
      </div>
      <CareerGuideClient />
    </div>
  );
}
