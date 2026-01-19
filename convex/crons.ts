import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "crawl-github",
  { minutes: 2 },
  api.indexer.run
);

export default crons;