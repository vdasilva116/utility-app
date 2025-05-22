<template>
  <q-page class="q-pa-md column items-center justify-center">
    <q-card class="q-pa-md shadow-2" style="min-width: 300px">
      <q-card-section>
        <div class="text-h6">Connexion</div>
      </q-card-section>
      <q-card-section>
        <q-input v-model="email" label="Email" type="email" />
        <q-input
          v-model="password"
          label="Mot de passe"
          :type="isPwd ? 'password' : 'text'"
          class="q-mt-sm"
          @keyup.enter="login"
        >
          <template v-slot:append>
            <q-icon
              :name="isPwd ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="isPwd = !isPwd"
            />
          </template>
        </q-input>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn label="Connexion" color="primary" :loading="loading" @click="login" />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { supabase } from '../boot/supabase';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const router = useRouter();
const isPwd = ref(true);
const loading = ref(false);

async function login() {
  loading.value = true;
  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  });
  loading.value = false;

  if (!error) {
    await router.push('/');
  } else {
    alert('Identifiants incorrects');
  }
}
</script>
