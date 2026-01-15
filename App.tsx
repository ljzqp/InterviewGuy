import React, { useState } from 'react';
import { PREDEFINED_JDS, AppStep, InterviewQuestion, EvaluationResult, FileData } from './types';
import { generateQuestions, evaluateCandidate } from './services/geminiService';
import { FileUpload } from './components/FileUpload';
import { QuestionList } from './components/QuestionList';
import { EvaluationView } from './components/EvaluationView';

// Default Prompts
const DEFAULT_QUESTION_PROMPT = `你是一位拥有15年经验的专家级技术招聘人员和招聘经理。
你的目标是分析候选人简历并对照职位描述（JD），生成高质量的、场景化的面试问题。

问题必须探究候选人的能力上限和底线，评估以下维度：
1. 技术深度/广度（基础、进阶、难度较大）
2. 创新性问题与解决问题能力
3. 职业规划问题
4. 学习能力 & 潜力 & 自驱力
5. AI 理解或使用相关问题
6. 表达 & 沟通能力等其它软实力

对于每个问题，请提供：
- 一个具体的场景（不仅仅是“什么是X？”）。
- 考察意图（在考察什么能力）。
- 优秀回答的关键点。
- 难度级别（Foundation/Advanced/Expert）。`;

const DEFAULT_EVALUATION_PROMPT = `你是一位招聘把关人（Bar Raiser）。你已经审阅了面试记录。
你的任务是根据职位描述和问题的预期复杂性来评估候选人的回答。

请评估候选人的：
1. 实际技能水平 vs 简历声称水平。
2. 解决问题的方法和思路。
3. 文化契合度和软技能。
4. 成长潜力。

输出一个结构化的评估，包括雷达图数据集（0-100分）。`;

export default function App() {
  // State
  const [currentStep, setCurrentStep] = useState<AppStep>(AppStep.SETUP);
  const [selectedJdId, setSelectedJdId] = useState<string>(PREDEFINED_JDS[0].id);
  const [customJd, setCustomJd] = useState<string>(PREDEFINED_JDS[0].content);
  const [extraReqs, setExtraReqs] = useState<string>('');
  const [resumeFiles, setResumeFiles] = useState<FileData[]>([]);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [transcript, setTranscript] = useState<string>('');
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Prompt State
  const [questionPrompt, setQuestionPrompt] = useState(DEFAULT_QUESTION_PROMPT);
  const [evaluationPrompt, setEvaluationPrompt] = useState(DEFAULT_EVALUATION_PROMPT);
  const [showPromptSettings, setShowPromptSettings] = useState(false);

  // Handlers
  const handleJdSelect = (id: string) => {
    setSelectedJdId(id);
    const jd = PREDEFINED_JDS.find(j => j.id === id);
    if (jd) setCustomJd(jd.content);
  };

  const handleResumeSelect = (files: FileList) => {
    const filePromises = Array.from(files).map(file => {
      return new Promise<FileData>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve({
            name: file.name,
            type: file.type,
            data: reader.result as string
          });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(filePromises).then(setResumeFiles).catch(err => setError("文件加载失败"));
  };

  const handleGenerateQuestions = async () => {
    if (resumeFiles.length === 0) {
      setError("请至少上传一份简历。");
      return;
    }
    setError('');
    setIsProcessing(true);
    setCurrentStep(AppStep.ANALYZING);

    try {
      const qs = await generateQuestions(customJd, resumeFiles, extraReqs, questionPrompt);
      setQuestions(qs);
      setCurrentStep(AppStep.QUESTIONS);
    } catch (e: any) {
      setError(e.message || "生成面试题失败，请重试。");
      setCurrentStep(AppStep.SETUP);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEvaluate = async () => {
    if (!transcript.trim()) {
      setError("请粘贴面试对话记录。");
      return;
    }
    setError('');
    setIsProcessing(true);
    setCurrentStep(AppStep.EVALUATING);

    try {
      const res = await evaluateCandidate(transcript, questions, customJd, evaluationPrompt);
      setEvaluation(res);
      setCurrentStep(AppStep.RESULTS);
    } catch (e: any) {
      setError(e.message || "评估失败，请重试。");
      setCurrentStep(AppStep.TRANSCRIPT_UPLOAD);
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setCurrentStep(AppStep.SETUP);
    setResumeFiles([]);
    setQuestions([]);
    setTranscript('');
    setEvaluation(null);
  };

  // Render Helpers
  const renderProgressBar = () => {
    const steps = [
      { id: AppStep.SETUP, label: '设置' },
      { id: AppStep.QUESTIONS, label: '面试题' },
      { id: AppStep.TRANSCRIPT_UPLOAD, label: '面试过程' },
      { id: AppStep.RESULTS, label: '评估结果' }
    ];
    
    let activeIndex = 0;
    if (currentStep === AppStep.ANALYZING) activeIndex = 0;
    else if (currentStep === AppStep.EVALUATING) activeIndex = 2;
    else activeIndex = steps.findIndex(s => s.id === currentStep);

    return (
      <div className="w-full max-w-4xl mx-auto mb-12">
        <div className="relative flex justify-between items-center">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -z-10 rounded-full"></div>
          <div className="absolute top-1/2 left-0 h-1 bg-indigo-600 -z-10 rounded-full transition-all duration-500" 
               style={{ width: `${(activeIndex / (steps.length - 1)) * 100}%` }}></div>
          
          {steps.map((step, idx) => {
            const isActive = idx <= activeIndex;
            const isCurrent = idx === activeIndex;
            return (
              <div key={step.id} className="flex flex-col items-center bg-transparent">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-4 transition-all duration-300 ${
                  isActive ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white border-slate-300 text-slate-400'
                }`}>
                  {idx + 1}
                </div>
                <span className={`mt-2 text-xs font-semibold uppercase tracking-wider ${isCurrent ? 'text-indigo-700' : 'text-slate-400'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">TS</div>
            <h1 className="font-bold text-xl tracking-tight text-slate-900">TalentScout <span className="text-indigo-600">AI</span></h1>
          </div>
          {currentStep !== AppStep.SETUP && (
            <button onClick={reset} className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">
              新面试
            </button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {renderProgressBar()}

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-center gap-3 animate-pulse">
             <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
             {error}
          </div>
        )}

        {/* STEP 1: SETUP */}
        {currentStep === AppStep.SETUP && (
          <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left: Job Description */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-800">1. 职位详情 (Job Details)</h2>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">选择预设职位 (JD)</label>
                  <select 
                    value={selectedJdId} 
                    onChange={(e) => handleJdSelect(e.target.value)}
                    className="w-full p-3 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm shadow-sm"
                  >
                    {PREDEFINED_JDS.map(jd => (
                      <option key={jd.id} value={jd.id}>{jd.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">职位描述 (可编辑)</label>
                  <textarea 
                    value={customJd}
                    onChange={(e) => setCustomJd(e.target.value)}
                    rows={8}
                    className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm shadow-sm font-mono text-slate-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">额外要求 (可选)</label>
                  <input 
                    type="text"
                    value={extraReqs}
                    onChange={(e) => setExtraReqs(e.target.value)}
                    placeholder="例如：侧重考察文化契合度，或某个具体的技术细节..."
                    className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm shadow-sm"
                  />
                </div>
              </div>

              {/* Right: Resume Upload */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-800">2. 候选人简历 (Resume)</h2>
                <FileUpload 
                  label="上传简历 (PDF 或 图片)" 
                  onFilesSelected={handleResumeSelect}
                  multiple={true}
                />
                
                {resumeFiles.length > 0 && (
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-3">已选文件</p>
                    <div className="space-y-2">
                      {resumeFiles.map((f, i) => (
                        <div key={i} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                          <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded flex items-center justify-center text-xs font-bold">
                            {f.type.includes('pdf') ? 'PDF' : 'IMG'}
                          </div>
                          <span className="text-sm font-medium text-slate-700 truncate">{f.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Prompt Settings Toggle */}
                <div className="pt-4">
                  <button 
                    onClick={() => setShowPromptSettings(!showPromptSettings)}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    {showPromptSettings ? '隐藏高级设置' : '高级设置：编辑提示词 (Prompt)'}
                  </button>
                  
                  {showPromptSettings && (
                    <div className="mt-3 space-y-3 animate-fade-in bg-slate-100 p-4 rounded-lg">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">生成面试题的系统指令 (System Prompt)</label>
                        <textarea
                          value={questionPrompt}
                          onChange={(e) => setQuestionPrompt(e.target.value)}
                          rows={6}
                          className="w-full p-2 rounded border border-slate-300 text-xs font-mono text-slate-700"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">评估候选人的系统指令 (Evaluation Prompt)</label>
                        <textarea
                          value={evaluationPrompt}
                          onChange={(e) => setEvaluationPrompt(e.target.value)}
                          rows={6}
                          className="w-full p-2 rounded border border-slate-300 text-xs font-mono text-slate-700"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 flex justify-end">
              <button 
                onClick={handleGenerateQuestions}
                disabled={resumeFiles.length === 0}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                生成面试题
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </button>
            </div>
          </div>
        )}

        {/* LOADING STATES */}
        {(currentStep === AppStep.ANALYZING || currentStep === AppStep.EVALUATING) && (
           <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
             <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
             <h3 className="text-2xl font-bold text-slate-800 mb-2">
                {currentStep === AppStep.ANALYZING ? '正在分析简历 & 生成题目...' : '正在评估候选人表现...'}
             </h3>
             <p className="text-slate-500 max-w-md">
               {currentStep === AppStep.ANALYZING 
                  ? "AI正在根据JD要求深度分析候选人简历，构思最能考察其实力的面试场景。" 
                  : "正在分析对话内容，提取行为模式、技术深度以及软技能表现。"}
             </p>
           </div>
        )}

        {/* STEP 2: QUESTIONS */}
        {currentStep === AppStep.QUESTIONS && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">生成的面试题</h2>
                <p className="text-slate-500 mt-1">建议按顺序询问以下问题，以探测候选人能力边界。</p>
              </div>
            </div>

            <QuestionList questions={questions} />

            <div className="sticky bottom-6 flex justify-center pt-8">
              <button 
                onClick={() => setCurrentStep(AppStep.TRANSCRIPT_UPLOAD)}
                className="bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-full font-semibold shadow-xl transition-all flex items-center gap-3 transform hover:-translate-y-1"
              >
                开始评估阶段
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: TRANSCRIPT */}
        {currentStep === AppStep.TRANSCRIPT_UPLOAD && (
          <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
             <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-800">面试对话记录 (Transcript)</h2>
                <p className="text-slate-500 mt-2">请在下方粘贴面试过程中的完整对话文本。</p>
             </div>

             <div className="bg-white p-2 rounded-xl border border-slate-300 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="面试官：你好，请先做个自我介绍...&#10;候选人：您好，我叫..."
                  className="w-full h-96 p-4 outline-none text-slate-700 font-mono text-sm resize-none rounded-lg"
                />
             </div>
             
             {/* Allow editing evaluation prompt here too if needed */}
             <div className="flex flex-col items-end gap-2 pt-4">
               <button 
                  onClick={() => setShowPromptSettings(!showPromptSettings)}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  {showPromptSettings ? '隐藏评估提示词设置' : '调整评估提示词?'}
                </button>
               {showPromptSettings && (
                  <div className="w-full bg-slate-100 p-4 rounded-lg text-left">
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-2">评估系统指令 (Evaluation Prompt)</label>
                      <textarea
                        value={evaluationPrompt}
                        onChange={(e) => setEvaluationPrompt(e.target.value)}
                        rows={6}
                        className="w-full p-2 rounded border border-slate-300 text-xs font-mono text-slate-700"
                      />
                  </div>
               )}

                <button 
                  onClick={handleEvaluate}
                  disabled={!transcript.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mt-4"
                >
                  生成评估报告
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                </button>
             </div>
          </div>
        )}

        {/* STEP 4: RESULTS */}
        {currentStep === AppStep.RESULTS && evaluation && (
          <EvaluationView evaluation={evaluation} />
        )}

      </main>
    </div>
  );
}