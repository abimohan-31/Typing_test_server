import dotenv from "dotenv";
dotenv.config();

/**
 * Topics pool to ensure high diversity across multiple generations
 */
const TOPIC_POOL = [
  "the evolution of modern technology and artificial intelligence",
  "exploring the mysteries of deep oceans and marine biology",
  "the history of space exploration and distant planetary systems",
  "the psychology of habits, focus, and human productivity",
  "sustainable energy, solar innovations, and preserving our planet",
  "the art of architecture and how buildings shape civilization",
  "the power of storytelling, literature, and human communication",
  "classical music, sound design, and the science of acoustics",
  "the wonders of ancient history and forgotten archaeological sites",
  "mindfulness, resilience, and maintaining balance in modern life",
  "the rise of global transportation, aviation, and superfast trains",
  "culinary arts, global spices, and the culture of shared meals"
];

/**
 * Fallback paragraphs for offline/error passage generation
 */
const FALLBACK_PARAGRAPHS = [
  "Mastering the art of typing requires patience, consistency, and steady focus over time. As you press each key on your keyboard, your fingers develop muscle memory that allows ideas to flow seamlessly onto the screen. High speed in typing is a natural outcome of maintaining steady accuracy and rhythm. When you practice every day, complex character sequences become second nature.",
  "Technology has transformed how human beings communicate across vast distances in milliseconds. From written letters carried by horses to instant digital messages sent across continents, our global connectivity continues to evolve rapidly. Software systems, hardware components, and cloud infrastructure work in harmony to power the software platforms we rely on daily.",
  "Deep beneath the surface of Earth's oceans lies a world of quiet wonder and unexplored terrain. Scientific research teams uncover fascinating sea creatures and underwater mountain ranges that have existed for millions of years. Understanding marine ecosystems helps scientists preserve biodiversity and protect our natural environment for future generations.",
  "Space exploration challenges our understanding of the universe and inspires future generations of scientists and engineers. Distant stars, nebulae, and solar systems remind us of how vast the cosmos truly is. Sending probes beyond our atmosphere provides valuable data that unlocks answers about the origin of planets and galaxies.",
  "Effective teamwork relies on open communication, mutual trust, and clear goals shared among members. When individuals collaborate effectively, they combine their unique strengths to solve complex problems. Learning how to listen actively and support one another builds a healthy workplace culture where everyone can thrive."
];

/**
 * Generate a fallback passage matched to target duration (word count)
 */
export function generateFallbackPassage(durationMinutes = 1) {
  const targetWords = Math.max(90, Math.ceil(durationMinutes * 95));
  let resultWords = [];
  
  // Shuffle fallback pool
  const pool = [...FALLBACK_PARAGRAPHS].sort(() => 0.5 - Math.random());
  
  while (resultWords.length < targetWords) {
    for (const paragraph of pool) {
      const words = paragraph.split(/\s+/);
      resultWords.push(...words);
      if (resultWords.length >= targetWords) break;
    }
  }

  const text = resultWords.slice(0, targetWords).join(" ");
  return {
    text,
    wordCount: targetWords,
    characterCount: text.length,
    isAiGenerated: false,
  };
}

/**
 * Clean up text returned by AI model to ensure plain typing text format
 */
function cleanGeneratedText(rawText) {
  if (!rawText) return "";
  
  return rawText
    // Remove code block markers
    .replace(/```[\s\S]*?```/g, "")
    // Remove markdown headers
    .replace(/^#+\s+/gm, "")
    // Remove markdown bold/italics
    .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, "$1")
    // Remove surrounding quotes if model added them
    .replace(/^["']|["']$/g, "")
    // Replace multiple spaces or newlines with a single space
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Main AI Passage Generation Service using Google Gemini API
 * @param {number} durationMinutes - Duration in minutes (e.g. 1, 2, 5, 10)
 * @returns {Promise<{text: string, wordCount: number, characterCount: number, isAiGenerated: boolean}>}
 */
export async function generateAIPassage(durationMinutes = 1) {
  const apiKey = process.env.GEMINI_API_KEY || process.env["Gemini API Key"];
  const numMinutes = Math.max(1, Number(durationMinutes) || 1);
  const targetWordCount = Math.max(90, Math.ceil(numMinutes * 95));

  if (!apiKey) {
    console.warn("[AI Service] Warning: GEMINI_API_KEY not found in environment. Using fallback generator.");
    return generateFallbackPassage(numMinutes);
  }

  // Pick a random topic to guarantee variety
  const randomTopic = TOPIC_POOL[Math.floor(Math.random() * TOPIC_POOL.length)];
  const randomSeed = Math.floor(Math.random() * 1000000);

  const prompt = `Write a clear, natural, engaging, and grammatically correct English passage for a ${numMinutes}-minute typing test.
The passage MUST contain at least ${targetWordCount} words.
Topic focus: ${randomTopic} (Variation ID: ${randomSeed}).

STRICT RULES:
1. Output ONLY the raw plain text of the typing passage.
2. Do NOT include any title, header, label, or introductory phrase.
3. Do NOT use any markdown tags, bold, italics, bullet points, or quotes.
4. Use standard English sentences, natural vocabulary, and standard punctuation (periods, commas, capitalization).
5. Ensure the passage flows smoothly from sentence to sentence.`;

  // Candidate models to try in order
  const models = [
    "gemini-2.5-flash",
    "gemini-1.5-flash",
    "gemini-2.0-flash",
  ];

  for (const model of models) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: Math.min(8192, Math.max(1000, targetWordCount * 6)),
          },
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.warn(`[AI Service] Model ${model} returned status ${response.status}: ${errText}`);
        continue; // try next model
      }

      const data = await response.json();
      const rawOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      const cleaned = cleanGeneratedText(rawOutput);

      const words = cleaned.split(/\s+/).filter(Boolean);

      // Validate output quality and length
      if (cleaned && words.length >= Math.floor(targetWordCount * 0.7)) {
        return {
          text: cleaned,
          wordCount: words.length,
          characterCount: cleaned.length,
          isAiGenerated: true,
        };
      } else if (cleaned && words.length > 30) {
        // If text generated is a bit short, extend with fallback to satisfy target duration
        const extraNeeded = targetWordCount - words.length;
        if (extraNeeded > 0) {
          const fallback = generateFallbackPassage(1);
          const extraWords = fallback.text.split(/\s+/).slice(0, extraNeeded).join(" ");
          const combinedText = `${cleaned} ${extraWords}`;
          return {
            text: combinedText,
            wordCount: combinedText.split(/\s+/).length,
            characterCount: combinedText.length,
            isAiGenerated: true,
          };
        }
        return {
          text: cleaned,
          wordCount: words.length,
          characterCount: cleaned.length,
          isAiGenerated: true,
        };
      }
    } catch (err) {
      console.warn(`[AI Service] Error calling ${model}:`, err.message);
    }
  }

  // If all models failed or key issue, use fallback generator
  console.warn("[AI Service] Fallback generator activated after API attempts.");
  return generateFallbackPassage(numMinutes);
}
