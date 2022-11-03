import { defineStore } from 'pinia';

export const useRecipientStore = defineStore({
    id: 'recipientStore',
    state: () => ({
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
          return (page) => state.pagination.find((p) => p.page === page);
        },
      },
      actions: {
        getRecipients(limit, page) {
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
          this.numberOfPages = 1;
          this.continuation = {};
        },
        resetState() {
          this.resetPagination();
        },
      }
});