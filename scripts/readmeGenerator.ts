import fs from "fs/promises";
import path from "path";
import { config } from "./config";

main();

async function main() {
  const tplContent = await fs.readFile(path.resolve("scripts/tpl.md"), {
    encoding: "utf-8",
  });

  const data = getData();

  const output = render(tplContent, data);

  await fs.writeFile(path.resolve("README.md"), output);
}

function getData() {
  return {
    projects: getRepositoriesString(config.repositories),
    statsProgress: getStatsProgress(100, config.repositories.length),
  };
}

function getStatsProgress(total: number, current: number, length = 50) {
  const finished = "■";

  const unfinished = "□";

  const percentage = current / total;

  const finishedCount = Math.round(percentage * length);
  const unfinishedCount = length - finishedCount;

  const progressBar =
    finished.repeat(finishedCount) + unfinished.repeat(unfinishedCount);

  return [
    // `Progress: ${current} / ${total}`,
    `${progressBar} ${Math.round(percentage * 100)}%`,
  ].join("\n\n");
}

function getRepositoriesString(repos: string[]) {
  const r = repos.map((n) => {
    const [repo, title = ""] = n.split(",");

    return getRepositoryStats(repo.trim(), "0x-jerry", title.trim());
  });

  return r.join("\n");
}

function getRepositoryStats(repo: string, username: string, title: string) {
  return `[![${title}](https://github-readme-stats.vercel.app/api/pin/?username=${username}&repo=${repo})](https://github.com/${username}/${repo})`;
}

function render(tpl: string, data: Record<string, string | number>) {
  const result = tpl.replace(/<!-- (\w+) -->/g, (item) => {
    const key = item.slice("<!-- ".length, -" -->".length);
    return String(data[key] ?? "");
  });

  return result;
}
