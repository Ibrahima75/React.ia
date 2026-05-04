from django.conf import settings
from .base import LLMAdapter, RateLimitError, LLMError


class GeminiAdapter(LLMAdapter):
    MODEL_ID = 'gemini-1.5-flash-latest'

    def send_message(self, messages: list, model_config: dict) -> dict:
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel(self.MODEL_ID)

            # Convert message history to Gemini format
            history = []
            last_user_message = ''
            for msg in messages:
                role = 'user' if msg['role'] == 'user' else 'model'
                if msg == messages[-1] and msg['role'] == 'user':
                    last_user_message = msg['content']
                    continue
                history.append({'role': role, 'parts': [msg['content']]})

            chat = model.start_chat(history=history)
            response = chat.send_message(last_user_message or messages[-1]['content'])

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
