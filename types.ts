export enum AppStep {
  SETUP = 'SETUP',
  ANALYZING = 'ANALYZING',
  QUESTIONS = 'QUESTIONS',
  TRANSCRIPT_UPLOAD = 'TRANSCRIPT_UPLOAD',
  EVALUATING = 'EVALUATING',
  RESULTS = 'RESULTS'
}

export interface InterviewQuestion {
  id: string;
  category: string;
  scenario: string;
  intent: string; // What ability is being tested
  keyPoints: string[]; // Keywords/Excellent answer indicators
  difficulty: 'Foundation' | 'Advanced' | 'Expert';
}

export interface EvaluationResult {
  summary: string;
  radarData: { subject: string; A: number; fullMark: number }[];
  strengths: string[];
  weaknesses: string[];
  hiringRecommendation: 'Strong Hire' | 'Hire' | 'Caution' | 'No Hire';
  reasoning: string;
  followUp?: string[]; // For appended content
}

export interface FileData {
  name: string;
  type: string;
  data: string; // Base64
}

export interface JdItem {
  id: string;
  title: string;
  content: string;
}

export const PREDEFINED_JDS: JdItem[] = [
  {
    id: 'senior-frontend',
    title: '高级前端工程师 (Senior Frontend)',
    content: "我们需要一位拥有5年以上React、TypeScript和现代状态管理经验的高级前端工程师。你将主导架构决策，指导初级工程师，并确保高性能。有AI集成和WebGL经验者优先。"
  },
  {
    id: 'product-manager',
    title: '高级产品经理 - AI方向 (Senior PM)',
    content: "寻找一位产品经理来领导我们的GenAI垂直领域。必须具备B2B SaaS经验，能够从0到1定义产品战略，并与工程团队紧密合作。需要强大的数据分析和沟通能力。"
  },
  {
    id: 'backend-architect',
    title: '后端系统架构师 (Backend Architect)',
    content: "使用Go和Kubernetes设计可扩展的分布式系统。需要深入理解微服务、数据库优化（SQL/NoSQL）和云基础设施（AWS/GCP）。"
  }
];