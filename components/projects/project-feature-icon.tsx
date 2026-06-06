import {
  Activity,
  BarChart3,
  BookMarked,
  BookOpen,
  Bot,
  Brain,
  ClipboardCheck,
  Cpu,
  FileText,
  Filter,
  FlaskConical,
  GitBranch,
  Globe,
  Layers,
  MessageSquare,
  Mic,
  Radio,
  Search,
  Shield,
  ShieldCheck,
  Smartphone,
  Timer,
  WifiOff,
  Zap,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Activity,
  BarChart3,
  BookMarked,
  BookOpen,
  Bot,
  Brain,
  ClipboardCheck,
  Cpu,
  FileText,
  Filter,
  FlaskConical,
  GitBranch,
  Globe,
  Layers,
  MessageSquare,
  Mic,
  Radio,
  Search,
  Shield,
  ShieldCheck,
  Smartphone,
  Timer,
  WifiOff,
  Zap,
};

export function ProjectFeatureIcon({
  name,
  size = 22,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const Icon = ICON_MAP[name] ?? Layers;
  return <Icon size={size} className={className} />;
}
