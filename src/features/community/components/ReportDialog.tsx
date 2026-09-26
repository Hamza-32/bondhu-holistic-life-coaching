import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { REPORT_REASONS, useReport, type ReportReason } from '../api';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
}

export function ReportDialog({ open, onOpenChange, postId }: Props) {
  const { t } = useTranslation();
  const report = useReport();
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');
  const detailsId = useId();

  const close = () => {
    setReason(null);
    setDetails('');
    onOpenChange(false);
  };

  const submit = () => {
    if (!reason) return;
    report.mutate(
      { post_id: postId, reason, details: details.trim() || null },
      {
        onSuccess: () => {
          toast.success(t('community.reportThanks'));
          close();
        },
        onError: () => toast.error(t('common.saveFailed')),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : close())}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('community.reportTitle')}</DialogTitle>
          <DialogDescription>{t('community.reportDescription')}</DialogDescription>
        </DialogHeader>
        <fieldset className="space-y-2">
          <legend className="sr-only">{t('community.reportTitle')}</legend>
          {REPORT_REASONS.map((r) => (
            <label
              key={r}
              className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm has-checked:border-primary has-checked:bg-secondary"
            >
              <input
                type="radio"
                name="reason"
                checked={reason === r}
                onChange={() => setReason(r)}
                className="accent-[var(--primary)]"
              />
              {t(`community.reasons.${r}`)}
            </label>
          ))}
        </fieldset>
        {reason === 'self_harm' && (
          <p className="rounded-lg bg-coral-soft p-3 text-sm">
            {t('community.selfHarmNote')}{' '}
            <a href="tel:999" className="font-semibold text-coral underline">
              999
            </a>
          </p>
        )}
        <div className="space-y-2">
          <label htmlFor={detailsId} className="text-sm font-medium">
            {t('community.reportDetails')}
          </label>
          <textarea
            id={detailsId}
            value={details}
            maxLength={500}
            rows={2}
            onChange={(e) => setDetails(e.target.value)}
            className="w-full resize-none rounded-lg border border-input bg-background p-3 text-sm focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={close}>
            {t('common.cancel')}
          </Button>
          <Button onClick={submit} disabled={!reason || report.isPending}>
            {t('community.submitReport')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
