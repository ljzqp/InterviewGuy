import { InterviewQuestion, EvaluationResult, FileData } from "../types";

import { tryParseJSON } from "../utils/jsonUtils";

// Helper to log requests securely
const logRequest = (url: string, body: any, apiKey: string) => {
    const maskedKey = apiKey ? `${apiKey.substring(0, 3)}...${apiKey.substring(apiKey.length - 4)}` : 'NOT_SET';
    const bodyCopy = JSON.parse(JSON.stringify(body));

    // Clone request for safer logging if needed, or just log the structure
    console.group("🚀 OpenAI API Request");
    console.log("URL:", url);
    console.log("API Key:", maskedKey);
    console.log("Payload:", bodyCopy);
    console.groupEnd();
};

// Helper to extract JSON from markdown or raw text
const extractJson = (text: string): any => {
    const result = tryParseJSON(text);
    if (result) return result;

    console.error("JSON Extraction Failed. Content length:", text.length, "Preview:", text.substring(0, 100) + "..." + text.substring(text.length - 100));
    throw new Error("Could not parse JSON response (Auto-repair failed).");
};

const callOpenAI = async (
    apiKey: string,
    messages: any[],
    responseSchema: any = null,
    onStream?: (chunk: string) => void
) => {
    // Use config key if not passed explicitly.
    const finalKey = apiKey || (import.meta as any).env.VITE_API_KEY;
    if (!finalKey) throw new Error("API Key is missing. Please check .env.local configuration.");

    const url = "https://llm-pool-common.nlp.yuntingai.com/chat/completions";

    const body: any = {
        model: "anthropic/claude-4-5-sonnet-latest",
        messages: messages,
        temperature: 0.1,
        n: 1,
        stream: true, // Enable streaming
        metadata: {
            user_id: "CEM-TOPIC-VALUE-EXTRACT"
        }
    };

    logRequest(url, body, finalKey);

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${finalKey}`
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("API Error:", errorData);
            throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
        }

        if (!response.body) throw new Error("No response body.");

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let done = false;
        let fullContent = "";

        console.log("[Stream] Starting stream reading...");

        while (!done) {
            const { value, done: DONE } = await reader.read();
            done = DONE;
            const chunk = decoder.decode(value, { stream: true });

            // Console log raw chunk for debugging (optional, can be noisy)
            // console.log("[Stream] Raw chunk:", chunk);

            // Process SSE lines
            const lines = chunk.split('\n');
            for (const line of lines) {
                if (line.trim() === '') continue;
                if (line.trim() === 'data: [DONE]') continue; // Changed from break to continue
                if (line.startsWith('data: ')) {
                    try {
                        const json = JSON.parse(line.replace('data: ', '')); // Changed substring(6) to replace('data: ', '')
                        const content = json.choices[0]?.delta?.content || "";
                        if (content) {
                            fullContent += content;
                            if (onStream) {
                                // console.log("[Stream] Emitting content:", content);
                                onStream(content);
                            }
                        }
                    } catch (e) {
                        console.warn("[Stream] Error parsing line:", line, e); // Changed log message
                    }
                }
            }
        }

        console.log("[Stream] Finished. Full content length:", fullContent.length);
        // Final JSON parse attempting to be robust
        return extractJson(fullContent);

    } catch (e) {
        console.error("Stream/Fetch Error:", e);
        throw e;
    }
};

/**
 * Generate interview questions based on Resume and JD.
 */
export const generateQuestions = async (
    apiKey: string,
    jd: string,
    resumes: FileData[],
    extraRequirements: string,
    systemInstruction: string,
    onStream?: (chunk: string) => void
): Promise<InterviewQuestion[]> => {

    // Construct the prompt
    let userContent = `职位描述 (JD):\n${jd}\n\n`;

    if (extraRequirements) {
        userContent += `额外要求:\n${extraRequirements}\n\n`;
    }

    userContent += "请分析附件中的简历内容 (Resume Content is below)，并根据上述要求生成一份包含6-8个综合性面试题的列表。\n";
    userContent += "输出必须是纯 JSON 数组格式，符合以下 TypeScript 接口:\n";
    userContent += `
  interface InterviewQuestion {
    id: string; // unique id
    category: string; // e.g. "技术深度", "软技能"
    scenario: string; // 具体的场景化提问
    intent: string; // 考察意图
    keyPoints: string[]; // 优秀回答关键词
    difficulty: 'Foundation' | 'Advanced' | 'Expert';
  }
  `;

    // Append resume text content if possible.
    // Since we only have base64 or text data, OpenAI Vision can accept images, but for PDF/Text it's better to pass text.
    // The current app seems to assume base64. If it's an image, we can use GPT-4o Vision.
    // If it's a PDF, we might need to extract text on client side or treat as image if converted?
    // Looking at App.tsx, it reads as DataURL.

    const contentParts: any[] = [{ type: "text", text: userContent }];

    resumes.forEach((file, index) => {
        // Enhanced file handling for the custom API
        // It expects: { type: "file", file: { file_data: "data:xxx;base64,xxx" } }
        // This works for both PDF and Images
        contentParts.push({
            type: "file",
            file: {
                file_data: file.data // file.data is already "data:mime;base64,..."
            }
        });
    });

    const messages = [
        { role: "system", content: systemInstruction },
        { role: "user", content: contentParts }
    ];

    return callOpenAI(apiKey, messages, true, onStream);
};

export const evaluateCandidate = async (
    apiKey: string,
    transcript: string,
    questions: InterviewQuestion[],
    jd: string,
    systemInstruction: string,
    onStream?: (chunk: string) => void,
    transcriptFiles: FileData[] = []
): Promise<EvaluationResult> => {
    let transcriptContent = "";
    if (transcript.trim()) {
        transcriptContent = `面试对话记录 (Transcript Text):\n${transcript}\n\n`;
    }

    const prompt = `
    职位描述 (JD): ${jd}
    
    上下文 (已问问题):
    ${JSON.stringify(questions.map(q => q.scenario))}

    ${transcriptContent}

    请根据面试记录（包含附件文件或上述文本），按照系统指令的要求进行详细评估。
    输出必须是纯 JSON 格式，符合 EvaluationResult 接口结构。
  `;

    const contentParts: any[] = [{ type: "text", text: prompt }];

    transcriptFiles.forEach((file) => {
        contentParts.push({
            type: "file",
            file: {
                file_data: file.data
            }
        });
    });

    const messages = [
        { role: "system", content: systemInstruction },
        { role: "user", content: contentParts }
    ];

    return callOpenAI(apiKey, messages, true, onStream);
};
