import { client } from '@src/api'
import { SubmissionWithProblem } from '@src/submission/types'

export async function submitProblem(
  problemId: number,
  file: File,
  language: string
) {
  const formData = new FormData()
  formData.set('sourceCode', file)
  formData.set('language', language)
  return client
    .url(`submission/problem/${problemId}`)
    .post(formData)
    .json<SubmissionWithProblem>()
}
