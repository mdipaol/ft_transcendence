
import asyncio
from asgiref.sync import async_to_sync
from .game_class import Match

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
        # if not cls.active_monitoring:
        #     cls.active_monitoring = True
        #     asyncio.create_task(cls.monitoring())
        match.start_match()
        asyncio.create_task(cls.game_loop(match))

    @classmethod
    async def add_player(cls, consumer):
        match: Match = cls.get_avaiable_match()
        match.add_player(consumer)
        await match.channel_layer.group_add(match.id, consumer.channel_name)
        if match.is_full():
            cls.start_match(match)
        return match
        
    @classmethod
    def delete_player(cls, consumer):
        ...

    @classmethod
    async def game_loop(cls, match: Match):
        if not match.is_started():
            return

        await match.channel_layer.send( match.player1.consumer.channel_name, {
            'type' : 'game_start',
            'player' : 'player_one'
        })

        await match.channel_layer.send( match.player2.consumer.channel_name, {
            'type' : 'game_start',
            'player' : 'player_two'
        })

        while not match.is_ended():

            await match.update()

            await match.send_game_state()

        match.send_to_channel("game_end", {})

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