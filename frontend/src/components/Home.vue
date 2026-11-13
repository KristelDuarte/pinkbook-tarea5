<!-- Home.vue -->
<template>
  <section>
    <div class="hero">
      <p class="hero-eyebrow">Librería</p>
      <h1>PinkBook</h1>
      <p class="hero-text">
        Un espacio para descubrir libros y conocer a quienes los escriben y los publican.
      </p>
      <router-link class="btn btn-hero" to="/book">Explorar catálogo</router-link>
    </div>

    <div class="grid-3">
      <router-link class="tile" to="/book">
        <span class="tile-icon">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
        </span>
        <h2 class="tile-title">Books</h2>
        <p class="tile-text">Explora el catálogo completo de la librería.</p>
        <span class="tile-link">
          Ver libros
          <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </span>
      </router-link>

      <router-link class="tile" to="/author">
        <span class="tile-icon">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </span>
        <h2 class="tile-title">Authors</h2>
        <p class="tile-text">Conoce a los autores de tus libros favoritos.</p>
        <span class="tile-link">
          Ver autores
          <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </span>
      </router-link>

      <router-link class="tile" to="/publisher">
        <span class="tile-icon">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
            <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
            <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
            <path d="M10 6h4M10 10h4M10 14h4M10 18h4" />
          </svg>
        </span>
        <h2 class="tile-title">Publishers</h2>
        <p class="tile-text">Descubre las editoriales detrás de cada obra.</p>
        <span class="tile-link">
          Ver editoriales
          <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </span>
      </router-link>
    </div>
  </section>
</template>

<script>
export default {
  name: "Home",
};
</script>
