const axios = require('axios');

async function fetchGitHubIssues() {
    const url = 'https://api.github.com/repos/MicrosoftDocs/msteams-docs/issues'
    const response = await axios.get(url, {
        headers: { Accept: 'application/vnd.github.v3+json' }
    });
    const issues = response.data.map(issue => ({
      source: 'GitHub',
      title: issue.title,
      body: issue.body,
      url: issue.html_url
    }));
    return issues;
}

async function fetchStackOverflowQuestions() {
  const url = 'https://api.stackexchange.com/2.3/questions?order=desc&sort=activity&tagged=microsoft-teams&site=stackoverflow';
  const response = await axios.get(url);

  const questions = response.data.items.map(q => ({
    source: 'Stack Overflow',
    title: q.title,
    body: q.body || '',
    url: q.link
  }));

  return questions;
}

async function fetchAllFeedback() {
  const github = await fetchGitHubIssues();
  const stackoverflow = await fetchStackOverflowQuestions();
  return [...github, ...stackoverflow];
}

module.exports = { fetchAllFeedback };