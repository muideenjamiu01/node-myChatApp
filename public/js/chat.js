const socket = io()

//forms and buttons sates
//elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')


//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML
// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })



const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}


//socket event listener for message
socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

//event listener for location message
socket.on('locationMessage', (message) =>{
    console.log(message)
    const html = Mustache.render(locationTemplate,{
        username:message.username,
        mapUrl:message.mapUrl,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML= html
})

$messageForm.addEventListener('submit', (e) =>{
    e.preventDefault()
// now disable button  when clicked for the first time
$messageForm.setAttribute('disabled', 'disabled')
    const message = e.target.elements.message.value
    
    socket.emit('sendMessage', message, (error) => {
        //now enable the button and input back to clear,the input bar and send another request
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value =""
        $messageFormInput.focus()

        if (error) { 
            return console.log(error)
        }
        console.log('Message delevered!')
    })
})


//getting user location and sharing with other users
$sendLocationButton.addEventListener('click', () =>{
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser')
    }
     $sendLocationButton.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position) => {
       
        socket.emit('sendLocation', {
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        }, () =>{ 
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location Shared')
        })

    })
    
   
}) 

socket.emit('join', { username, room }, (error) =>{
    if (error){
        return alert(error)
        location.href = '/'
    }    
} ) 

