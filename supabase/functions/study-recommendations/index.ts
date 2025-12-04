import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BLOOMS_LEVELS = [
  { level: 1, name: 'Remember', description: 'Recall facts and basic concepts', verbs: 'define, list, memorize, recall, repeat' },
  { level: 2, name: 'Understand', description: 'Explain ideas or concepts', verbs: 'classify, describe, discuss, explain, identify' },
  { level: 3, name: 'Apply', description: 'Use information in new situations', verbs: 'execute, implement, solve, use, demonstrate' },
  { level: 4, name: 'Analyze', description: 'Draw connections among ideas', verbs: 'differentiate, organize, relate, compare, contrast' },
  { level: 5, name: 'Evaluate', description: 'Justify a decision or course of action', verbs: 'appraise, argue, defend, judge, critique' },
  { level: 6, name: 'Create', description: 'Produce new or original work', verbs: 'design, assemble, construct, develop, formulate' },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subject, currentLevel, performanceScore, topics } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const currentBloomsLevel = BLOOMS_LEVELS.find(b => b.level === currentLevel) || BLOOMS_LEVELS[0];
    const nextLevel = BLOOMS_LEVELS.find(b => b.level === currentLevel + 1);

    const systemPrompt = `You are an educational AI assistant specializing in personalized learning recommendations based on Bloom's Taxonomy. Your role is to suggest study materials, resources, and learning strategies tailored to a student's current cognitive level.

Bloom's Taxonomy Levels (from lowest to highest):
1. Remember - Recall facts and basic concepts
2. Understand - Explain ideas or concepts  
3. Apply - Use information in new situations
4. Analyze - Draw connections among ideas
5. Evaluate - Justify decisions or courses of action
6. Create - Produce new or original work

Always provide actionable, specific recommendations with real resource types (videos, articles, practice problems, projects, etc.).`;

    const userPrompt = `A student needs study material recommendations with the following profile:

Subject: ${subject || 'General Studies'}
Current Bloom's Level: ${currentBloomsLevel.level} - ${currentBloomsLevel.name} (${currentBloomsLevel.description})
Performance Score: ${performanceScore || 75}%
Topics of Interest: ${topics?.join(', ') || 'Not specified'}

Please provide:
1. 3-5 specific study material recommendations appropriate for their current level
2. Learning strategies to help them progress to the next level${nextLevel ? ` (${nextLevel.name})` : ''}
3. Types of practice activities that would reinforce learning at their level
4. Warning signs that indicate they should review foundational concepts

Format your response as a JSON object with these keys:
- recommendations: array of {title, type, description, bloomsLevel, estimatedTime}
- strategies: array of strings with learning tips
- practiceActivities: array of {activity, description, bloomsLevel}
- foundationalReview: array of strings with warning signs`;

    console.log('Calling Lovable AI for study recommendations...');

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
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI usage limit reached. Please add credits.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    console.log('AI Response received:', aiResponse?.substring(0, 200));

    // Try to parse JSON from the response
    let parsedRecommendations;
    try {
      // Extract JSON from the response (handle markdown code blocks)
      const jsonMatch = aiResponse.match(/```json\n?([\s\S]*?)\n?```/) || 
                       aiResponse.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : aiResponse;
      parsedRecommendations = JSON.parse(jsonStr);
    } catch (parseError) {
      console.log('Could not parse JSON, returning raw response');
      parsedRecommendations = {
        recommendations: [],
        strategies: [aiResponse],
        practiceActivities: [],
        foundationalReview: [],
        rawResponse: aiResponse
      };
    }

    return new Response(JSON.stringify({
      ...parsedRecommendations,
      currentLevel: currentBloomsLevel,
      nextLevel: nextLevel || null,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in study-recommendations function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
