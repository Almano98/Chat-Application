const generateMessage = (username, message) => {
    return {
        username,
        message,
        createdAt: new Date().getTime()
    }
}

const generateLocationMessage = (username,coords) => {
    const mapsUrl = 'https://google.com/maps?q='
    return {
        username, 
        url: `${mapsUrl}${coords.latitude},${coords.longitude}`,
        createdAt: new Date().getTime()
    }
}
module.exports = {
    generateMessage,
    generateLocationMessage
}