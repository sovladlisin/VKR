from django.contrib import admin
from mptt.admin import MPTTModelAdmin
from annotation_tool.models import Class, Object, Phrase, Line, Block, Relation, \
    TaggedItem, Link, Description, Image


class ObjectAdmin(admin.ModelAdmin):
    model = Object


class DescriptionAdmin(admin.ModelAdmin):
    model = Description


class BlockAdmin(admin.ModelAdmin):
    model = Block


class LineAdmin(admin.ModelAdmin):
    model = Line


class PhraseAdmin(admin.ModelAdmin):
    model = Phrase


class RelationAdmin(admin.ModelAdmin):
    model = Relation


class TaggedItemAdmin(admin.ModelAdmin):
    model = TaggedItem


class LinkAdmin(admin.ModelAdmin):
    model = Link


class ImageAdmin(admin.ModelAdmin):
    model = Image


admin.site.register(Class, MPTTModelAdmin)

admin.site.register(Object, ObjectAdmin)

admin.site.register(Block, BlockAdmin)
admin.site.register(Phrase, PhraseAdmin)
admin.site.register(Line, LineAdmin)
admin.site.register(Relation, RelationAdmin)
admin.site.register(TaggedItem, TaggedItemAdmin)
admin.site.register(Link, LinkAdmin)
admin.site.register(Description, DescriptionAdmin)
admin.site.register(Image, ImageAdmin)
