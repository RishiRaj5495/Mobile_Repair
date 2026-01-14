

// SOCKET CONNECTION
const socket = io();

// socket.on('connect', () => {
//   console.log("Admin socket connected:", socket.id);
// });

// socket.on('disconnect', () => {
//   console.log("Admin socket DISCONNECTED");
// });
/////////////////////////////////



socket.on("connect", () => {
  console.log("Customer socket connected:", socket.id);

  if (typeof ORDER_ID !== "undefined") {
    socket.emit("join_order", ORDER_ID);
    console.log("Joined order room:", ORDER_ID);
  }
});

socket.on("disconnect", () => {
  console.log("Customer socket disconnected");
});
/////////////////



const form = document.getElementById('orderForm');

form.addEventListener('submit', async (e) => {
 e.preventDefault();
  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    return; 
  }

  form.classList.add('was-validated');
    const submitBtn = document.getElementById("place");
  const spinner = submitBtn.querySelector(".spinner-border");
  const btnText = submitBtn.querySelector(".btn-text");
    submitBtn.disabled = true;
    spinner.classList.remove("d-none");
    btnText.textContent = "Forwarding...";
    console.log("Form start collect information");

  
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
////////

// navigator.geolocation.getCurrentPosition((pos) => {
//   formData.append("lat", pos.coords.latitude);
//   formData.append("lng", pos.coords.longitude);
// });
navigator.geolocation.getCurrentPosition(
  (pos) => {
    formData.append("lat", pos.coords.latitude);
    formData.append("lng", pos.coords.longitude);

    // ✅ SEND AFTER LOCATION
    xhr.send(formData);
  },
  (err) => {
    alert("Location permission required");
    resetSubmitBtn();
  }
);





////////////
const xhr = new XMLHttpRequest();
xhr.open("POST", "/api/orders");

// UPLOAD PROGRESS
xhr.upload.onprogress = function (e) {
  if (e.lengthComputable) {
    const percent = Math.round((e.loaded / e.total) * 100);
    btnText.textContent = `Forwading... ${percent}%`;
  }
};

// SUCCESS RESPONSE
xhr.onload = function () {
  const data = JSON.parse(xhr.responseText);
  console.log("Order Response:", data);

  if (data?.success === true && data?.redirectUrl) {
    window.location.href = data.redirectUrl;
  } else {
    alert('Order created: ' + (data.order ? data.order._id : 'Check console'));
    resetSubmitBtn();
  }
};

// ERROR
xhr.onerror = function () {
  alert("Upload failed");
  resetSubmitBtn();
};

// SEND DATA
// xhr.send(formData);
function resetSubmitBtn() {
  spinner.classList.add('d-none');
  btnText.textContent = 'Forward Request';
  submitBtn.disabled = false;
}
  

  
});
///////////////////////////////



