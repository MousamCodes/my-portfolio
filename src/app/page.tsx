import Hero from "@/components/home/Hero";
import FeaturedProjects from "@/components/home/FeaturedProjects";
import ProjectMatcher from "@/components/home/ProjectMatcher";
import SkillsGrid from "@/components/home/SkillsGrid";
import Achievements from "@/components/home/Achievements";
import ContactCTA from "@/components/home/ContactCTA";

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedProjects />
      <ProjectMatcher />
      <SkillsGrid />
      <Achievements />
      <ContactCTA />
    </>
  );
}
