from django.urls import path
from .views import (
    ApplyView, MyApplicationsView, WithdrawApplicationView,
    CheckApplicationView, RecruiterApplicantsView, UpdateApplicationStatusView,
)

urlpatterns = [
    path('', ApplyView.as_view(), name='apply'),
    path('mine/', MyApplicationsView.as_view(), name='my-applications'),
    path('check/', CheckApplicationView.as_view(), name='check-application'),
    path('<int:pk>/withdraw/', WithdrawApplicationView.as_view(), name='withdraw-application'),
    path('recruiter/', RecruiterApplicantsView.as_view(), name='recruiter-applicants'),
    path('<int:pk>/status/', UpdateApplicationStatusView.as_view(), name='update-status'),
]
