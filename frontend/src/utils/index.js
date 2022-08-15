import BigNumber from 'bignumber.js';
import { notify } from '@kyvg/vue3-notification';
import { useWalletStore } from '@/stores/wallet';
const addressRegex = '^(0|-1):[0-9a-fA-F]{64}$';
const amountRegex = '^\\d+(\\.\\d+)?$';

export const toNano = (amount) => new BigNumber(amount).shiftedBy(9).toFixed(0);

export const addressReg = new RegExp(addressRegex);
export const amountReg = new RegExp(amountRegex);

export const getRandomNonce = () => (Math.random() * 64000) | 0;

export const validateAddressAmountList = (arr, totalTokens) => {
  const walletStore = useWalletStore();
  if (arr.length > 0) {
    for (let i = 0; i < arr.length; i++) {
      const row = arr[i];
      if (!row.amount && row.address) {
        notify({
          text: `Missing amount in row: ${i + 1}`,
          type: 'error',
        });
        return false;
      }
      if (!amountReg.test(row.amount) && row.address) {
        notify({
          text: `Incorrect amount format in row: ${i + 1}'`,
          type: 'error',
        });
        return false;
      }
      if (!row.address && row.amount) {
        notify({
          text: `Missing address in row: ${i + 1}`,
          type: 'error',
        });
        return false;
      }
      if (!addressReg.test(row.address) && row.amount) {
        notify({
          text: `Incorrect address format in row: ${i + 1}`,
          type: 'error',
        });
        return false;
      }
    }
  } else {
    notify({
      text: 'Please enter transfer data',
      type: 'error',
    });
    return false;
  }
  if (totalTokens > walletStore.profile.balance) {
    notify({
      text: 'Insufficient funds',
      type: 'error',
    });
    return false;
  }
  return true;
};
