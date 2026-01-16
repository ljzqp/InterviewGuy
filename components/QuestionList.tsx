import React from 'react';
import { InterviewQuestion } from '../types';

interface QuestionListProps {
  questions: InterviewQuestion[];
}

export const QuestionList: React.FC<QuestionListProps> = ({ questions }) => {
  return (
    <div className="space-y-6">
      {(questions || []).map((q, idx) => (
        <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
          <div className="p-5 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-sm">
                {idx + 1}
              </span>
              <div>
                <h3 className="font-semibold text-slate-800">{q.category || <span className="animate-pulse text-slate-300">...</span>}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${q.difficulty === 'Expert' ? 'bg-red-100 text-red-700' :
                    q.difficulty === 'Advanced' ? 'bg-amber-100 text-amber-700' :
                      q.difficulty === 'Foundation' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                  {q.difficulty || '...'}
                </span>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">场景化提问</p>
              <p className="text-slate-800 text-lg leading-relaxed">{q.scenario || <span className="animate-pulse bg-slate-100 text-slate-100/0 rounded">正在生成场景...</span>}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="bg-blue-50/50 p-4 rounded-lg">
                <p className="text-xs font-bold text-blue-700 uppercase mb-2">考察意图</p>
                <p className="text-sm text-slate-700">{q.intent}</p>
              </div>
              <div className="bg-emerald-50/50 p-4 rounded-lg">
                <p className="text-xs font-bold text-emerald-700 uppercase mb-2">关键词/优秀回答要点</p>
                <ul className="text-sm text-slate-700 list-disc list-inside space-y-1">
                  {(q.keyPoints || []).map((kp, kIdx) => (
                    <li key={kIdx}>{kp}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};