
from password_strength import PasswordPolicy

from django import forms
from .models import BaseUser

password_policy = PasswordPolicy.from_names(
	length=8,
	numbers=1,
	special=1,
)

class RegistrationForm(forms.Form):
	username = forms.CharField(label="Enter your username", max_length=10)
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
			raise forms.ValidationError("Passwords do not match")
		return cleaned_data

	def save(self):
		username = self.cleaned_data.get("username")
		email = self.cleaned_data.get("email")	
		password = self.cleaned_data.get("password1")
		user = BaseUser.objects.create_user(username=username, email=email, password=password)
		return user

class LoginForm(forms.Form):
	username = forms.CharField(label="Enter your username", max_length=10)
	password = forms.CharField(label="Choose a strong password", widget=forms.PasswordInput())

class ChangePasswordForm(forms.Form):
	old_password = forms.CharField(label="Enter old password", widget=forms.PasswordInput())
	new_password1 = forms.CharField(label="Enter new password", widget=forms.PasswordInput())
	new_password2 = forms.CharField(label="Confirm new password", widget=forms.PasswordInput())

# class UpdateData(forms.Form):