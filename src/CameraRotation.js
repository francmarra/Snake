// Animation function for the camera rotation before game start
export function animateCameraRotation(camera, controls, center, isActive) {
  // If animation is not active, return control to normal state
  if (!isActive) {
    return;
  }
    // Use a fixed, closer radius for the camera rotation
  const radius = 10; // Slightly increased radius for a better viewing angle
  const height = 4; // Lower camera height for a more direct view
  
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
  
  // Create a look target point slightly higher than center for better viewing angle
  const lookTarget = center.clone();
  lookTarget.y = 0.5; // Look at a point slightly above the ground
  
  // Make camera look at the adjusted target point
  camera.lookAt(lookTarget);
  
  // Update controls target to match camera
  controls.target.copy(lookTarget);
}
