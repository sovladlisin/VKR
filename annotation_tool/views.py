import openpyxl
from django.contrib.contenttypes.models import ContentType
import json
from django.db.models import Q
from django.apps import apps
from django.http import StreamingHttpResponse, HttpResponse, JsonResponse, HttpResponseNotFound
from django.shortcuts import render, redirect

# main annotation_tool
from django.template import loader
from django.template.loader import render_to_string
from django.views.decorators.csrf import csrf_exempt
from docx import Document

from annotation_tool.forms import UploadFileForm, RelationForm
from annotation_tool.models import Block, Relation, Class, Line, Link, TaggedItem, Object


def handler404(request, exception):
    return redirect('annotation_tool:blocks')


def addRelation(request):
    # if this is a POST request we need to process the form data
    if request.method == 'POST':
        # create a form instance and populate it with data from the request:
        form = RelationForm(request.POST)
        # check whether it's valid:
        if form.is_valid():
            patient = form.save(commit=False)
            patient.save()
            return redirect('annotation_tool:blocks')
        else:
            return HttpResponse("Ошибка в форме")
    else:
        form = RelationForm()
        return render(request, 'addRelation.html', {'form': form})


def BlockSelection(request):
    # if request.user.is_authenticated:
    blocks = Block.objects.all()
    return render(request, 'annotation_tool/blocks.html', {'blocks': blocks})


# else:
#     return HttpResponse('Not Authorized', status=403)

def UploadXLS(request):
    if "GET" == request.method:
        form = UploadFileForm()
        return render(request, 'annotation_tool/uploadXLS.html', {'form': form})
    else:
        # blocks = Block.objects.all()
        # form = UploadFileForm(request.POST, request.FILES)
        # # check whether it's valid:
        # if form.is_valid():
        #     block = Block()
        #     block.title = form.cleaned_data['title']
        #     block.save()
        #     excel_file = form.cleaned_data['file']
        #     wb = openpyxl.load_workbook(excel_file)
        #     # Получаем первый лист
        #     worksheet = wb.worksheets[0]
        #     # iterating over the rows and
        #     # getting value from each cell in row
        #     i = 0
        #     for row in worksheet.iter_rows():
        #         line = Line()
        #         line.block = block
        #         line.text_left = row[0].value
        #         line.text_right = row[1].value
        #         line.position = i
        #         line.save()
        #         i = i + 1
        blocks = Block.objects.all()
        return render(request, 'annotation_tool/blocks.html', {'blocks': blocks})


def UploadDOCX(request):
    if "GET" == request.method:
        form = UploadFileForm()
        return render(request, 'annotation_tool/uploadDOC.html', {'form': form})
    else:
        blocks = Block.objects.all()
        form = UploadFileForm(request.POST, request.FILES)
        # check whether it's valid:
        if form.is_valid():
            block = Block()
            file = form.cleaned_data['file']
            readDOCX(block, file)
        return render(request, 'annotation_tool/blocks.html', {'blocks': blocks})


def Test(request):
    # r = Relation.objects.get(name="Должность")
    # line1 = Line.objects.all().first()
    # line2 = Line.objects.get(text_right="От одной головёшки")
    # line3 = Line.objects.filter(text_right="Сборы его такими были:").first()
    #
    # Link(first_item=line1.tags.first(), second_item=line2.tags.first(), relation=r).save()
    # Link(first_item=line1.tags.first(), second_item=line3.tags.first(), relation=r).save()
    # Link(first_item=line3.tags.first(), second_item=line2.tags.first(), relation=r).save()
    #
    # r = Relation.objects.get(name="Должность")
    # obj = Object.objects.get(name="Полководец")
    # line2 = Line.objects.get(text_right="От одной головёшки")
    #
    # Link(first_item=obj.tags.first(), second_item=line2.tags.first(), relation=r).save()

    return render(request, "test.html", {'genres': Class.objects.all()})


def destroyAllLinks(element):
    tag = element.tags.first()
    Link.objects.filter(first_item=tag).delete()
    Link.objects.filter(second_item=tag).delete()


@csrf_exempt
def SaveWindow(request):
    if request.is_ajax():
        pk = request.POST.get('pk')
        model = request.POST.get('model')
        masters = json.loads(request.POST.get('masters'))
        slaves = json.loads(request.POST.get('slaves'))

        Model = apps.get_model(app_label="annotation_tool", model_name=model)
        current_item = Model.objects.get(pk=pk)
        destroyAllLinks(current_item)

        master_links = []
        if masters is not None:
            for k, elements in masters.items():
                if Relation.objects.filter(name=k).exists():
                    relation = Relation.objects.get(name=k)
                else:
                    relation = Relation(name=k)
                    relation.save()
                for item in elements:
                    Model = apps.get_model(
                        app_label="annotation_tool", model_name=item[0])
                    object = Model.objects.get(pk=item[1])
                    link = Link(relation=relation, first_item=object.tags.first(
                    ), second_item=current_item.tags.first())
                    link.save()

        slave_links = []
        if slaves is not None:
            for k, elements in slaves.items():
                if Relation.objects.filter(name=k).exists():
                    relation = Relation.objects.get(name=k)
                else:
                    relation = Relation(name=k)
                    relation.save()
                for item in elements:
                    Model = apps.get_model(
                        app_label="annotation_tool", model_name=item[0])
                    object = Model.objects.get(pk=item[1])
                    link = Link(relation=relation, first_item=current_item.tags.first(
                    ), second_item=object.tags.first())
                    link.save()

        return HttpResponse("Success!")


@csrf_exempt
def CreateLink(request):
    if request.is_ajax():
        master_pk = request.POST.get('master_pk')
        master_model_name = request.POST.get('master_model_name')
        slave_pk = request.POST.get('slave_pk')
        slave_model_name = request.POST.get('slave_model_name')
        relation_pk = request.POST.get('relation_pk')
        block_pk = request.POST.get('block_pk')

        master = slave = relation = None
        if (master_pk is not None) & (master_model_name is not None):
            master = showcase(master_pk, master_model_name)
        if (slave_pk is not None) & (slave_model_name is not None):
            slave = showcase(slave_pk, slave_model_name)
        if relation_pk is not None:
            relation = Relation.objects.get(pk=relation_pk)

        block = Block.objects.get(pk=block_pk)
        lines = Line.objects.all().filter(block=block).order_by('position')
        relations = Relation.objects.all()

        return render(request, 'annotation_tool/createLink.html',
                      {'master': master, 'slave': slave, 'relation': relation, 'lines': lines, 'relations': relations})


@csrf_exempt
def AddLink(request):
    if request.is_ajax():
        master_pk = request.POST.get('master_pk')
        master_model_name = request.POST.get('master_model_name')
        slave_pk = request.POST.get('slave_pk')
        slave_model_name = request.POST.get('slave_model_name')
        relation_pk = request.POST.get('relation_pk')

        master = slave = relation = None
        if (master_pk is not None) & (master_model_name is not None):
            Model = apps.get_model(
                app_label="annotation_tool", model_name=master_model_name)
            master = Model.objects.get(pk=master_pk)

        if (slave_pk is not None) & (slave_model_name is not None):
            Model = apps.get_model(
                app_label="annotation_tool", model_name=slave_model_name)
            slave = Model.objects.get(pk=slave_pk)

        if relation_pk is not None:
            relation = Relation.objects.get(pk=relation_pk)

        if (master is not None) & (slave is not None) & (relation is not None):
            link = Link(relation=relation, first_item=master.tags.first(
            ), second_item=slave.tags.first())
            link.save()
            return HttpResponse("Success!")

        return HttpResponseNotFound("Item is not present")


def Workspace(request, pk):
    # if request.user.is_authenticated:
    block = Block.objects.get(pk=pk)
    lines = Line.objects.all().filter(block=block).order_by('position')
    return render(request, 'annotation_tool/main.html', {'lines': lines, 'pk': pk})


# else:
#     return HttpResponse('Not Authorized', status=403)
def SearchWindow(request):
    if request.is_ajax():
        html = render_to_string('annotation_tool/search.html',)
        response = {}
        response['template'] = html
        return HttpResponse(json.dumps(response))


def Search(request):
    if request.is_ajax():
        phrase = request.GET.get('phrase')
        print(phrase)
        html = ''
        for block in Block.objects.all():
            html += showcase(block.pk, 'Block')
        for line in Line.objects.all():
            html += showcase(line.pk, 'Line')
        response = {}
        response['template'] = html
        return HttpResponse(json.dumps(response))


def InfoWindow(request):
    if request.is_ajax():
        pk = request.GET.get('pk')
        model_name = request.GET.get('model_name')
        window_id = pk + model_name
        Model = apps.get_model(
            app_label="annotation_tool", model_name=model_name)
        if Model.objects.filter(pk=pk).exists():
            obj = Model.objects.get(pk=pk)
            slaves, masters = getAllLinks(obj)
            item_html = showcase(pk, model_name)
            slaves_html = ""
            masters_html = ""

            for key, item in slaves.items():
                slaves_html += '<div class="item-dep"> <p>' + key + ':</p>'
                slaves_html += '<div class ="placeholder"  data-dep-name="' + \
                    key+'" data-dep-role="slaves">'
                for i in item:
                    slaves_html += showcase(i.pk, i.__class__.__name__)
                slaves_html += '</div></div>'

            for key, item in masters.items():
                masters_html += '<div class="item-dep"> <p>' + key + ':</p>'
                masters_html += '<div class ="placeholder" data-dep-name="' + \
                    key+'" data-dep-role="masters">'
                for i in item:
                    masters_html += showcase(i.pk, i.__class__.__name__)
                masters_html += '</div></div>'

            html = render_to_string('annotation_tool/info.html',
                                    {'item': item_html, 'masters': masters_html, 'slaves': slaves_html, 'obj': obj, 'id': window_id})
            response = {}
            response['template'] = html
            return HttpResponse(json.dumps(response))
        return HttpResponseNotFound("Item is not present")


def showcase(pk, model_name):
    Model = apps.get_model(app_label="annotation_tool", model_name=model_name)
    if Model.objects.filter(pk=pk).exists():
        name = model_name.lower()
        item = Model.objects.get(pk=pk)
        html = render_to_string(
            'annotation_tool/showcase/' + name + '.html', {'item': item})
        return html


def showcase_test(request):
    if request.is_ajax():
        pk = request.GET.get('pk')
        model_name = request.GET.get('model_name')
        Model = apps.get_model(
            app_label="annotation_tool", model_name=model_name)
        if Model.objects.filter(pk=pk).exists():
            name = model_name.lower()
            item = Model.objects.get(pk=pk)
            html = render_to_string(
                'annotation_tool/showcase/' + name + '.html', {'item': item})
            response = {}
            response['template'] = html
            return HttpResponse(json.dumps(response))
        return HttpResponseNotFound("Item is not present")


def History(request, pk):
    types = 0
    lines = Line.objects.all().filter(article=Article.objects.get(pk=pk))
    return render(request, 'annotation_tool/history.html', {'lines': lines, 'pk': pk})


@csrf_exempt
def getLineDependencies(request):
    if request.is_ajax():
        block_pk = request.GET.get('pk')
        if Block.objects.filter(pk=block_pk).exists():
            block = Block.objects.get(pk=block_pk)
            links = block.getLineLinks()
            response = {}
            response['links'] = list(
                links[0].values('first_item__object_id', 'second_item__object_id', 'relation__name'))
            return JsonResponse(response)
        return HttpResponseNotFound("Block is not present")


def getAllLinks(item):
    slaves = []
    masters = []
    result_slaves = {}
    result_masters = {}
    all_slaves = Link.objects.all().filter(
        Q(first_item=item.tags.first()))
    all_masters = Link.objects.all().filter(
        Q(second_item=item.tags.first()))

    for rel in Relation.objects.all():
        current_slaves = all_slaves.filter(relation=rel)
        current_masters = all_masters.filter(relation=rel)

        for slave in current_slaves:
            obj = getItem(slave.second_item)
            slaves.append(obj)

        if slaves.__len__() > 0:
            result_slaves[rel.name] = slaves
        slaves = []
        for master in current_masters:
            obj = getItem(master.first_item)
            masters.append(obj)

        if masters.__len__() > 0:
            result_masters[rel.name] = masters
        masters = []

    return result_slaves, result_masters


def getItem(tag):
    Model = apps.get_model(app_label="annotation_tool",
                           model_name=tag.content_type.__str__())
    return Model.objects.get(pk=tag.object_id)


def readDOCX(block, file):
    docx_file = Document(file)
    tables = docx_file.tables
    block.title = tables[0].rows[1].cells[1].text
    block.title_origin = tables[0].rows[2].cells[1].text
    block.language = tables[0].rows[3].cells[1].text
    block.dialect = tables[0].rows[4].cells[1].text
    block.theme = tables[0].rows[5].cells[1].text
    block.place_of_recording = tables[0].rows[6].cells[1].text
    block.time_of_recording = tables[0].rows[7].cells[1].text
    block.publisher = tables[0].rows[8].cells[1].text
    block.versions = tables[0].rows[9].cells[1].text
    block.area_of_distribution = tables[0].rows[10].cells[1].text

    block.initials = tables[0].rows[12].cells[1].text
    block.text_preparation = tables[0].rows[13].cells[1].text
    block.original_recording = tables[0].rows[14].cells[1].text
    block.text_decipher = tables[0].rows[15].cells[1].text
    block.translation = tables[0].rows[16].cells[1].text
    block.manager = tables[0].rows[17].cells[1].text
    block.commentary_preparation = tables[0].rows[18].cells[1].text

    main_table = tables[1]
    i = 1
    block.save()
    for row in main_table.rows:
        Line(text_left=row.cells[0].text,
             text_right=row.cells[2].text, block=block, position=i).save()
        i = i + 1
