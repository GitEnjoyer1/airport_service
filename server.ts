import fetch from 'node-fetch';
import cheerio, { AnyNode } from 'cheerio';




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

let arrivalsFinal: string[]

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

fetchArrivals().then(() => {
    console.log("Arrivals fetched and saved:", arrivalsFinal);
    
});

