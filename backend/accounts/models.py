from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    CANDIDATE = 'candidate'
    RECRUITER = 'recruiter'
    ROLE_CHOICES = [(CANDIDATE, 'Candidate'), (RECRUITER, 'Recruiter')]

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default=CANDIDATE)

    # Shared profile fields
    bio = models.TextField(blank=True)
    location = models.CharField(max_length=200, blank=True)

    # Candidate-specific
    skills = models.CharField(max_length=500, blank=True)  # comma-separated, used by ML engine

    # Recruiter-specific
    company_name = models.CharField(max_length=200, blank=True)
    company_website = models.URLField(blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email
