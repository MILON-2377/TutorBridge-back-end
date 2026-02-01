import config from "../config/index.js";
import { betterAuth } from "better-auth";
import prisma from "./prisma.js";
import { prismaAdapter } from "better-auth/adapters/prisma";

const auth = betterAuth({
  baseURL: config.base_url,
  trustedOrigins: [`${config.cors_origin}`],
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
});

export default auth;
