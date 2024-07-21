
import asyncio
from asgiref.sync import sync_to_async
from datetime import datetime
from .game_class import Match
from .models import Match as ModelMatch
from channels.db import database_sync_to_async

class MatchManager:

    pendingPlayers = []
    matches = []
    active_monitoring = False

    @classmethod
    def get_consumer_match(cls, consumer):
        for item in cls.matches:
            if consumer in item.get_consumer_players():
                return item
        return None

    @classmethod
    def get_avaiable_match(cls) -> Match:
        for item in cls.matches:
            if not item.is_started():
                return item
        match = Match()
        cls.matches.append(match)
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
        match: Match = cls.get_avaiable_match()
        match.add_player(consumer)
        await match.channel_layer.group_add(match.id, consumer.channel_name)
        if match.is_full():
            cls.start_match(match)
        return match

    @classmethod
    async def delete_player(cls, consumer):
        match: Match = consumer.match
        if not match:
            return
        if match.is_ended():
            match.end_match()
        # capire chi ha vinto oppure disconnessione
        if match.is_empty():
            cls.matches.remove(match)
        else:
            await match.channel_layer.group_send(
                match.id, {
                    'type' : 'game_end',
                    'message' : {}
                })
            consumer.match = None


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

        # while match.ready(None):
        #     await asyncio.sleep(0.5)

        while not match.is_ended():

            await match.update()

            await match.send_game_state()


        await match.channel_layer.group_send(match.id, {
            'type' : 'game_end',
            'message' : match.state,
        })

        # new_match = await database_sync_to_async(ModelMatch.objects.create)(
        # player1=match.player1.consumer.user,
        # player2=match.player2.consumer.user,
        # score1=match.score1,
        # score2=match.score2,
        # match_date=match.start_time
    # )
        # await match.channel_layer.group_discard(match.id, match.player1.consumer.channel_name)
        # await match.channel_layer.group_discard(match.id, match.player2.consumer.channel_name)
        # match.end_match()
        # cls.matches.remove(match)
        # print('ciao')

        # print('ciao')
        # create = sync_to_async(ModelMatch.objects.create)
        # print(create)
        # new_match = await create(player1=match.player1.consumer.user, player2=match.player2.consumer.user, score1=match.score1, score2=match.score2, date=match.start_time)
        # print(new_match)
        # await sync_to_async(new_match.save)()
        # # new_match = await sync_to_async(ModelMatch.objects.create)(player1=match.player1.consumer.user, player2=match.player2.consumer.user, score1=match.score1, score2=match.score2, date=match.start_time)
        # await print(new_match)
        # #print("match saved")
        # # sync_to_async(new_match.save())

        #     # Saving the match to the database
        # Saving the match to the database
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

    @classmethod
    async def monitoring(cls):
        while True:
            print("monitoring")
            print ("matches")
            print(cls.matches, sep=', ')
            print(" players")
            print(cls.pendingPlayers, sep=', ')
            print("end monitoring")
            # print(asyncio.all_tasks())
            await asyncio.sleep(5)
