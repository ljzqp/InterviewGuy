import React, { useState, useEffect } from 'react';

interface FeedbackModalProps {
    isOpen: boolean;
    type: 'regenerate' | 'continue';
    onClose: () => void;
    onSubmit: (input: string) => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, type, onClose, onSubmit }) => {
    const [input, setInput] = useState('');

    useEffect(() => {
        if (isOpen) setInput('');
    }, [isOpen]);

    if (!isOpen) return null;

    const isRegenerate = type === 'regenerate';
    const title = isRegenerate ? '重新生成 (Regenerate)' : '继续生成 (Continue)';
    const description = isRegenerate
        ? '将清空当前结果，并结合您的新要求重新生成内容。'
        : '保留当前结果，在此基础上追加更多信息或详情。';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        {isRegenerate ? (
                            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-orange-500"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                        ) : (
                            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-blue-500"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        )}
                        {title}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <p className="text-sm text-slate-500 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {description}
                </p>

                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={isRegenerate ? "例如：请侧重考察并发编程和数据库优化..." : "例如：请再多生成3个关于系统设计的难题..."}
                    className="w-full h-32 p-4 text-sm border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-0 outline-none resize-none mb-6"
                    autoFocus
                />

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        取消
                    </button>
                    <button
                        onClick={() => onSubmit(input)}
                        disabled={!input.trim()}
                        className={`px-6 py-2 rounded-lg font-bold text-white shadow-lg transition-all transform active:scale-95 flex items-center gap-2 ${isRegenerate
                                ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-200'
                                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                            } ${!input.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isRegenerate ? '确认重写' : '确认追加'}
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
                    </button>
                </div>
            </div>
        </div>
    );
};
