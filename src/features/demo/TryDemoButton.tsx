import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, PlayCircle } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { startDemo } from './api';

export function TryDemoButton({
  className,
  size = 'lg',
  variant = 'outline',
}: {
  className?: string;
  size?: 'default' | 'lg';
  variant?: 'outline' | 'secondary';
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);

  const onClick = async () => {
    setPending(true);
    try {
      await startDemo(queryClient);
      void navigate('/app', { replace: true });
    } catch {
      toast.error(t('demo.failed'));
      setPending(false);
    }
  };

  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      className={cn(className)}
      disabled={pending}
      onClick={() => void onClick()}
    >
      {pending ? <Loader2 className="animate-spin" aria-hidden /> : <PlayCircle aria-hidden />}
      {pending ? t('demo.starting') : t('demo.try')}
    </Button>
  );
}
