from abc import ABC, abstractmethod


class LLMAdapter(ABC):
    """Base interface that every LLM adapter must implement."""

    @abstractmethod
    def send_message(self, messages: list, model_config: dict) -> dict:
        """
        Args:
            messages: list of {'role': str, 'content': str}
            model_config: dict with model metadata (slug, limits, etc.)
        Returns:
            {'content': str, 'tokens_used': int, 'model_used': str}
        Raises:
            RateLimitError on HTTP 429
            LLMError on other failures
        """

    def _normalize_role(self, role: str) -> str:
        """Map our internal roles to provider-specific roles if needed."""
        return role


class RateLimitError(Exception):
    """Raised when the LLM provider returns HTTP 429."""


class LLMError(Exception):
    """Raised on non-quota LLM failures."""
