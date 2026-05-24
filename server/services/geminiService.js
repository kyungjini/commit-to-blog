import { config, validateGeminiConfig } from '../config/env.js'
import { HttpError } from '../utils/httpError.js'

function extractGeminiText(payload) {
  return (
    payload?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text)
      .filter(Boolean)
      .join('\n')
      .trim() || ''
  )
}

export async function generateBlogPost(prompt) {
  const missingKeys = validateGeminiConfig()

  if (missingKeys.length > 0) {
    throw new HttpError(
      500,
      `Missing Gemini configuration: ${missingKeys.join(', ')}`,
    )
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), config.gemini.requestTimeoutMs)
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${config.gemini.model}:generateContent?key=${config.gemini.apiKey}`

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          topP: 0.9,
        },
      }),
    })

    const payload = await response.json().catch(() => null)

    if (!response.ok) {
      throw new HttpError(
        response.status,
        payload?.error?.message || 'Gemini content generation failed',
        payload?.error,
      )
    }

    const text = extractGeminiText(payload)

    if (!text) {
      throw new HttpError(502, 'Gemini response did not include generated text')
    }

    return {
      model: config.gemini.model,
      text,
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new HttpError(504, 'Gemini content generation timed out')
    }

    throw err
  } finally {
    clearTimeout(timeoutId)
  }
}
