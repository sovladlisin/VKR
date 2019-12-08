from django.urls import re_path
from django.conf.urls import url
from django.urls import path

from annotation_tool.consumers import WindowConsumer, WindowSaveConsumer, PinFactoryConsumer, SearchConsumer

websocket_urlpatterns = [
    url(r"^window/$", WindowConsumer),
    url(r"^windowSave/$", WindowSaveConsumer),
    url(r"^createPin/$", PinFactoryConsumer),
    url(r"^search/$", SearchConsumer),

]
