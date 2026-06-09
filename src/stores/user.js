import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useUserStore = defineStore(
  'user',
  () => {
    const token = ref('');
    const userInfo = ref({});

    const isLoggedIn = computed(() => Boolean(token.value));
    const userType = computed(() => userInfo.value?.userType);

    const setUser = (payload = {}) => {
      token.value = payload.token || '';
      userInfo.value = payload.userInfo || {};
    };

    const clearUser = () => {
      token.value = '';
      userInfo.value = {};
    };

    return {
      token,
      userInfo,
      isLoggedIn,
      userType,
      setUser,
      clearUser,
    };
  },
  {
    persist: {
      key: 'ai-vue-user',
      pick: ['token', 'userInfo'],
    },
  },
);
