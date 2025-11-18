import axios from 'axios';

export default () => {

    return axios.create({
        baseURL: `https://api.cloudcontain.net`,
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
    });
    
}