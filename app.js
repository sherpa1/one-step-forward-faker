"use strict";

const axios = require('axios');


const axios_instance = axios.create({
    baseURL: 'http://localhost:1337',
    timeout: 1000,
    headers: {'X-Custom-Header': 'foobar'}//to adapt if necessary
});

(async ()=>{
    let people;
    
    try {
       const result = await axios_instance.get('/people');
       people = result.data;
    } catch (error) {
        console.log(error);
    }

    console.log(people);


})();
