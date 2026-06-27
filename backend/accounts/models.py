from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    CANDIDATE = 'candidate'
    RECRUITER = 'recruiter'
    ROLE_CHOICES = [(CANDIDATE, 'Candidate'), (RECRUITER, 'Recruiter')]

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default=CANDIDATE)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email
