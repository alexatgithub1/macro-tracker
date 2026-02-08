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
          content: 'You are a fitness expert. Parse workout log entries and estimate workout details accurately. Respond ONLY with valid JSON, no markdown formatting.'
        },
        {
          role: 'user',
          content: `Parse this workout log entry and estimate workout details. Assume the person is a 38-year-old male, 185 lbs, moderately active.

Workout input: "${input}"

Respond ONLY with valid JSON in this exact format (no markdown, no extra text):
{
  "type": "strength" | "cardio" | "walk" | "other",
  "duration": number (in minutes),
  "calories_burned": number (estimated kcal burned),
  "notes": "brief summary of the workout" | null
}

Guidelines:
- Be realistic with calorie estimates (don't overestimate)
- For strength training: ~5-8 kcal per minute
- For running: ~10-12 kcal per minute
- For walking: ~3-5 kcal per minute
- For cycling: ~8-10 kcal per minute
- If duration is not specified, make a reasonable estimate
- Round to whole numbers
- notes should be a clean summary if there are details, or null if simple`
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
      typeof parsed.type !== 'string' ||
      typeof parsed.duration !== 'number' ||
      typeof parsed.calories_burned !== 'number'
    ) {
      throw new Error('Invalid response format')
    }

    return NextResponse.json(parsed)
  } catch (error) {
    console.error('Error parsing workout:', error)
    return NextResponse.json(
      { error: 'Failed to parse workout entry' },
      { status: 500 }
    )
  }
}
