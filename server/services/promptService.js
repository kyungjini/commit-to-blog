const maxCommitCount = 50
const maxCommitMessageLength = 2000

export function validateCommitPayload(commits) {
  if (!Array.isArray(commits) || commits.length === 0) {
    return 'At least one commit is required'
  }

  if (commits.length > maxCommitCount) {
    return `A maximum of ${maxCommitCount} commits can be summarized at once`
  }

  const invalidCommit = commits.find(
    (commit) => !commit || typeof commit.message !== 'string' || !commit.message.trim(),
  )

  if (invalidCommit) {
    return 'Each commit must include a non-empty message'
  }

  return ''
}

export function buildCommitBlogPrompt({ branch, commits, repository }) {
  const commitLines = commits
    .map((commit, index) => {
      const message = commit.message.trim().slice(0, maxCommitMessageLength)
      const sha = commit.shortSha || commit.sha?.slice(0, 7) || 'unknown'
      const author = commit.author || 'Unknown author'
      const date = commit.date || 'Unknown date'

      return [
        `Commit ${index + 1}`,
        `SHA: ${sha}`,
        `Author: ${author}`,
        `Date: ${date}`,
        `Message:\n${message}`,
      ].join('\n')
    })
    .join('\n\n')

  return [
    'You are a senior developer advocate writing a concise engineering blog post from Git commit history.',
    'Write in English only.',
    'Use Markdown.',
    'Do not invent implementation details that are not supported by the commits.',
    'Prefer practical, technical explanations over marketing language.',
    'Return a complete blog draft with these sections: title, summary, technical changes, impact, and next steps.',
    '',
    `Repository: ${repository || 'Unknown repository'}`,
    `Branch: ${branch || 'Unknown branch'}`,
    '',
    'Commits:',
    commitLines,
  ].join('\n')
}
