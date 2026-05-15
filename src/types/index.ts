export interface User {
  id: number
  matricule: string
  nom: string
  prenom: string
  nom_complet: string
  email: string
  telephone: string | null
  fonction: string | null
  is_active: boolean
  site?: Site | null
  service?: Service | null
  roles?: string[]
  permissions?: string[]
}

export interface Site {
  id: number
  code: string
  libelle: string
  type: 'siege' | 'agence' | 'depot' | 'site_distant'
  adresse: string | null
  ville: string | null
  province: string | null
  latitude: string | null
  longitude: string | null
  is_active: boolean
  localisations_count?: number
}

export interface Service {
  id: number
  code: string
  libelle: string
  parent_id: number | null
  site_principal_id: number | null
  is_active: boolean
}

export interface Localisation {
  id: number
  site_id: number
  parent_id: number | null
  code: string
  libelle: string
  type: string
  niveau: number
  path: string | null
  enfants?: Localisation[]
}

export interface CategorieImmobilisation {
  id: number
  code: string
  libelle: string
  parent_id: number | null
  classe_comptable: string | null
  duree_amortissement_defaut: number | null
  methode_amortissement_defaut: string
  is_active: boolean
}

export interface Fournisseur {
  id: number
  raison_sociale: string
  niu: string | null
  contact: string | null
  ville: string | null
  telephone: string | null
  email: string | null
  is_active: boolean
}

export interface Immobilisation {
  id: number
  code_inventaire: string
  qr_payload: string | null
  libelle: string
  description: string | null
  categorie_id: number
  categorie?: CategorieImmobilisation
  site_id: number
  site?: Site
  localisation_id: number | null
  localisation?: Localisation
  service_id: number | null
  service?: Service
  date_acquisition: string | null
  mode_acquisition: string
  valeur_acquisition: string
  devise: string
  duree_amortissement_mois: number | null
  methode_amortissement: string
  date_mise_en_service: string | null
  etat_physique: string
  statut: string
  photo_principale_path: string | null
  photos?: Array<{ id: number; path: string; legende: string | null }>
  documents?: Array<{ id: number; type: string; libelle: string; path: string }>
}

export interface Campagne {
  id: number
  code: string
  libelle: string
  description: string | null
  type: string
  date_debut_prevue: string
  date_fin_prevue: string
  date_debut_reelle: string | null
  date_fin_reelle: string | null
  perimetre: { sites?: number[]; categories?: number[]; localisations?: number[] }
  statut: 'preparation' | 'en_cours' | 'cloturee' | 'annulee'
  fiches_count?: number
}

export interface FicheInventaire {
  id: number
  campagne_id: number
  immobilisation_id: number | null
  code_attendu: string | null
  statut: string
  etat_constate: string | null
  commentaire_inventoriste: string | null
  inventorie_at: string | null
  version: number
  immobilisation?: Immobilisation
}

export interface KpiData {
  biens: { total: number; actifs: number; sortis: number }
  valorisation: { valeur_brute_acquisition: number; vnc_totale_exercice_courant: number; devise: string }
  inventaire: { campagnes_en_cours: number }
}

export interface Pagination<T> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}
