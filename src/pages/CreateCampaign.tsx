import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Image as ImageIcon } from 'lucide-react';
import EditorJS from '@editorjs/editorjs';
// @ts-ignore
import Header from '@editorjs/header';
// @ts-ignore
import List from '@editorjs/list';
// @ts-ignore
import Quote from '@editorjs/quote';
// @ts-ignore
import Delimiter from '@editorjs/delimiter';
// @ts-ignore
import ImageTool from '@editorjs/image';

const BG = '#183028';
const OFFWHITE = '#f2f1ec';

export default function CreateCampaign() {
  const navigate = useNavigate();
  const editorRef = useRef<EditorJS | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [title, setTitle] = useState('');

  // Init Editor.js
  useEffect(() => {
    if (!editorRef.current) {
      editorRef.current = new EditorJS({
        holder: 'editorjs-container',
        placeholder: 'Racontez l\'histoire de votre campagne, ajoutez des images, des citations...',
        tools: {
          header: {
            class: Header,
            inlineToolbar: ['link'],
            config: { placeholder: 'Titre de section', levels: [2, 3], defaultLevel: 2 }
          },
          list: {
            class: List,
            inlineToolbar: true,
          },
          quote: {
            class: Quote,
            inlineToolbar: true,
            config: { quotePlaceholder: 'Saisissez la citation', captionPlaceholder: 'Auteur' }
          },
          delimiter: Delimiter,
          image: {
            class: ImageTool,
            config: {
              uploader: {
                uploadByFile(file: File) {
                  return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve({ success: 1, file: { url: e.target?.result } });
                    reader.readAsDataURL(file);
                  });
                }
              }
            }
          }
        },
      });
    }

    return () => {
      if (editorRef.current && editorRef.current.destroy) {
        try {
          editorRef.current.destroy();
        } catch (e) {
          // Ignore destroy error on strict mode hot reloads
        }
        editorRef.current = null;
      }
    };
  }, []);

  const handleBanner = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setBannerPreview(URL.createObjectURL(file));
  };

  return (
    <div className="min-h-screen pb-32" style={{ backgroundColor: OFFWHITE }}>
      {/* Top bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-4 backdrop-blur-md" 
        style={{ backgroundColor: 'rgba(242, 241, 236, 0.85)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}
        initial={{ y: '-100%' }} animate={{ y: 0 }} transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
      >
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#333] hover:text-[#000] transition-colors">
          <ArrowLeft size={16} />
          <span className="text-[11px] font-bold tracking-[0.15em] hidden sm:block">RETOUR</span>
        </button>
        <div className="flex items-center gap-4">
          <button className="text-[12px] font-bold tracking-[0.1em] text-[#888] hover:text-[#333] transition-colors">
            BROUILLON
          </button>
          <button className="px-6 py-3 rounded-full text-[12px] font-bold tracking-[0.1em] text-white hover:brightness-110 transition-all" style={{ backgroundColor: BG }}>
            PUBLIER LA CAMPAGNE
          </button>
        </div>
      </motion.div>

      <motion.div 
        className="max-w-[800px] mx-auto pt-28 px-6"
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
      >
        {/* Banner upload */}
        <div className="mb-12 relative group">
          <label className="block w-full rounded-2xl overflow-hidden cursor-pointer bg-[#e8e8e3] transition-all hover:opacity-90" style={{ aspectRatio: '16/7' }}>
            <input type="file" accept="image/*" className="hidden" onChange={handleBanner} />
            {bannerPreview ? (
              <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-[#888]">
                <ImageIcon size={32} className="mb-3 opacity-50" />
                <p className="text-[14px] font-semibold">Ajouter une bannière de couverture</p>
                <p className="text-[12px] opacity-60 mt-1">Format idéal : 1600 × 700 px</p>
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="px-5 py-2.5 bg-white rounded-full text-[12px] font-bold tracking-[0.1em] text-[#111]">
                {bannerPreview ? 'MODIFIER LA BANNIÈRE' : 'UPLOAD'}
              </span>
            </div>
          </label>
        </div>

        {/* Title */}
        <div className="mb-8">
          <textarea
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre de votre campagne..."
            rows={1}
            className="w-full text-[42px] md:text-[54px] font-medium leading-[1.1] tracking-tight bg-transparent border-none outline-none resize-none placeholder-[#ccc] text-[#1a1a1a]"
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = target.scrollHeight + 'px';
            }}
          />
        </div>

        {/* EditorJS container */}
        <div className="editor-wrapper min-h-[400px]">
          <div id="editorjs-container" className="prose prose-lg max-w-none text-[#333]" />
        </div>
      </motion.div>
    </div>
  );
}
