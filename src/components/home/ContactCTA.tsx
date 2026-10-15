import { Mail } from "lucide-react";
import { GithubIcon as Github, LinkedinIcon as Linkedin, XIcon as Twitter } from "@/components/ui/BrandIcons";
import { Section } from "@/components/ui/Section";
import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";
import { profile } from "@/data/profile";

export default function ContactCTA() {
  return (
    <Section id="contact">
      <Reveal>
        <div className="card relative overflow-hidden p-8 text-center sm:p-14">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[600px] -translate-x-1/2 rounded-full bg-accent/25 blur-[120px]" />
          <p className="relative font-mono text-xs uppercase tracking-[0.25em] text-accent-2">Contact</p>
          <h2 className="relative mt-3 text-3xl font-semibold tracking-tight text-white sm:text-5xl">Let&apos;s build something.</h2>
          <p className="relative mx-auto mt-4 max-w-xl text-muted">{profile.availability} Reply usually within a day.</p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <Button href={`mailto:${profile.email}`} size="lg">
              <Mail className="h-4 w-4" /> {profile.email}
            </Button>
            <Button href={profile.socials.linkedin} variant="secondary" size="lg" external>
              <Linkedin className="h-4 w-4" /> LinkedIn
            </Button>
            <Button href={profile.socials.github} variant="secondary" size="lg" external>
              <Github className="h-4 w-4" /> GitHub
            </Button>
            <Button href={profile.socials.x} variant="secondary" size="lg" external>
              <Twitter className="h-4 w-4" /> Follow on Twitter
            </Button>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
