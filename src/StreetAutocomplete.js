import React, { useState } from 'react';
import axios from 'axios';

import { initializeApp } from "firebase/app";
import { getDatabase, ref, set } from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASEURL,
  //databaseURL: "https://<DATABASE_NAME>.firebaseio.com",
  
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Initialize Realtime Database and get a reference to the service
const db = getDatabase(app);


//import { GoogleSpreadsheet } from 'google-spreadsheet';

const MAPBOX_TOKEN = 'pk.eyJ1IjoicmVpZmVsMSIsImEiOiJjbGx6aGllYzQwejZrM2VsZXQ2Y2VrcnowIn0.3E3iuzklJHOb8u_TEn00tQ'; // Replace with your actual Mapbox API token
//const SPREADSHEET_ID = '1JEPaIdS9SxNOcYc5nzLPi35rU6f3zpUfC9s6QlMSZvI'; // Replace with your Google Spreadsheet ID
//const doc = new GoogleSpreadsheet(SPREADSHEET_ID);
const MONGODB_URI = process.env.REACT_APP_MONGODB_URI; // Replace with your MongoDB connection URI

function StreetAutocomplete() {
  const [query, setQuery] = useState('');
  const [streets, setStreets] = useState([]);
  const [selectedStreet, setSelectedStreet] = useState('');

  const handleChange = async (event) => {
    const newQuery = event.target.value;
    setQuery(newQuery);

    if (newQuery) {
      try {
        const response = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${newQuery}.json`, {
          params: {
            access_token: MAPBOX_TOKEN,
            country: 'BR',
            proximity: '-34.8713,-7.1175', // João Pessoa coordinates
            types: 'address',
            limit: 10, // Limit the number of results
            // Add the city name to the query to limit to João Pessoa
            // You can adjust the city name as needed
            autocomplete: `true`,
            language: 'pt-BR',
            // Limit to a bounding box around João Pessoa to further restrict results
            bbox: '-34.9502,-7.2279,-34.7639,-7.0338'
          }
        });

        const data = response.data;
        const streets = data.features.map((feature) => feature.place_name);
        setStreets(streets);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    } else {
      setStreets([]);
    }
  };

  const handleSelect = async (street) => {
    setSelectedStreet(street);

    const textArea = document.createElement('textarea');
  textArea.value = street;
  document.body.appendChild(textArea);
  textArea.select();

  try {
    const success = document.execCommand('copy');
    if (success) {
      console.log('Copied:', street);
    } else {
      console.error('Copy failed.');
    }
  } catch (error) {
    console.error('Copy error:', error);
  }

  document.body.removeChild(textArea);

try {
	set(ref(db, 'streets/'+street), {
    endereco: street,
	hora: new Date().toISOString(),
	nome:document.getElementById("motorista").value
  });
	
    // Push the selected street to the Realtime Database
    console.log('Inserted:', street);
  } catch (error) {
    console.error('Error inserting data:', error);
  }
  //(async function main(self) {
  //  //google-spreadsheet
  //  try {
  //    
  //    await doc.useServiceAccountAuth({
  //        client_email: process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_EMAIL,
  //        private_key: process.env.REACT_APP_GOOGLE_PRIVATE_KEY,
  //    });
  //    await doc.loadInfo();
  //    const sheet = doc.sheetsByIndex[0];
  //    await sheet.addRow({ Street: street });
  //    console.log('Added row:', street);
  //  } catch (error) {
  //    console.error('Error adding row:', error);
  //  }
  //})(this)

  };

  return (
    <div>
      <input
		id="motorista"
        type="text"
        placeholder="Insira seu nome"
		style={{"height":"28px"}}
      /><br/><br/>
      <input
        type="text"
        placeholder="Enter a street name"
        value={query}
        onChange={handleChange}
		style={{"height":"28px"}}
      />
      <ul>
        {streets.map((street, index) => (
          <>
          <br/>
          <li key={index} onClick={() => handleSelect(street)}>{street}</li>
          </>
        ))}
      </ul>
      {selectedStreet && (
        <p>Copied: {selectedStreet}</p>
      )}
    </div>
  );
}

export default StreetAutocomplete;
