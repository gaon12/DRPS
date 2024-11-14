import axios from 'axios';

const CheckList = async () => {
  try {
    const response = await axios.get('https://www.naver.com');
    // If the response status is 200, it means the internet connection is working
    return response.status === 200;
  } catch (error) {
    // If there is an error (e.g., no internet), return false
    return false;
  }
};

export default CheckList;
