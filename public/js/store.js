//check if the document is loading,make sure functions are ready only when everything is loaded
if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', ready)
} else {
    ready()
}

//The major functions, to remove, to change quanity, to add to cart, and to purchase all. We basically define a variable first and store its value by class name, then we run a iteration with "for" loop, define one variable to add Eventlistener so a function will run when interacted
function ready () {
    const removeCartItemButtons = document.getElementsByClassName('btn-danger')
    for (let i=0; i < removeCartItemButtons.length; i++){
        const button = removeCartItemButtons[i]
        button.addEventListener ('click', removeCartItem)
    }

    const quantityInputs = document.getElementsByClassName('cart-quantity-input')
    for (let i=0; i < quantityInputs.length; i++){
        const input = quantityInputs[i]
        input.addEventListener('change', quantityChanged)
    }

    const addToCartButtons = document.getElementsByClassName('shop-item-button')
    for (let i=0; i < addToCartButtons.length; i++){
        const button = addToCartButtons[i]
        button.addEventListener('click', addToCartClicked)
    }

    document.getElementsByClassName('btn-purchase')[0].addEventListener('click', purchaseClicked)
}

//send user an alert message after clicking purchase button, and clear up all the stuff in the cart(in the div of cart-items),use while function to remove the first child node until all are removed
const stripeHandler = StripeCheckout.configure ({
    key: stripePublicKey,
    locale:'auto',
    token: function (token) {
        let items = []
        const cartItemContainer = document.getElementsByClassName('cart-items')[0]
        const cartRows = cartItemContainer.getElementsByClassName('cart-row')
        for (let i =0; i < cartRows.length; i++) {
            const cartRow = cartRows[i]
            const quantityElement = cartRow.getElementsByClassName('cart-quantity-input')[0]
            const quantity = quantityElement.value
            const id = cartRow.dataset.itemId
            items.push({
                id: id,
                quantity: quantity
            })
        }

        fetch('/store/purchase', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                stripeTokenId: token.id,
                items: items
            })
         }).then((res)=> res.json()
            ).then((data)=> {
            alert(data.message)
            const cartItems = document.getElementsByClassName('cart-items')[0]
            while (cartItems.hasChildNodes()){
            cartItems.removeChild(cartItems.firstChild)
            }
            updateCartTotal()
        }).catch((error)=>{
            console.log(error)
        })
    }
})

function purchaseClicked () {
    const priceElement = document.getElementsByClassName('cart-total-price')[0]
    const total = Math.round(parseFloat(priceElement.innerText.replace('$', '')) * 100)
    stripeHandler.open({
        amount: total
    })
}

//remove cart item, basically removing the whole div part of the item
const removeCartItem = (e) => {
    const buttonClicked = e.target
    buttonClicked.parentElement.parentElement.remove()
    updateCartTotal()
}


//update the status of the quantity, make sure value entered must be a number, or equal to or more than 1, if not, assign 1 as default
const quantityChanged = (e) => {
    const input = e.target
    if (isNaN(input.value) || input.value <= 0 ){
        input.value = 1
    }
    updateCartTotal()
}

//add item to the cart, create a variable to access the whole div part of item and its various value
function addToCartClicked (e) {
   const button = e.target
   const shopItem = button.parentElement.parentElement
   const title = shopItem.getElementsByClassName('shop-item-title')[0].innerText
   const price = shopItem.getElementsByClassName('shop-item-price')[0].innerText
   const imageSrc = shopItem.getElementsByClassName('shop-item-image')[0].src
   const id = shopItem.dataset.itemId
   addItemToCart(title, price, imageSrc, id)
   itemCount()
   updateCartTotal()
}

//get the information here onto the page, generate DOM/HTML : create element, add style, make sure if item here already exist an alert message saying so, and function stops here, so people don't add duplicated items. Otherwise generate HTML with values we extract from the above function. Since the quantity and remove buttons are newly generated here, we need to include the functions again. 
let addItemToCart = (title, price, imageSrc, id) => {
    const cartRow = document.createElement('div')
    cartRow.classList.add('cart-row')
    cartRow.dataset.itemId = id
    const cartItems = document.getElementsByClassName('cart-items')[0]
    const cartItemNames = cartItems.getElementsByClassName('cart-item-title')
    for (let i=0; i < cartItemNames.length; i++){
        if (cartItemNames[i].innerText === title){
            alert ('This item is already added to the cart')
            return
        }
    }
    const cartRowContents = `
          <div class="cart-item cart-column">
            <img class="cart-item-image" src="${imageSrc}" width ="100" height="100">
            <span class="cart-item-title">${title}</span>
          </div>
          <span class="cart-price cart-column">${price}</span>
          <div class="cart-quantity cart-column">
            <input class="cart-quantity-input" type="number" value="1">
            <button class="btn btn-danger" type="button">X</button>
          </div>`
    cartRow.innerHTML = cartRowContents
    cartItems.append(cartRow)
    cartRow.getElementsByClassName('btn-danger')[0].addEventListener('click', removeCartItem)
    cartRow.getElementsByClassName('cart-quantity-input')[0].addEventListener ('change', quantityChanged)
}

//update the number of the cart total, use parseFloat to get numbers, but without $. Run iteration, first multiply each item with quanity, then add price of item in each row together. Important to round numbers cos result can be infinite decimal numbers. Remember to add $ back in the end. 
let updateCartTotal = () => {
    const cartItemContainer = document.getElementsByClassName('cart-items')[0]
    const cartRows = cartItemContainer.getElementsByClassName('cart-row')
    let total = 0
    for (let i=0; i < cartRows.length; i++){
        const cartRow = cartRows[i]
        const priceElement = cartRow.getElementsByClassName('cart-price')[0]
        const quantityElement = cartRow.getElementsByClassName('cart-quantity-input')[0]
        const price = parseFloat(priceElement.innerText.replace('$',''))
        const quantity = quantityElement.value
        total = total + (price * quantity)
    }
    total = Math.round(total*100) / 100
    document.getElementsByClassName('cart-total-price')[0].innerText = '$' + total
}

//Adding a fixed search bar to the match searched item to the title of products, will scroll to the product when matched, otherwise return the text no match found 
let searchText = ''

const titlesNodes = document.querySelectorAll('.shop-item-title')
const titles = Array.from(titlesNodes)

document.querySelector('#search-text').addEventListener('input', (e) => {
    searchText = e.target.value
    searchFunction()
})

const searchFunction = () => {
        const filteredTitles = titles.filter((title) => title.innerText.toLowerCase().includes(searchText.toLowerCase()) )
        const msg = document.querySelector('#feedback')
        msg.innerHTML = ''
        if (filteredTitles.length > 0){
            requestAnimationFrame(() => { 
                filteredTitles[0].scrollIntoView()
              })
            const test = filteredTitles[0]
        } else {
            msg.textContent = 'No match found' 
        }

}

//cart toggle button
const cartToggle = document.getElementById('cart')
const cartContent = document.getElementById('cartContent')
cartToggle.addEventListener('click', ()=> {
    cartContent.style.display = 'block';
})

const shopToggle = document.getElementById('shop')
shopToggle.addEventListener('click', ()=> {
    cartContent.style.display = 'none';
})

//item count badge in cart 
const itemCount = () => {
    let count = document.getElementsByClassName('cart-item-title').length
    const cartCount = document.getElementById('cartCount') 
    cartCount.style.display ='inline'
    cartCount.innerText = count
}