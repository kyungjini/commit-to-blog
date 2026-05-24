import { generateBlogPost } from '../services/geminiService.js'
import {
  buildCommitBlogPrompt,
  validateCommitPayload,
} from '../services/promptService.js'
import { HttpError } from '../utils/httpError.js'

export async function generatePost(req, res, next) {
  try {
    const { branch, commits, repository } = req.body || {}
    const validationError = validateCommitPayload(commits)

    if (validationError) {
      throw new HttpError(400, validationError)
    }

    const prompt = buildCommitBlogPrompt({
      branch,
      commits,
      repository,
    })
    const generatedPost = await generateBlogPost(prompt)

    res.json({
      markdown: generatedPost.text,
      model: generatedPost.model,
    })
  } catch (err) {
    next(err)
  }
}
