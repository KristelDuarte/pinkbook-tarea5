<template>
  <div class="app-shell">
    <header class="topbar">
      <div class="container topbar-inner">
        <router-link class="brand" to="/">
          <span class="brand-mark">P</span>
          <span class="brand-text">PinkBook</span>
        </router-link>
        <nav class="nav">
          <router-link class="nav-link" :class="{ 'is-active': isSection('/') }" to="/">Home</router-link>
          <router-link class="nav-link" :class="{ 'is-active': isSection('/book') }" to="/book">Books</router-link>
          <router-link class="nav-link" :class="{ 'is-active': isSection('/author') }" to="/author">Authors</router-link>
          <router-link class="nav-link" :class="{ 'is-active': isSection('/publisher') }" to="/publisher">Publishers</router-link>
        </nav>
      </div>
    </header>

    <main class="container main">
      <router-view />
    </main>

    <footer class="footer">
      <div class="container footer-inner">
        Sistemas Distribuidos - Tarea 5 - Kristel Duarte Pérez
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: "App",
  methods: {
    isSection(prefix) {
      const current = this.$route.path;
      if (prefix === "/") return current === "/";
      return current === prefix || current.startsWith(prefix + "/");
    },
  },
};
</script>
