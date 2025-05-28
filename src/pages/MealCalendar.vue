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

    <div class="calendar-container">
      <div class="calendar-header">
        <q-btn icon="chevron_left" @click="prevMonth" flat />
        <div class="calendar-title">{{ monthName }} {{ currentDate.getFullYear() }}</div>
        <q-btn icon="chevron_right" @click="nextMonth" flat />
      </div>

      <div class="calendar-grid">
        <div v-for="(day, i) in daysOfWeek" :key="'head-' + i" class="calendar-day-header">
          {{ day }}
        </div>

        <div
          v-for="(day, index) in calendarDays"
          :key="'day-' + index"
          class="calendar-cell"
          :class="{ 'not-current-month': day.getMonth() !== currentDate.getMonth() }"
        >
          <div class="cell-header">
            <span>{{ day.getDate() }}</span>
          </div>

          <div class="cell-tasks">
            <div v-for="task in dateTasks(getDateKey(day))" :key="task.id" class="task">
              <q-icon
                name="remove_circle"
                size="16px"
                color="negative"
                class="q-mr-xs cursor-pointer"
                @click="removeTask(task.id)"
              />
              <span>{{ task.content }}</span>
            </div>
          </div>

          <q-input
            v-if="day.getMonth() === currentDate.getMonth()"
            type="textarea"
            dense
            autogrow
            :model-value="meals[getDateKey(day)]?.lunch ?? ''"
            @update:model-value="(value) => saveMeal(getDateKey(day), 'lunch', String(value ?? ''))"
            placeholder="Midi"
            class="q-mt-xs"
          />

          <q-input
            v-if="day.getMonth() === currentDate.getMonth()"
            type="textarea"
            dense
            autogrow
            :model-value="meals[getDateKey(day)]?.dinner ?? ''"
            @update:model-value="
              (value) => saveMeal(getDateKey(day), 'dinner', String(value ?? ''))
            "
            placeholder="Soir"
            class="q-mt-xs"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { supabase } from 'boot/supabase';

interface MealEntry {
  lunch: string;
  dinner: string;
}

interface MealRow {
  id: string;
  date: string;
  lunch: string | null;
  dinner: string | null;
}

interface TaskItem {
  id: string;
  date: string;
  content: string;
}

const meals = ref<Record<string, MealEntry>>({});
const tasks = ref<TaskItem[]>([]);
const currentDate = ref(new Date());
const newTaskText = ref('');
const selectedDayKey = ref<string>('');
const daysOfWeek = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI', 'DIMANCHE'];

function getDateKey(date: Date): string {
  return date.toISOString().split('T')[0] ?? '';
}

function dateTasks(dateKey: string) {
  const currentMonth = currentDate.value.getMonth();
  return tasks.value.filter((t) => {
    const taskDate = new Date(t.date);
    return t.date === dateKey && taskDate.getMonth() === currentMonth;
  });
}

async function saveMeal(date: string, field: 'lunch' | 'dinner', value: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const existing = meals.value[date] ?? { lunch: '', dinner: '' };
  existing[field] = value;
  meals.value[date] = existing;

  const { data: found } = await supabase
    .from('meals')
    .select('id')
    .eq('user_id', user.id)
    .eq('date', date)
    .maybeSingle();

  if (found?.id) {
    await supabase
      .from('meals')
      .update({ [field]: value })
      .eq('id', found.id);
  } else {
    await supabase.from('meals').insert({
      user_id: user.id,
      date,
      [field]: value,
    });
  }
}

async function addTask() {
  const content = newTaskText.value.trim();
  const date = selectedDayKey.value;
  if (!content || !date) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data, error } = await supabase
    .from('tasks')
    .insert([{ user_id: user.id, date, content }])
    .select()
    .single();

  if (!error && data) {
    tasks.value.push(data);
  }

  newTaskText.value = '';
  selectedDayKey.value = '';
}

async function removeTask(id: string) {
  tasks.value = tasks.value.filter((t) => t.id !== id);
  await supabase.from('tasks').delete().eq('id', id);
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

onMounted(async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data: mealData } = await supabase.from('meals').select('*').eq('user_id', user.id);

  meals.value = {};
  mealData?.forEach((m: MealRow) => {
    meals.value[m.date] = {
      lunch: m.lunch || '',
      dinner: m.dinner || '',
    };
  });

  const { data: taskData } = await supabase.from('tasks').select('*').eq('user_id', user.id);

  tasks.value = taskData ?? [];
});
</script>

<style scoped>
.calendar-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.calendar-title {
  font-weight: bold;
  font-size: 18px;
  text-transform: capitalize;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.calendar-day-header {
  text-align: center;
  font-weight: 600;
  padding: 6px 0;
  background: #f0f0f0;
}

.calendar-cell {
  border: 1px solid #ccc;
  min-height: 180px;
  padding: 4px;
  display: flex;
  flex-direction: column;
  font-size: 12px;
  background: white;
}

.not-current-month {
  background-color: #f9f9f9;
  color: #bbb;
}

.cell-header {
  font-weight: bold;
  margin-bottom: 4px;
}

.cell-tasks {
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 60px;
  overflow-y: auto;
}

.task {
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>
