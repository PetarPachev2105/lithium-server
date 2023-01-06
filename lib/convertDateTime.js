/**
 * Converts Date Time to string we want
 * @returns {*|string}
 * @param date
 */
function convertDateTime(date) {
    let hours = date.getHours();
    if (hours.toString().length < 2) hours = `0${hours}`;

    let minutes = date.getMinutes();
    if (minutes.toString().length < 2) minutes = `0${minutes}`;

    let day = date.getDate();
    if (day.toString().length < 2) day = `0${day}`;

    let month = date.getMonth() + 1;
    if (month.toString().length < 2) month = `0${month}`;

    const year = date.getFullYear();

    return `${hours}:${minutes} ${day}/${month}/${year}`;
}

module.exports = {
    convertDateTime
};