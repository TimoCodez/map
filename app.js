let map;
let markers = [];
let data = [];
let selectedMarkerIndex = null;

document.addEventListener('DOMContentLoaded', function () {
  initializeMap();
  fetchData();
});

function initializeMap() {
  if (!map) {
    map = L.map('map').setView([51.505, -0.09], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    map.once('locationfound', function (e) {
      map.flyTo(e.latlng, 13);
    });

    map.on('locationerror', function () {
      console.log('Location access denied.');
    });

    map.locate();
  }
}

function fetchData() {
  fetch('http://localhost:3000/pins')
    .then((response) => response.json())
    .then((pins) => {
      data = pins;
      data.forEach((pinData, index) => {
        addMarkerToMap(pinData, index);
      });
      populateTable();
    })
    .catch((err) => console.error('Failed to fetch pins:', err));
}
function addPin() {
  const pinData = gatherFormData();

  if (selectedMarkerIndex !== null) {
    updateExistingPin(pinData);
  } else {
    addNewPin(pinData);
  }
}

function gatherFormData() {
  return {
    address: document.getElementById('address').value,
    info: document.getElementById('info').value,
    inspector: document.getElementById('inspector').value,
    inspectionDate: document.getElementById('inspectionDate').value,
    completedDate: document.getElementById('completedDate').value,
    status: document.getElementById('status').value,
  };
}

function updatePinData() {
  if (selectedMarkerIndex !== null) {
    const updatedData = gatherFormData();

    fetch(`http://localhost:3000/pins/${selectedMarkerIndex}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedData),
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.success) {
          // Replace the old data with the updated data
          data[selectedMarkerIndex] = updatedData;

          // Refresh the map marker and the data table
          markers[selectedMarkerIndex].remove(); // Remove old marker
          addMarkerToMap(updatedData, selectedMarkerIndex); // Add updated marker
          populateTable();

          // Clear the form fields
          clearFormData();

          // Reset the selectedMarkerIndex
          selectedMarkerIndex = null;
        }
      })
      .catch((err) => console.error('Failed to update pin data:', err));
  } else {
    alert('Please select a pin to update.');
  }
}

function clearFormData() {
  document.getElementById('address').value = '';
  document.getElementById('info').value = '';
  document.getElementById('inspector').value = '';
  document.getElementById('inspectionDate').value = '';
  document.getElementById('completedDate').value = '';
  document.getElementById('status').value = 'available';
}

function addNewPin(pinData) {
  fetch('http://localhost:3000/pins', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(pinData),
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.success) {
        data.push(pinData);
        addMarkerToMap(pinData, data.length - 1);
        populateTable();
      }
    })
    .catch((err) => console.error('Failed to add pin:', err));
}

function addMarkerToMap(pinData, index) {
  fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${pinData.address}`
  )
    .then((response) => response.json())
    .then((locationData) => {
      if (locationData.length > 0) {
        const lat = locationData[0].lat;
        const lon = locationData[0].lon;
        const marker = L.marker([lat, lon])
          .addTo(map)
          .bindPopup(
            `<strong>Info:</strong> ${pinData.info}<br>
                                            <strong>Inspector:</strong> ${pinData.inspector}<br>
                                            <strong>Inspection Date:</strong> ${pinData.inspectionDate}<br>
                                            <strong>Completed Date:</strong> ${pinData.completedDate}<br>
                                            <strong>Status:</strong> ${pinData.status}`
          )
          .on('click', () => {
            selectedMarkerIndex = index;
            editPin(index);
            map.flyTo([lat, lon], 15);
          });
        if (!markers[index]) {
          markers.push(marker);
        } else {
          markers[index] = marker;
        }
      } else {
        alert('Address not found!');
      }
    });
}

function populateTable() {
  const tbody = document.getElementById('dataDisplay').querySelector('tbody');
  tbody.innerHTML = '';

  data.forEach((pinData, index) => {
    const row = tbody.insertRow();
    Object.values(pinData).forEach((value) => {
      const cell = row.insertCell();
      cell.textContent = value;
    });

    const editCell = row.insertCell();
    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.addEventListener('click', () => {
      selectedMarkerIndex = index;
      editPin(index);
    });
    editCell.appendChild(editButton);

    const deleteCell = row.insertCell();
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => {
      deletePin(index);
    });
    deleteCell.appendChild(deleteButton);
  });
}

function editPin(index) {
  const pinData = data[index];
  document.getElementById('address').value = pinData.address;
  document.getElementById('info').value = pinData.info;
  document.getElementById('inspector').value = pinData.inspector;
  document.getElementById('inspectionDate').value = pinData.inspectionDate;
  document.getElementById('completedDate').value = pinData.completedDate;
  document.getElementById('status').value = pinData.status;
}

function deletePin(index) {
  fetch(`http://localhost:3000/pins/${index}`, {
    method: 'DELETE',
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.success) {
        markers[index].remove();
        markers.splice(index, 1);
        data.splice(index, 1);
        populateTable();
      }
    })
    .catch((err) => console.error('Failed to delete pin:', err));
}
