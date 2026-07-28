import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Loader } from "@/components/Loader";
import { ProgressRail } from "@/components/ProgressRail";
import { Hero } from "@/components/sections/Hero";
import { Market } from "@/components/sections/Market";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Roadmap } from "@/components/sections/Roadmap";
import { Strategies } from "@/components/sections/Strategies";
import { Simulator } from "@/components/sections/Simulator";
import { RiskLab } from "@/components/sections/RiskLab";
import { Security } from "@/components/sections/Security";
import { Glossary } from "@/components/sections/Glossary";
import { LearningPlan } from "@/components/sections/LearningPlan";

export default function Home() {
  return (
    <>
      <Loader />
      <ProgressRail />
      <Navbar />
      <main>
        <Hero />
        <Market />
        <HowItWorks />
        <Roadmap />
        <Strategies />
        <Simulator />
        <RiskLab />
        <Security />
        <Glossary />
        <LearningPlan />
      </main>
      <Footer />
    </>
  );
}
