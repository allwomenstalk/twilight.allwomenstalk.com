exports = async function(arg) {
    const axios = require("axios");
  
    // Input parameters
    const host = arg.host;
    const category = arg.category;
  
    if (!host || !category) {
      throw new Error("Please provide both 'host' and 'category' as arguments");
    }
  
    // Connect to MongoDB
    const collectionList = context.services
      .get("mongodb-atlas")
      .db("gpt")
      .collection("list");
  
    // Find if there is already content for this host and category
    const existingContent = await collectionList.find({ host, category });

    if (existingContent.length > 0) {
        console.log(`Content already exists for category: ${category} and host: ${host}`);
        return existingContent;
    }
    
    console.log(`Generating content for category: ${category} and host: ${host}`);
  
    // OpenAI API call
    const apiUrl = "https://api.openai.com/v1/chat/completions";
    const OPENAI_API_KEY = context.values.get("OPENAI_API_KEY");
    const promptTemplate = `You are agent that creates a list of 10 related topics for topic provided by user.  Preferably listicles style but not 100% of them. Output json in format like 
  [
   {
  
  "title": {title},
  "slug": {seo slug},
  "excerpt": {short except},
  "outline": [
  "Item",
  "Item",
  ...
   ],
  
   },
  ....
  ]
  
  Don't use words 'Introduction" or "Conclusion" in the outline items. 
  Topics should be related but not the same as provided topic, get some variety. 
  Use simple, easy to read language.
  Focus on topics that are not require visuals like photos or illustrations to be informative.`
  
    const payload = {
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: promptTemplate },
        {
          role: "user",
          content: `Generate topics for category "${category}". `
        }
      ],
      temperature: 1,
      max_tokens: 1533,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    };
  
  
    const response = await context.http.post({
              url: "https://api.openai.com/v1/chat/completions",
              headers: {
                  "Authorization": [`Bearer ${context.values.get("OPENAI_API_KEY")}`],
                  "Content-Type": ["application/json"]
              },
              body: JSON.stringify(payload)
          });
  
    console.log(JSON.stringify(response))
    const responseData = EJSON.parse(response.body.text());
    console.log(JSON.stringify(responseData, null, 4))
    content = responseData.choices[0].message.content;
  
    //return content
    
    if (response.statusCode !== 200) {
      console.error("Error calling OpenAI API", response.data);
      throw new Error("Failed to generate content from OpenAI API");
    }
  
  
    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch (err) {
      console.error("Error parsing OpenAI response as JSON", content);
      throw new Error("Invalid response from OpenAI API");
    }
  
    if (!Array.isArray(parsedContent)) {
      throw new Error("Expected an array in OpenAI response");
    }
  
    // Add metadata to parsed content
    parsedContent.forEach(item => {
      item.host = host; // Add host
      item.category = category; // Add category
      item.date = new Date();
    });
  
  
  
    // Bulk upsert into `list` collection
    const bulkOps = parsedContent.map(item => ({
      updateOne: {
        filter: { slug: item.slug },
        update: { $set: item },
        upsert: true
      }
    }));
  
    const bulkResult = await collectionList.bulkWrite(bulkOps);
  
    return parsedContent;
  };
  
  // exports({ host: "vityle.com", category: "Beauty & Wellness" });