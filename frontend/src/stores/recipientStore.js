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
          console.log(`Get Existing Page`);
          return (page) => state.pagination.find((p) => p.page === page);
        },
      },
      actions: {
        setNumItemsPerPage (num) {
          console.log(`Set Num Items Per Page`);
          this.itemsPerPage = num;
        },
        getRecipients(limit, page) {
          console.log(`Get Recipients`);
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
          console.log(`Update Pagination`);
          this.pagination.push({
            page: page,
            continuation: continuation,
          });
        },
        async getPagination(page) {
          console.log(`Get Pagination`);
          const find = this.pagination.find((p) => p.page === page);
          this.continuation = find ? find.continuation : {};
        },
        resetPagination() {
          console.log(`Reset Pagination`);
          this.pagination = [];
          this.currentPage = 1;
          this.numberOfPages = 1;
          this.continuation = {};
        },
        resetState() {
          console.log(`Reset State`);
          this.resetPagination();
        },
      }
});