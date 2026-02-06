

let socket;
let orders = [];
document.addEventListener("DOMContentLoaded", async () => {

    if (!RESTAURANT_ID) {
    console.error("Restaurant ID missing");
    return;
  }
await registerForNotifications(RESTAURANT_ID);
await loadExistingOrders();
socket = io();

 


  socket.on("connect", () => {
    console.log("Shop socket connected:", socket.id);
     socket.emit("restaurant:join", RESTAURANT_ID);
    console.log("Restaurant connected:", RESTAURANT_ID);

    // Join order room ONLY if order page
    if (typeof CURRENT_ORDER_ID !== "undefined") {
      socket.emit("join_order", CURRENT_ORDER_ID);
      console.log("Shop joined order room:", CURRENT_ORDER_ID);
    }

   
  });
///

socket.on("new_order", order => {
  if (!document.getElementById(`order_${order._id}`)) {
    orders.unshift(order);
    renderOrder(order, "top"); // latest on top
  }
});

///////
//   socket.on("new_order", order => {
//   if (!document.getElementById(`order_${order._id}`)) {
//     showOrder(order);
//   }
// });

  socket.on("order_status_changed", order => {
    updateOrderUI(order);
  });
 
});






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
    
    const fcmToken = await messaging.getToken({ vapidKey: vapidKey });

    console.log('FCM token', fcmToken);

    if (!fcmToken) return null;

   
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


document.getElementById('restaurantForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  console.log("Rishi",e);
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const phone = document.getElementById("phone").value;
  const address = document.getElementById("address").value;
 

  const token = await registerForNotifications();
  const payload = { name, email, password, phone, address, fcmToken: token };
  console.log({
  name,
  email,
  phone,
  address,
  fcmToken: token
});

  const res = await fetch('/api/restaurants/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
 if (data?.success === true && data?.redirectUrl) {
  window.location.href = data.redirectUrl;
} else {
  alert(data?.message ?? 'Registered');
resetBtn();
}
function resetBtn() {
  spinner.classList.add('d-none');
  text.textContent = 'Create Account';
  btn.disabled = false;
}

  // alert(data.message || 'Registered');
});



  function updateOrderUI(order) {
  const statusEl = document.getElementById(`status_${order._id}`);
  const actionsEl = document.getElementById(`actions_${order._id}`);

  if (!statusEl) return;

  statusEl.innerHTML = `<strong>Status:</strong> ${order.status}`;

  // remove buttons after accept/reject
  if (actionsEl) {
    actionsEl.remove();
  }
}






// function acceptOrder(orderId) {
//   console.log("Status Socket =", socket);
//   if (!socket) return;
//   socket.emit('order:updateStatus', { orderId, status: 'Accepted' });
// }

  async function acceptOrder(orderId) {
    await  fetch(`/api/orders/${orderId}/accept`, {
    method: "POST"
  })
    .then(res => {
      if (!res.ok) throw new Error("Failed to accept order");
      window.location.href = `/delivery/${orderId}`;
    })
    .catch(err => console.error(err));
}
    async function rejectOrder(orderId) {
      console.log("Rejecting order:", orderId);

      await fetch(`/api/orders/${orderId}/reject`, {
        method: "POST"
      })
  
    console.log("Status Socket =", socket);
     if (!socket) return;
  socket.emit('order:updateStatus', { orderId, status: 'Rejected' });
     }


async function loadExistingOrders() {
  console.log("Star loadExistingOrders");
  try {
    const res = await fetch(`/api/orders/mobileDashboard/${RESTAURANT_ID}`);
    const orders = await res.json();

 console.log("Filter order", orders);
    // orders.forEach(order => showOrder(order));
    orders.forEach(order => renderOrder(order));


  } catch (err) {
    console.error("Failed to load existing orders", err);
  }
}

//////////////





function renderOrder(order, position = "bottom") {
  const div = document.createElement('div');
  div.className = 'order-box';
  div.id = `order_${order._id}`;

  div.innerHTML = `
    <h3>🆕 Repair Request ${order.ticketId}</h3>

    <div class="order-body">
      <div class="order-left">
        <p><strong>Customer:</strong> ${order.customerFirstName} ${order.customerLastName}</p>
        <p><strong>Phone:</strong> ${order.customerPhone}</p>
        <p><strong>Email:</strong> ${order.customerEmail}</p>
        <p><strong>Address:</strong> ${order.customerAddress}</p>
        <p><strong>State:</strong> ${order.customerState} |
           <strong>City:</strong> ${order.customerCity}</p>
        <p><strong>Pincode:</strong> ${order.customerPincode}</p>
      </div>

      <div class="order-right">
        ${
          order.video?.url
            ? `<video controls src="${order.video.url}"></video>`
            : `<p class="no-video">No video provided</p>`
        }
      </div>
    </div>

    <p id="status_${order._id}"><strong>Status:</strong> ${order.status}</p>

    <div class="order-actions" id="actions_${order._id}">
      <button class="accept"  onclick="acceptOrder('${order._id}')">Accept</button>
      <button class="reject" onclick="rejectOrder('${order._id}')">Reject</button>
    </div>
  `;

  const container = document.getElementById('orders');

  position === "top" 
    ? container.prepend(div)   // 🔥 new order
    : container.appendChild(div); // old orders
}

///////////////