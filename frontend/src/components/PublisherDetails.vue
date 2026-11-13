<!-- PublisherDetails.vue -->
<template>
  <section>
    <div class="page-head">
      <div>
        <p class="eyebrow">Editorial</p>
        <h1>{{ title }}</h1>
      </div>
    </div>

    <p v-if="error" class="error">{{ error }}</p>

    <div class="card form-card">
      <form v-on:submit.prevent="noop">
        <div class="form-grid">
          <div class="field">
            <label for="publisherInput">Publisher</label>
            <input id="publisherInput" type="text" autocomplete="off" :disabled="show" v-model="publisher.publisher" />
          </div>
          <div class="field">
            <label for="countryInput">Country</label>
            <input id="countryInput" type="text" autocomplete="off" :disabled="show" v-model="publisher.country" />
          </div>
          <div class="field">
            <label for="foundedInput">Founded</label>
            <input id="foundedInput" type="number" :disabled="show" v-model.number="publisher.founded" />
          </div>
          <div class="field">
            <label for="genreInput">Genre</label>
            <input id="genreInput" type="text" autocomplete="off" :disabled="show" v-model="publisher.genre" />
          </div>
        </div>

        <div class="form-actions">
          <router-link class="btn btn-ghost" to="/publisher">
            <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M19 12H5" />
              <path d="m12 19-7-7 7-7" />
            </svg>
            Back
          </router-link>
          <router-link v-if="show" class="btn btn-primary" :to="'/publisher/edit/' + publisher.id">
            Edit
          </router-link>
          <a v-if="edit" class="btn btn-primary" v-on:click="updatePublisher(publisher.id)">Save</a>
          <a v-if="create" class="btn btn-primary" v-on:click="createPublisher()">Create</a>
        </div>
      </form>
    </div>
  </section>
</template>

<script>
export default {
  name: "PublisherDetails",
  props: ["show", "edit", "create"],
  data() {
    return {
      title: this.create
        ? "Nueva editorial"
        : this.edit
          ? "Editar editorial"
          : "Detalle de la editorial",
      publisher: {},
      error: "",
    };
  },
  mounted() {
    const id = this.$route.params.id;
    if (id != null) {
      this.findPublisher(id);
    } else {
      this.publisher = {
        publisher: "",
        country: "",
        founded: 0,
        genre: "",
      };
    }
  },
  methods: {
    noop() {},
    findPublisher(id) {
      fetch(this.url + "/.netlify/functions/publisherFind/" + id, {
        headers: { Accept: "application/json" },
      })
        .then((response) => response.json())
        .then((items) => {
          this.publisher = Array.isArray(items) && items.length > 0 ? items[0] : {};
          if (!this.publisher.id && this.show) {
            this.error = "La editorial " + id + " no existe.";
          }
        })
        .catch((error) => {
          this.error = error.message;
        });
    },
    processTasks() {
      return fetch(this.url + "/.netlify/functions/publisherTasks", {
        method: "POST",
        headers: { Accept: "application/json" },
      }).catch(() => {});
    },
    save(url, method, message) {
      fetch(url, {
        headers: { "Content-Type": "application/json" },
        method,
        body: JSON.stringify(this.publisher),
      })
        .then(async (response) => {
          const data = await response.json().catch(() => ({}));
          if (!response.ok) throw new Error(data.error || message);
          await this.processTasks();
          this.$router.push("/publisher");
        })
        .catch((error) => {
          this.error = error.message;
        });
    },
    updatePublisher(id) {
      this.save(
        this.url + "/.netlify/functions/publisherUpdate/" + id,
        "PUT",
        "No se pudo guardar la editorial."
      );
    },
    createPublisher() {
      this.save(
        this.url + "/.netlify/functions/publisherInsert",
        "POST",
        "No se pudo crear la editorial."
      );
    },
  },
};
</script>
