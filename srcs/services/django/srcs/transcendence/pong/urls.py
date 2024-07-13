from django.urls import path, include

from . import views

from django.conf import settings
from django.conf.urls.static import static

app_name= 'pong'

#

urlpatterns = [
	path('', views.IndexView.as_view(), name='index'),
	path('login42/', views.login42, name='login42'),
	path('callback/', views.CallbackView.as_view(), name='callback'),
    path('game/', views.game, name='game'),
    path('chat/<str:room_name>/', views.room, name='room'),
    path('chat/', views.chat_index, name='chat'),
	path('login/', views.LoginCustomView.as_view(), name='login'),
	path('logout/', views.LogoutView.as_view(), name='logout'),
	path('registration/', views.RegistrationFormView.as_view(), name='registration'),
	path('profile/<str:username>', views.ProfileView.as_view(), name='profile'),
    path('profile/settings/<str:setting>', views.SettingsView.as_view(), name='settings'),
    path('profile/', views.personal_profile),
	path('username/', views.username, name='username'),
	path('authenticated/', views.authenticated, name='authenticated'),
    path('send_friend/<str:username>/', views.sendFriendRequest, name='send_friend'),
    path('image_upload/', views.ImageUpload.as_view(), name='image_upload'),
	path('item_show/', views.item_show, name='item_show'),
	path('home/', views.home, name='home'),
	path('account/', views.account, name='account'),
    path('online_users/', views.online_users, name='online_users'),
    path('navbar/', views.navbar, name='navbar'),
    path('script_game/', views.scripts_view, name='scripts_view'),
    path('play/', views.play, name='play'),
    path('tournament_create/', views.tournament_create, name='tournament_create'),
    path('tournaments_list/', views.tournaments_list, name='tournaments_list'),
    path('tournament_join/<str:name>/', views.tournament_join, name='tournament_join'),
    path('tournament_info/<str:name>/', views.tournament_info, name='tournament_info'),
    path('notification/<str:username>/', views.notification, name='notification'),
]

# To serve media files in development, because they are not served by default in development

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
