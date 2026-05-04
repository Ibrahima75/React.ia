import base64
import io
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status


def extract_text_from_pdf(file_bytes):
    try:
        import fitz  # PyMuPDF
        doc = fitz.open(stream=file_bytes, filetype='pdf')
        return '\n'.join(page.get_text() for page in doc)
    except Exception as e:
        return f'[Erreur lecture PDF: {e}]'


def extract_text_from_docx(file_bytes):
    try:
        from docx import Document
        doc = Document(io.BytesIO(file_bytes))
        return '\n'.join(p.text for p in doc.paragraphs if p.text)
    except Exception as e:
        return f'[Erreur lecture DOCX: {e}]'


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def upload_file(request):
    file = request.FILES.get('file')
    if not file:
        return Response({'error': 'Aucun fichier fourni.'}, status=status.HTTP_400_BAD_REQUEST)

    file_bytes = file.read()
    name = file.name.lower()
    content_type = file.content_type or ''

    # Text files
    if name.endswith('.txt') or 'text/plain' in content_type:
        try:
            text = file_bytes.decode('utf-8', errors='replace')
            return Response({'type': 'text', 'content': text, 'filename': file.name})
        except Exception as e:
            return Response({'error': str(e)}, status=500)

    # PDF
    if name.endswith('.pdf') or 'pdf' in content_type:
        text = extract_text_from_pdf(file_bytes)
        return Response({'type': 'text', 'content': text, 'filename': file.name})

    # DOCX
    if name.endswith('.docx') or 'word' in content_type:
        text = extract_text_from_docx(file_bytes)
        return Response({'type': 'text', 'content': text, 'filename': file.name})

    # Images — return base64 for vision models
    if content_type.startswith('image/') or any(name.endswith(ext) for ext in ['.png', '.jpg', '.jpeg', '.webp', '.gif']):
        b64 = base64.b64encode(file_bytes).decode('utf-8')
        return Response({
            'type': 'image',
            'content': b64,
            'mime_type': content_type or 'image/jpeg',
            'filename': file.name,
        })

    return Response({'error': 'Type de fichier non supporté.'}, status=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE)
