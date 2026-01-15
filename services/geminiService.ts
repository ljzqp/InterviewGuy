import { GoogleGenAI, Type } from "@google/genai";
import { InterviewQuestion, EvaluationResult, FileData } from "../types";

const apiKey = process.env.API_KEY || ''; // Injected by environment
const ai = new GoogleGenAI({ apiKey });

/**
 * Generate interview questions based on Resume and JD.
 */
export const generateQuestions = async (
  jd: string,
  resumes: FileData[],
  extraRequirements: string,
  systemInstruction: string
): Promise<InterviewQuestion[]> => {
  const model = "gemini-3-pro-preview";

  // Prepare prompt parts
  const parts: any[] = [];
  
  parts.push({ text: `职位描述 (JD):\n${jd}\n\n` });
  if (extraRequirements) {
    parts.push({ text: `额外要求:\n${extraRequirements}\n\n` });
  }
  parts.push({ text: "请分析附件中的简历，并根据上述要求生成一份包含6-8个综合性面试题的列表，专门用于验证候选人是否符合该职位。" });

  // Add images/PDFs
  resumes.forEach(file => {
    // Remove data URL prefix for the API
    const base64Data = file.data.split(',')[1];
    parts.push({
      inlineData: {
        mimeType: file.type,
        data: base64Data
      }
    });
  });

  const response = await ai.models.generateContent({
    model,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            category: { type: Type.STRING, description: "类别，例如：技术深度、软技能、AI应用、领导力等" },
            scenario: { type: Type.STRING, description: "具体的场景化提问内容" },
            intent: { type: Type.STRING, description: "考察意图：这道题具体在考察什么能力" },
            keyPoints: { type: Type.ARRAY, items: { type: Type.STRING }, description: "优秀回答中应包含的关键词或概念" },
            difficulty: { type: Type.STRING, enum: ["Foundation", "Advanced", "Expert"] }
          },
          required: ["id", "category", "scenario", "intent", "keyPoints", "difficulty"]
        }
      }
    },
    contents: {
      role: "user",
      parts: parts
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  
  return JSON.parse(text) as InterviewQuestion[];
};

/**
 * Evaluate the candidate based on the interview transcript.
 */
export const evaluateCandidate = async (
  transcript: string,
  questions: InterviewQuestion[],
  jd: string,
  systemInstruction: string
): Promise<EvaluationResult> => {
  const model = "gemini-3-pro-preview";

  const prompt = `
    职位描述 (JD): ${jd}
    
    上下文 (已问问题):
    ${JSON.stringify(questions.map(q => q.scenario))}

    面试对话记录 (Transcript):
    ${transcript}

    请根据对话记录，按照系统指令的要求进行详细评估。
  `;

  const response = await ai.models.generateContent({
    model,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING, description: "候选人综合评价摘要" },
          radarData: {
            type: Type.ARRAY,
            description: "雷达图数据",
            items: {
              type: Type.OBJECT,
              properties: {
                subject: { type: Type.STRING, description: "维度名称，例如：技术能力、沟通能力、AI应用、领导力" },
                A: { type: Type.NUMBER, description: "得分 0-100" },
                fullMark: { type: Type.NUMBER, description: "总是 100" }
              }
            }
          },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "主要优势列表" },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "主要劣势/风险点列表" },
          hiringRecommendation: { type: Type.STRING, enum: ["Strong Hire", "Hire", "Caution", "No Hire"] },
          reasoning: { type: Type.STRING, description: "给出该录用建议的详细理由" }
        }
      }
    },
    contents: prompt
  });

  const text = response.text;
  if (!text) throw new Error("No evaluation response");

  return JSON.parse(text) as EvaluationResult;
};