# community-agent
A teams chatbot that can fetch and summarize developer pain points from GitHub, Stack Overflow, or both


**## What does the project do?**

- Lets you chat with a bot inside Microsoft Teams.
- The bot can collect feedback and questions from developers on GitHub and Stack Overflow.
- It finds and summarizes the main problems or “pain points” developers are facing, using Open AI
- Shows you a table of these issues using Adaptive Cards and groups them by common RCAs.
- Makes it easy for Teams users to see what developers are struggling with, all in one place.


## **What does each project file do?**

### `scripts/fetchFeedback.js`
*Fetches developer feedback from GitHub and Stack Overflow APIs.*
- Uses `axios` to call GitHub and Stack Overflow endpoints.
- Maps API responses to a common feedback object format.
- Exports a function to get all feedback combined.

### `scripts/analyseFeedback.js`
*Analyzes feedback text to extract main developer pain points (using OpenAI or local LLM).*
- Builds a prompt for the language model.
- Calls the model API (OpenAI or local) with the prompt and feedback.
- Returns the summarized pain points.

### `teamsBot.js`
*Implements the Teams bot logic for fetching, analyzing, and displaying feedback in Teams.*
- Listens for messages in Teams (e.g., "show insights").
- Fetches feedback and displays it as an Adaptive Card.
- Optionally analyzes pain points and groups issues by them.
- Sends results back to the Teams chat.