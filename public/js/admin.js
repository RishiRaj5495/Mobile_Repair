
// window.socket = io();
console.log("window.socket before use =", window.socket);
window.socket.on("connect", () => {
  console.log("Customer socket connected:", socket.id);
  if (typeof ORDER_ID !== "undefined") {
    socket.emit("join_order", ORDER_ID);
    console.log("Joined order room:", ORDER_ID);
  }
});



window.socket.on("disconnect", () => {
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
  if (!video.type.startsWith("video/")) {
    alert("Please select a valid video file.");
    return;
}
const maxSize = 50 * 1024 * 1024;

if (video.size > maxSize) {
    alert("Video must be smaller than 50 MB.");
    return;
}

// ============================================
// AI VIDEO VALIDATION
// ============================================

// const aiFormData = new FormData();

// aiFormData.append("file", video);

// let aiResult;

// try {

//     const aiResponse = await fetch(
//         "http://127.0.0.1:8000/analyze-video",
//         {
//             method: "POST",
//             body: aiFormData
//         }
//     );

//     if (!aiResponse.ok) {

//         alert("Video analysis failed. Please try again.");
//         return;
//     }

//     aiResult = await aiResponse.json();
//     console.log(aiResult);

// } catch (error) {

//     console.error("AI Service Error:", error);

//     alert(
//         "Unable to validate the video. Please try again."
//     );

//     return;
// }


// const decision = aiResult.decision;

// console.log("AI Decision:", decision);

// if (decision.status === "INVALID") {

//     alert(
//         "The video is not suitable for further processing."
//     );

//     return;
//}


// ============================================
// AI VIDEO VALIDATION
// ============================================

const aiFormData = new FormData();

aiFormData.append("file", video);


// ============================================
// AI PROCESSING UI ELEMENTS
// ============================================

const videoProcessing =
    document.getElementById("videoProcessing");

const videoResult =
    document.getElementById("videoResult");

const processingMessage =
    document.getElementById("processingMessage");

const videoProgressBar =
    document.getElementById("videoProgressBar");

const progressPercentage =
    document.getElementById("progressPercentage");

const stepUpload =
    document.getElementById("stepUpload");

const stepExtract =
    document.getElementById("stepExtract");

const stepAI =
    document.getElementById("stepAI");

const stepDecision =
    document.getElementById("stepDecision");


// ============================================
// HELPER FUNCTIONS
// ============================================

function updateProgress(percent) {

    videoProgressBar.style.width =
        percent + "%";

    progressPercentage.textContent =
        percent + "%";

    videoProgressBar.setAttribute(
        "aria-valuenow",
        percent
    );
}


function resetStep(step, number) {

    step.classList.remove(
        "active",
        "processing",
        "completed"
    );

    const icon =
        step.querySelector(".step-icon");

    if (icon) {
        icon.textContent = number;
    }
}


function processingStep(
    step,
    message,
    percent
) {

    step.classList.add("processing");

    processingMessage.textContent =
        message;

    updateProgress(percent);
}


function completeStep(step) {

    step.classList.remove(
        "processing"
    );

    step.classList.add(
        "completed"
    );

    const icon =
        step.querySelector(".step-icon");

    if (icon) {
        icon.textContent = "✓";
    }
}


function delay(ms) {

    return new Promise(
        resolve => setTimeout(resolve, ms)
    );
}


// ============================================
// RESET PROCESSING UI
// ============================================

resetStep(stepUpload, "1");
resetStep(stepExtract, "2");
resetStep(stepAI, "3");
resetStep(stepDecision, "4");

updateProgress(0);

videoResult.classList.add("d-none");
videoResult.innerHTML = "";

videoProcessing.classList.remove("d-none");


// ============================================
// STEP 1 - VIDEO UPLOADED
// ============================================

stepUpload.classList.add("processing");

processingMessage.textContent =
    "Video uploaded. Preparing AI validation...";

updateProgress(10);

await delay(500);

completeStep(stepUpload);

updateProgress(20);


// ============================================
// STEP 2 - FRAME & AUDIO EXTRACTION
// ============================================

processingStep(
    stepExtract,
    "Extracting video frames & audio...",
    35
);


// ============================================
// CALL FASTAPI
// ============================================

try {

    const response = await fetch(
        "https://repairnow-ai.onrender.com/analyze-video",
        {
            method: "POST",
            body: aiFormData
        }
    );


    if (!response.ok) {

        throw new Error(
            "AI validation failed"
        );
    }


    const aiResult =
        await response.json();


    console.log(
        "AI Validation Result:",
        aiResult
    );


    // ========================================
    // STEP 2 COMPLETE
    // ========================================

    completeStep(stepExtract);

    updateProgress(60);


    // ========================================
    // STEP 3 - AI ANALYSIS
    // ========================================

    processingStep(
        stepAI,
        "Running YOLO & speech analysis...",
        70
    );

    await delay(500);

    completeStep(stepAI);


    // ========================================
    // STEP 4 - DECISION
    // ========================================

    processingStep(
        stepDecision,
        "Generating validation result...",
        90
    );

    await delay(500);

    completeStep(stepDecision);

    updateProgress(100);

    processingMessage.textContent =
        "AI video validation completed.";

    await delay(500);


    // ========================================
    // GET AI DECISION
    // ========================================

 const decisionData = aiResult.decision;

const status = decisionData.status;
const score = decisionData.score;
const reason = decisionData.reason;




    // ========================================
    // VALID VIDEO
    // ========================================

    if (
         status === "VALID" ||
         status === "REVIEW"
    ) {

          videoResult.classList.remove("d-none");

    videoResult.innerHTML = `

        <div class="alert alert-success">

            <strong>
                ✅ Video Valid
            </strong>

            <div class="small mt-1">
                ${reason}
            </div>

            <div class="small mt-1">
                AI Confidence Score: ${score}
            </div>

        </div>

    `;

    videoProcessing.classList.add("d-none");

    // Continue to Cloudinary upload
        // IMPORTANT:
        // Do NOT return here.
        //
        // The code below this AI block
        // continues to Cloudinary upload.
    }


    // ========================================
    // INVALID VIDEO
    // ========================================

    else {

       videoResult.classList.remove("d-none");

    videoResult.innerHTML = `

        <div class="alert alert-danger">

            <strong>
                ❌ Video Invalid
            </strong>

            <div class="small mt-1">
                ${reason}
            </div>

            <div class="small mt-2">
                Please upload another repair video.
            </div>

        </div>

    `;

    videoProcessing.classList.add("d-none");

    resetSubmitBtn();

    return;
    }


} catch (error) {

    console.error(
        "AI Service Error:",
        error
    );


    videoResult.classList.remove(
        "d-none"
    );


    videoResult.innerHTML = `

        <div class="alert alert-danger">

            <strong>
                ❌ AI Validation Failed
            </strong>

            <div class="small mt-1">
                Unable to connect to the video
                validation service.
            </div>

            <div class="small mt-1">
                Please try again.
            </div>

        </div>

    `;


    videoProcessing.classList.add(
        "d-none"
    );


    resetSubmitBtn();

    return;
}



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
  if (!cloudinaryRes.ok) {
        throw new Error("Cloudinary upload failed");
    }

const cloudinaryJson = await cloudinaryRes.json();
  if (!cloudinaryJson.secure_url) {
        throw new Error("Cloudinary did not return video URL");
    }


const videoUrl = cloudinaryJson.secure_url;

    const optimizedVideoUrl = videoUrl.replace(
        "/video/upload/",
        "/video/upload/c_scale,w_1280,h_720/q_auto/f_auto/"
    );

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
  formData.append('videoUrl', optimizedVideoUrl);

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






