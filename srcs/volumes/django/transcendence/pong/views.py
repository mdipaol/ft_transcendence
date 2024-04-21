from django.http import HttpRequest, HttpResponse, Http404, HttpResponseNotFound, HttpResponseRedirect, JsonResponse
from django.shortcuts import render, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.views.generic import TemplateView, View
from django.template import loader
from django.urls import reverse
import logging

from datetime import datetime, timedelta
from .models import BaseUser
from .forms import *

output_file_path = 'output.log'

def log_to_file(message):
	with open(output_file_path, 'a') as f:  # 'a' for append mode
		f.write(message + '\n')

class IndexView(TemplateView):
	template_name = 'pong/index.html'
	def get(self, request):
		return render(request, self.template_name, {'user': request.user})

class RegistrationFormView(View):
	template_name = 'pong/form.html'
	context = {
		'id' : 'registration-form',
	}

	def get(self, request):
		if not request.headers.get('X-Requested-With') == 'XMLHttpRequest':
			return HttpResponseRedirect(reverse('pong:index'))
		self.context['form'] = RegistrationForm()
		return render(request, self.template_name, self.context)
	def post(self, request):
		form = RegistrationForm(request.POST)
		if form.is_valid():
			form.save()
			return JsonResponse({'success': True, 'redirect': '/'})
		else:
			self.context['form'] = form
			form_html = render(request, self.template_name, self.context).content.decode('utf-8')
			return JsonResponse({'success': False, 'form_html': form_html})

class LoginCustomView(View):
	template_name = 'pong/form.html'
	context = {
		'id' : 'login-form',
	}

	def get(self, request):
		if not request.headers.get('X-Requested-With') == 'XMLHttpRequest':
			return HttpResponseRedirect(reverse('pong:index'))
		self.context['form'] = LoginForm()
		return render(request, self.template_name, self.context)
	def post(self, request):
		form = LoginForm(request.POST)
		if form.is_valid():
			user = authenticate(request, username=form.cleaned_data.get("username"), password=form.cleaned_data.get("password"))
			if user is not None:
				login(request, user)
			return JsonResponse({'success': True, 'redirect': '/'})
		else:
			self.context['form'] = form
			form_html = render(request, self.template_name, self.context).content.decode('utf-8')
			return JsonResponse({'success': False, 'form_html': form_html})

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
	if request.method == 'GET' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
		if request.user.is_authenticated == True:
			return HttpResponse('1')
		else:
			return HttpResponse('0')
	return HttpResponseNotFound('<h1>404 Not Found</h1>')

def personal_profile(request):
	return HttpResponseRedirect(reverse('pong:profile/' + request.user.get_username()))