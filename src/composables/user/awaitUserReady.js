import { useAuthStore } from "@/stores/auth";
import { storeToRefs } from "pinia";
import { watch } from "vue";

export async function awaitUserReady() {
  const authStore = useAuthStore();
  const { userId } = storeToRefs(authStore);

  if (userId.value) return userId.value;

  return await new Promise((resolve) => {
    const stop = watch(userId, (val) => {
      if (val) {
        stop();
        resolve(val);
      }
    });
  });
}
