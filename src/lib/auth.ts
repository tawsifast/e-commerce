import { headers } from "next/headers";
import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { jwt } from "better-auth/plugins";
import type { User } from "./types";

const globalForMongo = globalThis as unknown as { mongoClient?: MongoClient };
const client = globalForMongo.mongoClient ?? new MongoClient(process.env.MONGODB_URI as string);
globalForMongo.mongoClient = client;
const db = client.db("my-shop");

export const auth = betterAuth({
  trustHost: true,
  database: mongodbAdapter(db, {
    // Optional: if you don't provide a client, database transactions won't be enabled.
    client
  }),
  plugins: [jwt()],
  emailAndPassword: { 
    enabled: true, 
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "buyer",
        input: true,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (typeof user.role === "string") {
            user.role = user.role === "seller" ? "seller" : "buyer";
          }
        },
      },
      update: {
        before: async (user) => {
          if (typeof user.role === "string") {
            user.role = user.role === "seller" ? "seller" : "buyer";
          }
        },
      },
    },
  },
});

export async function getSessionUser(): Promise<User | null> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return null;
    return {
      _id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: ((session.user as { role?: string }).role ?? "buyer") as User["role"],
      photo: session.user.image ?? undefined,
    };
  } catch {
    return null;
  }
}