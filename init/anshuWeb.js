

let add_PriceList_Item = document.querySelector('.mainContent');
let innHtml = '';

function priceList(){

 problem.forEach(item => {

 innHtml += ` 

<div class="content1">
  <div class="item_Content">
    <div class="problemView">
      <h4 class="problem_Name">${item.problem_Name}</h4>
    </div>

    <div class="image_And_Problem">
      <div class="image_data">
        <span class="problem">
          ${item.problem_Dotted}
        </span>
      </div>
    </div>
  </div>

  <!-- Button stays inside content1 -->
  <div class="view-more-wrapper">
    <button
      type="button"
      class="btn btn-sm btn-outline-primary"
      data-bs-target="#exampleModal${item.ID}"
      data-bs-toggle="modal"
    >
      view more
    </button>
  </div>
</div>

 `;
})
add_PriceList_Item.innerHTML = innHtml;
}

// Accessories----------------------------->