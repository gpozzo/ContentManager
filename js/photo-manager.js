$(function () {
     $('.collapse').on('hide.bs.collapse', function () {
        $('#collapseIcon').removeClass('fa fa-chevron-up').addClass('fa fa-chevron-down');
    });

    $('.collapse').on('show.bs.collapse', function () {
        $('#collapseIcon').removeClass('fa fa-chevron-down').addClass('fa fa-chevron-up');
    });
    
    $('#photoDetailsModal').on('hide.bs.modal', function (e) {
        window.location.hash = '#images';
    });

    $('#imgUploadForm').on('submit', function (e) {
        e.preventDefault();
        var photos = document.querySelectorAll('.img-upload-form');
        var formData = [];

        photos.forEach(photo => {
            let title = photo.querySelector("[name='imageUploadTitle']").value;
            let description = photo.querySelector("[name='imageUploadDescription']").value;
            let author = photo.querySelector("[name='imageUploadAuthor']").value;
            let day = photo.querySelector("[name='imageUploadDay']").value;
            let month = photo.querySelector("[name='imageUploadMonth']").value;
            let year = photo.querySelector("[name='imageUploadYear']").value;
            let path = photo.querySelector("[name='imageUploadPath']").value;
            let people = $('#selectPeopleInThePhoto').dropdown('get value');
            let date = '';

            if(year) { date = year;
                if(month) { date = month + '-' + date;
                    if(day) { date = day + '-' + date; }
                }
            }

            let obj = { 'title': title, 'description': description, 'author': author, 'date': date, 'path': path, 'people': people };
            formData.push(obj);
        });

        $.ajax({
            type: 'POST',
            headers: { "Content-Type": "application/json" },
            contentType: 'json',
            url: `http://localhost:3333/images`,
            data: JSON.stringify(formData),
            success: function(data) { $('#uploadModal').modal('hide'); console.log(data); },
            error: function(e) { alert(e); }
        });
    });

    $('input.form-control').keydown(function (e) {
        if (e.originalEvent.keyCode == 13) {
            getData();
        }
    });

    var filePicker = document.getElementById('imageUploadInput');
    filePicker.onchange = function() {
        let selectionCount = document.querySelector("#imageUploadInput").files.length;
        let labelText = `${selectionCount} arquivos selecionados`;
        if(selectionCount == 1) labelText = `${selectionCount} arquivo selecionado`;
        document.querySelector("#imageUploadInputLabel").innerText = labelText;
        uploadImages();
    }
});

function openPhotoDetails(photoId) {
    $.ajax({
        type: 'GET',
        url: `http://localhost:3333/images?id=${photoId}`,
        success: function (data) {
            let title = data[0].title;
            let date = data[0].date;
            let author = data[0].author;
            let description = data[0].description;
            let imgUrl = data[0].path;
            
            document.getElementById('photoDetailsTitle').innerText = title;
            document.getElementById('photoDetailsDate').innerText = date;
            document.getElementById('photoDetailsPhotographer').innerText = author;
            document.getElementById('photoDetailsDescription').innerText = description;
            document.getElementById('photoDetailsImage').src = imgUrl;

            $('#photoDetailsModal').modal('show');
        },
        error: function(err) {
            console.log(err);
        }
    });
}

function uploadImages() {
    let form = document.getElementById('imageUploadForm')
    let formData = new FormData(form);

    $.ajax({
        type: 'POST',
        enctype: 'multipart/form-data',
        processData: false,
        contentType: false,
        cache : false,
        url: `http://localhost:3333/upload`,
        data: formData,
        success: function (data) {
            data.forEach( (photo, index) => {
                let imgTitle = photo.originalname;
                imgTitle = imgTitle.substr(0, imgTitle.lastIndexOf('.'));
                let imgSrc = 'http://localhost:3333/public/' + photo.filename;

                var html = `<div class="img-upload-form">
                            <div class="card flex-md-row mb-4 box-shadow h-md-250" style="border:0">
                            <img id="imgUploadImage" src="${imgSrc}" style="width: 100px; height: 150px; object-fit:contain; margin:3px; margin-top:5px"/>

                            <input type="hidden" name="imageUploadPath" value="${imgSrc}">

                            <div class="card-body d-flex flex-column align-items-start mb-2" style="font-size:80%">
                                <div class="input-group input-group-sm">
                                <div class="input-group-prepend"> <span class="input-group-text" >Título</span> </div>
                                <input type="text" class="form-control form-control-sm" name="imageUploadTitle" maxlength=255 value="${imgTitle}" required>
                                </div><br>

                                <div class="form-row">
                                <div class="col-2">
                                    <div class="input-group input-group-sm">
                                    <div class="input-group-prepend"> <span class="input-group-text">Dia</span> </div>
                                    <input type="text" class="form-control" maxlength=2 placeholder="DD" name="imageUploadDay">
                                    </div>
                                </div>

                                <div class="col-2">
                                    <div class="input-group input-group-sm">
                                    <div class="input-group-prepend"> <span class="input-group-text" >Mês</span> </div>
                                    <input type="text" class="form-control" maxlength=2 placeholder="MM" name="imageUploadMonth">
                                    </div>
                                </div>

                                <div class="col-2">
                                    <div class="input-group input-group-sm">
                                    <div class="input-group-prepend"> <span class="input-group-text">Ano</span> </div>
                                    <input type="text" class="form-control" maxlength=4 placeholder="YYYY" name="imageUploadYear">
                                    </div>
                                </div>

                                <div class="col ml-4">
                                    <div class="input-group input-group-sm">
                                    <div class="input-group-prepend"> <span class="input-group-text">Fotógrafo(a)</span> </div>
                                    <input type="text" class="form-control" name="imageUploadAuthor" maxlength=255>
                                    </div>
                                </div>
                                </div><br>

                                <select class="ui fluid search dropdown" multiple="" id="selectPeopleInThePhoto">
                                <option value="">Pessoas</option>
                                </select><br>

                                <textarea class="form-control form-control-sm" name="imageUploadDescription" rows="2" placeholder="Descrição/Comentários"></textarea><br>

                                <div class="col" style="text-align:center">
                                    <div class="btn-group btn-group-sm">
                                        <button class="btn btn-danger btn-sm" style="margin-right:10px" type="button" aria-expanded="false">Remover</button>
                                        <button class="btn btn-secondary btn-sm" type="button" aria-expanded="false">Aplicar para todos</button>
                                    </div>
                                </div>
                            </div>
                            </div>
                        </div>`;
                        
                document.querySelector("#imgUploadForm").insertAdjacentHTML('afterbegin', html);
            });

            var callback = function feedPeopleDropdown(data) {
                var array = [];
                data.forEach(option => { array.push({ name: option.name, value: option.name }); })
                $('#selectPeopleInThePhoto').dropdown({ placeholder: 'Pessoas', values: array, allowAdditions: true });
            }

            getPeopleEntities(callback);
        },
        error: function(e) { console.log(e); }
    });
}

function getPeopleEntities(callback) {
    $.ajax({
      url: 'http://localhost:3333/people',
      type: 'GET',
      success : function(data) {
        callback(data);
      },
      error: function(e) {
          console.log(e);
      }
    });
}

function enableSelectable(boolean) {
    if (boolean) {
        $(".box").selectable({ appendTo: 'imgBx' });

        let links = document.querySelectorAll("a");
        links.forEach(function (link) {
            let linkHref = link.href;
            link.name = link.href;
            link.removeAttribute("href");
        });
    } else {
        $(".box").selectable("destroy");

        let links = document.querySelectorAll("a");
        links.forEach(function (link) {
            let linkName = link.name;
            link.href = link.name;
        });
    }
}

function menuButtonController(action) {
    if (action == 'edit') {
        $('#editButton').hide();
        $('.edit-mode').show();
        enableSelectable(true);
    } else if (action == 'cancel') {
        $('#editButton').show();
        $('.edit-mode').hide();
        enableSelectable(false);
    } else if (action == 'save') {
        $('#editButton').show();
        $('.edit-mode').hide();
        enableSelectable(false);
    } else if (action == 'delete') {
        let selections = document.querySelectorAll(".ui-selected > a").length;
        if (selections > 0) {
            if (selections == 1) { document.querySelector("#modalMsgText").innerText = `Tem certeza que deseja excluir o registro selecionado?`; }
            else { document.querySelector("#modalMsgText").innerText = `Tem certeza que deseja excluir os ${selections} registros selecionados?`; }
            document.querySelector("#modalMsgConfirm").setAttribute("onClick", "deleteData();");
            $('#modalMsg').modal('show');
        } else { $('#deletionPoppover').popover('show'); setTimeout(function () { $('#deletionPoppover').popover('hide'); }, 3000); }
    }
}

function deleteData() {
    let selected = document.querySelectorAll(".ui-selected > a");
    let array = [];

    selected.forEach(photo => {
        array.push(photo.id);
    });

    $.ajax({
        type: 'DELETE',
        url: `http://localhost:3333/images`,
        headers: { "Content-Type": "application/json" },
        data: JSON.stringify(array),
        success: function (data) {
            console.log(data);
            $('#modalMsg').modal('hide');
            enableSelectable(false);
            getData();
        }
    });
}

function getData() {
    let filter = document.querySelector("input").value;
    if (filter) filter = filter.trim();

    if (filter.length > 0) {
        $.ajax({
            type: 'GET',
            url: `http://localhost:3333/images?keywords=${filter}`,
            success: function (data) { displayResults(data); }
        });
    }
}

function displayResults(data) {
    $(".box").remove();
    $('#editButton').show();
    $('.edit-mode').hide();

    if (data.length > 0) {
        document.querySelector("#results").innerText = `${data.length} resultados`;
        $("#results").show();

        data.forEach(photo => {
            let description = photo.description.replace(/[\\"']/g, '').replace(/\u0000/g, '');

            $('.container').append(`
            <div class="box">
            <div class="imgBx" id="${photo.id}" >
                <a id="${photo.id}" href="#images?photoId=${photo.id}">
                <img src="${photo.path}" id="${photo.id}" data-toggle="tooltip" title="${description}"/>
                <span class="caption">${photo.title}</span>
                </a>
            </div></div>`);

            $('[data-toggle="tooltip"]').tooltip();
        });
    } else {
        $('#editButton').hide();
        $("#results").show();
        document.querySelector("#results").innerText = 'Sem resultados :(';
    }
}