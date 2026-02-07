

// let add_PriceList_Item = document.querySelector('.mainContent');

// let innHtml = '';

// function priceList(){

//  problem.forEach(item => {

//  innHtml += ` 

// <div class="content1">

//         <div class="item_Content">
//           <div class="problemView"><h4 class="problem_Name">${item.problem_Name}</h4>
//   </div>
//        <div class="image_And_Problem">
//        <div class="image_data">
//        <span class="problem">
//        ${item.problem_Dotted}
        
//        </span><br>
       
//       </div>
//     </div>
//     </div>

//     <!-- lll -->


// <!-- Button trigger modal -->
// <button type="button" class="btn btn-sm button btn-outline-primary no-shadow" data-bs-target="#exampleModal${item.ID}" data-bs-toggle="modal">
//   view more
// </button>
  
//   <!-- Modal -->
//   <div class="modal fade" id="exampleModal${item.ID}"  tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
//     <div class="modal-dialog">
//       <div class="modal-content">
//         <div class="modal-header">
//           <h5 class="modal-title" id="exampleModalLabel"> 
           
//           ${item.problem_Name}
//           </h5>
//           <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
//         </div>
//         <div class="modal-body">

//         <div class="image">
//           <img src=" ${item.Image}" alt="micRepair" class="micRepair">
//           </div>


//           <div class="image_data">
//             <span class="problem1">
//            ${item.problem_Full}


         
//             </span>
           
//            </div>
          
//         </div>
//         <div class="modal-footer">
//           <a href="/listings" type="button" class="btn btn-danger  btn-md">Click to repair</a> 

//         </div>
//       </div>
//     </div>
//   </div>
//   <!-- lll -->
//   </div>
 
//  `

// }

// )

//   add_PriceList_Item.innerHTML = innHtml;

// }
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


// Accessories----------------------------->

