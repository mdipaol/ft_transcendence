from django.http import HttpRequest, HttpResponse, Http404, HttpResponseNotFound, HttpResponseRedirect, JsonResponse
from django.shortcuts import render, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.views.generic import TemplateView, View
from django.template import loader
from django.urls import reverse
import logging, json
from transcendence import settings

from datetime import datetime, timedelta
from .models import BaseUser
from .forms import *

import requests
import secrets
from oauthlib.oauth2 import WebApplicationClient

def login42(request):
	client_id = settings.INTRA_OAUTH_CLIENT_ID
	client = WebApplicationClient(client_id)
	request.session['state'] = secrets.token_urlsafe(16)

	auth_url = "https://api.intra.42.fr/oauth/authorize"

	url = client.prepare_request_uri( auth_url, redirect_uri="https://localhost/callback", state=request.session['state'])
	return HttpResponseRedirect(url)

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
		# data = client.prepare_token_request(
		# 	client_id = client_id,
		# 	secret_id = secret_id,
		# 	code = code,
		# 	redirect_url = "https://localhost/callback",
		# 	token_url=token_url,
		# 	#grant_type = 'authorization_code'
		# )

		# data = {
		# 	"code" : code,
		# 	"state" : state,
		# 	"grant_type" : 'authorization_code',
		# 	"client_id" : client_id,
		# 	"client_secret" : secret_id,
		# 	"redirect_uri" : "https://localhost/callback"
		# }

		data = client.prepare_request_body(
			code = code,
			redirect_uri = "https://localhost/callback",
			client_id = client_id,
			client_secret = client_secret,
		)

		response = requests.post(token_url, data=data)
		print(response.text)
		print((json.dumps(json.loads(requests.get('https://api.intra.42.fr/v2/me', headers={
			"Authorization" : "Bearer " + json.loads(response.text)["access_token"]
		}).text), indent=4)))

		#image_url
		#name
		#email

class IndexView(TemplateView):
	template_name = 'pong/index.html'
	def get(self, request):
		return render(request, self.template_name, {'user': request.user})

class RegistrationFormView(View):
	def get(self, request):
		form = RegistrationForm()
		return render(request, 'pong/registration.html', {'form': form})
	def post(self, request):
		form = RegistrationForm(request.POST)
		if form.is_valid():
			form.save()
			return HttpResponse("Registration Succesfull")
		return(render(request, 'pong/registration.html', {'form': form}))

class LoginCustomView(View):
	def get(self, request):
		form = LoginForm()
		return render(request, 'pong/login.html', {'form': form})
	def post(self, request):
		form = LoginForm(request.POST)
		if form.is_valid():
			form.save(request)
			return HttpResponse("Succesfull login")
		return render(request, 'pong/login.html', {'form': form})

class LogoutView(TemplateView):
	def get(self, request):
		logout(request)
		return HttpResponseRedirect(reverse('pong:index'))

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

def is_authenticated(request):
	if request.method == 'GET':
		authenticated = request.user.is_authenticated
		json_res = {'authenticated': authenticated, 'prova': 'ciao'}
		string = json.dumps(json_res)
		print(string)
		return JsonResponse(string, safe=False)
	return(HttpResponseRedirect(reverse('pong:index')))

def personal_profile(request):
	return HttpResponseRedirect(reverse('pong:profile/' + request.user.get_username()))
