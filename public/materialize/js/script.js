//Sidenav
$(document).ready(function(){
    $('.sidenav').sidenav();
});

//Modal
$(document).ready(function(){
  $('.modal').modal();
});


//Slider
$(document).ready(function(){
  $('.slider').slider();
});

//Select Input
$(document).ready(function(){
    $('select').formSelect();
});


//Nav Dropdown
$(document).ready(function(){  
  $(".dropdown-trigger").dropdown();        
});

$(document).ready(function(){
  $("#myInput").on("keyup", function() {
    var value = $(this).val().toLowerCase();
    $("#myTable tr").filter(function() {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
    });
  });
});

// We register the plugins required to do 
// image previews, cropping, resizing, etc.
/* FilePond.registerPlugin(
  FilePondPluginFileValidateType,
  FilePondPluginImageExifOrientation,
  FilePondPluginImagePreview,
  FilePondPluginImageCrop,
  FilePondPluginImageResize,
  FilePondPluginImageTransform,
  FilePondPluginImageEdit
); */

// Select the file input and use 
// create() to turn it into a pond
/* FilePond.create(
  document.querySelector('input'),
  {
    labelIdle: `Drag & Drop your picture or <span class="filepond--label-action">Browse</span>`,
    imagePreviewHeight: 170,
    imageCropAspectRatio: '1:1',
    imageResizeTargetWidth: 200,
    imageResizeTargetHeight: 200,
    stylePanelLayout: 'compact circle',
    styleLoadIndicatorPosition: 'center bottom',
    styleProgressIndicatorPosition: 'right bottom',
    styleButtonRemoveItemPosition: 'left bottom',
    styleButtonProcessItemPosition: 'right bottom',
  }
); */