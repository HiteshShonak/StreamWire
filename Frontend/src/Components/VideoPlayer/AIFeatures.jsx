import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import rehypeHighlight from 'rehype-highlight'
import { FileText, Sparkles, ChevronUp, ChevronDown, Brain, MessageSquare, User, Send, Search } from 'lucide-react'
import { LoadingDots } from '../Common/LoadingIndicator'
import toast from 'react-hot-toast'
import AuthLock from '../../Components/Common/AuthLock'
import { formatDuration } from '../../utils/formatters'

const TIMESTAMP_LINE_PATTERN = /^\s*(?:\[)?((?:\d{1,2}:)?\d{1,2}:\d{2})(?:\])?\s*(?:[-:]?\s*)?(.*)$/

// ─────────────────────────────────────────────────────────────────────────────
// Shared Markdown Renderer — used for both AI Summary and AI Q&A
// Uses react-markdown v10 + remark-gfm + remark-breaks + rehype-highlight
// NOTE: react-markdown v10 removed the `inline` prop from the code component.
//       Block code has className="hljs language-*" (set by rehype-highlight).
//       Inline code has no className — detected via Boolean(className).
// ─────────────────────────────────────────────────────────────────────────────
const makeMarkdownComponents = (theme) => ({
    // Paragraphs
    p: ({ children }) => <p className="mb-1.5 last:mb-0 leading-relaxed">{children}</p>,

    // Bold / italic / strikethrough (remark-gfm adds ~~strikethrough~~ support)
    strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
    em: ({ children }) => <em className={`italic ${theme.em}`}>{children}</em>,
    del: ({ children }) => <del className="line-through opacity-50">{children}</del>,

    // IMPORTANT: inline vs block code — inline prop was REMOVED in react-markdown v10.
    // rehype-highlight adds `hljs language-*` className to block <code>.
    // Inline <code> elements have no className at all.
    code: ({ className, children }) => {
        const isBlock = Boolean(className) // block code always has "hljs language-*" className
        if (isBlock) {
            // Block code — rehype-highlight already rendered hljs token spans inside
            return <code className={className}>{children}</code>
        }
        // Inline code — style with theme accent color
        return (
            <code className={`rounded px-1 py-0.5 ${theme.inlineCode} text-xs font-mono`}>
                {children}
            </code>
        )
    },

    // Pre wrapper for code blocks — tokyo-night-dark theme CSS provides background
    pre: ({ children }) => (
        <pre className="my-2 rounded-lg p-3 overflow-x-auto text-xs leading-relaxed border border-white/5">
            {children}
        </pre>
    ),

    // Lists (remark-gfm enables task lists too)
    ul: ({ children }) => <ul className="list-disc list-inside space-y-0.5 my-1.5 pl-1 text-zinc-300">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal list-inside space-y-0.5 my-1.5 pl-1 text-zinc-300">{children}</ol>,
    li: ({ children }) => <li className="text-zinc-300">{children}</li>,

    // Headings
    h1: ({ children }) => <h1 className="font-black text-white text-lg mb-2 mt-3">{children}</h1>,
    h2: ({ children }) => <h2 className={`font-bold text-base mb-1.5 mt-3 ${theme.h2}`}>{children}</h2>,
    h3: ({ children }) => <h3 className={`font-semibold mb-1 mt-2 ${theme.h3}`}>{children}</h3>,
    h4: ({ children }) => <h4 className={`font-semibold text-sm mb-0.5 mt-1.5 ${theme.h4}`}>{children}</h4>,

    // Blockquote
    blockquote: ({ children }) => (
        <blockquote className={`border-l-2 ${theme.blockquote} pl-3 my-1.5 italic text-zinc-400`}>
            {children}
        </blockquote>
    ),

    // Horizontal rule
    hr: () => <hr className={`my-3 ${theme.hr} opacity-30`} />,

    // Links
    a: ({ href, children }) => (
        <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className={`underline underline-offset-2 ${theme.link} hover:opacity-70 transition-opacity`}
        >
            {children}
        </a>
    ),

    // Tables (requires remark-gfm)
    table: ({ children }) => (
        <div className="my-2 overflow-x-auto rounded-lg border border-white/10">
            <table className="w-full text-xs border-collapse">{children}</table>
        </div>
    ),
    thead: ({ children }) => <thead className={`border-b ${theme.tableHead}`}>{children}</thead>,
    tbody: ({ children }) => <tbody className="divide-y divide-white/5">{children}</tbody>,
    tr: ({ children }) => <tr className="hover:bg-white/5 transition-colors">{children}</tr>,
    th: ({ children }) => <th className={`px-3 py-1.5 text-left font-bold whitespace-nowrap ${theme.th}`}>{children}</th>,
    td: ({ children }) => <td className="px-3 py-1.5 align-top text-zinc-300">{children}</td>,
})

// Pre-built themes matching the existing design system colors
const SUMMARY_THEME = {
    em: 'text-violet-300',
    inlineCode: 'bg-violet-500/20 text-violet-300 border border-violet-500/20',
    h2: 'text-white',
    h3: 'text-violet-300',
    h4: 'text-fuchsia-300',
    blockquote: 'border-violet-500/50',
    hr: 'border-violet-500',
    link: 'text-violet-400',
    tableHead: 'border-violet-500/30',
    th: 'text-violet-300',
}

const CHAT_THEME = {
    em: 'text-emerald-300',
    inlineCode: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/20',
    h2: 'text-white',
    h3: 'text-emerald-300',
    h4: 'text-cyan-300',
    blockquote: 'border-emerald-500/50',
    hr: 'border-emerald-500',
    link: 'text-emerald-400',
    tableHead: 'border-emerald-500/30',
    th: 'text-emerald-300',
}

// Memoized component instances (avoids recreating objects on every render)
const summaryComponents = makeMarkdownComponents(SUMMARY_THEME)
const chatComponents = makeMarkdownComponents(CHAT_THEME)

const REMARK_PLUGINS = [remarkGfm, remarkBreaks]
const REHYPE_PLUGINS = [rehypeHighlight]

const parseTimestampToSeconds = (timestamp) => {
    const parts = timestamp.split(':').map((value) => Number(value))
    if (parts.some((value) => Number.isNaN(value))) return null

    if (parts.length === 2) {
        const [minutes, seconds] = parts
        return (minutes * 60) + seconds
    }

    if (parts.length === 3) {
        const [hours, minutes, seconds] = parts
        return (hours * 3600) + (minutes * 60) + seconds
    }

    return null
}

const buildTranscriptTimeline = (transcript, videoDuration = 0) => {
    const source = transcript?.replace(/\r/g, '\n').trim()
    if (!source) return []

    const lines = source.split('\n').map((line) => line.trim()).filter(Boolean)
    const explicitTimeline = lines
        .map((line, index) => {
            const match = line.match(TIMESTAMP_LINE_PATTERN)
            if (!match) return null

            const seconds = parseTimestampToSeconds(match[1])
            const text = (match[2] || '').trim()

            if (!Number.isFinite(seconds) || !text) return null

            return {
                id: `timed-${index}-${seconds}`,
                seconds,
                text
            }
        })
        .filter(Boolean)

    if (explicitTimeline.length >= 2) {
        return explicitTimeline.sort((a, b) => a.seconds - b.seconds)
    }

    const sentenceSource = source.replace(/\n+/g, ' ')
    const roughSentences = sentenceSource
        .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
        .map((sentence) => sentence.trim())
        .filter(Boolean)

    const segments = []
    let segmentBuffer = ''

    roughSentences.forEach((sentence) => {
        if (!segmentBuffer) {
            segmentBuffer = sentence
            return
        }

        const merged = `${segmentBuffer} ${sentence}`
        if (merged.length <= 180) {
            segmentBuffer = merged
            return
        }

        segments.push(segmentBuffer)
        segmentBuffer = sentence
    })

    if (segmentBuffer) {
        segments.push(segmentBuffer)
    }

    if (!segments.length) {
        for (let index = 0; index < sentenceSource.length; index += 160) {
            const chunk = sentenceSource.slice(index, index + 160).trim()
            if (chunk) segments.push(chunk)
        }
    }

    const safeDuration = Number.isFinite(videoDuration) && videoDuration > 0
        ? videoDuration
        : Math.max(segments.length * 7, 60)
    const denominator = Math.max(segments.length - 1, 1)

    return segments.map((text, index) => ({
        id: `fallback-${index}`,
        seconds: Math.floor((index / denominator) * Math.max(safeDuration - 1, 0)),
        text
    }))
}

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
    chatEndRef,
    videoDuration,
    onSeekToTime
}) => {
    const [transcriptSearch, setTranscriptSearch] = useState('')

    const transcriptTimeline = useMemo(
        () => buildTranscriptTimeline(video.transcript, videoDuration),
        [video.transcript, videoDuration]
    )

    const normalizedTranscriptSearch = transcriptSearch.trim().toLowerCase()

    const transcriptSearchRegex = useMemo(() => {
        if (!normalizedTranscriptSearch) return null
        const escapedSearch = normalizedTranscriptSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        return new RegExp(`(${escapedSearch})`, 'ig')
    }, [normalizedTranscriptSearch])

    const filteredTranscriptTimeline = useMemo(() => {
        if (!normalizedTranscriptSearch) return transcriptTimeline
        return transcriptTimeline.filter((entry) => entry.text.toLowerCase().includes(normalizedTranscriptSearch))
    }, [transcriptTimeline, normalizedTranscriptSearch])

    const highlightTranscriptMatch = (text) => {
        if (!transcriptSearchRegex) return text

        return text.split(transcriptSearchRegex).map((part, index) => {
            if (part.toLowerCase() === normalizedTranscriptSearch) {
                return (
                    <mark key={`${part}-${index}`} className="px-0.5 rounded bg-sky-500/20 text-sky-200">
                        {part}
                    </mark>
                )
            }

            return <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>
        })
    }

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

    // Keep input focused: refocus after AI finishes answering (isPending: true → false)
    const chatInputRef = useRef(null);
    const prevIsPending = useRef(false);
    useEffect(() => {
        const justFinished = prevIsPending.current && !askQuestionMutation.isPending;
        if (justFinished) {
            chatInputRef.current?.focus();
        }
        prevIsPending.current = askQuestionMutation.isPending;
    }, [askQuestionMutation.isPending]);

    // Focus input as soon as the chat panel opens
    useEffect(() => {
        if (showAIChat) {
            // Small delay to let the open animation start before focusing
            const t = setTimeout(() => chatInputRef.current?.focus(), 120);
            return () => clearTimeout(t);
        }
    }, [showAIChat]);

    if (!video.transcript) return null;

    return (
        <div className="space-y-4">
            {/* AI Transcript */}
            <div className="p-4 bg-sky-900/20 border border-sky-500/30 rounded-xl">
                <button
                    onClick={() => setShowTranscript(!showTranscript)}
                    className="flex items-center justify-between w-full text-left"
                >
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-sky-500/20 rounded-lg">
                            <FileText className="w-4 h-4 text-sky-400" />
                        </div>
                        <h4 className="font-bold text-white">AI Transcript</h4>
                        <span className="px-2 py-0.5 bg-sky-500/20 text-sky-300 text-xs font-bold rounded-full flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Generated
                        </span>
                    </div>
                    {showTranscript ? <ChevronUp className="w-5 h-5 text-sky-400" /> : <ChevronDown className="w-5 h-5 text-sky-400" />}
                </button>

                <AnimatePresence>
                    {showTranscript && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="mt-3 pt-3 border-t border-sky-500/20 space-y-3">
                                <div className="relative">
                                    <Search className="w-3.5 h-3.5 text-sky-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <input
                                        type="text"
                                        value={transcriptSearch}
                                        onChange={(e) => setTranscriptSearch(e.target.value)}
                                        placeholder="Search transcript timeline..."
                                        className="w-full pl-9 pr-3 py-2 bg-zinc-950/60 border border-sky-500/30 rounded-lg text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-sky-400"
                                    />
                                </div>

                                <div className="max-h-64 overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-thumb-sky-500/30">
                                    {filteredTranscriptTimeline.length > 0 ? (
                                        filteredTranscriptTimeline.map((entry) => (
                                            <button
                                                key={entry.id}
                                                type="button"
                                                onClick={() => {
                                                    if (typeof onSeekToTime === 'function') {
                                                        onSeekToTime(entry.seconds)
                                                    }
                                                }}
                                                className="w-full text-left p-2.5 rounded-lg bg-zinc-950/50 border border-sky-500/20 hover:bg-sky-500/10 transition-colors"
                                            >
                                                <div className="flex items-start gap-2.5">
                                                    <span className="shrink-0 px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-300 text-[11px] font-mono font-bold">
                                                        {formatDuration(entry.seconds)}
                                                    </span>
                                                    <p className="text-zinc-300 text-sm leading-relaxed">
                                                        {highlightTranscriptMatch(entry.text)}
                                                    </p>
                                                </div>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="rounded-lg border border-sky-500/20 bg-zinc-950/40 p-3 text-sm text-zinc-400">
                                            No transcript matches for "{transcriptSearch.trim()}".
                                        </div>
                                    )}
                                </div>

                                <div className="mt-3 pt-2 border-t border-sky-500/20 flex items-center justify-between text-xs text-zinc-500">
                                    <span>
                                        {filteredTranscriptTimeline.length}/{transcriptTimeline.length} entries • {video.transcript.length} characters
                                    </span>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(video.transcript);
                                            toast.success('Transcript copied!');
                                        }}
                                        className="text-sky-400 hover:text-sky-300 transition-colors"
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
            <div className="p-4 bg-linear-to-br from-violet-900/20 to-fuchsia-900/20 border border-violet-500/30 rounded-xl">
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
                                <LoadingDots size="md" className="text-violet-400" />
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
                                        <div className="text-zinc-300 text-sm leading-relaxed max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-violet-500/30">
                                            <ReactMarkdown
                                                remarkPlugins={REMARK_PLUGINS}
                                                rehypePlugins={REHYPE_PLUGINS}
                                                components={summaryComponents}
                                            >
                                                {aiSummary.split('\n').filter((line, idx) =>
                                                    !(idx === 0 && (line.includes('Video Summary:') || line.includes('**Video Summary:**')))
                                                ).join('\n')}
                                            </ReactMarkdown>
                                        </div>
                                        <div className="mt-3 pt-2 border-t border-violet-500/20 flex items-center justify-end">
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(aiSummary);
                                                    toast.success('Summary copied!');
                                                }}
                                                className="text-violet-400 hover:text-violet-300 transition-colors text-xs"
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
            <div className="p-4 bg-linear-to-br from-emerald-900/20 to-cyan-900/20 border border-emerald-500/30 rounded-xl">
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
                                    animate={{ height: '400px', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                                    className="overflow-hidden"
                                >
                                    <div className="mt-3 pt-3 border-t border-emerald-500/20 flex flex-col h-[368px]">

                                        {/* Messages area — always rendered, scrollable, fills remaining space */}
                                        <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-emerald-500/30 mb-3">
                                            {/* Welcome message — always the first message */}
                                            <motion.div 
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.3, duration: 0.3 }}
                                                className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800 mr-8 shrink-0"
                                            >
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Brain className="w-3 h-3 text-cyan-300" />
                                                    <span className="text-xs font-bold text-zinc-400">StreamWire AI</span>
                                                </div>
                                                <p className="text-sm text-zinc-300 leading-relaxed">
                                                    Hey! 👋 I&apos;m <span className="font-semibold text-emerald-300">StreamWire AI</span>. I&apos;m ready to help you explore the video <span className="font-semibold text-white">&quot;{video.title}&quot;</span>. Ask me about key points and takeaways, specific topics, summaries and explanations, or any other questions you have.
                                                </p>
                                            </motion.div>

                                            {/* Chat History */}
                                            {chatMessages.map((msg, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`p-3 rounded-lg shrink-0 ${msg.role === 'user'
                                                        ? 'bg-emerald-500/10 border border-emerald-500/20 ml-8'
                                                        : 'bg-zinc-900/50 border border-zinc-800 mr-8'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-2 mb-1">
                                                        {msg.role === 'user' ? (
                                                            <User className="w-3 h-3 text-emerald-400" />
                                                        ) : (
                                                            <Brain className="w-3 h-3 text-cyan-300" />
                                                        )}
                                                        <span className="text-xs font-bold text-zinc-400">
                                                            {msg.role === 'user' ? 'You' : 'StreamWire AI'}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-zinc-300 leading-relaxed">
                                                        {msg.role === 'user' ? (
                                                            // User messages: plain text, no markdown rendering
                                                            <p>{msg.content}</p>
                                                        ) : (
                                                            // AI messages: full markdown with syntax highlighting
                                                            <ReactMarkdown
                                                                remarkPlugins={REMARK_PLUGINS}
                                                                rehypePlugins={REHYPE_PLUGINS}
                                                                components={chatComponents}
                                                            >
                                                                {msg.content}
                                                            </ReactMarkdown>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            {/* Thinking indicator — shown inside the scrollable area */}
                                            {askQuestionMutation.isPending && (
                                                <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800 mr-8 shrink-0">
                                                    <div className="flex items-center gap-2">
                                                        <LoadingDots size="xs" className="text-emerald-400" />
                                                        <span className="text-sm text-zinc-400">Thinking...</span>
                                                    </div>
                                                </div>
                                            )}
                                            {/* scroll anchor */}
                                            <div ref={chatEndRef} />
                                        </div>

                                        {/* Question Input — always pinned at the bottom */}
                                        <form onSubmit={handleAskQuestion} className="flex gap-2 shrink-0">
                                            <input
                                                ref={chatInputRef}
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
                                                className="px-4 py-2 bg-linear-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                            >
                                                {askQuestionMutation.isPending ? (
                                                    <LoadingDots size="xs" />
                                                ) : (
                                                    <Send className="w-4 h-4" />
                                                )}
                                            </button>
                                        </form>
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
