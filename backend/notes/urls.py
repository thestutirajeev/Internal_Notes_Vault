from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NoteViewSet, UserViewSet

router = DefaultRouter()  # Define router at module level
router.register(r'notes', NoteViewSet, basename='note')  # Register NoteViewSet with the router
router.register(r'users', UserViewSet, basename='user')  # Register UserViewSet with the router

urlpatterns = [
    path('', include(router.urls)),
]