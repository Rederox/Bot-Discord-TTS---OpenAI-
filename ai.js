const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
    apiKey: "<API_KEY>",
    
});
const openai=new OpenAIApi(configuration);
let conversation="";


var instructions = "\n\n";
async function ask(prompt) {
    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: instructions + conversation + "Human: " + prompt + "\nAI:",
        temperature: 1,
        max_tokens: 256,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0.6,
        stop: [" Human:", " AI:"],
      });
    
    const answer=response.data.choices[0].text;
    conversation+="Human: "+prompt+"\nAI: "+answer+"\n";
    console.log(conversation.length);
    if (conversation.length >= 4000) {
        conversation="";
    }
    return answer;
}

module.exports = {
    ask,
};