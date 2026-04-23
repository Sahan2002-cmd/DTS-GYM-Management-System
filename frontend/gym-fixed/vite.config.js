import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // '/User':                  { target: 'https://localhost:44305', changeOrigin: true, secure: false },
      // '/Member':                { target: 'https://localhost:44305', changeOrigin: true, secure: false },
      // '/Trainer':               { target: 'https://localhost:44305', changeOrigin: true, secure: false },
            '/User':                  { target: 'https://localhost:44305', changeOrigin: true, secure: false },
      '/Member':                { target: 'https://localhost:44305', changeOrigin: true, secure: false },
      '/Trainer':               { target: 'https://localhost:44305', changeOrigin: true, secure: false },
      '/TrainerAssignment':     { target: 'https://localhost:44305', changeOrigin: true, secure: false },
      '/RfidTag':               { target: 'https://localhost:44305', changeOrigin: true, secure: false },
      '/Attendance':            { target: 'https://localhost:44305', changeOrigin: true, secure: false },
      '/Plan':                  { target: 'https://localhost:44305', changeOrigin: true, secure: false },
      '/Subscription':          { target: 'https://localhost:44305', changeOrigin: true, secure: false },
      '/Payment':               { target: 'https://localhost:44305', changeOrigin: true, secure: false },
      '/TimeSlot':              { target: 'https://localhost:44305', changeOrigin: true, secure: false },
      '/TrainerTimeSlot':       { target: 'https://localhost:44305', changeOrigin: true, secure: false },
      '/Schedule':              { target: 'https://localhost:44305', changeOrigin: true, secure: false },
      '/Equipment':             { target: 'https://localhost:44305', changeOrigin: true, secure: false },
      '/EquipmentAssignment':   { target: 'https://localhost:44305', changeOrigin: true, secure: false },
      '/EquipmentUsageLog':     { target: 'https://localhost:44305', changeOrigin: true, secure: false },
      '/Exercise':              { target: 'https://localhost:44305', changeOrigin: true, secure: false },
      '/NonEquipmentExercise':  { target: 'https://localhost:44305', changeOrigin: true, secure: false },
      '/Report':                { target: 'https://localhost:44305', changeOrigin: true, secure: false },
      '/Uploads':               { target: 'https://localhost:44305', changeOrigin: true, secure: false },
      '/Complaint':             { target: 'https://localhost:44305', changeOrigin: true, secure: false },
      '/Device':                { target: 'https://localhost:44305', changeOrigin: true, secure: false },
      '/ParQ':                  { target: 'https://localhost:44305', changeOrigin: true, secure: false },
    },
  },
});
