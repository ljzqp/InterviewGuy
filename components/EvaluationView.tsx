import React from 'react';
import { EvaluationResult } from '../types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface EvaluationViewProps {
  evaluation: EvaluationResult;
}

export const EvaluationView: React.FC<EvaluationViewProps> = ({ evaluation }) => {
  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'Strong Hire': return 'bg-emerald-600 text-white';
      case 'Hire': return 'bg-green-500 text-white';
      case 'Caution': return 'bg-amber-500 text-white';
      case 'No Hire': return 'bg-red-500 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };

  const getRecommendationLabel = (rec: string) => {
    switch (rec) {
      case 'Strong Hire': return '强烈推荐录用';
      case 'Hire': return '推荐录用';
      case 'Caution': return '需谨慎/考察';
      case 'No Hire': return '不录用';
      default: return rec;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Summary */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8 flex flex-col md:flex-row gap-8 items-start">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-2xl font-bold text-slate-800">候选人综合评估</h2>
            <span className={`px-4 py-1.5 rounded-full font-bold text-sm shadow-sm ${getRecommendationColor(evaluation?.hiringRecommendation || 'Caution')}`}>
              {getRecommendationLabel(evaluation?.hiringRecommendation)}
            </span>
          </div>
          <p className="text-slate-600 leading-relaxed mb-6">
            {evaluation?.summary || <span className="animate-pulse text-slate-400">正在生成总结...</span>}
          </p>
          <div className="bg-slate-50 p-4 rounded-lg border-l-4 border-indigo-500">
            <p className="text-sm font-semibold text-slate-500 uppercase mb-1">最终录用理由</p>
            <p className="text-slate-800 italic">{evaluation?.reasoning || <span className="animate-pulse text-slate-400">正在生成决策...</span>}</p>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="w-full md:w-1/3 h-[300px] min-h-[300px] flex items-center justify-center bg-slate-50/50 rounded-xl">
          {evaluation?.radarData && evaluation.radarData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={evaluation.radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Candidate"
                  dataKey="A"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  fill="#6366f1"
                  fillOpacity={0.4}
                />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-slate-400 text-sm animate-pulse">Waiting for metrics...</div>
          )}
        </div>
      </div>

      {/* Pros & Cons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-800">核心优势</h3>
          </div>
          <ul className="space-y-3">
            {(evaluation?.strengths || []).map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-slate-600">
                <span className="text-emerald-500 mt-1">✓</span>
                {s}
              </li>
            ))}
            {(!evaluation?.strengths || evaluation.strengths.length === 0) && <li className="text-slate-400 italic text-sm">暂无数据...</li>}
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-rose-100 text-rose-600 rounded-lg">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-800">待考察/风险项</h3>
          </div>
          <ul className="space-y-3">
            {(evaluation?.weaknesses || []).map((w, i) => (
              <li key={i} className="flex items-start gap-2 text-slate-600">
                <span className="text-rose-500 mt-1">!</span>
                {w}
              </li>
            ))}
            {(!evaluation?.weaknesses || evaluation.weaknesses.length === 0) && <li className="text-slate-400 italic text-sm">暂无数据...</li>}
          </ul>
        </div>
      </div>
    </div>
  );
};