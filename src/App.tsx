/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from "motion/react";
import { STYLES, ASPECT_RATIOS, type CustomElement } from './constants';
import BackgroundGlow from './components/BackgroundGlow';
import GeneratingPage from './components/GeneratingPage';
import ResultPage from './components/ResultPage';
import Header from './components/Header';
import DescriptionInput from './components/DescriptionInput';
import StyleSelector from './components/StyleSelector';
import ElementEditor from './components/ElementEditor';
import AspectRatioSelector from './components/AspectRatioSelector';
import PromptPreview from './components/PromptPreview';
import GenerateButton from './components/GenerateButton';
import Footer from './components/Footer';

export default function App() {
  const [description, setDescription] = useState('');
  const [inputRows, setInputRows] = useState<CustomElement[]>([
    { id: '1', name: '', content: '' }
  ]);
  const [selectedStyle, setSelectedStyle] = useState(STYLES[0]);
  const [selectedRatio, setSelectedRatio] = useState(ASPECT_RATIOS[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [finalPrompt, setFinalPrompt] = useState('');
  const [isManualPrompt, setIsManualPrompt] = useState(false);
  const [page, setPage] = useState<'form' | 'generating' | 'result'>('form');

  useMemo(() => {
    if (isManualPrompt) return;

    const elementsPrompt = inputRows
      .filter(el => el.name.trim() && el.content.trim())
      .map(el => `${el.name}: ${el.content}`)
      .join(', ');

    const derived = [
      description,
      elementsPrompt,
      selectedStyle.prompt
    ].filter(Boolean).join(', ');

    setFinalPrompt(derived);
  }, [description, inputRows, selectedStyle, isManualPrompt]);

  const handleGenerate = async () => {
    if (!finalPrompt.trim()) {
      setError('Please enter a description or prompt first.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);
    setPage('generating');

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: finalPrompt,
          size: selectedRatio.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Generation failed.');
      }

      if (data.image) {
        setGeneratedImage(data.image);
        setPage('result');
      } else {
        throw new Error('No image was generated. Please try a different prompt.');
      }
    } catch (err: any) {
      console.error('Generation error:', err);
      let message = err.message || 'An unexpected error occurred during generation.';
      setError(message);
      setPage('form');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `visionary-ai-${Date.now()}.png`;
    link.click();
  };

  const handleStartOver = () => {
    setGeneratedImage(null);
    setDescription('');
    setError(null);
    setPage('form');
  };

  const addRow = () => {
    const newRow: CustomElement = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      content: '',
    };
    setInputRows([...inputRows, newRow]);
  };

  const updateRow = (id: string, field: 'name' | 'content', value: string) => {
    setInputRows(inputRows.map(row =>
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  const removeRow = (id: string) => {
    if (inputRows.length > 1) {
      setInputRows(inputRows.filter(row => row.id !== id));
    } else {
      setInputRows([{ id: '1', name: '', content: '' }]);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-orange-500/30">
      <BackgroundGlow />

      <AnimatePresence mode="wait">
        {page === 'generating' && (
          <GeneratingPage finalPrompt={finalPrompt} />
        )}

        {page === 'result' && generatedImage && (
          <ResultPage
            generatedImage={generatedImage}
            finalPrompt={finalPrompt}
            setFinalPrompt={setFinalPrompt}
            downloadImage={downloadImage}
            handleGenerate={handleGenerate}
            handleStartOver={handleStartOver}
          />
        )}

        {page === 'form' && (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <main className="relative max-w-5xl mx-auto px-6 py-12 lg:py-20">
              <Header />

              <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
                <div className="space-y-8">
                  <DescriptionInput description={description} setDescription={setDescription} />
                  <StyleSelector selectedStyle={selectedStyle} setSelectedStyle={setSelectedStyle} />
                  <ElementEditor
                    inputRows={inputRows}
                    setInputRows={setInputRows}
                    addRow={addRow}
                    updateRow={updateRow}
                    removeRow={removeRow}
                  />
                </div>

                <aside className="space-y-8">
                  <AspectRatioSelector selectedRatio={selectedRatio} setSelectedRatio={setSelectedRatio} />
                  <PromptPreview
                    finalPrompt={finalPrompt}
                    setFinalPrompt={setFinalPrompt}
                    isManualPrompt={isManualPrompt}
                    setIsManualPrompt={setIsManualPrompt}
                  />
                  <GenerateButton isGenerating={isGenerating} handleGenerate={handleGenerate} error={error} />
                </aside>
              </div>
            </main>

            <Footer />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
