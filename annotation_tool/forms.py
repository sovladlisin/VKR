from django import forms
from django.contrib.auth.models import User
from django.utils.translation import gettext_lazy as _
from annotation_tool.models import UserProfileInfo, Relation


class UploadFileForm(forms.Form):
    file = forms.FileField()


class UserForm(forms.ModelForm):
    password = forms.CharField(widget=forms.PasswordInput(), label='Пароль')

    class Meta:
        model = User
        fields = ('username', 'password', 'email')
        labels = {
            'username': _('Логин'),
            'email': _('Почта'),
        }


class UserProfileInfoForm(forms.ModelForm):
    class Meta:
        model = UserProfileInfo
        fields = ('name', 'surname')
        labels = {
            'name': _('Имя'),
            'surname': _('Фамилия'),
        }


class RelationForm(forms.ModelForm):
    class Meta:
        model = Relation
        fields = ('name',)
        labels = {
            'name': _('Название'),
        }
