from django.conf import settings
from .base import LLMAdapter, RateLimitError, LLMError


class OpenAIAdapter(LLMAdapter):
    MODEL_ID = 'gpt-3.5-turbo'

    def send_message(self, messages: list, model_config: dict) -> dict:
        try:
            from openai import OpenAI, RateLimitError as OAIRateLimitError
            client = OpenAI(api_key=settings.OPENAI_API_KEY)

            oai_messages = [{'role': m['role'], 'content': m['content']} for m in messages]
            response = client.chat.completions.create(
                model=self.MODEL_ID,
                messages=oai_messages,
            )

            content = response.choices[0].message.content
            tokens_used = response.usage.total_tokens if response.usage else 0

            return {
                'content': content,
                'tokens_used': tokens_used,
                'model_used': f'OpenAI ({self.MODEL_ID})',
            }

        except Exception as e:
            err_str = str(e).lower()
            if '429' in err_str or 'rate_limit' in err_str or 'quota' in err_str:
                raise RateLimitError(str(e))
            raise LLMError(str(e))
