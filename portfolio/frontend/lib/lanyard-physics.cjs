// A fixed-step rope with a weighted badge centre; independent of React and the DOM.
const STEP = 1000 / 60;
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));

function createLanyardPhysics({ width, height, cardWidth, cardHeight, initialSwing = true }) {
  const anchor = { x: width / 2, y: 0 };
  const ropeLength = clamp(height - cardHeight - 110, 64, 155);
  const badgeLink = cardHeight / 2 + 22;
  const segmentCount = 6;
  const lengths = Array(segmentCount).fill(ropeLength / segmentCount).concat(badgeLink);
  let nodes;
  let drag = null;
  let accumulator = 0;
  let quietSteps = 0;
  let sleeping = false;
  let releaseVelocity = { x: 0, y: 0 };

  function reset(swing = false) {
    const offset = swing ? Math.min(34, width * 0.08) : 0;
    nodes = Array.from({ length: segmentCount + 2 }, (_, index) => {
      const ratio = Math.min(index / segmentCount, 1);
      const x = anchor.x + offset * ratio;
      const y = anchor.y + ropeLength * ratio + (index > segmentCount ? badgeLink : 0);
      return { x, y, previousX: x, previousY: y };
    });
    drag = null;
    releaseVelocity = { x: 0, y: 0 };
    quietSteps = 0;
    sleeping = !swing;
    accumulator = 0;
  }
  reset(initialSwing);

  function boundedTarget(point) {
    let dx = clamp(point.x, 20, width - 20) - anchor.x;
    let dy = Math.max(badgeLink * 0.45, Math.min(point.y, height - cardHeight * 0.25 - 70) - anchor.y);
    const reach = (ropeLength + badgeLink) * 0.995;
    const distance = Math.hypot(dx, dy);
    if (distance > reach) { dx *= reach / distance; dy *= reach / distance; }
    return { x: anchor.x + dx, y: anchor.y + dy };
  }
  function integrate() {
    const body = nodes[nodes.length - 1];
    for (let index = 1; index < nodes.length; index += 1) {
      const node = nodes[index];
      if (drag && node === body) continue;
      const vx = clamp((node.x - node.previousX) * 0.978, -18, 18);
      const vy = clamp((node.y - node.previousY) * 0.978, -18, 18);
      node.previousX = node.x;
      node.previousY = node.y;
      node.x += vx;
      node.y += vy + 0.48;
    }
    if (drag) {
      releaseVelocity = { x: clamp(drag.target.x - body.x, -15, 15), y: clamp(drag.target.y - body.y, -15, 15) };
      body.previousX = body.x;
      body.previousY = body.y;
      body.x = drag.target.x;
      body.y = drag.target.y;
    }
    for (let iteration = 0; iteration < 18; iteration += 1) {
      nodes[0].x = anchor.x;
      nodes[0].y = anchor.y;
      for (let index = 0; index < lengths.length; index += 1) {
        const first = nodes[index];
        const second = nodes[index + 1];
        const dx = second.x - first.x;
        const dy = second.y - first.y;
        const distance = Math.hypot(dx, dy) || 0.00001;
        const firstMass = index === 0 ? 0 : 1;
        const secondMass = index + 1 === nodes.length - 1 ? (drag ? 0 : 0.16) : 1;
        const sum = firstMass + secondMass;
        if (!sum) continue;
        const correction = (distance - lengths[index]) / distance;
        first.x += dx * correction * firstMass / sum;
        first.y += dy * correction * firstMass / sum;
        second.x -= dx * correction * secondMass / sum;
        second.y -= dy * correction * secondMass / sum;
      }
    }
    const movement = nodes.reduce((sum, node) => sum + Math.hypot(node.x - node.previousX, node.y - node.previousY), 0);
    quietSteps = !drag && movement < 0.04 ? quietSteps + 1 : 0;
    if (quietSteps > 45) {
      sleeping = true;
      nodes.forEach((node) => { node.previousX = node.x; node.previousY = node.y; });
    }
  }
  function pose() {
    const hook = nodes[segmentCount];
    const body = nodes[segmentCount + 1];
    return {
      rope: nodes.slice(0, segmentCount + 1).map(({ x, y }) => ({ x, y })),
      hook: { x: hook.x, y: hook.y },
      body: { x: body.x, y: body.y },
      angle: Math.atan2(body.y - hook.y, body.x - hook.x) * 180 / Math.PI - 90,
      tilt: clamp((body.x - body.previousX) * 1.3, -10, 10),
      cardWidth, cardHeight, sleeping, dragging: Boolean(drag),
    };
  }
  return {
    pose,
    dimensions: { width, height, cardWidth, cardHeight, ropeLength, badgeLink, anchor },
    step(milliseconds = STEP) {
      if (sleeping && !drag) return pose();
      accumulator += clamp(milliseconds, 0, STEP * 3);
      while (accumulator >= STEP) { integrate(); accumulator -= STEP; }
      return pose();
    },
    beginDrag(point) {
      const body = nodes[nodes.length - 1];
      drag = { offset: { x: point.x - body.x, y: point.y - body.y }, target: { x: body.x, y: body.y } };
      sleeping = false; quietSteps = 0;
    },
    dragTo(point) { if (drag) drag.target = boundedTarget({ x: point.x - drag.offset.x, y: point.y - drag.offset.y }); },
    endDrag() {
      if (!drag) return;
      const body = nodes[nodes.length - 1];
      body.previousX = body.x - releaseVelocity.x;
      body.previousY = body.y - releaseVelocity.y;
      drag = null; sleeping = false; quietSteps = 0;
    },
    kick(x = 6, y = -1) {
      const body = nodes[nodes.length - 1];
      body.previousX = body.x - x;
      body.previousY = body.y - y;
      sleeping = false; quietSteps = 0;
    },
    reset,
  };
}

function ropePath(points, offset = 0) {
  const shifted = points.map((point, index) => {
    const before = points[Math.max(0, index - 1)];
    const after = points[Math.min(points.length - 1, index + 1)];
    const dx = after.x - before.x;
    const dy = after.y - before.y;
    const length = Math.hypot(dx, dy) || 1;
    return { x: point.x - dy / length * offset, y: point.y + dx / length * offset };
  });
  let result = `M${shifted[0].x.toFixed(2)},${shifted[0].y.toFixed(2)}`;
  for (let index = 1; index < shifted.length - 1; index += 1) {
    const current = shifted[index];
    const next = shifted[index + 1];
    result += ` Q${current.x.toFixed(2)},${current.y.toFixed(2)} ${((current.x + next.x) / 2).toFixed(2)},${((current.y + next.y) / 2).toFixed(2)}`;
  }
  const last = shifted[shifted.length - 1];
  return `${result} L${last.x.toFixed(2)},${last.y.toFixed(2)}`;
}

module.exports = { createLanyardPhysics, ropePath };
