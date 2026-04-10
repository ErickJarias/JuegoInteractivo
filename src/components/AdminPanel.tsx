import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Question } from '../types';
import { QUESTIONS as DEFAULT_QUESTIONS } from '../questions';
import { Save, Plus, Trash2, X, Settings, Image as ImageIcon, ShoppingBag } from 'lucide-react';

interface AdminPanelProps {
  onClose: () => void;
}

export default function AdminPanel({ onClose }: AdminPanelProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [adContent, setAdContent] = useState({
    text: 'Espacio disponible para patrocinadores',
    image: ''
  });
  const [jerseyImage, setJerseyImage] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    text: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    difficulty: 1
  });

  useEffect(() => {
    const savedQuestions = localStorage.getItem('futea_custom_questions');
    if (savedQuestions) {
      setQuestions(JSON.parse(savedQuestions));
    } else {
      setQuestions(DEFAULT_QUESTIONS);
    }

    const savedAd = localStorage.getItem('futea_ad_content');
    if (savedAd) {
      setAdContent(JSON.parse(savedAd));
    }

    const savedJersey = localStorage.getItem('futea_jersey_image');
    if (savedJersey) {
      setJerseyImage(savedJersey);
    }
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (base64: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit for localStorage
        alert('La imagen es demasiado grande. Por favor usa una menor a 1MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        callback(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveAll = (updatedQuestions: Question[]) => {
    setQuestions(updatedQuestions);
    localStorage.setItem('futea_custom_questions', JSON.stringify(updatedQuestions));
  };

  const handleAddQuestion = () => {
    if (!newQuestion.text || !newQuestion.correctAnswer) return;
    
    const questionToAdd: Question = {
      id: Date.now(),
      text: newQuestion.text!,
      options: newQuestion.options as string[],
      correctAnswer: newQuestion.correctAnswer!,
      difficulty: newQuestion.difficulty as 1 | 2 | 3,
      image: newQuestion.image
    };

    const updated = [questionToAdd, ...questions];
    saveAll(updated);
    setNewQuestion({
      text: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      difficulty: 1
    });
  };

  const handleDelete = (id: number) => {
    const updated = questions.filter(q => q.id !== id);
    saveAll(updated);
  };

  const saveAd = () => {
    localStorage.setItem('futea_ad_content', JSON.stringify(adContent));
    alert('Publicidad actualizada correctamente');
  };

  const saveJersey = () => {
    localStorage.setItem('futea_jersey_image', jerseyImage);
    alert('Imagen de la camiseta actualizada correctamente');
  };

  return (
    <div className="fixed inset-0 z-50 bg-stadium/95 backdrop-blur-md overflow-y-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <Settings className="text-brand" size={32} />
            <h2 className="text-3xl font-black uppercase italic">Panel de <span className="text-brand">Control</span></h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Ad Management */}
        <section className="mb-8 bg-white/5 p-6 rounded-2xl border border-white/10">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <ImageIcon size={20} className="text-brand" />
            Gestión de Publicidad
          </h3>
          <div className="grid gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Texto del Anuncio</label>
              <input 
                type="text" 
                className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none focus:border-brand"
                value={adContent.text}
                onChange={e => setAdContent({...adContent, text: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Imagen del Anuncio</label>
              <div className="flex flex-col md:flex-row gap-4 items-start">
                <div className="flex-1 w-full">
                  <input 
                    type="text" 
                    className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none focus:border-brand mb-2"
                    placeholder="URL de Imagen..."
                    value={adContent.image}
                    onChange={e => setAdContent({...adContent, image: e.target.value})}
                  />
                  <div className="relative">
                    <input 
                      type="file" 
                      accept="image/*"
                      className="hidden"
                      id="ad-file-upload"
                      onChange={e => handleFileUpload(e, (base64) => setAdContent({...adContent, image: base64}))}
                    />
                    <label 
                      htmlFor="ad-file-upload"
                      className="w-full bg-white/10 border border-white/10 p-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:bg-white/20 transition-colors text-sm font-bold"
                    >
                      <Plus size={16} />
                      Subir Archivo (JPEG/PNG)
                    </label>
                  </div>
                </div>
                {adContent.image && (
                  <div className="relative group">
                    <img src={adContent.image} alt="Preview" className="h-24 w-40 object-cover rounded-xl border border-white/10" />
                    <button 
                      onClick={() => setAdContent({...adContent, image: ''})}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>
            <button 
              onClick={saveAd}
              className="bg-brand text-stadium font-black py-3 px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-brand-dark transition-colors"
            >
              <Save size={18} />
              Guardar Publicidad
            </button>
          </div>
        </section>

        {/* Jersey Management */}
        <section className="mb-12 bg-white/5 p-6 rounded-2xl border border-white/10">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <ShoppingBag size={20} className="text-brand" />
            Gestión de Camiseta
          </h3>
          <div className="grid gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Imagen de la Camiseta</label>
              <div className="flex flex-col md:flex-row gap-4 items-start">
                <div className="flex-1 w-full">
                  <input 
                    type="text" 
                    className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none focus:border-brand mb-2"
                    placeholder="URL de Imagen..."
                    value={jerseyImage}
                    onChange={e => setJerseyImage(e.target.value)}
                  />
                  <div className="relative">
                    <input 
                      type="file" 
                      accept="image/*"
                      className="hidden"
                      id="jersey-file-upload"
                      onChange={e => handleFileUpload(e, (base64) => setJerseyImage(base64))}
                    />
                    <label 
                      htmlFor="jersey-file-upload"
                      className="w-full bg-white/10 border border-white/10 p-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:bg-white/20 transition-colors text-sm font-bold"
                    >
                      <Plus size={16} />
                      Subir Foto de Camiseta
                    </label>
                  </div>
                </div>
                {jerseyImage && (
                  <div className="relative group">
                    <img src={jerseyImage} alt="Jersey Preview" className="h-32 w-32 object-contain bg-white/10 rounded-xl border border-white/10" />
                    <button 
                      onClick={() => setJerseyImage('')}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>
            <button 
              onClick={saveJersey}
              className="bg-brand text-stadium font-black py-3 px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-brand-dark transition-colors"
            >
              <Save size={18} />
              Guardar Camiseta
            </button>
          </div>
        </section>

        {/* Question Management */}
        <section>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Plus size={20} className="text-brand" />
            Agregar Nueva Pregunta
          </h3>
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10 mb-8 grid gap-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Pregunta</label>
                <input 
                  type="text" 
                  className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none focus:border-brand"
                  value={newQuestion.text}
                  onChange={e => setNewQuestion({...newQuestion, text: e.target.value})}
                />
              </div>
              {newQuestion.options?.map((opt, i) => (
                <div key={i}>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Opción {i + 1}</label>
                  <input 
                    type="text" 
                    className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none focus:border-brand"
                    value={opt}
                    onChange={e => {
                      const opts = [...newQuestion.options!];
                      opts[i] = e.target.value;
                      setNewQuestion({...newQuestion, options: opts});
                    }}
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Respuesta Correcta</label>
                <select 
                  className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none focus:border-brand"
                  value={newQuestion.correctAnswer}
                  onChange={e => setNewQuestion({...newQuestion, correctAnswer: e.target.value})}
                >
                  <option value="">Seleccionar...</option>
                  {newQuestion.options?.map((opt, i) => (
                    <option key={i} value={opt}>{opt || `Opción ${i+1}`}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Dificultad</label>
                <select 
                  className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none focus:border-brand"
                  value={newQuestion.difficulty}
                  onChange={e => setNewQuestion({...newQuestion, difficulty: parseInt(e.target.value) as 1|2|3})}
                >
                  <option value={1}>Nivel 1 (Básico)</option>
                  <option value={2}>Nivel 2 (Intermedio)</option>
                  <option value={3}>Nivel 3 (Avanzado)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Imagen de la Pregunta</label>
                <div className="flex gap-4 items-start">
                  <div className="flex-1">
                    <input 
                      type="text" 
                      className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none focus:border-brand mb-2"
                      placeholder="URL o sube archivo..."
                      value={newQuestion.image || ''}
                      onChange={e => setNewQuestion({...newQuestion, image: e.target.value})}
                    />
                    <input 
                      type="file" 
                      accept="image/*"
                      className="hidden"
                      id="q-file-upload"
                      onChange={e => handleFileUpload(e, (base64) => setNewQuestion({...newQuestion, image: base64}))}
                    />
                    <label 
                      htmlFor="q-file-upload"
                      className="w-full bg-white/10 border border-white/10 p-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:bg-white/20 transition-colors text-sm font-bold"
                    >
                      <Plus size={16} />
                      Subir Archivo
                    </label>
                  </div>
                  {newQuestion.image && (
                    <div className="relative group">
                      <img src={newQuestion.image} alt="Preview" className="h-20 w-20 object-cover rounded-xl border border-white/10" />
                      <button 
                        onClick={() => setNewQuestion({...newQuestion, image: ''})}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button 
              onClick={handleAddQuestion}
              className="bg-brand text-stadium font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-brand-dark transition-colors"
            >
              <Plus size={20} />
              Añadir Pregunta al Banco
            </button>
          </div>

          <h3 className="text-xl font-bold mb-4">Banco de Preguntas ({questions.length})</h3>
          <div className="space-y-3">
            {questions.map(q => (
              <div key={q.id} className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      q.difficulty === 1 ? 'bg-green-500/20 text-green-400' :
                      q.difficulty === 2 ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      Nivel {q.difficulty}
                    </span>
                    <span className="text-xs text-gray-500">ID: {q.id}</span>
                  </div>
                  <p className="font-medium truncate">{q.text}</p>
                </div>
                <button 
                  onClick={() => handleDelete(q.id)}
                  className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
