from django.urls import path
from . import views
from . import portfolio_views

print("Loading accounts URLs...")
print(f"Available views: {dir(views)}")

urlpatterns = [
    path('register/developer/', views.register_developer, name='register_developer'),
    path('register/company/', views.register_company, name='register_company'),
    path('login/', views.login, name='login'),
    path('profile/', views.get_user_profile, name='get_user_profile'),
    path('projects/', views.get_projects, name='get_projects'),
    path('company/projects/', views.get_company_projects, name='get_company_projects'),
    path('company/projects/create/', views.create_project, name='create_project'),
    path('company/projects/<int:project_id>/edit/', views.edit_project, name='edit_project'),
    path('company/projects/<int:project_id>/applications/', views.get_project_applications, name='get_project_applications'),
    path('projects/<int:project_id>/apply/', views.apply_to_project, name='apply_to_project'),
    path('developers/', views.get_developers, name='get_developers'),
    
    # Portfolio endpoints
    path('portfolio/<str:developer_id>/', portfolio_views.get_developer_portfolio, name='get_developer_portfolio'),
    path('portfolio/create/', portfolio_views.create_portfolio_project, name='create_portfolio_project'),
    path('portfolio/<int:project_id>/update/', portfolio_views.update_portfolio_project, name='update_portfolio_project'),
    path('portfolio/<int:project_id>/delete/', portfolio_views.delete_portfolio_project, name='delete_portfolio_project'),
    path('portfolio/<int:project_id>/views/', portfolio_views.increment_portfolio_views, name='increment_portfolio_views'),
    
    path('test/', views.test_endpoint, name='test_endpoint'),
]

print(f"URL patterns loaded: {[pattern.pattern._route for pattern in urlpatterns]}")