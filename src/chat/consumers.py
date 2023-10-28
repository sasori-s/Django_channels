from django.contrib.auth import get_user_model
from channels.generic.websocket import AsyncWebsocketConsumer
import json
from .models import Message

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):

    async def fetch_messages(self, data):
        messages = await self.messages_to_json(Message.last_10_messages())
        content = {
            'command': 'messages',
            'messages': messages
        }
        await self.send_message(content)

    async def new_message(self, data):
        author = data['from']
        author_user = await self.get_user(author)
        message = await self.create_message(author_user, data['message'])
        content = {
            'command': 'new_message',
            'message': await self.message_to_json(message)
        }
        await self.send_chat_message(content)

    async def messages_to_json(self, messages):
        result = []
        for message in messages:
            result.append(await self.message_to_json(message))
        return result

    async def message_to_json(self, message):
        return {
            'author': message.author.username,
            'content': message.content,
            'timestamp': str(message.timestamp)
        }

    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'chat_%s' % self.room_name

        # Add the consumer to the room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Remove the consumer from the room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        command = data.get('command')

        if command == 'fetch_messages':
            await self.fetch_messages(data)
        elif command == 'new_message':
            await self.new_message(data)

    async def get_user(self, username):
        return await User.objects.filter(username=username).first()

    async def create_message(self, author, content):
        return await Message.objects.create(author=author, content=content)

    async def send_chat_message(self, message):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message
            }
        )

    async def send_message(self, message):
        await self.send(text_data=json.dumps(message))

    async def chat_message(self, event):
        message = event['message']
        await self.send(text_data=json.dumps(message))
