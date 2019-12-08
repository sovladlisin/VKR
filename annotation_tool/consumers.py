from channels.generic.websocket import AsyncWebsocketConsumer
import json
from channels.consumer import AsyncConsumer
from annotation_tool.views import InfoWindow, ClassTree, SearchWindow, PinFactoryWindow, SaveWindow, PinFactory, Search


class Window2Consumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = 'user'
        self.room_group_name = 'workspace'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        template = text_data_json['template']

        print(template)
        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'template': template
            }
        )

    # # Receive message from room group
    async def chat_message(self, event):
        template = event['template']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'template': template
        }))


# class WindowConsumer(AsyncConsumer):

#     async def websocket_connect(self, event):
#         await self.send({
#             "type": "websocket.accept",
#         })

#     async def websocket_receive(self, event):
#         # print(event['template'])
#         text_data_json = json.loads(event["text"])
#         template = text_data_json['template']
#         print(template)
#         await self.send({
#             "type": "websocket.send",
#             "text": template,
#         })

class WindowConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data=None, bytes_data=None):
        text_data_json = json.loads(text_data)
        self.type = text_data_json['type']
        self.pk = text_data_json['pk']
        self.model_name = text_data_json['model_name']

        self.body = None
        if self.type == 'Info':
            self.id = "window-Info" + self.model_name + str(self.pk)
            self.body = InfoWindow(self.pk, self.model_name)

        if self.type == 'Search':
            self.id = 'window-Search'
            self.body = SearchWindow()

        if self.type == 'Tree':
            self.id = 'window-Tree'
            self.body = ClassTree()

        if self.type == 'PinFactoryWindow':
            self.id = 'window-PinFactory'
            self.body = PinFactoryWindow()

        await self.send(text_data=json.dumps({
            'body': self.body,
            'pk': self.pk,
            'model': self.model_name,
            'id': self.id

        }))


class WindowSaveConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data=None, bytes_data=None):
        text_data_json = json.loads(text_data)
        SaveWindow(text_data_json)


class PinFactoryConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data=None, bytes_data=None):
        text_data_json = json.loads(text_data)
        pin = PinFactory(text_data_json)

        await self.send(text_data=json.dumps({
            'pin': pin,
        }))


class SearchConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data=None, bytes_data=None):
        text_data_json = json.loads(text_data)
        result = Search(text_data_json)

        await self.send(text_data=json.dumps({
            'template': result,
        }))
