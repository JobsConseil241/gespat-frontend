<script setup lang="ts">
const props = defineProps<{ value: string; type?: 'statut' | 'sortie' | 'mouvement' | 'matching' | 'fiche' }>()

const variants: Record<string, string> = {
  // Immobilisations statuts
  actif: 'badge-success', en_maintenance: 'badge-warning', en_transfert: 'badge-info',
  reforme: 'badge-gray', cede: 'badge-gray', perdu: 'badge-danger',
  vole: 'badge-danger', detruit: 'badge-danger',
  // Mouvements
  propose: 'badge-info', valide: 'badge-success', execute: 'badge-success',
  refuse: 'badge-danger', annule: 'badge-gray',
  // Sorties
  proposee: 'badge-info', validee: 'badge-success', executee: 'badge-success', refusee: 'badge-danger',
  // Campagne
  preparation: 'badge-info', en_cours: 'badge-warning', cloturee: 'badge-gray', annulee: 'badge-danger',
  // Fiche
  a_inventorier: 'badge-gray', vu_conforme: 'badge-success',
  vu_ecart: 'badge-warning', non_trouve: 'badge-danger',
  decouverte: 'badge-info', litige: 'badge-danger',
  // Matching compta
  non_traite: 'badge-gray', matche_auto: 'badge-success',
  matche_manuel: 'badge-info', multiple: 'badge-warning',
  // Maintenance
  planifiee: 'badge-info', terminee: 'badge-success',
  // États physiques
  neuf: 'badge-success', bon: 'badge-info',
  moyen: 'badge-warning', mauvais: 'badge-danger', hors_service: 'badge-danger',
  // Import statut
  en_attente: 'badge-info', traite: 'badge-success', echec: 'badge-danger',
}
</script>

<template>
  <span :class="variants[props.value] || 'badge-gray'">{{ props.value }}</span>
</template>
