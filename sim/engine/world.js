// The virtual house: rooms, fixtures, family, pets, robots, devices, inventory.
// Coordinates are meters; the UI draws 1 m = 48 px.

export const ROOMS = [
  { id: 'kitchen', name: 'Kitchen', x: 0, y: 0, w: 5, h: 4 },
  { id: 'dining', name: 'Dining room', x: 5, y: 0, w: 5, h: 4 },
  { id: 'garage', name: 'Garage', x: 10, y: 0, w: 4, h: 4 },
  { id: 'living', name: 'Living room', x: 0, y: 4, w: 6, h: 4 },
  { id: 'hallway', name: 'Hallway', x: 6, y: 4, w: 2, h: 4 },
  { id: 'kids', name: "Kids' room", x: 8, y: 4, w: 6, h: 2.2 },
  { id: 'parents', name: "Parents' room", x: 8, y: 6.2, w: 6, h: 1.8 },
  { id: 'backyard', name: 'Backyard', x: 0, y: 8, w: 14, h: 4 }
];

export const SPOTS = {
  hob: { x: 1.0, y: 0.7, label: 'Hob' },
  sink: { x: 2.9, y: 0.7, label: 'Sink' },
  fridge: { x: 4.4, y: 1.3, label: 'Fridge' },
  pantry: { x: 0.6, y: 3.3, label: 'Pantry' },
  counter: { x: 2.2, y: 2.3, label: 'Counter' },
  armBase: { x: 3.4, y: 2.6, label: 'Arm-1' },
  table: { x: 7.5, y: 2.0, label: 'Table' },
  dock: { x: 6.5, y: 4.6, label: 'Dock' },
  frontDoor: { x: 7.0, y: 7.7, label: 'Front door' },
  sofa: { x: 2.6, y: 6.0, label: 'Sofa' },
  armchair: { x: 1.0, y: 6.9, label: 'Armchair' },
  play: { x: 4.6, y: 6.6, label: 'Play mat' },
  desk: { x: 11.0, y: 5.0, label: 'Desk' },
  bed: { x: 11.5, y: 7.1, label: 'Bed' },
  garden: { x: 2.0, y: 10.0, label: 'Herb garden' },
  car: { x: 12.0, y: 2.0, label: 'Car' },
  kitchenEdge: { x: 2.4, y: 3.3, label: '' },
  outside: { x: 7.0, y: 11.0, label: 'Street' }
};

export function createWorld() {
  return {
    actors: {
      robot: { id: 'robot:neo-1', name: 'NEO-1', kind: 'robot', at: { ...SPOTS.dock }, battery: 58, health: 82, reserve: 15, status: 'idle', task: null, vision: 0.95, gripLeftN: 6 },
      arm: { id: 'robot:arm-1', name: 'Arm-1', kind: 'robot', at: { ...SPOTS.armBase }, status: 'idle', task: null },
      mom: { id: 'household:mom', name: 'Mom (Layla)', kind: 'human', at: { ...SPOTS.sofa }, status: 'working on laptop', authority: 10 },
      dad: { id: 'household:dad', name: 'Dad (Omar)', kind: 'human', at: { ...SPOTS.outside }, status: 'commuting', authority: 10 },
      sara: { id: 'household:sara', name: 'Sara (9)', kind: 'human', at: { ...SPOTS.desk }, status: 'homework', authority: 2 },
      adam: { id: 'household:adam', name: 'Adam (6)', kind: 'human', at: { ...SPOTS.play }, status: 'playing', authority: 2 },
      dog: { id: 'pet:bobby', name: 'Bobby (dog)', kind: 'pet', at: { x: 3.4, y: 5.4 }, status: 'napping' },
      courier: { id: 'courier:market-b', name: 'Courier', kind: 'human', at: { ...SPOTS.outside }, status: 'away', hidden: true }
    },
    devices: {
      hob: { id: 'appliance:hob-1', name: 'Induction hob', state: 'off', zone1: 'off', zone2: 'off', note: 'zone 2 is slow (~70% power)' },
      gas: { id: 'appliance:gas-burner', name: 'Gas burner', state: 'off' },
      fridge: { id: 'appliance:fridge-1', name: 'Fridge', state: 'on', note: 'door seal leaks; shelf 2 left colder' },
      lights: { id: 'appliance:lights-kitchen', name: 'Kitchen lights (Matter)', state: 'off' },
      hood: { id: 'appliance:hood-1', name: 'Hood', state: 'off' },
      smoke: { id: 'sensor:smoke-1', name: 'Smoke detector', state: 'ok' },
      vacuum: { id: 'robot:vacuum-1', name: 'Robot vacuum', state: 'docked', schedule: '18:30 kitchen + dining', at: { x: 9.3, y: 3.4 } },
      dock: { id: 'appliance:dock-1', name: 'Robot dock', state: 'free' },
      power: { id: 'grid', name: 'Mains power', state: 'on' }
    },
    inventory: {
      chicken_whole: 0, rice_basmati_g: 400, onion: 4, yogurt_g: 500, saffron_g: 0, turmeric_g: 40,
      ghee_g: 300, spices: 'mandi blend, cinnamon, cardamom, cloves, loomi, bay', charcoal: 2, nuts_raisins: 'none',
      bread: 6, juice_l: 1.0
    },
    sink: { dishes: 14 },
    environment: { luxKitchen: 220, timeOfDaySunset: 17.75 }
  };
}

/** Kitchen light level falls after sunset unless lights are on. */
export function kitchenLux(world, t) {
  if (world.devices.lights.state === 'on') return 420;
  const minutesAfterSunset = t - (world.environment.timeOfDaySunset - 17) * 60;
  return minutesAfterSunset <= 0 ? 220 : Math.max(25, 220 - minutesAfterSunset * 6);
}
