import re
from pymongo import MongoClient

client = MongoClient('mongodb+srv://admin:23tyHjwbnqp21@cluster0.jfcrg.gcp.mongodb.net/test?authSource=admin&replicaSet=Cluster0-shard-0&w=majority&readPreference=primary&retryWrites=true&ssl=true')
filter={
    'response': re.compile(r"2022")
}

# Define the filter to find documents with "2022"
filter = {
    'response': re.compile(r"2022")
}

# Find documents that match the filter
results = client['aws']['extensions'].find(filter=filter)

# Iterate over the results and update each document
for doc in results:
    updated_response = [value.replace("2022", "2023") for value in doc['response']]
    # Update the specific field with the modified value
    print(updated_response)
    client['aws']['extensions'].update_one(
        {'_id': doc['_id']},
        {'$set': {'response': updated_response}}
    )