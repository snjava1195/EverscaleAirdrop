import { createRouter, createWebHistory } from 'vue-router';
import { useWalletStore } from '@/stores/wallet';
import MainView from '@/views/MainView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Main',
      component: MainView,
    },
    {
      path: '/create-airdrop',
      name: 'CreateAirdrop',
      component: () => import('@/views/CreateAirdropView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    }
  ],
});

router.beforeEach(async (to) => {
  const walletStore = useWalletStore();
  if (
    // make sure the user is authenticated
    !walletStore.isLogged &&
    // ❗️ Avoid an infinite redirect
    to.name !== 'Main'
  ) {
    // redirect the user to the login page
    return { name: 'Main' };
  }
});

export default router;
