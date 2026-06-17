
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
  const phone = document.getElementById("customerPhone").value.trim();
const pincode = document.getElementById("customerPincode").value.trim();
const email = document.getElementById("customerEmail").value.trim();

if (!/^\d{10}$/.test(phone)) {
  showFormError("Phone number must be exactly 10 digits");
  resetSubmitBtn();
  return;
}

if (!/^\d{6}$/.test(pincode)) {
  showFormError("Pincode must be exactly 6 digits");
  resetSubmitBtn();
  return;
}

if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  showFormError("Please enter a valid email");
  resetSubmitBtn();
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
console.log("Customer First Name:", customerFirstName);
  const video = document.querySelector('#video').files[0];
  const cloudinaryData = new FormData();

cloudinaryData.append("file", video);

cloudinaryData.append(
  "upload_preset",
  "repairnow_videos" // your upload preset
);

const cloudinaryRes = await fetch(
  `https://api.cloudinary.com/v1_1/${window.CLOUDINARY_NAME}/video/upload`,
  {
    method: "POST",
    body: cloudinaryData
  }
);

const cloudinaryJson = await cloudinaryRes.json();


const videoUrl = cloudinaryJson.secure_url;



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
  // formData.append('video', video);
  formData.append('videoUrl', videoUrl);

const xhr = new XMLHttpRequest();
xhr.open("POST", "/api/orders/booking/prepare");
xhr.upload.onprogress = function (e) {
  if (e.lengthComputable) {
    const percent = Math.round((e.loaded / e.total) * 100);
    btnText.textContent = `Forwading... ${percent}%`;
  }
};


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




xhr.onload = async function () {

  const data = JSON.parse(xhr.responseText);

  console.log("Prepare Response:", data);

  if (!data.success) {
    showFormError(data.message || "Something went wrong.");
    resetSubmitBtn();
    return;
  }

  try {

    const response = await fetch("/api/orders/booking/create-order", {
      method: "POST"
    });

    const paymentData = await response.json();

    console.log("Razorpay Order:", paymentData);

    if (!paymentData.success) {
      showFormError(paymentData.message);
      resetSubmitBtn();
      return;
    }

    const options = {
      key: paymentData.key,

      amount: paymentData.razorpayOrder.amount,

      currency: paymentData.razorpayOrder.currency,

      name: "RepairNow",

      description: "Advance Booking Payment",

      order_id: paymentData.razorpayOrder.id,

      handler: async function (response) {
 console.log("Payment Success:", response);
        const verifyRes = await fetch(
          "/api/orders/verify-payment",
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json"
            },

            body: JSON.stringify({
              razorpay_order_id:
               response.razorpay_order_id,

              razorpay_payment_id:
                response.razorpay_payment_id,

              razorpay_signature:
                response.razorpay_signature
            })
          }
        );

        const verifyData = await verifyRes.json();

        if (verifyData.success) {

          window.location.href =
            verifyData.redirectUrl;

        } else {

          showFormError("Payment verification failed.");

          resetSubmitBtn();

        }
          
      },
      modal: {
    ondismiss: function () {

      console.log("Payment popup closed by user");

      showFormError("Payment cancelled.");

      resetSubmitBtn();
    }
  },

      prefill: {
        name:
          customerFirstName + " " + customerLastName,

        email: customerEmail,

        contact: customerPhone
      },

      theme: {
        color: "#3399cc"
      }
    };

    const rzp = new Razorpay(options);
rzp.on("payment.failed", function (response) {

  // console.log("Payment Failed Full Response:", response);

  // console.log("Error:", response.error);

  // console.log("Description:", response.error.description);

  // console.log("Code:", response.error.code);

  showFormError(
    response.error.description || "Payment failed."
  );

  resetSubmitBtn();   // ⭐ Important
});

    rzp.open();

  } catch (err) {

    console.error(err);

    showFormError("Unable to initiate payment.");

    resetSubmitBtn();

  }

};















///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////







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






