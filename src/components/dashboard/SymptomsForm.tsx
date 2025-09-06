'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { db } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Loader2, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SymptomsForm() {
  const [symptoms, setSymptoms] = useState('');
  const [duration, setDuration] = useState('');
  const [pregnancyWeeks, setPregnancyWeeks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) {
      toast.error('Please describe your symptoms');
      return;
    }
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'symptoms'), {
        symptoms,
        duration,
        pregnancyWeeks,
        status: 'open',
        createdAt: serverTimestamp(),
      });
      toast.success('Submitted. A doctor will review shortly.');
      setSymptoms('');
      setDuration('');
      setPregnancyWeeks('');
    } catch (e) {
      toast.error('Failed to submit');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.form onSubmit={submit} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6 space-y-4 max-w-2xl mx-auto">
      <div>
        <label className="block text-sm font-medium mb-1">Symptoms</label>
        <textarea value={symptoms} onChange={(e) => setSymptoms(e.target.value)} rows={5} className="w-full border rounded p-2 text-sm" placeholder="e.g., severe abdominal pain, bleeding, headache..." />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Duration</label>
          <input value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full border rounded p-2 text-sm" placeholder="e.g., 2 hours" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Pregnancy weeks (optional)</label>
          <input value={pregnancyWeeks} onChange={(e) => setPregnancyWeeks(e.target.value)} className="w-full border rounded p-2 text-sm" placeholder="e.g., 28" />
        </div>
      </div>
      <button disabled={isSubmitting} className="btn btn-primary">
        {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</> : <><Send className="w-4 h-4 mr-2" /> Submit</>}
      </button>
    </motion.form>
  );
}


