<script lang="ts">
  import { onMount } from "svelte";
  import { spline } from "../spline";
  import { createNoise2D } from "simplex-noise";

  const getSettings = (value: number) => {
    count = 0;
    if (value < 20) return { noise: 0.02, points: 30, hue: 0 };
    if (value < 40) return { noise: 0.015, points: 15, hue: 17 };
    if (value < 60) return { noise: 0.01, points: 10, hue: 34 };
    if (value < 80) return { noise: 0.007, points: 8, hue: 80 };
    return { noise: 0.005, points: 6, hue: 90 };
  };

  let pathElement: SVGPathElement;
  let hueNoiseOffset = 0;
  const simplex = createNoise2D();

  let { mood, size, isStatic } = $props();
  let settings = $derived(getSettings(mood));
  let noiseStep = $derived(settings.noise);
  let startColor = $derived(`hsl(${settings.hue}, 100%, 75%)`);
  let stopColor = $derived(`hsl(${settings.hue + 15}, 100%, 75%)`);
  let count = 0;

  function map(n: any, start1: any, end1: any, start2: any, end2: any) {
    return ((n - start1) / (end1 - start1)) * (end2 - start2) + start2;
  }

  function noise(x: number, y: number) {
    return simplex(x, y);
  }

  function createPoints(p: number) {
    const points = [];
    const numPoints = p;
    const angleStep = (Math.PI * 2) / numPoints;
    const rad = 75;

    for (let i = 1; i <= numPoints; i++) {
      const theta = i * angleStep;
      const x = 100 + Math.cos(theta) * rad;
      const y = 100 + Math.sin(theta) * rad;

      points.push({
        x: x,
        y: y,
        originX: x,
        originY: y,
        noiseOffsetX: Math.random() * 1000,
        noiseOffsetY: Math.random() * 1000,
      });
    }

    return points;
  }

  onMount(() => {
    const points = $derived(createPoints(settings.points));

    $effect(() => {
      console.log(mood);
      isStatic && animate();
    });
    function animate() {
      pathElement.setAttribute("d", spline(points, 1, true));

      for (let i = 0; i < points.length; i++) {
        const point = points[i];
        const nX = noise(point.noiseOffsetX, point.noiseOffsetX);
        const nY = noise(point.noiseOffsetY, point.noiseOffsetY);
        const x = map(nX, -1, 1, point.originX - 20, point.originX + 20);
        const y = map(nY, -1, 1, point.originY - 20, point.originY + 20);

        point.x = x;
        point.y = y;

        point.noiseOffsetX += noiseStep;
        point.noiseOffsetY += noiseStep;
      }

      //   document.documentElement.style.setProperty(
      //     "--startColor",
      //     `hsl(${hue}, 100%, 75%)`
      //   );
      //   document.documentElement.style.setProperty(
      //     "--stopColor",
      //     `hsl(${hue + 60}, 100%, 75%)`
      //   );
      //   document.body.style.background = `hsl(${hue + 60}, 75%, 5%)`;

      hueNoiseOffset += noiseStep / 6;
      if (isStatic && count > 2) {
        return;
      }
      count++;
      requestAnimationFrame(animate);
    }

    animate();
  });
</script>

<svg viewBox="0 0 200 200" class="w-{size} h-{size} inline">
  <defs>
    <linearGradient id="gradient" gradientTransform="rotate(90)">
      <stop id="gradientStop1" offset="0%" stop-color={startColor} />
      <stop id="gradientStop2" offset="100%" stop-color={stopColor} />
    </linearGradient>
  </defs>
  <path bind:this={pathElement} d="" fill="url('#gradient')"></path>
</svg>
