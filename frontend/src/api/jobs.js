import { axiosInstance } from './axiosInstance'

export const getJobs = (params) => axiosInstance.get('/jobs/', { params })
export const getJob = (id) => axiosInstance.get(`/jobs/${id}/`)
export const createJob = (data) => axiosInstance.post('/jobs/', data)
export const updateJob = (id, data) => axiosInstance.patch(`/jobs/${id}/`, data)
export const deleteJob = (id) => axiosInstance.delete(`/jobs/${id}/`)
export const getMyJobs = (params) => axiosInstance.get('/jobs/mine/', { params })
export const getDashboard = () => axiosInstance.get('/jobs/dashboard/')
