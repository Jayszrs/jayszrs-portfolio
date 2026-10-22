const assert = require("node:assert/strict");
const { createLanyardPhysics, ropePath, fitLanyardView } = require("../frontend/lib/lanyard-physics.cjs");

function advance(engine, frames = 600) {
  for (let index = 0; index < frames; index += 1) {
    const pose = engine.step(1000 / 60);
    assert.ok([pose.angle, pose.tilt, pose.body.x, pose.body.y, ...pose.rope.flatMap((point) => [point.x, point.y])].every(Number.isFinite));
    assert.deepEqual(pose.rope[0], engine.dimensions.anchor, "The hanging point must stay pinned");
    const angle = pose.angle * Math.PI / 180;
    const view = fitLanyardView(pose, engine.dimensions.width, engine.dimensions.height);
    const link = pose.cardHeight / 2 + pose.attachment;
    const centre = { x: pose.hook.x - Math.sin(angle) * link, y: pose.hook.y + Math.cos(angle) * link };
    for (const x of [-pose.cardWidth / 2, pose.cardWidth / 2]) for (const y of [-pose.cardHeight / 2, pose.cardHeight / 2]) {
      const screenX = view.x + (centre.x + x * Math.cos(angle) - y * Math.sin(angle)) * view.scale;
      const screenY = view.y + (centre.y + x * Math.sin(angle) + y * Math.cos(angle)) * view.scale;
      assert.ok(screenX >= 11 && screenX <= engine.dimensions.width - 11, "Fit the view without clipping or physically locking the card");
      assert.ok(screenY >= 11 && screenY <= engine.dimensions.height - 11);
    }
  }
  return engine.pose();
}
for (const width of [264, 335, 480, 600]) {
  const cardWidth = Math.min(270, width * .7, width - 80);
  const engine = createLanyardPhysics({ width, height: 620, cardWidth, cardHeight: cardWidth / 0.7 });
  const rest = advance(engine, 1200);
  assert.ok(Math.abs(rest.body.x - width / 2) < 2, "An undisturbed card should settle under its anchor");
  assert.ok(rest.sleeping, "Settled motion must stop consuming animation frames");
  engine.beginDrag(rest.body);
  engine.dragTo({ x: width - 20, y: 130 });
  const dragged = advance(engine, 90);
  assert.ok(dragged.dragging);
  assert.ok(Math.abs(dragged.body.x - rest.body.x) > 30, "Horizontal dragging must translate the card, not just tilt it in place");
  assert.ok(Math.hypot(dragged.body.x - (width - 20), dragged.body.y - 130) < 1, "The grabbed centre must track the pointer accurately");
  assert.ok(dragged.rope.some((point, index) => index && Math.abs(point.x - width / 2) > 3), "The rope must bend with the card");
  engine.endDrag();
  const released = advance(engine, 12);
  assert.ok(!released.dragging && Math.hypot(released.body.x - dragged.body.x, released.body.y - dragged.body.y) > 5, "Release must retain physical movement");
  advance(engine, 1800);
  assert.ok(engine.pose().sleeping);
  engine.reset(false);
  const staticPose = engine.pose();
  assert.ok(staticPose.sleeping && Math.abs(staticPose.angle) < 0.001);
  assert.match(ropePath(staticPose.rope), /^M.* Q.* L/);
  engine.kick(8, -1);
  assert.ok(!engine.pose().sleeping);
  assert.ok(Math.abs(advance(engine, 15).angle) > 0.5, "Keyboard impulses should swing the badge");
}
const geometry = { width: 480, height: 620, cardWidth: 270, cardHeight: 270 / 0.7 };
const offCentre = createLanyardPhysics({ ...geometry, initialSwing: false });
const initial = offCentre.pose();
const local = { x: geometry.cardWidth * .3, y: -geometry.cardHeight * .2 };
const point = { x: initial.body.x + local.x, y: initial.body.y + local.y };
const target = { x: point.x + 75, y: point.y - 95 };
offCentre.beginDrag(point);
offCentre.dragTo(target);
const held = advance(offCentre, 90);
const angle = held.angle * Math.PI / 180;
const grabbed = { x: held.body.x + local.x * Math.cos(angle) - local.y * Math.sin(angle), y: held.body.y + local.x * Math.sin(angle) + local.y * Math.cos(angle) };
assert.ok(Math.hypot(grabbed.x - target.x, grabbed.y - target.y) < 1, "An off-centre grab must follow the pointer without slipping as the card rotates");
const sixty = createLanyardPhysics(geometry);
const thirty = createLanyardPhysics(geometry);
for (let index = 0; index < 180; index += 1) sixty.step(1000 / 60);
for (let index = 0; index < 90; index += 1) thirty.step(1000 / 30);
assert.ok(Math.abs(sixty.pose().angle - thirty.pose().angle) < 0.1, "Motion must use a fixed timestep across refresh rates");
console.log("PASS: four sizes, pinned anchor, weighted rope, drag, release inertia, settling/sleep, reset, keyboard impulses, and fixed-step timing.");
