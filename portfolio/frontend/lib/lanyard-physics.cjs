// A fixed-step rope with a weighted badge centre; independent of React and the DOM.
const STEP = 1000 / 60;
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));

function createLanyardPhysics({ width, height, cardWidth, cardHeight, initialSwing = true }) {
  const anchor = { x: width / 2, y: 0 };
  const attachment = 48;
  const ropeLength = clamp(height - cardHeight - 90, 120, 185);
  const badgeLink = cardHeight / 2 + attachment;
  const segmentCount = 10;
  const lengths = Array(segmentCount).fill(ropeLength / segmentCount).concat(badgeLink);
  let nodes;
  let drag = null;
  let accumulator = 0;
  let quietSteps = 0;
  let sleeping = false;
  let releaseVelocity = { x: 0, y: 0 };

  function reset(swing = false) {
    const offset = swing ? Math.min(16, width * 0.04) : 0;
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
    let dx = point.x - anchor.x;
    let dy = Math.max(24, point.y) - anchor.y;
    const reach = (ropeLength + drag.grabLength) * 0.995;
    const distance = Math.hypot(dx, dy);
    if (distance > reach) { dx *= reach / distance; dy *= reach / distance; }
    return { x: anchor.x + dx, y: anchor.y + dy };
  }
  function integrate() {
    const body = nodes[nodes.length - 1];
    const previousBody = { x: body.x, y: body.y };
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
    for (let iteration = 0; iteration < 30; iteration += 1) {
      nodes[0].x = anchor.x;
      nodes[0].y = anchor.y;
      for (let index = 0; index < lengths.length - (drag ? 1 : 0); index += 1) {
        const first = nodes[index];
        const second = nodes[index + 1];
        const dx = second.x - first.x;
        const dy = second.y - first.y;
        const distance = Math.hypot(dx, dy) || 0.00001;
        const firstMass = index === 0 ? 0 : 1;
        const secondMass = index + 1 === nodes.length - 1 ? 0.16 : 1;
        const sum = firstMass + secondMass;
        if (!sum) continue;
        const correction = (distance - lengths[index]) / distance;
        first.x += dx * correction * firstMass / sum;
        first.y += dy * correction * firstMass / sum;
        second.x -= dx * correction * secondMass / sum;
        second.y -= dy * correction * secondMass / sum;
      }
      if (drag) {
        // The grabbed point is pinned to the pointer; the hook rotates around it.
        const hook = nodes[segmentCount];
        const dx = hook.x - drag.target.x, dy = hook.y - drag.target.y;
        const distance = Math.hypot(dx, dy) || 1;
        hook.x = drag.target.x + dx / distance * drag.grabLength;
        hook.y = drag.target.y + dy / distance * drag.grabLength;
        const angle = Math.atan2(drag.target.y - hook.y, drag.target.x - hook.x) - Math.atan2(drag.local.y + badgeLink, drag.local.x);
        body.x = hook.x - Math.sin(angle) * badgeLink;
        body.y = hook.y + Math.cos(angle) * badgeLink;
      }
    }
    if (drag) {
      releaseVelocity = { x: releaseVelocity.x * .5 + clamp(body.x - previousBody.x, -15, 15) * .5, y: releaseVelocity.y * .5 + clamp(body.y - previousBody.y, -15, 15) * .5 };
      body.previousX = previousBody.x;
      body.previousY = previousBody.y;
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
      cardWidth, cardHeight, attachment, sleeping, dragging: Boolean(drag),
      grab: drag ? { ...drag.target } : null,
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
      const hook = nodes[segmentCount];
      const angle = Math.atan2(body.y - hook.y, body.x - hook.x) - Math.PI / 2;
      const dx = point.x - body.x, dy = point.y - body.y;
      const local = { x: dx * Math.cos(angle) + dy * Math.sin(angle), y: -dx * Math.sin(angle) + dy * Math.cos(angle) };
      drag = { local, grabLength: Math.max(8, Math.hypot(local.x, local.y + badgeLink)), target: { ...point } };
      sleeping = false; quietSteps = 0;
    },
    dragTo(point) { if (drag) drag.target = boundedTarget(point); },
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

function offsetRopePoints(points, offset) {
  return points.map((point, index) => {
    const before = points[Math.max(0, index - 1)];
    const after = points[Math.min(points.length - 1, index + 1)];
    const dx = after.x - before.x;
    const dy = after.y - before.y;
    const length = Math.hypot(dx, dy) || 1;
    const distance = typeof offset === "function" ? offset(index / Math.max(points.length - 1, 1)) : offset;
    return { x: point.x - dy / length * distance, y: point.y + dx / length * distance };
  });
}

function ropePath(points, offset = 0) {
  const shifted = offsetRopePoints(points, offset);
  let result = `M${shifted[0].x.toFixed(2)},${shifted[0].y.toFixed(2)}`;
  for (let index = 1; index < shifted.length - 1; index += 1) {
    const current = shifted[index];
    const next = shifted[index + 1];
    result += ` Q${current.x.toFixed(2)},${current.y.toFixed(2)} ${((current.x + next.x) / 2).toFixed(2)},${((current.y + next.y) / 2).toFixed(2)}`;
  }
  const last = shifted[shifted.length - 1];
  return `${result} L${last.x.toFixed(2)},${last.y.toFixed(2)}`;
}

function ribbonPath(points, side, scale = 1) {
  const shifted = offsetRopePoints(points, (position) => side * 18 * (1 - position) ** .8);
  shifted[0] = { x: points[0].x - side * 18 / scale, y: points[0].y };
  return ropePath(shifted);
}

// Fit the view, never the physical rope: narrow screens must not lock rotation.
function fitLanyardView(pose, width, height, padding = 12, pointer = null) {
  const angle = pose.angle * Math.PI / 180;
  const cosine = Math.cos(angle), sine = Math.sin(angle);
  const link = pose.cardHeight / 2 + pose.attachment;
  const centre = { x: pose.hook.x - sine * link, y: pose.hook.y + cosine * link };
  const points = [...pose.rope];
  for (const x of [-pose.cardWidth / 2, pose.cardWidth / 2]) for (const y of [-pose.cardHeight / 2, pose.cardHeight / 2]) points.push({ x: centre.x + x * cosine - y * sine, y: centre.y + x * sine + y * cosine });
  const minX = Math.min(...points.map(p => p.x)), maxX = Math.max(...points.map(p => p.x));
  const minY = Math.min(...points.map(p => p.y)), maxY = Math.max(...points.map(p => p.y));
  if (pointer && pose.grab) {
    const x = clamp(pointer.x, padding + 1, width - padding - 1);
    const y = clamp(pointer.y, padding + 1, height - padding - 1);
    const scale = Math.min(1,
      (x - padding) / Math.max(pose.grab.x - minX, 1),
      (width - padding - x) / Math.max(maxX - pose.grab.x, 1),
      (y - padding) / Math.max(pose.grab.y - minY, 1),
      (height - padding - y) / Math.max(maxY - pose.grab.y, 1));
    return { scale, x: x - pose.grab.x * scale, y: y - pose.grab.y * scale };
  }
  const scale = Math.min(1, (width - padding * 2) / Math.max(maxX - minX, 1), (height - padding * 2) / Math.max(maxY - minY, 1));
  return { scale, x: clamp(width / 2 * (1 - scale), padding - minX * scale, width - padding - maxX * scale), y: clamp(0, padding - minY * scale, height - padding - maxY * scale) };
}

module.exports = { createLanyardPhysics, ropePath, ribbonPath, fitLanyardView };
