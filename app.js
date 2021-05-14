"use strict";

const axios = require('axios');
const faker = require('faker');
const moment = require('moment');

const avatars = require('./misc/avatars');

const BMI_UNDERWEIGHT = "underweight";
const BMI_NORMALWEIGHT = "normal";
const BMI_OVERWEIGHT = "overweight";
const BMI_OBSESITY = "obesity";

const BMI = [BMI_UNDERWEIGHT, BMI_NORMALWEIGHT, BMI_OVERWEIGHT, BMI_OBSESITY];

//not used now
/*
const SEDENTARY = "sedentary";
const LOW_ACTIVE = "low active";
const SOMEWHAT_ACTIVE = "somewhat active";
const ACTIVE = "active";
const HIGHLY_ACTIVE = "highly active";

const STEPS_ACTIVITY_LEVEL = [SEDENTARY, LOW_ACTIVE, SOMEWHAT_ACTIVE, ACTIVE, HIGHLY_ACTIVE];
*/

const axios_instance = axios.create({
    baseURL: 'http://localhost:1337',//local Strapi API url
    timeout: 1000
});


const random_int_from_interval = (min, max) => { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min);
}

const current_year = new Date().getFullYear();

const random_height = random_int_from_interval(140, 200);//returns a weight between 140 and 200 kg

const random_birthday_year = random_int_from_interval(current_year - 80, current_year - 18);

const random_with_probability = (probability) => {
    let i, sum = 0, r = Math.random();
    for (i in probability) {
        sum += probability[i];
        if (r <= sum) return i;
    }
}

//returns the bmi (body mass index) according to height and weight of the fake person
/*
const get_bmi = (height, weight) => {
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
*/

//returns weight according to height and bmi of the fake person
const get_weight_according_to_height_and_bmi = (height, bmi) => {

    let weight;

    let height_m = height / 100;

    switch (bmi) {
        case BMI_UNDERWEIGHT:
            weight = 16.5 * (height_m * height_m);
            break;
        case BMI_NORMALWEIGHT:
            weight = random_int_from_interval(18.5, 24.9) * (height_m * height_m);
            break;
        case BMI_OVERWEIGHT:
            weight = random_int_from_interval(25, 29.8) * (height_m * height_m);
            break;
        case BMI_OBSESITY:
            weight = random_int_from_interval(30, 40) * (height_m * height_m);
            break;

        default:
            weight = random_int_from_interval(18.5, 24.9) * (height_m * height_m);//= bmi normal
            break;
    }

    return Math.round(weight);

}

//returns a fake person
const get_fake_people = () => {

    const gender = random_int_from_interval(0, 1);//get a random gender

    const random_bmi = BMI[random_with_probability({ 0: 0.1, 1: 0.4, 2: 0.4, 3: 0.1 })];//according to stats

    const someone = {
        firstname: faker.name.firstName(gender),//get a random firstname according to the given gender
        lastname: faker.name.lastName(),
        gender: gender == 1 ? "male" : "female",
        height: random_height,//cm
        weight: get_weight_according_to_height_and_bmi(random_height, random_bmi),//kg
        birthday: faker.date.past(current_year - random_birthday_year),
        bmi: random_bmi,
        avatar : avatars[Math.floor(Math.random()*(avatars.length-1))]//get random avatar from the avatars list
    };

    return someone;
}

//returns a fake step data associated to the given fake people
const get_fake_steps = (day, people) => {

    return {
        date: moment().subtract(day,'days').format("YYYY-MM-DD HH:mm:ss"),//format for sqlite
        total: random_int_from_interval(1000, 12500),
        people: people.id
    };
}

(async () => {

    //create 50 fake people
    let n = 0;
    while (n < 50) {
        try {
            try {
                //insert data in database via the Strapi API
                await axios_instance.post('/people', get_fake_people());
            } catch (error) {
                console.error(error);
            }
        } catch (error) {
            console.error(error);
        }

        n++;
    }
    console.log("insertion of 50 fake persons");

    let people;

    //Get People
    try {
        const result = await axios_instance.get('/people');
        people = result.data;
    } catch (error) {
        console.error(error);
    }


    if(people.length>0){
        //Create 10 steps stats for each people
        for (const a_people of people) {
    
            let n = 0;
            while (n < 10) {
    
                try {
                    //insert data in database via the Strapi API
                    await axios_instance.post('/steps', get_fake_steps(n, a_people));
                } catch (error) {
                    console.error(error);
                }
    
                n++;
            }
    
        }
    
        console.log("insertion of steps data over the last 10 days for each fake person");
    }else{
        console.error('no person in database');
    }


})();
