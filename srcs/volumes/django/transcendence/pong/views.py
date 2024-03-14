from django.http import HttpRequest, HttpResponse, Http404, HttpResponseNotFound, HttpResponseRedirect, JsonResponse
from django.shortcuts import render, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.views.generic import TemplateView, View
from django.template import loader
from django.urls import reverse

from .models import BaseUser
from .forms import RegistrationForm, LoginForm


class IndexView(TemplateView):
	template_name = 'pong/index.html'
	def get(self, request):
		return render(request, self.template_name, {'user': request.user})

class RegistrationFormView(TemplateView):
	form_class = RegistrationForm
	template_name = 'pong/registration_form.html'
	def get(self, request):
		is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
		if not is_ajax:
			return HttpResponseRedirect(reverse('pong:index'))
		form = self.form_class()
		return render(request, self.template_name, {'form': form})
	# POST	
	def post(self, request):
		form = self.form_class(request.POST)
		if form.is_valid():
			username = form.cleaned_data['username']
			email = form.cleaned_data['email']
			password = form.cleaned_data['password']
			user = BaseUser.objects.create_user(username, email, password)
			user.save()
		return HttpResponseRedirect(reverse('pong:index'))

class LoginCustomView(View):
	def get(self, request):
		is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
		if not is_ajax:
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