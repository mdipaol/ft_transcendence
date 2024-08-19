import time
import traceback
import asyncio
from asgiref.sync import sync_to_async
from datetime import datetime
from .game_class import Match
from .models import Match as ModelMatch, BaseUser, Tournament
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
            # asyncio.create_task(cls.monitoring())
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
        # Pick or create a match
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

        # Add player to the match
        match.add_player(consumer)

        # Channel layer logic
        await match.channel_layer.group_add(str(match.id), consumer.channel_name)
        # Start match
        if match.is_full():
            cls.start_match(match)
        return match

    @classmethod
    async def delete_player(cls, consumer):
        match: Match = consumer.match
        if not match:
            return
        if match.is_ended():
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
    def player_disconnected(cls, id, player : str):
        try:
            match_db : ModelMatch = ModelMatch.objects.get(id=id)
            user : BaseUser = BaseUser.objects.get(username=player)
            if match_db.player1 == user:
                match_db.score1 = 0
                match_db.score2 = 5
                winner = match_db.player2
            else: 
                match_db.score1 = 5
                match_db.score2 = 0
                winner = match_db.player1

            match_db.is_played = True

            match_db.save()

            tournament : Tournament = match_db.tournament
            if tournament:
                print('sto per salvare il torneo')
                match1_db = tournament.match1
                match2_db = tournament.match2
                the_finals_db = tournament.the_finals

                if match_db.id == match1_db.id:
                    the_finals_db.player1 = winner
                elif match_db.id == match2_db.id:
                    the_finals_db.player2 = winner
                elif match_db.id == the_finals_db.id:
                    tournament.winner = winner
                    tournament.finished = True
                    tournament.save()
                the_finals_db.save()

        except Exception as e:
            print(f"Error deleting player: {e}")
            traceback.print_exc

    @classmethod
    async def delete_player_id(cls, consumer, id):
        match: Match = consumer.match
        if not match:
            return
        if match.is_ended():
            return
        
        await sync_to_async(cls.player_disconnected)(match.id, consumer.username)

        if match in cls.invite_matches:
            cls.invite_matches.remove(match)

        await match.channel_layer.group_send(match.id, {
            'type' : 'game_end',
            'message' : {
                'type' : 'disconnection'
            }
        })
        print('im going to cancel task')
        await match.end_match()

    @classmethod
    def save_tournament_game(cls, match: Match):
        if not match or not match.tournament:
            return
        print('entro nella gestione suca')

        match_db : ModelMatch = ModelMatch.objects.get(id=match.id)
        tournament: Tournament = match_db.tournament

        player1 : BaseUser = match_db.player1
        player2 : BaseUser = match_db.player2

        
        match_db.score1 = match.score1
        match_db.score2 = match.score2

        print(player1)
        print(player2)
        print(match.score1)
        print(match.score2)

        winner: BaseUser = player1 if (match.score1 > match.score2) else player2
        if player1.username != match.player1.consumer.username:
            winner = player1 if winner.username == player2.username else player2 # Ensure winner is the correct user
            match_db.score1, match_db.score2 = match_db.score2, match_db.score1  # Swap scores if necessary


        match_db.is_played = True

        print('before')
        print('winner')
        print(winner)

        # Save the match object asynchronously
        match_db.save()

        print('after')
        print(f"Match saved: {match_db}")

        match1_db : ModelMatch = tournament.match1
        match2_db : ModelMatch = tournament.match2
        the_finals_db : ModelMatch = tournament.the_finals
        
        # Update the tournament based on the match result
        if match_db.id == match1_db.id:
            the_finals_db.player1 = winner
        elif match_db.id == match2_db.id:
            the_finals_db.player2 = winner
        elif match_db.id == the_finals_db.id:
            tournament.winner = winner
            tournament.finished = True

        the_finals_db.save()

        # Save the tournament object asynchronously
        tournament.save()

        print('all saved')

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
            cls.matches.remove(match)
        else:
            cls.invite_matches.remove(match)
        
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
                    date=start_time_str,
                    is_played=True
                )
                await sync_to_async(new_match.save)()  # Although save might not be necessary here
                print(f"Match saved: {new_match}")
            except Exception as e:
                print(f"Error saving match: {e}")
        else:
            try:
                await sync_to_async(cls.save_tournament_game)(match)
            except Exception as e:
                print(f"Error saving match: {e}")
                traceback.print_exc()  # Print the full stack trace

        await match.end_match()
    
    @classmethod
    async def monitoring(cls):
        while True:
            print(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
            print ("matches")
            print(cls.matches, sep=', ')
            print ("invite_matches")
            print(cls.invite_matches, sep=', ')
            # tasks = asyncio.all_tasks()
            tasks = [task for task in asyncio.all_tasks() if not task.done() and task != asyncio.current_task()]
            print(f"Active tasks: {tasks}")
            print("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<")
            # print(asyncio.all_tasks())
            await asyncio.sleep(5)
