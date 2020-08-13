var ratedIndex = -1, uID = 0;
$(document).ready(function(){
  var h1 = document.querySelector('h1');

  $('.delete-article').on('click', function(e){
    $target = $(e.target);
    const id = $target.attr('data-id');
    $.ajax({
      type:'DELETE',
      url: '/articles/'+id,
      success: function(response){
        alert('Deleting Article');
        window.location.href='/';
      },
      error: function(err){
        console.log(err);
      }
    });
  });

  $("#wrapper").addClass('toggled');
  $("#menu-toggle").click(function(e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
  });
  // $("#toggleSidebar").click(function(){
  //   document.getElementById('sidebar').classList.toggle('active');
  // });
  $('.delete-learner').on('click', function(e){
    $target = $(e.target);
    const id = $target.attr('data-id');
    $.ajax({
      type:'DELETE',
      url: '/learners/'+id,
      success: function(response){
        alert('Deleting Learner');
        window.location.href='/admin/';
      },
      error: function(err){
        console.log(err);
      }
    });
  });

  $('.delete-teacher').on('click', function(e){
    $target = $(e.target);
    const id = $target.attr('data-id');
    $.ajax({
      type:'DELETE',
      url: '/teachers/'+id,
      success: function(response){
        alert('Deleting Teacher');
        window.location.href='/admin/';
      },
      error: function(err){
        console.log(err);
      }
    });
  });

  //Rating testing
  resetStarColors();
  if (localStorage.getItem('ratedIndex') != null) {
    setStars(parseInt(localStorage.getItem('ratedIndex')));
  }

  $('.fa-star').on('click', function(){
    ratedIndex = parseInt($(this).data('index'));
    localStorage.setItem('ratedIndex', ratedIndex);
    saveToDB();
  });

  $('.fa-star').mouseover(function(){
    resetStarColors();
    var currentIndex = parseInt($(this).data('index'));
    setStars(currentIndex);
  });

  $('.fa-star').mouseleave(function(){
    resetStarColors();
    if (ratedIndex != -1) {
      setStars(ratedIndex);
    }
  });
});
function setStars(max){
  for (var i = 0; i <= max; i++) {
    $('.fa-star:eq('+i+')').css('color', 'yellow');
    document.getElementById('str').innerHTML = max+1;
  }
}

function resetStarColors(){
  $('.fa-star').css('color', 'white');
}

function saveToDB(e){
  $target = $(e.target);
  const id = $target.attr('data-id');
  $.ajax({
    type:'POST',
    url: '/courses/'+id,
    data: {
      // save: 1,
      uID: uID,
      ratedIndex: ratedIndex
    },
    success: function(response){
      uID = response.uID;
      alert('Rated Stars');
      window.location.href='/courses/';
    },
    error: function(err){
      console.log(err);
    }
  })
}








// $("#menu-toggle").click(function(e) {
//   console.log("sidebar works");
//   e.preventDefault();
//   $("#wrapper").toggleClass("toggled");
// });
