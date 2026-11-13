<!-- AuthorIndex.vue -->
<template>
  <section>
    <div class="page-head">
      <div>
        <p class="eyebrow">Catálogo</p>
        <h1>Authors</h1>
        <p class="subtitle">Consulta y administra los autores registrados.</p>
      </div>
      <div class="head-actions">
        <button class="btn btn-ghost" :disabled="busy" @click="sync">
          <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M21 12a9 9 0 1 1-2.64-6.36" />
            <path d="M21 3v6h-6" />
          </svg>
          {{ busy ? "Actualizando…" : "Actualizar" }}
        </button>
        <router-link class="btn btn-primary" to="/author/create">+ Nuevo autor</router-link>
      </div>
    </div>

    <p v-if="error" class="error">{{ error }}</p>

    <div class="card table-card">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Author</th>
              <th>Nationality</th>
              <th>Birth year</th>
              <th>Fields</th>
              <th class="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="author in authors" :key="author.id">
              <td class="cell-strong" data-label="Author">{{ author.author }}</td>
              <td data-label="Nationality">{{ author.nationality }}</td>
              <td data-label="Birth year">{{ author.birth_year }}</td>
              <td data-label="Fields">{{ author.fields }}</td>
              <td class="cell-actions">
                <router-link class="btn btn-ghost btn-sm" :to="'/author/show/' + author.id">
                  Show
                </router-link>
                <router-link class="btn btn-ghost btn-sm" :to="'/author/edit/' + author.id">
                  Edit
                </router-link>
                <a class="btn btn-danger btn-sm" v-on:click="deleteAuthor(author.id)">
                  Delete
                </a>
              </td>
            </tr>
            <tr v-if="authors.length === 0">
              <td colspan="5" class="muted text-center">
                No hay autores registrados. Cree el primero con el botón «Nuevo autor».
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: "AuthorIndex",
  data() {
    return { authors: [], busy: false, error: "" };
  },
  mounted() {
    this.sync();
  },
  methods: {
    processTasks() {
      return fetch(this.url + "/.netlify/functions/authorTasks", {
        method: "POST",
        headers: { Accept: "application/json" },
      }).catch(() => {});
    },
    sync() {
      this.busy = true;
      this.error = "";
      return this.processTasks()
        .then(() => this.allAuthors())
        .finally(() => {
          this.busy = false;
        });
    },
    allAuthors() {
      return fetch(this.url + "/.netlify/functions/authorFindAll", {
        headers: { Accept: "application/json" },
      })
        .then((response) => response.json())
        .then((items) => {
          this.authors = Array.isArray(items) ? items : [];
        })
        .catch(() => {
          this.authors = [];
        });
    },
    deleteAuthor(id) {
      fetch(this.url + "/.netlify/functions/authorDelete/" + id, {
        headers: { "Content-Type": "application/json" },
        method: "DELETE",
      })
        .then((response) => {
          if (!response.ok) throw new Error("No se pudo eliminar el autor.");
          return this.sync();
        })
        .catch((error) => {
          this.error = error.message;
        });
    },
  },
};
</script>
