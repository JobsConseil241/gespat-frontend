import api from './client'
import type {
  Campagne, CategorieImmobilisation, Fournisseur, Immobilisation, KpiData,
  Pagination, Service, Site, User,
} from '@/types'

// ====== Auth ======
export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ token: string; user: User }>('/auth/login', { email, password, device_name: 'web' }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get<{ data: User }>('/auth/me'),
}

// ====== Référentiel ======
export const sitesApi = {
  list: (params?: any) => api.get<Pagination<Site>>('/sites', { params }),
  get: (id: number) => api.get<{ data: Site }>(`/sites/${id}`),
  create: (data: Partial<Site>) => api.post<{ data: Site }>('/sites', data),
  update: (id: number, data: Partial<Site>) => api.put<{ data: Site }>(`/sites/${id}`, data),
  delete: (id: number) => api.delete(`/sites/${id}`),
  localisations: (id: number) => api.get(`/sites/${id}/localisations`),
}

export const servicesApi = {
  list: (params?: any) => api.get<Pagination<Service>>('/services', { params }),
}

export const categoriesApi = {
  list: (params?: any) => api.get<Pagination<CategorieImmobilisation>>('/categories', { params }),
  create: (data: any) => api.post('/categories', data),
}

export const fournisseursApi = {
  list: (params?: any) => api.get<Pagination<Fournisseur>>('/fournisseurs', { params }),
}

// ====== Immobilisations ======
export const immosApi = {
  list: (params?: any) => api.get<Pagination<Immobilisation>>('/immobilisations', { params }),
  get: (id: number) => api.get<{ data: Immobilisation }>(`/immobilisations/${id}`),
  byCode: (code: string) => api.get<{ data: Immobilisation }>(`/immobilisations/by-code/${code}`),
  create: (data: Partial<Immobilisation>) => api.post<{ data: Immobilisation }>('/immobilisations', data),
  update: (id: number, data: Partial<Immobilisation>) => api.put<{ data: Immobilisation }>(`/immobilisations/${id}`, data),
  delete: (id: number) => api.delete(`/immobilisations/${id}`),
}

// ====== Codification ======
export const codificationApi = {
  plans: () => api.get('/codification/plans'),
  previsualiser: (categorie_id: number, site_id: number) =>
    api.post<{ data: { code_inventaire: string } }>('/codification/previsualiser', { categorie_id, site_id }),
}

// ====== Campagnes ======
export const campagnesApi = {
  list: (params?: any) => api.get<Pagination<Campagne>>('/campagnes', { params }),
  get: (id: number) => api.get<{ data: Campagne }>(`/campagnes/${id}`),
  create: (data: Partial<Campagne>) => api.post('/campagnes', data),
  generateFiches: (id: number) => api.post(`/campagnes/${id}/generer-fiches`),
  avancement: (id: number) => api.get(`/campagnes/${id}/avancement`),
  fiches: (id: number, params?: any) => api.get(`/campagnes/${id}/fiches`, { params }),
  cloturer: (id: number) => api.post(`/campagnes/${id}/cloturer`),
}

// ====== Étiquettes ======
export const etiquettesApi = {
  lots: () => api.get('/etiquettes/lots'),
  createLot: (data: any) => api.post('/etiquettes/lots', data),
  pdfUrl: (lotId: number) => `${api.defaults.baseURL}/etiquettes/lots/${lotId}/pdf`,
}

// ====== Dashboard ======
export const dashboardApi = {
  kpi: () => api.get<{ data: KpiData }>('/dashboard/kpi'),
  parCategorie: () => api.get('/dashboard/patrimoine-par-categorie'),
  parSite: () => api.get('/dashboard/patrimoine-par-site'),
  parStatut: () => api.get('/dashboard/patrimoine-par-statut'),
}

// ====== Amortissements ======
export const amortissementsApi = {
  simuler: (immobilisation_id: number, exercice_max?: number) =>
    api.post('/amortissements/simuler', { immobilisation_id, exercice_max }),
  showByImmo: (id: number) => api.get(`/amortissements/immobilisation/${id}`),
}

// ====== Mouvements & Sorties ======
export const mouvementsApi = {
  list: (params?: any) => api.get('/mouvements', { params }),
  create: (data: any) => api.post('/mouvements', data),
  valider: (id: number) => api.post(`/mouvements/${id}/valider`),
  refuser: (id: number) => api.post(`/mouvements/${id}/refuser`),
}

export const sortiesApi = {
  list: (params?: any) => api.get('/sorties', { params }),
  create: (data: any) => api.post('/sorties', data),
  valider: (id: number) => api.post(`/sorties/${id}/valider`),
}

// ====== Reports ======
export const reportsApi = {
  excelUrl: (params?: Record<string, string>) =>
    `${api.defaults.baseURL}/reports/immobilisations/excel${params ? '?' + new URLSearchParams(params).toString() : ''}`,
  pdfUrl: (params?: Record<string, string>) =>
    `${api.defaults.baseURL}/reports/immobilisations/pdf${params ? '?' + new URLSearchParams(params).toString() : ''}`,
}
