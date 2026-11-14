import { createClient } from "@libsql/client/web";

const url =
  process.env.TURSO_DATABASE_URL ||
  "libsql://top-filmes-leolemosdevs.aws-sa-east-1.turso.io";

const authToken =
  process.env.TURSO_AUTH_TOKEN ||
  "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTQ2OTU2NjEsImlkIjoiMDFhMWRjMjctMDMwMS03ODIxLTkxNDUtMTdiN2U0YjU2YTIwIiwia2lkIjoiR0JNOGVIdkpwVVY2bWVJNXZxQ1d0UzZVQXJ4Q1h5YnhYSEZET3BqZXZ1ayIsInJpZCI6IjhkNTIwZDAwLWYyODctNGZkOS1hYWNlLWM4MmE4ZTY5M2I5MyJ9.m5abhxYFlOHAvUReIC0Ceie7VqmLzXtFoS6sdqPWRX_olO3cDZClorPv7LXCsWmQJ971LxzJYgSSfX4ks8xZBw";

export const db = createClient({
  url,
  authToken,
});
