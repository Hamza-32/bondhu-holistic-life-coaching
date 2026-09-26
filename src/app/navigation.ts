import {
  Activity,
  BookOpen,
  Briefcase,
  Gamepad2,
  LayoutDashboard,
  LifeBuoy,
  Settings,
  MessagesSquare,
  UserRoundCheck,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  to: string;
  labelKey:
    | 'nav.dashboard'
    | 'nav.mood'
    | 'nav.journal'
    | 'nav.toolkit'
    | 'nav.coaching'
    | 'nav.community'
    | 'nav.arcade'
    | 'nav.resources'
    | 'nav.settings';
  icon: LucideIcon;
  /** Shown directly in the mobile bottom tab bar (others go under "More"). */
  mobileTab?: boolean;
  /** Match only the exact path (for the index route). */
  end?: boolean;
}

export const APP_NAV: readonly NavItem[] = [
  { to: '/app', labelKey: 'nav.dashboard', icon: LayoutDashboard, mobileTab: true, end: true },
  { to: '/app/mood', labelKey: 'nav.mood', icon: Activity, mobileTab: true },
  { to: '/app/journal', labelKey: 'nav.journal', icon: BookOpen, mobileTab: true },
  { to: '/app/community', labelKey: 'nav.community', icon: MessagesSquare, mobileTab: true },
  { to: '/app/coaching', labelKey: 'nav.coaching', icon: UserRoundCheck },
  { to: '/app/arcade', labelKey: 'nav.arcade', icon: Gamepad2 },
  { to: '/app/toolkit', labelKey: 'nav.toolkit', icon: Briefcase },
  { to: '/app/resources', labelKey: 'nav.resources', icon: LifeBuoy },
  { to: '/app/settings', labelKey: 'nav.settings', icon: Settings },
];
