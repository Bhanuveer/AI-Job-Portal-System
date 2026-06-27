from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Application
from .serializers import ApplicationSerializer, ApplySerializer, ApplicantSerializer, UpdateStatusSerializer


class ApplyView(APIView):
    """Candidate submits an application."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != 'candidate':
            return Response(
                {'success': False, 'message': 'Only candidates can apply for jobs.'},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer = ApplySerializer(data=request.data, context={'request': request})
        if not serializer.is_valid():
            return Response(
                {'success': False, 'message': 'Application failed.', 'errors': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        application = serializer.save(candidate=request.user)
        return Response({
            'success': True,
            'message': 'Application submitted successfully.',
            'data': ApplicationSerializer(application, context={'request': request}).data,
        }, status=status.HTTP_201_CREATED)


class MyApplicationsView(APIView):
    """Candidate views their own applications."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        applications = Application.objects.filter(
            candidate=request.user
        ).select_related('job', 'job__recruiter').order_by('-applied_at')
        return Response({
            'success': True,
            'message': 'Applications fetched.',
            'data': ApplicationSerializer(applications, many=True, context={'request': request}).data,
        })


class WithdrawApplicationView(APIView):
    """Candidate withdraws their application."""
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            application = Application.objects.get(pk=pk, candidate=request.user)
        except Application.DoesNotExist:
            return Response(
                {'success': False, 'message': 'Application not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        if application.status != 'pending':
            return Response(
                {'success': False, 'message': 'You can only withdraw pending applications.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        application.delete()
        return Response({'success': True, 'message': 'Application withdrawn.'})


class CheckApplicationView(APIView):
    """Candidate checks if they already applied for a specific job."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        job_id = request.query_params.get('job_id')
        if not job_id:
            return Response({'success': False, 'message': 'job_id is required.'}, status=400)
        application = Application.objects.filter(
            candidate=request.user, job_id=job_id
        ).first()
        return Response({
            'success': True,
            'data': {
                'has_applied': application is not None,
                'application': ApplicationSerializer(application, context={'request': request}).data if application else None,
            }
        })


class RecruiterApplicantsView(APIView):
    """Recruiter views all applications for their jobs."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'recruiter':
            return Response({'success': False, 'message': 'Access denied.'}, status=403)

        qs = Application.objects.filter(
            job__recruiter=request.user
        ).select_related('job', 'candidate').order_by('-applied_at')

        job_id = request.query_params.get('job_id')
        status_filter = request.query_params.get('status')
        if job_id:
            qs = qs.filter(job_id=job_id)
        if status_filter:
            qs = qs.filter(status=status_filter)

        return Response({
            'success': True,
            'message': 'Applicants fetched.',
            'data': ApplicantSerializer(qs, many=True, context={'request': request}).data,
        })


class UpdateApplicationStatusView(APIView):
    """Recruiter updates the status of an application."""
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        if request.user.role != 'recruiter':
            return Response({'success': False, 'message': 'Access denied.'}, status=403)
        try:
            application = Application.objects.select_related('job').get(pk=pk, job__recruiter=request.user)
        except Application.DoesNotExist:
            return Response({'success': False, 'message': 'Application not found.'}, status=404)

        serializer = UpdateStatusSerializer(application, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response({'success': False, 'errors': serializer.errors}, status=400)
        serializer.save()
        return Response({
            'success': True,
            'message': 'Status updated.',
            'data': ApplicantSerializer(application, context={'request': request}).data,
        })
