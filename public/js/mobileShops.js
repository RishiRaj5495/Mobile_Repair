
/////////////////
let socket;

document.addEventListener("DOMContentLoaded", async () => {

  socket = io();

  socket.on("connect", () => {
    console.log("Shop socket connected:", socket.id);

    // Join order room ONLY if order page
    if (typeof CURRENT_ORDER_ID !== "undefined") {
      socket.emit("join_order", CURRENT_ORDER_ID);
      console.log("Shop joined order room:", CURRENT_ORDER_ID);
    }

    // existing restaurant join (dashboard)
    // socket.emit("restaurant:join", RESTAURANT_ID); new'''''''''''''''''''''''''''''''''''''''''''''''
  });

  socket.on("new_order", order => {
    showOrder(order);
  });

  socket.on("order_status_changed", order => {
    updateOrderUI(order);
  });

});


/////////////



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



// let socket;   map

document.addEventListener("DOMContentLoaded", async () => {
  if (!RESTAURANT_ID) {
    console.error("Restaurant ID missing");
    return;
  }

  // 1. Register FCM token
  await registerForNotifications(RESTAURANT_ID);

  // 2. Connect socket
  socket = io();

  socket.on("connect", () => {
    socket.emit("restaurant:join", RESTAURANT_ID);
    console.log("Restaurant connected:", RESTAURANT_ID);
  });

  socket.on("new_order", order => {
    showOrder(order);
  });

  socket.on("order_status_changed", order => {
    updateOrderUI(order);
  });
});


function showOrder(order) {
  const div = document.createElement('div');
  div.className = 'order-box';
  div.id = `order_${order._id}`;

  div.innerHTML = `
    <h3>🆕 New Order #${order._id}</h3>

    <div class="order-body">

      <!-- LEFT : Customer details -->
      <div class="order-left">
        <p><strong>Customer:</strong> ${order.customerFirstName || ''} ${order.customerLastName || ''}</p>
        <p><strong>Phone:</strong> ${order.customerPhone || 'N/A'}</p>
        <p><strong>Email:</strong> ${order.customerEmail || 'N/A'}</p>
        <p><strong>Address:</strong> ${order.customerAddress || ''}</p>
        <p><strong>State:</strong> ${order.customerState || ''} | 
           <strong>City:</strong> ${order.customerCity || ''}</p>
        <p><strong>Pincode:</strong> ${order.customerPincode || ''}</p>
      </div>

      <!-- RIGHT : Video -->

<div class="order-right" style="display: flex;
    flex-direction: column;
    align-items: anchor-center;">
  <div class="video-title"  style=" font-weight: 600;
  margin-bottom: 6px;" >📹 Issue Video</div>

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
      <p><strong>Forwarded To Shop:</strong> ${order.restaurant?.name || ''}</p>
      <p><strong>Shop Address:</strong> ${order.restaurant?.address || ''}</p>
      <p><strong>Shop Mobile:</strong> ${order.restaurant?.mobile || ''}</p>
    </div>


    <p id="status_${order._id}"><strong>Status:</strong> Pending</p>

<div class="order-actions" id="actions_${order._id}">
  <button class="accept" onclick="acceptOrder('${order._id}')">Accept</button>
  <button class="reject" onclick="rejectOrder('${order._id}')">Reject</button>
  
</div>

  `;

  document.getElementById('orders').appendChild(div);
}



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

function acceptOrder(orderId) {
  fetch(`/orders/${orderId}/accept`, {
    method: "POST"
  })
    .then(res => {
      if (!res.ok) throw new Error("Failed to accept order");
      window.location.href = `/delivery/${orderId}`;
    })
    .catch(err => console.error(err));
}


function rejectOrder(orderId) {
    console.log("Status Socket =", socket);
  if (!socket) return;
  socket.emit('order:updateStatus', { orderId, status: 'Rejected' });
}



