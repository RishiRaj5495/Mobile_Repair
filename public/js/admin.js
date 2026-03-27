
window.socket = io();
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
const form = document.getElementById('orderForm');

if (form) {

form.addEventListener("input", (e) => {
  const input = e.target;

  // ignore elements without id (safety)
  if (!input.id) return;

  const error = document.getElementById(input.id + "Error");

  // ✅ Handle normal inputs
  if (input.type !== "file") {
    if (input.value.trim()) {
      input.classList.remove("border", "border-danger");
      if (error) error.classList.add("d-none");
    }
  }

  // ✅ Hide global error
  document.getElementById("formError").classList.add("d-none");
});

form.addEventListener('submit', async (e) => {
 e.preventDefault();
   let isValid = true;

  const fields = [
    "customerFirstName",
    "customerLastName",
    "customerPhone",
    "customerEmail",
    "customerAddress",
    "customerCity",
    "customerState",
    "customerPincode",
    "customerCountry",
    "video"
  ];

  fields.forEach(id => {
    const input = document.getElementById(id);
    const error = document.getElementById(id + "Error");

    const value = input.type === "file"
      ? input.files.length
      : input.value.trim();

    if (!value) {
      error.classList.remove("d-none");
      input.classList.add("border", "border-danger");
      isValid = false;
    } else {
      error.classList.add("d-none");
      input.classList.remove("border", "border-danger");
    }
  });

  if (!isValid) {
    showFormError("Please fill all required fields correctly");
    return;
  }

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

const xhr = new XMLHttpRequest();
xhr.open("POST", "/api/orders");
xhr.upload.onprogress = function (e) {
  if (e.lengthComputable) {
    const percent = Math.round((e.loaded / e.total) * 100);
    btnText.textContent = `Forwading... ${percent}%`;
  }
};

xhr.onload = function () {
  const data = JSON.parse(xhr.responseText);
  console.log("Order Response:", data);

  if (data?.success === true && data?.redirectUrl) {
    // window.location.href = data.redirectUrl;
     window.location.replace(data.redirectUrl);
  } else {
showFormError("Something went wrong. Please try again.");
    resetSubmitBtn();
  }
};
xhr.onerror = function () {
showFormError("Upload failed. Please try again.");
  resetSubmitBtn();
};


function resetSubmitBtn() {
  spinner.classList.add('d-none');
  btnText.textContent = 'Forward Request';
  submitBtn.disabled = false;
}
  navigator.geolocation.getCurrentPosition(
  (pos) => {
    formData.append("lat", pos.coords.latitude);
    formData.append("lng", pos.coords.longitude);

    xhr.send(formData);
  },
  (err) => {
 showFormError("Please allow location access to continue.");
    resetSubmitBtn();
  }
);
});
}






