"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = __importDefault(require("node-fetch"));
const cheerio_1 = __importDefault(require("cheerio"));
let arrivalsFinal;
let arrivalTime;
const getArrivals = () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield (0, node_fetch_1.default)('https://old.bernairport.ch/iso_import/arrivals');
    const data = yield response.text();
    return data;
});
const parseArrivals = (html) => {
    const $ = cheerio_1.default.load(html);
    let arrivals = [];
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
const fetchArrivals = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield getArrivals();
        let arrivals_raw = data;
        // Parse the HTML and get structured data
        let arrivals = parseArrivals(arrivals_raw);
        arrivalsFinal = arrivals;
        return arrivals;
    }
    catch (error) {
        console.error(error);
    }
});
function getTimeHours() {
    var time = new Date();
    var hours = time.getHours();
    var minutes = time.getMinutes();
    // Padding 0 if hour or minute is a single digit value
    var hoursFormat = ("0" + hours).slice(-2);
    var minutesFormat = ("0" + minutes).slice(-2);
    var currentTime = hoursFormat + ':' + minutesFormat;
    return currentTime;
}
function convertTimeToDate(timeStr) {
    const [hours, minutes] = timeStr.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes);
    return date;
}
function checkArrivalTime(arrivalTime) {
    let currentTime = getTimeHours();
    const currentDate = convertTimeToDate(currentTime);
    const arrivalDate = convertTimeToDate(arrivalTime);
    const timeDifference = (currentDate.getTime() - arrivalDate.getTime()) / 1000 / 60;
    console.log(timeDifference);
    // Check if time difference is less than or equal to 20 minutes
    if (timeDifference >= -25 && timeDifference < 0) {
        console.log("Send Email");
    }
    else {
        console.log("No action");
    }
}
fetchArrivals().then(() => {
    console.log("Arrivals fetched,", arrivalsFinal.length, "flights found");
    arrivalsFinal.forEach(flight => {
        let match = flight.match(/Scheduled Time: (\d{2}:\d{2})/);
        if (match) {
            arrivalTime = match[1];
            console.log(arrivalTime); // string 'HH:MM' 
        }
        else {
            console.log("No Data matched");
        }
        checkArrivalTime(arrivalTime);
    });
});
