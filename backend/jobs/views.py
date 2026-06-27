from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.db.models import Q
from .models import Job
from .serializers import JobSerializer, JobWriteSerializer
from .permissions import IsRecruiter, IsJobOwnerOrReadOnly


class JobViewSet(viewsets.ModelViewSet):
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'company', 'location', 'skills']
    ordering_fields = ['created_at', 'salary_min']

    def get_queryset(self):
        qs = Job.objects.select_related('recruiter')

        # Public list only shows active jobs
        if self.action == 'list':
            qs = qs.filter(is_active=True)

        # Filter by job_type or experience_level if provided
        job_type = self.request.query_params.get('job_type')
        experience = self.request.query_params.get('experience_level')
        location = self.request.query_params.get('location')

        if job_type:
            qs = qs.filter(job_type=job_type)
        if experience:
            qs = qs.filter(experience_level=experience)
        if location:
            qs = qs.filter(location__icontains=location)

        return qs

    def get_serializer_class(self):
        if self.request.method in ('POST', 'PUT', 'PATCH'):
            return JobWriteSerializer
        return JobSerializer

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [AllowAny()]
        if self.action == 'create':
            return [IsRecruiter()]
        if self.action in ('update', 'partial_update', 'destroy'):
            return [IsAuthenticated(), IsJobOwnerOrReadOnly()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(recruiter=self.request.user)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            paginated = self.get_paginated_response(serializer.data)
            return Response({'success': True, 'message': 'Jobs fetched.', 'data': paginated.data})
        serializer = self.get_serializer(queryset, many=True)
        return Response({'success': True, 'message': 'Jobs fetched.', 'data': serializer.data})

    def retrieve(self, request, *args, **kwargs):
        job = self.get_object()
        return Response({'success': True, 'message': 'Job fetched.', 'data': JobSerializer(job).data})

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response({'success': False, 'message': 'Validation failed.', 'errors': serializer.errors}, status=400)
        job = serializer.save(recruiter=request.user)
        return Response({'success': True, 'message': 'Job posted successfully.', 'data': JobSerializer(job).data}, status=201)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        job = self.get_object()
        serializer = self.get_serializer(job, data=request.data, partial=partial)
        if not serializer.is_valid():
            return Response({'success': False, 'message': 'Validation failed.', 'errors': serializer.errors}, status=400)
        job = serializer.save()
        return Response({'success': True, 'message': 'Job updated.', 'data': JobSerializer(job).data})

    def destroy(self, request, *args, **kwargs):
        job = self.get_object()
        job.delete()
        return Response({'success': True, 'message': 'Job deleted.'})

    @action(detail=False, methods=['get'], permission_classes=[IsRecruiter], url_path='mine')
    def mine(self, request):
        jobs = Job.objects.filter(recruiter=request.user).select_related('recruiter')
        page = self.paginate_queryset(jobs)
        if page is not None:
            data = JobSerializer(page, many=True).data
            paginated = self.get_paginated_response(data)
            return Response({'success': True, 'message': 'Your jobs.', 'data': paginated.data})
        return Response({'success': True, 'message': 'Your jobs.', 'data': JobSerializer(jobs, many=True).data})

    @action(detail=False, methods=['get'], permission_classes=[IsRecruiter], url_path='dashboard')
    def dashboard(self, request):
        recruiter = request.user
        total_jobs = Job.objects.filter(recruiter=recruiter).count()
        active_jobs = Job.objects.filter(recruiter=recruiter, is_active=True).count()
        recent_jobs = Job.objects.filter(recruiter=recruiter).select_related('recruiter')[:5]

        # Application stats will be populated once the applications app is built
        from applications.models import Application
        total_applications = Application.objects.filter(job__recruiter=recruiter).count()
        recent_applications = []
        try:
            from applications.serializers import ApplicationSerializer
            apps = Application.objects.filter(
                job__recruiter=recruiter
            ).select_related('job', 'candidate').order_by('-applied_at')[:5]
            recent_applications = ApplicationSerializer(apps, many=True).data
        except Exception:
            pass

        return Response({
            'success': True,
            'message': 'Dashboard data fetched.',
            'data': {
                'stats': {
                    'total_jobs': total_jobs,
                    'active_jobs': active_jobs,
                    'total_applications': total_applications,
                },
                'recent_jobs': JobSerializer(recent_jobs, many=True).data,
                'recent_applications': recent_applications,
            }
        })
