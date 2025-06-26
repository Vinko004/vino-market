<template>
  <v-container class="py-6">
    <!-- Gumb za dodavanje vina -->
    <v-row justify="end" class="mb-4">
      <v-col cols="auto">
        <v-btn color="success" @click="otvoriDodajVinoDialog" dark>
          Dodaj vino
        </v-btn>
      </v-col>
    </v-row>

    <!-- Pretraživanje -->
    <v-row class="mb-4" align="center" justify="start" dense>
      <v-col cols="12" md="6">
        <v-text-field v-model="pretraga" label="Pretraži vino" prepend-inner-icon="mdi-magnify" clearable dense
          outlined />
      </v-col>
    </v-row>

    <!-- Filteri -->
    <v-row class="mb-4" align="center" justify="start" dense>
      <v-col cols="auto">
        <v-btn color="primary" @click="prikaziFiltere = !prikaziFiltere" depressed>
          {{ prikaziFiltere ? "Sakrij filtre" : "Prikaži filtre" }}
        </v-btn>
      </v-col>
      <v-col cols="auto" v-if="prikaziFiltere">
        <v-btn color="error" @click="ponistiFiltere" depressed>
          Izbriši filtraciju
        </v-btn>
      </v-col>
    </v-row>

    <!-- Filter polja -->
    <v-expand-transition>
      <v-card v-if="prikaziFiltere" class="mb-6 pa-4" elevation="3" max-width="900">
        <v-row dense>
          <v-col cols="12" md="4">
            <v-select v-model="odabranaZemlja" :items="zemlje" label="Filtriraj po zemlji porijekla" clearable dense
              outlined />
          </v-col>

          <v-col cols="12" md="4">
            <v-select v-model="odabranaKategorija" :items="kategorije" label="Filtriraj po kategoriji" clearable dense
              outlined />
          </v-col>

          <v-col cols="12" md="4">
            <v-select v-model="sortiranjePoCijeni" :items="opcijeSortiranja" label="Sortiraj po cijeni" clearable dense
              outlined item-title="tekst" item-value="vrijednost" />
          </v-col>
        </v-row>
      </v-card>
    </v-expand-transition>

    <!-- Lista vina -->
    <v-row>
      <template v-if="ucitavanje">
        <v-col cols="12" class="text-center">
          <v-progress-circular indeterminate color="primary" size="64" />
        </v-col>
      </template>

      <template v-else-if="prikazVina.length === 0">
        <v-col cols="12" class="text-center">
          <p class="text-subtitle-1">
            Nema vina koja zadovoljavaju kriterije pretrage.
          </p>
        </v-col>
      </template>

      <template v-else>
        <v-col v-for="vino in prikazVina" :key="vino.id" cols="12" sm="6" md="6" lg="4" class="d-flex">
          <v-card max-width="500" class="mx-auto wine-card" elevation="5" rounded>
            <v-card-title>{{ vino.naziv }}</v-card-title>
            <v-card-text class="py-4">
              <p><strong>Opis:</strong> {{ vino.opis }}</p>
              <p><strong>Cijena:</strong> {{ parseFloat(vino.cijena).toFixed(2) }} €</p>
              <p><strong>Zemlja porijekla:</strong> {{ vino.zemlja_porijekla }}</p>
              <p><strong>Kategorija:</strong> {{ dohvatiNazivKategorije(vino.kategorija_id) }}</p>
            </v-card-text>
            <v-card-actions>
              <v-btn color="primary" text @click="otvoriDetaljeVina(vino)">Više info</v-btn>
              <v-spacer />
            </v-card-actions>
          </v-card>
        </v-col>
      </template>
    </v-row>

    <!-- Paginacija -->
    <v-row justify="center" class="mt-6">
      <v-pagination v-model="stranica" :length="brojStranica" circle total-visible="7" color="primary" />
    </v-row>

    <!-- Dijalog detalja vina -->
    <v-dialog v-model="dialogDetalji" max-width="800" persistent scrollable>
      <v-card>
        <v-toolbar flat color="primary" dark>
          <v-toolbar-title>{{ vinoDetalji?.naziv }}</v-toolbar-title>
          <v-spacer />
          <v-btn icon @click="dialogDetalji = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text>
          <p><strong>Opis:</strong> {{ vinoDetalji?.opis }}</p>
          <p><strong>Cijena:</strong> {{ parseFloat(vinoDetalji?.cijena || "0").toFixed(2) }} €</p>
          <p><strong>Zemlja porijekla:</strong> {{ vinoDetalji?.zemlja_porijekla }}</p>
          <p><strong>Kategorija:</strong> {{ dohvatiNazivKategorije(vinoDetalji?.kategorija_id) }}</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" text @click="dialogDetalji = false">Zatvori</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dijalog dodavanja vina -->
    <v-dialog v-model="dialogDodaj" max-width="600" persistent>
      <v-card>
        <v-toolbar flat color="success" dark>
          <v-toolbar-title>Dodaj novo vino</v-toolbar-title>
          <v-spacer />
          <v-btn icon @click="dialogDodaj = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text>
          <v-form ref="formaDodajVino" v-model="isValid" lazy-validation>
            <v-text-field v-model="novoVino.naziv" label="Naziv" :rules="[(v) => !!v || 'Naziv je obavezan']"
              required />
            <v-textarea v-model="novoVino.opis" label="Opis" :rules="[(v) => !!v || 'Opis je obavezan']" required
              rows="3" />
            <v-text-field v-model="novoVino.cijena" label="Cijena (€)" type="number" min="0"
              :rules="[(v) => (!!v && parseFloat(v) >= 0) || 'Unesite ispravnu cijenu']" required />
            <v-text-field v-model="novoVino.zemlja_porijekla" label="Zemlja porijekla"
              :rules="[(v) => !!v || 'Zemlja je obavezna']" required />
            <v-select v-model="novoVino.kategorija_id" :items="stavkeKategorija" label="Kategorija" clearable dense
              outlined item-title="tekst" item-value="vrijednost" :rules="[(v) => !!v || 'Kategorija je obavezna']"
              required />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="success" :disabled="!isValid" @click="posaljiNovoVino">
            Spremi
          </v-btn>
          <v-btn text @click="dialogDodaj = false">Odustani</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import api from "@/services/api";

interface Vino {
  id: number;
  naziv: string;
  opis: string;
  cijena: string;
  kategorija_id: number;
  zemlja_porijekla: string;
}

const mapaKategorija: Record<number, string> = {
  1: "Crveno",
  2: "Bijelo",
  3: "Rose",
  4: "Pjenušavo",
};

function dohvatiNazivKategorije(id: number | undefined): string {
  if (!id) return "Nepoznata kategorija";
  return mapaKategorija[id] || "Nepoznata kategorija";
}

const vina = ref<Vino[]>([]);
const pretraga = ref("");
const odabranaZemlja = ref<string | null>(null);
const odabranaKategorija = ref<string | null>(null);
const sortiranjePoCijeni = ref<string | null>(null);
const stranica = ref(1);
const poStranici = 6;
const ucitavanje = ref(true);
const prikaziFiltere = ref(false);

const zemlje = ref<string[]>([]);
const kategorije = ref<string[]>(Object.values(mapaKategorija));

const dialogDetalji = ref(false);
const vinoDetalji = ref<Vino | null>(null);

const dialogDodaj = ref(false);
const isValid = ref(false);
const formaDodajVino = ref(null);
const novoVino = ref({
  naziv: "",
  opis: "",
  cijena: "",
  zemlja_porijekla: "",
  kategorija_id: null as number | null,
});

const stavkeKategorija = [
  { tekst: "Crveno", vrijednost: 1 },
  { tekst: "Bijelo", vrijednost: 2 },
  { tekst: "Rose", vrijednost: 3 },
  { tekst: "Pjenušavo", vrijednost: 4 },
];

onMounted(async () => {
  try {
    const odgovor = await api.get("/vina");
    vina.value = odgovor.data;
    zemlje.value = Array.from(
      new Set(vina.value.map((v) => v.zemlja_porijekla).filter(Boolean))
    );
  } catch (err) {
    console.error("Greška pri dohvaćanju vina:", err);
  } finally {
    ucitavanje.value = false;
  }
});

const filtriranaVina = computed(() => {
  let rezultat = vina.value.filter((vino) => {
    const naziv = vino.naziv.toLowerCase().trim();
    const zemlja = vino.zemlja_porijekla?.toLowerCase().trim() || "";

    const pretragaLower = pretraga.value.toLowerCase().trim();
    const zemljaFilter = odabranaZemlja.value?.toLowerCase().trim() || null;
    const kategorijaFilter =
      odabranaKategorija.value?.toLowerCase().trim() || null;

    const nazivKategorije = dohvatiNazivKategorije(vino.kategorija_id).toLowerCase();

    const zadovoljavaPretragu = naziv.includes(pretragaLower);
    const zadovoljavaZemlju = !zemljaFilter || zemlja === zemljaFilter;
    const zadovoljavaKategoriju = !kategorijaFilter || nazivKategorije === kategorijaFilter;

    return zadovoljavaPretragu && zadovoljavaZemlju && zadovoljavaKategoriju;
  });

  if (sortiranjePoCijeni.value === "najniza") {
    rezultat = rezultat.slice().sort((a, b) => parseFloat(a.cijena) - parseFloat(b.cijena));
  } else if (sortiranjePoCijeni.value === "najvisa") {
    rezultat = rezultat.slice().sort((a, b) => parseFloat(b.cijena) - parseFloat(a.cijena));
  }

  return rezultat;
});

function ponistiFiltere() {
  odabranaZemlja.value = null;
  odabranaKategorija.value = null;
  sortiranjePoCijeni.value = null;
  prikaziFiltere.value = false;
}

const brojStranica = computed(() =>
  Math.ceil(filtriranaVina.value.length / poStranici)
);

const prikazVina = computed(() => {
  const start = (stranica.value - 1) * poStranici;
  return filtriranaVina.value.slice(start, start + poStranici);
});

function otvoriDetaljeVina(vino: Vino) {
  vinoDetalji.value = vino;
  dialogDetalji.value = true;
}

function otvoriDodajVinoDialog() {
  novoVino.value = {
    naziv: "",
    opis: "",
    cijena: "",
    zemlja_porijekla: "",
    kategorija_id: null,
  };
  isValid.value = false;
  dialogDodaj.value = true;
}

async function posaljiNovoVino() {
  if (formaDodajVino.value) {
    const validno = await formaDodajVino.value.validate();
    if (!validno) return;
  }

  try {
    await api.post("/vina", {
      naziv: novoVino.value.naziv,
      opis: novoVino.value.opis,
      cijena: novoVino.value.cijena,
      zemlja_porijekla: novoVino.value.zemlja_porijekla,
      kategorija_id: novoVino.value.kategorija_id,
    });

    ucitavanje.value = true;
    const odgovor = await api.get("/vina");
    vina.value = odgovor.data;
    zemlje.value = Array.from(
      new Set(vina.value.map((v) => v.zemlja_porijekla).filter(Boolean))
    );
    dialogDodaj.value = false;
  } catch (err) {
    console.error("Greška pri dodavanju vina:", err);
    alert("Došlo je do greške prilikom dodavanja vina.");
  } finally {
    ucitavanje.value = false;
  }
}

const opcijeSortiranja = [
  { tekst: "Najniža cijena", vrijednost: "najniza" },
  { tekst: "Najviša cijena", vrijednost: "najvisa" },
];

watch([pretraga, odabranaZemlja, odabranaKategorija, sortiranjePoCijeni], () => {
  stranica.value = 1;
});
</script>

<style scoped>
.wine-card {
  width: 500px;
  display: flex;
  flex-direction: column;
}
</style>
