"use client";

import {
  Github,
  Linkedin,
  Instagram,
  Mail,
  Phone,
  ArrowUp,
  X,
} from "lucide-react";
import { useProfile } from "@/components/profile-provider";

export function Footer() {
  const { personal } = useProfile();
  const { links } = personal;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative border-t border-white/20 bg-[#050505] z-40 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
          {/* Left: Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white">{personal.name}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {personal.title}
            </p>
            <p className="text-muted-foreground text-sm">Ready to help you</p>
          </div>

          {/* Center: Navigate */}
          <div className="space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/50">
              Navigate
            </h4>
            <nav className="flex flex-col space-y-2 text-sm">
              <a
                href="/#about"
                className="text-muted-foreground hover:text-white transition-colors"
              >
                About
              </a>
              <a
                href="/#projects"
                className="text-muted-foreground hover:text-white transition-colors"
              >
                Work
              </a>
              <a
                href="/services"
                className="text-muted-foreground hover:text-white transition-colors"
              >
                Services
              </a>
              <a
                href="/#contact"
                className="text-muted-foreground hover:text-white transition-colors"
              >
                Contact
              </a>
            </nav>
          </div>

          {/* Right: Contact & Social */}
          <div className="space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/50">
              Contact
            </h4>
            <div className="space-y-3 text-sm">
              <a
                href={`mailto:${personal.email}`}
                className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors"
              >
                <Mail size={16} className="text-primary" />
                {personal.email}
              </a>
              {personal.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone size={16} className="text-primary" />
                  {personal.phone}
                </div>
              )}
            </div>
            <div className="flex gap-3 pt-2">
              <SocialLink
                href={links.github}
                icon={<Github size={18} />}
                label="GitHub"
              />
              {links.linkedin && (
                <SocialLink
                  href={links.linkedin}
                  icon={<Linkedin size={18} />}
                  label="LinkedIn"
                />
              )}
              {links.instagram && (
                <SocialLink
                  href={links.instagram}
                  icon={<Instagram size={18} />}
                  label="Instagram"
                />
              )}
              {links.twitter && (
                <SocialLink
                  href={links.twitter}
                  icon={<X size={18} />}
                  label="X"
                />
              )}
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-white/30 text-center md:text-left">
            &copy; {new Date().getFullYear()} {personal.name}. All rights
            reserved.
          </p>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/20 hover:bg-white/10 hover:border-primary/50 text-white/70 hover:text-white transition-all group text-sm font-medium shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5"
          >
            <span>Return to Surface</span>
            <ArrowUp
              size={16}
              className="group-hover:-translate-y-1 transition-transform text-primary"
            />
          </button>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="w-9 h-9 rounded-full bg-white/5 border border-white/20 flex items-center justify-center text-white/70 hover:bg-white/10 hover:text-white hover:border-primary/50 hover:scale-110 transition-all duration-300"
      title={label}
    >
      {icon}
    </a>
  );
}
