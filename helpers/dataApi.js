require('dotenv').config();
const axios = require('axios');

const API_URL = process.env.DATA_API_URL;
const API_KEY = process.env.DATA_API_KEY;
const API_SECRET = process.env.DATA_API_SECRET;

/**
 * Executes an aggregation pipeline on the specified collection
 * using your custom API with retry logic.
 */
const aggregate = async (cluster, database, collection, pipeline, maxRetries = 3) => {
  console.log('API URL:', API_URL);
  const clusterName = cluster || 'cluster1';

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Calling ${API_URL}/aggregate (Attempt ${attempt}/${maxRetries})`)
      const payload = {
        cluster: clusterName,
        database,
        collection,
        pipeline
      };
      console.log(payload)

      const response = await axios.post(
        `${API_URL}/aggregate`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 second timeout
        }
      );
      
      // Success - return the result
      console.log('API call successful');
      return response.data.result;
      
    } catch (error) {
      // Handle the case where API returns 404 for no results - this is not an actual error
      if (error.response?.status === 404 && 
          error.response?.data?.message === 'No aggregation results found') {
        console.log('No aggregation results found - returning empty array');
        return [];
      }
      
      const isLastAttempt = attempt === maxRetries;
      const errorMessage = error.response?.data || error.message;
      
      console.error(`Error executing aggregation (Attempt ${attempt}/${maxRetries}):`, 
        typeof errorMessage === 'string' && errorMessage.includes('<!DOCTYPE html>') 
          ? 'Server returned HTML error page (500 Internal Server Error)' 
          : errorMessage
      );
      
      if (isLastAttempt) {
        console.error('All retry attempts failed. Cancelling process.');
        throw new Error(`Data API failed after ${maxRetries} attempts: ${error.message}`);
      }
      
      // Exponential backoff: wait 2^attempt seconds before retrying
      const waitTime = Math.pow(2, attempt) * 1000;
      console.log(`Retrying in ${waitTime / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
};

module.exports = { aggregate };
