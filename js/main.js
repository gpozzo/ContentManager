$(function () {
  $('[data-toggle="popover"]').popover();
  $('[data-toggle="tooltip"]').tooltip();
});

window.onload = routing;
window.onhashchange = routing;

function routing() {
  var destination = window.location.hash.replace("#", "");
  var hash = destination;
  var params = '';

  if (destination.includes('?')) {
    hash = destination.substr(0, destination.lastIndexOf('?'));
    params = destination.substr(destination.lastIndexOf('?') + 1, destination.length);
  }

  var tabs = document.querySelectorAll('.tab-content');
  tabs.forEach(tab => {
    tab.style.display = 'none';

    if (tab.id == hash) {
      let activeTab = document.querySelector("a.nav-item.nav-link.active");
      if (activeTab) activeTab.classList.remove("active");
      document.querySelector(`a.nav-item.nav-link[id=${hash}-nav`).classList.add("active");
      document.querySelector(`#${hash}`).style.display = 'block';
    }
  });

  let activeTab = document.querySelector("a.nav-item.nav-link.active");
  if (!activeTab) window.location.hash = "home";

  if (hash.startsWith('calendar')) {
    resizeCalendar();

    if (params.startsWith('eventId=')) {      
      let id = params.replace('eventId=', '');
      openEventDetails(id);
    }
  }

  if (hash.startsWith('images')) {
    if (params.startsWith('photoId=')) {      
      let id = params.replace('photoId=', '');
      openPhotoDetails(id);
    }
  }
}