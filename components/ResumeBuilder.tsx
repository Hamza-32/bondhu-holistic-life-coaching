import React, { useState, useRef } from 'react';
import { Download, FileText, User, Briefcase, GraduationCap } from 'lucide-react';
import { useBondhuStore } from '../store/useBondhuStore';

export const ResumeBuilder = () => {
    const { user } = useBondhuStore();
    const [formData, setFormData] = useState({
        name: user.name || '',
        email: '',
        phone: '',
        degree: '',
        school: '',
        experience: '',
        skills: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Editor */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 print:hidden">
                <div className="flex items-center gap-2 mb-6 text-slate-900">
                    <FileText className="text-bondhu-red" />
                    <h2 className="text-xl font-bold">Resume Editor</h2>
                </div>

                <div className="space-y-4">
                    <div className="space-y-4">
                        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-wider">
                            <User size={16} /> Personal Info
                        </h3>
                        <div className="grid grid-cols-1 gap-3">
                            <input name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} className="p-3 bg-slate-50 rounded-lg border border-slate-200 w-full" />
                            <input name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} className="p-3 bg-slate-50 rounded-lg border border-slate-200 w-full" />
                            <input name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} className="p-3 bg-slate-50 rounded-lg border border-slate-200 w-full" />
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-100">
                        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-wider">
                            <GraduationCap size={16} /> Education
                        </h3>
                        <div className="grid grid-cols-1 gap-3">
                            <input name="degree" placeholder="Degree / Major" value={formData.degree} onChange={handleChange} className="p-3 bg-slate-50 rounded-lg border border-slate-200 w-full" />
                            <input name="school" placeholder="University / College" value={formData.school} onChange={handleChange} className="p-3 bg-slate-50 rounded-lg border border-slate-200 w-full" />
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-100">
                        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-wider">
                            <Briefcase size={16} /> Experience & Skills
                        </h3>
                        <textarea name="experience" placeholder="Work Experience (Short summary)" value={formData.experience} onChange={handleChange} className="p-3 bg-slate-50 rounded-lg border border-slate-200 w-full h-24 resize-none" />
                        <textarea name="skills" placeholder="Skills (Comma separated)" value={formData.skills} onChange={handleChange} className="p-3 bg-slate-50 rounded-lg border border-slate-200 w-full h-24 resize-none" />
                    </div>

                    <button
                        onClick={handlePrint}
                        className="w-full mt-4 bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                    >
                        <Download size={18} /> Download / Print PDF
                    </button>
                    <p className="text-xs text-center text-slate-400 mt-2">Use browser print (Ctrl+P) to save as PDF</p>
                </div>
            </div>

            {/* Preview Sheet */}
            <div id="resume-preview" className="bg-white p-8 md:p-12 rounded-none md:rounded-2xl shadow-lg border border-slate-200 min-h-[800px] print:shadow-none print:border-none print:w-full print:absolute print:top-0 print:left-0 print:m-0 print:z-[1000]">
                <div className="text-center border-b-2 border-slate-900 pb-6 mb-6">
                    <h1 className="text-3xl font-serif font-bold text-slate-900 mb-2 uppercase tracking-wide">{formData.name || "Your Name"}</h1>
                    <div className="flex justify-center gap-4 text-sm text-slate-600">
                        {formData.email && <span>{formData.email}</span>}
                        {formData.phone && <span>• {formData.phone}</span>}
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Education */}
                    <div className="space-y-3">
                        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-1">Education</h2>
                        <div>
                            <p className="font-bold text-slate-800">{formData.degree || "Degree Name"}</p>
                            <p className="text-slate-600 italic">{formData.school || "University Name"}</p>
                        </div>
                    </div>

                    {/* Experience */}
                    <div className="space-y-3">
                        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-1">Experience</h2>
                        <div className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                            {formData.experience || "Your work experience will appear here. Describe your roles, responsibilities, and key achievements."}
                        </div>
                    </div>

                    {/* Skills */}
                    <div className="space-y-3">
                        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-1">Skills</h2>
                        <div className="flex flex-wrap gap-2 text-slate-700">
                            {formData.skills ? formData.skills.split(',').map((skill, i) => (
                                <span key={i} className="bg-slate-100 px-2 py-1 rounded text-sm print:bg-transparent print:p-0 print:mr-2 print:after:content-[','] print:last:after:content-['']">{skill.trim()}</span>
                            )) : (
                                <span className="text-slate-400 italic">List your skills...</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
