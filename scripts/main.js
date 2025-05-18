require('dotenv').config();
const { fetchAllFeedback } = require('./fetchFeedback');
const { extractPainPoints } = require('./analyseFeedback');

async function run() {
  const feedbackItems = await fetchAllFeedback();

  for (let item of feedbackItems.slice(0, 5)) {
    console.log('From:', item.source);
    console.log('Title:', item.title);
    console.log('URL:', item.url);
    const painPoint = await extractPainPoints('${item.title}\n\n${item.body}');
    console.log('Pain Point:', painPoint);
    console.log('------------------------\n');
  }
}

run();