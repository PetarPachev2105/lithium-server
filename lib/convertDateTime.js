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

    const day = date.getDate();

    const month = date.getMonth();

    const year = date.getFullYear();

    return `${hours}:${minutes} ${day}/${month}/${year}`;
}

module.exports = {
    convertDateTime
};