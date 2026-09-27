/**
 * Procedural canvas textures used as stand-ins until real PBR textures are available
 * (see REQUIRED_MODELS.md). Every texture is created once and cached.
 */
import { CanvasTexture, RepeatWrapping, SRGBColorSpace, type Texture } from 'three';
import { seededRandom } from '$lib/game/world';

const cache = new Map<string, Texture>();

function make(
	key: string,
	width: number,
	height: number,
	draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void
): CanvasTexture {
	const cached = cache.get(key);
	if (cached) return cached as CanvasTexture;

	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext('2d')!;
	draw(ctx, width, height);

	const texture = new CanvasTexture(canvas);
	texture.colorSpace = SRGBColorSpace;
	texture.wrapS = texture.wrapT = RepeatWrapping;
	texture.anisotropy = 8;
	cache.set(key, texture);
	return texture;
}

/** Returns a clone sharing the same image but with its own repeat settings. */
function repeated(texture: Texture, x: number, y: number) {
	const clone = texture.clone();
	clone.repeat.set(x, y);
	clone.needsUpdate = true;
	return clone;
}

/* ------------------------------------------------------------------ */
/* Wallpaper: dark burgundy damask with muted gold ornaments           */
/* ------------------------------------------------------------------ */

function drawDamaskMotif(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
	ctx.save();
	ctx.translate(cx, cy);

	// Central teardrop / flame shape
	ctx.beginPath();
	ctx.moveTo(0, -s);
	ctx.bezierCurveTo(s * 0.55, -s * 0.45, s * 0.45, s * 0.35, 0, s * 0.8);
	ctx.bezierCurveTo(-s * 0.45, s * 0.35, -s * 0.55, -s * 0.45, 0, -s);
	ctx.fill();

	// Inner cut-out
	ctx.save();
	ctx.globalCompositeOperation = 'destination-out';
	ctx.beginPath();
	ctx.ellipse(0, s * 0.05, s * 0.14, s * 0.32, 0, 0, Math.PI * 2);
	ctx.fill();
	ctx.restore();

	// Curling side leaves
	ctx.lineWidth = s * 0.07;
	ctx.lineCap = 'round';
	for (const dir of [-1, 1]) {
		ctx.beginPath();
		ctx.moveTo(dir * s * 0.2, s * 0.55);
		ctx.bezierCurveTo(dir * s * 0.9, s * 0.7, dir * s * 1.0, s * 0.05, dir * s * 0.65, -s * 0.1);
		ctx.bezierCurveTo(dir * s * 0.45, -s * 0.15, dir * s * 0.45, s * 0.15, dir * s * 0.6, s * 0.12);
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(dir * s * 0.15, -s * 0.55);
		ctx.bezierCurveTo(
			dir * s * 0.7,
			-s * 0.8,
			dir * s * 0.85,
			-s * 0.35,
			dir * s * 0.55,
			-s * 0.35
		);
		ctx.stroke();
	}

	// Stem + little bud
	ctx.beginPath();
	ctx.moveTo(0, s * 0.8);
	ctx.lineTo(0, s * 1.05);
	ctx.stroke();
	ctx.beginPath();
	ctx.arc(0, -s * 1.12, s * 0.09, 0, Math.PI * 2);
	ctx.fill();

	ctx.restore();
}

export function wallpaperTexture(repeatX: number, repeatY: number) {
	const base = make('wallpaper', 512, 512, (ctx, w, h) => {
		ctx.fillStyle = '#3b1519';
		ctx.fillRect(0, 0, w, h);

		// Subtle vertical stripes for depth
		for (let x = 0; x < w; x += 16) {
			ctx.fillStyle = x % 32 === 0 ? 'rgba(0,0,0,0.12)' : 'rgba(255,220,180,0.025)';
			ctx.fillRect(x, 0, 8, h);
		}

		// Two offset rows of damask motifs so the pattern tiles seamlessly
		ctx.fillStyle = '#5e2a26';
		ctx.strokeStyle = '#5e2a26';
		const positions: [number, number][] = [
			[w / 2, h / 4],
			[0, (h * 3) / 4],
			[w, (h * 3) / 4],
			[w / 2, h / 4 + h],
			[w / 2, h / 4 - h]
		];
		for (const [x, y] of positions) drawDamaskMotif(ctx, x, y, w * 0.2);

		// Gold highlights on the smaller in-between motifs
		ctx.fillStyle = '#8a6a36';
		ctx.strokeStyle = '#8a6a36';
		const small: [number, number][] = [
			[0, h / 4],
			[w, h / 4],
			[w / 2, (h * 3) / 4]
		];
		for (const [x, y] of small) drawDamaskMotif(ctx, x, y, w * 0.08);

		// Fine noise
		const rand = seededRandom(7);
		for (let i = 0; i < 4000; i++) {
			ctx.fillStyle = `rgba(0,0,0,${rand() * 0.08})`;
			ctx.fillRect(rand() * w, rand() * h, 2, 2);
		}
	});
	return repeated(base, repeatX, repeatY);
}

/* ------------------------------------------------------------------ */
/* Rug: reddish-brown with light swirling circular patterns            */
/* ------------------------------------------------------------------ */

function drawSwirl(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, turns = 2.4) {
	ctx.beginPath();
	const steps = 80;
	for (let i = 0; i <= steps; i++) {
		const t = i / steps;
		const angle = t * Math.PI * 2 * turns;
		const radius = r * (0.15 + 0.85 * t);
		const x = cx + Math.cos(angle) * radius;
		const y = cy + Math.sin(angle) * radius;
		if (i === 0) ctx.moveTo(x, y);
		else ctx.lineTo(x, y);
	}
	ctx.stroke();
}

export function rugTexture() {
	return make('rug', 1024, 768, (ctx, w, h) => {
		const light = '#e9d6b4';
		ctx.fillStyle = '#7b2f22';
		ctx.fillRect(0, 0, w, h);

		// Outer borders
		ctx.strokeStyle = light;
		ctx.lineWidth = 10;
		ctx.strokeRect(22, 22, w - 44, h - 44);
		ctx.lineWidth = 3;
		ctx.strokeRect(48, 48, w - 96, h - 96);

		// Border band of small circles
		ctx.fillStyle = light;
		for (let x = 70; x < w - 60; x += 28) {
			ctx.beginPath();
			ctx.arc(x, 35, 5, 0, Math.PI * 2);
			ctx.arc(x, h - 35, 5, 0, Math.PI * 2);
			ctx.fill();
		}
		for (let y = 70; y < h - 60; y += 28) {
			ctx.beginPath();
			ctx.arc(35, y, 5, 0, Math.PI * 2);
			ctx.arc(w - 35, y, 5, 0, Math.PI * 2);
			ctx.fill();
		}

		// Field of swirls
		ctx.strokeStyle = 'rgba(233,214,180,0.85)';
		ctx.lineWidth = 4;
		ctx.lineCap = 'round';
		const cols = 6;
		const rows = 4;
		for (let c = 0; c < cols; c++) {
			for (let r = 0; r < rows; r++) {
				const x = 110 + (c * (w - 220)) / (cols - 1);
				const y = 110 + (r * (h - 220)) / (rows - 1);
				if (Math.hypot(x - w / 2, y - h / 2) < 190) continue;
				drawSwirl(ctx, x, y, 44, (c + r) % 2 === 0 ? 2.4 : -2.4);
				ctx.beginPath();
				ctx.arc(x, y, 58, 0, Math.PI * 2);
				ctx.stroke();
			}
		}

		// Central medallion: concentric rings and radial swirls
		ctx.save();
		ctx.translate(w / 2, h / 2);
		for (const [radius, width] of [
			[170, 6],
			[150, 2],
			[95, 4],
			[40, 6]
		]) {
			ctx.lineWidth = width;
			ctx.beginPath();
			ctx.arc(0, 0, radius, 0, Math.PI * 2);
			ctx.stroke();
		}
		ctx.lineWidth = 4;
		for (let i = 0; i < 8; i++) {
			const a = (i / 8) * Math.PI * 2;
			drawSwirl(ctx, Math.cos(a) * 122, Math.sin(a) * 122, 22, 2);
		}
		ctx.restore();

		// Worn, woolly noise
		const rand = seededRandom(3);
		for (let i = 0; i < 20000; i++) {
			ctx.fillStyle = rand() > 0.5 ? 'rgba(0,0,0,0.07)' : 'rgba(255,230,200,0.04)';
			ctx.fillRect(rand() * w, rand() * h, 2, 2);
		}
	});
}

/* ------------------------------------------------------------------ */
/* Blanket: red & white Nordic knit                                    */
/* ------------------------------------------------------------------ */

export function blanketTexture() {
	return make('blanket', 256, 256, (ctx, w) => {
		const cell = 8;
		const n = w / cell;
		const red = '#b1202b';
		const white = '#f3ece0';

		const knit = (cx: number, cy: number, color: string) => {
			ctx.fillStyle = color;
			ctx.beginPath();
			ctx.ellipse(
				cx * cell + cell / 2,
				cy * cell + cell / 2,
				cell * 0.48,
				cell * 0.6,
				0,
				0,
				Math.PI * 2
			);
			ctx.fill();
		};

		for (let y = 0; y < n; y++) {
			for (let x = 0; x < n; x++) {
				const band = y % 32;
				let isWhite = false;
				if (band === 0 || band === 1 || band === 30 || band === 31)
					isWhite = true; // stripes
				else if (band >= 3 && band <= 5) {
					isWhite = (x + band) % 4 === 0 || (x - band) % 4 === 0; // zig-zag
				} else if (band >= 8 && band <= 22) {
					// Diamond / snowflake motif, 16 cells wide
					const lx = Math.abs((x % 16) - 7.5);
					const ly = Math.abs(band - 15);
					const d = lx + ly;
					isWhite = d === 6.5 || d === 3.5 || (lx < 1 && ly < 6) || (ly < 1 && lx < 6);
				} else if (band >= 25 && band <= 27) {
					isWhite = (x + band) % 4 === 0 || (x - band) % 4 === 0;
				}
				ctx.fillStyle = '#7d1219';
				ctx.fillRect(x * cell, y * cell, cell, cell);
				knit(x, y, isWhite ? white : red);
			}
		}
	});
}

/* ------------------------------------------------------------------ */
/* Wood                                                                */
/* ------------------------------------------------------------------ */

export function floorTexture(repeatX: number, repeatY: number) {
	const base = make('floor', 512, 512, (ctx, w, h) => {
		const rand = seededRandom(11);
		const planks = 6;
		const ph = h / planks;
		for (let i = 0; i < planks; i++) {
			const shade = 38 + Math.floor(rand() * 16);
			ctx.fillStyle = `rgb(${shade + 40}, ${shade + 10}, ${shade - 12})`;
			ctx.fillRect(0, i * ph, w, ph);

			// Grain lines
			for (let g = 0; g < 26; g++) {
				ctx.strokeStyle = `rgba(20,8,2,${0.08 + rand() * 0.12})`;
				ctx.lineWidth = 1 + rand() * 1.5;
				const y = i * ph + rand() * ph;
				ctx.beginPath();
				ctx.moveTo(0, y);
				for (let x = 0; x <= w; x += 32) ctx.lineTo(x, y + Math.sin(x * 0.02 + g) * 2);
				ctx.stroke();
			}

			// Plank seams: long edge + staggered butt joint
			ctx.fillStyle = 'rgba(10,4,0,0.7)';
			ctx.fillRect(0, i * ph, w, 2);
			const joint = rand() * w;
			ctx.fillRect(joint, i * ph, 2, ph);
		}
	});
	return repeated(base, repeatX, repeatY);
}

export function woodTexture() {
	return make('wood', 256, 256, (ctx, w, h) => {
		const rand = seededRandom(5);
		ctx.fillStyle = '#8a8a8a';
		ctx.fillRect(0, 0, w, h);
		for (let g = 0; g < 60; g++) {
			ctx.strokeStyle = `rgba(0,0,0,${0.05 + rand() * 0.15})`;
			ctx.lineWidth = 1 + rand() * 2;
			const y = rand() * h;
			ctx.beginPath();
			ctx.moveTo(0, y);
			for (let x = 0; x <= w; x += 16) ctx.lineTo(x, y + Math.sin(x * 0.03 + g) * 3);
			ctx.stroke();
		}
		// Brighten overall so the material color defines the hue (map is multiplied with color).
		ctx.globalCompositeOperation = 'lighter';
		ctx.fillStyle = 'rgba(110,110,110,1)';
		ctx.fillRect(0, 0, w, h);
	});
}

/* ------------------------------------------------------------------ */
/* Small decorative textures                                           */
/* ------------------------------------------------------------------ */

/** A snowy winter-evening landscape for the framed picture above the mantel. */
export function paintingTexture() {
	return make('painting', 512, 384, (ctx, w, h) => {
		const sky = ctx.createLinearGradient(0, 0, 0, h * 0.6);
		sky.addColorStop(0, '#1d2745');
		sky.addColorStop(1, '#6b5c7a');
		ctx.fillStyle = sky;
		ctx.fillRect(0, 0, w, h);

		const rand = seededRandom(21);
		ctx.fillStyle = '#f7f1e3';
		for (let i = 0; i < 70; i++) ctx.fillRect(rand() * w, rand() * h * 0.5, 2, 2);

		// Hills
		ctx.fillStyle = '#d9dde6';
		ctx.beginPath();
		ctx.moveTo(0, h * 0.62);
		ctx.bezierCurveTo(w * 0.3, h * 0.48, w * 0.6, h * 0.7, w, h * 0.55);
		ctx.lineTo(w, h);
		ctx.lineTo(0, h);
		ctx.fill();

		// Pine trees
		ctx.fillStyle = '#1f3a2c';
		for (const [x, s] of [
			[60, 1],
			[110, 0.7],
			[400, 1.1],
			[450, 0.8]
		]) {
			ctx.beginPath();
			ctx.moveTo(x, h * 0.6 - 90 * s);
			ctx.lineTo(x - 28 * s, h * 0.62);
			ctx.lineTo(x + 28 * s, h * 0.62);
			ctx.fill();
		}

		// Cottage with a warm window
		ctx.fillStyle = '#4a2c22';
		ctx.fillRect(w * 0.45, h * 0.52, 90, 60);
		ctx.fillStyle = '#f2f2f2';
		ctx.beginPath();
		ctx.moveTo(w * 0.45 - 12, h * 0.52);
		ctx.lineTo(w * 0.45 + 45, h * 0.52 - 40);
		ctx.lineTo(w * 0.45 + 102, h * 0.52);
		ctx.fill();
		ctx.fillStyle = '#ffcf6b';
		ctx.fillRect(w * 0.45 + 18, h * 0.52 + 18, 20, 18);
		ctx.fillRect(w * 0.45 + 55, h * 0.52 + 18, 20, 18);

		// Painterly vignette
		const vignette = ctx.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, w * 0.7);
		vignette.addColorStop(0, 'rgba(0,0,0,0)');
		vignette.addColorStop(1, 'rgba(30,15,5,0.55)');
		ctx.fillStyle = vignette;
		ctx.fillRect(0, 0, w, h);
	});
}

export function clockFaceTexture() {
	return make('clock', 256, 256, (ctx, w, h) => {
		const c = w / 2;
		ctx.fillStyle = '#efe6d2';
		ctx.fillRect(0, 0, w, h);
		ctx.strokeStyle = '#2a1a10';
		ctx.fillStyle = '#2a1a10';
		ctx.lineWidth = 6;
		ctx.beginPath();
		ctx.arc(c, c, c - 8, 0, Math.PI * 2);
		ctx.stroke();
		for (let i = 0; i < 12; i++) {
			const a = (i / 12) * Math.PI * 2;
			const r1 = c - 22;
			const r2 = i % 3 === 0 ? c - 48 : c - 36;
			ctx.lineWidth = i % 3 === 0 ? 7 : 4;
			ctx.beginPath();
			ctx.moveTo(c + Math.sin(a) * r1, c - Math.cos(a) * r1);
			ctx.lineTo(c + Math.sin(a) * r2, c - Math.cos(a) * r2);
			ctx.stroke();
		}
		// Hands at ten to twelve
		const hand = (angle: number, length: number, width: number) => {
			ctx.lineWidth = width;
			ctx.beginPath();
			ctx.moveTo(c, c);
			ctx.lineTo(c + Math.sin(angle) * length, c - Math.cos(angle) * length);
			ctx.stroke();
		};
		hand(-0.1, c * 0.45, 9);
		hand(-Math.PI / 3, c * 0.7, 5);
		ctx.beginPath();
		ctx.arc(c, c, 9, 0, Math.PI * 2);
		ctx.fill();
	});
}
