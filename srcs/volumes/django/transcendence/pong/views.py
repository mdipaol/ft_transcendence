from django.http import HttpResponse, Http404, HttpResponseRedirect
from django.shortcuts import render, get_object_or_404
from django.template import loader
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.views.generic import TemplateView, View
from django.urls import reverse

from .models import BaseUser
from .forms import RegistrationForm, LoginForm

class IndexView(TemplateView):
	template_name = 'pong/index.html'
	def get(self, request):
		return render(request, self.template_name, {'user': request.user})

class ProfileView(TemplateView):
	template_name='pong/profile.html'

class RegistrationFormView(TemplateView):
	form_class = RegistrationForm
	template_name = 'pong/registration_form.html'
	# GET	
	def get(self, request):
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
		return HttpResponseRedirect(reverse('pong:login'))

class LoginView(View):
	def get(self, request):
		...
	def post(self, request):
		form = LoginForm(request.POST)
		if form.is_valid():
			user = authenticate(username=form.cleaned_data['username'], password=form.cleaned_data['password'])

class LogoutView(TemplateView):
	def get(self, request):
		logout(request)
		return HttpResponseRedirect(reverse('pong:index'))

def login_view(request):
	if request.method == 'POST':
		form = LoginForm(request.POST)
		user = authenticate(username=form.data['username'], password=form.data['password'])
		if user is not None:
			login(request, user)
			# return render(request, 'pong/index.html', {'user': request.user})
			return HttpResponseRedirect(reverse('pong:index'))
		else:
			return HttpResponse('Authentication failed')
	else:
		form = LoginForm()
	return render(request, 'pong/login_form.html', { 'form': form })

def index_view(request):
	context = {
		'user': request.user
	}
	return render(request, 'pong/index.html', context)

def registration_view(request):
	if request.method == 'POST':
		form = RegistrationForm(request.POST)
		username = form.data['username']
		email = form.data['email']
		password = form.data['password']
		user = BaseUser.objects.create_user(username, email, password)
		user.save()
		return render(request, 'pong/index.html', {'user': request.user})
	else:
		form = RegistrationForm()
	return render(request, 'pong/registration_form.html', { 'form': form })

def logout_view(request):
	logout(request)
	return HttpResponseRedirect(reverse('pong:index'))