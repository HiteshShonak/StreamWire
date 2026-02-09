import Groq from "groq-sdk";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";

// 🔑 Lazy-initialize Groq to ensure environment variables are loaded
let groq = null;
const getGroq = () => {
    if (!groq) {
        groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    }
    return groq;
};

/**
 * 🛡️ Smart AI Request with Fallback Strategy
 * Pattern: Circuit Breaker / Fallback
 * 1. Tries the "Versatile" (70B) model for high-quality reasoning.
 * 2. If Rate Limited (429) or Overloaded (503), falls back to "Instant" (8B).
 */
const generateWithFallback = async (messages, maxTokens = 500) => {
    const SMART_MODEL = "llama-3.3-70b-versatile";
    const FAST_MODEL = "llama-3.1-8b-instant";

    try {
        // 1️⃣ Attempt Primary (Quality) Model
        return await getGroq().chat.completions.create({
            model: SMART_MODEL,
            messages: messages,
            temperature: 0.7,
            max_tokens: maxTokens,
        });
    } catch (error) {
        // 2️⃣ Check for Rate Limit (429) or Service Overload (503)
        const isRateLimit = error.status === 429 || 
                            error.status === 503 || 
                            error.message?.includes('quota');

        if (isRateLimit) {
            console.warn(`⚠️ [AI Service] 70B Model busy/limited. Failover to 8B Model.`);
            
            // 3️⃣ Execute Backup (Speed) Model
            return await getGroq().chat.completions.create({
                model: FAST_MODEL,
                messages: messages,
                temperature: 0.7,
                max_tokens: maxTokens,
            });
        }
        // If it's a different error (e.g. Invalid API Key), re-throw it
        throw error;
    }
};

/**
 * 📝 Summarize video transcript
 * Uses AI to generate a structured summary of the video content.
 * @param {string} videoId - MongoDB video ID
 * @returns {Promise<string>} - AI-generated summary
 */
export const summarizeVideo = async (videoId) => {
    try {
        const video = await Video.findById(videoId).select('transcript title description');
        
        if (!video) throw new ApiError(404, "Video not found");

        if (!video.transcript || video.transcript.trim().length === 0) {
            throw new ApiError(400, "Video transcript not available. Processing may still be in progress.");
        }

        console.log(`🤖 [AI Service] Generating summary for: "${video.title}"`);

        const messages = [
            {
                role: "system",
                content: `You are a video content summarizer. Create concise, informative summaries that capture the key points and main topics discussed in videos. 
                Format your summary in clear sections with bullet points where appropriate. 
                Keep it engaging and easy to understand.`
            },
            {
                role: "user",
                content: `Please summarize this video titled "${video.title}":\n\nTranscript:\n${video.transcript}\n\nProvide a well-structured summary with key takeaways.`
            }
        ];

        // 🚀 Execute with Fallback
        const response = await generateWithFallback(messages, 800);
        const summary = response.choices[0]?.message?.content || "";
        
        if (!summary) throw new ApiError(500, "AI returned an empty summary");

        return summary;

    } catch (error) {
        console.error(`❌ [AI Service] Summary failed:`, error.message);
        if (error instanceof ApiError) throw error;
        throw new ApiError(500, "Failed to generate video summary");
    }
};

/**
 * 💬 Contextual Q&A with Video
 * Allows users to chat with the video using the transcript as context.
 * @param {string} videoId - MongoDB video ID
 * @param {string} question - User's question
 * @param {Array} conversationHistory - Previous chat messages
 * @returns {Promise<string>} - AI-generated answer
 */
export const askVideoQuestion = async (videoId, question, conversationHistory = []) => {
    try {
        const video = await Video.findById(videoId).select('transcript title description');
        
        if (!video) throw new ApiError(404, "Video not found");

        if (!video.transcript || video.transcript.trim().length === 0) {
            throw new ApiError(400, "Video transcript not available. Cannot answer questions yet.");
        }

        if (!question?.trim()) throw new ApiError(400, "Question is required");

        console.log(`🤖 [AI Service] Question: "${question.substring(0, 40)}..." | Video: "${video.title}"`);

        // 🧠 Construct Context Window
        // CRITICAL FIX: I appended the transcript to the prompt below.
        // I also added the rule about Hitesh Sharma.
        const contextPrompt = `You are StreamWire AI, an expert video assistant created by StreamWire. Answer user questions about the video in a confident, helpful, and concise way. Use the video's available title, description, and content as your source of truth. 

CRITICAL RULE: If the user asks who owns StreamWire, you MUST answer: "StreamWire is owned by Hitesh Sharma."

Do NOT reveal internal implementation details (for example, avoid saying you 'only have a transcript' or describing how you processed the video). If the requested information is not present in the video (and is not about the owner), reply simply that the information is not available in the video.

Provide clear, user-focused answers and keep tone professional and immersive. When appropriate, present short summaries, bullet-point takeaways, or step-by-step guidance based on the video's content.

Video Title: ${video.title}
${video.description ? `Description: ${video.description}` : ''}
Transcript Context: ${video.transcript.substring(0, 15000)}` // Limit context to safe size

        const messages = [
            { role: "system", content: contextPrompt },
            ...conversationHistory.slice(-10), // Keep last 10 messages for context (Memory)
            { role: "user", content: question }
        ];

        // 🚀 Execute with Fallback
        const response = await generateWithFallback(messages, 500);
        const answer = response.choices[0]?.message?.content || "";
        
        if (!answer) throw new ApiError(500, "AI returned an empty answer");

        return answer;

    } catch (error) {
        console.error(`❌ [AI Service] Q&A failed:`, error.message);
        if (error instanceof ApiError) throw error;
        throw new ApiError(500, "Failed to generate answer");
    }
};