import { useEffect, useId, useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Check, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { FormAlert, TextField } from '@/features/auth/components/FormBits';
import { useErrorText } from '@/features/auth/useErrorText';
import { useProfile, useUpdateProfile } from '@/features/profile/api';
import { useDivisions, useUniversities } from '@/features/reference/api';
import { currentLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { generateAlias } from './alias';
import { GOALS, onboardingSchema, STEP_FIELDS, STEP_KEYS, type OnboardingValues } from './schema';

const UNIQUE_VIOLATION = '23505';

function isUniqueViolation(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === UNIQUE_VIOLATION
  );
}

const selectClass =
  'h-11 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none';

export function OnboardingPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const profile = useProfile();
  const updateProfile = useUpdateProfile();
  const divisions = useDivisions();
  const universities = useUniversities();
  const errorText = useErrorText();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [step, setStep] = useState(0);
  const [saveFailed, setSaveFailed] = useState(false);
  const ids = { division: useId(), university: useId(), language: useId() };

  const form = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      displayName: profile.data?.display_name ?? '',
      locale: currentLanguage(),
      anonymousAlias: profile.data?.anonymous_alias ?? generateAlias(),
      division: profile.data?.division ?? null,
      universityId: profile.data?.university_id ?? null,
      goals: [],
    },
  });
  const { errors } = form.formState;
  const division = useWatch({ control: form.control, name: 'division' });
  const universityId = useWatch({ control: form.control, name: 'universityId' });
  const stepKey = STEP_KEYS[step] ?? 'name';
  const isLast = step === STEP_KEYS.length - 1;

  // Move focus to the new step's heading so screen readers announce it.
  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  const universityOptions = (universities.data ?? []).filter(
    (u) => !division || !u.division_slug || u.division_slug === division,
  );

  const save = form.handleSubmit(async (values) => {
    setSaveFailed(false);
    try {
      await updateProfile.mutateAsync({
        display_name: values.displayName,
        anonymous_alias: values.anonymousAlias,
        locale: values.locale,
        division: values.division,
        university_id: values.universityId,
        goals: values.goals,
        onboarding_done: true,
      });
      toast.success(t('onboarding.welcome'));
      void navigate('/app', { replace: true });
    } catch (error) {
      if (isUniqueViolation(error)) {
        form.setError('anonymousAlias', { message: 'onboarding.steps.alias.taken' });
        setStep(1);
      } else {
        setSaveFailed(true);
      }
    }
  });

  const next = async () => {
    const fields = STEP_FIELDS[step] ?? [];
    if (!(await form.trigger(fields))) return;
    if (isLast) void save();
    else setStep((s) => s + 1);
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex h-16 items-center justify-between px-4 sm:px-8">
        <Logo to="/" />
        <div className="flex items-center gap-1">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </header>

      <main
        id="main"
        tabIndex={-1}
        className="flex flex-1 items-start justify-center px-4 py-8 outline-none sm:items-center"
      >
        <div className="w-full max-w-lg">
          <p className="text-sm font-medium text-muted-foreground">
            {t('onboarding.stepOf', { step: step + 1, total: STEP_KEYS.length })}
          </p>
          <div
            className="mt-3 flex gap-2"
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={STEP_KEYS.length}
            aria-valuenow={step + 1}
            aria-label={t('onboarding.title')}
          >
            {STEP_KEYS.map((key, i) => (
              <div
                key={key}
                className={cn(
                  'h-1.5 flex-1 rounded-full transition-colors',
                  i <= step ? 'bg-primary' : 'bg-muted',
                )}
              />
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void next();
            }}
            noValidate
            className="mt-8 rounded-3xl border bg-card p-6 shadow-lifted sm:p-8"
          >
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
            >
              <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-bold outline-none">
                {t(`onboarding.steps.${stepKey}.title`)}
              </h1>
              <p className="mt-2 text-muted-foreground">
                {t(`onboarding.steps.${stepKey}.subtitle`)}
              </p>

              <div className="mt-8 space-y-6">
                {step === 0 && (
                  <>
                    <TextField
                      label={t('auth.fields.displayName')}
                      autoComplete="given-name"
                      maxLength={50}
                      placeholder={t('auth.placeholders.displayName')}
                      error={errors.displayName?.message}
                      {...form.register('displayName')}
                    />
                    <fieldset>
                      <legend className="text-sm font-medium">
                        {t('onboarding.steps.name.languageLabel')}
                      </legend>
                      <Controller
                        control={form.control}
                        name="locale"
                        render={({ field }) => (
                          <div className="mt-2 grid grid-cols-2 gap-3">
                            {(['en', 'bn'] as const).map((lng) => (
                              <label
                                key={lng}
                                className={cn(
                                  'flex cursor-pointer items-center justify-center rounded-xl border px-4 py-3 font-medium transition-colors has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50',
                                  field.value === lng
                                    ? 'border-primary bg-secondary text-primary'
                                    : 'hover:bg-muted',
                                )}
                              >
                                <input
                                  type="radio"
                                  name={field.name}
                                  value={lng}
                                  checked={field.value === lng}
                                  onChange={() => {
                                    field.onChange(lng);
                                    void i18n.changeLanguage(lng);
                                  }}
                                  className="sr-only"
                                />
                                <span lang={lng}>{t(`language.${lng}`)}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      />
                    </fieldset>
                  </>
                )}

                {step === 1 && (
                  <div className="space-y-3">
                    <TextField
                      label={t('onboarding.steps.alias.label')}
                      maxLength={40}
                      hint={t('onboarding.steps.alias.hint')}
                      error={errors.anonymousAlias?.message}
                      {...form.register('anonymousAlias')}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        form.setValue('anonymousAlias', generateAlias(), { shouldValidate: true });
                      }}
                    >
                      <RefreshCw aria-hidden />
                      {t('onboarding.steps.alias.regenerate')}
                    </Button>
                  </div>
                )}

                {step === 2 && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor={ids.division}>{t('onboarding.steps.place.division')}</Label>
                      <select
                        id={ids.division}
                        className={selectClass}
                        value={division ?? ''}
                        onChange={(e) => {
                          form.setValue('division', e.target.value || null);
                          form.setValue('universityId', null);
                        }}
                      >
                        <option value="">{t('onboarding.steps.place.none')}</option>
                        {(divisions.data ?? []).map((d) => (
                          <option key={d.slug} value={d.slug}>
                            {i18n.resolvedLanguage === 'bn' ? d.name_bn : d.name_en}
                          </option>
                        ))}
                      </select>
                    </div>

                    {universityOptions.length > 0 && (
                      <div className="space-y-2">
                        <Label htmlFor={ids.university}>
                          {t('onboarding.steps.place.university')}
                        </Label>
                        <select
                          id={ids.university}
                          className={selectClass}
                          value={universityId ?? ''}
                          onChange={(e) => form.setValue('universityId', e.target.value || null)}
                        >
                          <option value="">{t('onboarding.steps.place.none')}</option>
                          {universityOptions.map((u) => (
                            <option key={u.id} value={u.id}>
                              {i18n.resolvedLanguage === 'bn' && u.name_bn ? u.name_bn : u.name_en}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </>
                )}

                {step === 3 && (
                  <Controller
                    control={form.control}
                    name="goals"
                    render={({ field }) => (
                      <fieldset>
                        <legend className="sr-only">{t('onboarding.steps.goals.title')}</legend>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {GOALS.map((goal) => {
                            const checked = field.value.includes(goal);
                            return (
                              <label
                                key={goal}
                                className={cn(
                                  'flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition-colors has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50',
                                  checked
                                    ? 'border-primary bg-secondary text-primary'
                                    : 'hover:bg-muted',
                                )}
                              >
                                <input
                                  type="checkbox"
                                  className="sr-only"
                                  checked={checked}
                                  onChange={() =>
                                    field.onChange(
                                      checked
                                        ? field.value.filter((g) => g !== goal)
                                        : [...field.value, goal],
                                    )
                                  }
                                />
                                <span
                                  aria-hidden
                                  className={cn(
                                    'flex size-5 shrink-0 items-center justify-center rounded-md border',
                                    checked && 'border-primary bg-primary text-primary-foreground',
                                  )}
                                >
                                  {checked && <Check className="size-3.5" />}
                                </span>
                                {t(`onboarding.steps.goals.options.${goal}`)}
                              </label>
                            );
                          })}
                        </div>
                        {errors.goals?.message && (
                          <p className="mt-2 text-sm text-destructive">
                            {errorText(errors.goals.message)}
                          </p>
                        )}
                      </fieldset>
                    )}
                  />
                )}
              </div>
            </motion.div>

            {saveFailed && (
              <div className="mt-6">
                <FormAlert messageKey="onboarding.errors.save" />
              </div>
            )}

            <div className="mt-8 flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                className={cn(step === 0 && 'invisible')}
              >
                <ArrowLeft aria-hidden />
                {t('onboarding.back')}
              </Button>
              <Button type="submit" className="h-11 min-w-32" disabled={updateProfile.isPending}>
                {updateProfile.isPending
                  ? t('onboarding.saving')
                  : isLast
                    ? t('onboarding.finish')
                    : t('onboarding.next')}
                {!updateProfile.isPending && <ArrowRight aria-hidden />}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default OnboardingPage;
