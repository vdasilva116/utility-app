<template>
  <q-page class="q-pa-md">
    <div class="q-mb-md row items-end q-gutter-sm">
      <q-input
        v-model="newItem"
        label="Ajouter un produit"
        @keyup.enter="addItem"
        outlined
        class="col"
        dense
      />
      <q-checkbox v-model="isPromo" label="Promo" />
      <q-btn label="Ajouter" @click="addItem" color="primary" />
      <q-btn label="Vider la liste" @click="clearList" color="negative" flat />
      <q-btn label="Copier la liste" @click="copyList" color="secondary" flat />
    </div>

    <div v-if="groupedItems.promo.length" class="q-mb-lg">
      <div class="text-h6 q-mb-sm">🟢 En promo</div>
      <q-list bordered separator>
        <q-item v-for="(item, index) in groupedItems.promo" :key="'promo-' + index">
          <q-item-section>{{ capitalize(item.name) }} x{{ item.quantity }}</q-item-section>
          <q-item-section side class="row no-wrap items-center">
            <q-btn dense flat icon="remove" @click="decrementItem(item)" />
            <q-btn dense flat icon="add" @click="incrementItem(item)" />
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <div v-if="groupedItems.regular.length">
      <div class="text-h6 q-mb-sm">🔸 Autres produits</div>
      <q-list bordered separator>
        <q-item v-for="(item, index) in groupedItems.regular" :key="'npromo-' + index">
          <q-item-section>{{ capitalize(item.name) }} x{{ item.quantity }}</q-item-section>
          <q-item-section side class="row no-wrap items-center">
            <q-btn dense flat icon="remove" @click="decrementItem(item)" />
            <q-btn dense flat icon="add" @click="incrementItem(item)" />
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { supabase } from 'boot/supabase';

interface ShoppingItem {
  id?: string;
  name: string;
  promo: boolean;
  quantity: number;
}

const shoppingItems = ref<ShoppingItem[]>([]);

const newItem = ref('');
const isPromo = ref(false);

const groupedItems = computed(() => {
  const promo: ShoppingItem[] = [];
  const regular: ShoppingItem[] = [];
  for (const item of shoppingItems.value) {
    if (item.promo) promo.push(item);
    else regular.push(item);
  }
  return { promo, regular };
});

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

async function addItem() {
  const trimmed = newItem.value.trim();
  if (!trimmed) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const existing = shoppingItems.value.find(
    (item) => item.name.toLowerCase() === trimmed.toLowerCase() && item.promo === isPromo.value,
  );

  if (existing) {
    existing.quantity++;
    await supabase
      .from('shopping_items')
      .update({ quantity: existing.quantity })
      .eq('id', existing.id);
  } else {
    const newEntry: ShoppingItem = {
      name: trimmed,
      promo: isPromo.value,
      quantity: 1,
    };
    const { data } = await supabase
      .from('shopping_items')
      .insert({ ...newEntry, user_id: user.id })
      .select()
      .single();

    if (data) {
      shoppingItems.value.push(data);
    }
  }

  newItem.value = '';
  isPromo.value = false;
}

async function incrementItem(item: ShoppingItem) {
  item.quantity++;
  await supabase.from('shopping_items').update({ quantity: item.quantity }).eq('id', item.id);
}

async function decrementItem(item: ShoppingItem) {
  if (item.quantity > 1) {
    item.quantity--;
    await supabase.from('shopping_items').update({ quantity: item.quantity }).eq('id', item.id);
  } else {
    shoppingItems.value = shoppingItems.value.filter((i) => i.id !== item.id);
    await supabase.from('shopping_items').delete().eq('id', item.id);
  }
}

async function clearList() {
  shoppingItems.value = [];
  await supabase.from('shopping_items').delete().neq('id', ''); // supprime tout
}

function copyList() {
  const promoItems = shoppingItems.value.filter((i) => i.promo);
  const regularItems = shoppingItems.value.filter((i) => !i.promo);

  const promoText = promoItems.map((i) => `- ${capitalize(i.name)} * ${i.quantity}`).join('\n');
  const regularText = regularItems.map((i) => `- ${capitalize(i.name)} * ${i.quantity}`).join('\n');

  const text =
    (promoText ? '🟢 En promo\n' + promoText + '\n\n' : '') +
    (regularText ? '🔸 Autres produits\n' + regularText : '');

  navigator.clipboard.writeText(text).then(
    () => {
      alert('Liste copiée dans le presse-papiers !');
    },
    () => {
      alert('Erreur lors de la copie de la liste.');
    },
  );
}

onMounted(async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data, error } = await supabase.from('shopping_items').select('*').eq('user_id', user.id);

  if (!error && data) {
    shoppingItems.value = data;
  }
});
</script>

<style scoped>
.text-h6 {
  font-weight: 600;
}
</style>
