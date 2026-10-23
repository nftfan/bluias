(() => {
  "use strict";

  const SELECTOR = "main .feed-media, main .story-photo, main .model-main, main .moms-plan-cover, main .member-hero, main .mag-photo, main .model-thumb img";
  const states = new WeakMap();
  const frames = new WeakMap();

  function init() {
    if (document.getElementById("bluias-media-loading-style")) return;
    const style = document.createElement("style");
    style.id = "bluias-media-loading-style";
    style.textContent = `
      #panel-updates{--media-accent:#f3b9d1}
      #panel-moms{--media-accent:#d3bdf0}
      #panel-play{--media-accent:#f0cfb2}
      #panel-members,#panel-feed,#panel-stories{--media-accent:#e4cc82}
      .smooth-media-frame{position:relative;display:block;width:100%;overflow:hidden;isolation:isolate;aspect-ratio:4/5;background:#151317;--media-accent-fallback:#e0c8df}
      .smooth-media-frame.is-model{width:min(70vw,280px);border-radius:20px}
      .smooth-media-frame::before{content:"";position:absolute;inset:0;background:linear-gradient(110deg,transparent 15%,#ffffff0b 36%,#ffffff18 48%,#ffffff0b 60%,transparent 82%);background-size:230% 100%;animation:bluiasMediaShimmer 1.9s ease-in-out infinite;animation-play-state:paused;transition:opacity .45s ease;pointer-events:none}
      .smooth-media-frame>img,.smooth-media-frame>video{opacity:0;transition:opacity .55s ease}
      .smooth-media-frame.is-ready.is-revealed>img,.smooth-media-frame.is-ready.is-revealed>video{opacity:1}
      .smooth-media-frame.is-ready::before,.smooth-media-frame.is-error::before{opacity:0;animation:none}
      .smooth-media-overlay{position:absolute;inset:0;z-index:2;display:flex;align-items:center;justify-content:center;pointer-events:none;transition:opacity .35s ease}
      .smooth-media-frame.is-ready:not(.is-buffering)>.smooth-media-overlay{opacity:0;visibility:hidden}
      .smooth-media-indicator{display:flex;align-items:center;gap:7px;padding:14px 17px;border-radius:999px;background:#17121b7a;backdrop-filter:blur(10px)}
      .smooth-media-indicator span{width:5px;height:5px;border-radius:50%;background:var(--media-accent,var(--media-accent-fallback));animation:bluiasMediaPulse 1.2s ease-in-out infinite;animation-play-state:paused}
      .smooth-media-indicator span:nth-child(2){animation-delay:.15s}
      .smooth-media-indicator span:nth-child(3){animation-delay:.3s}
      .smooth-media-frame.is-near:not(.is-ready)::before,.smooth-media-frame.is-near .smooth-media-indicator span{animation-play-state:running}
      .smooth-media-error{display:none;max-width:260px;padding:20px;text-align:center;font:12px/1.6 Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif;color:#e1d7e4;background:#141017d9;border:1px solid #ffffff18;border-radius:16px;pointer-events:auto}
      .smooth-media-error button{display:block;margin:12px auto 0;padding:9px 16px;border:1px solid #ffffff35;border-radius:9px;background:#ffffff0d;color:var(--media-accent,var(--media-accent-fallback));font:600 11px Inter,Arial,sans-serif;cursor:pointer}
      .smooth-media-error button:focus-visible{outline:2px solid currentColor;outline-offset:3px}
      .smooth-media-frame.is-error .smooth-media-indicator{display:none}
      .smooth-media-frame.is-error .smooth-media-error{display:block}
      .has-smooth-media>.video-loader{display:none!important}
      .has-smooth-media.moms-loading{animation:none!important}
      .mag-photo-frame:not(.is-revealed) .mag-photo{opacity:0}
      .mag-photo-frame::before{animation-play-state:paused}
      .mag-photo-frame.is-near::before{animation-play-state:running}
      .smooth-media-thumb>img{opacity:0;transition:opacity .45s ease}
      .smooth-media-thumb.is-ready.is-revealed>img{opacity:1}
      .panel:not(.active) .smooth-media-frame::before,.panel:not(.active) .smooth-media-indicator span{animation-play-state:paused!important}
      @keyframes bluiasMediaShimmer{from{background-position:220% 0}to{background-position:-220% 0}}
      @keyframes bluiasMediaPulse{0%,70%,100%{opacity:.35;transform:scale(.8)}35%{opacity:1;transform:scale(1.15)}}
      @media(prefers-reduced-motion:reduce){.smooth-media-frame::before,.smooth-media-indicator span{animation:none!important}.smooth-media-frame>img,.smooth-media-frame>video,.smooth-media-overlay,.smooth-media-frame::before,.smooth-media-thumb>img{transition:none!important}}
    `;
    document.head.appendChild(style);

    const visibility = typeof IntersectionObserver === "function" ? new IntersectionObserver(entries => {
      entries.forEach(entry => {
        entry.target.classList.toggle("is-near", entry.isIntersecting);
        if (entry.isIntersecting) frames.get(entry.target)?.activate();
      });
    }, {rootMargin:"180px 0px"}) : null;
    const revealObserver = typeof IntersectionObserver === "function" ? new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          revealObserver.unobserve(entry.target);
        }
      });
    }, {threshold:0.01}) : null;

    function watch(media, state) {
      state.pending = true;
      state.activate = () => {
        const panel = media.closest(".panel");
        if (!state.pending || (panel && !panel.classList.contains("active"))) return;
        state.pending = false;
        const srcset = media.dataset.srcset;
        const src = media.dataset.src;
        if (media.tagName === "IMG" && (src || srcset)) media.loading = "eager";
        if (srcset && media.getAttribute("srcset") !== srcset) media.setAttribute("srcset", srcset);
        if (src && media.getAttribute("src") !== src) {
          media.setAttribute("src", src);
          if (media.tagName === "VIDEO") media.load();
        }
      };
      frames.set(state.frame, state);
      if (revealObserver) revealObserver.observe(state.frame);
      else state.frame.classList.add("is-revealed");
      if (visibility) visibility.observe(state.frame);
      else {
        state.frame.classList.add("is-near");
        state.activate();
      }
    }

    function prepare(media) {
      if (states.has(media)) return;
      const magazine = media.closest(".mag-photo-frame");
      if (magazine) {
        const state = {frame:magazine, begin:() => {}};
        states.set(media, state);
        watch(media, state);
        return;
      }
      const thumbnail = media.closest(".model-thumb");
      if (thumbnail) {
        thumbnail.classList.add("smooth-media-thumb");
        const state = {frame:thumbnail, begin:() => thumbnail.classList.remove("is-ready")};
        states.set(media, state);
        const finish = () => thumbnail.classList.add("is-ready");
        media.addEventListener("load", finish);
        if (media.complete && media.naturalWidth) finish();
        watch(media, state);
        return;
      }
      const isVideo = media.tagName === "VIDEO";
      if (!isVideo && media.tagName !== "IMG") return;

      const frame = document.createElement("div");
      frame.className = "smooth-media-frame is-loading";
      if (media.classList.contains("model-main")) frame.classList.add("is-model");
      const ratio = isVideo ? (media.classList.contains("reel") ? 9/16 : 16/9) : Number(media.getAttribute("width"))/Number(media.getAttribute("height"));
      if (Number.isFinite(ratio) && ratio > 0) frame.style.aspectRatio = String(ratio);
      const overlay = document.createElement("div");
      overlay.className = "smooth-media-overlay";
      const indicator = document.createElement("div");
      indicator.className = "smooth-media-indicator";
      indicator.setAttribute("aria-hidden", "true");
      indicator.innerHTML = "<span></span><span></span><span></span>";
      const error = document.createElement("div");
      error.className = "smooth-media-error";
      error.setAttribute("role", "status");
      const message = document.createElement("span");
      message.textContent = isVideo ? "This video could not load." : "This photo could not load.";
      const retry = document.createElement("button");
      retry.type = "button";
      retry.textContent = isVideo ? "Retry video" : "Retry photo";
      error.append(message, retry);
      overlay.append(indicator, error);

      const state = {frame, generation:0, ready:false};
      states.set(media, state);
      media.parentElement?.classList.add("has-smooth-media");
      media.before(frame);
      frame.append(media, overlay);
      frame.setAttribute("aria-busy", "true");

      const updateRatio = () => {
        if (!isVideo && media.naturalWidth && media.naturalHeight) frame.style.aspectRatio = `${media.naturalWidth}/${media.naturalHeight}`;
        if (isVideo && !media.classList.contains("reel") && !media.classList.contains("tv") && media.videoWidth && media.videoHeight) frame.style.aspectRatio = `${media.videoWidth}/${media.videoHeight}`;
      };
      const begin = () => {
        state.generation++;
        state.ready = false;
        frame.classList.remove("is-ready", "is-buffering", "is-error");
        frame.classList.add("is-loading");
        frame.setAttribute("aria-busy", "true");
      };
      state.begin = begin;

      const finish = () => {
        updateRatio();
        state.ready = true;
        frame.classList.remove("is-loading", "is-buffering", "is-error");
        frame.classList.add("is-ready");
        frame.setAttribute("aria-busy", "false");
      };
      const failed = () => {
        state.generation++;
        state.ready = false;
        frame.classList.remove("is-loading", "is-buffering", "is-ready");
        frame.classList.add("is-error");
        frame.setAttribute("aria-busy", "false");
      };
      if (isVideo) {
        media.addEventListener("loadstart", begin);
        media.addEventListener("loadedmetadata", updateRatio);
        ["loadeddata", "canplay", "playing"].forEach(event => media.addEventListener(event, finish));
        ["waiting", "stalled"].forEach(event => media.addEventListener(event, () => {
          if (frame.classList.contains("is-error")) return;
          if (state.ready) frame.classList.add("is-buffering");
          else frame.classList.add("is-loading");
          frame.setAttribute("aria-busy", "true");
        }));
        media.addEventListener("error", failed);
        if (media.error) failed();
        else if (media.readyState >= 2) finish();
      } else {
        const loaded = () => {
          const generation = state.generation;
          updateRatio();
          const reveal = () => {
            if (generation !== state.generation) return;
            if (media.naturalWidth) requestAnimationFrame(() => {
              if (generation === state.generation) finish();
            });
            else failed();
          };
          if (media.decode) media.decode().catch(() => {}).then(reveal);
          else reveal();
        };
        media.addEventListener("load", loaded);
        media.addEventListener("error", failed);
        if (media.complete && (media.currentSrc || media.getAttribute("src"))) {
          if (media.naturalWidth) finish();
          else failed();
        }
      }

      retry.addEventListener("click", () => {
        begin();
        if (isVideo) {
          if (!media.getAttribute("src") && media.dataset.src) media.src = media.dataset.src;
          media.load();
        } else {
          const source = media.getAttribute("src");
          if (source) media.src = source;
        }
      });
      watch(media, state);
    }

    function scan(node) {
      if (node.nodeType !== 1) return;
      if (node.matches(SELECTOR)) prepare(node);
      node.querySelectorAll(SELECTOR).forEach(prepare);
    }
    document.querySelectorAll(SELECTOR).forEach(prepare);
    new MutationObserver(records => records.forEach(record => {
      if (record.type === "attributes") {
        const state = states.get(record.target);
        if (state) {
          state.begin();
          if (record.attributeName.startsWith("data-")) {
            state.pending = true;
            if (state.frame.classList.contains("is-near")) state.activate();
          }
        }
        else if (record.target.matches(SELECTOR)) prepare(record.target);
      } else record.addedNodes.forEach(scan);
    })).observe(document.body, {childList:true, subtree:true, attributes:true, attributeFilter:["src", "srcset", "data-src", "data-srcset"]});

    document.addEventListener("click", event => {
      if (!event.target.closest?.(".nav-btn")) return;
      requestAnimationFrame(() => document.querySelectorAll(SELECTOR).forEach(media => {
        const state = states.get(media);
        if (!state?.pending) return;
        const panel = media.closest(".panel");
        if (panel && !panel.classList.contains("active")) return;
        const bounds = state.frame.getBoundingClientRect();
        if (bounds.width && bounds.height && bounds.bottom >= -180 && bounds.top <= innerHeight + 180) state.activate();
      }));
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, {once:true});
  else init();
})();
