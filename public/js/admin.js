

// SOCKET CONNECTION
const socket = io();

socket.on('connect', () => {
  console.log("Admin socket connected:", socket.id);
});

socket.on('disconnect', () => {
  console.log("Admin socket DISCONNECTED");
});










document.getElementById('place').addEventListener('click', async () => {
const customerName = document.getElementById('custName').value;
const customerPhone = document.getElementById('custPhone').value;
const restaurantId = document.getElementById('restId').value;
const video = document.getElementById('images').files[0];


   

// const res = await fetch('/api/orders',{
// method: 'POST',
// // headers: { 'Content-Type': 'application/json' },
// body: JSON.stringify({ customerName, customerPhone, restaurantId,video})
// });




  const formData = new FormData();
  formData.append('customerName', customerName);
  formData.append('customerPhone', customerPhone);
  formData.append('restaurantId', restaurantId);
  formData.append('video', video); // 🔥 key matches upload.single("video")

  const res = await fetch('/api/orders', {
    method: 'POST',
    body: formData        // 🔥 no JSON, no Content-Type header
  });
// let url = req.file.path;
//   let filename = req.file.filename; 
const data = await res.json();

// const newOrder = new Order({
//   customerName,
//   customerPhone,
//   restaurantId,
//   video: {
//     url: url,
//     filename: filename
//   }
// });


console.log("Rishi new order",data);
alert('Currently Order created: ' + (data.order ? data.order._id : 'see console'));
});