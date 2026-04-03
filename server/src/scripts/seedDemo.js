import { initialiseRepositories } from "../config/db.js";
import { ensureDemoAccount } from "../services/demo.service.js";

const { repositories, mode } = await initialiseRepositories();
const account = await ensureDemoAccount(repositories);

console.log(`Seeded Suraksha demo account in ${mode} mode.`);
console.log(`Email: ${account.credentials.email}`);
console.log(`Password: ${account.credentials.password}`);
