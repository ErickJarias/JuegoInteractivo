import React, { useState } from 'react';
import { UserData } from '../types';
import { Gamepad2, Play, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'motion/react';

interface LeadFormProps {
  onStart: (data: UserData) => void;
}

export default function LeadForm({ onStart }: LeadFormProps) {
  const [formData, setFormData] = useState<UserData>({
    name: '',
    whatsapp: '',
    city: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onStart(formData);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-stadium rounded-3xl shadow-2xl overflow-hidden border border-white/10 p-8">
      <div className="text-center mb-8">
        <div className="inline-flex p-4 bg-brand/10 rounded-2xl text-brand mb-4">
          <Gamepad2 size={40} />
        </div>
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">
          Futea<span className="text-brand">Play</span>
        </h1>
        <p className="text-gray-400 mt-2 font-medium">
          La liga definitiva de trivia de fútbol.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 ml-1">
            Nombre Completo *
          </label>
          <input
            required
            type="text"
            placeholder="Ej: Juan Pérez"
            className="w-full p-4 bg-white/5 border-2 border-white/10 rounded-xl focus:border-brand focus:ring-0 transition-all outline-none font-medium text-white"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 ml-1">
            WhatsApp (Opcional)
          </label>
          <input
            type="tel"
            placeholder="Ej: +57 300 123 4567"
            className="w-full p-4 bg-white/5 border-2 border-white/10 rounded-xl focus:border-brand focus:ring-0 transition-all outline-none font-medium text-white"
            value={formData.whatsapp}
            onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 ml-1">
            Ciudad (Opcional)
          </label>
          <input
            type="text"
            placeholder="Ej: Bogotá"
            className="w-full p-4 bg-white/5 border-2 border-white/10 rounded-xl focus:border-brand focus:ring-0 transition-all outline-none font-medium text-white"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          />
        </div>

        <div className="pt-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full bg-brand hover:bg-brand-dark text-stadium font-black py-5 rounded-2xl shadow-lg shadow-brand/20 flex items-center justify-center gap-2 uppercase tracking-wider transition-colors"
          >
            <Play size={20} fill="currentColor" />
            Saltar a la Cancha
          </motion.button>
        </div>

        <div className="flex items-center justify-center gap-2 mt-6 text-gray-400 text-xs font-medium">
          <ShieldCheck size={14} />
          <span>Tus datos están seguros con nosotros</span>
        </div>
      </form>
    </div>
  );
}
