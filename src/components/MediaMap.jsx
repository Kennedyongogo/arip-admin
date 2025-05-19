import { useEffect, useState, useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  useTheme,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { fromLonLat } from "ol/proj";
import { Feature } from "ol";
import { Point } from "ol/geom";
import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";
import { Style, Icon } from "ol/style";
import Overlay from "ol/Overlay";
import ReactDOM from "react-dom";
import { defaults as defaultControls } from "ol/control";

const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "http://38.242.243.113:4035" // Production API URL
    : ""; // Empty for development (will use relative paths)

const MapContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  height: "calc(100vh - 100px)",
  width: "100%",
  "& .ol-map": {
    height: "100%",
    width: "100%",
  },
}));

const MapLegend = styled(Card)(({ theme }) => ({
  position: "absolute",
  bottom: theme.spacing(2),
  right: theme.spacing(2),
  zIndex: 1000,
  minWidth: 200,
}));

const LegendItem = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  marginBottom: theme.spacing(1),
}));

const UserIcon = styled("img")({
  width: "24px",
  height: "24px",
});

export default function MediaMap() {
  const [map, setMap] = useState(null);
  const [users, setUsers] = useState([]);
  const theme = useTheme();
  const popupRef = useRef();
  const overlayRef = useRef();
  const vectorLayerRef = useRef(null);

  useEffect(() => {
    const initialMap = new Map({
      target: "map",
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: fromLonLat([36.8169419, -1.2816714]), // Centered on Nairobi
        zoom: 12,
      }),
      controls: defaultControls({ attribution: false }),
    });

    // Create overlay for popup
    const overlay = new Overlay({
      element: popupRef.current,
      autoPan: true,
      autoPanAnimation: { duration: 250 },
    });
    initialMap.addOverlay(overlay);
    overlayRef.current = overlay;

    setMap(initialMap);

    return () => {
      if (initialMap) {
        initialMap.setTarget(undefined);
      }
    };
  }, []);

  useEffect(() => {
    if (map) {
      loadUsers();
    }
  }, [map]);

  const loadUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users`);
      const data = await response.json();
      setUsers(data?.data || []);

      if (vectorLayerRef.current) {
        map.removeLayer(vectorLayerRef.current);
      }

      const vectorSource = new VectorSource();

      // Track how many users are at each coordinate
      const coordCount = {};

      data?.data?.forEach((user) => {
        if (user.latitude && user.longitude) {
          const lat = parseFloat(user.latitude);
          const lon = parseFloat(user.longitude);
          const key = `${lat},${lon}`;
          if (!coordCount[key]) coordCount[key] = 0;
          // Offset for each user at the same spot
          const offset = coordCount[key] * 0.0001;
          coordCount[key]++;

          const feature = new Feature({
            geometry: new Point(fromLonLat([lon + offset, lat + offset])),
            properties: user,
          });

          feature.setStyle(
            new Style({
              image: new Icon({
                src: "/user-icon.svg", // Make sure to add this icon to your public folder
                scale: 0.8,
                anchor: [0.5, 1],
              }),
            })
          );

          vectorSource.addFeature(feature);
        }
      });

      const vectorLayer = new VectorLayer({
        source: vectorSource,
      });

      vectorLayerRef.current = vectorLayer;
      map.addLayer(vectorLayer);

      // Add click interaction
      map.on("click", (event) => {
        const feature = map.forEachFeatureAtPixel(
          event.pixel,
          (feature) => feature
        );
        if (feature) {
          const props = feature.get("properties");
          // Show styled popup above marker
          overlayRef.current.setPosition(
            feature.getGeometry().getCoordinates()
          );
          ReactDOM.render(
            <Box
              sx={{
                minWidth: 220,
                bgcolor: "background.paper",
                boxShadow: 3,
                borderRadius: 2,
                p: 2,
                border: "1px solid #006400",
              }}
            >
              <Typography variant="h6" color="primary" gutterBottom>
                {props.username}
              </Typography>
              <Typography variant="body2">
                <b>Email:</b> {props.email}
                <br />
                <b>Phone:</b> {props.phoneNumber || "N/A"}
                <br />
                <b>Location:</b> {props.latitude}, {props.longitude}
              </Typography>
            </Box>,
            popupRef.current
          );
        } else {
          overlayRef.current.setPosition(undefined);
          ReactDOM.unmountComponentAtNode(popupRef.current);
        }
      });

      // Hide popup on map move
      map.on("movestart", () => {
        overlayRef.current.setPosition(undefined);
        ReactDOM.unmountComponentAtNode(popupRef.current);
      });
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  return (
    <Box sx={{ p: 3 }} component={Card}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography
          variant="title"
          sx={{ color: "primary.main", fontWeight: 600 }}
        >
          User Locations
        </Typography>
      </Box>

      <MapContainer>
        <div id="map" className="ol-map" />
        {/* Popup overlay element for users */}
        <div ref={popupRef} style={{ position: "absolute", zIndex: 1200 }} />

        {/* Legend and Attribution */}
        <Box
          sx={{
            position: "absolute",
            right: 16,
            bottom: 16,
            zIndex: 1100,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
          }}
        >
          <MapLegend>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Legend
              </Typography>
              <LegendItem>
                <UserIcon src="/user-icon.svg" alt="User" />
                <Typography variant="body2">Users</Typography>
              </LegendItem>
            </CardContent>
          </MapLegend>
          <Typography
            variant="caption"
            color="textSecondary"
            sx={{
              mt: 1,
              ml: 0,
              alignSelf: "flex-start",
              pl: 2,
            }}
          >
            ©{" "}
            <a
              href="https://www.openstreetmap.org/copyright"
              target="_blank"
              rel="noopener noreferrer"
            >
              OpenStreetMap contributors
            </a>
          </Typography>
        </Box>
      </MapContainer>
    </Box>
  );
}
