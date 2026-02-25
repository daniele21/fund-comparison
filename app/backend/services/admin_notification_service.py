"""
Admin Notification Service - Telegram notifications for admin events

Sends notifications to Telegram channel for:
- New pending users (after payment)
- User approved/rejected
- User suspended/reactivated
- Other admin-relevant events
"""

import json
import logging
from typing import Optional, Dict, Any
from datetime import datetime

import httpx

from backend.settings import settings
from backend.schemas.user import UserProfile

logger = logging.getLogger(__name__)


class AdminNotificationError(RuntimeError):
    """Raised when an admin notification cannot be delivered."""


class AdminNotificationService:
    """Service for sending admin notifications via Telegram."""
    
    _telegram_endpoint = "https://api.telegram.org/bot{token}/sendMessage"
    _message_limit = 3500  # Telegram message limit
    
    def __init__(self):
        self.token = settings.TELEGRAM_BOT_TOKEN
        self.chat_id = settings.TELEGRAM_CHAT_ID
        self.enabled = bool(self.token and self.chat_id)
        
        if not self.enabled:
            logger.warning("Admin notifications disabled: Telegram not configured")
    
    async def notify_new_pending_user(self, user: UserProfile, payment_info: Optional[Dict[str, Any]] = None):
        """
        Notify admin about a new user pending approval.
        
        Args:
            user: User profile
            payment_info: Optional payment information (amount, date, etc.)
        """
        if not self.enabled:
            logger.debug("Skipping notification: Telegram not configured")
            return
        
        emoji = "🆕"
        title = f"{emoji} **NUOVO UTENTE DA APPROVARE**"
        
        lines = [
            title,
            "",
            f"👤 **Nome:** {user.name or 'N/A'}",
            f"📧 **Email:** {user.email}",
            f"🆔 **User ID:** `{user.id}`",
            f"📅 **Registrato:** {self._format_datetime(user.created_at)}",
        ]
        
        if user.hd:
            lines.append(f"🏢 **Workspace:** {user.hd}")
        
        if payment_info:
            lines.append("")
            lines.append("💳 **Pagamento:**")
            if payment_info.get("amount"):
                lines.append(f"   • Importo: €{payment_info['amount']:.2f}")
            if payment_info.get("payment_id"):
                lines.append(f"   • ID: `{payment_info['payment_id']}`")
            if payment_info.get("date"):
                lines.append(f"   • Data: {payment_info['date']}")
        
        lines.extend([
            "",
            "⚠️ **Azione richiesta:** Approva o rifiuta l'utente dalla dashboard admin",
            "",
            f"🔗 Dashboard: {self._get_admin_dashboard_url()}"
        ])
        
        message = "\n".join(lines)
        await self._send_message(message, parse_mode="Markdown")
    
    async def notify_user_approved(self, user: UserProfile, approved_by: str):
        """Notify about user approval."""
        if not self.enabled:
            return
        
        emoji = "✅"
        message = f"""{emoji} **UTENTE APPROVATO**

👤 **Nome:** {user.name or 'N/A'}
📧 **Email:** {user.email}
🆔 **User ID:** `{user.id}`

✅ **Approvato da:** Admin `{approved_by}`
📅 **Data:** {self._format_datetime(datetime.utcnow())}

L'utente ora ha accesso completo a tutte le funzionalità."""
        
        await self._send_message(message, parse_mode="Markdown")
    
    async def notify_user_rejected(self, user: UserProfile, rejected_by: str, reason: Optional[str]):
        """Notify about user rejection."""
        if not self.enabled:
            return
        
        emoji = "❌"
        lines = [
            f"{emoji} **UTENTE RIFIUTATO**",
            "",
            f"👤 **Nome:** {user.name or 'N/A'}",
            f"📧 **Email:** {user.email}",
            f"🆔 **User ID:** `{user.id}`",
            "",
            f"❌ **Rifiutato da:** Admin `{rejected_by}`",
            f"📅 **Data:** {self._format_datetime(datetime.utcnow())}",
        ]
        
        if reason:
            lines.extend([
                "",
                f"📝 **Motivo:** {reason}"
            ])
        
        message = "\n".join(lines)
        await self._send_message(message, parse_mode="Markdown")
    
    async def notify_user_suspended(self, user: UserProfile, suspended_by: str, reason: Optional[str]):
        """Notify about user suspension."""
        if not self.enabled:
            return
        
        emoji = "🚫"
        lines = [
            f"{emoji} **UTENTE SOSPESO**",
            "",
            f"👤 **Nome:** {user.name or 'N/A'}",
            f"📧 **Email:** {user.email}",
            f"🆔 **User ID:** `{user.id}`",
            "",
            f"🚫 **Sospeso da:** Admin `{suspended_by}`",
            f"📅 **Data:** {self._format_datetime(datetime.utcnow())}",
        ]
        
        if reason:
            lines.extend([
                "",
                f"📝 **Motivo:** {reason}"
            ])
        
        message = "\n".join(lines)
        await self._send_message(message, parse_mode="Markdown")
    
    async def notify_user_reactivated(self, user: UserProfile, reactivated_by: str):
        """Notify about user reactivation."""
        if not self.enabled:
            return
        
        emoji = "♻️"
        message = f"""{emoji} **UTENTE RIATTIVATO**

👤 **Nome:** {user.name or 'N/A'}
📧 **Email:** {user.email}
🆔 **User ID:** `{user.id}`

♻️ **Riattivato da:** Admin `{reactivated_by}`
📅 **Data:** {self._format_datetime(datetime.utcnow())}

L'utente può nuovamente accedere al servizio."""
        
        await self._send_message(message, parse_mode="Markdown")
    
    async def notify_payment_received(self, user_email: str, amount: float, payment_id: str):
        """Notify about new payment received."""
        if not self.enabled:
            return
        
        emoji = "💰"
        message = f"""{emoji} **PAGAMENTO RICEVUTO**

📧 **Email:** {user_email}
💵 **Importo:** €{amount:.2f}
🆔 **Payment ID:** `{payment_id}`
📅 **Data:** {self._format_datetime(datetime.utcnow())}

⚠️ Verifica l'utente e approva dalla dashboard admin."""
        
        await self._send_message(message, parse_mode="Markdown")
    
    async def notify_system_alert(self, alert_type: str, message: str, details: Optional[Dict[str, Any]] = None):
        """Send system alert to admin."""
        if not self.enabled:
            return
        
        emoji = "⚠️"
        lines = [
            f"{emoji} **ALERT DI SISTEMA**",
            "",
            f"🔔 **Tipo:** {alert_type}",
            f"📅 **Data:** {self._format_datetime(datetime.utcnow())}",
            "",
            f"**Messaggio:**",
            message,
        ]
        
        if details:
            lines.extend([
                "",
                "**Dettagli:**",
            ])
            for key, value in details.items():
                lines.append(f"   • {key}: {value}")
        
        msg = "\n".join(lines)
        await self._send_message(msg, parse_mode="Markdown")
    
    async def send_daily_report(self, stats: Dict[str, Any]):
        """Send daily statistics report."""
        if not self.enabled:
            return
        
        emoji = "📊"
        message = f"""{emoji} **REPORT GIORNALIERO**

📅 **Data:** {datetime.utcnow().strftime('%d/%m/%Y')}

**Utenti:**
   • Totali: {stats.get('total_users', 0)}
   • Pending: {stats.get('pending_users', 0)}
   • Attivi: {stats.get('active_users', 0)}
   • Nuovi oggi: {stats.get('new_today', 0)}

**Abbonamenti:**
   • Free: {stats.get('free_users', 0)}
   • Subscriber: {stats.get('subscriber_users', 0)}
   • Admin: {stats.get('admin_users', 0)}

**Pagamenti:**
   • Ricevuti oggi: €{stats.get('payments_today', 0):.2f}

🔗 Dashboard: {self._get_admin_dashboard_url()}"""
        
        await self._send_message(message, parse_mode="Markdown")
    
    async def _send_message(self, text: str, parse_mode: str = "Markdown"):
        """Send message to Telegram."""
        if not self.enabled:
            logger.debug("Skipping Telegram message: not configured")
            return
        
        # Truncate if too long
        if len(text) > self._message_limit:
            text = text[:self._message_limit - 20] + "\n...(troncato)"
        
        url = self._telegram_endpoint.format(token=self.token)
        body = {
            "chat_id": self.chat_id,
            "text": text,
            "parse_mode": parse_mode,
            "disable_web_page_preview": True
        }
        
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(url, json=body)
                response.raise_for_status()
                data = response.json()
                
                if not data.get("ok", False):
                    logger.error(f"Telegram rejected message: {data}")
                    raise AdminNotificationError("Telegram rejected the message")
                
                logger.info(f"Admin notification sent to Telegram chat {self.chat_id}")
                
        except httpx.HTTPError as exc:
            logger.error(f"Failed to send Telegram notification: {exc}")
            raise AdminNotificationError("Unable to send notification") from exc
        except json.JSONDecodeError:
            logger.error("Failed to decode Telegram response")
            raise AdminNotificationError("Unexpected response from Telegram")
    
    @staticmethod
    def _format_datetime(dt: Optional[datetime]) -> str:
        """Format datetime for display."""
        if not dt:
            return "N/A"
        return dt.strftime("%d/%m/%Y %H:%M")
    
    @staticmethod
    def _get_admin_dashboard_url() -> str:
        """Get admin dashboard URL."""
        base_url = settings.cors_origins[0] if settings.cors_origins else "http://localhost:3000"
        return f"{base_url}/admin/users"


# Singleton instance
_admin_notification_service: Optional[AdminNotificationService] = None


def get_admin_notification_service() -> AdminNotificationService:
    """Get or create admin notification service instance."""
    global _admin_notification_service
    if _admin_notification_service is None:
        _admin_notification_service = AdminNotificationService()
    return _admin_notification_service
