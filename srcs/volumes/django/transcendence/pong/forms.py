from django import forms

from .models import BaseUser

class RegistrationForm(forms.Form):
	username = forms.CharField(label="Enter your username [MAX 10 characters]", max_length=10)
	email = forms.EmailField(label="Enter your email address")
	password = forms.CharField(label="Choose a strong password", widget=forms.PasswordInput())

class LoginForm(forms.Form):
	username = forms.CharField(label="Enter your username [MAX 10 characters]", max_length=10)
	password = forms.CharField(label="Choose a strong password", widget=forms.PasswordInput())
