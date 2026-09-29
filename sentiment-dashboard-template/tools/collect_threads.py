#!/usr/bin/env python3
"""Threads 公開貼文收集器 → 產出儀表板用的 ../data.js

用法（在你自己的電腦上執行）：
  pip install -r requirements.txt && playwright install chromium
  python collect_threads.py login     # 開瀏覽器，你手動登入一次，登入狀態存在 auth/state.json
  python collect_threads.py search    # 依 collect.config.json 搜尋關鍵字，累積到 collected/store.json
  python collect_threads.py build     # 把 store 分類後寫成 ../data.js
  python collect_threads.py run       # search + build

注意：
- 只讀公開貼文，速度放慢、量小；遇到登入牆或驗證會停下，不繞過。
- 使用前請自行確認符合 Threads/Meta 的使用條款；帳號有被限制的風險。
- 頁面結構改版時，只需要改下面 EXTRACT_JS 這一段。
- 立場與議題是關鍵字規則的粗分，build 後請人工抽查再公開。
"""
import argparse, json, random, re, sys, time
from datetime import datetime, timedelta
from pathlib import Path
from urllib.parse import quote

HERE = Path(__file__).resolve().parent
CFG_PATH = HERE / "collect.config.json"
STATE = HERE / "auth" / "state.json"
STORE = HERE / "collected" / "store.json"
OUT = HERE.parent / "data.js"

# 在頁面內執行：找出每則貼文的連結、作者、時間、內文、數字列。
# 取不到的欄位回傳空值，由 Python 端容錯。
EXTRACT_JS = r"""
() => {
  const out = [], seen = new Set();
  document.querySelectorAll('a[href*="/post/"]').forEach(a => {
    const m = a.getAttribute('href').match(/^\/@([^/]+)\/post\/([^/?#]+)/);
    if (!m || seen.has(m[2])) return;
    const box = a.closest('div[data-pressable-container]') || a.closest('article') || a.parentElement.parentElement.parentElement;
    if (!box) return;
    seen.add(m[2]);
    const t = a.querySelector('time') || box.querySelector('time');
    out.push({
      author: m[1], code: m[2],
      url: 'https://www.threads.com/@' + m[1] + '/post/' + m[2],
      datetime: t ? t.getAttribute('datetime') : '',
      rel: t ? t.innerText : '',
      lines: box.innerText.split('\n').map(s => s.trim()).filter(Boolean),
    });
  });
  return out;
}
"""


def load_cfg():
    return json.loads(CFG_PATH.read_text(encoding="utf-8"))


def parse_count(s):
    """'1,234' / '1.2K' / '3.4萬' → int；不是數字回傳 None"""
    s = s.strip().replace(",", "")
    m = re.fullmatch(r"(\d+(?:\.\d+)?)([KkMm萬万])?", s)
    if not m:
        return None
    n = float(m.group(1))
    return int(n * {"K": 1e3, "k": 1e3, "M": 1e6, "m": 1e6, "萬": 1e4, "万": 1e4}.get(m.group(2), 1))


def parse_time(datetime_attr, rel, now=None):
    now = now or datetime.now()
    if datetime_attr:
        try:
            return datetime.fromisoformat(datetime_attr.replace("Z", "+00:00")).astimezone().replace(tzinfo=None)
        except ValueError:
            pass
    m = re.match(r"(\d+)\s*(分鐘|小時|天|週|周)前", rel or "")
    if m:
        n, u = int(m.group(1)), m.group(2)
        return now - {"分鐘": timedelta(minutes=n), "小時": timedelta(hours=n), "天": timedelta(days=n),
                      "週": timedelta(weeks=n), "周": timedelta(weeks=n)}[u]
    return None  # 讀不到就留空，儀表板不會把它放上時間軸


def split_record(raw):
    """從 lines 拆出內文與互動數。Threads 貼文結尾通常依序是 讚、回覆、轉發、分享 的數字。"""
    lines = [l for l in raw["lines"] if l != raw["author"] and l != raw.get("rel")]
    tail = []
    while lines and (parse_count(lines[-1]) is not None):
        tail.insert(0, parse_count(lines.pop()))
    body = " ".join(l for l in lines if not re.fullmatch(r"(\d+\s*(分鐘|小時|天|週|周)前|翻譯|更多|讚|回覆|轉發|分享)", l))
    likes = tail[0] if tail else 0
    return body.strip(), likes, bool(re.search(r"正在回覆|回覆\s*@", " ".join(raw["lines"][:3])))


def polite_sleep(cfg):
    lim = cfg["limits"]
    time.sleep(random.uniform(lim["delay_min"], lim["delay_max"]))


def login_wall(page):
    return "login" in page.url or page.locator('input[type="password"]').count() > 0


def cmd_login(_):
    from playwright.sync_api import sync_playwright
    STATE.parent.mkdir(exist_ok=True)
    with sync_playwright() as p:
        b = p.chromium.launch(headless=False)
        ctx = b.new_context(locale="zh-TW")
        page = ctx.new_page()
        page.goto("https://www.threads.com/login")
        input("請在瀏覽器登入（含雙重驗證），完成後回到這裡按 Enter … ")
        ctx.storage_state(path=str(STATE))
        b.close()
    print(f"登入狀態已存到 {STATE}（請勿上傳或分享這個檔案）")


def scrape_page(page, url, cfg):
    page.goto(url, wait_until="domcontentloaded")
    page.wait_for_timeout(2500)
    if login_wall(page):
        sys.exit("遇到登入牆：請重新執行 login。程式不會嘗試繞過。")
    found = {}
    for _ in range(cfg["limits"]["max_scrolls"]):
        for r in page.evaluate(EXTRACT_JS):
            found[r["code"]] = r
        if len(found) >= cfg["limits"]["max_posts_per_keyword"]:
            break
        page.mouse.wheel(0, 2500)
        polite_sleep(cfg)
    return list(found.values())


def cmd_search(_):
    from playwright.sync_api import sync_playwright
    if not STATE.exists():
        sys.exit("找不到登入狀態，請先執行：python collect_threads.py login")
    cfg = load_cfg()
    store = json.loads(STORE.read_text(encoding="utf-8")) if STORE.exists() else {"posts": {}, "owner": {}}
    with sync_playwright() as p:
        b = p.chromium.launch(headless=True)
        ctx = b.new_context(storage_state=str(STATE), locale="zh-TW")
        page = ctx.new_page()
        jobs = [("posts", kw, f"https://www.threads.com/search?q={quote(kw)}&serp_type=default&filter=recent") for kw in cfg["keywords"]]
        jobs += [("owner", "@" + a, f"https://www.threads.com/@{a}") for a in cfg["owner_accounts"]]
        for kind, label, url in jobs:
            raws = scrape_page(page, url, cfg)
            new = 0
            for r in raws:
                if r["code"] not in store[kind]:
                    new += 1
                r["kw"] = label
                r["fetched"] = datetime.now().isoformat(timespec="seconds")
                store[kind][r["code"]] = r
            print(f"[{kind}] {label}: 抓到 {len(raws)} 則，新增 {new}")
            polite_sleep(cfg)
        b.close()
    STORE.parent.mkdir(exist_ok=True)
    STORE.write_text(json.dumps(store, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"已累積到 {STORE}")


def classify(text, cfg):
    topic, best = cfg["fallback_topic"], 0
    for code, kws in cfg["topics"].items():
        n = sum(text.count(k) for k in kws)
        if n > best:
            topic, best = code, n
    neg = sum(text.count(k) for k in cfg["stance"]["neg"])
    pos = sum(text.count(k) for k in cfg["stance"]["pos"])
    stance = "neg" if neg > pos else "pos" if pos > neg else "neu"
    return topic, stance


def build_data(store, cfg):
    lo, hi = (datetime.fromisoformat(cfg["window"][k]) for k in ("from", "to"))
    hi += timedelta(days=1)
    posts, owner = [], []
    for code, raw in store["posts"].items():
        text, likes, is_reply = split_record(raw)
        if not text or not any(k in text for k in cfg["must_match"]):
            continue
        t = parse_time(raw["datetime"], raw["rel"], datetime.fromisoformat(raw["fetched"]))
        if t and not (lo <= t < hi):
            continue
        topic, stance = classify(text, cfg)
        posts.append({"a": raw["author"], "d": t.strftime("%m/%d") if t else "", "s": stance, "t": topic,
                      "l": likes, "q": is_reply, "x": text[:300], "u": raw["url"]})
    for code, raw in store["owner"].items():
        text, likes, _ = split_record(raw)
        t = parse_time(raw["datetime"], raw["rel"], datetime.fromisoformat(raw["fetched"]))
        if text and any(k in text for k in cfg["must_match"]) and (not t or lo <= t < hi):
            owner.append({"a": raw["author"], "k": "post", "lab": "官方貼文", "d": t.strftime("%m/%d") if t else "",
                          "l": likes, "x": text[:300], "u": raw["url"]})
    posts.sort(key=lambda r: (r["d"], -r["l"]))
    return {"posts": posts, "owner": owner, "coms": []}


def cmd_build(_):
    if not STORE.exists():
        sys.exit("還沒有收集資料，請先執行 search")
    cfg, store = load_cfg(), json.loads(STORE.read_text(encoding="utf-8"))
    data = build_data(store, cfg)
    if OUT.exists() and "_generated_by_collect" not in OUT.read_text(encoding="utf-8"):
        backup = OUT.with_name("data.sample.js")
        if not backup.exists():
            OUT.rename(backup)
            print(f"原本的示範資料已備份為 {backup.name}")
    header = f"// _generated_by_collect  {datetime.now().isoformat(timespec='seconds')}\n// 由 tools/collect_threads.py 產生；立場與議題為關鍵字粗分，公開前請人工抽查。\n"
    OUT.write_text(header + "window.DATA = " + json.dumps(data, ensure_ascii=False, indent=1) + ";\n", encoding="utf-8")
    neg = sum(1 for p in data["posts"] if p["s"] == "neg")
    print(f"已寫入 {OUT}：{len(data['posts'])} 則貼文（負面 {neg}）、{len(data['owner'])} 則官方貼文。")
    print("提醒：請把 ../config.js 的 metric 改成 'likes'，並確認 focus.stance 與 topics 代碼相符。")


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("cmd", choices=["login", "search", "build", "run"])
    a = ap.parse_args()
    {"login": cmd_login, "search": cmd_search, "build": cmd_build,
     "run": lambda x: (cmd_search(x), cmd_build(x))}[a.cmd](a)
