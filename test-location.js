// Test script to verify location processing logic

// Test case 1: Location object
const testLocationObject = {
  label:
    "Jamuna, Patuakhali Sadar Subdistrict, Patuakhali District, Barishal Division, Bangladesh",
  latitude: 22.399642,
  longitude: 90.370359,
};

// Test case 2: Location as JSON string
const testLocationString = JSON.stringify(testLocationObject);

// Test case 3: Simple string location
const testSimpleString = "Dhaka, Bangladesh";

console.log("=== Testing Location Processing Logic ===");

// Test location normalization
function normalizeLocation(location) {
  try {
    console.log("Processing location:", location);
    // Try to parse as JSON first (for location objects sent as JSON strings)
    if (typeof location === "string") {
      try {
        const parsedLocation = JSON.parse(location);
        console.log("Parsed location object:", parsedLocation);
        if (typeof parsedLocation === "object" && parsedLocation.label) {
          console.log("Using label from parsed object:", parsedLocation.label);
          return parsedLocation.label;
        }
      } catch (parseError) {
        console.log("JSON parsing failed, using as string:", location);
        // If JSON parsing fails, treat as regular string
        return location;
      }
      return location;
    }
    if (typeof location === "object") {
      console.log("Using label from object:", location.label);
      return location.label || "";
    }
    console.log("Fallback to empty string");
    return "";
  } catch (error) {
    console.error("Error processing location:", error);
    return location;
  }
}

// Test coordinates extraction
function extractCoordinates(location) {
  try {
    console.log("Processing coordinates from:", location);
    let locationObj = location;

    // Try to parse as JSON first
    if (typeof location === "string") {
      try {
        const parsedLocation = JSON.parse(location);
        console.log("Parsed location for coordinates:", parsedLocation);
        if (typeof parsedLocation === "object") {
          locationObj = parsedLocation;
        }
      } catch (parseError) {
        console.log("JSON parsing failed for coordinates");
        // If JSON parsing fails, return null
        return null;
      }
    }

    if (
      typeof locationObj === "object" &&
      locationObj.latitude &&
      locationObj.longitude
    ) {
      const coords = {
        lat: Number(locationObj.latitude),
        lng: Number(locationObj.longitude),
      };
      console.log("Extracted coordinates:", coords);
      return coords;
    }
    console.log("No valid coordinates found");
    return null;
  } catch (error) {
    console.error("Error processing coordinates:", error);
    return null;
  }
}

console.log("\n--- Test 1: Location Object ---");
const result1 = normalizeLocation(testLocationObject);
const coords1 = extractCoordinates(testLocationObject);
console.log("Result:", result1);
console.log("Coordinates:", coords1);

console.log("\n--- Test 2: Location JSON String ---");
const result2 = normalizeLocation(testLocationString);
const coords2 = extractCoordinates(testLocationString);
console.log("Result:", result2);
console.log("Coordinates:", coords2);

console.log("\n--- Test 3: Simple String ---");
const result3 = normalizeLocation(testSimpleString);
const coords3 = extractCoordinates(testSimpleString);
console.log("Result:", result3);
console.log("Coordinates:", coords3);

console.log("\n=== Test Complete ===");
