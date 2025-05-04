import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { description } = await request.json();
    if (!description) {
      return NextResponse.json({ error: 'No description provided' }, { status: 400 });
    }

    // Call Tavily Search API with stricter prompt
    const tavilyRes = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.TAVILY_API_KEY}`,
      },
      body: JSON.stringify({
        query: `Strictly search only using "https://www.nutritionix.com/" and nothing else. For this meal: ${description}. In the response only give the total macros and calories and nothing else. Respond in the format: Calories: X, Protein: Yg, Carbs: Zg, Fat: Wg`,
        include_answer: true,
        topic: "general"
      }),
    });

    const tavilyData = await tavilyRes.json();
    console.log('Tavily response:', tavilyData);

    // Example response: "Calories: 500, Protein: 30g, Carbs: 60g, Fat: 15g"
    const match = tavilyData.answer?.match(/Calories: ([\d.]+), Protein: ([\d.]+)g, Carbs: ([\d.]+)g, Fat: ([\d.]+)g/i);
    if (!match) {
      return NextResponse.json({ error: 'Could not parse macros from Tavily response', raw: tavilyData.answer }, { status: 400 });
    }

    return NextResponse.json({
      calories: Number(match[1]),
      protein: Number(match[2]),
      carbs: Number(match[3]),
      fat: Number(match[4]),
    });
  } catch (error) {
    console.error('Error analyzing meal:', error);
    return NextResponse.json(
      { error: 'Failed to analyze meal' },
      { status: 500 }
    );
  }
} 