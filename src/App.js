import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import 'mapbox-gl/dist/mapbox-gl.css'
import './App.css'

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN

export default function App() {
  const mapContainer = useRef(null);
  const [point, setPoint] = useState({lat:17.3850, lng: 78.4867})
  const [lng, setLng] = useState(78.4867);
  const [lat, setLat] = useState(17.3850);
  const [zoom, setZoom] = useState(9);
  const [search, setSearch] = useState('');

  var marker = new mapboxgl.Marker();

  useEffect(() => {
    const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [lng, lat],
        zoom: zoom
      });
      marker.setLngLat({lng,lat}).setPopup(new mapboxgl.Popup().setText(`Lat: ${lat}, Lon: ${lng}`)).addTo(map)
      map.on('click', (e) => {
        console.log(`A click event has occurred at ${e.lngLat}`);
        setPoint(e.lngLat)
        localStorage.setItem('pinnedLocation',JSON.stringify(e.lngLat))
        map.flyTo({
          center: e.lngLat
          });
        marker.setLngLat(e.lngLat).setPopup(new mapboxgl.Popup().setText(`Lat: ${e.lngLat.lat}, Lon: ${e.lngLat.lng}`)).addTo(map);
      })
  },[lng, lat, zoom]);


  const getAddress=async()=>{
    const address = search.split(' ').join('%20').split(',').join('%20')
    const apIurl = `https://maps.googleapis.com/maps/api/geocode/json?address=24%20${address}&key=${process.env.REACT_APP_MAPS_API_KEY}`
    const response = await fetch(apIurl,{method:"GET"})
    const data = await response.json()
    console.log(data)
    if(response.ok && data.results.length>0){
      const location = {latitude: data.results[0].geometry.location.lat,
                        longitude: data.results[0].geometry.location.lng,
                        formattedAddress: data.results[0].formatted_address}
      
      setLat(data.results[0].geometry.location.lat)
      setLng(data.results[0].geometry.location.lng)
      localStorage.setItem('location',JSON.stringify(location))

    }else{
      window.alert('location not found')
    }
  }


  const getSearchInput = (e)=>{
    setSearch(e.target.value)
  }

  const getMapInfo = (e)=>{
      e.preventDefault()
      getAddress()
      setSearch('')
  }


  return (
    <div className='app-container'>
      <h1 className='main-heading'>Location Tracker</h1>
      <div className="sidebar">
        <form onSubmit={getMapInfo}>
          <input type='text' value={search} onChange={getSearchInput}/>
          <button type='submit'>search</button>
        </form>
      </div>
      <div className='text-container'>
        <div className='text'>
          <h1 className='heading'>Searched Coordinates: {`${search}`}</h1>
          <p className='coordinates'>{`Lat: ${lat}, Lng: ${lng}`}</p>
        </div>
        <div className='text'>
          <h1 className='heading'>Marked Coordinates:</h1>
          <p className='coordinates'>{`Lat: ${point.lat}, Lng: ${point.lng}`}</p>
        </div>
      </div>
      <div ref={mapContainer} className="map-container" />
    </div>
  );
}
