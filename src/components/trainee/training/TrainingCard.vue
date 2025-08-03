<template>
  <div class="training-card">
    <h3 class="title">{{ training.name }}</h3>
    <p class="description">{{ training.description }}</p>
  </div>
</template>

<script>
export default {
  name: "TrainingCard",
  props: {
    training: { type: Object, required: true },
  },
};
</script>

<style scoped>
.training-card {
  background: #1e1e1e; /* ✅ 어두운 회색 카드 */
  color: #fff; /* ✅ 텍스트 흰색 */
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 4px 10px rgba(255, 255, 255, 0.05);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.training-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(255, 255, 255, 0.1);
}

.title {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 8px;
}

.description {
  font-size: 0.9rem;
  color: #ccc; /* ✅ 연한 회색 */
}
</style>
