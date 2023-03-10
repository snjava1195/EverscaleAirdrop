import { parse } from '@vue/compiler-dom';
import { defineStore } from 'pinia';

export const useRecipientStore = defineStore({
  id: 'recipientStore',
  state: () => ({
    itemsPerPage: 10,
    pagination: [],
    currentPage: 1,
    numberOfPages: 1,
    continuation: {},
    isVisible: false,
    listToStorage: [],
    tokensList: [],
  }),

  mounted() {
    //console.log(`Mounting the component triggered`);
  },

  // beforeDestroy() {
  //   console.log('Before destroy triggered');
  // },

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
    setNumItemsPerPage(num) {
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
      this.itemsPerPage = 10;
    },
    resetState() {
      // console.log(`Reset State`);
      this.resetPagination();
    },
    updateDropdownVisibility() {
      this.isVisible = !this.isVisible;
    },

    // TODO: Save the list of addresses and ammounts
    saveAirdropData(items, addr, step, TR, giverTXId, deployTXId, airdropName, nonce) {
      //  console.log('Save Airdrop To List');
      // Airdrop data (address and list of recs with amounts)
      let airdropData = {
        contractAddr: addr,
        step: step,
        tokenRootAddr: TR,
        giverTXId: giverTXId,
        deployTXId: deployTXId,
        items: items,
        airdropName: airdropName,
        date: Math.round(Date.now() / 1000),
        nonce: nonce,
      };
      //console.log('should be empty -> ', localStorage.getItem('00123lalala'));
      let doesListExist = localStorage.getItem('airdropsListData');
      console.log('Does airdrop list exist? save new airdrop: ', doesListExist);
      // Check does the list of unfinished airdrops exist
      if (doesListExist !== null) {
        let parsed = JSON.parse(localStorage.getItem('airdropsListData'));
        // Search if the an airdrop with the same addr exists, and remove it
        for (let i = 0; i < parsed.length; i++) {
          if (parsed[i].contractAddr == addr) {
            parsed.splice(i, 1);
          }
        }
        // Update the list and add it to storage
        parsed.push(airdropData);
        let data = JSON.stringify(parsed);
        localStorage.setItem('airdropsListData', data);
        // Ff the list doesn't exist in memory, create it
      } else {
        let unfinishedAirdropsList = [];
        unfinishedAirdropsList.push(airdropData);
        // Prepare the list of airdrops to be added to memory as a string
        let data = JSON.stringify(unfinishedAirdropsList);
        // Added to memory
        localStorage.setItem('airdropsListData', data);
      }
      // Retrieve it and print just to check
      //let parsed = JSON.parse(localStorage.getItem('airdropsListData'));
      //console.log('PARSED Drop: ', parsed);
    },
    checkForAirdropInLocalStorage(addr) {
      /// Check if storage has any saved airdrops
      let doesListExist = localStorage.getItem('airdropsListData');
      //console.log('Does airdrop list exist? check for airdrop: ', doesListExist);
      let trueOrFalse = false;
      if (doesListExist == null) {
        trueOrFalse = false;
      } else {
        let parsed = JSON.parse(localStorage.getItem('airdropsListData'));
        for (let i = 0; i < parsed.length; i++) {
          if (parsed[i].contractAddr == addr) {
            trueOrFalse = true;
          }
        }
      }
      if (addr == null) {
        //console.log('No Address given, so false!');
        trueOrFalse = false;
      }
      //console.log('Does airdrop list exist - yes or no: ', trueOrFalse);
      return trueOrFalse;
    },
    returnAirdropData(addr) {
      let parsed = JSON.parse(localStorage.getItem('airdropsListData'));
      let data;
      for (let i = 0; i < parsed.length; i++) {
        if (parsed[i].contractAddr == addr) {
          data = parsed[i];
        }
      }
      //console.log('Returned airdrop data: ', data);
      return data;
    },
    removeAirdropFromStorage(addr) {
      let parsed = JSON.parse(localStorage.getItem('airdropsListData'));
      for (let i = 0; i < parsed.length; i++) {
        if (parsed.contractAddr == addr) {
          parsed.splice(i, 1);
          //  console.log(
          //  'Splice the parsed list in order to remove the airdrop: ',
          //parsed,
          //);
          let data = JSON.stringify(parsed);
          //console.log('Data after spliced parsed list :', data);
          localStorage.setItem('airdropsListData', data);
        }
      }
      //console.log('is removed?', localStorage.getItem("airdropsListData"));
    },

    removeDeployed(address) {
      let parsed = JSON.parse(localStorage.getItem('airdropsListData'));
      for (let i = 0; i < parsed.length; i++) {
        if (parsed[i].contractAddr == address) {
          console.log('nasao adresu');
          parsed.pop(i);
          console.log('parsed: ', parsed);
          localStorage.removeItem('airdropsListData');
          if (parsed.length > 0) {
            localStorage.setItem('airdropsListData', JSON.stringify(parsed));
          }
        }
      }
    },
    removeAllAirdrops() {
      localStorage.removeItem('airdropsListData');
      //console.log('Airdrops in storage deleted: ', localStorage.getItem('airdropsListData'));
    },
    // Save single airdrop if user refreshes page before deploying
    saveSingleAirdrop(data) {
      let dataToStorage = JSON.stringify(data);
      localStorage.setItem('AirdropBackup', dataToStorage);
      //console.log('Saved single airdrop', localStorage.getItem('AirdropBackup'));
    },
    readSingleAirdrop() {
      if (localStorage.getItem('AirdropBackup') !== null) {
        //console.log('Read single airdrop', localStorage.getItem('AirdropBackup'));
        return JSON.parse(localStorage.getItem('AirdropBackup'));
      } else {
        return null;
      }
    },
    removeSingleAirdrop() {
      localStorage.removeItem('AirdropBackup');
      //console.log('Removed single airdrop',
      //localStorage.getItem('AirdropBackup')
      //);
    },
    saveTokensList(list) {
      this.tokensList = list;
    },
  },
});
