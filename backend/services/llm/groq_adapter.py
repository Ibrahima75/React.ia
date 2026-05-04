from django.conf import settings
from .base import LLMAdapter, RateLimitError, LLMError


class GroqAdapter(LLMAdapter):
    MODEL_ID = 'llama-3.1-8b-instant'

    def send_message(self, messages: list, model_config: dict) -> dict:
        try:
            from groq import Groq, RateLimitError as GroqRateLimitError
            client = Groq(api_key=settings.GROQ_API_KEY)

            groq_messages = [{'role': m['role'], 'content': m['content']} for m in messages]
            response = client.chat.completions.create(
                model=self.MODEL_ID,
                messages=groq_messages,
            )

            content = response.choices[0].message.content
            tokens_used = response.usage.total_tokens if response.usage else 0

            return {
                'content': content,
                'tokens_used': tokens_used,
                'model_used': f'Groq ({self.MODEL_ID})',
            }

        except Exception as e:
            err_str = str(e).lower()
            if '429' in err_str or 'rate_limit' in err_str or 'quota' in err_str:
                raise RateLimitError(str(e))
            raise LLMError(str(e))
