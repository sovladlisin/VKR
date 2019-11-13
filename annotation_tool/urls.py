from django.urls import path
from django.conf.urls import url
from . import views

app_name = 'annotation_tool'
urlpatterns = [
    url(r'^workspace/(?P<pk>\d+)/edit/$', views.Workspace, name='workspace'),
    path('info', views.Info, name='info'),
    path('createLink', views.CreateLink, name='createLink'),
    path('showcase_test', views.showcase_test, name='showcase_test'),
    path('blocks', views.BlockSelection, name='blocks'),
    path('uploadXLS', views.UploadXLS, name='uploadXLS'),
    path('uploadDOCX', views.UploadDOCX, name='uploadDOCX'),
    path('addRelation', views.addRelation, name='addRelation'),
    path('addLink', views.AddLink, name='addLink'),
    url(r'^history/(?P<pk>\d+)/edit/$', views.History, name='history'),
    # path('history', views.History, name='history'),
    path('getLineDependencies', views.getLineDependencies,
         name='getLineDependencies'),
    # path('sendRecords', views.sendRecords, name='sendRecords'),

    path('test', views.Test, name='test')
]
