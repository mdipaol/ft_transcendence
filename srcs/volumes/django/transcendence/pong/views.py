from django.http import HttpRequest, HttpResponse, Http404, HttpResponseNotFound, HttpResponseRedirect, JsonResponse
from django.shortcuts import render, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.views.generic import TemplateView, View
from django.template import loader
from django.urls import reverse
import logging

# import online_users.models
# from online_users.models import OnlineUserActivity
from datetime import datetime, timedelta
from .models import BaseUser
from .forms import RegistrationForm, LoginForm, ChangePasswordForm

output_file_path = 'output.log'

def log_to_file(message):
	with open(output_file_path, 'a') as f:  # 'a' for append mode
		f.write(message + '\n')

# def see_users(request):
# 	user_status = online_users.models.OnlineUserActivity.get_user_activities(timedelta(seconds=60))
# 	users = (user for user in  user_status)
# 	context = {"online_users"}
# 	return render(request, 'pong/online.html', context)

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
			return JsonResponse({'success': True, 'redirect': '/index/'})
		else:
			self.context['form'] = form
			form_html = render(request, self.template_name, self.context).content.decode('utf-8')
			return JsonResponse({'success': False, 'form_html': form_html})

class LoginCustomView(View):
	template_name = 'pong/form.html'
	context = {'id' : 'login-form'}

	def get(self, request):
		if not request.headers.get('X-Requested-With') == 'XMLHttpRequest':
			return HttpResponseRedirect(reverse('pong:index'))
		form = LoginForm()
		return render(request, 'pong/login_form.html', {'form': form})
	def post(self, request):
		form = LoginForm(request.POST)
		if form.is_valid():
			user = authenticate(username=form.cleaned_data['username'], password=form.cleaned_data['password'])
			if user is not None:
				login(request, user)
				return HttpResponseRedirect(reverse('pong:index'))
			else:
				return HttpResponse('Authentication failed')
		return HttpResponse('ciao')

class LogoutView(TemplateView):
	def get(self, request):
		logout(request)
		return HttpResponseRedirect(reverse('pong:index'))

class ProfileView(View):
	def get(self, request, username):
		is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
		if not is_ajax:
			return HttpResponseNotFound('Not found')
		user = get_object_or_404(BaseUser, username=username)
		data = {
			'username' : user.username,
			'email' : user.email,
			'level' : user.level,
			'image' : user.image,
		}
		return JsonResponse(data)


# class UpdatePassword(View):
# 	def get(self, request):
# 		template = loader.get_template('pong/form.html')
# 		form = ChangePasswordForm()
# 		return HttpResponse(template.render({'form' : form}, request))
# 	def post(self, request):
# 		form = ChangePasswordForm(request.POST)
# 		if form.is_valid():
# 			if user is not None:
# 				login(request, user)
# 				return HttpResponseRedirect(reverse('pong:index'))
# 			else:
# 				return HttpResponse('Authentication failed')
		

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