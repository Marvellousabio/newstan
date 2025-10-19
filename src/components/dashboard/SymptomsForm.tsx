'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { db } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Loader2, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SymptomsForm() {
  const [form, setForm] = useState({
    symptoms: '',
    duration: '',
    pregnancyWeeks: '',
    additionalNotes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!symptoms.trim()) {
    toast.error('Please describe your symptoms');
    return;
  }
  setIsSubmitting(true);
  try {
    const res = await fetch('http://localhost:3001/api/symptoms/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        symptoms,
        duration,
        pregnancyWeeks,
        // Optionally add patientId if logged in
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Submission failed');

    toast.success(data.message || 'Submitted successfully');
    setSymptoms('');
    setDuration('');
    setPregnancyWeeks('');
  } catch (err: any) {
    toast.error(err.message || 'Failed to submit');
  } finally {
    setIsSubmitting(false);
  }
};
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto p-6 sm:p-8 bg-white shadow-md rounded-2xl border border-gray-200"
    >
      {/* Header */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Maternal Symptom Report</h2>
        <p className="text-sm text-gray-500 mt-1">
          Please fill this form carefully. A doctor will review your information shortly.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={submit} className="space-y-6">
        {/* Symptoms */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Describe Your Symptoms <span className="text-red-500">*</span>
          </label>
          <textarea
            name="symptoms"
            value={form.symptoms}
            onChange={handleChange}
            rows={5}
            className="w-full border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 rounded-lg p-3 text-sm resize-none"
            placeholder="e.g., severe abdominal pain, dizziness, bleeding, or headache"
          />
        </div>

        {/* Duration and Pregnancy Weeks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Duration of Symptoms
            </label>
            <input
              type="text"
              name="duration"
              value={form.duration}
              onChange={handleChange}
              className="w-full border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 rounded-lg p-3 text-sm"
              placeholder="e.g., 2 hours, 3 days"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Weeks of Pregnancy (optional)
            </label>
            <input
              type="number"
              name="pregnancyWeeks"
              value={form.pregnancyWeeks}
              onChange={handleChange}
              className="w-full border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 rounded-lg p-3 text-sm"
              placeholder="e.g., 28"
            />
          </div>
        </div>

        {/* Additional Notes */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Additional Notes or Observations
          </label>
          <textarea
            name="additionalNotes"
            value={form.additionalNotes}
            onChange={handleChange}
            rows={3}
            className="w-full border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 rounded-lg p-3 text-sm resize-none"
            placeholder="e.g., Any medications taken, previous issues, or allergies"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-center pt-2">
          <button
            disabled={isSubmitting}
            type="submit"
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition-colors 
              ${isSubmitting ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Submit Report
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
