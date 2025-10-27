require('dotenv').config();
const axios = require('axios');

const API_URL = process.env.DATA_API_URL;
const API_KEY = process.env.DATA_API_KEY;
const API_SECRET = process.env.DATA_API_SECRET;

/**
 * Executes an aggregation pipeline on the specified collection
 * using your custom API.
 */
const aggregate = async (cluster, database, collection, pipeline) => {
  console.log('API URL:', API_URL);

  try {
    console.log(`Calling ${API_URL}/aggregate`)
    payload = {
        database,
        collection,
        pipeline
      }
    console.log(payload)

    const response = await axios.post(
      `${API_URL}/aggregate`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data.result;
  } catch (error) {
    // Handle the case where API returns 404 for no results - this is not an actual error
    if (error.response?.status === 404 && 
        error.response?.data?.message === 'No aggregation results found') {
      console.log('No aggregation results found - returning empty array');
      return [];
    }
    
    console.error('Error executing aggregation:', error.response?.data || error.message);
    throw error;
  }
};

module.exports = { aggregate };