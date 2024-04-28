//stolen from hiro.so

var textRenderer = { preferredElementNodeName: "PRE", render };
const backBuffer = [];
let cols$1, rows$1;
function render(e, t) {
    let o = e.settings.element;
    for ((e.rows != rows$1 || e.cols != cols$1) && ((cols$1 = e.cols), (rows$1 = e.rows), (backBuffer.length = 0)); o.childElementCount < rows$1; ) {
        let n = document.createElement("span");
        (n.style.display = "block"), o.appendChild(n);
    }
    for (; o.childElementCount > rows$1; ) o.removeChild(o.lastChild);
    for (let r = 0; r < rows$1; r++) {
        let l = r * cols$1,
            s = !1;
        for (let i = 0; i < cols$1; i++) {
            let a = i + l,
                c = t[a],
                f = backBuffer[a];
            isSameCell(c, f) || ((s = !0), (backBuffer[a] = { ...c }));
        }
        if (!1 == s) continue;
        let u = "",
            d = {},
            p = !1;
        for (let g = 0; g < cols$1; g++) {
            let h = t[g + l];
            if ((h.beginHTML && (p && ((u += "</span>"), (d = {}), (p = !1)), (u += h.beginHTML)), !isSameCellStyle(h, d))) {
                p && (u += "</span>");
                let $ = h.color === e.settings.color ? null : h.color,
                    _ = h.backgroundColor === e.settings.backgroundColor ? null : h.backgroundColor,
                    y = h.fontWeight === e.settings.fontWeight ? null : h.fontWeight,
                    S = "";
                $ && (S += "color:" + $ + ";"), _ && (S += "background:" + _ + ";"), y && (S += "font-weight:" + y + ";"), S && (S = ' style="' + S + '"'), (u += "<span" + S + ">"), (p = !0);
            }
            (u += h.char), (d = h), h.endHTML && (p && ((u += "</span>"), (d = {}), (p = !1)), (u += h.endHTML));
        }
        p && (u += "</span>"), (o.childNodes[r].innerHTML = u);
    }
}
function isSameCell(e, t) {
    return "object" == typeof e && "object" == typeof t && e.char === t.char && e.fontWeight === t.fontWeight && e.color === t.color && e.backgroundColor === t.backgroundColor;
}

function isSameCellStyle(e, t) {
    return e.fontWeight === t.fontWeight && e.color === t.color && e.backgroundColor === t.backgroundColor;
}
class FPS {
    constructor() {
        (this.frames = 0), (this.ptime = 0), (this.fps = 0);
    }
    update(e) {
        return this.frames++, e >= this.ptime + 1e3 && ((this.fps = (1e3 * this.frames) / (e - this.ptime)), (this.ptime = e), (this.frames = 0)), this.fps;
    }
}
var storage = {
    store: function (e, t) {
        try {
            return localStorage.setItem(e, JSON.stringify(t)), !0;
        } catch (o) {
            return !1;
        }
    },
    restore: function (e, t = {}) {
        let o = JSON.parse(localStorage.getItem(e));
        return Object.assign(t, o), t;
    },
    clear: function (e) {
        localStorage.removeItem(e);
    },
};
const renderers = { text: textRenderer },
    defaultSettings = { element: null, cols: 0, rows: 0, once: !1, fps: 30, renderer: "text", allowSelect: !1, restoreState: !1 },
    CSSStyles = ["backgroundColor", "color", "fontFamily", "fontSize", "fontWeight", "letterSpacing", "lineHeight", "textAlign"];
function run(e, t, o = {}) {
    return new Promise(function (n) {
        let r = !1,
            l = { ...defaultSettings, ...t, ...e.settings },
            s = { time: 0, frame: 0, cycle: 0 },
            i = "currentState";
        l.restoreState && (storage.restore(i, s), s.cycle++);
        let a;
        for (let c of (l.element
            ? "canvas" == l.renderer
                ? "CANVAS" == l.element.nodeName
                    ? (a = renderers[l.renderer])
                    : console.warn("This renderer expects a canvas target element.")
                : "CANVAS" != l.element.nodeName
                ? (a = renderers[l.renderer])
                : console.warn("This renderer expects a text target element.")
            : ((a = renderers[l.renderer] || renderers.text), (l.element = document.createElement(a.preferredElementNodeName)), document.body.appendChild(l.element)),
        CSSStyles))
            l[c] && (l.element.style[c] = l[c]);
        let f = [],
            u = { x: 0, y: 0, pressed: !1, px: 0, py: 0, ppressed: !1 };
        l.element.addEventListener("pointermove", (e) => {
            let t = l.element.getBoundingClientRect();
            (u.x = e.clientX - t.left), (u.y = e.clientY - t.top), f.push("pointerMove");
        }),
            l.element.addEventListener("pointerdown", (e) => {
                (u.pressed = !0), f.push("pointerDown");
            }),
            l.element.addEventListener("pointerup", (e) => {
                (u.pressed = !1), f.push("pointerUp");
            });
        let d = (e) => {
                let t = l.element.getBoundingClientRect();
                (u.x = e.touches[0].clientX - t.left), (u.y = e.touches[0].clientY - t.top), f.push("pointerMove");
            },
            p = (e) => {
                (r = !r) || requestAnimationFrame(x);
            };
        l.element.addEventListener("touchmove", d),
            l.element.addEventListener("touchstart", d),
            l.element.addEventListener("touchstart", d),
            l.element.addEventListener("pause", p),
            (l.element.style.fontStrech = "normal"),
            l.allowSelect || disableSelect(l.element),
            document.fonts.ready.then((t) => {
                let n = 3;
                !(function t() {
                    --n > 0
                        ? requestAnimationFrame(t)
                        : (function t() {
                              _ = calcMetrics(l.element);
                              let n = getContext(s, l, _, g);
                              "function" == typeof e.boot && e.boot(n, $, o), requestAnimationFrame(x);
                          })();
                })();
            });
        let g = new FPS(),
            h = Object.freeze({ color: l.color, backgroundColor: l.backgroundColor, fontWeight: l.fontWeight }),
            $ = [],
            _,
            y = 0,
            S = 1e3 / l.fps,
            C = s.time,
            w,
            v;
        function x(t) {
            if (!r) {
                let c = t - y;
                if (c < S) {
                    l.once || requestAnimationFrame(x);
                    return;
                }
                let d = getContext(s, l, _, g);
                g.update(t), (y = t - (c % S)), (s.time = t + C), s.frame++, storage.store(i, s);
                let p = { x: Math.min(d.cols - 1, u.x / _.cellWidth), y: Math.min(d.rows - 1, u.y / _.lineHeight), pressed: u.pressed, p: { x: u.px / _.cellWidth, y: u.py / _.lineHeight, pressed: u.ppressed } };
                if (((u.px = u.x), (u.py = u.y), (u.ppressed = u.pressed), w != d.cols || v != d.rows)) {
                    (w = d.cols), (v = d.rows), ($.length = d.cols * d.rows);
                    for (let b = 0; b < $.length; b++) $[b] = { ...h, char: " " };
                }
                if (("function" == typeof e.pre && e.pre(d, p, $, o), "function" == typeof e.main))
                    for (let E = 0; E < d.rows; E++) {
                        let k = E * d.cols;
                        for (let I = 0; I < d.cols; I++) {
                            let A = I + k,
                                L = e.main({ x: I, y: E, index: A }, d, p, $, o);
                            "object" == typeof L && null !== L ? ($[A] = { ...$[A], ...L }) : ($[A] = { ...$[A], char: L }), Boolean($[A].char) || 0 === $[A].char || ($[A].char = " ");
                        }
                    }
                for ("function" == typeof e.post && e.post(d, p, $, o), a.render(d, $, l); f.length > 0; ) {
                    let N = f.shift();
                    N && "function" == typeof e[N] && e[N](d, p, $);
                }
                l.once || requestAnimationFrame(x), n(d);
            }
        }
    });
}

function getContext(e, t, o, n) {
    let r = t.element.getBoundingClientRect(),
        l = t.cols || Math.floor(r.width / o.cellWidth),
        s = t.rows || Math.floor(r.height / o.lineHeight);
    return Object.freeze({ frame: e.frame, time: e.time, cols: l, rows: s, metrics: o, width: r.width, height: r.height, settings: t, runtime: Object.freeze({ cycle: e.cycle, fps: n.fps }) });
}

function disableSelect(e) {
    (e.style.userSelect = "none"), (e.style.webkitUserSelect = "none"), (e.style.mozUserSelect = "none"), (e.dataset.selectionEnabled = "false");
}

function calcMetrics(e) {
    let t = getComputedStyle(e),
        o = t.getPropertyValue("font-family"),
        n = parseFloat(t.getPropertyValue("font-size")),
        r = parseFloat(t.getPropertyValue("line-height")),
        l;
    if ("CANVAS" == e.nodeName) {
        let s = e.getContext("2d");
        (s.font = n + "px " + o), (l = s.measureText("".padEnd(50, "X")).width / 50);
    } else {
        let i = document.createElement("span");
        e.appendChild(i), (i.innerHTML = "".padEnd(50, "X")), (l = i.getBoundingClientRect().width / 50), e.removeChild(i);
    }
    let a = {
        aspect: l / r,
        cellWidth: l,
        lineHeight: r,
        fontFamily: o,
        fontSize: n,
        _update: function () {
            let t = calcMetrics(e);
            for (var o in t) ("number" == typeof t[o] || "string" == typeof t[o]) && (m[o] = t[o]);
        },
    };
    return a;
}

var style = "";
function map(e, t, o, n, r) {
    return n + (r - n) * ((e - t) / (o - t));
}

function clamp(e, t, o) {
    return e < t ? t : e > o ? o : e;
}

function mix(e, t, o) {
    return e * (1 - o) + t * o;
}

function smoothstep(e, t, o) {
    let n = clamp((o - e) / (t - e), 0, 1);
    return n * n * (3 - 2 * n);
}

let programValues = { value01: 12 },
    animationOff = !1;
const settings$1 = {},
    { min: e, max: t, sin: o, floor: n } = Math;
let flame = ' ︙\xb7://|*#"§_jhNs#+&',
    cols,
    rows;
const noise = valueNoise(),
    data = [];
function callPause() {
    console.log("PAUSE FUNCTIONA CALLED"), document.querySelector("#ASCII-Holder").dispatchEvent(new Event("pause"));
}
function pre(o, r, l) {
    if (((cols != o.cols || rows != o.rows) && ((cols = o.cols), (rows = o.rows), (data.length = cols * rows), data.fill(0)), r.pressed)) {
        let s = n(r.x),
            i = n(r.y);
        data[s + i * cols] = rndi(5, 50);
    } else {
        let a = 0.0015 * o.time,
            c = cols * (rows - 1);
        for (let f = 0; f < cols; f++) {
            let u = n(map(noise(0.05 * f, a), 0, 1, 5, programValues.value01));
            data[c + f] = e(u, data[c + f] + 2);
        }
    }
    for (let d = 0; d < data.length; d++) {
        let p = n(d / cols),
            g = d % cols,
            h = p * cols + clamp(g + rndi(-1, 1), 0, cols - 1),
            $ = e(rows - 1, p + 1) * cols + g;
        data[h] = t(0, data[$] - rndi(0, 2));
    }
}

function main(e, t, o, n) {
    let r = data[e.index];
    if (0 !== r) return { char: flame[clamp(r, 0, flame.length - 1)], fontWeight: r > 20 ? 700 : 100 };
}

function rndi(e, t = 0) {
    return e > t && ([e, t] = [t, e]), Math.floor(e + Math.random() * (t - e + 1));
}

function valueNoise() {
    let e = Array(256),
        t = Array(512);
    for (let o = 0; o < 256; o++) (e[o] = Math.random()), (t[o] = o);
    for (let n = 0; n < 256; n++) {
        let r = Math.floor(256 * Math.random());
        ([t[n], t[r]] = [t[r], t[n]]), (t[n + 256] = t[n]);
    }
    return function (o, n) {
        let r = Math.floor(o),
            l = Math.floor(n),
            s = r % 256,
            i = (s + 1) % 256,
            a = l % 256,
            c = (a + 1) % 256,
            f = e[t[t[s] + a]],
            u = e[t[t[i] + a]],
            d = e[t[t[s] + c]],
            p = e[t[t[i] + c]],
            g = smoothstep(0, 1, o - r),
            h = smoothstep(0, 1, n - l),
            $ = mix(f, u, g),
            _ = mix(d, p, g);
        return mix($, _, h);
    };
}

function post(e, t, o) {}
var program = Object.freeze(Object.defineProperty({ __proto__: null, settings: settings$1, pre, main, post }, Symbol.toStringTag, { value: "Module" }));
let fpsValue = 12;
const settings = {
    element: document.querySelector("#ASCII-Holder"),
    backgroundColor: "transparent",
    color: "#073642",
    fps: fpsValue,
};
run(program, settings).catch(function (e) {
    console.warn(e.message), console.log(e.error);
});
