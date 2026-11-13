<!-- BookDetails.vue -->
<template>
  <section>
    <div class="page-head">
      <div>
        <p class="eyebrow">Libro</p>
        <h1>{{ title }}</h1>
      </div>
    </div>

    <p v-if="error" class="error">{{ error }}</p>

    <div class="card form-card">
      <form v-on:submit.prevent="noop">
        <div class="form-grid">
          <div class="field">
            <label for="titleInput">Title</label>
            <input id="titleInput" type="text" autocomplete="off" :disabled="show" v-model="book.title" />
          </div>
          <div class="field">
            <label for="authorInput">Author</label>
            <input id="authorInput" type="text" autocomplete="off" :disabled="show" v-model="book.author" />
          </div>
          <div class="field">
            <label for="publisherInput">Publisher</label>
            <input id="publisherInput" type="text" autocomplete="off" :disabled="show" v-model="book.publisher" />
          </div>
          <div class="field">
            <label for="editionInput">Edition</label>
            <input id="editionInput" type="text" autocomplete="off" :disabled="show" v-model="book.edition" />
          </div>
          <div class="field">
            <label for="copyrightInput">Copyright</label>
            <input id="copyrightInput" type="number" :disabled="show" v-model.number="book.copyright" />
          </div>
          <div class="field">
            <label for="languageInput">Language</label>
            <input id="languageInput" type="text" autocomplete="off" :disabled="show" v-model="book.language" />
          </div>
          <div class="field">
            <label for="pagesInput">Pages</label>
            <input id="pagesInput" type="number" :disabled="show" v-model.number="book.pages" />
          </div>
        </div>

        <div class="form-actions">
          <router-link class="btn btn-ghost" to="/book">
            <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M19 12H5" />
              <path d="m12 19-7-7 7-7" />
            </svg>
            Back
          </router-link>
          <router-link v-if="show" class="btn btn-primary" :to="'/book/edit/' + book.id">
            Edit
          </router-link>
          <a v-if="edit" class="btn btn-primary" v-on:click="updateBook(book.id)">Save</a>
          <a v-if="create" class="btn btn-primary" v-on:click="createBook()">Create</a>
        </div>
      </form>
    </div>
  </section>
</template>

<script>
export default {
  name: "BookDetails",
  props: ["show", "edit", "create"],
  data() {
    return {
      title: this.create ? "Nuevo libro" : this.edit ? "Editar libro" : "Detalle del libro",
      book: {},
      error: "",
    };
  },
  mounted() {
    const id = this.$route.params.id;
    if (id != null) {
      this.findBook(id);
    } else {
      this.book = {
        title: "",
        author: "",
        publisher: "",
        edition: "",
        copyright: 0,
        language: "",
        pages: 0,
      };
    }
  },
  methods: {
    noop() {},
    findBook(id) {
      fetch(this.url + "/.netlify/functions/bookFind/" + id, {
        headers: { Accept: "application/json" },
      })
        .then((response) => response.json())
        .then((items) => {
          this.book = Array.isArray(items) && items.length > 0 ? items[0] : {};
          if (!this.book.id && this.show) {
            this.error = "El libro " + id + " no existe.";
          }
        })
        .catch((error) => {
          this.error = error.message;
        });
    },
    processTasks() {
      return fetch(this.url + "/.netlify/functions/bookTasks", {
        method: "POST",
        headers: { Accept: "application/json" },
      }).catch(() => {});
    },
    save(url, method, message) {
      fetch(url, {
        headers: { "Content-Type": "application/json" },
        method,
        body: JSON.stringify(this.book),
      })
        .then(async (response) => {
          const data = await response.json().catch(() => ({}));
          if (!response.ok) throw new Error(data.error || message);
          await this.processTasks();
          this.$router.push("/book");
        })
        .catch((error) => {
          this.error = error.message;
        });
    },
    updateBook(id) {
      this.save(
        this.url + "/.netlify/functions/bookUpdate/" + id,
        "PUT",
        "No se pudo guardar el libro."
      );
    },
    createBook() {
      this.save(
        this.url + "/.netlify/functions/bookInsert",
        "POST",
        "No se pudo crear el libro."
      );
    },
  },
};
</script>
