from django.http import JsonResponse
from django.db import connection

def test_db_connection(request):
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
        return JsonResponse({'status': 'success', 'message': 'Database connected successfully'})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)})