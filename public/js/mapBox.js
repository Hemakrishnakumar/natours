/* eslint-disable */

console.log('from client');
const locations = JSON.parse(document.getElementById('map').dataset.locations);
console.log(locations);

document.addEventListener('DOMContentLoaded', () => {
  mapboxgl.accessToken =
    'pk.eyJ1Ijoia3Jpc2gyNSIsImEiOiJjbTJjc2FyaTcwZHRtMmxzN3ljZzRta3hsIn0._zwvqwg_4TxQQytGe-jEWA';
  const map = new mapboxgl.Map({
    container: 'map', // container ID
    center: [-74.5, 40], // starting position [lng, lat]
    zoom: 9, // starting zoom
  });
});
