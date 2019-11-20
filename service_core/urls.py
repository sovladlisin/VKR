from django.conf.urls import url
from django.urls import include
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from annotation_tool import views

urlpatterns = [
    url(r'^annotation_tool/', include('annotation_tool.urls')),
    url(r'^admin/', admin.site.urls),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT) + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
handler404 = 'annotation_tool.views.handler404'
