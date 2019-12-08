from django.urls import path
from django.conf.urls import url
from . import views

app_name = 'annotation_tool'
urlpatterns = [
    url(r'^workspace/(?P<pk>\d+)/edit/$', views.Workspace, name='workspace'),
    path('blocks', views.BlockSelection, name='blocks'),
    path('uploadDOCX', views.UploadDOCX, name='uploadDOCX'),
    url(r'^save/(?P<pk>\d+)/(?P<model>\w+)/Entity/$',
        views.SaveEntity, name='saveEntity'),
    path('getLineDependencies', views.getLineDependencies,
         name='getLineDependencies'),

]
