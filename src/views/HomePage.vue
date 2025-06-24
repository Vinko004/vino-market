<template>
  <div>
    <v-img
      :src="vinogradImg"
      height="100vh"
      cover
      class="d-flex align-center justify-center text-center white--text"
    >
      <div class="hero-text">
        <h4 class="text-h6 mb-4">Otkrijte čaroliju domaćih vina</h4>
        <h1 class="text-h2 font-weight-bold mb-9">
          Priča koja traje generacijama
        </h1>
        <v-btn color="success" large elevation="1">Otkrijte naša vina</v-btn>
      </div>
    </v-img>

    <div style="background-color: #fdfcf9; width: 100%">
      <v-container class="py-16">
        <v-row align="center">
          <v-col cols="12" md="6" class="text-black">
            <h2 class="text-h4 font-weight-bold mb-8">
              Strast pretočena u lokalna vina
            </h2>
            <p class="text-body-1">
              Ovo je priča o obitelji, tradiciji i ljubavi prema vinu. Priča
              koja seže još u daleku 1936. godinu kada je u sklopu obiteljske
              kuće sagrađen vinski podrum.
            </p>
            <p class="text-body-2 mt-4">
              Smješteni smo u mirnom hercegovačkom selu, nedaleko od Čitluka i
              Međugorja, u kojem već četiri generacije njegujemo naše autohtone
              hercegovačke sorte žilavku i blatinu, kao i internacionalne sorte
              syrah i cabernet sauvignon.
            </p>
            <v-btn variant="outlined" class="mt-6">Otkrijte naša vina</v-btn>
          </v-col>

          <v-col
            cols="12"
            md="6"
            class="d-none d-md-flex justify-center align-center"
          >
            <v-img :src="Logo1" max-width="300" contain class="rounded" />
          </v-col>
        </v-row>
        <v-row class="d-flex d-md-none justify-center mt-6">
          <v-col cols="12" class="d-flex justify-center">
            <v-img
              :src="Logo1"
              class="logo-img-mobile"
              width="250"
              height="auto"
              cover
              rounded
            />
          </v-col>
        </v-row>
      </v-container>
      <div style="background-color: #1e1e1e; color: #f5f5dc; padding: 60px 0">
        <v-container class="px-8 px-md-10">
          <v-row class="footer-section d-flex flex-wrap flex-column flex-md-row justify-between">
            <v-col cols="12" md="6" class="footer-contact mb-6 mb-md-0">
              <h3 class="text-h5 font-weight-bold mb-4">
                📬 Kontakt informacije
              </h3>
              <div class="d-flex align-center mb-2">
                <v-icon class="mr-2" color="white">mdi-email</v-icon>
                <span>info@vinogradsunca.ba</span>
              </div>
              <div class="d-flex align-center mb-2">
                <v-icon class="mr-2" color="white">mdi-phone</v-icon>
                <span>+387 63 725 088</span>
              </div>
              <div class="d-flex align-center">
                <v-icon class="mr-2" color="white">mdi-map-marker</v-icon>
                <span>Služanj 139, 88260 Čitluk</span>
              </div>
            </v-col>

            <v-col
              cols="12"
              md="6"
              class="footer-hours d-flex flex-column align-end"
            >
              <h3 class="text-h5 font-weight-bold mb-4">🕒 Radno vrijeme</h3>
              <div class="d-flex align-center">
                <v-icon class="mr-2" color="white"
                  >mdi-clock-time-four-outline</v-icon
                >
                <span>Pon – sub: 09:00 – 21:00h</span>
              </div>
            </v-col>
          </v-row>
        </v-container>
        <v-row justify="center" class="mt-10">
          <span class="text-caption" style="opacity: 0.6">
            © 2025 Vinograd Sunca. Sva prava pridržana.
          </span>
        </v-row>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import vinogradImg from "@/assets/vinograd.webp";
import Logo1 from "@/assets/Logo1.png";
</script>

<style scoped>
.white--text {
  color: white;
}

.logo-img-mobile {
  display: block;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .hero-text h1 {
    font-size: 1.8rem !important;
  }

  .hero-text h4 {
    font-size: 1rem !important;
  }

  .footer-section {
    text-align: center;
    align-items: center !important;
    justify-content: center !important;
  }

  .footer-section h3 {
    text-align: center;
  }

  .footer-section .v-icon {
    margin-right: 8px;
  }

  .footer-contact,
  .footer-hours {
    align-items: center !important;
    text-align: center !important;
  }
  .logo-img {
    position: static;
    display: block;
    margin: 0 auto;
    width: 250px !important;
    height: auto !important;
  }
  .logo-wrapper {
    position: static;
    min-height: auto;
    padding-top: 40px;
  }
}
</style>
