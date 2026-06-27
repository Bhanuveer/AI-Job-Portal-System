from rest_framework import serializers
from .models import Application
from jobs.serializers import JobSerializer
from accounts.serializers import UserSerializer


class ApplicationSerializer(serializers.ModelSerializer):
    """Used by candidates to view their own applications."""
    job = JobSerializer(read_only=True)

    class Meta:
        model = Application
        fields = ['id', 'job', 'cover_letter', 'resume', 'status', 'applied_at', 'updated_at']
        read_only_fields = ['id', 'status', 'applied_at', 'updated_at']


class ApplySerializer(serializers.ModelSerializer):
    """Used to submit a new application."""
    class Meta:
        model = Application
        fields = ['job', 'resume', 'cover_letter']

    def validate_resume(self, value):
        if not value.name.lower().endswith('.pdf'):
            raise serializers.ValidationError('Only PDF files are allowed.')
        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError('Resume must be under 5MB.')
        return value

    def validate(self, data):
        candidate = self.context['request'].user
        job = data.get('job')
        if Application.objects.filter(job=job, candidate=candidate).exists():
            raise serializers.ValidationError('You have already applied for this job.')
        if not job.is_active:
            raise serializers.ValidationError('This job is no longer accepting applications.')
        return data


class ApplicantSerializer(serializers.ModelSerializer):
    """Used by recruiters to view applications for their jobs."""
    candidate = UserSerializer(read_only=True)
    job_title = serializers.CharField(source='job.title', read_only=True)
    job_id = serializers.IntegerField(source='job.id', read_only=True)

    class Meta:
        model = Application
        fields = [
            'id', 'candidate', 'job_id', 'job_title',
            'cover_letter', 'resume', 'status', 'applied_at', 'updated_at',
        ]
        read_only_fields = ['id', 'candidate', 'job_id', 'job_title', 'applied_at']


class UpdateStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ['status']

    def validate_status(self, value):
        valid = [c[0] for c in Application.STATUS_CHOICES]
        if value not in valid:
            raise serializers.ValidationError(f'Status must be one of: {", ".join(valid)}')
        return value
