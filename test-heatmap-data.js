// Test script to verify heatmap data processing
const testData = [
  {
    _id: "Bangladesh",
    count: 6,
  },
  {
    _id: "Mohammadpur",
    count: 3,
  },
  {
    _id: "[object Object]",
    count: 2,
  },
  {
    _id: "Chittagong",
    count: 1,
  },
  {
    _id: "Mirpur 10, Begum Rokeya Sharani, Mirpur 6, Mirpur, Dhaka, Dhaka Metropolitan, Dhaka District, Dhaka Division, 1216, Bangladesh",
    count: 1,
  },
  {
    _id: "Mirput",
    count: 1,
  },
  {
    _id: {
      lat: 23.8135723,
      lng: 90.4240238,
    },
    count: 1,
  },
];

// Simple coordinate mapping function (same as in HeatmapMap.jsx)
function getSimpleCoordinates(location) {
  const locationMap = {
    Bangladesh: { lat: 23.685, lng: 90.3563 },
    Dhaka: { lat: 23.8103, lng: 90.4125 },
    Mirpur: { lat: 23.8103, lng: 90.3654 },
    Mohammadpur: { lat: 23.7639, lng: 90.3589 },
    "Mirpur 10": { lat: 23.8103, lng: 90.3654 },
    "Mirpur 6": { lat: 23.8103, lng: 90.3654 },
    Chittagong: { lat: 22.3419, lng: 91.8132 },
  };

  // Check for exact matches first
  if (locationMap[location]) {
    return locationMap[location];
  }

  // Check for partial matches
  for (const [key, coords] of Object.entries(locationMap)) {
    if (location.toLowerCase().includes(key.toLowerCase())) {
      return coords;
    }
  }

  // Default to Dhaka coordinates for unknown locations
  return { lat: 23.8103, lng: 90.4125 };
}

// Process the data
console.log("Processing test data...");
const points = [];

testData.forEach((row, index) => {
  console.log(`Processing row ${index}:`, row);

  const k = row._id;
  let lat, lng;

  // Handle different data types
  if (k && typeof k === "object" && k.lat && k.lng) {
    // Direct coordinates object
    lat = k.lat;
    lng = k.lng;
    console.log(`Using direct coordinates: ${lat}, ${lng}`);
  } else if (k && typeof k === "string") {
    // String location - handle special cases
    if (k === "[object Object]") {
      console.log(`Skipping [object Object] entry`);
      return; // Skip this invalid entry
    }

    // Fix common typos
    let locationName = k;
    if (k === "Mirput") locationName = "Mirpur";

    const coords = getSimpleCoordinates(locationName);
    lat = coords.lat;
    lng = coords.lng;
    console.log(
      `Using mapped coordinates for "${locationName}": ${lat}, ${lng}`
    );
  } else {
    console.log(`Skipping invalid row:`, row);
    return;
  }

  points.push({ lat, lng, count: row.count });
  console.log(`Added point: ${lat}, ${lng}, count: ${row.count}`);
});

console.log("\nFinal points array:", points);
console.log("Total points:", points.length);
