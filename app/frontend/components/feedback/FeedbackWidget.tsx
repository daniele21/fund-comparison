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
				<div className="fixed bottom-32 md:bottom-6 right-6 z-[var(--z-fab)] flex items-center gap-3" style={{ bottom: -0.3 }}>
					{/* Visible label on md+ screens, icon-only on small screens */}
						<button
							type="button"
							className="hidden md:inline-flex items-center gap-3 rounded-xl bg-[#0284c7] text-white px-3 py-2 text-sm font-medium shadow-xl shadow-black/20 hover:bg-[#026fa8] fc-feedback-opaque"
							aria-label="Apri il feedback"
						>
							<span className="whitespace-nowrap">Non trovi il tuo fondo? Segnalacelo</span>
						</button>
					<Button
						type="button"
						variant="default"
						size="icon"
						className="h-12 w-12 rounded-full shadow-xl shadow-black/20 fc-feedback-opaque"
					>
						<MessageCircle className="h-5 w-5" aria-hidden="true" />
						<span className="sr-only">Apri il feedback</span>
					</Button>
				</div>
			</Dialog.Trigger>
			<Dialog.Portal>
				<Dialog.Overlay
					className="fixed inset-0 z-[var(--z-modal-backdrop)] bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-opacity"
				/>
				<Dialog.Content
					className="fixed left-1/2 top-1/2 z-[var(--z-modal)] w-[min(92vw,480px)] max-h-[85vh] -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-slate-200/80 bg-white/95 p-0 text-slate-900 shadow-2xl backdrop-blur supports-[backdrop-filter]:backdrop-blur-xl focus:outline-none dark:border-slate-800 dark:bg-slate-900/95 dark:text-slate-100"
				>
					<div className="flex h-full max-h-[80vh] flex-col overflow-hidden">
						<header className="flex items-start justify-between gap-3 border-b border-border/60 px-5 py-4">
							<div className="flex items-start gap-3">
								<div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
									<MessageCircle className="h-4 w-4" aria-hidden="true" />
								</div>
								<div className="space-y-0.5">
									<Dialog.Title className="text-base font-semibold leading-tight">Invia un feedback</Dialog.Title>
									<Dialog.Description className="text-xs text-muted-fg">
										Condividi idee o problemi: il team li riceve in tempo reale.
									</Dialog.Description>
								</div>
							</div>
							<Dialog.Close asChild>
								<button
									type="button"
									className="rounded-full border border-border/60 p-2 text-muted-fg transition hover:bg-surface2 hover:text-foreground"
									aria-label="Chiudi"
								>
									<X className="h-4 w-4" />
								</button>
							</Dialog.Close>
						</header>

						{canSubmit ? (
							<>
								<div className="px-5 pt-4">
									<p className="rounded-xl border border-border/60 bg-surface2/80 px-4 py-3 text-xs leading-relaxed text-muted-fg shadow-sm dark:border-slate-700 dark:bg-slate-800/70">
										<span className="font-medium text-text">Consigli rapidi:</span> indica cosa stavi facendo.
									</p>
								</div>

								<form id="feedback-form" className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 pb-5 pt-4" onSubmit={handleSubmit}>
									<div className="grid gap-1.5">
										<label className="text-xs font-medium text-muted-fg" htmlFor="feedback-type">Tipo di feedback</label>
										<select
											id="feedback-type"
											value={form.feedbackType}
											onChange={handleChange('feedbackType')}
											className="input h-9 text-sm bg-white/95 text-slate-900 border border-border placeholder:text-muted-fg dark:bg-slate-800/90 dark:text-slate-100 dark:border-slate-700"
										>
											{(Object.entries(FEEDBACK_TYPE_LABELS) as [FeedbackType, string][]).map(([value, label]) => (
												<option key={value} value={value}>
													{label}
												</option>
											))}
										</select>
									</div>

									<div className="grid gap-1.5">
										<label className="text-xs font-medium text-muted-fg" htmlFor="feedback-message">Dettagli</label>
										<textarea
											id="feedback-message"
											value={form.message}
											onChange={handleChange('message')}
											className="input min-h-[160px] resize-none text-sm leading-relaxed bg-white/95 text-slate-900 border border-border placeholder:text-muted-fg dark:bg-slate-800/90 dark:text-slate-100 dark:border-slate-700"
											placeholder="Descrivi il tuo feedback"
										/>
										{errors.message && <p className="text-xs text-destructive">{errors.message}</p>}
									</div>

									{errors.general && <p className="text-xs text-destructive">{errors.general}</p>}
								</form>

								<footer className="border-t border-border/60 px-5 py-4 backdrop-blur supports-[backdrop-filter]:backdrop-blur">
									<div className="flex items-center gap-2">
										<Button type="button" variant="ghost" size="sm" className="text-sm" disabled={isSubmitting} onClick={closeDialog}>
											Annulla
										</Button>
										<Button type="submit" form="feedback-form" size="sm" className="ml-auto px-4 font-semibold" disabled={isSubmitting}>
											{isSubmitting ? 'Invio…' : 'Invia feedback'}
										</Button>
									</div>
								</footer>
							</>
						) : (
							<div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
								<div className="space-y-3">
									<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
										<MessageCircle className="h-5 w-5" aria-hidden="true" />
									</div>
									<div className="space-y-1">
										<h2 className="text-lg font-semibold text-text">Accedi per inviare feedback</h2>
										<p className="text-sm text-muted-fg">
											Condividi idee o segnala problemi dopo l&apos;autenticazione: ci aiuta a risponderti direttamente.
										</p>
									</div>
								</div>
								<div className="space-y-2">
					<Button type="button" size="sm" className="w-full px-4 font-semibold" onClick={() => { closeDialog(); requestLogin(); }}>
										Accedi e continua
									</Button>
									<Button type="button" variant="ghost" size="sm" className="w-full text-sm" onClick={closeDialog}>
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
