"use strict";

const axios = require('axios');
const faker = require('faker');

const BMI_UNDERWEIGHT = "underweight";
const BMI_NORMALWEIGHT = "normal";
const BMI_OVERWEIGHT = "overweight";
const BMI_OBSESITY = "obesity";

const axios_instance = axios.create({
    baseURL: 'http://localhost:1337',
    timeout: 1000,
    headers: { 'X-Custom-Header': 'foobar' }//to adapt if necessary
});

(async () => {

    

    const randomIntFromInterval = (min, max) => { // min and max included 
        return Math.floor(Math.random() * (max - min + 1) + min);
    }


    const current_year = new Date().getFullYear();

    const random_height = randomIntFromInterval(140, 200);
    const random_weight = randomIntFromInterval(40, 200);

    const random_birthday_year = randomIntFromInterval(current_year - 80, current_year - 18);

    const bmi = (height, weight) => {
        const bmi = Math.round(weight / ((height / 100) * (height / 100)));

        let bmi_label;

        if (bmi < 16.5) {
            bmi_label = BMI_UNDERWEIGHT;
        } else if (bmi >= 18.5 && bmi <= 24.9) {
            bmi_label = BMI_NORMALWEIGHT;
        } else if (bmi >= 25 && bmi <= 29.8) {
            bmi_label = BMI_OVERWEIGHT;
        } else if (bmi >= 30) {
            bmi_label = BMI_OBSESITY;
        }

        return bmi_label;
    }

    const fake_people = () => {

        const gender = randomIntFromInterval(0,1);

        const someone = {
            firstname: faker.name.firstName(gender),
            lastname: faker.name.lastName(),
            gender: gender == 1 ? "male" : "female",
            height: random_height,//cm
            weight: random_weight,//kg
            birthday: faker.date.past(current_year - random_birthday_year)
        };

        someone.bmi = bmi(someone.height, someone.weight);

        return someone;
    }

    let n = 0;
    while (n < 50) {
        try {
            try {
                const result = await axios_instance.post('/people', fake_people());
            } catch (error) {
                console.error(error);
            }
        } catch (error) {
            console.error(error);
        }

        n++;
    }


    try {
        await axios_instance.get('/people');
    } catch (error) {
        console.error(error);
    }

})();
