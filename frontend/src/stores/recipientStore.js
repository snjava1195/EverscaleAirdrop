import { defineStore } from 'pinia';

export const useRecipientStore = defineStore({
    id: 'recipientStore',
    state: () => ({
        itemsPerPage: 10,
        pagination: [],
        currentPage: 1,
        numberOfPages: 1,
        continuation: {

        },
        isVisible: false,
        listToStorage: [],
    }),
    getters: {
        nextPage: (state) => {
          let temp = state.currentPage;
          if (temp < state.numberOfPages) {
            return temp == state.numberOfPages ? temp : temp + 1;
          } else {
            return temp;
          }
        },
        prevPage: (state) => {
          if (state.currentPage >= 1) {
            let temp = state.currentPage;
            return temp <= 1 ? temp : temp - 1;
          }
        },
        getExistingPage: (state) => {
          // console.log(`Get Existing Page`);
          return (page) => state.pagination.find((p) => p.page === page);
        },
      },
      actions: {
        setNumItemsPerPage (num) {
          // console.log(`Set Num Items Per Page`);
          this.itemsPerPage = num;
        },
        getRecipients(limit, page) {
          // console.log(`Get Recipients`);
          this.numberOfPages = limit;
          // console.log(`Limit of pages: ${limit}`);
          const existingPage = this.currentPage;
          if (page > this.currentPage) {
            if (existingPage !== undefined) {
              this.continuation = existingPage.continuation;
            }
          } else {
            this.getPagination(page);
          }
          this.currentPage = page;
        },
        async updatePagination(page, continuation) {
          // console.log(`Update Pagination`);
          this.pagination.push({
            page: page,
            continuation: continuation,
          });
        },
        async getPagination(page) {
          // console.log(`Get Pagination`);
          const find = this.pagination.find((p) => p.page === page);
          this.continuation = find ? find.continuation : {};
        },
        resetPagination() {
          // console.log(`Reset Pagination`);
          this.pagination = [];
          this.currentPage = 1;
          this.numberOfPages = 1;
          this.continuation = {};
          this.itemsPerPage=10;
        },
        resetState() {
          // console.log(`Reset State`);
          this.resetPagination();
        },
        updateDropdownVisibility() {
          this.isVisible = !this.isVisible;
        },

        // TODO: Save the list of addresses and ammounts
        saveAirdropData(items, addr) {
          console.log('Save Items List');
          // Airdrop data (address and list of recs with amounts)
          var airdropData = {
            contractAddr: addr,
            items: items,
          }
          var data = JSON.stringify(airdropData);
          localStorage.setItem("airdrop", data);
          var parsed = JSON.parse(localStorage.getItem("airdrop"));
          console.log('PARSED Drop:', parsed);

        },
        checkForAirdropInLocalStorage(addr) {
          /// Check if storage has any saved airdrops
          var parsed = JSON.parse(localStorage.getItem("airdrop"));
          if (parsed.contractAddr == addr) {
            return true;
          } false;
        },
        returnAirdropData() {
          var parsed = JSON.parse(localStorage.getItem("airdrop"));
          return parsed;
        },
        removeAirdropFromStorage(addr) {
          var parsed = JSON.parse(localStorage.getItem("airdrop"));
          if (parsed.contractAddr == addr) {
            localStorage.removeItem("airdrop");
          }
          // localStorage.removeItem("airdrop");
          console.log('is removed?', localStorage.getItem("airdrop"));
        },
      },
      // mounted() {
      //   // if (localStorage.airdrops) {
      //     console.log('MOUNTED');
      //     this.listToStorage = JSON.parse(localStorage.airdrops);
      //     // console.log('Saved LIST: ', this.listToStorage);
      //   // }
      // },
});