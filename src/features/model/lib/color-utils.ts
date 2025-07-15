import * as THREE from 'three';


const GROUP_COLORS: Record<string, string> = {
  soil: '#d97706', // orange
  pressure: '#eb25a2', // blue
  default: '#c4c9d1', // gray
};

export function getGroupSelectedColor( selectedGroup ) { 
  const color = new THREE.Color(GROUP_COLORS[selectedGroup]);
  return color;
}