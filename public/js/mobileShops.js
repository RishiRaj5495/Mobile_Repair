// async function registerForNotifications() {
//     try {
//         console.log("Requesting Notification Permission...");
//         const permission = await Notification.requestPermission();

//         if (permission !== "granted") {
//             alert("Enable notifications to receive new order alerts");
//             return;
//         }

//         // Get FCM token
//         const fcmToken = await messaging.getToken({
//             vapidKey: "YOUR_VAPID_PUBLIC_KEY"
//         });

//         console.log("Restaurant FCM Token:", fcmToken);

//         // OPTIONAL: send FCM token to backend
//         await fetch("/api/restaurants/saveToken", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ fcmToken })
//         });

//     } catch (err) {
//         console.error("FCM Token Error:", err);
//     }
// }

// registerForNotifications(); 
// let socket;

// document.getElementById("join").addEventListener("click", () => {
//     const restId = document.getElementById("restId").value;

//     if (!restId) return alert("Enter restaurant ID");

//     socket = io();

//     socket.emit("restaurant:join", restId);

//     socket.on("new_order", (order) => {
//         showOrder(order);
//     });

//     socket.on("order_status_changed", (order) => {
//         updateOrderUI(order);
//     });
// });


// public/js/mobileShops.js

// Register service worker for background messages
// import { messaging } from "./firebase-config.js";
// import { getToken } from "firebase/messaging";
console.log("Messaging from config =", window.messaging);


if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js')
    .then(reg => console.log('SW registered:', reg.scope))
    .catch(err => console.error('SW registration error:', err));
}

async function registerForNotifications(restaurantIdForUpdate) {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notifications permission not granted.');
      return null;
    }

    const vapidKey = 'BMx1qpsIH7bQ7JKNmFYADmgIdSMJOV6KSxpKLX4pUm7spE0WfCaE9yBx7CmN4BWvc8RNvhs3nlpiME_sPaAyZps'; // replace with your public VAPID key
    // const fcmToken = await messaging.getToken({ vapidKey });
    // const fcmToken = await getToken(messaging, { vapidKey });
    const fcmToken = await messaging.getToken({ vapidKey: vapidKey });

    console.log('FCM token', fcmToken);

    if (!fcmToken) return null;

    // If restaurantIdForUpdate provided -> save token for that restaurant
    if (restaurantIdForUpdate) {
      await fetch(`/api/restaurants/${restaurantIdForUpdate}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fcmToken })
      });
    }

    return fcmToken;
  } catch (e) {
    console.error('registerForNotifications error', e);
    return null;
  }
}

// Handle registration form (first time register restaurant)
document.getElementById('restaurantForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  console.log("Rishi");
  const name = document.getElementById('name').value;
  const address = document.getElementById('address').value;
  const mobile = document.getElementById('mobile').value;

  // ask permission and get token
  const token = await registerForNotifications();
  const payload = { name, address, mobile, fcmToken: token };

  const res = await fetch('/api/restaurants/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  alert(data.message || 'Registered');
});
















// Socket + join logic
let socket;
document.getElementById('join')?.addEventListener('click', async () => {
  const restId = document.getElementById('restId').value;
  if (!restId) return alert('Enter restaurant ID');

  // when joining, ask for permission and update token for that known rest id
  await registerForNotifications(restId);

  // setup socket (connect once)
  if (!socket) {
    socket = io();
    socket.on('new_order', order => showOrder(order));
    socket.on('order_status_changed', order => updateOrderUI(order));
  }

  socket.emit('restaurant:join', restId);
  alert('Connected to live orders for ' + restId);
});

// function showOrder(order) {
//   const div = document.createElement('div');
//   div.className = 'order-box';
//   div.id = `order_${order._id}`;
//   div.innerHTML = `
//     <h3>New Order #${order._id}</h3>
//     <p>Customer Name: ${order.customerFirstName || ''}$${" "} ${order.customerLastName || ''}</p>
//      <p>Customer Phone: ${order.customerPhone || ''}</p>
//        <p>Customer Email: ${order.customerEmail || ''}</p>
//        <p>Customer Address: ${order.customerAddress || ''}$${"| "}Customer Pincode ${order.customerPincode || ''}</p>
//              <p>State: ${order.customerState || ''}$${"| "}City : ${order.customerCity || ''}</p>

//        <p>Issue Video:</p>
//   ${
//     order.video && order.video.url
//       ? `<video controls width="300" margin="auto">
//            <source src="${order.video.url}" type="video/mp4">
//          </video>`
//       : '<p>No video provided</p>'
//   }
//     <p>Forwarded To Shop: ${order.restaurant.name || ''}</p>
//     <p>Shop Address: ${order.restaurant.address || ''}</p>
//     <p>Shop Mobile: ${order.restaurant.mobile || ''}</p>
//     <button onclick="acceptOrder('${order._id}')">Accept</button>
//     <button onclick="rejectOrder('${order._id}')">Reject</button>
//   `;
//   document.getElementById('orders').appendChild(div);
// }

function showOrder(order) {
  const div = document.createElement('div');
  div.className = 'order-card';
  div.id = `order_${order._id}`;

  div.innerHTML = `
    <div class="order-header">
      <h3>🆕 New Order</h3>
      <span class="order-id">#${order._id}</span>
    </div>

    <div class="order-body">

      <!-- LEFT -->
      <div class="order-left">
        <p><strong>Customer:</strong> ${order.customerFirstName} ${order.customerLastName}</p>
        <p><strong>Phone:</strong> ${order.customerPhone}</p>
        <p><strong>Email:</strong> ${order.customerEmail}</p>
        <p><strong>Address:</strong> ${order.customerAddress}</p>
        <p><strong>City:</strong> ${order.customerCity} | <strong>State:</strong> ${order.customerState}</p>
        <p><strong>Pincode:</strong> ${order.customerPincode}</p>
      </div>

      <!-- RIGHT -->
      <div class="order-right">
        <p class="section-title">📹 Issue Video</p>
        ${
          order.video && order.video.url
            ? `<video controls>
                 <source src="${order.video.url}" type="video/mp4">
               </video>`
            : `<p class="no-video">No video provided</p>`
        }
      </div>

    </div>

    <div class="shop-info">
      <p><strong>Shop:</strong> ${order.restaurant.name}</p>
      <p><strong>Address:</strong> ${order.restaurant.address}</p>
      <p><strong>Mobile:</strong> ${order.restaurant.mobile}</p>
    </div>

    <div class="order-actions">
      <button class="btn accept" onclick="acceptOrder('${order._id}')">Accept</button>
      <button class="btn reject" onclick="rejectOrder('${order._id}')">Reject</button>
    </div>
  `;

  document.getElementById('orders').appendChild(div);
}




function updateOrderUI(order) {
  const div = document.getElementById(`order_${order._id}`);
  if (!div) return;
  div.innerHTML += `<p>Status Updated: ${order.status}</p>`;
}

function acceptOrder(orderId) {
  console.log("Status Socket =", socket);
  if (!socket) return;
  socket.emit('order:updateStatus', { orderId, status: 'Accepted' });
}

function rejectOrder(orderId) {
    console.log("Status Socket =", socket);
  if (!socket) return;
  socket.emit('order:updateStatus', { orderId, status: 'Rejected' });
}



