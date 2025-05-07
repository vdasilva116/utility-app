// MealPlanner - version locale avec localStorage (repas et tâches stockées localement)

<template>
  <q-page class="q-pa-md">
    <div class="row q-mb-sm q-gutter-sm items-center">
      <q-input
        v-model="newTaskText"
        label="Tâche"
        dense
        outlined
        class="col"
        @keyup.enter="addTask"
      />
      <q-select
        v-model="selectedDayKey"
        :options="selectableDays"
        label="Jour"
        dense
        outlined
        class="col"
        map-options
        emit-value
      />
      <q-btn label="Ajouter" dense color="primary" @click="addTask" class="q-pa-sm" />
    </div>

    <div class="row items-center q-mb-md justify-between">
      <q-btn icon="chevron_left" @click="prevMonth" flat />
      <div class="text-h6">{{ monthName }} {{ currentDate.getFullYear() }}</div>
      <q-btn icon="chevron_right" @click="nextMonth" flat />
    </div>

    <div class="row text-center bg-grey-3">
      <div v-for="(day, i) in daysOfWeek" :key="i" class="col text-bold">{{ day }}</div>
    </div>

    <div class="row wrap">
      <div
        v-for="(day, index) in calendarDays"
        :key="index"
        class="meal-cell col-xs-12 col-sm-1 col-md-1 q-pa-sm"
        style="min-height: 190px; border: 1px solid #ccc; overflow: hidden"
      >
        <div class="text-caption text-grey">
          <span v-if="day.getMonth() === currentDate.getMonth()">{{ day.getDate() }}</span>
        </div>

        <div class="text-subtitle2 text-primary q-mb-xs" v-if="dateTasks(getDateKey(day)).length">
          <div
            v-for="task in dateTasks(getDateKey(day))"
            :key="task.id"
            class="ellipsis row items-center no-wrap"
            style="font-size: 12px"
          >
            <q-icon
              name="remove_circle"
              size="16px"
              color="negative"
              class="q-mr-xs cursor-pointer"
              @click="removeTask(task.id)"
            />
            <span v-if="task.content.length > 20">
              <q-tooltip anchor="top middle">{{ task.content }}</q-tooltip>
              - {{ task.content }}
            </span>
            <span v-else>- {{ task.content }}</span>
          </div>
        </div>

        <template v-if="day.getMonth() === currentDate.getMonth()">
          <q-input
            type="textarea"
            autogrow
            dense
            filled
            :model-value="meals[getDateKey(day)]?.lunch ?? ''"
            @update:model-value="(value) => saveMeal(getDateKey(day), 'lunch', String(value ?? ''))"
            placeholder="Midi"
            class="q-mt-xs"
          />

          <q-separator color="grey-4" class="q-my-xs" />

          <q-input
            type="textarea"
            autogrow
            dense
            filled
            :model-value="meals[getDateKey(day)]?.dinner ?? ''"
            @update:model-value="
              (value) => saveMeal(getDateKey(day), 'dinner', String(value ?? ''))
            "
            placeholder="Soir"
            class="q-mt-xs"
          />
        </template>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

interface MealEntry {
  lunch: string;
  dinner: string;
}
interface TaskItem {
  id: number;
  date: string;
  content: string;
}

const currentDate = ref(new Date());
const meals = ref<Record<string, MealEntry>>(JSON.parse(localStorage.getItem('meals') || '{}'));
const tasks = ref<TaskItem[]>(JSON.parse(localStorage.getItem('tasks') || '[]'));
const newTaskText = ref('');
const selectedDayKey = ref<string>('');
const daysOfWeek = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI', 'DIMANCHE'];

watch(
  meals,
  (newVal) => {
    localStorage.setItem('meals', JSON.stringify(newVal));
  },
  { deep: true },
);

watch(
  tasks,
  (newVal) => {
    localStorage.setItem('tasks', JSON.stringify(newVal));
  },
  { deep: true },
);

function getDateKey(date: Date): string {
  return date.toISOString().split('T')[0] ?? '';
}

function dateTasks(dateKey: string) {
  return tasks.value.filter((t) => t.date === dateKey);
}

function saveMeal(date: string, field: 'lunch' | 'dinner', value: string) {
  const meal: MealEntry = meals.value[date] ?? { lunch: '', dinner: '' };
  meal[field] = value;
  meals.value[date] = meal;
}

function addTask() {
  const content = newTaskText.value.trim();
  const date = selectedDayKey.value;
  if (!content || !date) return;
  const newId = Date.now();
  tasks.value.push({ id: newId, date, content });
  newTaskText.value = '';
  selectedDayKey.value = '';
}

function removeTask(id: number) {
  tasks.value = tasks.value.filter((t) => t.id !== id);
}

function getMonthDays(): Date[] {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const days: Date[] = [];
  const startDay = (firstDayOfMonth.getDay() + 6) % 7;
  for (let i = startDay; i > 0; i--) {
    days.push(new Date(year, month, 1 - i));
  }

  for (let d = 1; d <= lastDayOfMonth.getDate(); d++) {
    days.push(new Date(year, month, d));
  }

  const remaining = (7 - (days.length % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    days.push(new Date(year, month + 1, i));
  }

  return days;
}

const calendarDays = computed(() => getMonthDays());
const monthName = computed(() => currentDate.value.toLocaleDateString('fr-FR', { month: 'long' }));

const selectableDays = computed(() =>
  calendarDays.value
    .filter((d) => d.getMonth() === currentDate.value.getMonth())
    .map((d) => ({ label: `${d.getDate()} ${monthName.value}`, value: getDateKey(d) })),
);

function nextMonth() {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1,
    1,
  );
}

function prevMonth() {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() - 1,
    1,
  );
}
</script>

<style scoped>
.meal-cell {
  width: 14.28%;
}
</style>
