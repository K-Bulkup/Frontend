import { ref, onMounted } from 'vue';
import { getUser } from '@/composables/api/user/useUserApi';

export function useUser(userId) {
  const user = ref(null);
  const isLoading = ref(false);

  async function load() {
    isLoading.value = true;
    try {
      const res = await getUser(userId);
      user.value = res.data;
    } catch (e) {
      console.error('유저 불러오기 실패:', e);
    } finally {
      isLoading.value = false;
    }
  }

  onMounted(load);
  return { user, isLoading };
}
