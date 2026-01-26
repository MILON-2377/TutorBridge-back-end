import { betterAuth } from "better-auth";
import prisma from "./prisma.js";
import { prismaAdapter } from "better-auth/adapters/prisma";



const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql"
    }),
    emailAndPassword: {
        enabled: true
    }
});


export default auth;