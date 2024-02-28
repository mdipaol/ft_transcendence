from django.http import HttpResponse, Http404, HttpResponseRedirect
from django.shortcuts import render, get_object_or_404
from django.template import loader

from .models import BaseUser
# from .forms import RegistrationForm, SendMail
from .forms import RegistrationForm

def index(request):
	return render(request, 'pong/index.html')

def registration(request):
	if request.method == 'POST':
		form = RegistrationForm(request.POST)
		username = form.data['username']
		email = form.data['email']
		password = form.data['password']
		user = BaseUser.objects.create_user(username, email, password)
		user.save()
		return HttpResponse('Successfull registration')
	else:
		form = RegistrationForm()
	return render(request, 'pong/form.html', { 'form': form })