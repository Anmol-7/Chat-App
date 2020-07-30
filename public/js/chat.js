const socket=io()

//elements
const $chatBox=document.querySelector('#chatbox');
const $chatBoxInput=$chatBox.querySelector('input');
const $chatBoxButton=$chatBox.querySelector('button');
const $sendLocationButton=document.querySelector('#send-location');
const $messages=document.querySelector('#messages')

//templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate=document.querySelector('#location-template').innerHTML;
const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML;

//options
const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true})

const autoscroll=()=>{
    //new message element
    const $newMessage=$messages.lastElementChild

    //Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight+newMessageMargin

    //visible height
    const visibleHeight=$messages.offsetHeight

    //Height of messages container
    const containerHeight = $messages.scrollHeight

    //how far have i scrolled?
    const scrollOffSet = $messages.scrollTop+visibleHeight

    if(containerHeight-newMessageHeight<=scrollOffSet){
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message',(message)=>{
    console.log(message);
    const html=Mustache.render(messageTemplate,{
        username:message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html);
    autoscroll()
})

socket.on('locationMessage',(message)=>{
    console.log(message);
    const locationHTML=Mustache.render(locationTemplate,{
        username:message.username,
        url:message.url,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',locationHTML);
})

socket.on('roomData',({room,users})=>{
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML=html
})


$chatBox.addEventListener('submit',(e)=>{
    e.preventDefault();

    $chatBoxButton.setAttribute('disabled','disabled');

    const msg=e.target.elements.message.value;

    socket.emit('sendMessage',msg,(error)=>{
        $chatBoxButton.removeAttribute('disabled')
        $chatBoxInput.value='';
        $chatBoxInput.focus()

        if(error){
            return console.log(error)
        }
        console.log('The message was delivered')
    });
})
$sendLocationButton.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('geolocation not supported')
    }
    $sendLocationButton.setAttribute('disabled','disabled');
    navigator.geolocation.getCurrentPosition((position)=>{
        const location={
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        };
        socket.emit('sendLocation',location,()=>{
            console.log('location shared')
            $sendLocationButton.removeAttribute('disabled');
        });
    })
})
socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})