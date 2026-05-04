from django.conf import settings
from .base import LLMAdapter, RateLimitError, LLMError


class ClaudeAdapter(LLMAdapter):
    MODEL_ID = 'claude-haiku-4-5-20251001'

    def send_message(self, messages: list, model_config: dict) -> dict:
        try:
            import anthropic
            client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

            claude_messages = [{'role': m['role'], 'content': m['content']} for m in messages]
            response = client.messages.create(
                model=self.MODEL_ID,
                max_tokens=2048,
                messages=claude_messages,
            )

            content = response.content[0].text if response.content else ''
            tokens_used = (response.usage.input_tokens + response.usage.output_tokens) if response.usage else 0

            return {
                'content': content,
                'tokens_used': tokens_used,
                'model_used': f'Claude ({self.MODEL_ID})',
            }

        except Exception as e:
            err_str = str(e).lower()
            if '429' in err_str or 'rate_limit' in err_str or 'overloaded' in err_str:
                raise RateLimitError(str(e))
            raise LLMError(str(e))
