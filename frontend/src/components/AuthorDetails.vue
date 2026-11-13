<!-- AuthorDetails.vue -->
<template>
  <section>
    <div class="page-head">
      <div>
        <p class="eyebrow">Autor</p>
        <h1>{{ title }}</h1>
      </div>
    </div>

    <p v-if="error" class="error">{{ error }}</p>

    <div class="card form-card">
      <form v-on:submit.prevent="noop">
        <div class="form-grid">
          <div class="field">
            <label for="authorInput">Author</label>
            <input id="authorInput" type="text" autocomplete="off" :disabled="show" v-model="author.author" />
          </div>
          <div class="field">
            <label for="nationalityInput">Nationality</label>
            <input id="nationalityInput" type="text" autocomplete="off" :disabled="show" v-model="author.nationality" />
          </div>
          <div class="field">
            <label for="birthYearInput">Birth year</label>
            <input id="birthYearInput" type="number" :disabled="show" v-model.number="author.birth_year" />
          </div>
          <div class="field">
            <label for="fieldsInput">Fields</label>
            <input id="fieldsInput" type="text" autocomplete="off" :disabled="show" v-model="author.fields" />
          </div>
        </div>

        <div class="form-actions">
          <router-link class="btn btn-ghost" to="/author">
            <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M19 12H5" />
              <path d="m12 19-7-7 7-7" />
            </svg>
            Back
          </router-link>
          <router-link v-if="show" class="btn btn-primary" :to="'/author/edit/' + author.id">
            Edit
          </router-link>
          <a v-if="edit" class="btn btn-primary" v-on:click="updateAuthor(author.id)">Save</a>
          <a v-if="create" class="btn btn-primary" v-on:click="createAuthor()">Create</a>
        </div>
      </form>
    </div>
  </section>
</template>

<script>
export default {
  name: "AuthorDetails",
  props: ["show", "edit", "create"],
  data() {
    return {
      title: this.create ? "Nuevo autor" : this.edit ? "Editar autor" : "Detalle del autor",
      author: {},
      error: "",
    };
  },
  mounted() {
    const id = this.$route.params.id;
    if (id != null) {
      this.findAuthor(id);
    } else {
      this.author = {
        author: "",
        nationality: "",
        birth_year: 0,
        fields: "",
      };
    }
  },
  methods: {
    noop() {},
    findAuthor(id) {
      fetch(this.url + "/.netlify/functions/authorFind/" + id, {
        headers: { Accept: "application/json" },
      })
        .then((response) => response.json())
        .then((items) => {
          this.author = Array.isArray(items) && items.length > 0 ? items[0] : {};
          if (!this.author.id && this.show) {
            this.error = "El autor " + id + " no existe.";
          }
        })
        .catch((error) => {
          this.error = error.message;
        });
    },
    processTasks() {
      return fetch(this.url + "/.netlify/functions/authorTasks", {
        method: "POST",
        headers: { Accept: "application/json" },
      }).catch(() => {});
    },
    save(url, method, message) {
      fetch(url, {
        headers: { "Content-Type": "application/json" },
        method,
        body: JSON.stringify(this.author),
      })
        .then(async (response) => {
          const data = await response.json().catch(() => ({}));
          if (!response.ok) throw new Error(data.error || message);
          await this.processTasks();
          this.$router.push("/author");
        })
        .catch((error) => {
          this.error = error.message;
        });
    },
    updateAuthor(id) {
      this.save(
        this.url + "/.netlify/functions/authorUpdate/" + id,
        "PUT",
        "No se pudo guardar el autor."
      );
    },
    createAuthor() {
      this.save(
        this.url + "/.netlify/functions/authorInsert",
        "POST",
        "No se pudo crear el autor."
      );
    },
  },
};
</script>
