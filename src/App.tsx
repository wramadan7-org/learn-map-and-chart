// import "./App.css";
// import { MapContainer, Marker, TileLayer } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// // import AddressPoint from "./realworld";
// import MarkerClusterGroup from "react-leaflet-cluster";
// import { memo, useEffect, useMemo, useState } from "react";

// function Component() {
//   const [dataNational, setDataNational] = useState<
//     { lat: number; lng: number; site_name: string }[]
//   >([]);

//   const memorizedMarkers = useMemo(() => {
//     return dataNational?.map((item, index) => (
//       <Marker
//         key={index}
//         position={[item.lat, item.lng]}
//         title={item.site_name}
//       />
//     ));
//   }, [dataNational]);

//   const getData = async () => {
//     try {
//       const data = await fetch(
//         "https://nava-dev.cudo.co.id/ran/api/v1/dashboard/api/002-3-new-national/?region="
//       );
//       const response = await data.json();
//       console.log("RESPONSE: ", response);
//       setDataNational(response.data?.slice(0, 4000));
//     } catch (error) {
//       console.log("ERROR: ", error);
//     }
//   };

//   useEffect(() => {
//     console.log("RE-RENDER");
//     getData();
//   }, []);

//   // useEffect(() => {
//   //   console.log("RE-RENDER", dataNational);
//   // }, [dataNational]);

//   return (
//     <div style={{ width: "100vw", height: "100vh" }}>
//       <MapContainer
//         center={[-0.914576, 112.788463]}
//         zoom={5}
//         style={{
//           width: "100vw",
//           height: "100vh",
//         }}
//       >
//         <TileLayer
//           attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
//           url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}.png"
//         />
//         <MarkerClusterGroup chunkedLoading>
//           {memorizedMarkers}
//         </MarkerClusterGroup>
//       </MapContainer>
//     </div>
//   );
// }

// const App = memo(Component);

// export default App;

import "./App.css";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import MarkerClusterGroup from "react-leaflet-cluster";
import { memo, useEffect, useMemo, useState } from "react";

function Component() {
  // const [dataNational, setDataNational] = useState<
  //   { lat: number; lng: number; site_name: string }[]
  // >([]);
  // const [renderedDataCount, setRenderedDataCount] = useState(5000); // Jumlah data yang akan dirender secara bertahap
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dataChunks, setDataChunks] = useState<any>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [currentChunkIndex, setCurrentChunkIndex] = useState<any>(0);

  // const memorizedMarkers = useMemo(() => {
  //   return dataNational
  //     .slice(0, renderedDataCount)
  //     ?.map((item, index) => (
  //       <Marker
  //         key={index}
  //         position={[item.lat, item.lng]}
  //         title={item.site_name}
  //       />
  //     ));
  // }, [dataNational, renderedDataCount]);

  const getData = async () => {
    try {
      const api = await fetch(
        "https://nava-dev.cudo.co.id/ran/api/v1/dashboard/api/002-3-new-national/?region="
      );
      const { data } = await api.json();
      console.log("RESPONSE: ", data);
      const chunkSize = Math.ceil(data?.length / 12);
      const chunks = [];
      for (let i = 0; i < data?.length; i += chunkSize) {
        chunks.push(data?.slice(i, i + chunkSize));
      }
      setDataChunks(chunks);
      // setDataNational(response.data);
    } catch (error) {
      console.log("ERROR: ", error);
    }
  };

  useEffect(() => {
    console.log("RE-RENDER");
    getData();
  }, []);

  useEffect(() => {
    console.log("CHUNK INDEX: ", currentChunkIndex);
    console.log("DATA CHUNK LENGTH: ", dataChunks.length);
    console.log("DATA CHUNK: ", dataChunks);
    const interval = setInterval(() => {
      if (currentChunkIndex < dataChunks.length) {
        setCurrentChunkIndex(currentChunkIndex + 1);
      } else {
        clearInterval(interval);
      }
    }, 500); // Render setiap 5 detik
    return () => clearInterval(interval);
  }, [dataChunks, currentChunkIndex]);

  const renderData = (dataChunk: any) => {
    return (
      <MarkerClusterGroup chunkedLoading>
        {dataChunk?.map((point: any, index: number) => (
          <Marker
            key={index}
            position={[point.lat, point.lng]}
            title={point.site_name}
          />
        ))}
      </MarkerClusterGroup>
    );
  };

  const renderedData = useMemo(() => {
    if (currentChunkIndex < dataChunks.length) {
      return renderData(dataChunks[currentChunkIndex]);
    }
    return null;
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
        <MarkerClusterGroup chunkedLoading>{renderedData}</MarkerClusterGroup>
      </MapContainer>
      {/* Tombol untuk memuat lebih banyak data */}
    </div>
  );
}

const App = memo(Component);

export default App;
