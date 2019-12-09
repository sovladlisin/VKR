import openpyxl
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth import authenticate, login, logout
import json
from django.db.models import Q
from django.apps import apps
from django.http import StreamingHttpResponse, HttpResponse, JsonResponse, HttpResponseNotFound, HttpResponseRedirect
from django.shortcuts import render, redirect, get_object_or_404

# main annotation_tool
from django.template import loader
from django.template.loader import render_to_string
from django.views.decorators.csrf import csrf_exempt
from docx import Document

from annotation_tool.forms import UploadFileForm, RelationForm, LineForm, BlockForm, ObjectForm, ClassForm, DescriptionForm, UserForm, UserProfileInfoForm
from annotation_tool.models import Block, Relation, Class, Line, Link, TaggedItem, Object, Description, UserProfileInfo


def register(request):
    if request.method == 'POST':
        user_form = UserForm(data=request.POST)
        profile_form = UserProfileInfoForm(data=request.POST)
        if user_form.is_valid() and profile_form.is_valid():
            user = user_form.save()
            user.set_password(user.password)
            user.is_active = False
            user.save()
            profile = profile_form.save(commit=False)
            profile.user = user
            profile.save()
            return redirect('annotation_tool:user_login')
        else:
            mark = True
            return render(request, 'annotation_tool/authentication/registration.html',
                          {'user_form': user_form,
                           'profile_form': profile_form, 'mark': mark
                           })
    else:
        user_form = UserForm()
        profile_form = UserProfileInfoForm()
    return render(request, 'annotation_tool/authentication/registration.html',
                  {'user_form': user_form,
                           'profile_form': profile_form,
                   })


def user_login(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(username=username, password=password)
        if user is not None:
            if user.is_active:
                login(request, user)
                return redirect('annotation_tool:blocks')
            else:
                return render(request, 'annotation_tool/authentication/loginError.html', {})
        else:
            print("Someone tried to login and failed.")
            print("They used username: {} and password: {}".format(
                username, password))
            return render(request, 'annotation_tool/authentication/loginError.html', {})
    else:
        return render(request, 'annotation_tool/authentication/login.html', {})


def handler404(request, exception):
    if request.user.is_authenticated:
        return redirect('annotation_tool:blocks')
    else:
        return redirect('annotation_tool:user_login')


def BlockSelection(request):
    if request.user.is_authenticated:
        blocks = Block.objects.all()
        return render(request, 'annotation_tool/blocks.html', {'blocks': blocks})
    else:
        return redirect('annotation_tool:user_login')


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


def destroyAllLinks(element):
    tag = element.tags.first()
    Link.objects.filter(first_item=tag).delete()
    Link.objects.filter(second_item=tag).delete()


def SaveWindow(data):
    pk = data['pk']
    model = data['model']
    masters = json.loads(data['masters'])
    slaves = json.loads(data['slaves'])

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


def Workspace(request, pk):
    if request.user.is_authenticated:
        block = Block.objects.get(pk=pk)
        lines = Line.objects.all().filter(block=block).order_by('position')
        return render(request, 'annotation_tool/main.html', {'lines': lines, 'pk': pk})
    else:
        return redirect('annotation_tool:user_login')

# else:
#     return HttpResponse('Not Authorized', status=403)


def SearchWindow():
    html = render_to_string('annotation_tool/windows/search.html',)
    return html


def Search(data):
    phrase = data['phrase']
    print(phrase)
    html = ''
    for block in Block.objects.all():
        html += showcase(block.pk, 'Block')
    for line in Line.objects.all():
        html += showcase(line.pk, 'Line')
    for obj in Object.objects.all():
        html += showcase(obj.pk, 'Object')
    for desc in Description.objects.all():
        html += showcase(desc.pk, 'Description')
    return html


def ClassTree():
    html = render_to_string(
        'annotation_tool/windows/tree.html', {'genres': Class.objects.all()})
    return html


def PinFactory(data):
    model = data['model']
    Model = apps.get_model(
        app_label="annotation_tool", model_name=model)
    item = Model()
    item.save()
    item_html = showcase(item.pk, model)
    return item_html


def PinFactoryWindow():
    html = render_to_string('annotation_tool/windows/pinFactory.html')
    return html


@csrf_exempt
def SaveEntity(request, pk, model):
    if request.user.is_authenticated:
        Model = apps.get_model(
            app_label="annotation_tool", model_name=model)
        item = get_object_or_404(Model, pk=pk)
        if request.method == "POST":
            GenericForm = getForm(model)
            form = GenericForm(request.POST, instance=item)
            if form.is_valid():
                item = form.save(commit=False)
                item.save()
                return HttpResponse("Сохранено")
            else:
                return HttpResponse("Ошибка в форме")
    else:
        return redirect('annotation_tool:user_login')


def InfoWindow(pk, model_name):
    Model = apps.get_model(
        app_label="annotation_tool", model_name=model_name)
    if Model.objects.filter(pk=pk).exists():
        obj = Model.objects.get(pk=pk)
        slaves, masters = getAllLinks(obj)

        GenericForm = getForm(model_name)
        form = GenericForm(instance=obj)

        item_html = showcase(pk, model_name, False)
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

        html = render_to_string('annotation_tool/windows/info.html',
                                {'item': item_html, 'masters': masters_html, 'slaves': slaves_html, 'obj': obj, 'form': form})
        return html


def showcase(pk, model_name, pin=True):
    Model = apps.get_model(app_label="annotation_tool", model_name=model_name)
    if Model.objects.filter(pk=pk).exists():
        name = model_name.lower()
        item = Model.objects.get(pk=pk)
        html = render_to_string(
            'annotation_tool/showcase/' + name + '.html', {'item': item, 'pin': pin})
        return html


@csrf_exempt
def getLineDependencies(request):
    if request.user.is_authenticated:
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
    else:
        return redirect('annotation_tool:user_login')


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


def getForm(model):
    forms = {
        'Line': LineForm,
        'Block': BlockForm,
        'Object': ObjectForm,
        'Class': ClassForm,
        'Description': DescriptionForm
    }
    return forms[model]
