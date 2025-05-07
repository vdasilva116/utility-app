import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        redirect: '/calendar',
      },
      { path: 'home', component: () => import('pages/IndexPage.vue') },
      { path: 'calendar', component: () => import('pages/MealCalendar.vue') },
      { path: 'shopping', component: () => import('pages/ShoppingListPage.vue') },
      { path: 'listnote', component: () => import('pages/ListNote.vue') },
      { path: 'notepad/:index', component: () => import('pages/BlocNote.vue'), props: true },
      { path: 'drawingboard', component: () => import('pages/DrawingBoard.vue') },
      { path: 'calculator', component: () => import('pages/CalculatorScientifist.vue') },
      { path: 'listgames', component: () => import('pages/Games/ListGames.vue') },
      { path: 'listgames/tictactoe', component: () => import('pages/Games/TicTacToeGame.vue') },
      { path: 'listgames/snake', component: () => import('pages/Games/SnakeGame.vue') },
      { path: 'listgames/pendu', component: () => import('pages/Games/HangmanGame.vue') },
      { path: 'listgames/memories', component: () => import('pages/Games/MemoriesGame.vue') },
      { path: 'listgames/2048', component: () => import('pages/Games/2048Game.vue') },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
