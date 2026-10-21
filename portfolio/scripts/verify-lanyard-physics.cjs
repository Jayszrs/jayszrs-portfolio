const assert = require("node:assert/strict");
const { createLanyardPhysics, ropePath } = require("../frontend/lib/lanyard-physics.cjs");

function advance(engine, frames = 600) {
  for (let index = 0; index < frames; index += 1) {
    const pose = engine.step(1000 / 60);
    assert.ok([pose.angle, pose.tilt, pose.body.x, pose.body.y, ...pose.rope.flatMap((point) => [point.x, point.y])].every(Number.isFinite));
    assert.deepEqual(pose.rope[0], engine.dimensions.anchor, "The hanging point must stay pinned");
    const angle = pose.angle * Math.PI / 180;
    const halfWidth = (pose.cardWidth * Math.cos(angle) + pose.cardHeight * Math.abs(Math.sin(angle))) / 2;
    const halfHeight = (pose.cardHeight * Math.cos(angle) + pose.cardWidth * Math.abs(Math.sin(angle))) / 2;
    assert.ok(pose.body.x - halfWidth >= 11 && pose.body.x + halfWidth <= engine.dimensions.width - 11, "The entire rotating card must stay inside horizontal bounds");
    assert.ok(pose.body.y - halfHeight >= 29 && pose.body.y + halfHeight <= engine.dimensions.height - 23, "The entire card must stay inside vertical bounds");
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
  assert.ok(Math.hypot(dragged.body.x - rest.body.x, dragged.body.y - rest.body.y) > 15 || Math.abs(dragged.angle) > 5, "A drag must translate or rotate the card visibly within its safe bounds");
  assert.ok(dragged.rope.some((point, index) => index && Math.abs(point.x - width / 2) > 3), "The rope must bend with the card");
  engine.endDrag();
  const released = advance(engine, 12);
  assert.ok(!released.dragging && Math.abs(released.body.x - dragged.body.x) > 1, "Release must retain physical movement");
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
const sixty = createLanyardPhysics(geometry);
const thirty = createLanyardPhysics(geometry);
for (let index = 0; index < 180; index += 1) sixty.step(1000 / 60);
for (let index = 0; index < 90; index += 1) thirty.step(1000 / 30);
assert.ok(Math.abs(sixty.pose().angle - thirty.pose().angle) < 0.1, "Motion must use a fixed timestep across refresh rates");
console.log("PASS: four sizes, pinned anchor, weighted rope, drag, release inertia, settling/sleep, reset, keyboard impulses, and fixed-step timing.");
