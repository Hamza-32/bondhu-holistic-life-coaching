import React, { useState } from 'react';
import { useBondhuStore } from '../store/useBondhuStore';
import { Star, Clock, UserCheck } from 'lucide-react';
import { Coach } from '../types';

export const Coaching = () => {
  const { coaches, bookSession } = useBondhuStore();
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);

  const handleBookWithDetails = (phone: string, topic: string) => {
    if (selectedCoach) {
      bookSession(selectedCoach, "Tomorrow, 4:00 PM", phone, topic);
      setSelectedCoach(null);
    }
  };

  return (
    <div>
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Find Your Mentor</h1>
        <p className="text-slate-600 mt-2">Connect with verified experts for career, academics, and life.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coaches.map((coach) => (
          <div key={coach.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="h-24 bg-gradient-to-r from-slate-800 to-slate-700 relative">
              <div className="absolute -bottom-10 left-6">
                <img src={coach.image} alt={coach.name} className="w-20 h-20 rounded-full border-4 border-white object-cover" />
              </div>
            </div>
            <div className="pt-12 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{coach.name}</h3>
                  <p className="text-bondhu-red font-medium text-sm">{coach.specialty}</p>
                </div>
                <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded text-yellow-700 text-sm font-bold">
                  <Star size={14} className="fill-yellow-500 text-yellow-500" />
                  {coach.rating}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Rate per session</span>
                  <span className="font-bold text-lg text-slate-800">${coach.price}</span>
                </div>
                <button
                  onClick={() => setSelectedCoach(coach)}
                  className="bg-slate-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-800 transition-colors"
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Form Modal */}
      {selectedCoach && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold mb-4">Book a session with {selectedCoach.name}</h3>

            <div className="space-y-4 mb-6">
              {/* Time Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Select Time</label>
                <div className="space-y-2">
                  <div className="p-3 border rounded-lg hover:bg-slate-50 cursor-pointer flex items-center gap-3 border-bondhu-red bg-red-50">
                    <Clock className="text-bondhu-red" />
                    <div>
                      <div className="font-semibold text-slate-900">Tomorrow</div>
                      <div className="text-sm text-slate-600">4:00 PM - 5:00 PM</div>
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg hover:bg-slate-50 cursor-pointer flex items-center gap-3 opacity-60">
                    <Clock className="text-slate-400" />
                    <div>
                      <div className="font-semibold text-slate-700">Wednesday</div>
                      <div className="text-sm text-slate-500">10:00 AM - 11:00 AM</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Details Form */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  placeholder="01XXXXXXXXX"
                  className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-bondhu-red/20"
                  id="phone-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Topic / Concern <span className="text-red-500">*</span></label>
                <textarea
                  placeholder="Briefly describe what you want to discuss..."
                  className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-bondhu-red/20 h-24 resize-none"
                  id="topic-input"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2 border-t border-slate-100">
              <button onClick={() => setSelectedCoach(null)} className="flex-1 py-3 text-slate-600 font-medium hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
              <button
                onClick={() => {
                  const phone = (document.getElementById('phone-input') as HTMLInputElement).value;
                  const topic = (document.getElementById('topic-input') as HTMLTextAreaElement).value;

                  if (phone && topic) {
                    handleBookWithDetails(phone, topic);
                  } else {
                    alert("Please fill in all fields.");
                  }
                }}
                className="flex-1 py-3 bg-bondhu-red text-white rounded-xl font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-200"
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
