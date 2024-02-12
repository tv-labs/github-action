const core = require("@actions/core");
const github = require("@actions/github");
const exec = require("@actions/exec");
const fs = require("fs");

const tvlabs_cli = "/usr/bin/tvlabs";

async function run() {
  try {
    const githubToken = core.getInput("github-token");
    const octokit = github.getOctokit(githubToken);

    // Assuming tvlabs outputs its results to a file named results.txt
    const outputFile = "./results.txt";
    await exec.exec(`${tvlabs_cli} > ${outputFile}`);

    const results = fs.readFileSync(outputFile, { encoding: "utf8" });

    const context = github.context;
    if (context.payload.pull_request == null) {
      core.setFailed("No pull request found.");
      return;
    }
    const prNumber = context.payload.pull_request.number;
    const repoName = context.repo.repo;
    const ownerName = context.repo.owner;

    const commentBody = `## TV Labs Results\n\`\`\`\n${results}\n\`\`\``;
    await octokit.rest.issues.createComment({
      owner: ownerName,
      repo: repoName,
      issue_number: prNumber,
      body: commentBody,
    });
  } catch (error) {
    core.setFailed(`Action failed with error ${error}`);
  }
}

run();
