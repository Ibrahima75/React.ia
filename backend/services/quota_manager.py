import time
import threading
from collections import defaultdict
from django.utils import timezone
from datetime import timedelta


class QuotaManager:
    """
    Tracks RPM in memory (reset every 60s) and RPD in the database (reset daily).
    Thread-safe for concurrent Django workers.
    """

    def __init__(self):
        self._lock = threading.Lock()
        # {slug: {'count': int, 'window_start': float}}
        self._rpm_counters = defaultdict(lambda: {'count': 0, 'window_start': time.time()})

    def _reset_if_needed(self, slug: str):
        entry = self._rpm_counters[slug]
        if time.time() - entry['window_start'] >= 60:
            entry['count'] = 0
            entry['window_start'] = time.time()

    def check_rpm(self, slug: str, limit: int) -> bool:
        with self._lock:
            self._reset_if_needed(slug)
            return self._rpm_counters[slug]['count'] < limit

    def increment_rpm(self, slug: str):
        with self._lock:
            self._reset_if_needed(slug)
            self._rpm_counters[slug]['count'] += 1

    def check_rpd(self, slug: str, limit: int) -> bool:
        from apps.chat.models import ApiLog
        from apps.models_config.models import AIModel
        try:
            model = AIModel.objects.get(slug=slug)
            today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
            count = ApiLog.objects.filter(
                model=model,
                created_at__gte=today_start,
                status_code=200,
            ).count()
            return count < limit
        except Exception:
            return True  # allow on DB error

    def record_request(self, slug: str, user, status_code: int, tokens_used: int, error_message: str = ''):
        from apps.chat.models import ApiLog
        from apps.models_config.models import AIModel
        try:
            model = AIModel.objects.filter(slug=slug).first()
            ApiLog.objects.create(
                model=model,
                user=user,
                status_code=status_code,
                tokens_used=tokens_used,
                error_message=error_message,
            )
        except Exception:
            pass  # logging must never break the main flow

    def get_status(self, slug: str) -> dict:
        with self._lock:
            self._reset_if_needed(slug)
            rpm_used = self._rpm_counters[slug]['count']
            window_start = self._rpm_counters[slug]['window_start']

        from apps.models_config.models import AIModel
        from apps.chat.models import ApiLog
        try:
            model = AIModel.objects.get(slug=slug)
            today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
            rpd_used = ApiLog.objects.filter(
                model=model,
                created_at__gte=today_start,
                status_code=200,
            ).count()
            return {
                'rpm_used': rpm_used,
                'rpm_limit': model.rpm_limit,
                'rpd_used': rpd_used,
                'rpd_limit': model.rpd_limit,
                'tpm_limit': model.tpm_limit,
                'window_resets_in': max(0, 60 - (time.time() - window_start)),
            }
        except Exception:
            return {'rpm_used': rpm_used, 'rpm_limit': 0, 'rpd_used': 0, 'rpd_limit': 0, 'tpm_limit': 0}


# Singleton — shared across all Django request threads
quota_manager = QuotaManager()
