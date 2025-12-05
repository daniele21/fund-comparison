import React, { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react'
import type { ButtonHTMLAttributes } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { MessageCircle, X } from 'lucide-react'
import { useAuth } from '@/auth'
import { submitFeedback } from './api'
import type { FeedbackPayload, FeedbackType } from './types'

const cn = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ')

type ButtonVariant = 'default' | 'ghost'
type ButtonSize = 'default' | 'sm' | 'icon'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: ButtonVariant
	size?: ButtonSize
}

const Button = ({ variant = 'default', size = 'default', className, ...props }: ButtonProps) => {
	const base = 'inline-flex items-center justify-center rounded-xl font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'
	const variantClasses: Record<ButtonVariant, string> = {
		default: 'bg-[#0284c7] text-white hover:bg-[#026fa8]',
		ghost: 'bg-transparent text-muted-fg hover:bg-surface2/70',
	}
	const sizeClasses: Record<ButtonSize, string> = {
		default: 'h-10 px-4 text-sm',
		sm: 'h-9 px-3 text-sm rounded-xl',
		icon: 'h-12 w-12 rounded-full',
	}
	return (
		<button
			className={cn(base, variantClasses[variant], sizeClasses[size], className)}
			{...props}
		/>
	)
}

type AppConfig = {
	feedback?: {
		requireAuth?: boolean
	}
}

const readAppConfig = (): AppConfig | undefined => {
	if (typeof window === 'undefined') return undefined
	const candidate = (window as typeof window & { __APP_CONFIG__?: AppConfig }).__APP_CONFIG__
	if (candidate && typeof candidate === 'object') {
		return candidate
	}
	return undefined
}

function useAppConfig() {
	const [config] = useState<AppConfig | undefined>(() => readAppConfig())
	return { config }
}

type ToastPayload = {
	title: string
	description?: string
	intent?: 'success' | 'error' | 'info'
}

function useToast() {
	const notify = ({ title, description, intent }: ToastPayload) => {
		const message = description ? `${title}: ${description}` : title
		if (typeof window !== 'undefined') {
			const style = intent === 'error' ? 'error' : 'log'
			console[style](`[feedback] ${message}`)
		} else {
			console.log(`[feedback] ${message}`)
		}
	}
	return { notify }
}

const FEEDBACK_TYPE_LABELS: Record<FeedbackType, string> = {
	generic: 'Feedback generico',
	missing_fund: 'Fondo mancante',
	wrong_data: 'Dati errati del fondo',
	other: 'Altro',
}

type FeedbackFormState = {
	message: string
	feedbackType: FeedbackType
}

type FeedbackFormErrors = Partial<Record<keyof FeedbackFormState, string>> & { general?: string }

const initialState: FeedbackFormState = { message: '', feedbackType: 'generic' }

type FeedbackWidgetProps = {
	onRequireLogin?: () => void
}

export const FeedbackWidget: React.FC<FeedbackWidgetProps> = ({ onRequireLogin }) => {
	const { config } = useAppConfig()
	const { user, login } = useAuth()

	// Ensure a global CSS rule exists that forces an opaque background for feedback elements
	useEffect(() => {
		if (typeof document === 'undefined') return
		const id = 'fc-feedback-opaque-style'
		if (document.getElementById(id)) return
		const style = document.createElement('style')
		style.id = id
		style.textContent = `
			.fc-feedback-opaque { background-color: #0284c7 !important; color: #fff !important; }
			.fc-feedback-opaque:hover { background-color: #026fa8 !important; }
			.fc-feedback-opaque:focus { box-shadow: 0 0 0 4px rgba(2,132,199,0.16) !important; }
		`
		document.head.appendChild(style)
	}, [])
	const requireAuth = config?.feedback?.requireAuth ?? false
	const { notify } = useToast()
	const [open, setOpen] = useState(false)
	const [form, setForm] = useState<FeedbackFormState>(initialState)
	const [errors, setErrors] = useState<FeedbackFormErrors>({})
	const [isSubmitting, setIsSubmitting] = useState(false)

	useEffect(() => {
		if (!open) {
			setForm(initialState)
			setErrors({})
		}
	}, [open])

	const metadata = useMemo(() => {
		if (typeof navigator === 'undefined' && typeof window === 'undefined') return undefined
		const details: Record<string, unknown> = {}
		if (typeof navigator !== 'undefined' && navigator.language) {
			details.locale = navigator.language
		}
		if (typeof window !== 'undefined') {
			details.path = window.location.pathname
			if (typeof document !== 'undefined') {
				details.title = document.title
			}
		}
		return Object.keys(details).length > 0 ? details : undefined
	}, [])
	const handleChange = (field: keyof FeedbackFormState) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
		const value = event.target.value
		setForm((current) => ({ ...current, [field]: value }))
	}

	const validate = (state: FeedbackFormState): FeedbackFormErrors => {
		const nextErrors: FeedbackFormErrors = {}
		const trimmedMessage = state.message.trim()
		if (!trimmedMessage) {
			nextErrors.message = 'Scrivi il tuo feedback.'
		} else if (trimmedMessage.length < 10) {
			nextErrors.message = 'Aggiungi qualche dettaglio in piu.'
		}
		return nextErrors
	}

	const requestLogin = () => {
		if (onRequireLogin) {
			onRequireLogin()
		} else if (typeof login === 'function') {
			login()
		}
	}

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const trimmed: FeedbackFormState = {
			message: form.message.trim(),
			feedbackType: form.feedbackType,
		}

		const fieldErrors = validate(trimmed)
		if (Object.keys(fieldErrors).length > 0) {
			setErrors(fieldErrors)
			return
		}
		setErrors({})

		const pageUrl = typeof window !== 'undefined' ? window.location.href : undefined
		const payload: FeedbackPayload = {
			message: trimmed.message,
			feedback_type: trimmed.feedbackType,
			page_url: pageUrl,
			user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
			metadata,
		}

		try {
			setIsSubmitting(true)
			await submitFeedback(payload)
			setOpen(false)
			notify({
				title: 'Grazie!',
				description: 'Il tuo feedback e stato inviato.',
				intent: 'success',
			})
		} catch (err: any) {
			console.error('Failed to send feedback', err)
			// If the backend requires auth, inform the user and offer to login
			const status = err?.response?.status
			if (status === 401) {
				setErrors({ general: 'Devi effettuare l\'accesso per inviare feedback.' })
				notify({
					title: 'Accesso richiesto',
					description: 'Accedi per inviare il feedback.',
					intent: 'error',
				})
				// If a login method is available, open it
				setTimeout(() => {
					closeDialog()
					requestLogin()
				}, 400)
			} else {
				setErrors({ general: 'Invio non riuscito. Riprova tra poco.' })
				notify({
					title: 'Invio non riuscito',
					description: 'Non siamo riusciti a inviare il feedback. Riprova tra poco.',
					intent: 'error',
				})
			}
		} finally {
			setIsSubmitting(false)
		}
	}

	const closeDialog = () => setOpen(false)
	const handleOpenChange = (next: boolean) => {
		if (!next) {
			setOpen(false)
			return
		}
		setOpen(true)
	}
	const canSubmit = !requireAuth || Boolean(user)

	return (
		<Dialog.Root open={open} onOpenChange={handleOpenChange}>
			<Dialog.Trigger asChild>
				<button
					type="button"
					className="group fixed bottom-20 md:bottom-20 right-4 md:right-6 z-30 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white h-12 w-12 md:h-14 md:w-14 md:hover:w-auto md:hover:px-4 md:hover:py-2.5 md:hover:rounded-xl md:hover:gap-3 text-sm font-semibold shadow-xl shadow-blue-600/40 hover:shadow-2xl hover:shadow-blue-600/50 transition-all duration-300 ease-out active:scale-95 fc-feedback-opaque overflow-hidden cursor-pointer"
					aria-label="Apri il feedback"
				>
					<MessageCircle className="h-5 w-5 md:h-6 md:w-6 md:group-hover:h-5 md:group-hover:w-5 transition-all duration-300 ease-out flex-shrink-0" aria-hidden="true" />
					<span className="max-w-0 md:group-hover:max-w-xs opacity-0 md:group-hover:opacity-100 whitespace-nowrap transition-all duration-300 ease-out overflow-hidden">
						Non trovi il tuo fondo? Segnalacelo
					</span>
				</button>
			</Dialog.Trigger>
			<Dialog.Portal>
				<Dialog.Overlay
					className="fixed inset-0 z-40 bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-opacity"
				/>
				<Dialog.Content
					className="fixed left-1/2 top-1/2 z-50 w-[min(95vw,520px)] max-h-[92vh] sm:max-h-[90vh] -translate-x-1/2 -translate-y-1/2 rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl shadow-slate-900/20 backdrop-blur-xl supports-[backdrop-filter]:backdrop-blur-2xl focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:shadow-black/50 animate-in fade-in-0 zoom-in-95 duration-200 overflow-hidden"
				>
					<div className="flex h-full max-h-[85vh] flex-col">
						<header className="flex items-start justify-between gap-3 sm:gap-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-850 px-4 sm:px-6 py-4 sm:py-5">
							<div className="flex items-start gap-3 sm:gap-4">
								<div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white shadow-lg shadow-blue-500/30 dark:shadow-blue-600/40">
									<MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
								</div>
								<div className="space-y-0.5 sm:space-y-1">
									<Dialog.Title className="text-base sm:text-lg font-bold leading-tight text-slate-900 dark:text-slate-100">Invia un feedback</Dialog.Title>
									<Dialog.Description className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
										Condividi idee o problemi: il team li riceve in tempo reale.
									</Dialog.Description>
								</div>
							</div>
							<Dialog.Close asChild>
								<button
									type="button"
									className="rounded-xl border border-slate-200 dark:border-slate-600 p-1.5 sm:p-2 text-slate-600 dark:text-slate-300 transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100 hover:border-slate-300 dark:hover:border-slate-500 active:scale-95 flex-shrink-0"
									aria-label="Chiudi"
								>
									<X className="h-4 w-4" />
								</button>
							</Dialog.Close>
						</header>

						{canSubmit ? (
							<>
								<div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-3 sm:pb-4">
									<div className="rounded-xl sm:rounded-2xl border border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-blue-100/80 dark:from-blue-950/50 dark:to-blue-900/30 px-3 sm:px-4 py-3 sm:py-3.5 shadow-sm">
										<div className="flex items-start gap-2 sm:gap-2.5">
											<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
												<path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
											</svg>
											<p className="text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-200">
												<span className="font-semibold">Consigli:</span> Spiega cosa stavi facendo e cosa ti aspettavi.
											</p>
										</div>
									</div>
								</div>

								<form id="feedback-form" className="flex flex-1 flex-col gap-4 sm:gap-5 overflow-y-auto px-4 sm:px-6 pb-5 sm:pb-6 pt-2" onSubmit={handleSubmit}>
									<div className="grid gap-1.5 sm:gap-2">
										<label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="feedback-type">Tipo di feedback</label>
										<select
											id="feedback-type"
											value={form.feedbackType}
											onChange={handleChange('feedbackType')}
											className="h-10 sm:h-11 rounded-lg sm:rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-2 border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-500/20 transition-all duration-200 px-3 sm:px-4 outline-none cursor-pointer"
										>
											{(Object.entries(FEEDBACK_TYPE_LABELS) as [FeedbackType, string][]).map(([value, label]) => (
												<option key={value} value={value}>
													{label}
												</option>
											))}
										</select>
									</div>

									<div className="grid gap-1.5 sm:gap-2">
										<label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="feedback-message">Il tuo messaggio</label>
										<textarea
											id="feedback-message"
											value={form.message}
											onChange={handleChange('message')}
											className="min-h-[140px] sm:min-h-[180px] rounded-lg sm:rounded-xl resize-none text-sm leading-relaxed bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-2 border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-500/20 transition-all duration-200 px-3 sm:px-4 py-2.5 sm:py-3 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
											placeholder="Descrivi cosa è successo, cosa ti aspettavi, o la tua idea..."
										/>
										{errors.message && (
											<p className="text-xs sm:text-sm text-red-600 dark:text-red-400 flex items-center gap-1.5 mt-1">
												<svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 sm:w-4" viewBox="0 0 20 20" fill="currentColor">
													<path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
												</svg>
												{errors.message}
											</p>
										)}
									</div>

									{errors.general && (
										<div className="rounded-lg sm:rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50 px-3 sm:px-4 py-2.5 sm:py-3">
											<p className="text-xs sm:text-sm text-red-700 dark:text-red-400 flex items-center gap-2">
												<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
													<path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
												</svg>
												{errors.general}
											</p>
										</div>
									)}
								</form>

								<footer className="border-t border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-850 px-4 sm:px-6 py-4 sm:py-5 backdrop-blur-sm">
									<div className="flex items-center justify-between gap-2 sm:gap-3">
										<Button 
											type="button" 
											variant="ghost" 
											size="sm" 
											className="text-xs sm:text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors px-3 sm:px-4 py-2" 
											disabled={isSubmitting} 
											onClick={closeDialog}
										>
											Annulla
										</Button>
										<Button 
											type="submit" 
											form="feedback-form" 
											size="sm" 
											className="px-4 sm:px-6 py-2 text-xs sm:text-sm font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-600/30 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed" 
											disabled={isSubmitting}
										>
											{isSubmitting ? (
												<span className="flex items-center gap-2">
													<svg className="animate-spin h-3.5 w-3.5 sm:h-4 sm:w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
														<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
														<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
													</svg>
													<span className="hidden sm:inline">Invio in corso...</span>
													<span className="sm:hidden">Invio...</span>
												</span>
											) : (
												<span>
													<span className="hidden sm:inline">Invia feedback</span>
													<span className="sm:hidden">Invia</span>
												</span>
											)}
										</Button>
									</div>
								</footer>
							</>
						) : (
							<div className="flex flex-1 flex-col items-center justify-center gap-6 sm:gap-8 px-4 sm:px-6 py-8 sm:py-10 text-center">
								<div className="space-y-3 sm:space-y-4">
									<div className="mx-auto flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl shadow-blue-500/30">
										<MessageCircle className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden="true" />
									</div>
									<div className="space-y-1.5 sm:space-y-2">
										<h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">Accedi per inviare feedback</h2>
										<p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
											Condividi idee o segnala problemi dopo l&apos;autenticazione: ci aiuta a risponderti direttamente.
										</p>
									</div>
								</div>
								<div className="space-y-2.5 sm:space-y-3 w-full max-w-xs">
									<Button 
										type="button" 
										size="sm" 
										className="w-full px-4 sm:px-5 py-2 sm:py-2.5 text-sm font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-600/30 transition-all duration-200 active:scale-95" 
										onClick={() => { closeDialog(); requestLogin(); }}
									>
										Accedi e continua
									</Button>
									<Button 
										type="button" 
										variant="ghost" 
										size="sm" 
										className="w-full text-xs sm:text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800" 
										onClick={closeDialog}
									>
										Annulla
									</Button>
								</div>
							</div>
						)}
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	)
}

export default FeedbackWidget
