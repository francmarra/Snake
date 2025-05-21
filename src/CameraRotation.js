// Animation function for the camera rotation before game start
export function animateCameraRotation(camera, controls, center, isActive) {
  // If animation is not active, return control to normal state
  if (!isActive) {
    return;
  }
  
  // Use a fixed, closer radius for the camera rotation
  const radius = 8; // Reduced radius for closer view
  const height = 5; // Fixed camera height
  
  // Slow rotation speed (0.0005 radians per frame)
  const currentAngle = Math.atan2(
    camera.position.z - center.z,
    camera.position.x - center.x
  );
  const newAngle = currentAngle + 0.0005;
  
  // Calculate new position with fixed radius
  const newX = center.x + radius * Math.cos(newAngle);
  const newZ = center.z + radius * Math.sin(newAngle);
  
  // Update camera position with fixed height
  camera.position.x = newX;
  camera.position.y = height;
  camera.position.z = newZ;
  
  // Make camera look at the center
  camera.lookAt(center);
  
  // Update controls target to match camera
  controls.target.copy(center);
}
