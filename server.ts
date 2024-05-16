import fetch from 'node-fetch';
import cheerio, { AnyNode } from 'cheerio';

let arrivalsFinal: string[]
let arrivalTime: string


const getArrivals = async () => {
    const response = await fetch('https://old.bernairport.ch/iso_import/arrivals');
    const data = await response.text();
    return data;
};

const parseArrivals = (html: string | AnyNode | AnyNode[] | Buffer) => {
    const $ = cheerio.load(html);
    let arrivals: string[] = [];

    $('.arrivaltable tr.mainflight').each((i, elem) => {
        const flightNo = $(elem).find('.flightNo').text().trim();
        const airport = $(elem).find('.airport').text().trim();
        const scheduledTime = $(elem).find('.scheduledTime').text().trim();
        const estimatedTime = $(elem).find('.estimatedTime').text().trim();
        const status = $(elem).find('.status').text().trim();
        const airlineIconPath = $(elem).find('.icon img').attr('src');

        arrivals.push(`Flight Number: ${flightNo}, Airport: ${airport}, Scheduled Time: ${scheduledTime}, Estimated Time: ${estimatedTime}, Status: ${status}, Airline: ${airlineIconPath}`);
    });

    return arrivals;
};



const fetchArrivals = async () => {
    try {
        const data = await getArrivals();
        let arrivals_raw = data;

        // Parse the HTML and get structured data
        let arrivals = parseArrivals(arrivals_raw);
        arrivalsFinal = arrivals
        return arrivals
    } catch (error) {
        console.error(error);
    }
};



function getTimeHours() {

    var time = new Date();

    var hours = time.getHours();
    var minutes = time.getMinutes();

    // Padding 0 if hour or minute is a single digit value
    var hoursFormat = ("0" + hours).slice(-2);
    var minutesFormat = ("0" + minutes).slice(-2);

    var currentTime = hoursFormat + ':' + minutesFormat;

    return currentTime
}

function convertTimeToDate(timeStr: string) {
    const [hours, minutes] = timeStr.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes);
    return date;
}

function checkArrivalTime(arrivalTime: string) {
    let currentTime = getTimeHours();
    const currentDate = convertTimeToDate(currentTime);
    const arrivalDate = convertTimeToDate(arrivalTime);

    const timeDifference = (currentDate.getTime() - arrivalDate.getTime()) / 1000 / 60;

    console.log(timeDifference)
    // Check if time difference is less than or equal to 20 minutes
    if (timeDifference >= -25 && timeDifference < 0) {
        console.log("Send Email");
    } else {
        console.log("No action");
    }
}

fetchArrivals().then(() => {
    console.log("Arrivals fetched,", arrivalsFinal.length, "flights found")
    arrivalsFinal.forEach(flight => {
        let match = flight.match(/Scheduled Time: (\d{2}:\d{2})/);
        if (match) {
            arrivalTime = match[1];
            console.log(arrivalTime);  // string 'HH:MM' 
        }
        else {console.log("No Data matched")}

        checkArrivalTime(arrivalTime)
    });
    
});

