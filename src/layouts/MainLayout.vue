<template>
  <q-layout view="hHh LpR fFf">
    <q-header elevated class="bg-white text-primary">
      <q-toolbar v-if="isLoggedIn" class="q-py-md">
        <q-btn
          dense
          flat
          round
          icon="menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
          class="q-mr-sm"
        />

        <q-toolbar-title>
          <q-icon name="home" class="q-mr-sm" />
          <span class="text-h6">Utility App</span>
        </q-toolbar-title>

        <q-btn
          color="primary"
          flat
          icon="logout"
          size="sm"
          no-caps
          @click="logout"
          testId="current-user-btn-logout"
        >
          <q-tooltip
            class="bg-primary"
            anchor="top middle"
            self="bottom middle"
            :offset="[10, 10]"
            :delay="300"
          >
            Déconnexion
          </q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-if="isLoggedIn"
      v-model="leftDrawerOpen"
      persistent
      show-if-above
      side="left"
      class="bg-grey-1"
      :width="200"
    >
      <q-list>
        <q-item
          clickable
          @click="goTo(routePath.calendar)"
          :active="route.path === '/calendar'"
          active-class="text-primary"
        >
          <q-item-section avatar><q-icon name="calendar_month" /></q-item-section>
          <q-item-section>Calendrier</q-item-section>
        </q-item>

        <q-item
          clickable
          @click="goTo(routePath.shopping)"
          :active="route.path === '/shopping'"
          active-class="text-primary"
        >
          <q-item-section avatar><q-icon name="shopping_cart" /></q-item-section>
          <q-item-section>Liste de courses</q-item-section>
        </q-item>

        <q-item
          clickable
          @click="goTo(routePath.listnote)"
          :active="route.path === '/listnote'"
          active-class="text-primary"
        >
          <q-item-section avatar><q-icon name="note" /></q-item-section>
          <q-item-section>Bloc-notes</q-item-section>
        </q-item>

        <q-item
          clickable
          @click="goTo(routePath.listgames)"
          :active="route.path === '/listgames'"
          active-class="text-primary"
        >
          <q-item-section avatar><q-icon name="games" /></q-item-section>
          <q-item-section>Jeux</q-item-section>
        </q-item>

        <q-item
          clickable
          @click="goTo(routePath.drawingboard)"
          :active="route.path === '/drawingboard'"
          active-class="text-primary"
        >
          <q-item-section avatar><q-icon name="draw" /></q-item-section>
          <q-item-section>Tableau blanc</q-item-section>
        </q-item>

        <q-item
          clickable
          @click="goTo(routePath.calculator)"
          :active="route.path === '/calculator'"
          active-class="text-primary"
        >
          <q-item-section avatar><q-icon name="calculate" /></q-item-section>
          <q-item-section>Calculatrice</q-item-section>
        </q-item>

        <q-item
          clickable
          tag="a"
          href="https://vdasilva116.github.io/password-checker/"
          target="_blank"
          rel="noopener"
        >
          <q-item-section avatar><q-icon name="lock" /></q-item-section>
          <q-item-section>Testeur de mot de passe</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { routePath } from 'src/models/routePath';
import { useRoute, useRouter } from 'vue-router';
import { supabase } from 'boot/supabase';
import { ref, onMounted } from 'vue';

const router = useRouter();
const route = useRoute();
const leftDrawerOpen = ref(true);
const isLoggedIn = ref(false);

const goTo = (uri: string) => {
  void router.push(uri);
};

async function logout() {
  await supabase.auth.signOut();
  isLoggedIn.value = false;
  await router.push('/login');
}

onMounted(async () => {
  const { data } = await supabase.auth.getSession();
  isLoggedIn.value = !!data.session;

  if (!isLoggedIn.value && route.path !== '/login') {
    await router.push('/login');
  }

  supabase.auth.onAuthStateChange((_event, session) => {
    isLoggedIn.value = !!session;
    if (!session) {
      void router.push('/login');
    }
  });
});
</script>
