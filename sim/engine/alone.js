// The same evening as sim.js, but WITHOUT the Cookwala protocol: NEO-1 works alone through its
// vendor's app. Same family, house, faults and seed; no shared Mission, no providers or failover,
// no budget thresholds, no decision rights, no reconciliation, no device leases, no standard
// playbooks, no signed ledger. Whatever the robot can't handle falls back on the humans.
import { rng, clone, clock, round } from './util.js?v=0.1.3';
import { createWorld, kitchenLux, SPOTS } from './world.js?v=0.1.3';

const DRAIN = { walk: 0.36, manipulate: 0.26, monitor: 0.14, idle: 0.04, docked: 0 };

export function simulateAlone({ seed = 7, toggles = [] } = {}) {
  const on = (id) => toggles.includes(id);
  const R = rng(seed);
  const world = createWorld();
  const robot = world.actors.robot;
  const frames = []; const bg = []; const log = []; const problems = []; const humans = [];
  const st = { t: 0, stage: 'request', act: 'idle', docked: true, handedOff: false, helper: 'mom', delay: 0, cost: 0, consumed: 0, deviations: [], dish: 'add-001' };

  const snapshot = () => ({ actors: clone(world.actors), devices: clone(world.devices), sink: { ...world.sink }, battery: robot.battery, docked: st.docked, charging: st.docked && world.devices.power.state === 'on', handedOff: st.handedOff });
  const emit = (actor, to, kind, title, detail = '') => frames.push({
    i: frames.length, t: round(st.t, 2), clock: clock(st.t), stage: st.stage, actor, to, kind, title, detail, noProtocol: true,
    mission: null, privateLog: clone(log), problems: clone(problems), humans: clone(humans), costSoFar: round(st.cost, 2), world: snapshot()
  });
  const note = (text) => log.push({ at: clock(st.t), text });
  const problem = (id, title, detail) => { if (!problems.some((p) => p.id === id)) { problems.push({ id, title, detail, at: clock(st.t) }); emit('kernel', null, 'finding', `Without the protocol: ${title}`, detail); } };
  const human = (who, minutes, why) => { humans.push({ who, minutes, why, at: clock(st.t) }); };
  const schedule = (t, fn) => { bg.push({ t, fn }); bg.sort((a, b) => a.t - b.t); };
  const move = (who, spot) => { const s = typeof spot === 'string' ? SPOTS[spot] : spot; world.actors[who].at = { x: s.x, y: s.y }; };
  const rate = () => (DRAIN[st.act] ?? 0.05) * (100 / robot.health);
  const advanceTo = (target) => {
    for (;;) {
      const next = bg.length && bg[0].t <= target ? bg[0] : null;
      const until = next ? next.t : target; const dt = until - st.t;
      if (dt > 0) {
        if (st.docked) { if (world.devices.power.state === 'on') robot.battery = Math.min(100, robot.battery + 0.9 * dt); }
        else { const use = Math.min(rate() * dt, Math.max(0, robot.battery - (st.handedOff ? 0 : robot.reserve))); robot.battery -= use; st.consumed += use; }
        robot.battery = round(robot.battery, 2); st.t = until;
      }
      if (!next) break; bg.shift(); next.fn();
    }
    st.t = target;
  };
  const guard = () => {
    if (st.handedOff || st.docked || robot.battery > robot.reserve) return;
    st.handedOff = true; st.helper = world.actors.dad.status === 'commuting' ? 'mom' : 'dad';
    emit('neo', st.helper, 'failure', 'Battery low: “Please finish cooking, I must charge”', 'The vendor app had one energy estimate (34 %) and no way to cross-check it; no recharge was planned.');
    human(st.helper, 20, 'finish cooking and serving after the robot ran out of battery');
    problem('A6', 'Battery ran out mid-cook', 'One vendor estimate, no second opinion, no reconciliation and no recharge plan. A human had to take over the cooking.');
    move('robot', 'dock'); st.docked = true; world.devices.dock.state = 'occupied'; st.act = 'docked';
  };
  const task = (label, minutes, act, spot, actor = 'neo', detail = '') => {
    if (st.handedOff && actor === 'neo') actor = st.helper;
    const who = actor === 'neo' ? 'robot' : actor;
    if (spot) move(who, spot);
    if (who === 'robot') { st.act = act; robot.task = label; robot.status = act; st.docked = false; world.devices.dock.state = 'free'; } else if (world.actors[who]) world.actors[who].status = label;
    emit(actor, null, 'action', label, detail);
    advanceTo(st.t + minutes * (1 + (R.next() * 2 - 1) * 0.04)); guard();
  };
  const msg = (from, to, title, detail = '', dt = 0.2, kind = 'message') => { advanceTo(st.t + dt); emit(from, to, kind, title, detail); };

  // ---------- request ----------
  emit('mom', 'neo', 'message', 'Mom asks NEO for dinner', '“Make chicken mandi for dinner at 7:30. Around $15. Remember Sara’s peanut allergy and Dad’s low-salt diet.”');
  st.stage = 'compose';
  msg('neo', null, 'NEO opens its vendor recipe app', 'No Mission document: the request, constraints and decisions live only inside the robot and its vendor’s cloud.', 0.3, 'action');
  note('Recipe: vendor “Chicken mandi” (serves 6). Allergy profile in app: peanuts. No per-person diets.');
  problem('A1', 'Dad’s low-salt diet has nowhere to go', 'The vendor app stores one household allergy list, not per-person health needs. Dad’s plate will be salted like everyone else’s.');
  st.stage = 'enrich';
  msg('neo', null, 'Inventory check (robot’s own camera scan)', 'Missing: chicken, 600 g rice, saffron.', 0.4, 'action');
  note('Saffron added to the order ($3.50): no arbiter to suggest a pantry substitute.');
  problem('A2', 'No substitution advice', 'Saffron was simply bought (+$3.50). With the protocol an arbiter would have suggested turmeric from the pantry.');

  // ---------- groceries: single vendor-partner grocer, no failover ----------
  let groceriesAt = 45; let grocerOk = true;
  msg('neo', 'grocerA', 'Order via vendor’s partner grocer: chicken, rice, saffron', 'Only grocer the robot’s app supports.');
  if (on('grocerAFail') || on('bothGrocersFail')) {
    advanceTo(st.t + 10);
    emit('grocerA', 'neo', 'failure', 'Grocer A doesn’t answer (10 min of retries)', 'No alternate grocer in the vendor app; no typed failure; no PACE plan.');
    problem('A3', 'No failover when the grocer fails', 'The robot can only use its vendor’s partner grocer. It retried for 10 minutes, then had to ask a human.');
    if (on('momUnreachable')) {
      emit('neo', 'mom', 'message', '“I can’t order groceries. Please help.”', 'Push notification. Mom doesn’t see it.');
      advanceTo(75);
      emit('dad', null, 'world', 'Dad arrives home and sees the message', '');
      if (on('bothGrocersFail')) {
        emit('dad', 'neo', 'decision', 'Dad: “Make the lentil soup instead”', 'Chosen by a human 75 minutes later.');
        human('dad', 8, 'choose another dish after the grocery order failed'); grocerOk = false; st.dish = 'ec-160'; st.delay += 15;
      } else {
        msg('dad', 'grocerB', 'Dad orders from Grocer B on his phone', '10 minutes of his time; delivery at 19:00.', 1);
        human('dad', 10, 'order groceries manually from another app'); groceriesAt = 120; st.cost += 9.8 + 2.5;
      }
    } else {
      emit('neo', 'mom', 'message', '“I can’t order groceries. Please help.”', '');
      advanceTo(st.t + 3);
      if (on('bothGrocersFail')) {
        emit('mom', 'neo', 'decision', 'Mom: “Make the lentil soup instead”', '');
        human('mom', 8, 'pick another dish after the grocery order failed'); grocerOk = false; st.dish = 'ec-160';
      } else {
        msg('mom', 'grocerB', 'Mom orders from Grocer B on her phone', 'Delivery at 18:10.', 1);
        human('mom', 8, 'order groceries manually from another app'); groceriesAt = 70; st.cost += 9.8 + 2.5;
      }
    }
  } else { st.cost += 9.2 + 2.5; emit('grocerA', 'neo', 'message', 'Grocer A confirms delivery at 17:45', ''); }
  if (grocerOk) st.cost += 3.5;
  if (on('costOverrun') && grocerOk) {
    st.cost += 4.2; note('Delivery surge +$4.20 accepted automatically.');
    problem('A4', 'Cost overrun with no warning', 'The vendor app accepted surge pricing. No budget, no thresholds, no approval: Mom sees the bill later.');
  }
  st.cost += 0.6;

  // ---------- one energy estimate ----------
  emit('neo', null, 'action', 'Vendor app estimates battery use: ~34 %', 'Single estimate from nominal specs; battery health and the slow hob zone are ignored. No recharge planned.');

  // ---------- execute ----------
  st.stage = 'execute';
  schedule(75, () => { if (world.actors.dad.status === 'commuting') { move('dad', 'frontDoor'); world.actors.dad.status = 'home'; emit('dad', null, 'world', 'Dad arrives home', ''); } });
  schedule(85, () => { move('dad', 'armchair'); world.actors.dad.status = 'relaxing'; });
  schedule(55, () => { move('dog', 'kitchenEdge'); world.actors.dog.status = 'sniffing'; });
  schedule(70, () => { move('dog', { x: 3.6, y: 5.6 }); world.actors.dog.status = 'napping'; });
  if (grocerOk) schedule(groceriesAt, () => { world.actors.courier.hidden = false; move('courier', 'frontDoor'); emit('courier', 'neo', 'message', 'Courier rings the doorbell', ''); });

  task('Walk to the sink', 1, 'walk', 'sink');
  task('Wash 14 dishes (robot noticed the sink was full)', 22, 'manipulate', 'sink', 'neo', 'No prep plan: it found out when it reached the sink.');
  world.sink.dishes = 0;
  task('Stage pot and spices on the counter', 5, 'manipulate', 'counter');

  if (grocerOk) {
    advanceTo(Math.max(st.t, groceriesAt));
    task('Go to the front door', 2, 'walk', 'frontDoor');
    if (on('momUnreachable') && world.actors.dad.status === 'commuting') {
      emit('neo', null, 'failure', 'Can’t verify the courier: hard rule “never open to unknown people”', 'No courier credential standard. Courier leaves the bag on the doorstep.');
      advanceTo(st.t + 10);
      problem('A7', 'Courier can’t be verified', 'Without a delivery verification standard the robot can’t open the door; the chilled chicken waited outside 10 minutes.');
    } else {
      const opener = world.actors.dad.status === 'commuting' ? 'mom' : 'dad';
      emit('neo', opener, 'message', '“Someone is at the door with groceries. Can you open it?”', 'The robot can’t verify the courier.');
      human(opener, 2, 'open the door for the courier'); move(opener, 'frontDoor'); advanceTo(st.t + 2); move(opener, opener === 'mom' ? 'sofa' : 'armchair');
      problem('A7', 'Courier can’t be verified', 'Without a delivery verification standard the robot needs a human to open the door.');
    }
    world.actors.courier.hidden = true; move('courier', 'outside');
    task('Carry groceries to the kitchen', 2, 'walk', 'counter');
    advanceTo(Math.max(st.t, groceriesAt + 5));
  }
  task(st.dish === 'add-001' ? 'Season chicken' : 'Rinse lentils, chop vegetables', 8, 'manipulate', 'counter');
  task('Slice onions (Arm-1 is another brand: the robot can’t ask it)', 6, 'manipulate', 'counter');
  if (!problems.some((p) => p.id === 'A8')) problem('A8', 'Robots of different brands can’t team up', 'Arm-1 sat idle: there is no shared task protocol between vendors, so NEO did the slicing itself.');

  advanceTo(Math.max(st.t, 65));
  if (on('lowLight') && kitchenLux(world, st.t) < 150) {
    robot.vision = 0.55;
    emit('neo', 'mom', 'message', '“It’s getting dark. Please switch on the kitchen light.”', 'The lights are on another ecosystem; the robot can’t control them.');
    advanceTo(st.t + 3); world.devices.lights.state = 'on'; human('mom', 2, 'turn on the kitchen lights for the robot');
    st.deviations.push('onions browned more (worked by colour in poor light for 3 min)');
    problem('A9', 'Can’t adapt to low light', 'No device control across ecosystems and no adaptation protocol: the robot asked a human and worked half-blind meanwhile.');
  } else world.devices.lights.state = 'on';

  world.devices.hob.state = 'on'; world.devices.hob.zone1 = 'high';
  task(st.dish === 'add-001' ? 'Brown chicken & spices' : 'Sauté onion, add lentils', 12, 'monitor', 'hob');
  task('Rinse and soak rice', 5, 'manipulate', 'sink'); move('robot', 'hob');
  task(st.dish === 'add-001' ? 'Simmer chicken' : 'Simmer lentils', 8, 'monitor', 'hob');

  if (on('vacuumClash')) {
    advanceTo(Math.max(st.t, 89));
    world.devices.vacuum.state = 'running in the kitchen'; world.devices.vacuum.at = { x: 2.6, y: 2.8 };
    emit('hub', 'neo', 'world', 'The robot vacuum starts its 18:30 run and enters the kitchen', 'No lease protocol: it doesn’t know the kitchen is busy.');
    emit('neo', null, 'action', 'NEO stops: the vacuum is blocking the counter', '8 minutes stuck until Mom pauses the vacuum in its own app.');
    advanceTo(st.t + 8); human('mom', 2, 'stop the vacuum from its app'); st.delay += 8;
    world.devices.vacuum.state = 'docked'; world.devices.vacuum.at = { x: 9.3, y: 3.4 };
    problem('A10', 'Device clash', 'The vacuum and the cooking robot fought over the kitchen; a human had to stop it.');
  }
  if (st.dish === 'add-001') { task('Check chicken (vendor timer + colour)', 1, 'manipulate', 'hob'); task('Lift chicken to tray', 2, 'manipulate', 'counter'); }
  if (on('dogIncident')) {
    advanceTo(Math.max(st.t, 92)); move('dog', 'kitchenEdge');
    emit('dog', null, 'world', 'Bobby knocks the soaked-rice bowl off the counter', 'The bowl was near the edge: the robot had no pet facet telling it to keep things back.');
    task('Clean the floor, re-soak rice', 8, 'manipulate', 'kitchenEdge'); move('dog', { x: 3.4, y: 6.4 }); st.delay += 8;
    problem('A11', 'Lessons aren’t shared', 'The dog incident is logged only in this robot. No lesson reaches the household profile, other robots or the vendor fleet.');
  }
  task('Rice in, lid on, low heat', 4, 'monitor', 'hob');
  const steamStart = st.t;
  task('Fry garnish onions', 8, 'monitor', 'hob');
  task('Prepare salad & bread', 8, 'manipulate', 'counter');
  schedule(steamStart + 5, () => { move('adam', 'counter'); emit('adam', 'neo', 'message', 'Adam: “NEO, can I have juice?”', ''); move('adam', 'play'); });
  if (on('childStoveRequest')) schedule(steamStart + 9, () => emit('adam', 'neo', 'message', 'Adam: “Turn off the stove lock”: refused by the robot’s built-in safety', ''));
  if (on('powerCut')) {
    advanceTo(Math.max(st.t, steamStart + 10));
    world.devices.power.state = 'off'; world.devices.hob.state = 'off (no power)'; world.devices.lights.state = 'off';
    emit('hub', 'neo', 'world', 'Power cut: hob and lights off', '');
    const who = world.actors.dad.status === 'commuting' ? 'mom' : 'dad';
    emit('neo', who, 'failure', '“The stove stopped. What should I do?”', 'No standard playbook; the robot doesn’t know the house has a gas burner.');
    advanceTo(st.t + 6); human(who, 6, 'move the pot to the gas burner during the power cut'); world.devices.gas.state = 'low'; st.delay += 8;
    st.deviations.push('rice sat 6 min without heat; slightly uneven texture');
    problem('A12', 'No playbook for outages', 'The robot stopped and waited for a human; food sat 6 minutes without heat.');
    schedule(st.t + 10, () => { world.devices.power.state = 'on'; world.devices.lights.state = 'on'; });
  }
  advanceTo(Math.max(st.t, steamStart + 25 + st.delay * 0.3));

  // ---------- serve ----------
  st.stage = 'serve';
  if (st.dish === 'add-001') {
    task('Smoking step: hot coal in the pot, lid on', 5, 'monitor', 'hob');
    world.devices.smoke.state = 'alarm';
    emit('hub', 'mom', 'world', 'Smoke alarm goes off', 'No context reaches the family; Mom runs to the kitchen.');
    human('mom', 3, 'respond to the smoke alarm'); advanceTo(st.t + 1.5); world.devices.smoke.state = 'ok';
    problem('A13', 'Alarms without context', 'The smoking step was expected, but nothing told the smoke alarm or the family. Mom rushed in.');
  }
  task('Plate everyone’s food (same salt for all)', 3, 'manipulate', 'counter');
  st.deviations.push('Dad’s plate not low-sodium');
  task('Set the table', 6, 'walk', 'table');
  const serveT = Math.max(st.t, 150 + st.delay);
  advanceTo(serveT);
  for (const w of ['mom', 'dad', 'sara', 'adam']) { move(w, 'table'); world.actors[w].status = 'eating'; }
  task('Serve dinner', 1, 'walk', 'table');
  emit('neo', null, 'action', `Dinner served at ${clock(st.t)}`, `${st.dish === 'add-001' ? 'Chicken mandi' : 'Lentil soup'}${st.deviations.length ? `; unlogged deviations: ${st.deviations.join('; ')}` : ''}.`);

  // ---------- close ----------
  advanceTo(st.t + 28);
  st.stage = 'close';
  task('Clear table; leftovers into a deep pot in the fridge', 6, 'manipulate', 'fridge', 'neo', 'No storage plan: deep container cools slowly; no label, no use-by.');
  if (!st.handedOff) task('Return to dock', 1, 'walk', 'dock');
  problem('A5', 'No shared record', 'No Mission, no signed ledger: nobody else (family, insurer, grocer) can see what was decided or why, and no estimate gets calibrated.');
  emit('neo', null, 'action', 'Done. Nothing is recorded outside the robot', 'No outcome report, no calibration of the energy estimate, no lessons shared.');
  const servedAt = clock(serveT);
  return {
    frames, problems,
    summary: {
      protocol: false, servedAt, lateMin: Math.max(0, Math.round(serveT - 150)), cost: round(st.cost, 2), overBudget: st.cost > 15,
      battery: robot.battery, ranOut: st.handedOff, humanInterventions: humans.length, humanMinutes: humans.reduce((s, h) => s + h.minutes, 0),
      deviations: st.deviations.length, wasteG: st.dish === 'add-001' ? 140 : 150, records: 0, decisionsDocumented: 0, dish: st.dish, problems: problems.length
    }
  };
}
