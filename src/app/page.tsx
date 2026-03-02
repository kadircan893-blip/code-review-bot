import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { CTASection } from "@/components/landing/CTASection";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#09090b]">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CTASection />
    </main>
  );
}
