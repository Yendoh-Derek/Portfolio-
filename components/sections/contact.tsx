"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Send,
  CheckCircle2,
  Mail,
  Github,
  Linkedin,
  Copy,
  ExternalLink,
} from "lucide-react";
import { motion } from "framer-motion";
import { useProfile } from "@/components/profile-provider";

// Phone number formatting utility
function formatPhoneDisplay(value: string): string {
  // Remove all non-digits and plus sign
  const cleaned = value.replace(/[^\d+]/g, "");

  // Handle +233 format: +233 XXX XXX XXX
  if (cleaned.startsWith("+233")) {
    const digits = cleaned.slice(4); // Remove +233
    if (digits.length <= 3) return `+233 ${digits}`;
    if (digits.length <= 6)
      return `+233 ${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `+233 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)}`;
  }

  // Handle 0 format: 0XX XXX XXXX
  if (cleaned.startsWith("0")) {
    const digits = cleaned.slice(1); // Remove 0
    if (digits.length <= 2) return `0${digits}`;
    if (digits.length <= 5) return `0${digits.slice(0, 2)} ${digits.slice(2)}`;
    return `0${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 9)}`;
  }

  // If starts with 233 but no +, add it
  if (cleaned.startsWith("233")) {
    const digits = cleaned.slice(3);
    if (digits.length <= 3) return `+233 ${digits}`;
    if (digits.length <= 6)
      return `+233 ${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `+233 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)}`;
  }

  return cleaned;
}

// Validation schema with proper phone number support
const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .transform((val) => val.replace(/\s+/g, "")) // Strip spaces before validation
    .pipe(
      z
        .string()
        .regex(
          /^\+?[0-9]{7,15}$/,
          "Please enter a valid phone number (7-15 digits)",
        ),
    ),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(5000),
});

type ContactFormInputs = z.infer<typeof contactFormSchema>;

export function ContactSection() {
  const { personal } = useProfile();
  const { email: profileEmail, links } = personal;
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormInputs>({
    resolver: zodResolver(contactFormSchema),
    mode: "onBlur",
  });

  const [submitError, setSubmitError] = useState<string | null>(null);

  const onSubmit = async (data: ContactFormInputs) => {
    setSubmitStatus("submitting");
    setSubmitError(null);

    try {
      const { submitContactForm } = await import("@/app/actions");
      const result = await submitContactForm(data);

      if (result.ok) {
        setSubmitStatus("success");
        reset();
      } else {
        setSubmitError(result.error);
        setSubmitStatus("error");
      }
    } catch (err) {
      console.error("Form submission error:", err);
      setSubmitError("Unable to send your message right now.");
      setSubmitStatus("error");
    }
  };

  const copyEmail = () => {
    navigator.clipboard.writeText(profileEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      id="contact"
      className="py-16 md:py-24 container mx-auto px-4 relative flex items-center justify-center min-h-[500px] lg:min-h-[700px]"
    >
      {/* Background Glows */}
      <div className="absolute top-1/4 left-[-100px] w-[300px] lg:w-[500px] h-[300px] lg:h-[500px] bg-primary/20 rounded-full blur-[80px] lg:blur-[120px] -z-10" />
      <div className="absolute bottom-1/4 right-[-100px] w-[300px] lg:w-[500px] h-[300px] lg:h-[500px] bg-accent/10 rounded-full blur-[80px] lg:blur-[120px] -z-10" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center w-full max-w-6xl">
        {/* Left Column: Info & Socials */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <div>
            <h2 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/60 leading-tight">
              Let&apos;s Build <br />
              <span className="text-primary">Something Amazing</span>
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
              Have a project in mind, a question about AI, or just want to
              connect? I&apos;m always open to discussing new opportunities and
              innovative ideas.
            </p>
          </div>

          <div className="space-y-6">
            <div
              className="flex items-center gap-4 group cursor-pointer"
              onClick={copyEmail}
            >
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/20 flex items-center justify-center group-hover:bg-primary/20 group-hover:border-primary/50 transition-all">
                <Mail
                  size={20}
                  className="text-white group-hover:text-primary"
                />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email me at</p>
                <p className="text-lg font-medium text-white flex items-center gap-2">
                  {profileEmail}
                  {copied ? (
                    <CheckCircle2 size={16} className="text-green-400" />
                  ) : (
                    <Copy
                      size={16}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  )}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <SocialButton
                icon={<Github size={20} />}
                href={links.github}
                label="GitHub"
              />
              {links.linkedin && (
                <SocialButton
                  icon={<Linkedin size={20} />}
                  href={links.linkedin}
                  label="LinkedIn"
                />
              )}
            </div>
          </div>
        </motion.div>

        {/* Right Column: Interactive Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="obsidian-card !bg-white/5 p-8 md:p-12 shadow-2xl relative group"
        >
          {/* Obsidian Effects */}
          <div className="obsidian-highlight group-hover:opacity-100" />
          <div className="obsidian-border group-hover:ring-primary/30" />

          {/* Decorative gradient inside card */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/20 rounded-full blur-[80px]" />

          {submitStatus === "success" ? (
            <div className="text-center py-20 flex flex-col items-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-6 border border-green-500/30 shadow-[0_0_30px_rgba(74,222,128,0.2)]"
              >
                <CheckCircle2 size={40} />
              </motion.div>
              <h3 className="text-3xl font-bold text-white mb-2">
                Message Sent!
              </h3>
              <p className="text-white/60 mb-8 max-w-xs mx-auto">
                Thanks for reaching out. I&apos;ll get back to you as soon as
                possible.
              </p>
              <button
                onClick={() => setSubmitStatus("idle")}
                className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium transition-colors border border-white/5"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6 relative z-10"
            >
              {/* Name Field */}
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="text-sm font-medium text-white/70 ml-1"
                >
                  Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  {...register("name")}
                  className={`w-full bg-white/5 hover:bg-white/10 border focus:ring-2 focus:outline-none rounded-xl px-4 py-3.5 text-white transition-all placeholder:text-white/20 duration-300 ${
                    errors.name
                      ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                      : "border-white/10 focus:border-primary/50 focus:ring-primary/20"
                  }`}
                  placeholder="Kofi Sam"
                />
                {errors.name && (
                  <p className="text-sm text-red-400 ml-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-white/70 ml-1"
                >
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  {...register("email")}
                  className={`w-full bg-white/5 hover:bg-white/10 border focus:ring-2 focus:outline-none rounded-xl px-4 py-3.5 text-white transition-all placeholder:text-white/20 duration-300 ${
                    errors.email
                      ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                      : "border-white/10 focus:border-primary/50 focus:ring-primary/20"
                  }`}
                  placeholder="kofi@example.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-400 ml-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Phone Field */}
              <div className="space-y-2">
                <label
                  htmlFor="phone"
                  className="text-sm font-medium text-white/70 ml-1"
                >
                  Phone <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  {...register("phone", {
                    onChange: (e) => {
                      e.target.value = formatPhoneDisplay(e.target.value);
                    },
                  })}
                  className={`w-full bg-white/5 hover:bg-white/10 border focus:ring-2 focus:outline-none rounded-xl px-4 py-3.5 text-white transition-all placeholder:text-white/20 duration-300 ${
                    errors.phone
                      ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                      : "border-white/10 focus:border-primary/50 focus:ring-primary/20"
                  }`}
                  placeholder="+233 XXX XXX XXX or 0XX XXX XXXX"
                />
                {errors.phone && (
                  <p className="text-sm text-red-400 ml-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              {/* Message Field */}
              <div className="space-y-2">
                <label
                  htmlFor="message"
                  className="text-sm font-medium text-white/70 ml-1"
                >
                  Message <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="message"
                  {...register("message")}
                  rows={5}
                  className={`w-full bg-white/5 hover:bg-white/10 border focus:ring-2 focus:outline-none rounded-xl px-4 py-3.5 text-white transition-all placeholder:text-white/20 duration-300 resize-none ${
                    errors.message
                      ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                      : "border-white/10 focus:border-primary/50 focus:ring-primary/20"
                  }`}
                  placeholder="Tell me about your project..."
                />
                {errors.message && (
                  <p className="text-sm text-red-400 ml-1">
                    {errors.message.message}
                  </p>
                )}
              </div>

              {/* Error Message */}
              {submitStatus === "error" && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm">
                  <p className="font-medium">Failed to send message</p>
                  <p className="text-xs mt-1">
                    {submitError ??
                      "Please check your information and try again."}
                  </p>
                </div>
              )}

              {/* Privacy Disclosure */}
              <p className="text-xs text-white/50 text-center">
                By submitting this form, your name, email, and message will be
                sent to Derek Yendoh. This information is used solely for
                communication purposes and will not be shared with third
                parties.
              </p>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl hover:shadow-[0_0_30px_rgba(123,44,191,0.4)] hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin">⟳</span>
                    Processing...
                  </>
                ) : (
                  <>
                    Send Message <Send size={20} />
                  </>
                )}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}

function SocialButton({
  icon,
  href,
  label,
}: {
  icon: React.ReactNode;
  href: string;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/20 hover:bg-white/10 hover:border-white/20 transition-all hover:-translate-y-1 group"
      aria-label={label}
    >
      <span className="text-white/70 group-hover:text-white transition-colors">
        {icon}
      </span>
      <span className="font-medium text-white">{label}</span>
      <ExternalLink
        size={14}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-white/50"
      />
    </a>
  );
}
