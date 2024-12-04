# %%
import os
from pymongo import MongoClient
from dotenv import load_dotenv
import sys

import datetime

# Load environment variables from .env file
load_dotenv()

# MongoDB URIs from .env
MONGODB_URI_AWS = os.getenv("MONGODB_URI")  # Connection to 'aws' database
MONGODB_URI_REALM = os.getenv("MONGODB_URI_REALM")  # Connection to 'gpt' database

# category = "love"
category = sys.argv[1]
if not category:
    print("Please provide a category as an argument")
    sys.exit(1)

print(f"Generating content for category: {category}")

# Connect to 'aws' database
client_aws = MongoClient(MONGODB_URI_AWS)
db_aws = client_aws['aws']
collection_posts = db_aws['posts']

# Connect to 'gpt' database
client_realm = MongoClient(MONGODB_URI_REALM)
db_gpt = client_realm['gpt']
collection_list = db_gpt['list']

# Filter and sort posts by seo.clicks
query = {'super_categories': category}  # Filter by travel category
projection = {'post_title': 1, 'url': 1, 'seo':1, 'super_categories':1}  # Project only title, url, and _id
sort_order = [('seo.clicks', -1)]  # Sort by seo.clicks in descending order

# Retrieve top 100 posts
posts = collection_posts.find(query, projection).sort(sort_order).limit(100)

# decare title, id, url
title = ""
postid = ""
url = ""
category = ""
# Loop through the posts
for post in posts:
    post_id = str(post['_id'])  # Convert _id to string
    
    # Check if a document with {postid: _id} exists in the gpt.list collection
    exists = collection_list.find_one({'postid': post_id})
    
    # If not found, output the document and stop the loop
    if not exists:
        print(f"Document not found in gpt.list with postid: {post_id}")
        print(f"Post details: {post}")
        title = post['post_title']
        postid = post_id
        url = post['url']
        category = post['super_categories'][0]
        break  # Stop the loop

# Close the MongoDB connections
client_aws.close()
client_realm.close()

# %%
print(title)
print(postid)
print(url)

# %%
import requests
import os
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
# Set your OpenAI API key
api_key = os.getenv("OPENAI_API_KEY")
# Define the API endpoint
url = "https://api.openai.com/v1/chat/completions"

# title = "10 of the Most Romantic Things to do in Paris for Girls in Love ..."
# category = "travel"
# postid = "5985e4f2ef250a1b038b4567"

# Define the request headers
headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {api_key}"
}

# Load the prompt from prompt.md
with open("prompt.md", "r") as f:
    system_prompt = f.read()

# Define the request body (data)
data = {
    "model": "gpt-4o",
    "messages": [
        {
            "role": "system",
            "content": system_prompt
        },
        {
            "role": "user",
            "content": (
                f"\"{title}\" in category \"{category}\" published on site for women's audience mostly."
            )
        }
    ],
    "temperature": 1,
    "max_tokens": 1533,
    "top_p": 1,
    "frequency_penalty": 0,
    "presence_penalty": 0,
    "response_format": {
        "type": "text"
    }
}

# Make the request to OpenAI API
response = requests.post(url, headers=headers, json=data)

# Check if the response is successful
if response.status_code == 200:
    result = response.json()

    # Save the full response into response.json
    with open("response.json", "w") as f:
        json.dump(result, f, indent=4)

    # Extract the content from choices[0].message.content
    content = result['choices'][0]['message']['content']

    # Attempt to parse the content as JSON
    try:
        parsed_content = json.loads(content)
    except json.JSONDecodeError:
        print("Error parsing content as JSON")
        parsed_content = content  # Save raw content if parsing fails

    # Ensure parsed_content is a list (array) before adding postid and category
    if isinstance(parsed_content, list):
        # Add postid and category to each element of the array
        for i in range(len(parsed_content)):
            parsed_content[i]["postid"] = postid
            parsed_content[i]["category"] = category
    else:
        print("Parsed content is not a list. Cannot add postid and category.")

    # Save the parsed content into result.json
    with open("result.json", "w") as f:
        json.dump(parsed_content, f, indent=4)

    print("Response saved to response.json and result saved to result.json")
else:
    print(f"Error: {response.status_code}")
    print(response.text)

# %%
import os
import json
from pymongo import MongoClient, UpdateOne
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get MongoDB URI from .env
MONGODB_URI = os.getenv("MONGODB_URI_REALM")

# Connect to MongoDB
client = MongoClient(MONGODB_URI)
db = client['gpt']  # Select the 'gpt' database
collection = db['list']  # Select the 'list' collection

# Load the JSON data from result.json
with open('result.json', 'r') as file:
    data = json.load(file)  # Assumes the file is an array of objects

# Prepare bulk update/upsert operations
operations = []
for item in data:
    print(item)
    slug = item.get('slug')  # Assuming 'slug' is the unique identifier
    if slug:
        item['date'] = datetime.datetime.now()
        operations.append(
            UpdateOne(
                {'slug': slug},  # Query by slug
                {'$set': item},  # Set the fields from the item
                upsert=True  # Insert if doesn't exist
            )
        )

# Perform the bulk update/upsert
if operations:
    result = collection.bulk_write(operations)
    print(f"Matched: {result.matched_count}, Inserted: {result.upserted_count}")

# Close the connection
client.close()


