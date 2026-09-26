import { Briefcase, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CareerQuiz } from './quiz/CareerQuiz';
import { ResumeBuilder } from './resume/ResumeBuilder';

export function ToolkitPage() {
  const { t } = useTranslation();
  return (
    <div>
      <PageHeader title={t('toolkit.title')} subtitle={t('toolkit.subtitle')} />
      <Tabs defaultValue="resume">
        <TabsList className="mb-6">
          <TabsTrigger value="resume">
            <FileText aria-hidden />
            {t('pages.toolkit.resume')}
          </TabsTrigger>
          <TabsTrigger value="quiz">
            <Briefcase aria-hidden />
            {t('pages.toolkit.quiz')}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="resume">
          <ResumeBuilder />
        </TabsContent>
        <TabsContent value="quiz">
          <div className="mx-auto max-w-2xl">
            <CareerQuiz />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ToolkitPage;
