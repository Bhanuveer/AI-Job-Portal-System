from rest_framework import serializers
from .models import Job


class JobSerializer(serializers.ModelSerializer):
    recruiter_name = serializers.SerializerMethodField()
    application_count = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = [
            'id', 'title', 'company', 'location', 'job_type', 'experience_level',
            'description', 'requirements', 'skills',
            'salary_min', 'salary_max', 'is_active',
            'recruiter', 'recruiter_name', 'application_count',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['recruiter', 'created_at', 'updated_at']

    def get_recruiter_name(self, obj):
        return obj.recruiter.get_full_name() or obj.recruiter.email

    def get_application_count(self, obj):
        return obj.applications.count()


class JobWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = [
            'title', 'company', 'location', 'job_type', 'experience_level',
            'description', 'requirements', 'skills',
            'salary_min', 'salary_max', 'is_active',
        ]

    def validate_salary_min(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError('Salary cannot be negative.')
        return value

    def validate(self, data):
        salary_min = data.get('salary_min')
        salary_max = data.get('salary_max')
        if salary_min and salary_max and salary_max < salary_min:
            raise serializers.ValidationError({'salary_max': 'Max salary must be greater than min salary.'})
        return data
