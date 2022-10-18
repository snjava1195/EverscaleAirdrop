import { defineStore } from 'pinia';
import { ProviderRpcClient } from 'everscale-inpage-provider';
import router from '@/router';
import { useAirdropStore } from '@/stores/airdrop';
const ever = new ProviderRpcClient();

export const useWalletStore = defineStore({
  id: 'wallet',
  state: () => ({
    profile: {
      address: null,
      balance: 0,
      transactions: null,
      loading: false,
    },
    pagination: [],
    currentPage: 1,
    continuation: {},
  }),
  getters: {
    isLogged: (state) => !!state.profile.address,
    nextPage: (state) => {
      let temp = state.currentPage;
      return temp + 1;
    },
    prevPage: (state) => {
      if (state.currentPage > 1) {
        let temp = state.currentPage;
        return temp - 1;
      }
    },
    getExistingPage: (state) => {
      return (page) => state.pagination.find((p) => p.page === page);
    },
  },
  actions: {
    async login() {
      const airdropStore = useAirdropStore();
      try {
        if (!(await ever.hasProvider())) {
          throw new Error('Extension is not installed');
        }
        await ever.ensureInitialized();
        const { accountInteraction } = await ever.requestPermissions({
          permissions: ['basic', 'accountInteraction'],
        });
        if (accountInteraction == null) {
          throw new Error('Insufficient permissions');
        }
        this.profile.loading = true;
        this.profile.address = accountInteraction.address._address;
        await this.getBalance();
        return accountInteraction.address;
      } catch (e) {
        console.log('e: ', e);
      }
    },
    async logout() {
      if (!(await ever.hasProvider())) {
        throw new Error('Extension is not installed');
      }
      await ever.ensureInitialized();
      const { accountInteraction } = await ever.rawApi.disconnect({
        permissions: ['basic', 'accountInteraction'],
      });
      this.resetState();

      return accountInteraction;
    },
   
    async getTransactions(limit, page) {
      const existingPage = this.getExistingPage(page);
      if (page > this.currentPage) {
        if (existingPage !== undefined) {
          this.continuation = existingPage.continuation;
        }
      } else {
        await this.getPagination(page);
      }
      this.currentPage = page;

      try {
        this.profile.transactions = await ever.getTransactions({
          address: this.profile.address,
          ...(Object.keys(this.continuation).length !== 0 && {
            continuation: { hash: this.continuation.hash, lt: this.continuation.lt },
          }),
          limit: limit,
        });
        const existingPage = this.getExistingPage(this.nextPage);
        if (existingPage === undefined) {
          await this.updatePagination(this.nextPage, this.profile.transactions.continuation);
        }
        this.profile.loading = false;
      } catch (e) {
        console.log('e: ', e);
        this.loading = false;
      }
      console.log(this.profile.transactions);
    },
    async getBalance() {
      const balance = await ever.getBalance(this.profile.address);
      this.profile.balance = balance ? parseInt(balance) / Math.pow(10, 9) : 0;
    },
    async updatePagination(page, continuation) {
      this.pagination.push({
        page: page,
        continuation: continuation,
      });
    },
    async getPagination(page) {
      const find = this.pagination.find((p) => p.page === page);
      this.continuation = find ? find.continuation : {};
    },
    resetPagination() {
      this.pagination = [];
      this.currentPage = 1;
      this.continuation = {};
    },
    resetState() {
      this.profile = {
        address: null,
        balance: 0,
        transactions: null,
        loading: false,
      };
      this.resetPagination();
      router.push('/');
    },

    

    

    
  },
  persist: true,
});
