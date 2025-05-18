const { fetchAllFeedback } = require('./scripts/fetchFeedback');
const { extractPainPoints } = require('./scripts/analyseFeedback');

const { TeamsActivityHandler, TurnContext } = require("botbuilder");

class TeamsBot extends TeamsActivityHandler {
  constructor() {
    super();

    // Listen for incoming messages
    this.onMessage(async (context, next) => {
      const text = context.activity.text.toLowerCase();
      if (text.includes("show insights")) {
        await context.sendActivity("Fetching feedback...");
        const feedbackItems = await fetchAllFeedback();

        // Print fetched feedback using Adaptive Card
        const card = {
          type: "AdaptiveCard",
          version: "1.4",
          body: [
            // Header row
            {
              type: "ColumnSet",
              columns: [
                { type: "Column", width: "stretch", items: [{ type: "TextBlock", text: "Source", weight: "Bolder" }] },
                { type: "Column", width: "stretch", items: [{ type: "TextBlock", text: "Title", weight: "Bolder" }] },
                { type: "Column", width: "stretch", items: [{ type: "TextBlock", text: "Body", weight: "Bolder" }] },
                { type: "Column", width: "auto", items: [{ type: "TextBlock", text: "Link", weight: "Bolder" }] }
              ]
            },
            // Data rows
            ...feedbackItems.slice(0, 5).map(item => ({
            //...feedbackItems.map(item => ({
              type: "ColumnSet",
              columns: [
                { type: "Column", width: "stretch", items: [{ type: "TextBlock", text: item.source.substring(0, 10) }] },
                { type: "Column", width: "stretch", items: [{ type: "TextBlock", text: item.title.substring(0, 40), wrap: true }] },
                { type: "Column", width: "stretch", items: [{ type: "TextBlock", text: (item.body || '').substring(0, 80), wrap: true }] },
                {
                  type: "Column",
                  width: "auto",
                  items: [
                    {
                      type: "Container",
                      selectAction: {
                        type: "Action.OpenUrl",
                        url: item.url
                      },
                      items: [
                        {
                          type: "TextBlock",
                          text: "Link",
                          color: "Accent",
                          weight: "Bolder",
                          wrap: true
                        }
                      ]
                    }
                  ]
                }
              ]
            }))
          ],
          $schema: "http://adaptivecards.io/schemas/adaptive-card.json"
        };

        await context.sendActivity({ attachments: [{ contentType: "application/vnd.microsoft.card.adaptive", content: card }] });

        const topItems = feedbackItems.slice(0, 3); // limit to prevent Open AI Throttling (anticipatory)

        await context.sendActivity("Analyzing feedback...");
        
        // Process each feedback item and show as message
        for (let item of topItems) {
          try {
            const painPoint = await extractPainPoints(`${item.title}\n\n${item.body}`);
            await context.sendActivity(`🔎 **Source:** ${item.source}\n📌 **Pain Point:** ${painPoint}\n🔗 ${item.url}`);
          } catch (err) {
            await context.sendActivity("⚠️ Sorry, I'm unable to analyze feedback right now due to API limits. Please try again later.");
            break;
          }
        }
        
        // Group issues by pain point
        const painPointMap = {};
        for (let item of topItems) {
          let painPoint;
          try {
            painPoint = await extractPainPoints(`${item.title}\n\n${item.body}`);
          } catch (err) {
            painPoint = "Unknown";
          }
          if (!painPointMap[painPoint]) {
            painPointMap[painPoint] = [];
          }
          painPointMap[painPoint].push(item);
        }
        // Show the processed messages as Adaptive Card
        const painCard = {
        type: "AdaptiveCard",
        version: "1.4",
        body: [
          {
            type: "ColumnSet",
            columns: [
              { type: "Column", width: "stretch", items: [{ type: "TextBlock", text: "Pain Point", weight: "Bolder" }] },
              { type: "Column", width: "auto", items: [{ type: "TextBlock", text: "# Issues", weight: "Bolder" }] },
              { type: "Column", width: "stretch", items: [{ type: "TextBlock", text: "Issue Links", weight: "Bolder" }] }
            ]
          },
          ...Object.entries(painPointMap).map(([painPoint, items]) => ({
            type: "ColumnSet",
            columns: [
              { type: "Column", width: "stretch", items: [{ type: "TextBlock", text: painPoint, wrap: true }] },
              { type: "Column", width: "auto", items: [{ type: "TextBlock", text: `${items.length}` }] },
              {
                type: "Column",
                width: "stretch",
                items: [
                  {
                    type: "TextBlock",
                    text: items.map(i => `- [${i.title}](${i.url})`).join('\n'),
                    wrap: true
                  }
                ]
              }
            ]
          }))
        ],
        $schema: "http://adaptivecards.io/schemas/adaptive-card.json"
      };
      await context.sendActivity({ attachments: [{ contentType: "application/vnd.microsoft.card.adaptive", content: painCard }] });

      } 
      else {
        await context.sendActivity("Type *show insights* to get developer pain points.");
      }
      await next();
    });

    // Listen to MembersAdded event, view https://docs.microsoft.com/en-us/microsoftteams/platform/resources/bot-v3/bots-notifications for more events
    this.onMembersAdded(async (context, next) => {
      const membersAdded = context.activity.membersAdded;
      for (let cnt = 0; cnt < membersAdded.length; cnt++) {
        if (membersAdded[cnt].id) {
          await context.sendActivity(`Hi there! I'm a your Teams Community insider!`);
          await context.sendActivity(`Type *show insights* to get top developer pain points.`);
          break;
        }
      }
      await next();
    });
  }
}

module.exports.TeamsBot = TeamsBot;
