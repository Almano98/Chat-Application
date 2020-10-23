const socket = io()

const $messageForm = document.getElementById('messageForm')
const $submitButton = $messageForm.querySelector('button')
const $messageInput = $messageForm.querySelector('input')
const $locationButton = document.getElementById('sendLocation')
const $messages = document.getElementById('messages')

//Templates
const messageTemplate = document.getElementById('message-template').innerHTML
const locationMessageTemplate = document.getElementById('locationMessage-template').innerHTML
const userListTemplate = document.getElementById('userList-template').innerHTML


const {username, room} = Qs.parse(location.search, { ignoreQueryPrefix: true})

const autoscroll = () => {
    const $newMessage = $messages.lastElementChild

    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    const visibleHeight = $messages.offsetHeight
    const containerHeight = $messages.scrollHeight
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}
socket.on('message', (messageObj) => {
    const html = Mustache.render(messageTemplate, {
        message: messageObj.message,
        createdAt: moment(messageObj.createdAt).format('h:mm a'),
        username: messageObj.username
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (messageObj) => {
    const html = Mustache.render(locationMessageTemplate, {
        url : messageObj.url,
        createdAt: moment(messageObj.createdAt).format('h:mm a'),
        username: messageObj.username
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('userList', ({room, users}) => {
    const html = Mustache.render(userListTemplate, {
        room: room,
        users: users
    })
    document.getElementById('sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    $submitButton.setAttribute('disabled', 'disabled')
    const message = e.target.elements.message.value
    socket.emit('sendMessage', message, (message) => {
        console.log(message)
        $submitButton.removeAttribute('disabled')
        $messageInput.value = ''
        $messageInput.focus()
    })
})

function sendLocation() {
    $locationButton.setAttribute('disabled', 'disabled')

    if(!navigator.geolocation) {
        return alert('Geolocation is not suppored by your browser.')
    }
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
              $locationButton.removeAttribute('disabled')
        })
    })
}

socket.emit('join', {username, room}, (error) => {
    if(error){
        alert(error)
        location.href = "/"
    }
})

