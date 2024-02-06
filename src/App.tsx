import "./App.css";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import MarkerClusterGroup from "react-leaflet-cluster";
import { memo, useEffect, useState } from "react";

interface ICoordinate {
  lat: number;
  lng: number;
  site_name: string;
}

function Component() {
  const [dataChunks, setDataChunks] = useState<ICoordinate[][]>([]);
  const [currentChunkIndex, setCurrentChunkIndex] = useState<number>(0);
  const [renderedMarkers, setRenderedMarkers] = useState<JSX.Element[]>([]);

  const getData = async () => {
    try {
      const api = await fetch(
        "https://nava-dev.cudo.co.id/ran/api/v1/dashboard/api/002-3-new-national/?region="
      );
      // Get data from api
      const { data } = await api.json();
      // Divide into 12, because Indonesian has 12 island
      const chunkSize = Math.ceil(data?.length / 12);
      // Initialization to wrap all data after divide
      const chunks = [];
      for (let i = 0; i < data?.length; i += chunkSize) {
        chunks.push(data?.slice(i, i + chunkSize));
      }
      setDataChunks(chunks);
    } catch (error) {
      console.log("ERROR: ", error);
    }
  };

  // UseEffect to get data from api
  useEffect(() => {
    getData();
  }, []);

  // UseEffect to set the state marker for render using interval
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentChunkIndex < dataChunks.length) {
        // Get data chunk by current index and then loop it
        const newMarkers = dataChunks[currentChunkIndex]?.map(
          (point: ICoordinate, index: number) => (
            <Marker
              key={`${index}${point.site_name}${Math.random()}`}
              position={[point.lat, point.lng]}
              title={point.site_name}
            />
          )
        );
        // After that loop, set that marker in state renderedMarkers without remove previous data state it self
        setRenderedMarkers((prevMarkers) => [...prevMarkers, ...newMarkers]);
        // Then change the the current chunk index + 1 (for trigger re-render too)
        setCurrentChunkIndex(currentChunkIndex + 1);
      } else {
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [dataChunks, currentChunkIndex]);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <MapContainer
        center={[-0.914576, 112.788463]}
        zoom={5}
        style={{
          width: "100vw",
          height: "100vh",
        }}
      >
        {/* <HandleViewportChanged /> */}
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}.png"
        />
        <MarkerClusterGroup chunkedLoading>
          {renderedMarkers}
        </MarkerClusterGroup>
      </MapContainer>
      {/* Tombol untuk memuat lebih banyak data */}
    </div>
  );
}

const App = memo(Component);

export default App;
