import { githubFetch } from "../src/github";

async function test() {
  const res = await githubFetch(
    "https://api.github.com/rate_limit"
  );
  console.log("GitHub OK:", res.resources.core.remaining);
}

test();