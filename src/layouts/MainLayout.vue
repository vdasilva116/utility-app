<template>
  <q-layout view="hHh LpR fFf">
    <q-header elevated class="bg-white text-primary">
      <q-toolbar class="q-py-md"> </q-toolbar>
    </q-header>

    <q-drawer
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
          <q-item-section avatar>
            <q-icon name="note" />
          </q-item-section>
          <q-item-section>Bloc-notes</q-item-section>
        </q-item>

        <q-item
          clickable
          @click="goTo(routePath.listgames)"
          :active="route.path === '/listgames'"
          active-class="text-primary"
        >
          <q-item-section avatar>
            <q-icon name="games" />
          </q-item-section>
          <q-item-section>Jeux</q-item-section>
        </q-item>

        <q-item
          clickable
          @click="goTo(routePath.drawingboard)"
          :active="route.path === '/drawingboard'"
          active-class="text-primary"
        >
          <q-item-section avatar>
            <q-icon name="draw" />
          </q-item-section>
          <q-item-section>Tableau blanc</q-item-section>
        </q-item>

        <q-item
          clickable
          @click="goTo(routePath.calculator)"
          :active="route.path === '/calculator'"
          active-class="text-primary"
        >
          <q-item-section avatar>
            <q-icon name="calculate" />
          </q-item-section>
          <q-item-section>Calculatrice</q-item-section>
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
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();
const route = useRoute();
const leftDrawerOpen = ref(true);

const goTo = (uri: string) => {
  void router.push(uri);
};
</script>
