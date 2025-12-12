

// SOCKET CONNECTION
const socket = io();

socket.on('connect', () => {
  console.log("Admin socket connected:", socket.id);
});

socket.on('disconnect', () => {
  console.log("Admin socket DISCONNECTED");
});






// document.getElementById('place').addEventListener('click', async () => {
// const customerFirstName = document.querySelector('#customerFirstName').value;
// const customerLastName = document.querySelector('#customerLastName').value;
// const customerPhone = document.querySelector('#customerPhone').value;
// const customerEmail = document.querySelector('#customerEmail').value;
// const  customerAddress = document.querySelector('#customerAddress').value;
// const  customerCity = document.querySelector('#customerCity').value;
// const  customerState = document.querySelector('#customerState').value;
// const  customerPincode = document.querySelector('#customerPincode').value;
// const  customerCountry = document.querySelector('#customerCountry').value;


// const restaurantId = document.getElementById('restId').value;
// const video = document.querySelector('#video').files[0];
// console.log("Restaurant filled : ", restaurantId);

   

// !const res = await fetch('/api/orders',{
// method: 'POST',
// // headers: { 'Content-Type': 'application/json' },
// body: JSON.stringify({ customerName, customerPhone, restaurantId,video})
// })!;




  // const formData = new FormData();
  // formData.append('customerPhone', customerPhone);
  // formData.append('restaurantId', restaurantId);
  // formData.append('customerFirstName', customerFirstName);
  // formData.append('customerLastName', customerLastName);
  // formData.append('customerEmail', customerEmail);
  // formData.append('customerAddress', customerAddress);
  // formData.append('customerCity', customerCity);
  // formData.append('customerState', customerState);
  // formData.append('customerPincode', customerPincode);
  // formData.append('customerCountry', customerCountry);

  // formData.append('video', video); // 🔥 !key matches upload.single("video")

  // const res = await fetch('/api/orders', {
  //   method: 'POST',
  //   body: formData        // 🔥! no JSON, no Content-Type header
  // });
// !let url = req.file.path;
//  !let filename = req.file.filename; 
// const data = await res.json();

// !const newOrder = new Order({
//   customerName,
//   customerPhone,
//   restaurantId,
//   video: {
//     url: url,
//     filename: filename
//   }
// });!


// console.log("Rishi new order",data);
// alert('Currently Order created: ' + (data.order ? data.order._id : 'see console'));
// });



const form = document.getElementById('orderForm');

form.addEventListener('submit', async (e) => {
  e.preventDefault(); // ❗ stop default POST /

  // Bootstrap validation check
  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    return; // stop if invalid
  }

  form.classList.add('was-validated');

  // Collect values
  const customerFirstName = document.querySelector('#customerFirstName').value;
  const customerLastName = document.querySelector('#customerLastName').value;
  const customerPhone = document.querySelector('#customerPhone').value;
  const customerEmail = document.querySelector('#customerEmail').value;
  const customerAddress = document.querySelector('#customerAddress').value;
  const customerCity = document.querySelector('#customerCity').value;
  const customerState = document.querySelector('#customerState').value;
  const customerPincode = document.querySelector('#customerPincode').value;
  const customerCountry = document.querySelector('#customerCountry').value;

  const restaurantId = document.getElementById('restId').value;
  const video = document.querySelector('#video').files[0];

  const formData = new FormData();
  formData.append('customerFirstName', customerFirstName);
  formData.append('customerLastName', customerLastName);
  formData.append('customerPhone', customerPhone);
  formData.append('customerEmail', customerEmail);
  formData.append('customerAddress', customerAddress);
  formData.append('customerCity', customerCity);
  formData.append('customerState', customerState);
  formData.append('customerPincode', customerPincode);
  formData.append('customerCountry', customerCountry);

  formData.append('restaurantId', restaurantId); // IMPORTANT
  formData.append('video', video);

  const res = await fetch('/api/orders', {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  console.log("Order Response:", data);

  alert('Order created: ' + (data.order ? data.order._id : 'Check console'));
});
// ------------------ API CALL EXCERPT FROM routes/orders.js ------------------ //
