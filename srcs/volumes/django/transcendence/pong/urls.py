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
	path('', views.index, name='index'),
	path('registration/', views.registration, name='registration'),
]