import OpenAI from 'openai'
import { NextResponse } from 'next/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { input } = await request.json()

    if (!input || typeof input !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input' },
        { status: 400 }
      )
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a nutrition expert. Parse food log entries and estimate nutritional values accurately. Respond ONLY with valid JSON, no markdown formatting.'
        },
        {
          role: 'user',
          content: `Parse this food log entry and estimate nutritional values. Be realistic and accurate.

Food input: "${input}"

Respond ONLY with valid JSON in this exact format (no markdown, no extra text):
{
  "description": "cleaned up description of what was eaten",
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number,
  "confidence": number between 0 and 1,
  "meal_type": "breakfast" | "lunch" | "dinner" | "snack" | null
}

Guidelines:
- Be conservative with portions if not specified
- Use standard serving sizes
- Round to whole numbers
- confidence should be 0.9+ if portions are specified, 0.6-0.8 if estimated
- Infer meal_type from the food or time context, or leave null if unclear`
        }
      ],
      response_format: { type: 'json_object' }
    })

    const content = completion.choices[0].message.content
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    // Parse the JSON response
    const parsed = JSON.parse(content)

    // Validate the response
    if (
      typeof parsed.description !== 'string' ||
      typeof parsed.calories !== 'number' ||
      typeof parsed.protein !== 'number' ||
      typeof parsed.carbs !== 'number' ||
      typeof parsed.fat !== 'number' ||
      typeof parsed.confidence !== 'number'
    ) {
      throw new Error('Invalid response format')
    }

    return NextResponse.json(parsed)
  } catch (error) {
    console.error('Error parsing food:', error)
    return NextResponse.json(
      { error: 'Failed to parse food entry' },
      { status: 500 }
    )
  }
}
