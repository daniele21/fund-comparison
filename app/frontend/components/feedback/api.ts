import { api } from '@/lib/api'
import type { FeedbackPayload, FeedbackResponse } from './types'

export const submitFeedback = async (
	payload: FeedbackPayload,
	token?: string | null,
): Promise<FeedbackResponse> => {
	const headers: Record<string, string> = {}
	if (token) {
		headers['Authorization'] = `Bearer ${token}`
	}
	const { data } = await api.post<FeedbackResponse>('/feedback', payload, { headers })
	return data
}
