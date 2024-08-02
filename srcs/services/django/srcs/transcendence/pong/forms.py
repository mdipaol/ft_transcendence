
from password_strength import PasswordPolicy

from django.contrib.auth import authenticate, login
from django.core.files import File
from django import forms
from .models import *



password_policy = PasswordPolicy.from_names(
	length=8,
	numbers=1,
	special=1,
)

class EditProfileForm(forms.ModelForm):
	class Meta:
		model = BaseUser
		fields = ['image', 'username', 'email']

class RegistrationForm(forms.Form):
	username = forms.CharField(label="Enter your username", max_length=20)
	email = forms.EmailField(label="Enter your email address")
	password1 = forms.CharField(label="Enter password", widget=forms.PasswordInput())
	password2 = forms.CharField(label="Confirm password", widget=forms.PasswordInput())

	def clean_username(self):
		username = self.cleaned_data.get("username")
		if BaseUser.objects.filter(username=username).exists():
			raise forms.ValidationError("This username is already taken.")
		return username

	def clean_email(self):
		email = self.cleaned_data.get("email")
		if BaseUser.objects.filter(email=email).exists():
			raise forms.ValidationError("There is an existing account with this email")
		return email

	def clean_password1(self):
		password1 = self.cleaned_data.get("password1")
		errors = password_policy.test(password1)
		for item in errors:
			raise forms.ValidationError(item)
		return password1

	def clean(self):
		cleaned_data = super().clean()
		password1 = cleaned_data.get("password1")
		password2 = cleaned_data.get("password2")
		if password1 and password2 and password1 != password2:
			raise forms.ValidationError({'password1': "Passwords do not match"})
		return cleaned_data

	def save(self):
		username = self.cleaned_data.get("username")
		email = self.cleaned_data.get("email")
		password = self.cleaned_data.get("password1")
		user: BaseUser = BaseUser.objects.create_user(username=username, email=email, password=password)
		user.image = 'static/pong/images/man.png'
		user.save()
		return user

class LoginForm(forms.Form):
	username = forms.CharField(label="Enter your username", max_length=20)
	password = forms.CharField(label="Choose a strong password", widget=forms.PasswordInput())

	def clean(self):
		cleaned_data = super().clean()
		username = self.cleaned_data.get("username")
		password = self.cleaned_data.get("password")
		if not BaseUser.objects.filter(username=username).exists():
			raise forms.ValidationError({"username": "This username is not registered."})
		user = authenticate(username=username, password=password)
		if user is None or not user.check_password(password):
			raise forms.ValidationError({"password" : "Password incorrect"})
		return cleaned_data

	def save(self, request):
		user = authenticate(request, username=self.cleaned_data.get("username"), password=self.cleaned_data.get("password"))
		login(request, user)

class ImageUploadForm(forms.Form):

	image = forms.ImageField(label="Load a new image")


class UpdateForm(forms.Form):
	def __init__(self, user, *args, **kwargs):
		self.user = user
		super(UpdateForm, self).__init__(*args, **kwargs)

class ChangePasswordForm(UpdateForm):

	old = forms.CharField(label="Enter old password", widget=forms.PasswordInput())
	new1 = forms.CharField(label="Enter new password", widget=forms.PasswordInput())
	new2 = forms.CharField(label="Confirm new password", widget=forms.PasswordInput())
	id = 'change-password'

	def clean_old_password(self):
		old = self.cleaned_data.get('old')
		if not self.user.check_password(old):
			raise forms.ValidationError('Incorrect password')
		return old

	def clean_new1(self):
		password1 = self.cleaned_data.get("new1")
		errors = password_policy.test(password1)
		for item in errors:
			raise forms.ValidationError(item)
		return password1

	def clean(self):
		cleaned_data = super().clean()
		new1 = cleaned_data.get('new1')
		new2 = cleaned_data.get('new2')
		if new1 and new2 and new1 != new2:
			raise forms.ValidationError("Passwords do not match")
		return cleaned_data

class ChangeUsernameForm(UpdateForm):

	new_username = forms.CharField(label='Choose a new username', max_length=20)
	id = 'change-username'

	def clean_username(self):
		new_username = self.cleaned_data.get("new_username")
		if BaseUser.objects.filter(username=new_username).exists():
			raise forms.ValidationError('This username is already taken.')
		return new_username

class ChangeEmailForm(UpdateForm):

	email = forms.CharField(label='Enter a new email address', max_length=20)
	id = 'change-email'

	def clean_username(self):
		email = self.cleaned_data.get("email")
		if BaseUser.objects.filter(email=email).exists():
			raise forms.ValidationError("Another user is currently registered with this email")
		return email

class UpdateAvatar(UpdateForm):
	id = 'avatar-form'

class CreateTournamentForm(forms.Form):

	NUM_CHOICES = [
        (4, '4 Players'),
        (8, '8 Players'),
    ]

	# def clean_name(self):
	# 	...

	# def clean(self):
	# 	...

	def save(self, user):
		...
		tournament = Tournament.objects.create(name=self.cleaned_data.get('name'), creator=user)
		partecipant = TournamentPartecipant.objects.create(tournament=tournament, user=user)
		tournament.save()
		partecipant.save()
		return tournament

	name = forms.CharField(label='Enter tournament name', max_length=10)
