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
  const [admins, setAdmins] = useState([]);
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
      // Load both users and admins in parallel
      Promise.all([loadUsers(), loadAdmins()])
        .then(() => {
          console.log("Both users and admins loaded");
          updateMapMarkers();
        })
        .catch((error) => {
          console.error("Error loading data:", error);
        });
    }
  }, [map]);

  useEffect(() => {
    if (map) {
      updateMapMarkers();
    }
  }, [map, users, admins]);

  const loadUsers = async () => {
    try {
      console.log("Fetching users...");
      const response = await fetch(`${API_BASE_URL}/api/users`);
      const data = await response.json();
      console.log("User data received:", data);
      setUsers(data?.data || []);
      return data?.data || [];
    } catch (error) {
      console.error("Error loading users:", error);
      return [];
    }
  };

  const loadAdmins = async () => {
    try {
      console.log("Fetching admins...");
      const response = await fetch(`${API_BASE_URL}/api/admin`);
      const data = await response.json();
      console.log("Admin data received:", data);
      setAdmins(data?.data || []);
      return data?.data || [];
    } catch (error) {
      console.error("Error loading admins:", error);
      return [];
    }
  };

  const updateMapMarkers = () => {
    if (!map) return;

    console.log("Updating map markers...");
    console.log("Current users:", users);
    console.log("Current admins:", admins);

    if (vectorLayerRef.current) {
      map.removeLayer(vectorLayerRef.current);
    }

    const vectorSource = new VectorSource();
    const coordCount = {};

    // Add user markers
    users.forEach((user) => {
      if (user.latitude && user.longitude) {
        const lat = parseFloat(user.latitude);
        const lon = parseFloat(user.longitude);
        const key = `user_${lat},${lon}`;
        if (!coordCount[key]) coordCount[key] = 0;
        const offset = coordCount[key] * 0.0001;
        coordCount[key]++;

        const feature = new Feature({
          geometry: new Point(fromLonLat([lon + offset, lat + offset])),
          properties: { ...user, type: "user" },
        });

        feature.setStyle(
          new Style({
            image: new Icon({
              src: "/user-icon.svg",
              scale: 0.8,
              anchor: [0.5, 1],
            }),
          })
        );

        vectorSource.addFeature(feature);
      }
    });

    // Add admin markers
    admins.forEach((admin) => {
      console.log("Processing admin:", admin);
      if (admin.latitude && admin.longitude) {
        const lat = parseFloat(admin.latitude);
        const lon = parseFloat(admin.longitude);
        console.log("Admin coordinates:", lat, lon);
        const key = `admin_${lat},${lon}`;
        if (!coordCount[key]) coordCount[key] = 0;
        const offset = coordCount[key] * 0.0001;
        coordCount[key]++;

        const feature = new Feature({
          geometry: new Point(fromLonLat([lon + offset, lat + offset])),
          properties: { ...admin, type: "admin" },
        });

        feature.setStyle(
          new Style({
            image: new Icon({
              src: "/admin-icon.svg",
              scale: 0.8,
              anchor: [0.5, 1],
            }),
          })
        );

        vectorSource.addFeature(feature);
      } else {
        console.log("Admin missing coordinates:", admin);
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
        overlayRef.current.setPosition(feature.getGeometry().getCoordinates());
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
              {props.username} ({props.type === "admin" ? "Admin" : "User"})
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
          User and Admin Locations
        </Typography>
      </Box>

      <MapContainer>
        <div id="map" className="ol-map" />
        <div ref={popupRef} style={{ position: "absolute", zIndex: 1200 }} />

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
              <LegendItem>
                <UserIcon src="/admin-icon.svg" alt="Admin" />
                <Typography variant="body2">Admins</Typography>
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
