<!-- BookIndex.vue -->
<template>
  <section>
    <div class="page-head">
      <div>
        <p class="eyebrow">Catálogo</p>
        <h1>Books</h1>
        <p class="subtitle">Consulta y administra los libros registrados.</p>
      </div>
      <div class="head-actions">
        <button class="btn btn-ghost" :disabled="busy" @click="sync">
          <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M21 12a9 9 0 1 1-2.64-6.36" />
            <path d="M21 3v6h-6" />
          </svg>
          {{ busy ? "Actualizando…" : "Actualizar" }}
        </button>
        <router-link class="btn btn-primary" to="/book/create">+ Nuevo libro</router-link>
      </div>
    </div>

    <p v-if="error" class="error">{{ error }}</p>

    <div class="card table-card">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Publisher</th>
              <th>Edition</th>
              <th class="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="book in books" :key="book.id">
              <td class="cell-strong" data-label="Title">{{ book.title }}</td>
              <td data-label="Author">{{ book.author }}</td>
              <td data-label="Publisher">{{ book.publisher }}</td>
              <td data-label="Edition">{{ book.edition }}</td>
              <td class="cell-actions">
                <router-link class="btn btn-ghost btn-sm" :to="'/book/show/' + book.id">
                  Show
                </router-link>
                <router-link class="btn btn-ghost btn-sm" :to="'/book/edit/' + book.id">
                  Edit
                </router-link>
                <a class="btn btn-danger btn-sm" v-on:click="deleteBook(book.id)">
                  Delete
                </a>
              </td>
            </tr>
            <tr v-if="books.length === 0">
              <td colspan="5" class="muted text-center">
                No hay libros registrados. Cree el primero con el botón «Nuevo libro».
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
  name: "BookIndex",
  data() {
    return { books: [], busy: false, error: "" };
  },
  mounted() {
    this.sync();
  },
  methods: {
    processTasks() {
      return fetch(this.url + "/.netlify/functions/bookTasks", {
        method: "POST",
        headers: { Accept: "application/json" },
      }).catch(() => {});
    },
    sync() {
      this.busy = true;
      this.error = "";
      return this.processTasks()
        .then(() => this.allBooks())
        .finally(() => {
          this.busy = false;
        });
    },
    allBooks() {
      return fetch(this.url + "/.netlify/functions/bookFindAll", {
        headers: { Accept: "application/json" },
      })
        .then((response) => response.json())
        .then((items) => {
          this.books = Array.isArray(items) ? items : [];
        })
        .catch(() => {
          this.books = [];
        });
    },
    deleteBook(id) {
      fetch(this.url + "/.netlify/functions/bookDelete/" + id, {
        headers: { "Content-Type": "application/json" },
        method: "DELETE",
      })
        .then((response) => {
          if (!response.ok) throw new Error("No se pudo eliminar el libro.");
          return this.sync();
        })
        .catch((error) => {
          this.error = error.message;
        });
    },
  },
};
</script>
