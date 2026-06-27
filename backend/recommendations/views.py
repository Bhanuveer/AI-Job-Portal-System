from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from jobs.models import Job
from jobs.serializers import JobSerializer
from applications.models import Application
from .engine import recommend_jobs


class RecommendedJobsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'candidate':
            return Response(
                {'success': False, 'message': 'Only candidates can view recommendations.'},
                status=403
            )

        candidate_skills = request.user.skills
        if not candidate_skills or not candidate_skills.strip():
            return Response({
                'success': True,
                'message': 'no_skills',
                'data': [],
            })

        # Exclude jobs the candidate has already applied to
        applied_job_ids = Application.objects.filter(
            candidate=request.user
        ).values_list('job_id', flat=True)

        active_jobs = list(
            Job.objects.filter(is_active=True)
            .exclude(id__in=applied_job_ids)
            .select_related('recruiter')
        )

        recommendations = recommend_jobs(candidate_skills, active_jobs)

        data = []
        for rec in recommendations:
            job_data = JobSerializer(rec['job']).data
            job_data['similarity_score'] = rec['score']
            # Convert to percentage for display
            job_data['match_percent'] = round(rec['score'] * 100)
            data.append(job_data)

        return Response({
            'success': True,
            'message': f'{len(data)} jobs recommended based on your skills.',
            'data': data,
        })
