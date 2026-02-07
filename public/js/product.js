


const product = [

  // 🔊 Speakers (4)
  {
    id: 1,
    name: "Bluetooth Speaker X3",
    description: "High bass portable wireless speaker.",
    price: 300,
    originalPrice: 500,
    image: "/images/speaker3.jpg",
    category: "speaker"
  },
  {
    id: 2,
    name: "Mini Party Speaker",
    description: "Compact speaker with powerful sound.",
    price: 650,
    originalPrice: 900,
    image: "/images/speaker2.jpg",
    category: "speaker"
  },
  {
    id: 3,
    name: "RGB Tower Speaker",
    description: "Stylish speaker with RGB lighting.",
    price: 1200,
    originalPrice: 1500,
    image: "/images/speaker1.jpg",
    category: "speaker"
  },
  {
    id: 4,
    name: "Home Theatre Speaker",
    description: "Cinematic surround sound experience.",
    price: 2500,
    originalPrice: 3200,
    image: "/images/speaker.jpg",
    category: "speaker"
  },

  // 🎧 Headphones (4)
  {
    id: 5,
    name: "Wireless Headphone Pro",
    description: "Noise cancelling over-ear headphones.",
    price: 450,
    originalPrice: 600,
    image: "/images/headphone3.jpg",
    category: "headphone"
  },
  {
    id: 6,
    name: "Gaming Headset X",
    description: "High quality gaming audio experience.",
    price: 1500,
    originalPrice: 2000,
    image: "/images/headphone2.jpg",
    category: "headphone"
  },
  {
    id: 7,
    name: "Studio Monitor Headphone",
    description: "Professional sound clarity for music.",
    price: 2200,
    originalPrice: 2800,
    image: "/images/headphone1.jpg",
    category: "headphone"
  },
  {
    id: 8,
    name: "Bass Boost Headphone",
    description: "Deep bass with comfortable design.",
    price: 999,
    originalPrice: 1400,
    image: "/images/headphone.jpg",
    category: "headphone"
  },

  // 🔌 Cables (4)
  {
    id: 9,
    name: "Fast Charging Cable",
    description: "Durable Type-C data cable.",
    price: 250,
    originalPrice: 400,
    image: "/images/datacable1.jpg",
    category: "cable"
  },
  {
    id: 10,
    name: "Premium USB Cable",
    description: "High-speed data transfer cable.",
    price: 350,
    originalPrice: 500,
    image: "/images/datacable.jpg",
    category: "cable"
  },
  {
    id: 11,
    name: "Lightning Cable Pro",
    description: "Apple compatible fast charging cable.",
    price: 550,
    originalPrice: 750,
    image: "/images/datacable1.jpg",
    category: "cable"
  },
  {
    id: 12,
    name: "Braided Charging Cable",
    description: "Strong nylon braided cable for durability.",
    price: 400,
    originalPrice: 600,
    image: "/images/datacable.jpg",
    category: "cable"
  },

  // 🔋 Chargers (4)
  {
    id: 13,
    name: "Fast Charger 20W",
    description: "Quick charge supported adapter.",
    price: 800,
    originalPrice: 1100,
    image: "/images/charger1.jpg",
    category: "charger"
  },
  {
    id: 14,
    name: "Super Fast Charger 45W",
    description: "Ultra fast charging adapter.",
    price: 1500,
    originalPrice: 1900,
    image: "/images/charger.jpg",
    category: "charger"
  },
  {
    id: 15,
    name: "Dual Port Charger",
    description: "Charge two devices simultaneously.",
    price: 1200,
    originalPrice: 1600,
    image: "/images/charger1.jpg",
    category: "charger"
  },
  {
    id: 16,
    name: "Wireless Charging Pad",
    description: "Cable-free fast wireless charging.",
    price: 1800,
    originalPrice: 2300,
    image: "/images/charger.jpg",
    category: "charger"
  }

];



// let add_Product_Item = document.querySelector('.mainContent');
// let innHtmlproduct = '';
// function accessories(){

//  product.forEach(item => {
//   if(item.discount == undefined||item.percent == undefined){
//      item.discount = "",
//      item.percent =""};

  

//  innHtmlproduct += ` 



// <div class="cards" id="cards">
//   <img class="imgProduct" src="${item.image}" alt="...">
//   <div class="card-body">
//     <h5 class="card-title">${item.name}</h5>
//     <p class="card-text">${item.description}</p>
     
//     <p class="card-text">Price: ₹${item.price}(<span class="discount">${item.discount}</span><span style="color:orange;margin-left: 2px;  ">${item.percent}</span>)</p>
   
//     <a href="#" class="btn btn-primary">Buy</a>
//   </div>
// </div>



       
 
 
//  `

// }

// )
// add_Product_Item.innerHTML = innHtmlproduct;
// }
//card
//card-img-top
//card-body
function renderProducts(productList) {
  const container = document.querySelector(".priceListContainer");

  if (!container) return;

  container.innerHTML = "";

  productList.forEach(item => {

    let discountHTML = "";

    if (item.originalPrice) {
      const percent = Math.round(
        ((item.originalPrice - item.price) / item.originalPrice) * 100
      );

      discountHTML = `
        <span class="discount">₹${item.originalPrice}</span>
        <span class="percent">${percent}% OFF</span>
      `;
    }

    const card = `
      <div class="cards">
        <img class="imgProduct" src="${item.image}" alt="${item.name}">
        <div class="card-body">
          <h5 class="card-title">${item.name}</h5>
          <p class="card-text">${item.description}</p>
          <p class="card-text">
            Price: ₹${item.price}
            ${discountHTML}
          </p>
          <button class="btn btn-primary">Buy</button>
        </div>
      </div>
    `;

    container.innerHTML += card;
  });
}
