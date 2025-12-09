import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const bloomLevels = [
  { level: 1, name: "Remember", description: "Recall facts and basic concepts", verbs: "define, list, name, recall, identify" },
  { level: 2, name: "Understand", description: "Explain ideas or concepts", verbs: "describe, explain, summarize, interpret, classify" },
  { level: 3, name: "Apply", description: "Use information in new situations", verbs: "solve, demonstrate, apply, use, implement" },
  { level: 4, name: "Analyze", description: "Draw connections among ideas", verbs: "compare, contrast, examine, differentiate, analyze" },
  { level: 5, name: "Evaluate", description: "Justify a decision or course of action", verbs: "judge, critique, evaluate, justify, argue" },
  { level: 6, name: "Create", description: "Produce new or original work", verbs: "design, construct, develop, formulate, create" }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subject, bloomLevel, topic } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const currentBloom = bloomLevels.find(b => b.level === bloomLevel) || bloomLevels[0];

    const systemPrompt = `You are an expert educational quiz generator. Generate quiz questions based on Bloom's Taxonomy levels.
    
Current Bloom's Level: ${currentBloom.name} (Level ${currentBloom.level})
Description: ${currentBloom.description}
Action verbs to use: ${currentBloom.verbs}

Generate exactly 1 multiple choice question that tests the student at this specific Bloom's taxonomy level.
The question should be challenging but fair for this cognitive level.

Return ONLY a valid JSON object with this exact structure (no markdown, no code blocks):
{
  "question": "The question text",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctIndex": 0,
  "explanation": "Brief explanation of why this is correct",
  "bloomLevel": ${bloomLevel},
  "bloomName": "${currentBloom.name}"
}`;

    const userPrompt = `Generate a ${currentBloom.name}-level question about ${topic || subject}.
Subject: ${subject}
${topic ? `Specific topic: ${topic}` : ''}

Remember: Return ONLY the JSON object, no additional text.`;

    console.log(`Generating quiz question for ${subject} at Bloom's Level ${bloomLevel} (${currentBloom.name})`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Usage limit reached. Please add credits.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in AI response');
    }

    // Clean up the response - remove markdown code blocks if present
    let cleanContent = content.trim();
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.slice(7);
    } else if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.slice(3);
    }
    if (cleanContent.endsWith('```')) {
      cleanContent = cleanContent.slice(0, -3);
    }
    cleanContent = cleanContent.trim();

    const quizData = JSON.parse(cleanContent);

    console.log('Successfully generated quiz question');

    return new Response(JSON.stringify(quizData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating quiz:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Failed to generate quiz question' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
