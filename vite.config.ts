export default {
  build: {
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react-dom/client',
        'react-router-dom',
        '@google/genai',
        '@supabase/supabase-js',
        'lucide-react'
      ]
    }
  }
}
