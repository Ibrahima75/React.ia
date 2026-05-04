from .gemini import GeminiAdapter
from .deepseek_adapter import DeepSeekAdapter
from .groq_adapter import GroqAdapter
from .base import RateLimitError, LLMError
from services.quota_manager import quota_manager


ADAPTERS = {
    'gemini-flash': GeminiAdapter(),
    'deepseek': DeepSeekAdapter(),
    'groq': GroqAdapter(),
}

FALLBACK_ORDER = ['gemini-flash', 'deepseek', 'groq']


class LLMRouter:
    def send(self, messages: list, preferred_slug: str, user) -> dict:
        from apps.models_config.models import AIModel

        order = [preferred_slug] + [s for s in FALLBACK_ORDER if s != preferred_slug]
        last_error = None
        model_switched = False
        switch_reason = ''

        for slug in order:
            adapter = ADAPTERS.get(slug)
            if not adapter:
                continue

            try:
                model_cfg = AIModel.objects.filter(slug=slug).first()
                if not model_cfg or not model_cfg.actif:
                    continue

                # Check quotas before calling
                if not quota_manager.check_rpm(slug, model_cfg.rpm_limit):
                    switch_reason = f'RPM limit reached for {slug}'
                    model_switched = slug != preferred_slug
                    continue

                if not quota_manager.check_rpd(slug, model_cfg.rpd_limit):
                    switch_reason = f'RPD limit reached for {slug}'
                    model_switched = slug != preferred_slug
                    continue

                quota_manager.increment_rpm(slug)
                result = adapter.send_message(messages, {'slug': slug})
                quota_manager.record_request(slug, user, 200, result.get('tokens_used', 0))

                result['model_slug'] = slug
                result['model_switched'] = slug != preferred_slug
                result['switch_reason'] = switch_reason if slug != preferred_slug else ''
                return result

            except RateLimitError as e:
                quota_manager.record_request(slug, user, 429, 0, str(e))
                switch_reason = f'429 on {slug}: quota exceeded'
                model_switched = True
                last_error = e
                continue

            except LLMError as e:
                quota_manager.record_request(slug, user, 500, 0, str(e))
                last_error = e
                continue

        # All models failed
        return {
            'content': "Tous les modèles sont indisponibles. Veuillez réessayer plus tard.",
            'tokens_used': 0,
            'model_used': None,
            'model_slug': None,
            'model_switched': False,
            'switch_reason': str(last_error) if last_error else 'Aucun modèle disponible',
            'error': True,
        }


llm_router = LLMRouter()
