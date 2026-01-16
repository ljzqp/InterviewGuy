/**
 * Attempts to parse a JSON string that might be incomplete (streaming).
 * It will try to "repair" the JSON by closing open brackets/braces.
 */
export const tryParseJSON = <T>(jsonString: string): T | null => {
    if (!jsonString) return null;

    try {
        // 1. Try generic robust parse first (handles markdown wrapping but expects valid JSON)
        // Similar to logic in openaiService but simplified here
        let cleanStr = jsonString;
        const match = jsonString.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
        if (match) {
            cleanStr = match[0];
        } else {
            // If no brackets found yet, it's not ready
            return null;
        }

        return JSON.parse(cleanStr);
    } catch (e) {
        // 2. Loose Mode: Attempt to repair truncated JSON
        // This is a naive implementation but works for many streaming cases
        try {
            let fixed = jsonString.trim();
            // Remove markdown format if start matches but end doesn't
            if (fixed.startsWith('```json')) fixed = fixed.replace('```json', '');
            if (fixed.startsWith('```')) fixed = fixed.replace('```', '');

            // AGGRESSIVE FIND: Locate the first '{' or '['
            // Sometimes models output text before the JSON, e.g. "Here is the analysis:"
            const firstBrace = fixed.indexOf('{');
            const firstBracket = fixed.indexOf('[');

            let startIdx = -1;
            if (firstBrace !== -1 && firstBracket !== -1) {
                startIdx = Math.min(firstBrace, firstBracket);
            } else if (firstBrace !== -1) {
                startIdx = firstBrace;
            } else if (firstBracket !== -1) {
                startIdx = firstBracket;
            }

            if (startIdx === -1) return null;

            // Discard everything before the first JSON character
            fixed = fixed.substring(startIdx);

            // Simple stack to count brackets
            const stack: string[] = [];
            let inString = false;
            let escape = false;

            for (let i = 0; i < fixed.length; i++) {
                const char = fixed[i];
                if (escape) {
                    escape = false;
                    continue;
                }
                if (char === '\\') {
                    escape = true;
                    continue;
                }
                if (char === '"') {
                    inString = !inString;
                    continue;
                }
                if (!inString) {
                    if (char === '{' || char === '[') {
                        stack.push(char);
                    } else if (char === '}' || char === ']') {
                        // Check match? assume well formed so far
                        stack.pop();
                    }
                }
            }

            // If stack not empty, append closing chars
            // Note: This logic assumes the truncation happens at the END
            // If it's inside a string value, we might need to close the string first
            // To keep it simple: we only close structure. 
            // Better libraries exist (like `best-effort-json-parser`) but we build simple here.

            // If we are inside a string (odd number of quotes?), close it
            if (inString) fixed += '"';

            while (stack.length > 0) {
                const open = stack.pop();
                if (open === '{') fixed += '}';
                if (open === '[') fixed += ']';
            }

            return JSON.parse(fixed);

        } catch (repairError) {
            return null;
        }
    }
};
