import { IconProps } from "@/components/Icon";
import { COLORS } from "@/theme/colors";
import { normalizeName } from "./format";
import { AccountType } from "@/screens/accounts/hooks/useAccountsData";

export const REFRESH_TOKEN_KEY = 'refresh_token';

// Backend seeds exactly these six names; map by full normalized name to avoid falling back.
export const CATEGORY_MAP: Record<string, { icon: IconProps['name']; color: string; label: string }> = {
    'dining': { icon: 'utensils', color: COLORS.accentGreen, label: 'Dining' },
    'transportation': { icon: 'car', color: COLORS.accentEmerald, label: 'Transit' },
    'medical equipment': { icon: 'stethoscope', color: COLORS.accentRose, label: 'Medical' },
    'continuing education': { icon: 'graduationCap', color: COLORS.accentBlue, label: 'Education' },
    'professional dues': { icon: 'briefcase', color: COLORS.accentPurple, label: 'Dues' },
    'other': { icon: 'grid', color: COLORS.accentSlate, label: 'Other' },
  }; 
  export const getCategoryVisual = (name: string): { icon: IconProps['name']; color: string; label: string } => {
    const key = normalizeName(name);
    return CATEGORY_MAP[key] ?? CATEGORY_MAP.other;
  };