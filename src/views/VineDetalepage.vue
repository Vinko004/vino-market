<template>
  <v-container class="py-6">
    <!-- Gumb Dodaj vino -->
    <v-row justify="end" class="mb-4">
      <v-col cols="auto">
        <v-btn color="success" @click="openAddWineDialog" dark>
          Dodaj vino
        </v-btn>
      </v-col>
    </v-row>

    <!-- Pretraga -->
    <v-row class="mb-4" align="center" justify="start" dense>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="search"
          label="Pretraži vino"
          prepend-inner-icon="mdi-magnify"
          clearable
          dense
          outlined
        />
      </v-col>
    </v-row>

    <!-- Filteri -->
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

    <!-- Filter polja -->
    <v-expand-transition>
      <v-card v-if="showFilters" class="mb-6 pa-4" elevation="3" max-width="900">
        <v-row dense>
          <v-col cols="12" md="4">
            <v-select
              v-model="selectedCountry"
              :items="countries"
              label="Filtriraj po zemlji porijekla"
              clearable
              dense
              outlined
            />
          </v-col>

          <v-col cols="12" md="4">
            <v-select
              v-model="selectedCategory"
              :items="categories"
              label="Filtriraj po kategoriji"
              clearable
              dense
              outlined
            />
          </v-col>

          <v-col cols="12" md="4">
            <v-select
              v-model="sortByPrice"
              :items="[
                { text: 'Najniža cijena', value: 'lowest' },
                { text: 'Najviša cijena', value: 'highest' }
              ]"
              label="Sortiraj po cijeni"
              clearable
              dense
              outlined
              item-title="text"
              item-value="value"
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
          <v-card max-width="500" class="mx-auto wine-card" elevation="5" rounded>
            <v-card-title>{{ wine.naziv }}</v-card-title>

            <v-card-text class="py-4">
              <p><strong>Opis:</strong> {{ wine.opis }}</p>
              <p><strong>Cijena:</strong> {{ parseFloat(wine.cijena).toFixed(2) }} €</p>
              <p><strong>Zemlja porijekla:</strong> {{ wine.zemlja_porijekla }}</p>
              <p><strong>Kategorija:</strong> {{ getCategoryName(wine.kategorija_id) }}</p>
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

    <!-- Paginacija -->
    <v-row justify="center" class="mt-6">
      <v-pagination
        v-model="page"
        :length="pageCount"
        circle
        total-visible="7"
        color="primary"
      />
    </v-row>

    <!-- Dialog detalji -->
    <v-dialog v-model="dialog" max-width="800" persistent scrollable>
      <v-card>
        <v-toolbar flat color="primary" dark>
          <v-toolbar-title>{{ selectedWine?.naziv }}</v-toolbar-title>
          <v-spacer />
          <v-btn icon @click="dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>

        <v-card-text>
          <p><strong>Opis:</strong> {{ selectedWine?.opis }}</p>
          <p><strong>Cijena:</strong> {{ parseFloat(selectedWine?.cijena || '0').toFixed(2) }} €</p>
          <p><strong>Zemlja porijekla:</strong> {{ selectedWine?.zemlja_porijekla }}</p>
          <p><strong>Kategorija:</strong> {{ getCategoryName(selectedWine?.kategorija_id) }}</p>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" text @click="dialog = false">Zatvori</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog za dodavanje novog vina -->
    <v-dialog v-model="addDialog" max-width="600px" persistent>
      <v-card>
        <v-toolbar flat color="success" dark>
          <v-toolbar-title>Dodaj novo vino</v-toolbar-title>
          <v-spacer />
          <v-btn icon @click="addDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>

        <v-card-text>
          <v-form ref="addWineForm" v-model="valid" lazy-validation>
            <v-text-field
              v-model="newWine.naziv"
              label="Naziv"
              :rules="[v => !!v || 'Naziv je obavezan']"
              required
            />
            <v-textarea
              v-model="newWine.opis"
              label="Opis"
              :rules="[v => !!v || 'Opis je obavezan']"
              required
              rows="3"
            />
            <v-text-field
              v-model="newWine.cijena"
              label="Cijena (€)"
              type="number"
              min="0"
              :rules="[v => !!v && parseFloat(v) >= 0 || 'Unesite ispravnu cijenu']"
              required
            />
            <v-text-field
              v-model="newWine.zemlja_porijekla"
              label="Zemlja porijekla"
              :rules="[v => !!v || 'Zemlja je obavezna']"
              required
            />
<v-select
  v-model="newWine.kategorija_id"
  :items="categories"
  label="Kategorija"
  clearable
  dense
  outlined
  item-title="text"
  item-value="value"
/>

          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn color="success" :disabled="!valid" @click="submitNewWine">Spremi</v-btn>
          <v-btn text @click="addDialog = false">Odustani</v-btn>
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
  naziv: string
  opis: string
  cijena: string
  kategorija_id: number
  zemlja_porijekla: string
}

const categoryMap: Record<number, string> = {
  1: 'Crveno',
  2: 'Bijelo',
  3: 'Rose',
  4: 'Pjenušavo',
}

function getCategoryName(id: number | undefined): string {
  if (!id) return 'Nepoznata kategorija'
  return categoryMap[id] || 'Nepoznata kategorija'
}

const wines = ref<Wine[]>([])
const search = ref('')
const selectedCountry = ref<string | null>(null)
const selectedCategory = ref<string | null>(null)
const sortByPrice = ref<string | null>(null)
const page = ref(1)
const perPage = 6
const loading = ref(true)
const showFilters = ref(false)

const countries = ref<string[]>([])
const categories = ref<string[]>(Object.values(categoryMap))

const dialog = ref(false)
const selectedWine = ref<Wine | null>(null)

// Dodavanje novog vina
const addDialog = ref(false)
const valid = ref(false)
const addWineForm = ref(null)
const newWine = ref({
  naziv: '',
  opis: '',
  cijena: '',
  zemlja_porijekla: '',
  kategorija_id: null as number | null,
})

const categoryItems = [
  { text: 'Crveno', value: 1 },
  { text: 'Bijelo', value: 2 },
  { text: 'Rose', value: 3 },
  { text: 'Pjenušavo', value: 4 },
]

onMounted(async () => {
  try {
    const response = await api.get('/vina')
    wines.value = response.data
    countries.value = Array.from(new Set(wines.value.map(w => w.zemlja_porijekla).filter(Boolean)))
  } catch (error) {
    console.error('Greška prilikom dohvaćanja vina:', error)
  } finally {
    loading.value = false
  }
})

const filteredWines = computed(() => {
  let result = wines.value.filter(w => {
    const naziv = w.naziv.toLowerCase().trim()
    const country = w.zemlja_porijekla?.toLowerCase().trim() || ''

    const searchLower = search.value.toLowerCase().trim()
    const selectedCountryLower = selectedCountry.value?.toLowerCase().trim() || null
    const selectedCategoryLower = selectedCategory.value?.toLowerCase().trim() || null

    const categoryName = getCategoryName(w.kategorija_id).toLowerCase()

    const matchesSearch = naziv.includes(searchLower)
    const matchesCountry = !selectedCountryLower || country === selectedCountryLower
    const matchesCategory = !selectedCategoryLower || categoryName === selectedCategoryLower

    return matchesSearch && matchesCountry && matchesCategory
  })

  if (sortByPrice.value === 'lowest') {
    result = result.slice().sort((a, b) => parseFloat(a.cijena) - parseFloat(b.cijena))
  } else if (sortByPrice.value === 'highest') {
    result = result.slice().sort((a, b) => parseFloat(b.cijena) - parseFloat(a.cijena))
  }

  return result
})

watch([search, selectedCountry, selectedCategory, sortByPrice], () => {
  page.value = 1
})

function resetFilters() {
  selectedCountry.value = null
  selectedCategory.value = null
  sortByPrice.value = null
  showFilters.value = false
}

const pageCount = computed(() => Math.ceil(filteredWines.value.length / perPage))

const pagedWines = computed(() => {
  const start = (page.value - 1) * perPage
  return filteredWines.value.slice(start, start + perPage)
})

function openWineDetails(wine: Wine) {
  selectedWine.value = wine
  dialog.value = true
}

function openAddWineDialog() {
  newWine.value = {
    naziv: '',
    opis: '',
    cijena: '',
    zemlja_porijekla: '',
    kategorija_id: null,
  }
  valid.value = false
  addDialog.value = true
}

async function submitNewWine() {
  if (addWineForm.value) {
    const isValid = await addWineForm.value.validate()
    if (!isValid) return
  }

  try {
    await api.post('/vina', {
      naziv: newWine.value.naziv,
      opis: newWine.value.opis,
      cijena: newWine.value.cijena,
        zemlja_porijekla: newWine.value.zemlja_porijekla,
        kategorija_id: newWine.value.kategorija_id,
      })

      loading.value = true
      const response = await api.get('/vina')
      wines.value = response.data
      countries.value = Array.from(new Set(wines.value.map(w => w.zemlja_porijekla).filter(Boolean)))
      addDialog.value = false
    } catch (error) {
      console.error('Greška pri dodavanju vina:', error)
      alert('Došlo je do greške prilikom dodavanja vina.')
    } finally {
      loading.value = false
    }
  }
</script>

<style scoped>
.wine-card {
  width: 500px;
  height: auto;
  display: flex;
  flex-direction: column;
}
</style>
