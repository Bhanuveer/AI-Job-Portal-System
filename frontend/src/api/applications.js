import { axiosInstance } from './axiosInstance'

export const applyForJob = (formData) =>
  axiosInstance.post('/applications/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

export const getMyApplications = () => axiosInstance.get('/applications/mine/')
export const checkApplication = (jobId) => axiosInstance.get(`/applications/check/?job_id=${jobId}`)
export const withdrawApplication = (id) => axiosInstance.delete(`/applications/${id}/withdraw/`)
export const getRecruiterApplicants = (params) => axiosInstance.get('/applications/recruiter/', { params })
export const updateApplicationStatus = (id, status) => axiosInstance.patch(`/applications/${id}/status/`, { status })
