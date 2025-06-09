const env = {
    backendUrl: String(import.meta.env.VITE_BACKEND_URL), // endpoint
    supabaseUrl: String(import.meta.env.VITE_SUPABASE_DB_URL),
}
export default env