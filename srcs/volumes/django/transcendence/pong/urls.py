from django.urls import path

from . import views

app_name= 'pong'

# urlpatterns = [
# 	path('', views.base, name='base'),
# 	path('player/<int:player_id>/', views.player, name='player'),
# 	path('registration/', views.registration, name='registration'),
# 	path('player_list/', views.player_list, name='player_list'),
# 	path('registration_form/', views.registration_form, name='registration_form'),
# 	path('model_form/', views.model_form, name='model_form'),
# 	path('message_form/', views.message_form, name='message_form'),
# 	path('send_mail/', views.send_mail, name='send_mail')
# ]

urlpatterns = [
	path('', views.IndexView.as_view(), name='index'),
	path('login/', views.LoginCustomView.as_view(), name='login'),
	path('logout/', views.LogoutView.as_view(), name='logout'),
	path('registration/', views.RegistrationFormView.as_view(), name='registration'),
	path('profile/<str:username>', views.ProfileView.as_view(), name='profile'),
    path('username/', views.username, name='username'),
]
