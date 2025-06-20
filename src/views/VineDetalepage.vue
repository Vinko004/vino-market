<template>
  <v-container class="py-6">
    <!-- Pretraga (uvijek vidljiva) -->
    <v-row class="mb-4" align="center" justify="start" dense>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="search"
          label="Pretraži vino ili vinariju"
          prepend-inner-icon="mdi-magnify"
          clearable
          dense
          outlined
        />
      </v-col>
    </v-row>

    <!-- Gumbi za prikaz filtera i brisanje -->
    <v-row class="mb-4" align="center" justify="start" dense>
      <v-col cols="auto">
        <v-btn color="primary" @click="showFilters = !showFilters" depressed>
          {{ showFilters ? 'Sakrij filtre' : 'Prikaži filtre' }}
        </v-btn>
      </v-col>
      <v-col cols="auto" v-if="showFilters">
        <v-btn color="error" @click="resetFilters" depressed>
          Izbriši filtraciju
        </v-btn>
      </v-col>
    </v-row>

    <!-- Filter card (bez pretrage) -->
    <v-expand-transition>
      <v-card v-if="showFilters" class="mb-6 pa-4" elevation="3" max-width="900">
        <v-row dense>
          <v-col cols="12" md="4">
            <v-select
              v-model="selectedLocation"
              :items="locations"
              label="Filtriraj po lokaciji"
              clearable
              dense
              outlined
            />
          </v-col>

          <v-col cols="12" md="4">
            <v-select
              v-model="selectedRating"
              :items="ratings"
              label="Filtriraj po ocjeni"
              clearable
              dense
              outlined
            />
          </v-col>

          <v-col cols="12" md="4">
            <v-select
              v-model="selectedWinery"
              :items="wineries"
              label="Filtriraj po vinariji"
              clearable
              dense
              outlined
            />
          </v-col>
        </v-row>
      </v-card>
    </v-expand-transition>

    <!-- Lista vina -->
    <v-row>
      <template v-if="loading">
        <v-col cols="12" class="text-center">
          <v-progress-circular indeterminate color="primary" size="64" />
        </v-col>
      </template>

      <template v-else-if="pagedWines.length === 0">
        <v-col cols="12" class="text-center">
          <p class="text-subtitle-1">Nema vina koja zadovoljavaju kriterije pretrage.</p>
        </v-col>
      </template>

      <template v-else>
        <v-col
          v-for="wine in pagedWines"
          :key="wine.id"
          cols="12"
          sm="6"
          md="6"
          lg="4"
          class="d-flex"
        >
          <v-card
            max-width="500"
            class="mx-auto wine-card"
            elevation="5"
            rounded
          >
            <v-img
              v-if="wine.image"
              :src="wine.image"
              height="250"
              class="white--text align-end"
            >
              <v-sheet
                class="pa-3"
                color="rgba(0, 0, 0, 0.6)"
                style="backdrop-filter: blur(5px);"
                elevation="0"
              >
                <div class="text-h5 font-weight-bold">{{ wine.wine }}</div>
                <div class="subtitle-2">{{ wine.winery }}</div>
              </v-sheet>
            </v-img>

            <v-card-title v-else>{{ wine.wine }}</v-card-title>

            <v-card-text class="py-4">
              <v-row>
                <v-col cols="6">
                  <v-icon left color="amber darken-2">mdi-star</v-icon>
                  <strong>Ocjena:</strong> {{ wine.rating.average }}
                </v-col>
                <v-col cols="6">
                  <v-icon left color="grey darken-1">mdi-map-marker</v-icon>
                  <strong>Lokacija:</strong> {{ wine.location }}
                </v-col>
              </v-row>

              <p class="mt-3 text-body-1">
                Elegantno vino s bogatim okusom i ugodnim mirisom.
              </p>
            </v-card-text>

            <v-card-actions>
              <v-btn color="primary" text @click="openWineDetails(wine)">
                Više info
              </v-btn>
              <v-spacer />
            </v-card-actions>
          </v-card>
        </v-col>
      </template>
    </v-row>

    <!-- Pagination -->
    <v-row justify="center" class="mt-6">
      <v-pagination
        v-model="page"
        :length="pageCount"
        circle
        total-visible="7"
        color="primary"
      />
    </v-row>

    <!-- Dialog za detalje vina -->
    <v-dialog
      v-model="dialog"
      max-width="800"
      persistent
      scrollable
    >
      <v-card>
        <v-toolbar flat color="primary" dark>
          <v-toolbar-title>{{ selectedWine?.wine }}</v-toolbar-title>
          <v-spacer />
          <v-btn icon @click="dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>

        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-img
                v-if="selectedWine?.image"
                :src="selectedWine.image"
                height="350"
                contain
              />
            </v-col>

            <v-col cols="12" md="6">
              <h3>{{ selectedWine?.winery }}</h3>
              <p><strong>Lokacija:</strong> {{ selectedWine?.location }}</p>
              <p><strong>Ocjena:</strong> {{ selectedWine?.rating.average }} ({{ selectedWine?.rating.reviews }} recenzija)</p>
              <p>
                Ovdje možeš dodati detaljniji opis vina, povijest, okus, preporuke i druge informacije.
              </p>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" text @click="dialog = false">Zatvori</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
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
  image?: string
}

const wines = ref<Wine[]>([])
const search = ref('')
const selectedLocation = ref<string | null>(null)
const selectedRating = ref<string | null>(null)
const selectedWinery = ref<string | null>(null)
const page = ref(1)
const perPage = 6
const loading = ref(true)
const showFilters = ref(false)

const locations = ref<string[]>([])
const ratings = ref<string[]>([])
const wineries = ref<string[]>([])

const dialog = ref(false)
const selectedWine = ref<Wine | null>(null)

onMounted(async () => {
  try {
    const response = await api.get('/reds')
    wines.value = response.data

    const locSet = new Set(wines.value.map(w => w.location).filter(Boolean))
    locations.value = Array.from(locSet)

    const winerySet = new Set(wines.value.map(w => w.winery).filter(Boolean))
    wineries.value = Array.from(winerySet)

    const ratingSet = new Set(wines.value.map(w => w.rating.average).filter(Boolean))
    ratings.value = Array.from(ratingSet).sort((a, b) => Number(b) - Number(a))
  } catch (error) {
    console.error('Greška prilikom dohvaćanja vina:', error)
  } finally {
    loading.value = false
  }
})

const filteredWines = computed(() => {
  return wines.value.filter(w => {
    const matchesSearch =
      w.wine.toLowerCase().includes(search.value.toLowerCase()) ||
      w.winery.toLowerCase().includes(search.value.toLowerCase())

    const matchesLocation =
      !selectedLocation.value || w.location === selectedLocation.value

    const matchesRating =
      !selectedRating.value || w.rating.average === selectedRating.value

    const matchesWinery =
      !selectedWinery.value || w.winery === selectedWinery.value

    return matchesSearch && matchesLocation && matchesRating && matchesWinery
  })
})

watch([search, selectedLocation, selectedRating, selectedWinery], () => {
  page.value = 1
})

function resetFilters() {
  selectedLocation.value = null
  selectedRating.value = null
  selectedWinery.value = null
  showFilters.value = false
}

const pageCount = computed(() => Math.ceil(filteredWines.value.length / perPage))

const pagedWines = computed(() => {
  const start = (page.value - 1) * perPage
  return filteredWines.value.slice(start, start + perPage)
})

function alert(name: string) {
  window.alert(`Više o vinu: ${name}`)
}

function openWineDetails(wine: Wine) {
  selectedWine.value = wine
  dialog.value = true
}
</script>

<style scoped>
.wine-card {
  width: 500px;
  height: 400px;
  display: flex;
  flex-direction: column;
}

.wine-card > .v-card-text {
  flex-grow: 1;
  overflow: hidden;
}
</style>
