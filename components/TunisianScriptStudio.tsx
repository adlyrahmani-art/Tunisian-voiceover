/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Voice } from '../types';
import { GoogleGenAI, Modality } from '../genaiProxy';
import { processAudioResponse } from '../utils/audioHelper';
import AudioVisualizer from './AudioVisualizer';
import { 
  X, 
  Play, 
  Square, 
  Loader2, 
  Sparkles, 
  Download, 
  Wand2, 
  RotateCcw, 
  Volume2, 
  Copy, 
  Check, 
  Radio, 
  Mic2, 
  Headphones, 
  BookOpen, 
  Smile, 
  Flame,
  Languages,
  Sliders,
  ChevronDown
} from 'lucide-react';

interface TunisianScriptStudioProps {
  voices: Voice[];
  initialVoiceName?: string;
  onClose: () => void;
}

interface ScriptPreset {
  id: string;
  title: string;
  titleAr: string;
  icon: any;
  category: string;
  suggestedVoice: string;
  suggestedStyle: string;
  text: string;
}

const TUNISIAN_PRESETS: ScriptPreset[] = [
  {
    id: 'commercial',
    title: 'Radio Ad / Promo',
    titleAr: 'إشهار ترويجي',
    icon: Radio,
    category: 'إشهار',
    suggestedVoice: 'Puck',
    suggestedStyle: 'إشهاري وحماسي',
    text: 'عَسْلَامَة! تْحِبْ تَبْدَا نْهَارِكْ بْطَاقَة وَفَرْحَة؟ قَهْوَتْنَا التُّونْسِيَّة الأَصِيلَة بَنَّة لَا تُقَاوَمْ، مَصْنُوعَة بْأَعَزْ الحْبُوبْ وَمْحَمْصَة بْحُبّ... جَرَّبْ لْيُومْ وَمَاكَشْ بَاشْ تِنْدَمْ!'
  },
  {
    id: 'podcast',
    title: 'Podcast Intro',
    titleAr: 'مقدمة بودكاست',
    icon: Headphones,
    category: 'بودكاست',
    suggestedVoice: 'Charon',
    suggestedStyle: 'هادئ ورزين',
    text: 'مَرْحْبَا بِيكُمْ فِي حَلْقَة جْدِيدَة مِنْ بُودْكَاسْتْنَا. لْيُومْ بَاشْ نْغَطْسُو فِي حْكَايَاتْ تُونِسْ المِزْيَانَة، بَيْنَ أَزِقَّة المَدِينَة العَتِيقَة وَذِكْرَيَاتْ زْمَانْ، وِينْ الحْيُوطْ تِحْكِي أَعْرَقْ التَّفَاصِيلْ.'
  },
  {
    id: 'customer_service',
    title: 'IVR / Support',
    titleAr: 'خدمة حرفاء',
    icon: Mic2,
    category: 'رسمي',
    suggestedVoice: 'Kore',
    suggestedStyle: 'رسمي واحترافي',
    text: 'عَسْلَامَة بِيكْ فِي مَصْلَحَة الحُرَفَاء، إِحْنَا دِيمَا عَلَى ذِمَّتِكْ 24 سَاعَة عَلَى 24. بَاشْ تِتَّبَّعْ طَلَبِيِّتِكْ اضْغَطْ عَلَى الرَّقَمْ وَاحِدْ، وَلأَيِّ اسْتِفْسَارْ آخَرْ نَحْنَا دِيمَا فِي الخِدْمَة.'
  },
  {
    id: 'storytelling',
    title: 'Folktale / Story',
    titleAr: 'حكاية وقصة',
    icon: BookOpen,
    category: 'قصص',
    suggestedVoice: 'Fenrir',
    suggestedStyle: 'حكواتي ودرامي',
    text: 'كَانْ يَا مَا كَانْ فِي سِيدِي بُوسْعِيدْ، وِينْ البَحْرْ يِلْمَعْ تَحْتْ شَمْسْ العْشِيَّة، كَانْ فَمَّا شَيْخْ كْبِيرْ يِقْعِدْ دِيمَا فِي القَهْوَة العَالْيَة وَيِحْكِي لِلصِّغَارْ أَعْجَبْ الأَسْرَارْ عَنْ تُونِسْ البَيْضَاء.'
  },
  {
    id: 'casual_chat',
    title: 'Casual Conversation',
    titleAr: 'عفوي وشبابي',
    icon: Smile,
    category: 'عفوي',
    suggestedVoice: 'Zephyr',
    suggestedStyle: 'عفوي وطبيعي',
    text: 'شْنِيَّة أَحْوَالِكْ يَا صَاحْبِي؟ إِنْ شَاءَ الله أُمُورِكْ الكُلْ مْرَيْگْلَة وَالعَائِلَة لَابَاسْ! وَقْتَاشْ نِتْقَابْلُو بَاشْ نِعْمْلُو قَهْوَة كَابُوسَانْ وَنِحْكِيوْ فِي المَشْرُوعْ الجْدِيدْ؟'
  },
  {
    id: 'sports',
    title: 'Sports Energy',
    titleAr: 'حماسي ورياضي',
    icon: Flame,
    category: 'حماسي',
    suggestedVoice: 'Alnilam',
    suggestedStyle: 'إشهاري وحماسي',
    text: 'يَا لَوْلَادْ عَلَى المَيْدَانْ! العَزِيمَة وَالرُّوحْ هِيَّ كُلْ شَيْء، تْسْعِينْ دْقِيقَة بَاشْ نِعْطِيوْ كُلْ مَا عَنَّا وَنْفَرِّحُو جُمْهُورْنَا الغَالِي مِنْ بَنْزَرْتْ لْبُرْجْ الخَضْرَاء!'
  }
];

const STYLES = [
  { label: 'عفوي وطبيعي', desc: 'Natural, casual, authentic Tunisian spoken cadence' },
  { label: 'إشهاري وحماسي', desc: 'Upbeat, high energy, enthusiastic commercial delivery' },
  { label: 'هادئ ورزين', desc: 'Calm, warm, deep, thoughtful and relaxed' },
  { label: 'حكواتي ودرامي', desc: 'Expressive storytelling tone with dramatic pauses' },
  { label: 'رسمي واحترافي', desc: 'Polished, clear, corporate and friendly professional' }
];

const TunisianScriptStudio: React.FC<TunisianScriptStudioProps> = ({
  voices,
  initialVoiceName,
  onClose
}) => {
  const [scriptText, setScriptText] = useState(TUNISIAN_PRESETS[0].text);
  const [selectedVoiceName, setSelectedVoiceName] = useState(
    initialVoiceName || TUNISIAN_PRESETS[0].suggestedVoice
  );
  const [selectedStyle, setSelectedStyle] = useState(TUNISIAN_PRESETS[0].suggestedStyle);
  
  // Audio state
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  
  // AI Tools state
  const [isAiToolActive, setIsAiToolActive] = useState(false);
  const [aiToolMessage, setAiToolMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [customIdeaInput, setCustomIdeaInput] = useState('');
  const [showIdeaModal, setShowIdeaModal] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const currentBufferRef = useRef<AudioBuffer | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      stopAudio();
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(console.error);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, []);

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
      } catch (e) {}
      sourceNodeRef.current = null;
    }
    if (isMountedRef.current) {
      setIsPlaying(false);
    }
  };

  const handleGenerateAndPlay = async () => {
    if (!scriptText.trim()) return;
    if (isLoading) return;

    if (isPlaying) {
      stopAudio();
      return;
    }

    // If we already generated this exact audio and haven't changed text, we can resume
    if (currentBufferRef.current && audioContextRef.current) {
      playBuffer(currentBufferRef.current);
      return;
    }

    setIsLoading(true);
    setError(null);
    setAiToolMessage(null);

    try {
      const ai = new GoogleGenAI({ apiKey: 'server-side' });
      
      const currentStyleObj = STYLES.find(s => s.label === selectedStyle);
      const styleDesc = currentStyleObj?.desc || 'Natural Tunisian Arabic dialect (Derja)';
      
      const promptStyle = `Speak strictly in authentic, natural Tunisian Arabic dialect (الدارجة التونسية / تونسي). Tone & delivery style: ${styleDesc}. Maintain natural Tunisian rhythm, genuine dialect intonation, and proper Arabic articulation.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: scriptText,
                speechMetadata: {
                  style: promptStyle,
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: selectedVoiceName },
            },
          },
        },
      });

      if (!isMountedRef.current) return;

      const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!audioData) {
        throw new Error('لم يتم استلام ملف الصوت من الخادم. يرجى إعادة المحاولة.');
      }

      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 24000,
        });
      } else if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const { buffer, url } = await processAudioResponse(audioData, audioContextRef.current);
      
      if (!isMountedRef.current) return;

      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      setAudioUrl(url);
      currentBufferRef.current = buffer;

      playBuffer(buffer);
    } catch (err: any) {
      console.error('Tunisian TTS Error:', err);
      if (isMountedRef.current) {
        setError(err.message || 'فشل توليد الصوت التونسي. يرجى التأكد من الاتصال وإعادة المحاولة.');
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  const playBuffer = (buffer: AudioBuffer) => {
    if (!audioContextRef.current) return;

    stopAudio();

    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = playbackSpeed;
    source.connect(audioContextRef.current.destination);

    source.onended = () => {
      if (isMountedRef.current) {
        setIsPlaying(false);
      }
    };

    sourceNodeRef.current = source;
    source.start(0);
    setIsPlaying(true);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (sourceNodeRef.current && isPlaying) {
      sourceNodeRef.current.playbackRate.value = speed;
    }
  };

  const handleSelectPreset = (preset: ScriptPreset) => {
    stopAudio();
    currentBufferRef.current = null;
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setScriptText(preset.text);
    if (preset.suggestedVoice) setSelectedVoiceName(preset.suggestedVoice);
    if (preset.suggestedStyle) setSelectedStyle(preset.suggestedStyle);
  };

  // AI Polish: Add Tunisian Tashkeel for supreme pronunciation
  const handleTashkeelPolish = async () => {
    if (!scriptText.trim() || isAiToolActive) return;
    setIsAiToolActive(true);
    setAiToolMessage('جاري تشكيل وضبط نطق اللهجة التونسية...');

    try {
      const ai = new GoogleGenAI({ apiKey: 'server-side' });
      const prompt = `
        You are a Tunisian Arabic dialect linguistics and speech synthesis expert.
        Take the following Tunisian script (بالدارجة التونسية) and add light Arabic diacritics (تَشْكِيلْ: فَتْحَة، ضَمَّة، كَسْرَة، سُكُونْ، شَدَّة) and phonetic cues optimized for Text-to-Speech (TTS) models so that the model pronounces it in 100% authentic Tunisian Derja (اللهجة التونسية).
        
        Rules:
        - Keep all authentic Tunisian vocabulary intact (عسلامة، برشا، شنية، باش، كيفاش، توا، يزّي، فما، مريڤل، etc.).
        - Add diacritics properly so standard Arabic models do not misread it as Modern Standard Arabic.
        - Return ONLY the polished Tunisian text with diacritics, without conversational explanation.

        Input text:
        ${scriptText}
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      const polished = response.text?.trim();
      if (polished) {
        setScriptText(polished);
        currentBufferRef.current = null;
        setAiToolMessage('تم تشكيل وضبط السكريبت بنجاح! جاهز للاستماع الآن ✨');
        setTimeout(() => setAiToolMessage(null), 3500);
      }
    } catch (e: any) {
      console.error('Tashkeel error:', e);
      setAiToolMessage('حدث خطأ أثناء التشكيل، يرجى المحاولة لاحقاً');
      setTimeout(() => setAiToolMessage(null), 3000);
    } finally {
      setIsAiToolActive(false);
    }
  };

  // AI Tool: Translate/Adapt any text into authentic Tunisian Arabic
  const handleTranslateToTunisian = async () => {
    if (!scriptText.trim() || isAiToolActive) return;
    setIsAiToolActive(true);
    setAiToolMessage('جاري التحويل إلى الدارجة التونسية الأصيلة...');

    try {
      const ai = new GoogleGenAI({ apiKey: 'server-side' });
      const prompt = `
        Translate or adapt the following text into fluent, natural, authentic Tunisian Arabic dialect (الدارجة التونسية).
        Make it sound lively, colloquial, and natural to a native Tunisian ear.
        Add light vowel marks (tashkeel) where necessary for smooth pronunciation.
        Return ONLY the translated Tunisian text without notes or intro.

        Text to convert:
        ${scriptText}
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      const converted = response.text?.trim();
      if (converted) {
        setScriptText(converted);
        currentBufferRef.current = null;
        setAiToolMessage('تم التحويل إلى الدارجة التونسية بنجاح! 🇹🇳');
        setTimeout(() => setAiToolMessage(null), 3500);
      }
    } catch (e: any) {
      console.error('Translation error:', e);
      setAiToolMessage('حدث خطأ أثناء التحويل، يرجى المحاولة لاحقاً');
      setTimeout(() => setAiToolMessage(null), 3000);
    } finally {
      setIsAiToolActive(false);
    }
  };

  // AI Tool: Generate a creative Tunisian script from an idea
  const handleGenerateFromIdea = async () => {
    if (!customIdeaInput.trim() || isAiToolActive) return;
    setIsAiToolActive(true);
    setAiToolMessage('جاري كتابة سكريبت تونسي إبداعي...');

    try {
      const ai = new GoogleGenAI({ apiKey: 'server-side' });
      const prompt = `
        You are a top Tunisian creative copywriter and screenwriter.
        Write a short, engaging voiceover script (3-5 sentences) in authentic Tunisian Arabic dialect (الدارجة التونسية) based on this topic:
        "${customIdeaInput}"

        Style/Vibe: ${selectedStyle}
        Include appropriate Tunisian expressions and light diacritics for smooth TTS speech synthesis.
        Return ONLY the Tunisian script text, no markdown headers or introductions.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      const generated = response.text?.trim();
      if (generated) {
        setScriptText(generated);
        currentBufferRef.current = null;
        setShowIdeaModal(false);
        setCustomIdeaInput('');
        setAiToolMessage('تم توليد السكريبت التونسي بنجاح! ✍️');
        setTimeout(() => setAiToolMessage(null), 3500);
      }
    } catch (e: any) {
      console.error('Generate script error:', e);
      setAiToolMessage('فشل توليد السكريبت، يرجى المحاولة لاحقاً');
      setTimeout(() => setAiToolMessage(null), 3000);
    } finally {
      setIsAiToolActive(false);
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(scriptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadWav = () => {
    if (!audioUrl) return;
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `tunisian-script-${selectedVoiceName}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const selectedVoice = voices.find(v => v.name === selectedVoiceName) || voices[0];

  return (
    <div 
      className="fixed inset-0 z-[80] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-zinc-950/70 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      dir="rtl"
    >
      <div 
        className="absolute inset-0" 
        onClick={onClose}
      />

      <div 
        className="relative w-full max-w-5xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[95vh] z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/70 dark:bg-zinc-900/70 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-500 via-rose-600 to-red-700 flex items-center justify-center shadow-lg shadow-red-500/20 text-white font-bold text-lg select-none">
              🇹🇳
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-arabic text-zinc-900 dark:text-white">
                  استوديو السكريبت التونسي
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
                  تونسي دَرْجَة
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-arabic">
                اكتب أو جرب أي سكريبت بالدارجة التونسية واستمع للأصوات تتكلم تونسي بطبيعية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="إغلاق النافذة"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Body: Two columns layout */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 custom-scrollbar">
          
          {/* Left Column: Script Input & Presets (7 cols) */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            
            {/* Presets Chips */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1 font-arabic">
                  <Sparkles size={13} className="text-amber-500" />
                  نماذج وسيناريوهات جاهزة بالتونسي
                </span>
                <span className="text-[11px] text-zinc-400 font-arabic">اضغط لتجربة أي نموذج</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {TUNISIAN_PRESETS.map((preset) => {
                  const Icon = preset.icon;
                  const isActive = scriptText === preset.text;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium font-arabic transition-all duration-200 ${
                        isActive
                          ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
                          : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200/60 dark:border-zinc-700/60'
                      }`}
                    >
                      <Icon size={14} className={isActive ? 'text-amber-300' : 'text-zinc-400'} />
                      <span>{preset.titleAr}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Textarea container */}
            <div className="relative flex-1 flex flex-col bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200 dark:border-zinc-700/80 overflow-hidden shadow-inner focus-within:border-indigo-400 dark:focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 dark:focus-within:ring-indigo-950/40 transition-all">
              <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-100 dark:border-zinc-800/60 bg-white/70 dark:bg-zinc-800/70">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 font-arabic">
                  نص السكريبت (يمكنك التعديل أو كتابة سكريبتك الخاص):
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleCopyText}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors text-xs flex items-center gap-1 font-arabic"
                    title="نسخ النص"
                  >
                    {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    <span>{copied ? 'تم النسخ' : 'نسخ'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setScriptText('');
                      currentBufferRef.current = null;
                    }}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors text-xs flex items-center gap-1 font-arabic"
                    title="مسح النص"
                  >
                    <RotateCcw size={13} />
                    <span>تفريغ</span>
                  </button>
                </div>
              </div>

              <textarea
                value={scriptText}
                onChange={(e) => {
                  setScriptText(e.target.value);
                  currentBufferRef.current = null;
                }}
                dir="auto"
                placeholder="اكتب السكريبت بالدارجة التونسية لهنا... مثلاً: عسلامة، شنية أحوالكم اليوم؟ إن شاء الله تكونوا بخير والخدمة ماشية لاباس..."
                className="w-full flex-1 min-h-[160px] sm:min-h-[190px] p-4 bg-transparent border-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 font-arabic text-base sm:text-lg leading-relaxed resize-none focus:outline-none"
              />

              {/* Status / notification indicator */}
              {aiToolMessage && (
                <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950/60 border-t border-indigo-100 dark:border-indigo-900/60 text-xs font-medium text-indigo-700 dark:text-indigo-300 flex items-center gap-2 font-arabic animate-fade-in">
                  <Sparkles size={14} className="animate-pulse" />
                  <span>{aiToolMessage}</span>
                </div>
              )}

              {/* Footer info & word count */}
              <div className="px-4 py-2 bg-white/50 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500 font-arabic">
                <span>{scriptText.trim().split(/\s+/).filter(Boolean).length} كلمة • {scriptText.length} حرف</span>
                <span className="text-[11px] text-zinc-400">يدعم اللهجة التونسية بالحروف العربية أو المعربة</span>
              </div>
            </div>

            {/* Smart AI Actions Toolbar */}
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/80 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 font-arabic flex items-center gap-1 ml-1">
                <Wand2 size={14} className="text-indigo-500" />
                أدوات الذكاء الاصطناعي:
              </span>

              {/* Tashkeel polish */}
              <button
                onClick={handleTashkeelPolish}
                disabled={isAiToolActive || !scriptText.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-medium font-arabic text-zinc-800 dark:text-zinc-200 hover:border-indigo-300 dark:hover:border-indigo-600 hover:text-indigo-600 dark:hover:text-indigo-300 disabled:opacity-50 transition-all shadow-sm"
              >
                {isAiToolActive ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} className="text-amber-500" />}
                <span>تشكيل وتحسين نطق التونسي ✨</span>
              </button>

              {/* Translate into Tunisian */}
              <button
                onClick={handleTranslateToTunisian}
                disabled={isAiToolActive || !scriptText.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-medium font-arabic text-zinc-800 dark:text-zinc-200 hover:border-indigo-300 dark:hover:border-indigo-600 hover:text-indigo-600 dark:hover:text-indigo-300 disabled:opacity-50 transition-all shadow-sm"
              >
                <Languages size={13} className="text-blue-500" />
                <span>تحويل أي نص إلى تونسي 🇹🇳</span>
              </button>

              {/* Generate from topic */}
              <button
                onClick={() => setShowIdeaModal(true)}
                disabled={isAiToolActive}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs font-medium font-arabic text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-all shadow-sm"
              >
                <Sparkles size={13} />
                <span>اكتبلي سكريبت جديد ✍️</span>
              </button>
            </div>
          </div>

          {/* Right Column: Voice Selection, Settings & Audio Player (5 cols) */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            
            {/* Voice and Style Settings Box */}
            <div className="p-4 sm:p-5 bg-zinc-50/80 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/80 space-y-4">
              
              {/* Voice selector */}
              <div>
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1.5 block font-arabic">
                  الصوت المختار:
                </label>
                <div className="relative">
                  <select
                    value={selectedVoiceName}
                    onChange={(e) => {
                      setSelectedVoiceName(e.target.value);
                      currentBufferRef.current = null;
                      if (audioUrl) {
                        URL.revokeObjectURL(audioUrl);
                        setAudioUrl(null);
                      }
                    }}
                    className="w-full appearance-none bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl py-2.5 px-4 text-sm font-semibold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm font-sans"
                  >
                    {voices.map((v) => (
                      <option key={v.name} value={v.name}>
                        {v.name} • {v.analysis.gender === 'Female' ? 'أنثى' : 'ذكر'} ({v.analysis.characteristics.slice(0, 2).join(', ')})
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-3 text-zinc-400">
                    <ChevronDown size={16} />
                  </div>
                </div>

                {/* Quick recommended voices for Tunisian */}
                <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1 scrollbar-hide">
                  <span className="text-[11px] text-zinc-400 font-arabic shrink-0">أصوات مميزة:</span>
                  {['Puck', 'Kore', 'Charon', 'Zephyr', 'Fenrir'].map((name) => {
                    const isSelected = selectedVoiceName === name;
                    return (
                      <button
                        key={name}
                        onClick={() => {
                          setSelectedVoiceName(name);
                          currentBufferRef.current = null;
                        }}
                        className={`px-2.5 py-0.5 rounded-lg text-xs font-medium transition-colors ${
                          isSelected
                            ? 'bg-indigo-600 text-white font-bold'
                            : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100'
                        }`}
                      >
                        {name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Delivery Style / Tone */}
              <div>
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1.5 block font-arabic">
                  نبرة وطريقة الإلقاء:
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {STYLES.map((style) => {
                    const isSelected = selectedStyle === style.label;
                    return (
                      <button
                        key={style.label}
                        onClick={() => {
                          setSelectedStyle(style.label);
                          currentBufferRef.current = null;
                        }}
                        className={`px-2.5 py-2 rounded-xl text-xs font-medium font-arabic text-right transition-all border ${
                          isSelected
                            ? 'bg-zinc-900 text-white dark:bg-indigo-600 dark:text-white border-transparent shadow-sm'
                            : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'
                        }`}
                      >
                        <div className="font-bold">{style.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Speed Controller */}
              <div className="flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-700/60">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 font-arabic">
                  سرعة الإلقاء:
                </span>
                <div className="flex items-center gap-1 bg-white dark:bg-zinc-800 p-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
                  {[0.85, 1.0, 1.15].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => handleSpeedChange(speed)}
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        playbackSpeed === speed
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Audio Generation & Visualizer Player Card */}
            <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 p-4 shadow-sm flex flex-col space-y-3">
              
              {/* Visualizer screen */}
              <div 
                className={`h-24 w-full rounded-xl bg-zinc-900 overflow-hidden relative flex items-center justify-center cursor-pointer transition-all ${
                  isLoading ? 'opacity-80 cursor-wait' : ''
                }`}
                onClick={handleGenerateAndPlay}
              >
                {/* Technical grid */}
                <div 
                  className="absolute inset-0 opacity-[0.08]" 
                  style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '10px 10px' }}
                />

                {isPlaying ? (
                  <div className="w-full h-full">
                    <AudioVisualizer isPlaying={true} color="#38bdf8" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1.5 text-zinc-400 pointer-events-none font-arabic">
                    <Volume2 size={24} className="text-zinc-500" />
                    <span className="text-xs">
                      {isLoading ? 'جاري تحضير الصوت التونسي...' : 'اضغط للاستماع للسكريبت'}
                    </span>
                  </div>
                )}

                {/* Playing indicator pill */}
                {isPlaying && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] text-emerald-400 flex items-center gap-1 font-arabic">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>يشتغل الآن</span>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-300 text-xs font-arabic">
                  {error}
                </div>
              )}

              {/* Actions row: Main Listen/Stop Button + Download */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleGenerateAndPlay}
                  disabled={isLoading || !scriptText.trim()}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold font-arabic text-sm transition-all shadow-md transform active:scale-98 ${
                    isPlaying
                      ? 'bg-zinc-800 text-white hover:bg-zinc-900 dark:bg-zinc-700 dark:hover:bg-zinc-600'
                      : 'bg-gradient-to-r from-red-600 via-rose-600 to-indigo-600 hover:from-red-500 hover:to-indigo-500 text-white shadow-rose-500/20'
                  } ${isLoading || !scriptText.trim() ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>جاري توليد الصوت التونسي...</span>
                    </>
                  ) : isPlaying ? (
                    <>
                      <Square size={18} className="fill-current" />
                      <span>إيقاف الصوت</span>
                    </>
                  ) : (
                    <>
                      <Play size={18} className="fill-current" />
                      <span>توليد واستماع بالتونسي 🎙️</span>
                    </>
                  )}
                </button>

                {audioUrl && (
                  <button
                    onClick={handleDownloadWav}
                    className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-700/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-600 transition-colors"
                    title="تحميل ملف الصوت بصيغة WAV"
                  >
                    <Download size={18} />
                  </button>
                )}
              </div>

              {/* Engine description badge */}
              <div className="text-center">
                <p className="text-[11px] text-zinc-400 font-arabic">
                  توليد صوتي مباشر فائق الدقة عبر <span className="font-semibold text-indigo-500">Gemini 3.8 Flash Lite TTS</span>
                </p>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Idea Modal: write a new Tunisian script from a prompt */}
      {showIdeaModal && (
        <div 
          className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowIdeaModal(false)}
        >
          <div 
            className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-indigo-500" />
                <h3 className="text-lg font-bold font-arabic text-zinc-900 dark:text-white">
                  اكتبلي سكريبت تونسي بضغطة زر
                </h3>
              </div>
              <button 
                onClick={() => setShowIdeaModal(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-600"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-arabic">
              اكتب فكرة السكريبت أو الموضوع اللي تحب عليه، والذكاء الاصطناعي يكتبهولك بالدارجة التونسية:
            </p>

            <textarea
              value={customIdeaInput}
              onChange={(e) => setCustomIdeaInput(e.target.value)}
              placeholder="مثلاً: إشهار لمطعم تونسي يقدم أحسن كسكسي ولبلابي، أو رسالة ترحيبية بتطبيق توصيل في تونس..."
              className="w-full h-24 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm font-arabic focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-zinc-900 dark:text-white"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowIdeaModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold font-arabic text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              >
                إلغاء
              </button>
              <button
                onClick={handleGenerateFromIdea}
                disabled={isAiToolActive || !customIdeaInput.trim()}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold font-arabic flex items-center gap-1.5 disabled:opacity-50 shadow-md"
              >
                {isAiToolActive ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                <span>توليد السكريبت التونسي</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default TunisianScriptStudio;
