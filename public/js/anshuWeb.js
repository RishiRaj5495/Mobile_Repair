const priceDetails = {
  1: [ // Data Recovery
    { title: "Accidental Delete Recovery", price: "₹1,000 – ₹3,000" },
    { title: "Formatted Phone Recovery", price: "₹3,000 – ₹8,000" },
    { title: "Dead Phone / Chip Level Recovery", price: "₹8,000 – ₹20,000" }
  ],

  2: [ // Mic Repair
    { title: "Mic Cleaning", price: "₹300 – ₹600" },
    { title: "Mic Replacement", price: "₹800 – ₹1,500" }
  ],

  3: [ // Overheating
    { title: "Software Optimization", price: "₹500 – ₹1,000" },
    { title: "Battery Replacement", price: "₹1,200 – ₹2,500" },
    { title: "Motherboard Issue", price: "₹2,000 – ₹6,000" }
  ],

  4: [ // Network Issue
    { title: "Software / Setting Fix", price: "₹400 – ₹800" },
    { title: "Antenna Replacement", price: "₹1,000 – ₹2,500" }
  ],

  5: [ // Memory Slot
    { title: "Slot Cleaning", price: "₹300 – ₹600" },
    { title: "Slot Replacement", price: "₹1,200 – ₹2,500" }
  ],

  6: [ // Camera
    { title: "Camera Cleaning", price: "₹400 – ₹800" },
    { title: "Front Camera Replacement", price: "₹1,000 – ₹2,500" },
    { title: "Rear Camera Replacement", price: "₹1,500 – ₹5,000" }
  ],

  7: [ // Power Button
    { title: "Button Cleaning", price: "₹300 – ₹600" },
    { title: "Button Replacement", price: "₹800 – ₹1,500" }
  ],

  8: [ // SIM Slot
    { title: "SIM Slot Cleaning", price: "₹300 – ₹600" },
    { title: "SIM Slot Replacement", price: "₹1,000 – ₹2,000" }
  ],

  9: [ // Water Damage
    { title: "Basic Cleaning", price: "₹800 – ₹1,500" },
    { title: "Component Replacement", price: "₹2,000 – ₹6,000" }
  ],

  10: [ // Screen
    { title: "Display Glass Replacement", price: "₹1,200 – ₹3,000" },
    { title: "Full Display Replacement", price: "₹2,500 – ₹8,000" }
  ],

  11: [ // Battery
    { title: "Battery Replacement", price: "₹1,000 – ₹2,500" }
  ],

  12: [ // Charging Port
    { title: "Port Cleaning", price: "₹300 – ₹600" },
    { title: "Port Replacement", price: "₹800 – ₹1,800" }
  ],

  13: [ // Back Glass
    { title: "Back Glass Replacement", price: "₹1,500 – ₹4,000" }
  ],

  14: [ // Virus
    { title: "Virus / Malware Removal", price: "₹400 – ₹1,000" }
  ],

  15: [ // Speaker
    { title: "Speaker Cleaning", price: "₹300 – ₹600" },
    { title: "Speaker Replacement", price: "₹800 – ₹2,000" }
  ],

  16: [ // Auto Switch Off
    { title: "Software Fix", price: "₹500 – ₹1,000" },
    { title: "Battery / Hardware Fix", price: "₹1,500 – ₹4,000" }
  ]
};

function getMinimumRange(id) {
  const prices = priceDetails[id];
  if (!prices) return "₹500 – ₹1,000";

  let min = Infinity;
  let max = 0;

  prices.forEach(item => {
    const numbers = item.price.match(/\d+/g);
    if (numbers) {
      const low = parseInt(numbers[0]);
      const high = parseInt(numbers[1]);

      if (low < min) {
        min = low;
        max = high;
      }
    }
  });

  return `₹${min} – ₹${max}`;
}


const container = document.querySelector('.priceListContainer');

function renderPriceList(data) {
  if (!container) return;

  const html = data.map(item => `
    <div class="col-md-6 col-lg-4">
      <div class="card price-card h-100 border-0">
        <div class="card-body d-flex flex-column">

          <h5 class="fw-bold">${item.problem_Name}</h5>

          <p class="text-muted small flex-grow-1">
            ${item.problem_Dotted}
          </p>


            <button 
            class="btn btn-sm btn-outline-primary mt-3"
            data-bs-toggle="modal"
            data-bs-target="#exampleModal${item.ID}">
            View Details
          </button>

        </div>
      </div>
    </div>

    ${createModal(item)}

  `).join("");

  container.innerHTML = html;
}

function createModal(item) {
  return `
    <div class="modal fade" id="exampleModal${item.ID}" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content premium-modal border-0">
          <div class="modal-header border-0">
            <h5 class="fw-bold">${item.problem_Name}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="row align-items-center">
              <div class="col-md-5 text-center">
                <img src="${item.Image}" class="img-fluid rounded-3 shadow-sm">
              </div>
              <div class="col-md-7">
                <p class="text-muted">${item.problem_Full}</p>



                <a href="/listings" class="primary-btn mt-3 d-inline-block">
                  Click to Repair
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}


