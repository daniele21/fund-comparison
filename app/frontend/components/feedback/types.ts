export type FeedbackType = 'generic' | 'missing_fund' | 'wrong_data' | 'other'

export type FeedbackPayload = {
	name?: string
	email?: string
	message: string
	feedback_type?: FeedbackType
	page_url?: string
	user_agent?: string
	metadata?: Record<string, unknown>
}

export type FeedbackResponse = {
	status: 'accepted'
}
