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
        listToStorage: []
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
        // of a certain contractAddr in order to refill
        // an undeployed contract if user returns to it
        // to finish the deployment

        saveAirdropList(items, addr) {
          console.log('Save Items List');
          // Airdrop data (address and list of recs with amounts)
          var airdropAddrWList = {
            contractAddr: addr,
            items: items,
          }
          /// Check if storage has any saved airdrops
          if (
            localStorage.listToStorage 
            && this.listToStorage.length == 0
          ) {
            /// Parse the data from storage
            var listFromStorage = JSON.parse(localStorage.listToStorage);
            /// Check if any of the addresses are the same as the current airdrop
            // for (var i = 0; i < listFromStorage.length; i++) {
              /// If yes, add the data to the listToStorage
              // if (listFromStorage[i].contractAddr == addr) {
            this.listToStorage = listFromStorage.slice();
              // }
            // }
            console.log('STORAGE list at startup: ',  JSON.parse(localStorage.listToStorage));
            console.log('The current list after slice', this.listToStorage);

            /// Delete storage data
            // for (var i = 0; i < listFromStorage.length; i++) {
            //   localStorage.removeItem('listToStorage');
            // }
          }
          /// Add or update airdrop storage data
          if (this.listToStorage.length !== 0) {
            console.log('Start');
            for (let i = 0; i < this.listToStorage.length; i++) {
              console.log('For');
              /// Check to see if old data is present and remove it
              if (addr == this.listToStorage[i].contractAddr) {
                this.listToStorage.splice(i, 1);
                console.log('List item removed: ', this.listToStorage[i]);
              }
            }
            /// Add new data to the storage
            this.listToStorage.push(airdropAddrWList);
            localStorage.listToStorage = JSON.stringify(this.listToStorage);
          } else {
            this.listToStorage.push(airdropAddrWList);
            localStorage.listToStorage = JSON.stringify(this.listToStorage);
          }
          console.log('Added list item: ', this.listToStorage);
          console.log('SAVED IN LOCAL STORAGE: ', localStorage.listToStorage);
        },

        returnAirdropList(addr) {
          for(var i = 0; i < this.listToStorage.length; i++) {
            if (addr == this.listToStorage[i].contractAddr) {
              return this.listToStorage[i];
            }
          }
        },
        returnLastList() {
          var klol;
          if (this.listToStorage == []) {
            klol = {
              contractAddr: addr,
              items: items,
            };
          } else {
            klol = this.listToStorage[this.listToStorage.length - 1];
          }
          return klol;
        },
        removeListItem(addr) {
          for(var i = 0; i < this.listToStorage.length; i++) {
            if (addr == this.listToStorage[i].contractAddr) {
              this.listToStorage.splice(i, 1);
            }
          }
        },
        clearItemsList() {
          this.listToStorage.splice();
        }
      },
      mounted() {
        if (localStorage.listToStorage) {
          // this.listToStorage = localStorage.listToStorage;
          console.log('Saved LIST: ', this.listToStorage);
        }
      },
});