<script setup>
import { defineEmits } from 'vue'

const emit = defineEmits(['close'])

const handleConfirm = () => {
  emit('close')
}
</script>

<template>
  <!-- Modal Overlay -->
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-realBlack">
    <!-- Modal Content -->
    <div class="w-full max-w-sm mx-8 bg-realBlack flex flex-col items-center px-8 py-12">
      <!-- Check Mark Icon -->
      <div class="w-15 h-15 mb-6 flex items-center justify-center">
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="30" cy="30" r="30" fill="#4CAF50"/>
          <path d="M25 30L28 33L35 26" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>

      <!-- Success Message -->
      <h2 class="text-title font-bold text-gray-50 text-center mb-16">
        자산 연동이 성공하였습니다
      </h2>

      <!-- Confirm Button -->
      <button
        @click="handleConfirm"
        class="w-full h-12 bg-black border border-gray-100 rounded-xl text-heading font-semibold text-white hover:opacity-80 transition-opacity"
      >
        확인
      </button>
    </div>
  </div>
</template>
