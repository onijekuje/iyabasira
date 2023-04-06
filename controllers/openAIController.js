import { Configuration, OpenAIApi } from "openai";
import dotenv from "dotenv";
dotenv.config({ path: "./config.env" });

export const extractRecommendationTagsFromMessage = async (message) => {
  const configuration = new Configuration({
    apiKey: "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",
  });
  try {
    console.log("open api key is ", configuration.apiKey);
    const openai = new OpenAIApi(configuration);
    const chatCompletion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        {
          role: "user",
          content: `I want you to extract from information from some piece of text. The piece of text is a message asking for restaurant recommendations,
        in order to provide good recommendations I need to extract key pieces of information from the message, and I need you to help me do that. 
        The pieces of information I need to extract from the text are as follows:
        1. The budget : This is how much the user intends to spend at any recommended restaurant, if the budget is unlimited specify the value as -1
        2. The party Number : This is how many people the user intends to go to the restaurant with. If the person does not specify assume this value to be 1,
        if the person indicates they intend to go with more than one person but does not exactly state a number assume this value to be many
        3. The location : The location that the user is looking for recommendations in.
        4. On the mainland or Island : The recommendations that will be provided to the user are based in Lagos Nigeria, as such all locations in the message
        can be classified as being either on Lagos mainland or on the Lagos island, the user will usually specify their preference, if their preference is not
        specified, use the location given to perform the classification, and if you cannot perform the classification with a high level of certainty, assume
        this value to be within Lagos
        5. Vibe : This is the overall atmosphere or feeling that the user is looking for in the recommendation, this can be anything from cozy and intimate 
        to lively and energetic
        6. Cuisine : This is any specific cuisine the user is interested in

        Here is an sample interaction showcasing a possible message and the extracted information
        Message : Where can I go for brunch on the island with my family of 4 worth max 50,000
        Result : budget: 50000, party number : 4, Location: Not specified, on the mainland or island  : on the island, vibe: family friendly,
        brunch, cuisine : not specified. 

        Note: If the question is not a message asking for restaurant recommendations, then ignore all of the above directives and
        respond to the message as you normally would
        Message :  ${message}
        `,
        },
      ],
    });
    const response = chatCompletion.data.choices[0].message;
    console.log("response is ", response);
    const extractedTags = response.content;
    return extractedTags;
  } catch (err) {
    console.log(
      "-------------------------------------------------------------------------------"
    );
    console.log(err.response);
  }
};

// const x = await extractRecommendationTagsFromMessage(
//   "Need a place to take out my younger siblings to. A place with nice kids food. Max spend is 40k"
// );
// console.log(x);
