

let add_PriceList_Item = document.querySelector('.mainContent');

let innHtml = '';

function priceList(){

 problem.forEach(item => {

 innHtml += ` 

<div class="content1">

        <div class="item_Content">
          <div class="problemView"><h4 class="problem_Name">${item.problem_Name}</h4>
  </div>
       <div class="image_And_Problem">
       <div class="image_data">
       <span class="problem">
       ${item.problem_Dotted}
        
       </span><br>
       
      </div>
    </div>
    </div>

    <!-- lll -->


<!-- Button trigger modal -->
<button type="button" class="btn btn-sm button btn-outline-primary no-shadow" data-bs-target="#exampleModal${item.ID}" data-bs-toggle="modal">
  view more
</button>
  
  <!-- Modal -->
  <div class="modal fade" id="exampleModal${item.ID}"  tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel"> 
           
          ${item.problem_Name}
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">

        <div class="image">
          <img src=" ${item.Image}" alt="micRepair" class="micRepair">
          </div>


          <div class="image_data">
            <span class="problem">
           ${item.problem_Full}


         
            </span>
           
           </div>
          
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-danger  btn-md">Call Now</button> 
        </div>
      </div>
    </div>
  </div>
  <!-- lll -->
  </div>
 
 `

}

)

  add_PriceList_Item.innerHTML = innHtml;

}

// Accessories----------------------------->

