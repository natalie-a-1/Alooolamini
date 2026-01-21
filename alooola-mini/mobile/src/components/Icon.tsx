/**
 * Icon system aligned with the Figma web reference (Lucide icons).
 */
import React from 'react';
import type { SvgProps } from 'react-native-svg';
import {
  AlertCircle,
  ArrowUpRight,
  Bell,
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  Copy,
  CreditCard,
  Crosshair,
  DollarSign,
  Film,
  Gift,
  GraduationCap,
  Grid3x3,
  Heart,
  HelpCircle,
  Home,
  Info,
  Lock,
  Mail,
  MessageCircle,
  MoreHorizontal,
  Package,
  PieChart,
  PiggyBank,
  Plus,
  Search,
  Send,
  Settings,
  Shield,
  ShoppingBag,
  ShoppingCart,
  Stethoscope,
  Target,
  TrendingDown,
  TrendingUp,
  User,
  Users,
  UtensilsCrossed,
  Wallet,
  Car,
  X,
  Zap,
} from 'lucide-react-native';

import { COLORS } from '../theme/colors';

type IconComponent = React.ComponentType<SvgProps & { size?: number }>;

const ICONS = {
  alert: AlertCircle,
  arrowUpRight: ArrowUpRight,
  bell: Bell,
  book: BookOpen,
  briefcase: Briefcase,
  building: Building2,
  calendar: Calendar,
  car: Car,
  check: Check,
  checkCircle: CheckCircle2,
  chevronRight: ChevronRight,
  copy: Copy,
  creditCard: CreditCard,
  crosshair: Crosshair,
  dollar: DollarSign,
  dollarSign: DollarSign,
  film: Film,
  gift: Gift,
  graduationCap: GraduationCap,
  grid: Grid3x3,
  heart: Heart,
  helpCircle: HelpCircle,
  home: Home,
  info: Info,
  lock: Lock,
  mail: Mail,
  message: MessageCircle,
  messageCircle: MessageCircle,
  moreHorizontal: MoreHorizontal,
  package: Package,
  pieChart: PieChart,
  piggyBank: PiggyBank,
  plus: Plus,
  search: Search,
  send: Send,
  settings: Settings,
  shield: Shield,
  shoppingBag: ShoppingBag,
  shoppingCart: ShoppingCart,
  stethoscope: Stethoscope,
  target: Target,
  trendingDown: TrendingDown,
  trendingUp: TrendingUp,
  user: User,
  users: Users,
  utensils: UtensilsCrossed,
  wallet: Wallet,
  x: X,
  zap: Zap,
} as const satisfies Record<string, IconComponent>;

export interface IconProps {
  name: keyof typeof ICONS | string;
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: SvgProps['style'];
}

/** React Native component for a lightweight icon. */
export function Icon({ name, size = 16, color = COLORS.ink, strokeWidth = 2, style }: IconProps) {
  const LucideIcon = (ICONS as Record<string, IconComponent>)[name] ?? Circle;
  return <LucideIcon size={size} color={color} strokeWidth={strokeWidth} style={style} />;
}
