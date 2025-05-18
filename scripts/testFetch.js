const { fetchAllFeedback } = require('./fetchFeedback');

fetchAllFeedback().then(data => {
  console.log(data.slice(0, 3)); // print first 3 feedback items
});