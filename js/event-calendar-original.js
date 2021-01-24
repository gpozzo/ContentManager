$(function () {
    $('#newEventCreationForm').on('submit', function (e) {
        e.preventDefault();
        newEvent();
    });

    $('#filterEventsListForm').on('submit', function (e) {
        e.preventDefault();
        filterEvents();
    });

    renderCalendar();
    setTimeout(resizeCalendar, 1000);

    $('#eventDetailsModal').on('hide.bs.modal', function (e) {
        window.location.hash = '#calendar';
    });

    $('#filterEventsPeriod').daterangepicker({ autoApply: true, autoUpdateInput: false, locale: { cancelLabel: 'Clear'} });

    $('#filterEventsPeriod').on('apply.daterangepicker', function(ev, picker) {
        $(this).val(picker.startDate.format('DD/MM/YYYY') + ' - ' + picker.endDate.format('DD/MM/YYYY'));
    });
  
    $('#filterEventsPeriod').on('cancel.daterangepicker', function(ev, picker) {
        $(this).val('');
    });  
});

function renderCalendar() {
    window.calendar = new FullCalendar.Calendar(document.getElementById('calendarContainer'),
    {
        height: 700,
        themeSystem: "darkly",
        displayEventTime: false,
        customButtons: {
            myCustomButton: {
              text: 'filtrar eventos',
              click: function() { $('#eventListModal').modal('show'); }
            }
        },
        headerToolbar: { left: 'title', center: 'dayGridMonth,listMonth myCustomButton', right: 'prevYear,prev,next,nextYear' },
        initialView: 'dayGridMonth',
        dayMaxEventRows: 3,
        locale: 'pt-br',
        selectable: true,
        views: {
            dayGridMonth: { buttonText: 'calendário' },
            listMonth: { buttonText: 'lista' }
        },
        events: {
            url: 'http://localhost:3333/events',
        },
        eventDidMount: function(info) {
            if(info.view.type.startsWith('list')) {
                let dots = info.el.querySelectorAll('.fc-list-event-dot');
                let eventType = info.event._def.extendedProps.type;

                dots.forEach(node => {
                    if(eventType == 'birth') {
                        node.className = 'fa fa-birthday-cake';
                        node.style.color = 'hotpink';
                    }
                    
                    else if(eventType == 'death') { node.className = 'fas fa-cross'; }
                    else { node.className = 'far fa-calendar'; node.style.color = '#1976d2' }
                });
            }

            else if(info.view.type.startsWith('dayGrid')) {
                let eventType = info.event._def.extendedProps.type;
                let eventTitle = info.event._def.title;

                info.el.setAttribute('data-toggle', 'tooltip');
                info.el.setAttribute('data-placement', 'right');
                info.el.setAttribute('title', eventTitle);
                $('[data-toggle="tooltip"]').tooltip();

                let dots = info.el.querySelectorAll('.fc-daygrid-event-dot');

                dots.forEach(node => {
                    if(eventType == 'birth') {
                        node.className = 'fa fa-birthday-cake';
                        node.style.color = 'hotpink';
                        node.style.margin = '0 4px';
                        info.el.style.color = 'hotpink';
                    }
                    
                    else if(eventType == 'death') {
                        node.className = 'fas fa-cross';
                        node.style.color = 'darkslategray';
                        node.style.margin = '0 4px';
                        info.el.style.color = 'darkslategray';
                    }

                    else {
                        node.className = 'far fa-calendar';
                        node.style.color = '#1976d2';
                        node.style.margin = '0 4px';
                        info.el.style.color = '#1976d2';
                    }
                });
            }
        },
        eventDataTransform: function (eventData) {
            //if(eventData.type == 'birth') eventData.title = eventData.title + ' (Aniversário)'
            
            //console.log(eventData)
            //eventData.title = ' ' + eventData.description;
        },
        dateClick: function (info) {
            loadNewEventModal();
            document.querySelector('#eventDay').value = info.dateStr.substring(8, 10);
            document.querySelector('#eventMonth').value = info.dateStr.substring(5, 7);
            document.querySelector('#eventYear').value = info.dateStr.substring(0, 4);
        }
    });
    
    window.calendar.render();
}

function filterEvents() {
    let keywordString = document.getElementById('filterEventsKeyword').value;
    if(keywordString) keywordString = keywordString.trim();

    let typesSelector = document.querySelectorAll("[name='filterEventsType']:checked");
    var types = [];
    if(typesSelector) typesSelector.forEach(node => { types.push(node.value); });

    let datePeriod = document.getElementById('filterEventsPeriod').value;

    // Remove current results
    let currentResults = document.querySelector('ul.filter-events-list');
    if(currentResults) currentResults.remove();

    $.ajax({
        type: 'GET',
        url: `http://localhost:3333/events`,
        data: { keyword: keywordString, type: types.join(','), period: datePeriod },
        success: function (data) {
            var filterEventsList = document.getElementById('filterEventsListBody');
            var customHTML = `<ul class="list-group list-group-flush filter-events-list">`;
            var length = data.length;
            var filterEventsResults = document.getElementById('filterEventsResults');
            var filterEventsResultsMsg = 'Nenhum evento encontrado';

            if(length > 0) {
                // Set display counter
                filterEventsResultsMsg = `${length} eventos encontrados`;
                if(length == 1) filterEventsResultsMsg = `1 evento encontrado`;

                // Render events
                data.forEach(event => {
                    let date = new Date(event.start).toDateString().substr(4);

                    if(event.type == 'birth') { icon = 'fa fa-birthday-cake' }
                    else if(event.type == 'death') { icon = 'fas fa-cross' }
                    else { icon = 'fas fa-calendar' }

                    customHTML = customHTML + `<a href="${event.url}" target="_blank" class="list-group-item-action filter-events-list-item">  <i class="${icon}"></i> <b>${event.title}</b> | ${date} </a>`;
                });
            }

            filterEventsResults.innerText = filterEventsResultsMsg;
            filterEventsList.insertAdjacentHTML('afterend', customHTML + '</ul>');
        },
        error: function(err) {
            console.log(err);
        }
    });
}

function resizeCalendar() {
    window.calendar.updateSize();
    addTooltipsToCalendarButtons();
}

function addTooltipsToCalendarButtons() {
    let prev = document.querySelector(".fc-prev-button");
    prev.setAttribute('data-toggle', 'tooltip');
    prev.setAttribute('title', 'Mês anterior');

    let next = document.querySelector(".fc-next-button");
    next.setAttribute('data-toggle', 'tooltip');
    next.setAttribute('title', 'Mês seguinte');

    let prevYear = document.querySelector(".fc-prevYear-button");
    prevYear.setAttribute('data-toggle', 'tooltip');
    prevYear.setAttribute('title', 'Ano anterior');

    let nextYear = document.querySelector(".fc-nextYear-button");
    nextYear.setAttribute('data-toggle', 'tooltip');
    nextYear.setAttribute('title', 'Ano seguinte');

    $('[data-toggle="tooltip"]').tooltip();
}

function openEventDetails(eventId) {
    $.ajax({
        type: 'GET',
        url: `http://localhost:3333/eventDetails?id=${eventId}`,
        success: function (data) {
            let title = data[0].title;
            let type = data[0].type;

            if(type == 'birth') title = 'Aniversário de ' + title;
            if(type == 'death') title = 'Aniversário de Morte de ' + title;

            document.querySelector("#eventDetailsModal-Title").innerText = title;
            $('#eventDetailsModal').modal('show');
        },
        error: function(err) {
            console.log(err);
        }
    });
}

function deleteEvent() {
    let hash = window.location.hash;
    let eventId = hash.replace('#calendar?eventId=', '');

    if(!isNaN(eventId)) {
        $.ajax({
            type: 'DELETE',
            url: `http://localhost:3333/events?id=${eventId}`,
            success: function (data) {
                $('#eventDetailsModal').modal('hide');
                window.location.hash = '#calendar';
                renderCalendar();
            },
            error: function(err) {
                console.log(err);
            }
        });
    }
}

function loadNewEventModal() {
    $('#newEventModal').modal('show');
    document.querySelector('#eventName').value = '';
    document.querySelector('#eventDay').value = '';
    document.querySelector('#eventMonth').value = '';
    document.querySelector('#eventYear').value = '';
    document.querySelector('#recurrentEvent').checked = false;
    document.querySelector('[name=eventType][value=other]').checked = true;
    document.querySelector('#eventYear').disabled = false;
    document.querySelector('#eventYear').required = true;
    document.querySelector('#mandatoryFieldYear').style.color = 'red';
    document.querySelector('#eventYear').placeholder = 'YYYY';
    newEventForm('other');
}

function newEventForm(eventType) {
    if(eventType == 'birth') {
        document.querySelector("#eventTitlePrependText").innerText = 'Aniversário de';
        document.querySelector("#eventTitlePrepend").style.display = 'block';
        document.querySelector("#recurrentEventDiv").style.display = 'none';
        document.querySelector('label[for="eventYear"]').innerText = 'Ano de Nascimento';
        document.querySelector('#recurrentEvent').checked = false;
        document.querySelector('#eventYear').disabled = false;
        document.querySelector('#eventYear').required = true;
        document.querySelector('#mandatoryFieldYear').style.color = 'red';
        document.querySelector('#eventYear').placeholder = 'YYYY';
    }

    else if(eventType == 'death') {
        document.querySelector("#eventTitlePrependText").innerText = 'Morte de';
        document.querySelector("#eventTitlePrepend").style.display = 'block';
        document.querySelector("#recurrentEventDiv").style.display = 'none';
        document.querySelector('label[for="eventYear"]').innerText = 'Ano de Morte';
        document.querySelector('#recurrentEvent').checked = false;
        document.querySelector('#eventYear').disabled = false;
        document.querySelector('#eventYear').required = true;
        document.querySelector('#mandatoryFieldYear').style.color = 'red';
        document.querySelector('#eventYear').placeholder = 'YYYY';
    }

    else if(eventType == 'show') {
        document.querySelector("#eventTitlePrepend").style.display = 'none';
        document.querySelector("#recurrentEventDiv").style.display = 'none';
        document.querySelector('label[for="eventYear"]').innerText = 'Ano';
        document.querySelector('#recurrentEvent').checked = false;
        document.querySelector('#eventYear').disabled = false;
        document.querySelector('#eventYear').required = true;
        document.querySelector('#mandatoryFieldYear').style.color = 'red';
        document.querySelector('#eventYear').placeholder = 'YYYY';
    }

    else if(eventType == 'other') {
        document.querySelector("#eventTitlePrepend").style.display = 'none';
        document.querySelector("#recurrentEventDiv").style.display = 'block';
        document.querySelector('label[for="eventYear"]').innerText = 'Ano';
        document.querySelector('#mandatoryFieldYear').style.color = '#fafbfc';
    }
}

function disableYearField() {
    let type = document.querySelector("[name=eventType]:checked").value;
    let recurrence = document.querySelector("#recurrentEvent").checked;

    if((recurrence) && (type == 'other')) {
        document.querySelector('#eventYear').disabled = true;
        document.querySelector('#eventYear').required = false;
        document.querySelector('#mandatoryFieldYear').style.display = 'none';
        document.querySelector("#recurrentEventDiv").style.display = 'block';
        document.querySelector('#eventYear').placeholder = '';
        document.querySelector('#eventYear').value = '';
    } else {
        document.querySelector('#eventYear').disabled = false;
        document.querySelector('#eventYear').required = true;
        document.querySelector('#mandatoryFieldYear').style.display = 'block';
        document.querySelector("#recurrentEventDiv").style.display = 'none';
        document.querySelector('#eventYear').placeholder = 'YYYY';
    }

    if((!recurrence) && (type == 'other')) { document.querySelector("#recurrentEventDiv").style.display = 'block'; }
}

function isDateValid(day, month, year, recurrent) {
    if (recurrent == 'Y') { year = '2020'; } 

    if (year.length != 4) { return false; }

    if (isNaN(Date.parse(`${year}-${month}-${day}`))) {
        return false;
    } else {
        return true;
    }
}

function newEvent() {
    let day = document.querySelector("#eventDay").value;
    let month = document.querySelector("#eventMonth").value;
    let year = document.querySelector("#eventYear").value;
    let title = document.querySelector("#eventName").value;

    let type = document.querySelector("[name=eventType]:checked").value;
    if(type == 'other') type = '';

    let recurrent = 'N';
    if((document.querySelector("#recurrentEvent").checked) || (type == 'birth') || (type == 'death')) {
        recurrent = 'Y';
    }

    if(isDateValid(day, month, year, recurrent)) {
        var formData = JSON.stringify({ 'day': day, 'month': month, 'year': year, 'title': title,  'type': type, 'recurrent': recurrent });

        $.ajax({
            type: 'POST',
            url: `http://localhost:3333/events`,
            data: formData,
            contentType: 'application/json',
            success: function (data) {
                if(data == 'success') {
                    renderCalendar();
                    $('#newEventModal').modal('hide');
                } else {
                    newEventError('Ocorreu um erro. Por favor, verifique os detalhes do evento.');
                    console.log(data);
                }
            },
            error: function(e) {
                newEventError('Ocorreu um erro. Por favor, verifique os detalhes do evento.');
                console.log(e);
            }
        });
    } else {
        newEventError('Formato de data inválido');
    }
}

function newEventError(msg) {
    if(document.querySelector("#newEventErrorMessage")) {
        document.querySelector("#newEventErrorMessage").remove();
    }

    document.querySelector("#newEventModal")
            .querySelector(".modal-body")
            .insertAdjacentHTML('afterend', `<small id="newEventErrorMessage"><center><span style="color:red">${msg}</span></center><br></small>`)
    
}

function customizeCalendar() {
    let dots = document.querySelectorAll("[class$=event-dot]");
    dots.forEach(dot => {
        dot.className = 'fa fa-birthday-cake';
        dot.style.cssText = 'color: rgb(218, 109, 111)'
    });    
}