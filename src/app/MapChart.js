"use client";

import React, {
  useState,
  useEffect,
} from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Sphere,
  Graticule,
} from "react-simple-maps";
import "./MapChart.css";
import useCountryStore from "./useCountryStore";
import { Tooltip } from "react-tooltip";
import { useStore } from "./store";
import { SearchCountry } from "@/components/ui/SearchCountry";
import { Switch } from "@/components/ui/switch";
import { geoRobinson } from "d3-geo-projection";
import { IconRefresh } from "@tabler/icons-react";

// const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

/*
Future goals for this project:
1. Demographic information of each side
2. better scale the data? perhaps square all values?
3. change the color scheme multiplier from 0.5 to 1
4. decide to delete or fix the second order setting
5 . Toggle between: different projections? different color schemes? different data?
6. Option to amplify/bolden when the projections are small
7. Text based summary using GPT


Possible in the backened I need to weigh the importance of each relationship.


*/

export default function MapChart() {
const { rotation, setRotation } = useStore(state => ({
  rotation: state.rotation,
  setRotation: state.setRotation
}));

const {
  countries,
  incrementCountryPhase,
  isProjectionActive,
  setIsProjectionActive,
  isSecondOrderActive,
  setIsSecondOrderActive
} = useCountryStore(state => ({
  countries: state.countries,
  incrementCountryPhase: state.incrementCountryPhase,
  isProjectionActive: state.isProjectionActive,
  setIsProjectionActive: state.setIsProjectionActive,
  isSecondOrderActive: state.isSecondOrderActive,
  setIsSecondOrderActive: state.setIsSecondOrderActive
}));


  // scale, projection and geographies need to be migrated to Zustand store
  const [scale, setScale] = useState(180);
  const [projectionType, setProj] = useState("geoMercator");
  const [geographiesData, setGeographiesData] = useState([]);
 

  useEffect(() => {
    fetch("/features.json")
      .then((response) => response.json())
      .then((data) => {
        const geometries = data.objects.world.geometries;
        setGeographiesData(data);
      });
  }, []);



  return (
      <div className = "relative h-full lg:aspect-[100/55] lg:border-b-4">
        <div className="map-container z-11 lg:relative top-0 right-0 bottom-0 left-0 lg:z-0 overflow-auto">
          
          <Map
            rotation={rotation}
            scale={scale}
            projectionType={projectionType}
            geographiesData={geographiesData}
            state={countries}
            handleCountryClick={incrementCountryPhase}
          />
        </div>
        <div className="map-controls pt-2 pb-2 border-x-4 border-y-2 lg:border-y-4 lg:absolute lg:top-0 lg:left-0 z-10 bg-slate-100 lg:h-28 lg:w-52 lg:rounded-br-3xl lg:pt-0 lg:overflow-hidden lg:pl-6">
          <MapControls
            setRotation={setRotation}
            setScale={setScale}
            setProj={setProj}
            isProjectionActive={isProjectionActive}
            setIsProjectionActive={setIsProjectionActive}
            isSecondOrderActive={isSecondOrderActive}
            setIsSecondOrderActive={setIsSecondOrderActive}
            useCountryStore={useCountryStore}
          />
        </div>
        <div className="country-search border-x-4 border-y-2 lg:border-y-4 pl-2 pr-2 pt-2 pb-2 lg:absolute lg:top-0 lg:right-0 z-10 bg-slate-100 lg:overflow-x-hidden lg:overflow-y-auto lg:rounded-bl-3xl lg:pl-1 lg:h-28 lg:w-52">
          <SearchCountry
            handleCountryClick={incrementCountryPhase}
            state={countries}
          />
        </div>
      <div className="top-0.5 right-0.5 lg:top-auto lg:right-auto lg:bottom-0 lg:left-0 absolute">
        <ChangeCountries />
      </div>
      </div>
  );
}

// refresh button to reset all countries
const ChangeCountries = ({ handleCountryClick, state, useCountries }) => {
  const resetAllExcept = useCountryStore((state) => state.resetAllExcept);
  return (
    <div className="flex flex-col flew-row items-center">
      <button
        onClick={() => {
          resetAllExcept();
        }}
        className=" text-white font-bold py-2 px-2 rounded-sm lg:rounded-full"
      >
        <IconRefresh color="#e6e3e3"/>
      </button>
    </div>
  );
}

const MapControls = ({
  setRotation,
  setScale,
  setProj,
  isProjectionActive,
  setIsProjectionActive,
  isSecondOrderActive,
  setIsSecondOrderActive,
  useCountryStore,
}) => {
  const [isPacific, setIsPacific] = useState(false);
  const { countries, incrementCountryPhase } =
    useCountryStore((state) => state);

  const handleToggle = () => {
    setIsPacific(!isPacific);
    if (!isPacific) {
      setRotation([-150, 0, 0]);
      setScale(160);
      setProj("geoEqualEarth");
    } else {
      setRotation([-10, 0, 0]);
      setScale(180);
      setProj("geoEqualEarth");
    }
  };

  const handleProjectionToggle = async () => {
    setIsProjectionActive(!isProjectionActive);
  };

  const handleSecondOrderToggle = async () => {
    setIsSecondOrderActive(!isSecondOrderActive);
  };


  return (
    <div className="view-options-container flex lg:block justify-center items-center h-full lg:justify-start lg:items-start lg:h-auto">
      <div className="inline lg:block ml-1 lg:ml-0 mt-2 lg:mt-2">
        <Switch
          checked={isPacific}
          onCheckedChange={handleToggle}
        />
        <label
          className="toggle-label relative -top-0.5"
          onClick={handleToggle}
        >
          {" "}
          Pacific
        </label>
      </div>
      <div className="inline lg:block ml-1 lg:ml-0 mt-2 lg:mt-2">
        <Switch
          checked={isProjectionActive}
          onCheckedChange={handleProjectionToggle}
        />
        <label
          className="toggle-label relative -top-0.5"
          onClick={handleProjectionToggle}
        >
          {" "}
          Geopolitics
        </label>
      </div>
      <div className="inline lg:block ml-1 lg:ml-0 mt-2 lg:mt-2">
        <Switch
          checked={isSecondOrderActive}
          onCheckedChange={handleSecondOrderToggle}
        />
        <label
          className="toggle-label relative -top-0.5 whitespace-nowrap"
          onClick={handleSecondOrderToggle}
        >
          {" "}
          War Outbreak
        </label>
        <div className="lg:hidden">
        </div>
      </div>
    </div>
  );
};

const Map = ({
  rotation,
  scale,
  geographiesData,
  state,
  handleCountryClick
}) => {
  const width = 800;
  const height = 600;

  const projection = geoRobinson()
    .translate([width / 2, height / 2])
    .scale(scale)
    .rotate(rotation);
  return (
    <div className="bg-slate-400">
      <ComposableMap
        viewBox="-80 -10 1000 550" // 0 0 800 450 default
        projection={projection}
        projectionConfig={{
          rotate: rotation,
          scale: 200,
        }}
      >
        <Sphere stroke="#E4E5E6" strokeWidth={0.5} />
        <Graticule stroke="#E4E5E6" strokeWidth={0.3} />
        <Geographies geography={geographiesData}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const countryState = state[geo.properties.name]; // Access the state for each country
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onClick={() => handleCountryClick(geo.properties.name)}
                  stroke="black"
                  strokeWidth={0.15}
                  style={{
                    default: {
                      fill: countryState.color, // Use the state to get the color
                      outline: "none",
                    },
                    hover: {
                      fill: countryState.color, // hover color
                      outline: "none",
                    },
                    pressed: {
                      fill: countryState.color, // pressed color
                      outline: "none",
                    },
                  }}
                  className="country"
                  data-tooltip-id="my-tooltip"
                  data-tooltip-content={geo.properties.name}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
      <Tooltip id="my-tooltip" float="true" delayShow="800" />
    </div>
  );
};
