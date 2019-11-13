from django.contrib.auth.models import User
from django.contrib.contenttypes.fields import GenericForeignKey, GenericRelation
from django.contrib.contenttypes.models import ContentType
from django.db import models
from django.db.models import Q
from mptt.models import MPTTModel, TreeForeignKey
from django.contrib.contenttypes.models import ContentType


# Пользователь
class UserProfileInfo(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, unique=True)
    name = models.CharField(max_length=80, default='Не указано')
    surname = models.CharField(max_length=80, default='Не указано')

    def __str__(self):
        return self.user.username


# Возможное отношение
class Relation(models.Model):
    name = models.CharField(max_length=80, unique=True)

    def __str__(self):
        return self.name


# Отмеченный элемент (Любой класс)
class TaggedItem(models.Model):
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')


# Связь между любыми классами
class Link(models.Model):
    relation = models.ForeignKey(Relation, on_delete=models.CASCADE)
    first_item = models.ForeignKey(
        TaggedItem, on_delete=models.CASCADE, related_name="first_item")
    second_item = models.ForeignKey(
        TaggedItem, on_delete=models.CASCADE, related_name="second_item")

    def __str__(self):
        return self.relation.__str__()

    class Meta:
        unique_together = ("first_item", "second_item")


# Класс с иерархией
class Class(MPTTModel):
    name = models.CharField(max_length=100, unique=True)
    parent = TreeForeignKey('self', on_delete=models.CASCADE,
                            null=True, blank=True, related_name='children')
    tags = GenericRelation(TaggedItem, null=True)

    class MPTTMeta:
        order_insertion_by = ['name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if self._state.adding:
            pk = self.pk  # pk will be None like objects if self is new instance
            super().save(*args, **kwargs)
            TaggedItem(content_object=self).save()
        else:
            pk = self.pk  # pk will be None like objects if self is new instance
            super().save(*args, **kwargs)


# Объект класса
class Object(models.Model):
    linked_class = models.ForeignKey(Class, on_delete=models.CASCADE)
    name = models.CharField(max_length=100, unique=True)
    tags = GenericRelation(TaggedItem, null=True)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if self._state.adding:
            pk = self.pk  # pk will be None like objects if self is new instance
            super().save(*args, **kwargs)
            TaggedItem(content_object=self).save()
        else:
            pk = self.pk  # pk will be None like objects if self is new instance
            super().save(*args, **kwargs)


# Блок текста
class Block(models.Model):
    # text
    title = models.CharField(max_length=300, unique=True)
    title_origin = models.CharField(max_length=300, null=True)
    language = models.CharField(max_length=300, null=True)
    dialect = models.CharField(max_length=300, null=True)
    theme = models.CharField(max_length=300, null=True)
    place_of_recording = models.CharField(max_length=300, null=True)
    time_of_recording = models.CharField(max_length=300, null=True)
    publisher = models.CharField(max_length=300, null=True)
    versions = models.CharField(max_length=300, null=True)
    area_of_distribution = models.CharField(max_length=300, null=True)

    # author
    initials = models.CharField(max_length=300, null=True)
    text_preparation = models.CharField(max_length=300, null=True)
    original_recording = models.CharField(max_length=300, null=True)
    text_decipher = models.CharField(max_length=300, null=True)
    translation = models.CharField(max_length=300, null=True)
    manager = models.CharField(max_length=300, null=True)
    commentary_preparation = models.CharField(max_length=300, null=True)

    tags = GenericRelation(TaggedItem, null=True)

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if self._state.adding:
            pk = self.pk  # pk will be None like objects if self is new instance
            super().save(*args, **kwargs)
            TaggedItem(content_object=self).save()
        else:
            pk = self.pk  # pk will be None like objects if self is new instance
            super().save(*args, **kwargs)

    def getLineLinks(self):
        result = []
        line_ids_in_block = Line.objects.all().filter(block=self).values('id')
        line = Line()
        all_dependencies = Link.objects.all().filter(
            Q(first_item__content_type=ContentType.objects.get_for_model(line))
            &
            Q(second_item__content_type=ContentType.objects.get_for_model(line))
            &
            Q(first_item__object_id__in=line_ids_in_block)
            &
            Q(second_item__object_id__in=line_ids_in_block))  # get only line links & get links only in this block

        result.append(all_dependencies)
        return result


# Строка в блоке текста
class Line(models.Model):
    block = models.ForeignKey(Block, on_delete=models.CASCADE, null=True)
    position = models.IntegerField(null=True)
    text_right = models.CharField(max_length=500, default="Не указано")
    text_left = models.CharField(max_length=500, default="Не указано")
    tags = GenericRelation(TaggedItem, null=True)

    def __str__(self):
        return self.block.title + " -> " + self.position.__str__() + " : " + self.text_left + " - " + self.text_right

    def save(self, *args, **kwargs):
        if self._state.adding:
            pk = self.pk  # pk will be None like objects if self is new instance
            super().save(*args, **kwargs)
            TaggedItem(content_object=self).save()
        else:
            pk = self.pk  # pk will be None like objects if self is new instance
            super().save(*args, **kwargs)

    class Meta:
        unique_together = (("block", "position"),)


# Фраза в строке блока текста
class Phrase(models.Model):
    line = models.ForeignKey(Line, on_delete=models.CASCADE, null=True)
    elements = models.CharField(max_length=20)
    color = models.CharField(max_length=20)
    tags = GenericRelation(TaggedItem, null=True)

    def __str__(self):
        return self.line.__str__() + "el= " + self.elements

    def save(self, *args, **kwargs):
        if self._state.adding:
            pk = self.pk  # pk will be None like objects if self is new instance
            super().save(*args, **kwargs)
            TaggedItem(content_object=self).save()
        else:
            pk = self.pk  # pk will be None like objects if self is new instance
            super().save(*args, **kwargs)

    class Meta:
        unique_together = (("line", "elements"),)


# Описание любого объекта
class Description(models.Model):
    text = models.TextField(max_length=500)
    tags = GenericRelation(TaggedItem, null=True)

    def __str__(self):
        return self.text

    def save(self, *args, **kwargs):
        if self._state.adding:
            pk = self.pk  # pk will be None like objects if self is new instance
            super().save(*args, **kwargs)
            TaggedItem(content_object=self).save()
        else:
            pk = self.pk  # pk will be None like objects if self is new instance
            super().save(*args, **kwargs)

# Изображение любого объекта


class Image(models.Model):
    image = models.ImageField
    name = models.CharField(max_length=300, default="Не указано")
    tags = GenericRelation(TaggedItem, null=True)

    def save(self, *args, **kwargs):
        if self._state.adding:
            pk = self.pk  # pk will be None like objects if self is new instance
            super().save(*args, **kwargs)
            TaggedItem(content_object=self).save()
        else:
            pk = self.pk  # pk will be None like objects if self is new instance
            super().save(*args, **kwargs)
