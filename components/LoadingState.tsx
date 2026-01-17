import React from 'react';

export const LoadingState: React.FC<{ text?: string, subText?: string }> = ({
    text = "AI 正在深度思考...",
    subText = "分析简历 · 匹配职位 · 生成场景化问题"
}) => {
    return (
        <div className="flex flex-col items-center justify-center p-12 w-full animate-fade-in">
            <div className="relative w-24 h-24 mb-8">
                {/* Core pulsing circle */}
                <div className="absolute inset-0 bg-indigo-500 rounded-full opacity-20 animate-ping"></div>
                <div className="absolute inset-2 bg-indigo-600 rounded-full opacity-30 animate-pulse"></div>

                {/* Rotating borders */}
                <div className="absolute inset-0 border-4 border-transparent border-t-indigo-500 border-r-indigo-400 rounded-full animate-spin"></div>
                <div className="absolute inset-0 border-4 border-transparent border-l-indigo-300 rounded-full animate-reverse-spin"></div>

                {/* Center icon */}
                <div className="absolute inset-0 flex items-center justify-center text-white">
                    <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="animate-bounce-slight">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                </div>
            </div>

            <h3 className="text-xl font-bold text-slate-800 mb-2 tracking-wide font-mono">
                {text}
            </h3>
            <p className="text-slate-500 text-sm font-medium animate-pulse">
                {subText}
            </p>

            {/* Thinking steps simulation */}
            <div className="mt-8 space-y-2 w-64">
                <div className="h-1 w-full bg-slate-100 rounded overflow-hidden">
                    <div className="h-full bg-indigo-500 animate-progress-indeterminate"></div>
                </div>
            </div>
        </div>
    );
};
