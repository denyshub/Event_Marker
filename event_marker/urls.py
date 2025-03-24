from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from events import views
from events.views import CategoryView
from users.views import UserRegistrationView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("events.urls")),
    path("api/", include("subscriptions.urls")),
    path("api/categories/", CategoryView.as_view(), name="category-list"),
    path("register/", UserRegistrationView.as_view(), name="register"),
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
