<template>
  <v-container>
    <h1>Vina (Crvena)</h1>
    <v-text-field v-model="search" label="Pretraži vina" append-icon="mdi-magnify" class="mb-4" />

    <v-row>
      <v-col
        v-for="wine in filteredWines"
        :key="wine.id"
        cols="12"
        sm="6"
        md="4"
      >
        <v-card>
          <v-card-title>{{ wine.wine }}</v-card-title>
          <v-card-subtitle>{{ wine.winery }}</v-card-subtitle>
          <v-card-text>
            <p>Ocjena: {{ wine.rating.average }} ({{ wine.rating.reviews }})</p>
            <p>Lokacija: {{ wine.location }}</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import api from '@/services/api'

interface Wine {
  id: number
  wine: string
  winery: string
  rating: {
    average: string
    reviews: string
  }
  location: string
}

const wines = ref<Wine[]>([])
const search = ref('')

onMounted(async () => {
  const response = await api.get('/reds')
  wines.value = response.data
})

const filteredWines = computed(() => {
  return wines.value.filter(w =>
    w.wine.toLowerCase().includes(search.value.toLowerCase()) ||
    w.winery.toLowerCase().includes(search.value.toLowerCase())
  )
})
</script>
