from django.urls import re_path

from annotation_tool.consumers import WindowConsumer

websocket_urlpatterns = [
    re_path(r'window/', WindowConsumer),
]
