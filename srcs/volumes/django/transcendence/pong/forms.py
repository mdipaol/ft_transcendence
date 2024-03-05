from django import forms

from .models import BaseUser

class RegistrationForm(forms.Form):
	username = forms.CharField(label="Enter your username [MAX 10 characters]", max_length=10)
	email = forms.EmailField(label="Enter your email address")
	password = forms.CharField(label="Choose a strong password", widget=forms.PasswordInput())

class LoginForm(forms.Form):
	username = forms.CharField(label="Enter your username [MAX 10 characters]", max_length=10)
	password = forms.CharField(label="Choose a strong password", widget=forms.PasswordInput())

class SendMail(forms.Form):
	sender = forms.EmailField(label="Inserisci la tua mail")
	email = forms.EmailField(label="Mail a cui inviare il messaggio")
	subject = forms.CharField(max_length=100)
	content = forms.CharField(widget=forms.Textarea)
	cc = forms.BooleanField(required=False)

# class PlayerForm(forms.ModelForm):
# 	class Meta:
# 		model = BaseUser
# 		fields = ['nickname', 'email', 'level', 'image']
