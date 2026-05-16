import axios from 'axios';

const base_url = "https://camp-coding.site/nourstaff/admin/";



const apiInstance = axios.create({
    baseURL: base_url,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});



export default apiInstance;
