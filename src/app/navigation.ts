import {
  BookOpen,
  Briefcase,
  Gamepad2,
  LayoutDashboard,
  Library,
  MessagesSquare,
  UserRoundCheck,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  to: string;
  labelKey:
    | 'nav.dashboard'
    | 'nav.journal'
    | 'nav.toolkit'
    | 'nav.coaching'
    | 'nav.community'
    | 'nav.arcade'
    | 'nav.resources';
  icon: LucideIcon;
  /** Shown directly in the mobile bottom tab bar (others go under "More"). */
  mobileTab?: boolean;
  /** Match only the exact path (for the index route). */
  end?: boolean;
}

export const APP_NAV: readonly NavItem[] = [
  { to: '/app', labelKey: 'nav.dashboard', icon: LayoutDashboard, mobileTab: true, end: true },
  { to: '/app/journal', labelKey: 'nav.journal', icon: BookOpen, mobileTab: true },
  { to: '/app/community', labelKey: 'nav.community', icon: MessagesSquare, mobileTab: true },
  { to: '/app/arcade', labelKey: 'nav.arcade', icon: Gamepad2, mobileTab: true },
  { to: '/app/coaching', labelKey: 'nav.coaching', icon: UserRoundCheck },
  { to: '/app/toolkit', labelKey: 'nav.toolkit', icon: Briefcase },
  { to: '/app/resources', labelKey: 'nav.resources', icon: Library },
];
