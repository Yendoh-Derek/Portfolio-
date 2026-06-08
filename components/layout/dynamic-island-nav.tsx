"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Home, Briefcase, User, Mail, Menu, X, Cpu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const navItems = [
  { name: "Home", href: "/", id: "home", icon: <Home size={18} /> },
  { name: "About", href: "/#about", id: "about", icon: <User size={18} /> },
  {
    name: "Projects",
    href: "/#projects",
    id: "projects",
    icon: <Briefcase size={18} />,
  },
  {
    name: "Services",
    href: "/services",
    id: "services",
    icon: <Cpu size={18} />,
  },
  {
    name: "Contact",
    href: "/#contact",
    id: "contact",
    icon: <Mail size={18} />,
  },
];

export function DynamicIslandNav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (pathname !== "/") {
      setActiveSection("");
      return;
    }

    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -70% 0px",
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(
      observerCallback,
      observerOptions,
    );

    const sectionIds = ["home", "projects", "about", "contact"];
    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    // Handle initial hash on page load or route change
    const currentHash = window.location.hash.replace("#", "");
    if (currentHash && sectionIds.includes(currentHash)) {
      setActiveSection(currentHash);
      // Scroll to section if it exists
      setTimeout(() => {
        const element = document.getElementById(currentHash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 0);
    } else if (window.scrollY < 100) {
      setActiveSection("home");
    }

    return () => observer.disconnect();
  }, [pathname]);

  return (
    <>
      <div className="md:hidden">
        <MobileNav activeSection={activeSection} pathname={pathname} />
      </div>
      <div className="hidden md:block">
        <DesktopNav
          scrolled={scrolled}
          pathname={pathname}
          activeSection={activeSection}
        />
      </div>
    </>
  );
}

function DesktopNav({
  scrolled,
  pathname,
  activeSection,
}: {
  scrolled: boolean;
  pathname: string;
  activeSection: string;
}) {
  return (
    <motion.div
      className={`fixed top-6 left-1/2 z-50 flex items-center gap-1 px-1.5 py-1.5 rounded-full border border-white/[0.08] backdrop-blur-[24px] shadow-[0_10px_40px_rgba(0,0,0,0.35)] transition-all duration-300 ${
        scrolled ? "bg-black/60" : "bg-black/30"
      }`}
      style={{ x: "-50%" }}
    >
      {navItems.map((item) => {
        const isActive =
          item.href === "/services"
            ? pathname === "/services"
            : pathname === "/" &&
              (activeSection === item.id ||
                (!activeSection && item.id === "home"));

        return (
          <Link
            key={item.name}
            href={item.href}
            className="relative px-3.5 py-1.5 rounded-full flex items-center gap-2 group transition-colors"
          >
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 rounded-full overflow-hidden shadow-[0_0_15px_rgba(138,43,226,0.15)]"
                transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
              >
                {/* Conic spinning gradient border */}
                <div className="absolute inset-0 p-[1.5px] rounded-full">
                  <div className="absolute inset-[-200%] bg-[conic-gradient(from_0deg,transparent_35%,rgba(138,43,226,0.5)_50%,transparent_65%)] animate-spin [animation-duration:6s]" />
                  <div className="absolute inset-[1.5px] bg-[#0c071a]/95 rounded-full" />
                </div>
                {/* Top reflection glow */}
                <div className="absolute top-0 inset-x-0 h-[40%] bg-gradient-to-b from-white/10 to-transparent rounded-t-full pointer-events-none" />
                {/* Soft purple bottom glow reflection */}
                <div className="absolute bottom-0 inset-x-0 h-[30%] bg-gradient-to-t from-primary/25 to-transparent blur-[1px] pointer-events-none" />
              </motion.div>
            )}
            <span
              className={`relative z-10 text-sm font-medium transition-colors duration-300 ${
                isActive
                  ? "text-white"
                  : "text-white/50 group-hover:text-white/85"
              }`}
            >
              {item.name}
            </span>
          </Link>
        );
      })}
    </motion.div>
  );
}

function MobileNav({
  activeSection,
  pathname,
}: {
  activeSection: string;
  pathname: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-[90%] flex justify-center">
      <motion.div
        initial={false}
        animate={{
          width: isOpen ? "100%" : "auto",
          height: isOpen ? "auto" : "44px",
          borderRadius: "22px",
        }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={`flex flex-col overflow-hidden bg-black/60 border border-white/[0.08] backdrop-blur-[24px] shadow-[0_10px_40px_rgba(0,0,0,0.35)] ${isOpen ? "p-4" : "px-2 py-1"}`}
      >
        <div className="flex items-center justify-between gap-4 w-full">
          {!isOpen && (
            <div className="flex items-center gap-2 px-3">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500/90 animate-pulse" />
              <span className="text-white/70 text-sm font-medium">Menu</span>
            </div>
          )}

          {isOpen && (
            <span className="text-white font-semibold ml-2 text-sm">
              Navigation
            </span>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center text-white active:scale-95 transition-transform"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-col gap-1 mt-3"
            >
              {navItems.map((item) => {
                const isActive =
                  item.href === "/services"
                    ? pathname === "/services"
                    : pathname === "/" &&
                      (activeSection === item.id ||
                        (!activeSection && item.id === "home"));

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-300 ${
                      isActive
                        ? "bg-white/[0.08] text-white"
                        : "hover:bg-white/[0.04] text-white/55"
                    }`}
                  >
                    <span
                      className={isActive ? "text-primary" : "text-white/40"}
                    >
                      {item.icon}
                    </span>
                    <span className="font-medium text-sm">{item.name}</span>
                  </Link>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
