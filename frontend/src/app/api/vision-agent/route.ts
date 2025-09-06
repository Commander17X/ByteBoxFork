import { NextRequest, NextResponse } from 'next/server'

// Hugging Face Vision Models Configuration
const VISION_MODELS = {
  'llava-v1.6-mistral-7b': {
    apiUrl: 'https://api-inference.huggingface.co/models/llava-hf/llava-v1.6-mistral-7b-hf',
    maxTokens: 512
  },
  'llava-v1.5-7b': {
    apiUrl: 'https://api-inference.huggingface.co/models/llava-hf/llava-1.5-7b-hf',
    maxTokens: 512
  },
  'llava-v1.5-13b': {
    apiUrl: 'https://api-inference.huggingface.co/models/llava-hf/llava-1.5-13b-hf',
    maxTokens: 1024
  },
  'qwen-vl-7b': {
    apiUrl: 'https://api-inference.huggingface.co/models/Qwen/Qwen-VL-7B-Chat',
    maxTokens: 512
  },
  'instructblip-vicuna-7b': {
    apiUrl: 'https://api-inference.huggingface.co/models/Salesforce/instructblip-vicuna-7b',
    maxTokens: 512
  }
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, image, model = 'llava-v1.6-mistral-7b' } = await request.json()

    if (!prompt && !image) {
      return NextResponse.json(
        { error: 'Prompt or image is required' },
        { status: 400 }
      )
    }

    const modelConfig = VISION_MODELS[model as keyof typeof VISION_MODELS]
    if (!modelConfig) {
      return NextResponse.json(
        { error: 'Invalid model selected' },
        { status: 400 }
      )
    }

    // Prepare the request payload for Hugging Face API
    const payload: any = {
      inputs: prompt || "What do you see in this image?",
      parameters: {
        max_new_tokens: modelConfig.maxTokens,
        temperature: 0.7,
        top_p: 0.9,
        do_sample: true
      }
    }

    // If image is provided, add it to the payload
    if (image) {
      // Convert base64 image to the format expected by Hugging Face
      payload.inputs = {
        image: image,
        question: prompt || "What do you see in this image?"
      }
    }

    // Get Hugging Face API token from environment
    const hfToken = process.env.HUGGINGFACE_API_TOKEN

    if (!hfToken) {
      console.warn('Hugging Face API token not found. Using mock response.')
      // Return a mock response for development
      return NextResponse.json({
        response: `I can see this is an image you've uploaded. ${prompt ? `Regarding your question "${prompt}", ` : ''}I would need a Hugging Face API token to provide a real analysis. Please add HUGGINGFACE_API_TOKEN to your environment variables.`
      })
    }

    // Call Hugging Face API
    const response = await fetch(modelConfig.apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hfToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Hugging Face API error:', response.status, errorText)
      
      // Handle rate limiting and model loading
      if (response.status === 503) {
        return NextResponse.json({
          response: "The vision model is currently loading. Please wait a moment and try again. This usually takes 10-30 seconds for the first request."
        })
      }
      
      if (response.status === 429) {
        return NextResponse.json({
          response: "Rate limit exceeded. Please wait a moment before making another request."
        })
      }

      return NextResponse.json({
        response: "Sorry, I'm having trouble processing your request right now. Please try again in a moment."
      })
    }

    const data = await response.json()

    // Extract the response text from different possible response formats
    let responseText = ''
    
    if (Array.isArray(data) && data.length > 0) {
      // Handle array response format
      responseText = data[0].generated_text || data[0].answer || data[0].text || JSON.stringify(data[0])
    } else if (data.generated_text) {
      // Handle direct generated_text format
      responseText = data.generated_text
    } else if (data.answer) {
      // Handle answer format
      responseText = data.answer
    } else if (data.text) {
      // Handle text format
      responseText = data.text
    } else {
      // Fallback to stringify the entire response
      responseText = JSON.stringify(data)
    }

    // Clean up the response text
    if (responseText.includes(prompt)) {
      responseText = responseText.replace(prompt, '').trim()
    }

    return NextResponse.json({
      response: responseText || "I processed your request but couldn't generate a clear response. Please try rephrasing your question."
    })

  } catch (error) {
    console.error('Vision API error:', error)
    return NextResponse.json(
      { 
        response: "I encountered an error while processing your request. Please try again." 
      },
      { status: 500 }
    )
  }
}

// Handle GET requests for model information
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  if (action === 'get_models') {
    return NextResponse.json({
      models: Object.keys(VISION_MODELS).map(key => ({
        id: key,
        name: VISION_MODELS[key as keyof typeof VISION_MODELS].apiUrl.split('/').pop(),
        maxTokens: VISION_MODELS[key as keyof typeof VISION_MODELS].maxTokens
      }))
    })
  }

  return NextResponse.json({ message: 'Vision Agent API is running' })
}