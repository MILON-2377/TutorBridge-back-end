import dotenv from 'dotenv';


dotenv.config();


const config = {
    port: process.env.PORT || 5000,
    base_url: process.env.BETTER_AUTH_URL,
    cors_origin: process.env.CORS_ORIGINS
}


export default config;