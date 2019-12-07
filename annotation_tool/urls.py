from django.urls import path
from django.conf.urls import url
from . import views

app_name = 'annotation_tool'
urlpatterns = [
    url(r'^workspace/(?P<pk>\d+)/edit/$', views.Workspace, name='workspace'),
    path('infoWindow', views.InfoWindow, name='infoWindow'),
    path('searchWindow', views.SearchWindow, name='searchWindow'),
    path('search', views.Search, name='search'),
    path('tree', views.ClassTree, name='tree'),
    path('saveWindow', views.SaveWindow, name='saveWindow'),
    path('blocks', views.BlockSelection, name='blocks'),
    path('uploadDOCX', views.UploadDOCX, name='uploadDOCX'),
    # path('saveEntity', views.SaveEntity, name='saveEntity'),
    url(r'^save/(?P<pk>\d+)/(?P<model>\w+)/Entity/$',
        views.SaveEntity, name='saveEntity'),
    path('getLineDependencies', views.getLineDependencies,
         name='getLineDependencies'),

]
