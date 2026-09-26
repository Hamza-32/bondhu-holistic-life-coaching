import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Check, Download, Loader2, Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useResume, useSaveResume } from '../api';
import { resumeSchema, type Resume } from './schema';

const AUTOSAVE_MS = 1500;

function Field({ label, children, id }: { label: string; children: ReactNode; id: string }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

function Area(props: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      {...props}
      className="w-full resize-y rounded-md border border-input bg-background p-3 text-sm focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
    />
  );
}

/** Editor with debounced autosave to Supabase and an on-demand PDF export. */
function Editor({ initial, id }: { initial: Resume; id: string | null }) {
  const { t } = useTranslation();
  const save = useSaveResume();
  const [resume, setResume] = useState(initial);
  const [resumeId, setResumeId] = useState(id);
  const [skillsText, setSkillsText] = useState(initial.skills.join(', '));
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [exporting, setExporting] = useState(false);
  const first = useRef(true);
  const base = useId();
  const fid = (name: string) => `${base}-${name}`;

  const set = <K extends keyof Resume>(key: K, value: Resume[K]) =>
    setResume((r) => ({ ...r, [key]: value }));

  // Debounced autosave whenever the resume changes (skipping the initial load).
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const parsed = resumeSchema.safeParse(resume);
    if (!parsed.success) return;
    const timer = setTimeout(() => {
      setStatus('saving');
      save.mutate(
        { id: resumeId, data: parsed.data },
        {
          onSuccess: (saved) => {
            setResumeId(saved.id);
            setStatus('saved');
          },
          onError: () => setStatus('error'),
        },
      );
    }, AUTOSAVE_MS);
    return () => clearTimeout(timer);
    // `save` is stable enough for this purpose; re-running on it would loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resume]);

  const exportPdf = async () => {
    setExporting(true);
    try {
      const { downloadResumePdf } = await import('./ResumePdf');
      await downloadResumePdf(resumeSchema.parse(resume));
    } catch {
      toast.error(t('resume.exportFailed'));
    } finally {
      setExporting(false);
    }
  };

  const emailError = resume.email && !resumeSchema.shape.email.safeParse(resume.email).success;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-6 rounded-2xl border bg-card p-6 shadow-soft">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold">{t('resume.editor')}</h2>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground" aria-live="polite">
            {status === 'saving' && <Loader2 className="size-3.5 animate-spin" aria-hidden />}
            {status === 'saved' && <Check className="size-3.5 text-primary" aria-hidden />}
            {status !== 'idle' && t(`resume.status.${status}`)}
          </p>
        </div>

        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-muted-foreground uppercase">
            {t('resume.personal')}
          </legend>
          <Field id={fid('name')} label={t('resume.fields.fullName')}>
            <Input
              id={fid('name')}
              value={resume.fullName}
              maxLength={80}
              onChange={(e) => set('fullName', e.target.value)}
            />
          </Field>
          <Field id={fid('headline')} label={t('resume.fields.headline')}>
            <Input
              id={fid('headline')}
              value={resume.headline}
              maxLength={120}
              placeholder={t('resume.placeholders.headline')}
              onChange={(e) => set('headline', e.target.value)}
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field id={fid('email')} label={t('resume.fields.email')}>
              <Input
                id={fid('email')}
                type="email"
                value={resume.email}
                aria-invalid={emailError || undefined}
                onChange={(e) => set('email', e.target.value)}
              />
              {emailError && <p className="text-xs text-destructive">{t('resume.errors.email')}</p>}
            </Field>
            <Field id={fid('phone')} label={t('resume.fields.phone')}>
              <Input
                id={fid('phone')}
                type="tel"
                value={resume.phone}
                maxLength={30}
                onChange={(e) => set('phone', e.target.value)}
              />
            </Field>
          </div>
          <Field id={fid('location')} label={t('resume.fields.location')}>
            <Input
              id={fid('location')}
              value={resume.location}
              maxLength={80}
              onChange={(e) => set('location', e.target.value)}
            />
          </Field>
          <Field id={fid('summary')} label={t('resume.fields.summary')}>
            <Area
              id={fid('summary')}
              rows={4}
              maxLength={1200}
              value={resume.summary}
              onChange={(e) => set('summary', e.target.value)}
            />
          </Field>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-muted-foreground uppercase">
            {t('resume.experience')}
          </legend>
          {resume.experience.map((x, i) => (
            <div key={i} className="space-y-2 rounded-xl border p-3">
              <div className="grid gap-2 sm:grid-cols-2">
                <Input
                  aria-label={t('resume.fields.role')}
                  placeholder={t('resume.fields.role')}
                  value={x.role}
                  maxLength={120}
                  onChange={(e) =>
                    set(
                      'experience',
                      resume.experience.map((y, j) =>
                        j === i ? { ...y, role: e.target.value } : y,
                      ),
                    )
                  }
                />
                <Input
                  aria-label={t('resume.fields.organization')}
                  placeholder={t('resume.fields.organization')}
                  value={x.organization}
                  maxLength={120}
                  onChange={(e) =>
                    set(
                      'experience',
                      resume.experience.map((y, j) =>
                        j === i ? { ...y, organization: e.target.value } : y,
                      ),
                    )
                  }
                />
              </div>
              <Input
                aria-label={t('resume.fields.period')}
                placeholder={t('resume.placeholders.period')}
                value={x.period}
                maxLength={40}
                onChange={(e) =>
                  set(
                    'experience',
                    resume.experience.map((y, j) =>
                      j === i ? { ...y, period: e.target.value } : y,
                    ),
                  )
                }
              />
              <Area
                aria-label={t('resume.fields.description')}
                placeholder={t('resume.fields.description')}
                rows={2}
                maxLength={1000}
                value={x.description}
                onChange={(e) =>
                  set(
                    'experience',
                    resume.experience.map((y, j) =>
                      j === i ? { ...y, description: e.target.value } : y,
                    ),
                  )
                }
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  set(
                    'experience',
                    resume.experience.filter((_, j) => j !== i),
                  )
                }
              >
                <Trash2 aria-hidden />
                {t('common.remove')}
              </Button>
            </div>
          ))}
          {resume.experience.length < 8 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                set('experience', [
                  ...resume.experience,
                  { role: '', organization: '', period: '', description: '' },
                ])
              }
            >
              <Plus aria-hidden />
              {t('resume.addExperience')}
            </Button>
          )}
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-muted-foreground uppercase">
            {t('resume.education')}
          </legend>
          {resume.education.map((x, i) => (
            <div
              key={i}
              className="grid gap-2 rounded-xl border p-3 sm:grid-cols-[1fr_1fr_6rem_auto]"
            >
              <Input
                aria-label={t('resume.fields.degree')}
                placeholder={t('resume.fields.degree')}
                value={x.degree}
                maxLength={120}
                onChange={(e) =>
                  set(
                    'education',
                    resume.education.map((y, j) =>
                      j === i ? { ...y, degree: e.target.value } : y,
                    ),
                  )
                }
              />
              <Input
                aria-label={t('resume.fields.institution')}
                placeholder={t('resume.fields.institution')}
                value={x.institution}
                maxLength={120}
                onChange={(e) =>
                  set(
                    'education',
                    resume.education.map((y, j) =>
                      j === i ? { ...y, institution: e.target.value } : y,
                    ),
                  )
                }
              />
              <Input
                aria-label={t('resume.fields.year')}
                placeholder={t('resume.fields.year')}
                value={x.year}
                maxLength={20}
                onChange={(e) =>
                  set(
                    'education',
                    resume.education.map((y, j) => (j === i ? { ...y, year: e.target.value } : y)),
                  )
                }
              />
              <Button
                variant="ghost"
                size="icon"
                aria-label={t('common.remove')}
                onClick={() =>
                  set(
                    'education',
                    resume.education.filter((_, j) => j !== i),
                  )
                }
              >
                <Trash2 aria-hidden />
              </Button>
            </div>
          ))}
          {resume.education.length < 6 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                set('education', [...resume.education, { degree: '', institution: '', year: '' }])
              }
            >
              <Plus aria-hidden />
              {t('resume.addEducation')}
            </Button>
          )}
        </fieldset>

        <Field id={fid('skills')} label={t('resume.fields.skills')}>
          <Input
            id={fid('skills')}
            value={skillsText}
            placeholder={t('resume.placeholders.skills')}
            onChange={(e) => {
              setSkillsText(e.target.value);
              set(
                'skills',
                e.target.value
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean)
                  .slice(0, 30),
              );
            }}
          />
        </Field>

        <div className="border-t pt-4">
          <Button onClick={() => void exportPdf()} disabled={exporting}>
            {exporting ? (
              <Loader2 className="animate-spin" aria-hidden />
            ) : (
              <Download aria-hidden />
            )}
            {t('resume.downloadPdf')}
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">{t('resume.pdfNote')}</p>
        </div>
      </div>

      {/* Live preview (paper look in both themes) */}
      <div
        aria-label={t('resume.preview')}
        role="region"
        className="min-h-[36rem] rounded-2xl border bg-white p-8 text-slate-900 shadow-lifted"
      >
        <h2 className="text-2xl font-bold">{resume.fullName || t('resume.placeholders.name')}</h2>
        {resume.headline && <p className="font-medium text-[#006a4e]">{resume.headline}</p>}
        <p className="mt-1 text-sm text-slate-600">
          {[resume.email, resume.phone, resume.location].filter(Boolean).join(' · ')}
        </p>
        {resume.summary && <p className="mt-4 text-sm whitespace-pre-wrap">{resume.summary}</p>}
        {resume.experience.some((x) => x.role || x.organization) && (
          <section className="mt-5">
            <h3 className="border-b border-slate-200 pb-1 text-xs font-bold tracking-widest text-[#006a4e] uppercase">
              {t('resume.experience')}
            </h3>
            {resume.experience.map((x, i) => (
              <div key={i} className="mt-2 text-sm">
                <p className="flex justify-between gap-2 font-semibold">
                  <span>{[x.role, x.organization].filter(Boolean).join(', ')}</span>
                  <span className="font-normal text-slate-600">{x.period}</span>
                </p>
                {x.description && (
                  <p className="whitespace-pre-wrap text-slate-700">{x.description}</p>
                )}
              </div>
            ))}
          </section>
        )}
        {resume.education.some((x) => x.degree || x.institution) && (
          <section className="mt-5">
            <h3 className="border-b border-slate-200 pb-1 text-xs font-bold tracking-widest text-[#006a4e] uppercase">
              {t('resume.education')}
            </h3>
            {resume.education.map((x, i) => (
              <p key={i} className="mt-2 flex justify-between gap-2 text-sm">
                <span>
                  <span className="font-semibold">{x.degree}</span>
                  {x.institution && `, ${x.institution}`}
                </span>
                <span className="text-slate-600">{x.year}</span>
              </p>
            ))}
          </section>
        )}
        {resume.skills.length > 0 && (
          <section className="mt-5">
            <h3 className="border-b border-slate-200 pb-1 text-xs font-bold tracking-widest text-[#006a4e] uppercase">
              {t('resume.fields.skills')}
            </h3>
            <p className="mt-2 text-sm">{resume.skills.join(' · ')}</p>
          </section>
        )}
      </div>
    </div>
  );
}

export function ResumeBuilder() {
  const resume = useResume();
  const { t } = useTranslation();
  if (resume.isPending) return <Skeleton className="h-96" />;
  if (resume.isError) return <p className="text-destructive">{t('common.loadFailed')}</p>;
  return <Editor key={resume.data.id ?? 'new'} initial={resume.data.data} id={resume.data.id} />;
}
