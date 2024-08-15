import logging, json, requests, secrets, uuid, os
from pathlib import Path

import time
from datetime import datetime, timedelta
from oauthlib.oauth2 import WebApplicationClient

from transcendence import settings

from django.conf import settings
from django.http import HttpRequest, HttpResponse, Http404, HttpResponseNotFound, HttpResponseRedirect, JsonResponse
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.views.generic import TemplateView, View
from django.template import loader
from django.template.loader import render_to_string
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt

from friendship.models import Friend, Follow, Block

from .models import BaseUser, Tournament, Match
from .forms import *

def login42(request):
	client_id = settings.INTRA_OAUTH_CLIENT_ID
	client = WebApplicationClient(client_id)
	request.session['state'] = secrets.token_urlsafe(16)

	auth_url = "https://api.intra.42.fr/oauth/authorize"

	url = client.prepare_request_uri( auth_url, redirect_uri="https://localhost/callback", state=request.session['state'])
	return HttpResponseRedirect(url)

def sendFriendRequest(request, username):
	to_send = BaseUser.objects.get(username=username)
	if not to_send:
		return(HttpResponse("to_send not found"))
	if not request.user.is_authenticated:
		return (HttpResponse("Bad"))
	Friend.objects.add_friend(
		request.user,
		to_send,
		message='Sono proprio io'
	)
	return HttpResponse("Request Sent")


class CallbackView(View):
	def get(self, request, *args, **kwargs):
		data = self.request.GET
		code = data['code']
		state = data['state']

		if state != self.request.session['state']:
			print('Invalid state')
			return HttpResponseRedirect(reverse('pong:index'))
		else:
			del self.request.session['state']

		token_url = 'https://api.intra.42.fr/oauth/token'
		client_id = settings.INTRA_OAUTH_CLIENT_ID
		client_secret = settings.INTRA_OAUTH_SECRET

		client = WebApplicationClient(client_id)

		data = client.prepare_request_body(
			code = code,
			redirect_uri = "https://localhost/callback", # Controllare
			client_id = client_id,
			client_secret = client_secret,
		)

		response = requests.post(token_url, data=data)
		# print((json.dumps(json.loads(requests.get('https://api.intra.42.fr/v2/me', headers={
		# 	"Authorization" : "Bearer " + json.loads(response.text)["access_token"]
		# }).text), indent=4)))
		print(response)
		json_data = json.loads(requests.get('https://api.intra.42.fr/v2/me', headers={
			"Authorization" : "Bearer " + json.loads(response.text)["access_token"]
		}).text)

		email = json_data['email']
		username = json_data['login']
		image = json_data['image']['link']

		if BaseUser.objects.filter(email=email).exists():
			user = BaseUser.objects.get(email=email)
			login(request, user)
		else:
			user = BaseUser.objects.create_user(username=username, email=email, password=str(uuid.uuid4()))
			user.image = image
			user.save()
			login(request, user)
		return HttpResponseRedirect(reverse('pong:index'))


class IndexView(TemplateView):
	template_name = 'pong/spa/index.html'
	def get(self, request):
		friend_requests = None
		friends = None
		incoming_requests = None
		image = None
		if request.user.is_authenticated:
			friend_requests = Friend.objects.sent_requests(user=request.user)
			friends = Friend.objects.friends(request.user)
			incoming_requests = Friend.objects.unread_requests(user=request.user)
			image = str(BaseUser.objects.get(username=request.user.get_username()).image)
		return render(request, self.template_name, {
			'user': request.user,
			'image': image,
			'friends' : friends,
			'friend_requests' : friend_requests,
			'incoming_requests' : incoming_requests,
			})

class RegistrationFormView(View):
	def get(self, request):
		form = RegistrationForm()
		return render(request, 'pong/registration.html', {'form': form})
	def post(self, request):
		form = RegistrationForm(request.POST)
		if form.is_valid():
			user = form.save()
			login(request, user)
			return HttpResponse("Registration Succesfull")
		return(render(request, 'pong/registration.html', {'form': form}, status=409))

class LoginCustomView(View):
	def get(self, request):
		form = LoginForm()
		return render(request, 'pong/login.html', {'form': form})
	def post(self, request):
		form = LoginForm(request.POST)
		if form.is_valid():
			form.save(request)
			return render(request, 'pong/spa/home.html')
		return render(request, 'pong/login.html', {'form': form}, status=401)


class LogoutView(TemplateView):
	def get(self, request):
		logout(request)
		try:
			del request.session['user']
		except:
			return HttpResponseRedirect(reverse('pong:index'))
		return HttpResponseRedirect(reverse('pong:index'))

def handle_uploaded_file(file):
	ext = Path(file.name).suffix
	new_file_name = str(uuid.uuid4()) + ext
	full_path = os.path.join(settings.MEDIA_ROOT, new_file_name)
	with open(full_path, "wb+") as destination:
		for chunk in file.chunks():
			destination.write(chunk)
	return new_file_name

class ImageUpload(View):
	def get(self, request):
		form = ImageUploadForm()
		return render(request, 'pong/image_form.html', {'form' : form})
	def post(self, request):
		form = ImageUploadForm(request.POST, request.FILES)
		# Non entro qui non so perchè
		if form.is_valid():
			print(request.FILES)
			file_name = handle_uploaded_file(request.FILES['image'])
			user: BaseUser = request.user
			user.image = settings.MEDIA_URL + file_name
			user.save()
			return HttpResponse("Avatar Uploaded!")
		return render(request, 'pong/image_form.html', {'form': form})


class ProfileView(View):
	def get(self, request, username):
		is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
		if not is_ajax:
			return HttpResponseNotFound(reverse('pong:index'))
		user = get_object_or_404(BaseUser, username=username)
		data = {
			'username' : user.username,
			'email' : user.email,
			'level' : user.level,
			'image' : user.image,
		}
		return JsonResponse(data)

SETTINGS_FORM = {
	'username' : ChangeUsernameForm,
	'password' : ChangePasswordForm,
	'image' : UpdateAvatar,
	'email' : ChangeEmailForm,
}

class SettingsView(View):
	template_name = 'pong/form.html'

	def get(self, request, setting):
		if not request.headers.get('X-Requested-With') == 'XMLHttpRequest':
			return HttpResponseRedirect(reverse('pong:index'))
		form_class = SETTINGS_FORM[setting]
		if form_class is None:
			return HttpResponseNotFound()
		form = form_class(user=request.user)
		return render(request, self.template_name, {
			'form' : form,
			'id' : form.id,
		})
	def post(self, request, setting):
		form_class = SETTINGS_FORM[setting]
		if form_class is None:
			return HttpResponseNotFound()
		form = form_class(request.POST)
		if form.is_valid():
			return JsonResponse({'success': True, 'redirect': '/'})
		else:
			context = {
				'form' : form,
				'id' : form.id,
			}
			form_html = render(request, self.template_name, context).content.decode('utf-8')
			return JsonResponse({'success': False, 'form_html': form_html})

def chat_index(request):
	return render(request, 'pong/chat.html')

def room(request, room_name):
    return render(request, "pong/room.html", {"room_name": room_name})

def scripts_view(request):
    script_content = render_to_string('pong/game.html')
    return HttpResponse(script_content, content_type='application/javascript')

def game(request):
	return render(request, 'pong/game.html')

def username(request):
	is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
	if not is_ajax:
		return HttpResponseNotFound('Not found')
	user = request.user
	data = {'username': ''}
	if user.is_authenticated:
		data['username'] = user.get_username()
	return HttpResponse(data['username'])

def authenticated(request):
	if request.method == 'GET':
		authenticated = request.user.is_authenticated
		json_res = {'authenticated': authenticated}
		# string = json.dumps(json_res)
		return JsonResponse(json_res)
	return(HttpResponseRedirect(reverse('pong:index')))

def personal_profile(request):
	return HttpResponseRedirect(reverse('pong:profile/' + request.user.get_username()))

def home(request):
	if request.method == 'GET':
		return render(request, 'pong/spa/home.html')

def navbar(request):
	if request.method == 'GET':
		if not request.user.is_authenticated:
			links = ['Home', 'AboutUs']
		else:
			links = ['Home', 'Play', 'Tournament_Join', 'Account', 'AboutUs']
		return render(request, 'pong/spa/navbar.html', {'links' : links})

def item_show(request):
	if request.method == 'GET':
		context = {
			"nickname" : request.user.get_username(),
		}
		return render(request, 'pong/spa/item_show.html', context)

@login_required(login_url='/')
def play(request):
	if request.method == 'GET':
		return render(request, 'pong/spa/play.html')

def interface_underground(request):
	if request.method == 'GET':
		return render(request, 'pong/spa/interface_underground.html')

def interface_thefinals(request):
	if request.method == 'GET':
		return render(request, 'pong/spa/interface_thefinals.html')

def account(request):
	if request.method == 'GET':
		user = request.user
		context = {}
		if user.is_authenticated:
			context = {
				'nickname' : user.username,
				'img' : user.image,
				'email' : user.email,
				'level' : user.level,
			}
		return render(request, 'pong/spa/account.html', context)

@login_required(login_url='/')
def tournament_create(request):
	if request.method == 'GET':
		# html = render_to_string('pong/spa/tournament_create.html')
		# return JsonResponse(data={
		# 	'html' : html,
		# 	'error' : None,
		# })
		return render(request, 'pong/spa/tournament_create.html')
	if request.method == 'POST':
		alias : str = request.POST.get('alias')
		tournament_name : str = request.POST.get('tournament-name')
		if tournament_name.strip() == '':
			return JsonResponse(data={
				'error' : 'Insert a valid tournament name',
				'type' : 'tournament',
			})
		if Tournament.objects.filter(name=tournament_name).exists():
			return JsonResponse(data={
				'error' : 'Tournament name already taken',
				'type' : 'tournament',
			})
		if alias.strip() == '':
			return JsonResponse(data={
				'error' : 'Insert a valid alias name',
				'type' : 'alias',
			})

		tournament = Tournament.objects.create(name=tournament_name, creator=request.user)
		tournament.save()
		partecipant = TournamentPartecipant.objects.create(tournament=tournament, user=request.user, alias=alias)
		partecipant.save()
		partecipant_list = TournamentPartecipant.objects.filter(tournament__name=tournament.name)
		user_partecipant = [item.user.username for item in partecipant_list]
		context = {
			'name' : tournament.name,
			'creator' : tournament.creator.username,
			'partecipants' : partecipant_list,
			'winner' : None,
			'started' : tournament.started,
			'finished' : False,
			'joined' : request.user.username in user_partecipant,
		}
		return JsonResponse(data={
			'html' : render_to_string('pong/spa/tournament_info.html', context),
			'name' : tournament.name,
		})

@login_required(login_url='/')
def tournament_alias(request, name):
	tournament = Tournament.objects.get(name=name)

	partecipant_list = TournamentPartecipant.objects.filter(tournament__name=tournament.name)
	partecipant_user = [item.user for item in partecipant_list]

	if request.user in partecipant_user:
		return JsonResponse(data={
			'error' : 'Alias already in the Tournament'
		}, status=400)
	else:
		return render(request, 'pong/spa/tournament_alias.html')

def get_match_info(match : Match) -> dict:
	player1 = None
	player2 = None

	if match is None:
		return {}

	if (match.tournament):
		tournament : Tournament = match.tournament
		partecipants : TournamentPartecipant = TournamentPartecipant.objects.filter(tournament__name=tournament.name)
		partecipants_data = [[p.user, p.alias] for p in partecipants]
		match_players: list[BaseUser] = [match.player1, match.player2]
		for player in match_players:
			for p in partecipants_data:
				if p[0] == player:
					if player == match.player1:
						player1 = p
					else:
						player2 = p
	return {
		'match' : match,
		'score1' : match.score1,
		'score2' : match.score2,
		'played' : match.is_played,
		'date' : match.date,
		'player1' : {
			'user' : player1[0] if player1 else None,
			'alias' : player1[1] if player1 else None
		},
		'player2' : {
			'user' : player2[0] if player2 else None,
			'alias' : player2[1] if player2 else None,
		},
	}


@login_required(login_url='/')
def tournament_join(request, name):
	if request.method == 'GET':
		try:
			tournament = Tournament.objects.get(name=name)
		except Exception as e:
			print(e)
			return JsonResponse(data={
				'error' : 'Tournament not found'
			}, status=404)
		partecipant_list = TournamentPartecipant.objects.filter(tournament__name=tournament.name)
		partecipant_user = [item.user.username for item in partecipant_list]
		context = {
				'name' : tournament.name,
				'creator' : tournament.creator.username,
				'partecipants' : partecipant_list, # Fare la query per la lista dei partecipanti
				'started' : tournament.started,
				'match1' : get_match_info(tournament.match1),
				'match2' : get_match_info(tournament.match2),
				'the_finals' : get_match_info(tournament.the_finals),
				'winner' : None,
				'finished' : False,
				'joined' : request.user.username in partecipant_user,
			}
		return JsonResponse(data={
			'html' : render_to_string('pong/spa/tournament_info.html', context)
		})
	if request.method == 'POST':

		# Not existing tournament
		try:
			tournament = Tournament.objects.get(name=name)
		except Exception as e:
			print(e)
			return JsonResponse(data={
				'error' : 'Tournament not found'
			}, status=404)

		# User already in tournament
		partecipant_list = TournamentPartecipant.objects.filter(tournament__name=tournament.name)
		partecipant_user = [item.user.username for item in partecipant_list]
		if request.user in partecipant_user:
			context = {
				'name' : tournament.name,
				'creator' : tournament.creator.username,
				'partecipants' : partecipant_list, # Fare la query per la lista dei partecipanti
				'started' : tournament.started,
				'match1' : get_match_info(tournament.match1),
				'match2' : get_match_info(tournament.match2),
				'the_finals' : get_match_info(tournament.the_finals),
				'winner' : None,
				'finished' : False,
				'joined' : request.user.username in partecipant_user,
				}
			return JsonResponse(data={
				'html' : render_to_string('pong/spa/tournament_info.html', context)
			})

		# Tournament full
		if len(partecipant_user) >= 4:
			return JsonResponse(data={'error' : 'Tournament is full'}, status=500)

		# Add new partecipant to database
		alias : str = request.POST.get('alias')
		print(alias)

		if not alias or alias.strip() == '':
			return JsonResponse(data={'error' : 'Enter a valid alias'})

		aliases = [a.alias for a in partecipant_list if a]
		if alias in aliases:
			return JsonResponse(data={'error' : 'The alias is already taken'})

		# Saving the new partecipant with the alias in the dataabase
		partecipant = TournamentPartecipant.objects.create(tournament=tournament, user=request.user, alias=alias)
		partecipant.save()

		# Creation of matches if tournament is full
		partecipant_list = TournamentPartecipant.objects.filter(tournament__name=tournament.name)
		user_partecipant = [item.user for item in partecipant_list]
		print(user_partecipant)
		if len(user_partecipant) == 4 and tournament.started == False:
			sorted_user = sorted(user_partecipant, key=lambda user: user.level)
			paired_user = [(sorted_user[i], sorted_user[i + 1]) for i in range(0, len(sorted_user) - 1, 2)]

			tournament.match1 = Match.objects.create(tournament=tournament, player1=paired_user[0][0], player2=paired_user[0][1])
			tournament.match2 = Match.objects.create(tournament=tournament, player1=paired_user[1][0], player2=paired_user[1][1])
			tournament.started = True
			tournament.save()

		# Return the tournament visualization
		context = {
				'name' : tournament.name,
				'creator' : tournament.creator.username,
				'partecipants' : TournamentPartecipant.objects.filter(tournament__name=tournament.name), # Fare la query per la lista dei partecipanti
				'started' : tournament.started,
				'match1' : get_match_info(tournament.match1),
				'match2' : get_match_info(tournament.match2),
				'the_finals' : get_match_info(tournament.the_finals),
				'winner' : None,
				'finished' : False,
				'joined' : request.user in user_partecipant,
				}
		return JsonResponse(data={
			'html' : render_to_string('pong/spa/tournament_info.html', context)
		})

@login_required(login_url='/')
def tournaments_list(request):
	tournaments = Tournament.objects.all()
	user = request.user
	joined : list[Tournament] = []
	available : list[Tournament] = []
	for t in tournaments:
		partecipant = TournamentPartecipant.objects.filter(tournament__name=t.name)
		if user in [p.user for p in partecipant]:
			joined.append({'tournament' : t, 'partecipants' : len(partecipant)})
		else:
			available.append({'tournament' : t, 'partecipants' : len(partecipant)})
	context = {
		'tournaments' : tournaments,
		'user' : user,
		'tournaments_joined' : joined,
		'tournaments_available' : available,
	}
	return render(request, 'pong/spa/tournament_list.html', context)

@login_required(login_url='/')
def online_users(request):
	if request.method == 'GET':
		users = BaseUser.objects.filter(online__gt=0)
		for item in users:
			print(item)
		return render(request, 'pong/spa/online_users.html', {'online_users' : users})

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

@login_required(login_url='/')
def tournament_info(request, name):
	tournament = Tournament.objects.get(name=name)
	partecipant_list = TournamentPartecipant.objects.filter(tournament__name=tournament.name)
	context = {
			'name' : tournament.name,
			'creator' : tournament.creator.username,
			'partecipants' : TournamentPartecipant.objects.filter(tournament__name=tournament.name), # Fare la query per la lista dei partecipanti
			'winner' : None,
			'finished' : False,
			'joined' : request.user in [item.user for item in partecipant_list],
		}
	return render(request, 'pong/spa/tournament_info.html', context)

@login_required(login_url='/')
def tournament_leave(request, name):

	if request.method == 'POST':
		tournament = Tournament.objects.get(name=name)
		partecipant_list = TournamentPartecipant.objects.filter(tournament__name=tournament.name)
		partecipant_user = [item.user for item in partecipant_list]
		if request.user in partecipant_user:
			print(request.user)
			try:
				TournamentPartecipant.objects.get(user=request.user, tournament=tournament).delete()
			# partecipant.delete()
			except Exception as e:
				print(e)
			partecipant_list = TournamentPartecipant.objects.filter(tournament__name=tournament.name)
			if (len(partecipant_list) == 0):
				tournament.delete()
		return HttpResponse('')

@login_required(login_url='/')
def edit_account(request):
	if request.method == 'GET':
		user = request.user
		form = EditProfileForm(instance=user)
		print(form)
		return render(request, 'pong/spa/edit_account.html', { 'user' : user, 'form' : form })
	if request.method == 'POST':
		print(vars(request))
		user = request.user
		form = EditProfileForm(request.POST, request.FILES, instance=user)
		if form.is_valid():
			form.save()
			return redirect('/#/account')
		else:
			form = EditProfileForm(instance=user)

		return render(request, 'pong/spa/edit_account.html', {'form': form, 'img': user.image})

@login_required(login_url='/')
def notification(request, username):
	user = BaseUser.objects.get(username=username)
	if not user:
		return HttpResponse('user not found')
	channel_layer = get_channel_layer()
	# print(f"notifications_{str(user.id)}")
	async_to_sync(channel_layer.group_send)(
        f"notifications_{str(user.id)}",
        {
            "type": "send_notification",
            "message": {"message": "sono una puttana"}
        }
    )
	return HttpResponse('Notification sent')
