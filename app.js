// Initialize the map
const map = L.map('map').setView([51.505, -0.09], 13); // Setting initial location to London

// Set the map tiles source
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors',
}).addTo(map);

function addPin() {
  const address = document.getElementById('address').value;
  const info = document.getElementById('info').value;

  // Use a geocoding service to convert address to lat/lng
  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${address}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.length > 0) {
        const lat = data[0].lat;
        const lon = data[0].lon;

        // Add a pin to the map
        const marker = L.marker([lat, lon]).addTo(map);
        marker.bindPopup(info).openPopup();
      } else {
        alert('Address not found!');
      }
    });
}
