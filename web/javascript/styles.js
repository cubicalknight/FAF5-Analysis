import { geojsonLabels, gradientAttributes, geojsonColors } from './name_maps.js';
import { attributeBounds } from './map.js'

function createStyleFunction(layerName) {
  return function(feature) {
    const attributeKey = layerName;
    const attributeName = gradientAttributes[layerName];

    const bounds = attributeBounds[layerName]; // Get the bounds for this specific geojson
    const attributeValue = feature.get(attributeName);
    const useGradient = layerName in gradientAttributes;  // Use a gradient if a gradient attribute is specified for the given layer
    const layerColor = geojsonColors[layerName] || 'blue'; // Fetch color from dictionary, or default to blue

    const geometryType = feature.getGeometry().getType();

    if (geometryType === 'Point' || geometryType === 'MultiPoint') {
      if (useGradient && bounds) {
        const minSize = 2; // Minimum point size
        const maxSize = 10; // Maximum point size

        // Calculate the point size based on the attribute value and bounds
        const pointSize = minSize + ((maxSize - minSize) * (attributeValue - bounds.min) / (bounds.max - bounds.min));

        return new ol.style.Style({
          image: new ol.style.Circle({
            radius: pointSize,
            fill: new ol.style.Fill({
              color: layerColor,
            }),
          }),
          zIndex: 10, // Higher zIndex so points appear above polygons
        });
      } else {
        // Use a default point style if no gradient or bounds are available
        return new ol.style.Style({
          image: new ol.style.Circle({
            radius: 2, // Default point size
            fill: new ol.style.Fill({
              color: layerColor,
            }),
          }),
          zIndex: 10, // Higher zIndex so points appear above polygons
        });
      }
    } else if (geometryType === 'Polygon' || geometryType === 'MultiPolygon') {
        if (useGradient && bounds) {
        const component = Math.floor(255 - (255 * (attributeValue - bounds.min) / (bounds.max - bounds.min)));
        const fillColor = `rgb(255, ${component}, ${component})`;

      return new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'gray',
          width: 1,
        }),
        fill: new ol.style.Fill({
          color: fillColor,
        }),
        zIndex: 1 // Lower zIndex so polygons appear below points
      });
    } else {
          return new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'gray',
          width: 1,
        }),
        fill: new ol.style.Fill({
          color: layerColor,
        }),
        zIndex: 1 // Lower zIndex so polygons appear below points
      });
    }

  }  else if (geometryType === 'LineString' || geometryType === 'MultiLineString') {
      if (useGradient && bounds) {  // Apply varying width only if gradientFlags is true and bounds are defined
        // Normalize within range 1 to 10
        const normalizedWidth = 1 + 9 * ((attributeValue - bounds.min) / (bounds.max - bounds.min));

        return new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: layerColor,
            width: normalizedWidth,
          }),
          zIndex: 5  // zIndex between points and polygons
        });
      } else {
        // Add default line styling here if you want
        return new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: layerColor,
            width: 1,
          }),
          zIndex: 5  // zIndex between points and polygons
        });
      }
       }

    if (attributeValue === null || attributeValue === undefined) {
      return null;  // Skip features with undefined or null values
    }

    // For any other geometry type, use default styling
    return null;
  };
}

function isPolygonLayer(layer) {
  const source = layer.getSource();
  let features = source.getFeatures();
  if (features.length === 0) return false;  // Empty layer

  // Check the first feature as a sample to determine the type of layer.
  // This assumes that all features in the layer have the same geometry type.
  const geometryType = features[0].getGeometry().getType();
  return geometryType === 'Polygon' || geometryType === 'MultiPolygon';
}

function isPointLayer(layer) {
  const source = layer.getSource();
  let features = source.getFeatures();
  if (features.length === 0) return false;  // Empty layer

  // Check the first feature as a sample to determine the type of layer.
  // This assumes that all features in the layer have the same geometry type.
  const geometryType = features[0].getGeometry().getType();
  return geometryType === 'Point' || geometryType === 'MultiPoint';
}

function isLineStringLayer(layer) {
  const source = layer.getSource();
  let features = source.getFeatures();
  if (features.length === 0) return false;

  const geometryType = features[0].getGeometry().getType();
  return geometryType === 'LineString' || geometryType === 'MultiLineString';
}

export { createStyleFunction, isPolygonLayer, isPointLayer, isLineStringLayer };