import { useState, type ChangeEvent } from 'react';
import { Download, FileText, User, Briefcase, GraduationCap } from 'lucide-react';
import { useBondhuStore } from '@/stores/useBondhuStore';

export const ResumeBuilder = () => {
  const { user } = useBondhuStore();
  const [formData, setFormData] = useState({
    name: user.name,
    email: '',
    phone: '',
    degree: '',
    school: '',
    experience: '',
    skills: '',
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      {/* Editor */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm print:hidden">
        <div className="mb-6 flex items-center gap-2 text-foreground">
          <FileText className="text-primary" />
          <h2 className="text-xl font-bold">Resume Editor</h2>
        </div>

        <div className="space-y-4">
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-bold tracking-wider text-muted-foreground uppercase">
              <User size={16} /> Personal Info
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <input
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-lg border border-border bg-muted p-3"
              />
              <input
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-lg border border-border bg-muted p-3"
              />
              <input
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                className="w-full rounded-lg border border-border bg-muted p-3"
              />
            </div>
          </div>

          <div className="space-y-4 border-t border-border pt-4">
            <h3 className="flex items-center gap-2 text-sm font-bold tracking-wider text-muted-foreground uppercase">
              <GraduationCap size={16} /> Education
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <input
                name="degree"
                placeholder="Degree / Major"
                value={formData.degree}
                onChange={handleChange}
                className="w-full rounded-lg border border-border bg-muted p-3"
              />
              <input
                name="school"
                placeholder="University / College"
                value={formData.school}
                onChange={handleChange}
                className="w-full rounded-lg border border-border bg-muted p-3"
              />
            </div>
          </div>

          <div className="space-y-4 border-t border-border pt-4">
            <h3 className="flex items-center gap-2 text-sm font-bold tracking-wider text-muted-foreground uppercase">
              <Briefcase size={16} /> Experience & Skills
            </h3>
            <textarea
              name="experience"
              placeholder="Work Experience (Short summary)"
              value={formData.experience}
              onChange={handleChange}
              className="h-24 w-full resize-none rounded-lg border border-border bg-muted p-3"
            />
            <textarea
              name="skills"
              placeholder="Skills (Comma separated)"
              value={formData.skills}
              onChange={handleChange}
              className="h-24 w-full resize-none rounded-lg border border-border bg-muted p-3"
            />
          </div>

          <button
            onClick={handlePrint}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-foreground py-3 font-bold text-background transition-colors hover:bg-foreground/90"
          >
            <Download size={18} /> Download / Print PDF
          </button>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Use browser print (Ctrl+P) to save as PDF
          </p>
        </div>
      </div>

      {/* Preview Sheet */}
      <div
        id="resume-preview"
        className="min-h-[800px] rounded-none border border-slate-200 bg-white p-8 shadow-lg md:rounded-2xl md:p-12 print:absolute print:top-0 print:left-0 print:z-[1000] print:m-0 print:w-full print:border-none print:shadow-none"
      >
        <div className="mb-6 border-b-2 border-slate-900 pb-6 text-center">
          <h1 className="mb-2 font-serif text-3xl font-bold tracking-wide text-slate-900 uppercase">
            {formData.name || 'Your Name'}
          </h1>
          <div className="flex justify-center gap-4 text-sm text-slate-600">
            {formData.email && <span>{formData.email}</span>}
            {formData.phone && <span>• {formData.phone}</span>}
          </div>
        </div>

        <div className="space-y-8">
          {/* Education */}
          <div className="space-y-3">
            <h2 className="border-b border-slate-200 pb-1 text-sm font-bold tracking-widest text-slate-900 uppercase">
              Education
            </h2>
            <div>
              <p className="font-bold text-slate-900">{formData.degree || 'Degree Name'}</p>
              <p className="text-slate-600 italic">{formData.school || 'University Name'}</p>
            </div>
          </div>

          {/* Experience */}
          <div className="space-y-3">
            <h2 className="border-b border-slate-200 pb-1 text-sm font-bold tracking-widest text-slate-900 uppercase">
              Experience
            </h2>
            <div className="leading-relaxed whitespace-pre-wrap text-slate-900">
              {formData.experience ||
                'Your work experience will appear here. Describe your roles, responsibilities, and key achievements.'}
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-3">
            <h2 className="border-b border-slate-200 pb-1 text-sm font-bold tracking-widest text-slate-900 uppercase">
              Skills
            </h2>
            <div className="flex flex-wrap gap-2 text-slate-900">
              {formData.skills ? (
                formData.skills.split(',').map((skill, i) => (
                  <span
                    key={i}
                    className="rounded bg-slate-100 px-2 py-1 text-sm print:mr-2 print:bg-transparent print:p-0 print:after:content-[','] print:last:after:content-['']"
                  >
                    {skill.trim()}
                  </span>
                ))
              ) : (
                <span className="text-slate-500 italic">List your skills...</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
