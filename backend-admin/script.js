const dragArea = $('.drag-n-drop');
const fileInput = $('input[type=file]');

// show different forms according to the url
$(document).ready(function () {
  const anchor = window.location.hash;
  if (anchor) {
    $(`${anchor}`).show();
  } else {
    $('#home').show();
  }
});

// get product details when pid chnages in edit product form
function onPidChange() {
  const pid = $('#edit_prod_pid').val();
  $.ajax({
    type: 'GET',
    url: 'admin-process.php',
    data: {
      pid: pid,
      action: 'prod_fetchOne',
      role: 'admin',
    },
    success: function (result) {
      if (result.success) {
        $('#pid_error').html('');
        $('#edit_prod_catid').val(result.success.catid).change();
        $('.edit_prod_field').prop('disabled', false);
        $('#edit_prod_submit').prop('disabled', false);
        $('#edit_prod_name').val(result.success.name).change();
        $('#edit_prod_price').val(result.success.price).change();
        $('#edit_prod_inventory').val(result.success.inventory).change();
        $('#edit_prod_desc').val(result.success.description).change();
        if (result.success.image) {
          $('#edit_prod_old_image_name').html(result.success.image.replace('http://localhost/ierg4210/lib/images/', ''));
          // $('#edit_prod_old_image_name').html(result.success.image.replace('http://3.234.101.228/admin/lib/images/', ''));
        } else {
          $('#edit_prod_old_image_name').html('No image');
        }
        $(dragArea[1]).removeClass('disabled');
      } else if (result.failed) {
        $('#pid_error').html(result.failed);
        $('.edit_prod_field').val('').change();
        $('.edit_prod_field').prop('disabled', true);
        $('#edit_prod_submit').prop('disabled', true);
        $('#edit_prod_old_image_name').html('No image');
        $(dragArea[1]).addClass('disabled');
      }
    },
  });
}

// get category details when catid chnages in edit category form
function onCatidChange() {
  const catid = $('#edit_cat_catid').val();
  $.ajax({
    type: 'GET',
    url: 'admin-process.php',
    data: {
      catid: catid,
      action: 'cat_fetchOne',
      role: 'admin',
    },
    success: function (result) {
      $('#edit_cat_name').val(result.success.name).change();
      $('#cat_edit input').prop('disabled', false);
    },
  });
}

// toggle between category and product sections
function toggleSection(id) {
  $('section').not(id).hide();
  $(id).show();
}

// handle image onerror (show error image)
function onImageError(pid) {
  $(`#img-${pid}`).attr('src', 'https://developers.google.cn/maps/documentation/streetview/images/error-image-generic.png?hl=ja');
}

// prevent default submit action by pressing enter key
$('fieldset input').keydown(function (e) {
  if (e.keyCode == 13) {
    e.preventDefault();
    return false;
  }
});

// warn user to select image if no image is selected when submit
$('#prod_insert').submit(function (event) {
  if (!$(fileInput[0]).val()) {
    console.log($(fileInput[0]));
    $('#image_error').html('Please select an image');
    event.preventDefault();
    return;
  }
});

// change password
function changePassword(event) {
  event.preventDefault();
  $.ajax({
    type: 'GET',
    url: 'auth-process.php',
    data: { action: 'getNonce', params: 'change_password' },
    success: function (result) {
      if (result.success) {
        const formData = {
          action: 'change_password',
          email: $('#email').val(),
          old_password: $('#old_password').val(),
          new_password: $('#new_password').val(),
          nonce: result.success,
        };
        $.ajax({
          type: 'POST',
          url: 'auth-process.php',
          data: formData,
          success: function (result) {
            if (result.failed) {
              alert(result.failed);
            } else {
              window.location.href = 'login.php';
            }
          },
        });
      }
    },
  });
}

/************************************************
 * Drag and drop image upload functions
 ************************************************/

// listen to file input change event
fileInput.on('change', function () {
  id = $(this).attr('id');
  index = Number(id.charAt(id.length - 1));
  // only trigger file upload when user selects a file
  if (this.files) {
    showThumbnail(index, this.files, 'input');
  }
});

// trigger file input
function triggerFileUpload(index) {
  fileInput[index].click();
}

// drag over event
function handleDragOver(event) {
  event.preventDefault();
}

// drop event
function handleOnDrop(event) {
  event.preventDefault();
  files = event.dataTransfer.files;
  // get index of the file input elements by checking the children id
  const ids = event.composedPath().map((el) => el.id);
  let index = 0;
  if (ids.includes('prod_edit')) {
    index = 1;
  }
  showThumbnail(index, files, 'drag');
}

// show thumbnail of the image
function showThumbnail(index, files, mode) {
  const file = files[0];
  if (file) {
    const fileFormat = file.type;
    const extensions = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    // read file if file format is valid
    if (extensions.includes(fileFormat)) {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        // convert file to url
        const fileURL = fileReader.result;
        // create image element from url and display it
        const imgTag = `<img src="${fileURL}" alt="image" width="200">`;
        $(`#thumbnail_${index}`).html(imgTag);
        // set files to the file input element
        if (mode === 'drag') {
          $(fileInput[index]).prop('files', files);
        }
        // for create product form, clear image error
        if (index === 0) {
          $('#image_error').html('');
        } else {
          // for edit product form, show clear image button
          $('.new-image-container button').show();
        }
      };
      fileReader.readAsDataURL(file);
    } else {
      alert('Invalid file format. Only jpeg, jpg, png and gif files are allowed');
    }
  } else {
    $('.new-image-container button').hide();
  }
}

// clear image and clear image button
function clearImage() {
  $('.new-image-container button').hide();
  $(fileInput[1]).val('');
  $('#thumbnail_1').html('');
}
