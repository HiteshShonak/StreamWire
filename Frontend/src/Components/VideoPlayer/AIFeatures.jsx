import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { FileText, Sparkles, ChevronUp, ChevronDown, Brain, MessageSquare, User, Send } from 'lucide-react'
import { LoadingDots } from '../Common/LoadingIndicator'
import toast from 'react-hot-toast'
import AuthLock from '../../Components/Common/AuthLock'

const AIFeatures = React.memo(({
    video, // transcript
    userData, // passed from parent
    showTranscript,
    setShowTranscript,
    summarizeMutation,
    aiSummary,
    showAISummary,
    setShowAISummary,
    showAIChat,
    setShowAIChat,
    chatMessages,
    askQuestionMutation,
    aiQuestion,
    setAIQuestion,
    handleAskQuestion,
    chatEndRef
}) => {
    // Auto-scroll chat to bottom when new messages arrive
    useEffect(() => {
        try {
            if (chatEndRef?.current) {
                chatEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        } catch (_e) {
            // swallow any errors silently
        }
    }, [chatMessages.length, chatEndRef]);

    if (!video.transcript) return null;

    return (
        <div className="space-y-4">
            {/* AI Transcript */}
            <div className="p-4 bg-indigo-900/20 border border-indigo-500/30 rounded-xl">
                <button
                    onClick={() => setShowTranscript(!showTranscript)}
                    className="flex items-center justify-between w-full text-left"
                >
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-indigo-500/20 rounded-lg">
                            <FileText className="w-4 h-4 text-indigo-400" />
                        </div>
                        <h4 className="font-bold text-white">AI Transcript</h4>
                        <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-xs font-bold rounded-full flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Generated
                        </span>
                    </div>
                    {showTranscript ? <ChevronUp className="w-5 h-5 text-indigo-400" /> : <ChevronDown className="w-5 h-5 text-indigo-400" />}
                </button>

                <AnimatePresence>
                    {showTranscript && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="mt-3 pt-3 border-t border-indigo-500/20">
                                <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-500/30">
                                    {video.transcript}
                                </p>
                                <div className="mt-3 pt-2 border-t border-indigo-500/20 flex items-center justify-between text-xs text-zinc-500">
                                    <span>{video.transcript.length} characters</span>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(video.transcript);
                                            toast.success('Transcript copied!');
                                        }}
                                        className="text-indigo-400 hover:text-indigo-300 transition-colors"
                                    >
                                        Copy transcript
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* AI Summary Button & Display */}
            <div className="p-4 bg-linear-to-br from-violet-900/20 to-indigo-900/20 border border-violet-500/30 rounded-xl">
                {!userData ? (
                    <AuthLock
                        message="Sign in to generate Video Summaries"
                        variant="cinema"
                    />
                ) : (
                    <>
                        <button
                            onClick={() => {
                                if (!aiSummary && !summarizeMutation.isPending) {
                                    summarizeMutation.mutate();
                                } else {
                                    setShowAISummary(!showAISummary);
                                }
                            }}
                            disabled={summarizeMutation.isPending}
                            className="flex items-center justify-between w-full text-left group cursor-pointer"
                        >
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-violet-500/20 rounded-lg group-hover:bg-violet-500/30 transition-colors">
                                    <Brain className="w-4 h-4 text-violet-400" />
                                </div>
                                <h4 className="font-bold text-white">
                                    {summarizeMutation.isPending ? 'Generating Summary...' : aiSummary ? 'AI Summary' : 'Summarize Video'}
                                </h4>
                                {aiSummary && !summarizeMutation.isPending && (
                                    <span className="px-2 py-0.5 bg-violet-500/20 text-violet-300 text-xs font-bold rounded-full flex items-center gap-1">
                                        <Sparkles className="w-3 h-3" /> Ready
                                    </span>
                                )}
                            </div>
                            {summarizeMutation.isPending ? (
                                <LoadingDots size="md" className="text-purple-400" />
                            ) : aiSummary ? (
                                showAISummary ? <ChevronUp className="w-5 h-5 text-violet-400" /> : <ChevronDown className="w-5 h-5 text-violet-400" />
                            ) : null}
                        </button>

                        <AnimatePresence>
                            {showAISummary && aiSummary && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="mt-3 pt-3 border-t border-violet-500/20">
                                        <div className="text-zinc-300 text-sm leading-relaxed max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/30 prose prose-invert prose-sm max-w-none
                  [&_h1]:text-white [&_h1]:font-black [&_h1]:text-2xl [&_h1]:mb-4 [&_h1]:mt-6
                  [&_h2]:text-white [&_h2]:font-bold [&_h2]:text-xl [&_h2]:mb-3 [&_h2]:mt-5
                  [&_h3]:text-purple-300 [&_h3]:font-bold [&_h3]:text-lg [&_h3]:mb-2 [&_h3]:mt-4
                  [&_h4]:text-purple-400 [&_h4]:font-semibold [&_h4]:text-base [&_h4]:mb-2 [&_h4]:mt-3
                  [&_p]:text-zinc-300 [&_p]:mb-3 [&_p]:leading-relaxed
                  [&_ul]:list-disc [&_ul]:list-inside [&_ul]:mb-3 [&_ul]:space-y-1
                  [&_ol]:list-decimal [&_ol]:list-inside [&_ol]:mb-3 [&_ol]:space-y-1
                  [&_li]:text-zinc-300 [&_li]:ml-2
                  [&_strong]:text-white [&_strong]:font-bold
                  [&_em]:text-purple-300 [&_em]:italic
                  [&_code]:bg-purple-500/20 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-purple-300 [&_code]:text-xs
                  [&_pre]:bg-zinc-900/80 [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:mb-3 [&_pre]:overflow-x-auto
                  [&_blockquote]:border-l-4 [&_blockquote]:border-purple-500/50 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-zinc-400 [&_blockquote]:my-3
                  [&_hr]:border-purple-500/30 [&_hr]:my-4
                ">
                                            <ReactMarkdown>
                                                {aiSummary.split('\n').filter((line, idx) =>
                                                    !(idx === 0 && (line.includes('Video Summary:') || line.includes('**Video Summary:')))
                                                ).join('\n')}
                                            </ReactMarkdown>
                                        </div>
                                        <div className="mt-3 pt-2 border-t border-purple-500/20 flex items-center justify-end">
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(aiSummary);
                                                    toast.success('Summary copied!');
                                                }}
                                                className="text-purple-400 hover:text-purple-300 transition-colors text-xs"
                                            >
                                                Copy summary
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </>
                )}
            </div>

            {/* AI Q&A Chat */}
            <div className="p-4 bg-linear-to-br from-emerald-900/20 to-teal-900/20 border border-emerald-500/30 rounded-xl">
                {!userData ? (
                    <AuthLock
                        message="Sign in to chat with this video"
                        variant="shadows"
                    />
                ) : (
                    <>
                        <button
                            onClick={() => setShowAIChat(!showAIChat)}
                            className="flex items-center justify-between w-full text-left group"
                        >
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-emerald-500/20 rounded-lg group-hover:bg-emerald-500/30 transition-colors">
                                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                                </div>
                                <h4 className="font-bold text-white">Ask Questions</h4>
                                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" /> AI Powered
                                </span>
                            </div>
                            {showAIChat ? <ChevronUp className="w-5 h-5 text-emerald-400" /> : <ChevronDown className="w-5 h-5 text-emerald-400" />}
                        </button>

                        <AnimatePresence>
                            {showAIChat && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="mt-3 pt-3 border-t border-emerald-500/20">
                                        {/* Chat Messages */}
                                        {chatMessages.length > 0 && (
                                            <div className="mb-3 space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-500/30">
                                                {chatMessages.map((msg, idx) => (
                                                    <div
                                                        key={idx}
                                                        className={`p-3 rounded-lg ${msg.role === 'user'
                                                            ? 'bg-emerald-500/10 border border-emerald-500/20 ml-8'
                                                            : 'bg-zinc-900/50 border border-zinc-800 mr-8'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-2 mb-1">
                                                            {msg.role === 'user' ? (
                                                                <User className="w-3 h-3 text-emerald-400" />
                                                            ) : (
                                                                <Brain className="w-3 h-3 text-purple-400" />
                                                            )}
                                                            <span className="text-xs font-bold text-zinc-400">
                                                                {msg.role === 'user' ? 'You' : 'StreamWire AI'}
                                                            </span>
                                                        </div>
                                                        <div className="text-sm text-zinc-300 leading-relaxed prose prose-invert prose-sm max-w-none
                          [&_h1]:text-white [&_h1]:font-bold [&_h1]:text-base [&_h1]:mb-2
                          [&_h2]:text-white [&_h2]:font-bold [&_h2]:text-sm [&_h2]:mb-1.5
                          [&_h3]:text-emerald-300 [&_h3]:font-semibold [&_h3]:text-sm [&_h3]:mb-1
                          [&_p]:text-zinc-300 [&_p]:mb-2
                          [&_ul]:list-disc [&_ul]:list-inside [&_ul]:mb-2 [&_ul]:space-y-0.5
                          [&_ol]:list-decimal [&_ol]:list-inside [&_ol]:mb-2 [&_ol]:space-y-0.5
                          [&_li]:text-zinc-300 [&_li]:ml-2
                          [&_strong]:text-white [&_strong]:font-bold
                          [&_em]:text-emerald-300 [&_em]:italic
                          [&_code]:bg-emerald-500/20 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-emerald-300 [&_code]:text-xs
                          [&_blockquote]:border-l-2 [&_blockquote]:border-emerald-500/50 [&_blockquote]:pl-2 [&_blockquote]:italic [&_blockquote]:text-zinc-400
                        ">
                                                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                                                        </div>
                                                    </div>
                                                ))}
                                                {askQuestionMutation.isPending && (
                                                    <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800 mr-8">
                                                        <div className="flex items-center gap-2">
                                                            <LoadingDots size="xs" className="text-purple-400" />
                                                            <span className="text-sm text-zinc-400">Thinking...</span>
                                                        </div>
                                                    </div>
                                                )}
                                                {/* scroll anchor */}
                                                <div ref={chatEndRef} />
                                            </div>
                                        )}

                                        {/* Question Input */}
                                        <form onSubmit={handleAskQuestion} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={aiQuestion}
                                                onChange={(e) => setAIQuestion(e.target.value)}
                                                placeholder="Ask anything about this video..."
                                                disabled={askQuestionMutation.isPending}
                                                className="flex-1 px-3 py-2 bg-zinc-900/50 border border-emerald-500/30 rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 disabled:opacity-50"
                                            />
                                            <button
                                                type="submit"
                                                disabled={askQuestionMutation.isPending || !aiQuestion.trim()}
                                                className="px-4 py-2 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                            >
                                                {askQuestionMutation.isPending ? (
                                                    <LoadingDots size="xs" />
                                                ) : (
                                                    <Send className="w-4 h-4" />
                                                )}
                                            </button>
                                        </form>

                                        {chatMessages.length === 0 && (
                                            <p className="text-xs text-zinc-500 mt-2">
                                                Ask questions about the video content and get AI-powered answers based on the transcript.
                                            </p>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </>
                )}
            </div>
        </div>
    );
})

export default AIFeatures
