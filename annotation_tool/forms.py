from django import forms
from django.contrib.auth.models import User
from django.utils.translation import gettext_lazy as _
from annotation_tool.models import UserProfileInfo, Relation, Object, Line, Block, Class, Description


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


class ObjectForm(forms.ModelForm):
    class Meta:
        model = Object
        fields = ('name',)
        labels = {
            'name': _('Название'),
        }


class LineForm(forms.ModelForm):
    class Meta:
        model = Line
        fields = ('text_left', 'text_right',)
        labels = {
            'text_left': _('Оригинальный текст'),
            'text_right': _('Переведенный текст'),
        }


class BlockForm(forms.ModelForm):
    class Meta:
        model = Block
        fields = ('title',
                  'title_origin',
                  'language',
                  'dialect',
                  'theme',
                  'place_of_recording',
                  'time_of_recording',
                  'publisher',
                  'versions',
                  'area_of_distribution',

                  'initials',
                  'text_preparation',
                  'original_recording',
                  'text_decipher',
                  'translation',
                  'manager',
                  'commentary_preparation',)
        labels = {
            'title': _('Название'),
            'title_origin': _('Название на национальном языке'),
            'language': _('Язык'),
            'dialect': _('Диалект'),
            'theme': _('Жанр'),
            'place_of_recording': _('Место записи'),
            'time_of_recording': _('Время записи'),
            'publisher': _('Опубликовано (Выходные данные)'),
            'versions': _('Варианты'),
            'area_of_distribution': _('Ареал распространения'),

            'initials': _('ФИО'),
            'text_preparation': _('Подготовка текста'),
            'original_recording': _('Запись оригинала'),
            'text_decipher': _('Расшифровка текста'),
            'translation': _('Перевод на русский язык'),
            'manager': _('Редактор'),
            'commentary_preparation': _('Подготовка комментариев'),
        }


class ClassForm(forms.ModelForm):
    class Meta:
        model = Class
        fields = ('name', 'parent',)
        labels = {
            'parent': _('Родитель'),
            'name': _('Название'),
        }


class DescriptionForm(forms.ModelForm):
    class Meta:
        model = Description
        fields = ('text',)
        labels = {
            'text': _('Содержание'),
        }
