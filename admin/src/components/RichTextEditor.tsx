import React, { useRef, useEffect, useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code,
  RotateCcw,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Eye,
  Link as LinkIcon,
  Palette,
  Indent,
  Outdent,
  RemoveFormatting
} from 'lucide-react';
import { Select } from './ui/select';

export const BRAND_FONTS = [
  { label: 'Default (Inter / Sans)', value: 'Inter, sans-serif' },
  { label: 'Cinzel (Royal Serif)', value: "'Cinzel', serif" },
  { label: 'Playfair Display (Luxury Serif)', value: "'Playfair Display', serif" },
  { label: 'Cormorant Garamond (Artisan Heritage)', value: "'Cormorant Garamond', serif" },
  { label: 'Bodoni Moda (High Fashion)', value: "'Bodoni Moda', serif" },
  { label: 'Allura (Cursive Signature)', value: "'Allura', cursive" },
  { label: 'Montserrat (Modern Bold)', value: "'Montserrat', sans-serif" },
  { label: 'Poppins (Warm Modern)', value: "'Poppins', sans-serif" },
  { label: 'Plus Jakarta Sans (Sleek Clean)', value: "'Plus Jakarta Sans', sans-serif" }
];

export const BRAND_COLORS = [
  { name: 'Dark Ink', hex: '#111827' },
  { name: 'Artisan Gold', hex: '#d4af37' },
  { name: 'Amber Glow', hex: '#d97706' },
  { name: 'Royal Blue', hex: '#2563eb' },
  { name: 'Emerald Green', hex: '#059669' },
  { name: 'Crimson Red', hex: '#dc2626' },
  { name: 'Muted Gray', hex: '#6b7280' }
];

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  className?: string;
  label?: string;
  showFontSelector?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write or paste formatted content...',
  minHeight = '140px',
  className = '',
  label,
  showFontSelector = false
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [sourceCode, setSourceCode] = useState(value);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [currentBlock, setCurrentBlock] = useState('p');

  useEffect(() => {
    if (editorRef.current && !isSourceMode) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '';
      }
    }
    setSourceCode(value || '');
  }, [value, isSourceMode]);

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      onChange(html);
      setSourceCode(html);
    }
  };

  const executeCommand = (command: string, commandValue: string | undefined = undefined) => {
    if (isSourceMode) return;
    document.execCommand(command, false, commandValue);
    if (editorRef.current) {
      editorRef.current.focus();
      handleInput();
    }
  };

  const handleBlockChange = (tag: string) => {
    setCurrentBlock(tag);
    executeCommand('formatBlock', `<${tag}>`);
  };

  const handleAddLink = () => {
    const url = prompt('Enter URL (e.g. https://example.com):');
    if (url) {
      executeCommand('createLink', url);
    }
  };

  const applyTextColor = (colorHex: string) => {
    executeCommand('foreColor', colorHex);
    setShowColorPicker(false);
  };

  const handleSourceCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextVal = e.target.value;
    setSourceCode(nextVal);
    onChange(nextVal);
  };

  return (
    <div className={`w-full rounded-lg border border-neutral-200 bg-white overflow-hidden shadow-2xs font-sans ${className}`}>
      {label && (
        <div className="px-3.5 py-1.5 bg-neutral-50/90 border-b border-neutral-200 flex items-center justify-between text-xs font-semibold text-neutral-800">
          <span>{label}</span>
        </div>
      )}

      {/* COMPACT CLEAN TOOLBAR MATCHING DESIGN */}
      <div className="flex flex-wrap items-center gap-1 p-1.5 bg-white border-b border-neutral-200 text-neutral-600 text-xs">
        {/* PARAGRAPH / HEADING SELECTOR */}
        <div className="w-28">
          <Select
            value={currentBlock}
            onValueChange={(val) => handleBlockChange(val)}
            className="h-7 text-xs font-medium bg-neutral-50 px-2"
            options={[
              { value: 'p', label: 'Normal' },
              { value: 'h1', label: 'Heading 1' },
              { value: 'h2', label: 'Heading 2' },
              { value: 'h3', label: 'Heading 3' },
              { value: 'h4', label: 'Heading 4' }
            ]}
          />
        </div>

        <div className="w-[1px] h-4 bg-neutral-200 mx-0.5" />

        {/* BASIC TEXT FORMATTING */}
        <button
          type="button"
          onClick={() => executeCommand('bold')}
          title="Bold (Ctrl+B)"
          className="h-7 w-7 flex items-center justify-center hover:bg-neutral-100 rounded text-neutral-700 hover:text-black transition-colors"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => executeCommand('italic')}
          title="Italic (Ctrl+I)"
          className="h-7 w-7 flex items-center justify-center hover:bg-neutral-100 rounded text-neutral-700 hover:text-black transition-colors"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => executeCommand('underline')}
          title="Underline (Ctrl+U)"
          className="h-7 w-7 flex items-center justify-center hover:bg-neutral-100 rounded text-neutral-700 hover:text-black transition-colors"
        >
          <Underline className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => executeCommand('strikeThrough')}
          title="Strikethrough"
          className="h-7 w-7 flex items-center justify-center hover:bg-neutral-100 rounded text-neutral-700 hover:text-black transition-colors"
        >
          <Strikethrough className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-4 bg-neutral-200 mx-0.5" />

        {/* COLOR PICKER DROPDOWN */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowColorPicker(!showColorPicker)}
            title="Text Color"
            className="h-7 px-2 flex items-center gap-1 hover:bg-neutral-100 rounded text-neutral-700 font-bold"
          >
            <span className="underline decoration-red-500 decoration-2">A</span>
            <Palette className="w-3 h-3 text-neutral-400" />
          </button>

          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1 z-30 bg-white border border-neutral-200 rounded-lg shadow-lg p-2 flex items-center gap-1.5 animate-in fade-in">
              {BRAND_COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => applyTextColor(c.hex)}
                  title={c.name}
                  className="w-4 h-4 rounded-full border border-black/15 hover:scale-125 transition-transform"
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="w-[1px] h-4 bg-neutral-200 mx-0.5" />

        {/* ALIGNMENT */}
        <button
          type="button"
          onClick={() => executeCommand('justifyLeft')}
          title="Align Left"
          className="h-7 w-7 flex items-center justify-center hover:bg-neutral-100 rounded text-neutral-700"
        >
          <AlignLeft className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => executeCommand('justifyCenter')}
          title="Align Center"
          className="h-7 w-7 flex items-center justify-center hover:bg-neutral-100 rounded text-neutral-700"
        >
          <AlignCenter className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => executeCommand('justifyRight')}
          title="Align Right"
          className="h-7 w-7 flex items-center justify-center hover:bg-neutral-100 rounded text-neutral-700"
        >
          <AlignRight className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => executeCommand('justifyFull')}
          title="Justify"
          className="h-7 w-7 flex items-center justify-center hover:bg-neutral-100 rounded text-neutral-700"
        >
          <AlignJustify className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-4 bg-neutral-200 mx-0.5" />

        {/* LISTS */}
        <button
          type="button"
          onClick={() => executeCommand('insertOrderedList')}
          title="Numbered List"
          className="h-7 w-7 flex items-center justify-center hover:bg-neutral-100 rounded text-neutral-700"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => executeCommand('insertUnorderedList')}
          title="Bullet List"
          className="h-7 w-7 flex items-center justify-center hover:bg-neutral-100 rounded text-neutral-700"
        >
          <List className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => executeCommand('outdent')}
          title="Decrease Indent"
          className="h-7 w-7 flex items-center justify-center hover:bg-neutral-100 rounded text-neutral-700"
        >
          <Outdent className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => executeCommand('indent')}
          title="Increase Indent"
          className="h-7 w-7 flex items-center justify-center hover:bg-neutral-100 rounded text-neutral-700"
        >
          <Indent className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-4 bg-neutral-200 mx-0.5" />

        {/* LINK & CODE */}
        <button
          type="button"
          onClick={handleAddLink}
          title="Insert Link"
          className="h-7 w-7 flex items-center justify-center hover:bg-neutral-100 rounded text-neutral-700"
        >
          <LinkIcon className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => executeCommand('formatBlock', '<pre>')}
          title="Code Block"
          className="h-7 w-7 flex items-center justify-center hover:bg-neutral-100 rounded text-neutral-700"
        >
          <Code className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => executeCommand('removeFormat')}
          title="Clear Formatting"
          className="h-7 w-7 flex items-center justify-center hover:bg-neutral-100 rounded text-neutral-700 hover:text-red-600"
        >
          <RemoveFormatting className="w-3.5 h-3.5" />
        </button>

        {/* CODE / VISUAL TOGGLE */}
        <button
          type="button"
          onClick={() => setIsSourceMode(!isSourceMode)}
          className={`ml-auto h-6 px-2 rounded text-[10px] font-semibold flex items-center gap-1 transition-colors ${
            isSourceMode
              ? 'bg-neutral-900 text-white'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
          }`}
          title="Toggle HTML Source"
        >
          {isSourceMode ? <Eye className="w-3 h-3" /> : <Code className="w-3 h-3" />}
          <span>{isSourceMode ? 'Visual' : 'HTML'}</span>
        </button>
      </div>

      {/* EDITOR CONTENT AREA */}
      <div className="p-3 bg-white">
        {isSourceMode ? (
          <textarea
            value={sourceCode}
            onChange={handleSourceCodeChange}
            rows={6}
            placeholder="<p>Write raw HTML...</p>"
            className="w-full text-xs font-mono bg-neutral-900 text-emerald-400 p-2.5 rounded border border-neutral-800 focus:outline-none"
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            style={{ minHeight }}
            data-placeholder={placeholder}
            className="w-full text-xs text-neutral-800 leading-relaxed focus:outline-none prose prose-sm max-w-none empty:before:content-[attr(data-placeholder)] empty:before:text-neutral-400 empty:before:pointer-events-none [&_h1]:text-base [&_h1]:font-bold [&_h1]:text-neutral-900 [&_h1]:mb-2 [&_h2]:text-sm [&_h2]:font-bold [&_h2]:text-neutral-900 [&_h2]:mb-1.5 [&_h3]:text-xs [&_h3]:font-bold [&_h3]:text-neutral-900 [&_h3]:mb-1 [&_p]:mb-1.5 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-1.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-1.5 [&_blockquote]:border-l-2 [&_blockquote]:border-amber-400 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-neutral-600 [&_pre]:bg-neutral-100 [&_pre]:p-2 [&_pre]:rounded [&_pre]:text-[11px]"
          />
        )}
      </div>
    </div>
  );
};

export default RichTextEditor;
