<!-- PublisherIndex.vue -->
<template>
  <section>
    <div class="page-head">
      <div>
        <p class="eyebrow">Catálogo</p>
        <h1>Publishers</h1>
        <p class="subtitle">Consulta y administra las editoriales registradas.</p>
      </div>
      <div class="head-actions">
        <button class="btn btn-ghost" :disabled="busy" @click="sync">
          <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M21 12a9 9 0 1 1-2.64-6.36" />
            <path d="M21 3v6h-6" />
          </svg>
          {{ busy ? "Actualizando…" : "Actualizar" }}
        </button>
        <router-link class="btn btn-primary" to="/publisher/create">+ Nueva editorial</router-link>
      </div>
    </div>

    <p v-if="error" class="error">{{ error }}</p>

    <div class="card table-card">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Publisher</th>
              <th>Country</th>
              <th>Founded</th>
              <th>Genre</th>
              <th class="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="publisher in publishers" :key="publisher.id">
              <td class="cell-strong" data-label="Publisher">{{ publisher.publisher }}</td>
              <td data-label="Country">{{ publisher.country }}</td>
              <td data-label="Founded">{{ publisher.founded }}</td>
              <td data-label="Genre">{{ publisher.genre }}</td>
              <td class="cell-actions">
                <router-link class="btn btn-ghost btn-sm" :to="'/publisher/show/' + publisher.id">
                  Show
                </router-link>
                <router-link class="btn btn-ghost btn-sm" :to="'/publisher/edit/' + publisher.id">
                  Edit
                </router-link>
                <a class="btn btn-danger btn-sm" v-on:click="deletePublisher(publisher.id)">
                  Delete
                </a>
              </td>
            </tr>
            <tr v-if="publishers.length === 0">
              <td colspan="5" class="muted text-center">
                No hay editoriales registradas. Cree la primera con el botón «Nueva editorial».
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
  name: "PublisherIndex",
  data() {
    return { publishers: [], busy: false, error: "" };
  },
  mounted() {
    this.sync();
  },
  methods: {
    processTasks() {
      return fetch(this.url + "/.netlify/functions/publisherTasks", {
        method: "POST",
        headers: { Accept: "application/json" },
      }).catch(() => {});
    },
    sync() {
      this.busy = true;
      this.error = "";
      return this.processTasks()
        .then(() => this.allPublishers())
        .finally(() => {
          this.busy = false;
        });
    },
    allPublishers() {
      return fetch(this.url + "/.netlify/functions/publisherFindAll", {
        headers: { Accept: "application/json" },
      })
        .then((response) => response.json())
        .then((items) => {
          this.publishers = Array.isArray(items) ? items : [];
        })
        .catch(() => {
          this.publishers = [];
        });
    },
    deletePublisher(id) {
      fetch(this.url + "/.netlify/functions/publisherDelete/" + id, {
        headers: { "Content-Type": "application/json" },
        method: "DELETE",
      })
        .then((response) => {
          if (!response.ok) throw new Error("No se pudo eliminar la editorial.");
          return this.sync();
        })
        .catch((error) => {
          this.error = error.message;
        });
    },
  },
};
</script>
