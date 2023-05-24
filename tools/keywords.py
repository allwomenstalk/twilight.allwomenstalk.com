import configparser
import os
import json
import openai

# Read the API key from the config.ini file
config = configparser.ConfigParser()
config.read("config.ini")

api_key = config.get("OpenAI", "api_key")

# Set up OpenAI API credentials
openai.api_key = api_key

# Define the list of domains/categories
domains = [
    "apps.allwomenstalk.com",
    "bags.allwomenstalk.com",
    "beauty.allwomenstalk.com",
    "books.allwomenstalk.com",
    "celebs.allwomenstalk.com",
    "cooking.allwomenstalk.com",
    "diet.allwomenstalk.com",
    "diy.allwomenstalk.com",
    "fashion.allwomenstalk.com",
    "fitness.allwomenstalk.com",
    "food.allwomenstalk.com",
    "funny.allwomenstalk.com",
    "gardening.allwomenstalk.com",
    "hair.allwomenstalk.com",
    "health.allwomenstalk.com",
    "inspiration.allwomenstalk.com",
    "jewelry.allwomenstalk.com",
    "lifestyle.allwomenstalk.com",
    "love.allwomenstalk.com",
    "makeup.allwomenstalk.com",
    "money.allwomenstalk.com",
    "movies.allwomenstalk.com",
    "music.allwomenstalk.com",
    "nails.allwomenstalk.com",
    "paranormal.allwomenstalk.com",
    "parenting.allwomenstalk.com",
    "perfumes.allwomenstalk.com",
    "running.allwomenstalk.com",
    "shoes.allwomenstalk.com",
    "skincare.allwomenstalk.com",
    "streetstyle.allwomenstalk.com",
    "teen.allwomenstalk.com",
    "travel.allwomenstalk.com",
    "twilight.allwomenstalk.com",
    "wedding.allwomenstalk.com",
    "weightloss.allwomenstalk.com"
]

# Generate high CPC keywords using OpenAI for each domain
for index, domain in enumerate(domains[1:]):
    print(f"Index: {index}, Domain: {domain}")
    folder_name = "keywords/"+domain #.split(".")[0]
    file_path = os.path.join(folder_name, "keywords.json")

    # Create the folder if it doesn't exist
    os.makedirs(folder_name, exist_ok=True)

    # Extract the category from the subdomain
    category = domain.split(".")[0].capitalize()

    # Generate high CPC keywords using OpenAI
    prompt = f"make a list of 25  high CPC keywords in {category} niche in JSON array format like [\"keyword\", \"keywords1\",...]\n"
    response = openai.Completion.create(
        model="text-davinci-003",
        prompt=prompt,
        temperature=1,
        max_tokens=456,
        top_p=1,
        frequency_penalty=0,
        presence_penalty=0
    )

    # Extract the generated keywords from the response
    generated_keywords = [choice["text"].strip() for choice in response.choices]
    print(generated_keywords[0])
    generated_keywords = json.loads(generated_keywords[0])
    # Save the keywords to a JSON file
    with open(file_path, "w") as file:
        json.dump(generated_keywords, file, indent=4, ensure_ascii=False)

    print(f"Generated file: {file_path}")
