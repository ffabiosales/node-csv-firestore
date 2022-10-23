const CSVToJSON = require("csvtojson");
const { Firestore } = require("@google-cloud/firestore");
const DB = new Firestore();
/**
 * @function
 * @param {Object} data
 * @TODO use batch for bulk insert.
 */
async function updateFirestore(data) {
  for (const [key, value] of Object.entries(data)) {
    let country = {
      name: `${key}`,
    };

    let document = await DB.collection("countries").add(country);

    for (const key in value) {
      await DB.collection("countries")
        .doc(document.id)
        .collection("cities")
        .add({
          name: value[key].name,
        });
    }
  }
  console.log("Finished!");
}

// parse csv data to JSON
(async () => {
  try {
    const json = await CSVToJSON().fromFile("../world-cities.csv");
    const key = "country";

    // Group cities by country
    const countries = json.reduce((acc, item) => {
      if (!acc[item[key]]) acc[item[key]] = [];
      acc[item[key]].push(item);
      return acc;
    }, {});

    updateFirestore(countries);
  } catch (err) {
    console.log(err);
  }
})();
