import { Monitor, Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type Theme, useUiStore } from '@/stores/useUiStore';

const OPTIONS = [
  { value: 'light', icon: Sun },
  { value: 'dark', icon: Moon },
  { value: 'system', icon: Monitor },
] as const satisfies readonly { value: Theme; icon: typeof Sun }[];

function isTheme(value: string): value is Theme {
  return OPTIONS.some((o) => o.value === value);
}

export function ThemeToggle() {
  const { t } = useTranslation();
  const theme = useUiStore((s) => s.theme);
  const setTheme = useUiStore((s) => s.setTheme);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t('theme.label')} title={t('theme.label')}>
          <Sun className="scale-100 rotate-0 transition-transform dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute scale-0 rotate-90 transition-transform dark:scale-100 dark:rotate-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup
          value={theme}
          onValueChange={(value) => {
            if (isTheme(value)) setTheme(value);
          }}
        >
          {OPTIONS.map(({ value, icon: Icon }) => (
            <DropdownMenuRadioItem key={value} value={value}>
              <Icon aria-hidden />
              {t(`theme.${value}`)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
