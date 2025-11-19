import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

async function generateSuggestions(opportunityName: string, contactName: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-3-pro-preview' })

  const prompt = `
    Based on the following sales opportunity, suggest 3-5 brief, actionable tasks for a sales representative.
    Return the tasks as a JSON array of strings.

    Opportunity Name: "${opportunityName}"
    Contact Name: "${contactName}"

    Example format:
    [
      "Follow up with ${contactName} about the proposal",
      "Schedule a demo for ${contactName}",
      "Send pricing information to ${contactName}"
    ]
  `

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    // Clean the response to ensure it's valid JSON
    const jsonString = text.replace(/```json|```/g, '').trim()
    const suggestions = JSON.parse(jsonString)
    return suggestions
  } catch (error) {
    console.error('Error generating task suggestions:', error)
    return null
  }
}

export async function POST(request: Request) {
  try {
    const { opportunityName, contactName } = await request.json()

    if (!opportunityName || !contactName) {
      return NextResponse.json({ error: 'Opportunity name and contact name are required' }, { status: 400 })
    }

    const suggestions = await generateSuggestions(opportunityName, contactName)

    if (!suggestions) {
      return NextResponse.json({ error: 'Failed to generate task suggestions' }, { status: 500 })
    }

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error('Error in suggest-tasks endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
