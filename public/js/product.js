


const product = [
  {
    id: 1,
    name: "Product 1",
    description: "This is the description for Product 1.",
    price: 300,
    image : "images/speaker3.jpg",
    discount: "₹500",
    percent:"60%"

  },
  {
    id: 2,  
    name: "Product 2",
    description: "This is the description for Product 2.",
    price: 450,
    image : "images/speaker2.jpg",
    discount: "₹600",
    percent: "47%"
  },  
  {
    id: 3,
    name: "Product 3",
    description: "This is the description for Product 3.",
    price: 500,
    image : "images/speaker1.jpg",
    
  },
  {
    id: 4,
    name: "Product 4",
    description: "This is the description for Product 4.",
    price: 600,
    image : "images/speaker.jpg",
   
  },


 {
  id: 5,
    name: "Product 1",
    description: "This is the description for Product 1.",
    price: 300,
    image : "images/headphone2.jpg",
    discount: "₹500",
    percent:"60%"

  },
  {
    id: 6,  
    name: "Product 2",
    description: "This is the description for Product 2.",
    price: 450,
    image : "images/headphone3.jpg",
    discount: "₹600",
    percent: "47%"
  },  
  {
    id: 7,
    name: "Product 3",
    description: "This is the description for Product 3.",
    price: 500,
    image : "images/headphone1.jpg",
    
  },
  {
    id: 8,
    name: "Product 4",
    description: "This is the description for Product 4.",
    price: 600,
    image : "images/headphone.jpg",
   
  },
{
  id: 9,
    name: "Product 1",
    description: "This is the description for Product 1.",
    price: 300,
    image : "images/datacable1.jpg",
    discount: "₹500",
    percent:"60%"

  },
  {
    id: 10,  
    name: "Product 2",
    description: "This is the description for Product 2.",
    price: 450,
    image : "images/datacable.jpg",
    discount: "₹600",
    percent: "47%"
  },  
  {
    id: 11,
    name: "Product 3",
    description: "This is the description for Product 3.",
    price: 500,
    image : "images/charger1.jpg",
    
  },
  {
    id: 12,
    name: "Product 4",
    description: "This is the description for Product 4.",
    price: 600,
    image : "images/charger.jpg",
   
  },
]


let add_Product_Item = document.querySelector('.mainContent');
let innHtmlproduct = '';
function accessories(){

 product.forEach(item => {
  if(item.discount == undefined||item.percent == undefined){
     item.discount = "",
     item.percent =""};

  

 innHtmlproduct += ` 



<div class="cards" id="cards">
  <img class="imgProduct" src="${item.image}" alt="...">
  <div class="card-body">
    <h5 class="card-title">${item.name}</h5>
    <p class="card-text">${item.description}</p>
     
    <p class="card-text">Price: ₹${item.price}(<span class="discount">${item.discount}</span><span style="color:orange;margin-left: 2px;  ">${item.percent}</span>)</p>
   
    <a href="#" class="btn btn-primary">Buy</a>
  </div>
</div>



       
 
 
 `

}

)
add_Product_Item.innerHTML = innHtmlproduct;
}
//card
//card-img-top
//card-body
