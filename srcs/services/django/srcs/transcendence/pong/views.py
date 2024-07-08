import logging, json, requests, secrets, uuid, os
from pathlib import Path

import time
from datetime import datetime, timedelta
from oauthlib.oauth2 import WebApplicationClient

from transcendence import settings

from django.conf import settings
from django.http import HttpRequest, HttpResponse, Http404, HttpResponseNotFound, HttpResponseRedirect, JsonResponse
from django.shortcuts import render, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.views.generic import TemplateView, View
from django.template import loader
from django.template.loader import render_to_string
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt

from friendship.models import Friend, Follow, Block

from .models import BaseUser
from .models import Tournament
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
			form.save()
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

def play(request):
	if request.method == 'GET':
		return render(request, 'pong/spa/play.html')

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

@login_required
def tournament_create(request):
	if request.method == 'GET':
		form = CreateTournamentForm()
		return render(request, 'pong/spa/tournament_create.html', {'form' : form})
	if request.method == 'POST':
		form = CreateTournamentForm(request.POST)
		if form.is_valid():
			tournament = form.save(request.user)
			partecipant_list = TournamentPartecipant.objects.filter(tournament__name=tournament.name)
			user_partecipant = [item.user for item in partecipant_list]
			context = {
				'name' : tournament.name,
				'creator' : tournament.creator.username,
				'number_of_partecipants' : tournament.number_of_partecipants,
				'partecipants' : partecipant_list, # Fare la query per la lista dei partecipanti
				'winner' : None,
				'finished' : False,
				'joined' : request.user in user_partecipant,
			}
			return render(request, 'pong/spa/tournament_info.html', context)
		return render(request, 'pong/spa/tournament_create.html', {'form' : form})

@csrf_exempt
@login_required
def tournament_join(request, name):
	if request.method == 'POST':
		print(name)
		tournament = Tournament.objects.get(name=name)
		if not tournament:
			...
		partecipant_list = TournamentPartecipant.objects.filter(tournament__name=tournament.name)
		if name in partecipant_list:
			...
		if len(partecipant_list) >= tournament.number_of_partecipants:
			...
		partecipant = TournamentPartecipant(user=request.user, tournament=tournament, alias=name)
		partecipant.save()
		partecipant_list = TournamentPartecipant.objects.filter(tournament__name=tournament.name)
		user_partecipant = [item.user for item in partecipant_list]
		print(user_partecipant)
		context = {
				'name' : tournament.name,
				'creator' : tournament.creator.username,
				'number_of_partecipants' : tournament.number_of_partecipants,
				'partecipants' : TournamentPartecipant.objects.filter(tournament__name=tournament.name), # Fare la query per la lista dei partecipanti
				'winner' : None,
				'finished' : False,
				'joined' : request.user in user_partecipant,
				}
		return JsonResponse(data={
			'html' : render_to_string('pong/spa/tournament_info.html', context)
		})

@login_required
def tournaments_list(request):
	if request.method == 'GET':
		tournaments = Tournament.objects.all()
		context = {
			'tournaments' : tournaments,
			'user' : request.user,
		}
		return render(request, 'pong/spa/tournament_list.html', context)

@login_required(login_url='/')
def online_users(request):
	if request.method == 'GET':
		users = BaseUser.objects.filter(online__gt=0)
		for item in users:
			print(item)
		return render(request, 'pong/spa/online_users.html', {'online_users' : users})
