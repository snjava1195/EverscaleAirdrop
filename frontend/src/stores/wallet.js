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
    itemsPerPage: 10,
  }),
  getters: {
    isLogged: (state) => !!state.profile.address,
    nextPage: (state) => {
      let temp = state.currentPage;
      //state.currentPage = state.currentPage+1;
    //  console.log('On next page: ',state.currentPage);
    console.log('Next page state: ', state);
      return temp + 1;
     //state.currentPage+=1;
    // return state.currentPage;
    },
    prevPage: (state) => {
      if (state.currentPage > 1) {
     //   state.currentPage-=1;
     //return state.currentPage;
        let temp = state.currentPage;
      //  state.currentPage = state.currentPage-1;
        //console.log('On prev page: ',state.currentPage);
        console.log('Prev page state: ', state);
        return temp - 1;
      }
    },
    getItemsPerPage: (state) =>
    {
      return state.itemsPerPage;
    },
    getExistingPage: (state) => {
      console.log('Get page state: ', state);
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
   
    
    async getBalance() {
      const balance = await ever.getBalance(this.profile.address);
      this.profile.balance = balance ? parseInt(balance) / Math.pow(10, 9) : 0;
    },
    async updatePagination(page, continuation) {
      this.pagination.push({
        page: page,
        continuation: continuation,
      });
      console.log('This pagination: ', this.pagination.value);
      //this.currentPage=page;
    },
    async getPagination(page) {
      console.log(this.pagination);
      const find = this.pagination.find((p) => p.page === page);
      console.log('Page pagination from get pagination: ', find);
      this.continuation = find ? find.continuation : {};
      console.log('Continuation pagination from get pagination: ',this.continuation);
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
      this.itemsPerPage = 10;
      this.resetPagination();
      router.push('/');
    },

    
  },
  persist: true,
});
