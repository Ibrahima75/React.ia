from django.conf import settings
from .base import LLMAdapter, RateLimitError, LLMError


class GeminiAdapter(LLMAdapter):
    MODEL_ID = 'gemini-1.5-flash-latest'

    def send_message(self, messages: list, model_config: dict) -> dict:
        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=settings.GEMINI_API_KEY)

            history = []
            last_user_message = ''
            for msg in messages:
                role = 'user' if msg['role'] == 'user' else 'model'
                if msg == messages[-1] and msg['role'] == 'user':
                    last_user_message = msg['content']
                    continue
                history.append(types.Content(role=role, parts=[types.Part(text=msg['content'])]))

            contents = history + [types.Content(role='user', parts=[types.Part(text=last_user_message or messages[-1]['content'])])]

            response = client.models.generate_content(
                model=self.MODEL_ID,
                contents=contents,
            )

            tokens_used = 0
            if hasattr(response, 'usage_metadata') and response.usage_metadata:
                tokens_used = getattr(response.usage_metadata, 'total_token_count', 0)

            return {
                'content': response.text,
                'tokens_used': tokens_used,
                'model_used': f'Gemini ({self.MODEL_ID})',
            }

        except Exception as e:
            err_str = str(e).lower()
            if '429' in err_str or 'quota' in err_str or 'rate' in err_str:
                raise RateLimitError(str(e))
            raise LLMError(str(e))
