<script>
	import { flip } from 'svelte/animate';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

	/** Reveals `.reveal` once, and keeps `.demo` marked `on` only while on screen, so idle demos stop. */
	/** @param {HTMLElement} node */
	const observe = (node) => {
		node.classList.add('motion-ready');
		const reveals = node.querySelectorAll('.reveal');
		const demos = node.querySelectorAll('.demo');
		if (!('IntersectionObserver' in window) || reduced()) {
			reveals.forEach((el) => el.classList.add('visible'));
			demos.forEach((el) => el.classList.add('on'));
			return;
		}
		const once = new IntersectionObserver((entries) => {
			for (const e of entries) if (e.isIntersecting) { e.target.classList.add('visible'); once.unobserve(e.target); }
		}, { threshold: 0.14 });
		const live = new IntersectionObserver((entries) => {
			for (const e of entries) e.target.classList.toggle('on', e.isIntersecting);
		}, { threshold: 0.2 });
		reveals.forEach((el) => once.observe(el));
		demos.forEach((el) => live.observe(el));
		return () => { once.disconnect(); live.disconnect(); };
	};

	/**
	 * Calls `fn` every `ms` while the node is on screen and the tab is visible; never with reduced motion.
	 * @param {() => void} fn @param {number} ms
	 */
	const every = (fn, ms) => (/** @type {HTMLElement} */ node) => {
		if (reduced()) return;
		let seen = false, timer = 0;
		const sync = () => {
			clearInterval(timer);
			timer = seen && !document.hidden ? setInterval(fn, ms) : 0;
		};
		const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; sync(); });
		io.observe(node);
		document.addEventListener('visibilitychange', sync);
		return () => { clearInterval(timer); io.disconnect(); document.removeEventListener('visibilitychange', sync); };
	};

	// The same synthetic chats as the app screenshots, drawn to the app's chat list.
	let chats = $state([
		{ id: 1, name: 'Maya Chen', text: 'A bit torn, but it will do', you: false, unread: 3, time: '10:35', hue: 310 },
		{ id: 2, name: 'Weekend hike', text: 'Jonas Weber: Lake, obviously', you: false, unread: 6, time: '10:35', hue: 150, group: true },
		{ id: 3, name: 'Ana Ruiz', text: 'Yes, 10:30 at the usual place', you: true, unread: 0, time: '10:35', hue: 25 },
		{ id: 4, name: 'Daniel Park', text: 'The slides are in the shared folder', you: false, unread: 0, time: '10:35', hue: 205 },
		{ id: 5, name: 'Mom', text: "Call me when you're back", you: false, unread: 0, time: '10:35', hue: 12 },
		{ id: 6, name: 'Elif Kaya', text: 'Let me know how it turns out', you: true, unread: 0, time: '10:35', hue: 262 },
		{ id: 7, name: 'Climbing Tuesdays', text: 'Chris Novak: Gym is open until 10 tonight', you: false, unread: 0, time: '10:35', hue: 355, group: true },
		{ id: 8, name: 'Jonas Weber', text: 'Great, see you there', you: false, unread: 0, time: '10:34', hue: 210 }
	]);
	const incoming = [
		[3, 'Lunch tomorrow?'], [2, 'Tom Becker: Forecast says sun until 3'], [7, 'Lena Ortiz: Who has the rope?'],
		[1, 'Sent a photo'], [5, 'Did you eat?'], [2, 'Priya Raman: Picnic it is'], [6, 'It worked!'], [3, 'Voice message'], [4, 'Thanks, got them']
	];
	let clock = 10 * 60 + 35; // minutes since midnight
	let step = 0;
	let pending = 0;
	let typing = $state('');
	let typingId = $state(0);
	// As in the app's chat list: the row says who is typing in place, then the message moves it to the top.
	const arrive = () => {
		const [id, text] = /** @type {[number, string]} */ (incoming[step++ % incoming.length]);
		const group = chats.find((c) => c.id === id)?.group;
		typingId = id;
		typing = group ? `${text.split(': ')[0]} is typing…` : 'typing…';
		clearTimeout(pending);
		pending = setTimeout(() => {
			typingId = 0;
			const [chat] = chats.splice(chats.findIndex((c) => c.id === id), 1);
			clock = (clock + 1) % (24 * 60);
			const time = `${Math.floor(clock / 60)}:${String(clock % 60).padStart(2, '0')}`;
			Object.assign(chat, { text, time, you: false, unread: (chat.unread % 4) + 1 });
			chats.unshift(chat);
			for (const c of chats.slice(3)) c.unread = 0; // read on another device, so the counts stay few
		}, 1300);
	};
	const unread = $derived(chats.reduce((n, c) => n + c.unread, 0));
	let onlyUnread = $state(false);
	const shown = $derived(onlyUnread ? chats.filter((c) => c.unread) : chats);

	// The desktop build's layout widths, from src/ui.rs and src/ui/info.rs in the app, with a chat's info open.
	const W = { NARROW: 720, RAIL_W: 60, NAV_W: 210, LIST_W: 384, INFO_W: 384, CHAT_MIN: 420, RAIL_BELOW: 1400 };
	const MIN_W = 360, MAX_W = 1600, WIN_H = 600;
	const INFO_FROM = W.RAIL_W + W.LIST_W + W.INFO_W + W.CHAT_MIN;
	const ticks = [[W.NARROW, 'NARROW'], [INFO_FROM, '60 + 384 + 384 + 420'], [W.RAIL_BELOW, 'RAIL_BELOW']];
	let vw = $state(1280);
	let k = $state(0.7);
	let touched = false;
	const layout = $derived.by(() => {
		if (vw < W.NARROW) return { phone: true, nav: 0, info: false, rule: `Under ${W.NARROW}: one pane, the tabs under it, like the phone.` };
		const nav = vw < W.RAIL_BELOW ? W.RAIL_W : W.NAV_W;
		const info = vw >= nav + W.LIST_W + W.INFO_W + W.CHAT_MIN;
		if (nav === W.NAV_W) return { phone: false, nav, info, rule: `From ${W.RAIL_BELOW}: the rail gets its labels and grows to ${W.NAV_W} px.` };
		if (info) return { phone: false, nav, info, rule: `From ${INFO_FROM}, the sum of rail, list, info and the narrowest chat: the chat's info moves beside it.` };
		return { phone: false, nav, info, rule: `From ${W.NARROW}: a ${W.RAIL_W} px rail, the ${W.LIST_W} px list and the chat.` };
	});
	const clamp = (/** @type {number} */ x) => Math.round(Math.min(MAX_W, Math.max(MIN_W, x)));

	/** Scales the demo window to its box and, the first time it is seen, sweeps it narrow and wide once. */
	const fit = (/** @type {HTMLElement} */ node) => {
		const ro = new ResizeObserver(([e]) => { k = e.contentRect.width / (MAX_W + 24); });
		ro.observe(node);
		let raf = 0;
		const keys = [[0, 1280], [1500, 470], [2300, 470], [4200, 1520], [4900, 1520], [6000, 1100]];
		const ease = (/** @type {number} */ t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
		const io = new IntersectionObserver(([e]) => {
			if (!e.isIntersecting || touched || reduced()) return;
			io.disconnect();
			const t0 = performance.now();
			const tick = (/** @type {number} */ now) => {
				const t = now - t0;
				const i = keys.findIndex(([at]) => at > t);
				if (touched || i < 0) { raf = 0; return; }
				const [a, va] = keys[i - 1], [b, vb] = keys[i];
				vw = clamp(va + (vb - va) * ease((t - a) / (b - a)));
				raf = requestAnimationFrame(tick);
			};
			raf = requestAnimationFrame(tick);
		}, { threshold: 0.6 });
		io.observe(node);
		return () => { ro.disconnect(); io.disconnect(); cancelAnimationFrame(raf); };
	};
	/** Drags the window's right edge. */
	const grip = (/** @type {HTMLElement} */ node) => {
		const at = (/** @type {PointerEvent} */ e) => {
			const left = /** @type {HTMLElement} */ (node.parentElement).getBoundingClientRect().left;
			vw = clamp((e.clientX - left) / k);
		};
		const down = (/** @type {PointerEvent} */ e) => { touched = true; node.setPointerCapture(e.pointerId); at(e); };
		const move = (/** @type {PointerEvent} */ e) => { if (node.hasPointerCapture(e.pointerId)) at(e); };
		const key = (/** @type {KeyboardEvent} */ e) => {
			const by = e.shiftKey ? 100 : 10;
			const to = { ArrowLeft: vw - by, ArrowDown: vw - by, ArrowRight: vw + by, ArrowUp: vw + by, Home: MIN_W, End: MAX_W }[e.key];
			if (to === undefined) return;
			e.preventDefault(); touched = true; vw = clamp(to);
		};
		node.addEventListener('pointerdown', down);
		node.addEventListener('pointermove', move);
		node.addEventListener('keydown', key);
		return () => { node.removeEventListener('pointerdown', down); node.removeEventListener('pointermove', move); node.removeEventListener('keydown', key); };
	};

	/** Counts a number up from zero the first time it is seen, keeping its separators and unit. */
	const count = (/** @type {HTMLElement} */ node) => {
		const text = node.textContent ?? '';
		const m = text.match(/[\d,.]+/);
		if (!m || reduced()) return;
		const target = Number(m[0].replace(/,/g, ''));
		const dp = m[0].split('.')[1]?.length ?? 0;
		const show = (/** @type {number} */ v) => { node.textContent = text.replace(m[0], v.toLocaleString('en', { minimumFractionDigits: dp, maximumFractionDigits: dp })); };
		let raf = 0;
		const io = new IntersectionObserver(([e]) => {
			if (!e.isIntersecting) return;
			io.disconnect();
			const t0 = performance.now();
			const tick = (/** @type {number} */ now) => {
				const t = Math.min(1, (now - t0) / 1400);
				show(target * (1 - (1 - t) ** 4));
				raf = t < 1 ? requestAnimationFrame(tick) : 0;
			};
			show(0);
			raf = requestAnimationFrame(tick);
		}, { threshold: 0.6 });
		io.observe(node);
		return () => { io.disconnect(); cancelAnimationFrame(raf); node.textContent = text; };
	};

	// Lucide icons (ISC, see /LICENSE-LUCIDE.txt), the set the app draws with.
	const ICONS = {
		plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
		search: '<path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/>',
		check: '<path d="M20 6 9 17l-5-5"/>',
		chats: '<path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719"/>',
		archive: '<rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/>',
		networks: '<path d="m10.586 5.414-5.172 5.172"/><path d="m18.586 13.414-5.172 5.172"/><path d="M6 12h12"/><circle cx="12" cy="20" r="2"/><circle cx="12" cy="4" r="2"/><circle cx="20" cy="12" r="2"/><circle cx="4" cy="12" r="2"/>',
		settings: '<path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/><circle cx="12" cy="12" r="3"/>',
		clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>'
	};

	const sees = [
		{ who: 'This device', what: 'Your messages, keys and settings. On Android the app\'s data is encrypted with a key held in the Android Keystore, and the app can lock with your phone\'s lock or a PIN.' },
		{ who: 'Your homeserver', what: 'What any Matrix server sees: your account, the rooms you are in, message metadata, your IP address and the content of unencrypted rooms. Encrypted rooms are end-to-end encrypted.' },
		{ who: 'Beeper bridges', what: 'Only with a Beeper account. A bridge has to read a message to pass it between Matrix and the other network, so it sees the content of bridged chats.' },
		{ who: 'The other network', what: 'WhatsApp, Messenger and the rest see what they always see. Nothing more comes from Unisend.' },
		{ who: 'Anyone else', what: 'Only for what you turn on or tap: a site you link, once, with link previews on; GIF search, in builds that include it; an emoji font you download; a location you open. Builds made with an update address ask it once a day for update.json, with no identifier.' }
	];
	let seen = $state(1);

	// Lucide icons (ISC) as die-cut stickers, one in each of the app's nine chat colours (ChatColour in the app).
	const stickers = [
		{ label: 'Voice notes', fill: '#2e6ef0', x: 6, y: 8, rot: -8, d: '<path d="M12 19v3"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><rect x="9" y="2" width="6" height="13" rx="3"/>' },
		{ label: 'Offline queue', fill: '#e8710a', x: 38, y: 4, rot: 6, d: '<path d="M12 20h.01"/><path d="M8.5 16.429a5 5 0 0 1 7 0"/><path d="M5 12.859a10 10 0 0 1 5.17-2.69"/><path d="M19 12.859a10 10 0 0 0-2.007-1.523"/><path d="M2 8.82a15 15 0 0 1 4.177-2.643"/><path d="M22 8.82a15 15 0 0 0-11.288-3.764"/><path d="m2 2 20 20"/>' },
		{ label: 'Local search', fill: '#00838f', x: 70, y: 10, rot: -4, d: '<path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/>' },
		{ label: 'App lock', fill: '#734ef3', x: 10, y: 40, rot: 5, d: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>' },
		{ label: 'End to end', fill: '#2e7d32', x: 41, y: 37, rot: -7, d: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>', curl: true },
		{ label: 'Quiet alerts', fill: '#c2185b', x: 72, y: 42, rot: 9, d: '<path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M17 17H4a1 1 0 0 1-.74-1.673C4.59 13.956 6 12.499 6 8a6 6 0 0 1 .258-1.742"/><path d="m2 2 20 20"/><path d="M8.668 3.01A6 6 0 0 1 18 8c0 2.687.77 4.653 1.707 6.05"/>' },
		{ label: 'Nine colours', fill: '#4f5bd5', x: 5, y: 72, rot: -3, d: '<path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z"/><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/>' },
		{ label: 'Reactions', fill: '#d32f2f', x: 39, y: 70, rot: 7, d: '<path d="M13.267 2.08a10 10 0 108.653 8.653"/><path d="M15 10V9"/><path d="M16 5h6"/><path d="M16.472 15a6 6 0 01-8.943 0"/><path d="M19 2v6"/><path d="M9 10V9"/>' },
		{ label: 'Polls', fill: '#37474f', x: 71, y: 74, rot: -6, d: '<path d="m9 12 2 2 4-4"/><path d="M5 7c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v12H5V7Z"/><path d="M22 19H2"/>' }
	];

	/**
	 * Lets a sticker be peeled: the grabbed corner folds over along the line halfway to the pointer, and
	 * springs back on release. Work runs only while a sticker moves; one frame loop per sticker, stopped at rest.
	 * @param {boolean} curl whether the sticker rests with a corner lifted, to show that it peels
	 */
	const peel = (curl = false) => (/** @type {HTMLElement} */ el) => {
		const front = /** @type {HTMLElement} */ (el.querySelector('.front'));
		const back = /** @type {HTMLElement} */ (el.querySelector('.back'));
		let w = 0, h = 0, raf = 0, drag = false;
		let p0 = [0, 0], p = [0, 0], goal = [0, 0], start = [0, 0];
		const size = () => ({ width: w, height: h } = el.getBoundingClientRect());
		const rest = () => (curl ? [p0[0] + (w / 2 - p0[0]) * 0.18, p0[1] + (h / 2 - p0[1]) * 0.18] : [...p0]);
		/** Keeps the part of the square (padded, so a rotated drawing fits) on one side of the fold. */
		const half = (/** @type {number[]} */ m, /** @type {number[]} */ n, /** @type {number} */ sign) => {
			const box = [[-w, -h], [2 * w, -h], [2 * w, 2 * h], [-w, 2 * h]];
			const side = (/** @type {number[]} */ q) => sign * ((q[0] - m[0]) * n[0] + (q[1] - m[1]) * n[1]);
			const out = [];
			for (let i = 0; i < box.length; i++) {
				const a = box[i], b = box[(i + 1) % box.length], sa = side(a), sb = side(b);
				if (sa >= 0) out.push(a);
				if (sa * sb < 0) { const t = sa / (sa - sb); out.push([a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])]); }
			}
			return `polygon(${out.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(',')})`;
		};
		const draw = () => {
			const dx = p[0] - p0[0], dy = p[1] - p0[1], len = Math.hypot(dx, dy);
			if (len < 0.5) { front.style.clipPath = ''; back.style.display = 'none'; return; }
			const n = [dx / len, dy / len], m = [(p[0] + p0[0]) / 2, (p[1] + p0[1]) / 2];
			const k = 2 * (m[0] * n[0] + m[1] * n[1]);
			front.style.clipPath = half(m, n, 1);
			back.style.display = 'block';
			back.style.clipPath = half(m, n, -1);
			// The folded part is the sticker reflected across the fold line.
			back.style.transform = `matrix(${1 - 2 * n[0] * n[0]},${-2 * n[0] * n[1]},${-2 * n[0] * n[1]},${1 - 2 * n[1] * n[1]},${k * n[0]},${k * n[1]})`;
		};
		const tick = () => {
			const fast = drag || reduced();
			p = fast ? [...goal] : [p[0] + (goal[0] - p[0]) * 0.2, p[1] + (goal[1] - p[1]) * 0.2];
			draw();
			raf = !fast && Math.hypot(goal[0] - p[0], goal[1] - p[1]) > 0.3 ? requestAnimationFrame(tick) : 0;
			if (!raf && !fast) { p = [...goal]; draw(); }
		};
		const go = (/** @type {number[]} */ to) => { goal = to; if (!raf) raf = requestAnimationFrame(tick); };
		const local = (/** @type {PointerEvent} */ e) => { const r = el.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
		const corner = (/** @type {number[]} */ q) => [q[0] < w / 2 ? w * 0.14 : w * 0.86, q[1] < h / 2 ? h * 0.14 : h * 0.86];
		const down = (/** @type {PointerEvent} */ e) => {
			if (e.button !== 0) return;
			size(); start = local(e); p0 = corner(start); p = [...p0]; drag = true;
			el.setPointerCapture(e.pointerId); el.classList.add('held');
			go(p0);
		};
		const move = (/** @type {PointerEvent} */ e) => {
			if (carry) return;
			const q = local(e);
			if (drag) {
				const dx = q[0] - start[0], dy = q[1] - start[1], len = Math.hypot(dx, dy), cap = 1.6 * Math.max(w, h);
				if (len > 1.3 * Math.max(w, h)) return lift(e);
				const s = len > cap ? cap / len : 1;
				go([p0[0] + dx * s, p0[1] + dy * s]);
			} else if (e.pointerType === 'mouse') {
				size(); p0 = corner(q); go([p0[0] + (w / 2 - p0[0]) * 0.22, p0[1] + (h / 2 - p0[1]) * 0.22]);
			}
		};
		const up = () => { if (!drag) return; drag = false; el.classList.remove('held'); go(rest()); };
		const leave = () => { if (!drag && !carry) go(rest()); };

		// Pulled far enough, the sticker comes off whole: it moves to the page's top layer, follows the
		// pointer with a little lag and tilt, and sticks where it is let go. One frame loop, stopped at rest.
		let carry = false, fly = 0, pos = [0, 0], to = [0, 0], tilt = 0;
		const follow = () => {
			const f = reduced() ? 1 : 0.32;
			const vx = (to[0] - pos[0]) * f;
			pos = [pos[0] + vx, pos[1] + (to[1] - pos[1]) * f];
			tilt += ((carry ? Math.max(-14, Math.min(14, vx * 0.8)) : 0) - tilt) * 0.25;
			el.style.left = `${pos[0]}px`;
			el.style.top = `${pos[1]}px`;
			el.style.rotate = `${tilt.toFixed(2)}deg`;
			const still = Math.hypot(to[0] - pos[0], to[1] - pos[1]) < 0.3 && Math.abs(tilt) < 0.1;
			fly = carry || !still ? requestAnimationFrame(follow) : 0;
			if (!fly) { el.style.rotate = ''; el.style.left = `${to[0]}px`; el.style.top = `${to[1]}px`; }
		};
		const aim = (/** @type {PointerEvent} */ e) => { to = [e.pageX - w / 2, e.pageY - h / 2]; if (!fly) fly = requestAnimationFrame(follow); };
		const lift = (/** @type {PointerEvent} */ e) => {
			drag = false; carry = true;
			const r = el.getBoundingClientRect();
			pos = [r.left + scrollX, r.top + scrollY];
			if (el.parentElement !== document.body) {
				Object.assign(el.style, { width: `${r.width}px`, height: `${r.height}px`, left: `${pos[0]}px`, top: `${pos[1]}px` });
				el.setAttribute('aria-hidden', 'true');
				document.body.append(el);
			}
			el.classList.remove('held', 'slap');
			el.classList.add('loose', 'carried');
			cancelAnimationFrame(raf); raf = 0; p = goal = [...p0]; draw();
			aim(e);
			addEventListener('pointermove', aim);
			addEventListener('pointerup', drop);
			addEventListener('pointercancel', drop);
		};
		const drop = () => {
			carry = false;
			removeEventListener('pointermove', aim);
			removeEventListener('pointerup', drop);
			removeEventListener('pointercancel', drop);
			el.classList.remove('carried');
			void el.offsetWidth; // restarts the press animation on a second drop
			el.classList.add('slap');
			if (!fly) fly = requestAnimationFrame(follow);
		};
		size(); p0 = [w * 0.86, h * 0.86]; p = rest(); goal = [...p]; draw();
		el.addEventListener('pointerdown', down);
		el.addEventListener('pointermove', move);
		el.addEventListener('pointerup', up);
		el.addEventListener('pointercancel', up);
		el.addEventListener('pointerleave', leave);
		return () => {
			cancelAnimationFrame(raf);
			cancelAnimationFrame(fly);
			for (const [t, f] of /** @type {const} */ ([['pointermove', aim], ['pointerup', drop], ['pointercancel', drop]])) removeEventListener(t, f);
			if (el.parentElement === document.body) el.remove();
			for (const [t, f] of /** @type {const} */ ([['pointerdown', down], ['pointermove', move], ['pointerup', up], ['pointercancel', up], ['pointerleave', leave]])) el.removeEventListener(t, f);
		};
	};

	const extras = [
		['Voice messages', 'Recorded and played right in the chat, on Android and Linux.'],
		['Sent, even offline', 'Messages wait in a queue that survives losing signal and restarting the app.'],
		['Search on the device', 'One index across every chat, kept here, not on a server.'],
		['Locked when you want', "Your phone's lock or an app PIN. Screenshots blocked on Android."],
		['Encrypted, end to end', 'Verify a device by comparing emoji. History comes back with your recovery code.'],
		['Every network in one list', 'Sign in to each network from the app, and see when one needs you again.']
	];
	// Counted in the app's repository (branch dev) when this page was made; `src` is the path they come from.
	const facts = [
		['52,422', 'lines of Rust, in 103 files.', 'src/'],
		['359', 'tests, and all of them pass.', 'cargo test --lib'],
		['826', 'strings in the interface, each with its Polish. A test fails if one is missing.', 'src/i18n/pl.rs'],
		['64', 'messages fit in each of the two queues between the screen and the network, so the screen never waits.', 'CHANNEL_CAP, src/backend.rs'],
		['720 px', 'is where the desktop window turns into the phone app. On Android it is 840.', 'NARROW, src/ui.rs'],
		['2.6 s', 'between the made-up messages in the phone at the top of this page.', 'the script of this page']
	];

	const platforms = [
		['Android', 'Main target, tested on a phone'],
		['Linux', 'Built and tested'],
		['macOS', 'In progress'],
		['Windows', 'Compiles, never run']
	];
</script>

<svelte:head>
	<title>Unisend | Every chat, one private app</title>
	<meta name="description" content="A Matrix chat client for Android and desktop. Any homeserver, or a Beeper account with its bridges to WhatsApp, Signal, Instagram and more. No telemetry, no Google services." />
	<meta property="og:title" content="Unisend | Every chat, one private app" />
	<meta property="og:description" content="A Matrix chat client for Android and desktop." />
</svelte:head>

{#snippet sticker(/** @type {{ d: string, fill: string, rot: number, curl?: boolean }} */ s)}
	<div class="sticker" {@attach peel(s.curl)}>
		<svg class="front" viewBox="-6 -6 36 36" style:--rot="{s.rot}deg"><g class="edge">{@html s.d}</g><g class="base" style:--fill={s.fill}>{@html s.d}</g><g class="mark">{@html s.d}</g></svg>
		<svg class="back" viewBox="-6 -6 36 36" style:--rot="{s.rot}deg"><g class="edge">{@html s.d}</g></svg>
	</div>
{/snippet}
{#snippet row(/** @type {typeof chats[number]} */ chat)}
	<span class="avatar" style:--h={chat.hue}></span>
	<span class="row-text"><b>{chat.name}</b>{#if typingId === chat.id}<span class="typing">{typing}</span>{:else}<span>{#if chat.you}{@render icon(ICONS.check)}You:{' '}{/if}{chat.text}</span>{/if}</span>
	<span class="row-meta"><small>{chat.time}</small>{#if chat.unread}<em>{chat.unread}</em>{/if}</span>
{/snippet}
{#snippet tabs()}
	<div class="app-tabs" aria-hidden="true">
		{#each [['Chats', ICONS.chats], ['Archive', ICONS.archive], ['Networks', ICONS.networks], ['Settings', ICONS.settings]] as [label, d], i (label)}
			<span class:on={i === 0}>{@render icon(d)}{label}</span>
		{/each}
	</div>
{/snippet}
{#snippet arrow(/** @type {boolean} */ down)}<svg class="arrow" viewBox="0 0 60 60" aria-hidden="true">{#if down}<path d="M54 6C32 8 14 22 11 52" /><path d="M4 44l7 9 7-8" />{:else}<path d="M54 54C32 52 14 38 11 8" /><path d="M4 16l7-9 7 8" />{/if}</svg>{/snippet}
{#snippet icon(/** @type {string} */ d)}<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">{@html d}</svg>{/snippet}

<div class="page" {@attach observe}>
	<a class="skip" href="#main">Skip to content</a>
	<header class="nav wrap">
		<a class="brand" href="#top" aria-label="Unisend, back to top"><img src="/icon.svg" alt="" width="28" height="28" />Unisend</a>
		<nav aria-label="Sections"><a href="#features">Features</a><a href="#privacy">Privacy</a><a href="#platforms">Platforms</a></nav>
	</header>

	<main id="main">
		<section class="hero wrap" id="top">
			<div class="hero-copy">
				<h1>Every chat.<br />One private app.</h1>
				<p class="lead">A Matrix client for Android and desktop. With a Beeper account it also carries WhatsApp, Signal, Instagram, Messenger and the rest, in one list.</p>
				<div class="actions"><a class="button" href="#features">See what it does</a><a class="text-link" href="#privacy">Who sees what</a></div>
				<p class="note">No telemetry. No Google services. Built in Rust.</p>
			</div>
			<div class="stage">
				<div class="stuck one" aria-hidden="true">{@render sticker({ ...stickers[3], rot: 14, curl: true })}</div>
				<div class="stuck two" aria-hidden="true">{@render sticker({ ...stickers[4], rot: -12 })}</div>
				<p class="aside live">Live: a new message every 2.6 seconds.</p>
				<div class="phone" data-ui role="group" aria-label="A demo of the Unisend chat list. Tap a chat to read it." {@attach every(arrive, 2600)}>
					<div class="app-bar"><b>Chats</b>{@render icon(ICONS.plus)}{@render icon(ICONS.search)}</div>
					<div class="chips">
						<button class="chip" class:on={!onlyUnread} aria-pressed={!onlyUnread} onclick={() => (onlyUnread = false)}>All</button>
						<button class="chip" class:on={onlyUnread} aria-pressed={onlyUnread} onclick={() => (onlyUnread = true)}>Unread <small>{unread}</small></button>
						<span class="chip">Low priority</span>
					</div>
					<ul class="rows">
						{#each shown as chat (chat.id)}
							<li animate:flip={{ duration: 480, easing: cubicOut }} out:fly={{ x: -40, duration: 220 }}>
								<button class="row" class:unread={chat.unread} onclick={() => (chat.unread = 0)}>{@render row(chat)}</button>
							</li>
						{:else}
							<li class="empty">All read.</li>
						{/each}
					</ul>
					{@render tabs()}
				</div>
			</div>
		</section>

		<section class="desktop wrap" aria-labelledby="desktop-title">
			<div class="head reveal">
				<h2 id="desktop-title">Phone or desktop, one app</h2>
				<p>Make the window wide and the chat list, the chat and its info sit side by side. Narrow it, and it is the phone app again.</p>
			</div>
			<div class="resize reveal" {@attach fit}>
				<p class="readout"><b>{vw.toLocaleString('en')} px</b><span>{layout.rule}</span></p>
				<div class="frame" style:height="{WIN_H * k}px">
					<div class="win" class:narrow={layout.phone} style:width="{vw}px" style:height="{WIN_H}px" style:scale={k} aria-hidden="true">
						{#if !layout.phone}
							<div class="win-nav" style:width="{layout.nav}px" class:labelled={layout.nav === W.NAV_W}>
								{#each [['Chats', ICONS.chats], ['Archive', ICONS.archive], ['Networks', ICONS.networks], ['Settings', ICONS.settings]] as [label, d], i (label)}
									<span class:on={i === 0}>{@render icon(d)}<em>{label}</em></span>
								{/each}
							</div>
						{/if}
						<div class="win-list" style:width={layout.phone ? null : `${W.LIST_W}px`}>
							<div class="app-bar"><b>Chats</b>{@render icon(ICONS.plus)}{@render icon(ICONS.search)}</div>
							<ul class="rows">
								{#each chats as chat (chat.id)}<li class="row" class:unread={chat.unread} class:sel={!layout.phone && chat.id === 2}>{@render row(chat)}</li>{/each}
							</ul>
							{#if layout.phone}{@render tabs()}{/if}
						</div>
						{#if !layout.phone}
							<div class="win-chat">
								<div class="app-bar"><span class="avatar" style:--h="150"></span><b>Weekend hike</b>{@render icon(ICONS.search)}</div>
								<div class="bubbles">
									<span>The view from the ridge last time. Worth the climb</span>
									<span class="mine">Count me in, I'll bring snacks</span>
									<span>Forecast says sun until 3.</span>
									<span>Lunch at the hut or a picnic by the lake?</span>
								</div>
								<div class="composer">Message</div>
							</div>
							{#if layout.info}
								<div class="win-info" style:width="{W.INFO_W}px" transition:fly={{ x: 60, duration: 260 }}>
									<span class="avatar big" style:--h="150"></span><b>Weekend hike</b><i></i><i></i><i></i>
								</div>
							{/if}
						{/if}
					</div>
					<div class="grip" role="slider" tabindex="0" aria-label="Window width" aria-valuemin={MIN_W} aria-valuemax={MAX_W} aria-valuenow={vw} aria-valuetext="{vw} pixels" style:left="{vw * k}px" {@attach grip}></div>
				</div>
				<div class="ruler" aria-hidden="true">
					{#each ticks as [x, name] (x)}<span style:left="{(Number(x) / (MAX_W + 24)) * 100}%" class:past={vw >= Number(x)} class:before={x === INFO_FROM}><b>{x}</b><small>{name}</small></span>{/each}
				</div>
				<p class="aside">Drag the edge, or focus it and use the arrow keys. The widths are the app's own constants.</p>
			</div>
			<figure class="annotated reveal">
				<img class="shot" src="/shots/desktop.png" alt="Unisend on desktop: the chat list beside a group chat with a shared sunset, a reply, reactions and a poll" width="1280" height="800" loading="lazy" />
				<p class="aside n-rail">{@render arrow(true)}Under 720 px wide, this rail moves to the bottom and becomes the phone's tab bar.</p>
				<p class="aside n-lime">{@render arrow(true)}Lime is for what is waiting for you.</p>
				<p class="aside n-enter">{@render arrow(false)}Enter sends. There is a setting if you would rather it made a new line.</p>
			</figure>
		</section>

		<section class="split wrap" id="features" aria-labelledby="talk-title">
			<div class="split-copy reveal">
				<h2 id="talk-title">Talk like you do everywhere</h2>
				<p>Replies, reactions, edits, polls, mentions and Markdown as you type. Photos, files and voice messages. Delete for everyone, or only for you.</p>
			</div>
			<div class="split-pic reveal"><img src="/shots/chat.png" alt="A group chat with a shared sunset, a reply, reactions and a poll" width="420" height="880" loading="lazy" /></div>
		</section>

		<section class="split flip wrap" aria-labelledby="look-title">
			<div class="split-copy reveal">
				<h2 id="look-title">Black, quiet, yours</h2>
				<p>Dark, light or system theme, nine chat colours, a wallpaper and five text sizes. In English and Polish.</p>
			</div>
			<div class="split-pic reveal"><img src="/shots/settings.png" alt="Appearance settings: theme, language, chat colour and text size" width="420" height="880" loading="lazy" /></div>
		</section>

		<section class="split wrap" aria-labelledby="notify-title">
			<div class="split-copy reveal">
				<h2 id="notify-title">Notifications that keep quiet</h2>
				<p>Choose what a notification shows. No push service either: on Android the app keeps its own connection to your homeserver.</p>
			</div>
			<div class="split-pic levels reveal" data-ui>
				<figure><span class="notif"><img src="/icon.svg" alt="" width="36" height="36" /><span><b>Maya Chen</b>See you at 8</span></span><figcaption>Name and message</figcaption></figure>
				<figure><span class="notif"><img src="/icon.svg" alt="" width="36" height="36" /><span><b>Maya Chen</b>New message</span></span><figcaption>Name only</figcaption></figure>
				<figure><span class="notif"><img src="/icon.svg" alt="" width="36" height="36" /><span><b>Unisend</b>New message</span></span><figcaption>Neither</figcaption></figure>
			</div>
		</section>

		<section class="extras wrap" aria-labelledby="extras-title">
			<div class="extras-copy">
				<h2 class="reveal" id="extras-title">And the rest of a good chat app</h2>
				<dl class="reveal">
					{#each extras as [title, text] (title)}<div><dt>{title}</dt><dd>{text}</dd></div>{/each}
				</dl>
			</div>
			<div class="sheet reveal" aria-hidden="true">
				{#each stickers as s (s.label)}
					<div class="spot" style:left="{s.x}%" style:top="{s.y}%">
						<span class="print">{s.label}</span>
						{@render sticker(s)}
					</div>
				{/each}
				<p class="aside hint">Peel one back, or pull it right off and stick it anywhere on the page.</p>
			</div>
		</section>

		<section class="privacy" id="privacy" aria-labelledby="privacy-title">
			<div class="wrap">
				<div class="head reveal">
					<h2 id="privacy-title">Who sees what</h2>
					<p>No telemetry, no crash reports, no Google services, no push servers. What does leave the device goes to as few parties as it can.</p>
				</div>
				<div class="sees reveal">
					<div class="parties" role="tablist" aria-label="Who sees what" aria-orientation="vertical">
						{#each sees as s, i (s.who)}
							<button role="tab" id="sees-{i}" aria-selected={seen === i} aria-controls="sees-panel" onclick={() => (seen = i)}>{s.who}</button>
						{/each}
					</div>
					<div class="sees-panel" id="sees-panel" role="tabpanel" aria-labelledby="sees-{seen}">
						{#key seen}<p in:fly={{ y: 8, duration: 240, easing: cubicOut }}>{sees[seen].what}</p>{/key}
					</div>
				</div>
			</div>
		</section>

		<section class="facts wrap" aria-labelledby="facts-title">
			<div class="head reveal">
				<h2 id="facts-title">Numbers nobody asked for</h2>
				<p>Counted anyway, with where each one comes from.</p>
			</div>
			<dl class="reveal">
				{#each facts as [n, what, src] (n)}<div><dt {@attach count}>{n}</dt><dd>{what} From {src}.</dd></div>{/each}
			</dl>
		</section>

		<section class="platforms wrap" id="platforms" aria-labelledby="platforms-title">
			<div class="head reveal">
				<h2 id="platforms-title">Where it runs</h2>
				<p>One Rust codebase. GPUI draws the interface and matrix-sdk talks to Matrix on its own thread, so the screen never waits on the network.</p>
			</div>
			<table class="reveal">
				<tbody>{#each platforms as [os, state] (os)}<tr><th scope="row">{os}</th><td>{state}</td></tr>{/each}</tbody>
			</table>
		</section>

		<section class="closing wrap" aria-labelledby="closing-title">
			<img class="reveal" src="/icon.svg" alt="" width="112" height="112" loading="lazy" />
			<h2 class="reveal" id="closing-title">Keep your account.<br />Choose your client.</h2>
			<a class="button reveal" href="#top">Back to top</a>
		</section>
	</main>

	<footer class="footer wrap"><span>Unisend. No trackers on this page either.</span><a href="/LICENSE-LUCIDE.txt">Icons: Lucide, ISC licence</a></footer>
</div>
