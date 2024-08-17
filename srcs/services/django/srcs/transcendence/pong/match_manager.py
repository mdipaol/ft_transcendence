import time
import asyncio
from asgiref.sync import sync_to_async
from datetime import datetime
from .game_class import Match
from .models import Match as ModelMatch
from channels.db import database_sync_to_async

class MatchManager:

    matches : list[Match] = []
    invite_matches : list[Match] = []
    active_monitoring = False

    @classmethod
    def get_consumer_match(cls, consumer):
        for item in cls.matches:
            if consumer in item.get_consumer_players():
                return item
        return None

    @classmethod
    def get_available_match(cls, consumer) -> Match:
        for item in cls.matches:
            if not item.is_started() and item.powerup_mode == consumer.powerup_mode:
                return item
        match = Match(consumer.powerup_mode)
        cls.matches.append(match)
        return match
    
    @classmethod
    def get_available_invite_match(cls, consumer) -> Match:
        for item in cls.invite_matches:
            if not item.is_started() and item.powerup_mode == consumer.powerup_mode:
                return item
        match = Match(consumer.powerup_mode)
        cls.invite_matches.append(match)
        return match

    @classmethod
    def start_match(cls, match: Match):
        if not cls.active_monitoring:
            cls.active_monitoring = True
            asyncio.create_task(cls.monitoring())
        match.start_match()
        task = asyncio.create_task(cls.game_loop(match))
        match.set_task(task)

    @classmethod
    async def add_player(cls, consumer):
        match: Match = cls.get_available_match(consumer)
        match.add_player(consumer)
        consumer.match = match
        await match.channel_layer.group_add(match.id, consumer.channel_name)
        if match.is_full():
            cls.start_match(match)
        return match

    @classmethod
    async def add_player_id(cls, consumer, id):
        match = None
        for item in cls.invite_matches:
            if id == item.id:
                match = item
                break
        if match == None:
            match = Match(consumer.powerup_mode, id)
            cls.invite_matches.append(match)

        if match.is_full():
            return None

        await match.channel_layer.group_add(str(match.id), consumer.channel_name)
        if match.is_full():
            cls.start_match(match)
        return match

    @classmethod
    async def delete_player(cls, consumer):
        match: Match = consumer.match
        if not match:
            return
        if match in cls.matches:
            cls.matches.remove(match)

        # Remember to delete channel layers

        await match.channel_layer.group_send(match.id, {
            'type' : 'game_end',
            'message' : {
                'type' : 'disconnection'
            }
        })

        await match.end_match()

    @classmethod
    async def game_loop(cls, match: Match):
        if not match.is_started():
            return

        await match.channel_layer.send( match.player1.consumer.channel_name, {
            'type' : 'game_start',
            'player' : 'player_one',
            'username_one' : match.player1.consumer.username,
            'username_two' : match.player2.consumer.username,
        })

        await match.channel_layer.send( match.player2.consumer.channel_name, {
            'type' : 'game_start',
            'player' : 'player_two',
            'username_one' : match.player1.consumer.username,
            'username_two' : match.player2.consumer.username,
        })

        while not match.ready(None):
            await asyncio.sleep(0.5)

        match.update_ball_await = time.time()

        while not match.is_ended():

            await match.update()

            await match.send_game_state()

        await match.channel_layer.group_send(match.id, {
            'type' : 'game_end',
            'message' : {
                'type' : 'win',
                'winner' : match.player1.consumer.username if match.score1 > match.score2 else match.player2.consumer.username ,
            }
        })

        if not match.tournament:
            try:
                # Ensure start_time is in the correct datetime format
                if isinstance(match.start_time, (int, float)):
                    start_time = datetime.fromtimestamp(match.start_time)
                elif isinstance(match.start_time, datetime):
                    start_time = match.start_time
                else:
                    start_time = datetime.strptime(match.start_time, '%Y-%m-%d %H:%M:%S')  # Adjust format if necessary

                start_time_str = start_time.strftime('%Y-%m-%d %H:%M:%S')

                create = sync_to_async(ModelMatch.objects.create)
                new_match = await create(
                    player1=match.player1.consumer.user,
                    player2=match.player2.consumer.user,
                    score1=match.score1,
                    score2=match.score2,
                    date=start_time_str
                )
                await sync_to_async(new_match.save)()  # Although save might not be necessary here
                print(f"Match saved: {new_match}")
            except Exception as e:
                print(f"Error saving match: {e}")
            
        else:
            try:
                db_match = await sync_to_async(ModelMatch.objects.get)(id=match.id)
                db_match.score1 = match.score1
                db_match.score2 = match.score2
                db_match.is_played = True
                await sync_to_async(db_match.save)()
                print(f"Match saved: {db_match}")
                
            except Exception as e:
                print(f"Error saving match: {e}")

        cls.matches.remove(match)
        await match.end_match()
    
    @classmethod
    async def monitoring(cls):
        while True:
            print(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
            print ("matches")
            print(cls.matches, sep=', ')
            # tasks = asyncio.all_tasks()
            tasks = [task for task in asyncio.all_tasks() if not task.done() and task != asyncio.current_task()]
            print(f"Active tasks: {tasks}")
            print("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<")
            # print(asyncio.all_tasks())
            await asyncio.sleep(5)
