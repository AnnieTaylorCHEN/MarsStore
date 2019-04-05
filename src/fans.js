let name = ''
let message = ''

document.querySelector('#full-name').addEventListener('input', (e)=> {
    name = e.target.value
})

document.querySelector('#message').addEventListener('input', (e)=> {
    message = e.target.value
})


document.querySelector('button').addEventListener('click', (e)=> {
    if (name.trim() === '' || message.trim() === '' ) {
        return
    }

    let commentObj = {
        name: name,
        message: message
    }

    fetch('/fans', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(commentObj)
     }).catch((error) => {
         console.log(error)
     })

     generateDom(name, message)
     removeInput()
})

const generateDom = (name, message) => {
    const commentDom = document.getElementById('commentDom')
    const nameDom = document.createElement('p')
    const messageDom = document.createElement('p')
    nameDom.classList.add('name')
    nameDom.textContent = name
    commentDom.appendChild(nameDom)
    messageDom.classList.add('message')
    messageDom.textContent = message
    commentDom.appendChild(messageDom)
}

const removeInput = () => {
    name = ''
    message = ''
    const nameInput = document.getElementById('full-name')
    nameInput.value = ''
    const messageInput = document.getElementById('message')
    messageInput.value = ''
}