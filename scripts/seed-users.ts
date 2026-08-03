import fs from "node:fs";

for (const line of fs.readFileSync(".env", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
  if (m) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
}

const accounts = [
  { name: "Ava Reyes", email: "admin@marketa.dev", password: "password123", role: "admin" },
  { name: "Noor Hassan", email: "seller@marketa.dev", password: "password123", role: "seller" },
  { name: "Liam Chen", email: "buyer@marketa.dev", password: "password123", role: "buyer" },
];

async function main() {
  const { auth } = await import("../src/lib/auth");

  for (const a of accounts) {
    try {
      await auth.api.signUpEmail({
        body: { name: a.name, email: a.email, password: a.password, role: a.role },
      });
      console.log(`created ${a.email} (${a.role})`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/already exists/i.test(msg)) {
        console.log(`skipped ${a.email} — already exists`);
      } else {
        console.log(`failed ${a.email}: ${msg}`);
      }
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
