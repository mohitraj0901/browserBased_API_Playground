
/** 

 * API Playground — a lightweight  

Postman/Hoppscotch clone 

 * Silent Coder dark theme · React +  

Tailwind · Single-file 

 */ 

import { useState, useEffect, useCallback,  

useRef } from "react"; 

// ─── CONSTANTS  

──────────────────────────────────── 

──────────────────────────── 

const DEFAULT_BASE = "https://browserbased- 

api-playground.onrender.com"; 

const MAX_HISTORY = 25; 

const METHODS = ["GET", "POST", "PUT",  

"PATCH", "DELETE", "HEAD"]; 

const METHOD_COLORS = { 

  GET:    "#5ee6a8", 

  POST:   "#ffd166", 

  PUT:    "#7aa2ff", 

  PATCH:  "#c792ea", 

  DELETE: "#ff6b8a", 

  HEAD:   "#7a849b", 

}; 

----------------------- Page 2-----------------------

const COLORS = { 

  bg:       "#0b0e14", 

  panel:    "#11151f", 

  panel2:   "#161b27", 

  border:   "#222a3a", 

  text:     "#d7dce5", 

  muted:    "#7a849b", 

  accent:   "#5ee6a8", 

  accent2:  "#7aa2ff", 

}; 

// ─── UTILS  

──────────────────────────────────── 

─────────────────────────────── 

const formatBytes = (n) => { 

  if (!n && n !== 0) return "—"; 

  if (n < 1024) return `${n} B`; 

  if (n < 1024 * 1024) return `${(n /  

1024).toFixed(1)} KB`; 

  return `${(n / (1024 * 1024)).toFixed(2)}  

MB`; 

}; 

const statusColor = (code) => { 

  if (!code) return COLORS.muted; 

  if (code < 300) return "#5ee6a8"; 

  if (code < 400) return "#7aa2ff"; 

  if (code < 500) return "#ffd166"; 

  return "#ff6b8a"; 

}; 

const uid = () =>  

Math.random().toString(36).slice(2); 

----------------------- Page 3-----------------------

const emptyKV = () => ({ id: uid(), key:  

"", value: "" }); 

const kvToObj = (rows) => 

  rows.reduce((acc, r) => { 

    if (r.key.trim()) acc[r.key.trim()] =  

r.value; 

    return acc; 

  }, {}); 

const objToKV = (obj) => 

  Object.entries(obj || {}).map(([key,  

value]) => ({ id: uid(), key, value })); 

const lsGet = (k, fb) => { 

  try { return  

JSON.parse(localStorage.getItem(k)) ?? fb;  

} 

  catch { return fb; } 

}; 

const lsSet = (k, v) => { 

  try { localStorage.setItem(k,  

JSON.stringify(v)); } catch {} 

}; 

// ─── JSON SYNTAX HIGHLIGHTER  

──────────────────────────────────── 

───────────── 

function JsonNode({ data, depth = 0 }) { 

  const [collapsed, setCollapsed] =  

useState(depth > 3); 

  const indent = depth * 16; 

----------------------- Page 4-----------------------

  if (data === null) return <span style={{  

color: "#ff6b8a" }}>null</span>; 

  if (typeof data === "boolean") return  

<span style={{ color: "#c792ea" }}> 

{String(data)}</span>; 

  if (typeof data === "number") return  

<span style={{ color: "#ffd166" }}>{data} 

</span>; 

  if (typeof data === "string") return  

<span style={{ color: "#5ee6a8" }}>"{data}" 

</span>; 

  if (Array.isArray(data)) { 

    if (data.length === 0) return <span  

style={{ color: COLORS.muted }}>[]</span>; 

    return ( 

      <span> 

        <button 

          onClick={() =>  

setCollapsed(!collapsed)} 

          style={{ color: COLORS.muted,  

background: "none", border: "none", cursor:  

"pointer", padding: 0, fontFamily:  

"inherit", fontSize: "inherit" }} 

        > 

          {collapsed ? " ▶" : "▼"} 

        </button> 

        <span style={{ color: COLORS.muted  

}}>[{collapsed ? `${data.length} items` :  

""}</span> 

        {!collapsed && ( 

          <div style={{ marginLeft: indent  

+ 16 }}> 

----------------------- Page 5-----------------------

            {data.map((v, i) => ( 

              <div key={i}> 

                <JsonNode data={v} depth= 

{depth + 1} /> 

                {i < data.length - 1 &&  

<span style={{ color: COLORS.muted }}>, 

</span>} 

              </div> 

            ))} 

          </div> 

        )} 

        <span style={{ color: COLORS.muted,  

marginLeft: collapsed ? 0 : indent }}>] 

</span> 

      </span> 

    ); 

  } 

  if (typeof data === "object") { 

    const keys = Object.keys(data); 

    if (keys.length === 0) return <span  

style={{ color: COLORS.muted }}>{"{}"} 

</span>; 

    return ( 

      <span> 

        <button 

          onClick={() =>  

setCollapsed(!collapsed)} 

          style={{ color: COLORS.muted,  

background: "none", border: "none", cursor:  

"pointer", padding: 0, fontFamily:  

"inherit", fontSize: "inherit" }} 

        > 

          {collapsed ? " ▶" : "▼"} 

----------------------- Page 6-----------------------

        </button> 

        <span style={{ color: COLORS.muted  

}}>{"{"}  {collapsed ? `${keys.length}  

keys` : ""}</span> 

        {!collapsed && ( 

          <div style={{ marginLeft: indent  

+ 16 }}> 

            {keys.map((k, i) => ( 

              <div key={k}> 

                <span style={{ color:  

"#7aa2ff" }}>"{k}"</span> 

                <span style={{ color:  

COLORS.muted }}>: </span> 

                <JsonNode data={data[k]}  

depth={depth + 1} /> 

                {i < keys.length - 1 &&  

<span style={{ color: COLORS.muted }}>, 

</span>} 

              </div> 

            ))} 

          </div> 

        )} 

        <span style={{ color: COLORS.muted,  

marginLeft: collapsed ? 0 : indent }}>{"}"} 

</span> 

      </span> 

    ); 

  } 

  return <span style={{ color: COLORS.text  

}}>{String(data)}</span>; 

} 

// ─── KEY-VALUE EDITOR  

----------------------- Page 7-----------------------

──────────────────────────────────── 

───────────────────── 

function KeyValueEditor({ rows, onChange,  

placeholder = "key" }) { 

  const add = () => onChange([...rows,  

emptyKV()]); 

  const remove = (id) =>  

onChange(rows.filter((r) => r.id !== id)); 

  const update = (id, field, val) => 

    onChange(rows.map((r) => (r.id === id ?  

{ ...r, [field]: val } : r))); 

  return ( 

    <div className="flex flex-col gap-1"> 

      {rows.map((r) => ( 

        <div key={r.id} className="flex  

gap-2 items-center"> 

          <input 

            value={r.key} 

            onChange={(e) => update(r.id,  

"key", e.target.value)} 

            placeholder={placeholder} 

            style={{ 

              background: COLORS.panel2,  

border: `1px solid ${COLORS.border}`, 

              color: COLORS.text,  

borderRadius: 6, padding: "5px 10px", 

              fontFamily: "inherit",  

fontSize: 13, flex: 1, outline: "none", 

            }} 

          /> 

          <input 

            value={r.value} 

----------------------- Page 8-----------------------

            onChange={(e) => update(r.id,  

"value", e.target.value)} 

            placeholder="value" 

            style={{ 

              background: COLORS.panel2,  

border: `1px solid ${COLORS.border}`, 

              color: COLORS.text,  

borderRadius: 6, padding: "5px 10px", 

              fontFamily: "inherit",  

fontSize: 13, flex: 2, outline: "none", 

            }} 

          /> 

          <button 

            onClick={() => remove(r.id)} 

            title="Remove" 

            style={{ 

              background: "none", border:  

"none", color: COLORS.muted, 

              cursor: "pointer", fontSize:  

16, lineHeight: 1, padding: "2px 4px", 

            }} 

          >×</button> 

        </div> 

      ))} 

      <button 

        onClick={add} 

        style={{ 

          alignSelf: "flex-start",  

background: "none", 

          border: `1px dashed  

${COLORS.border}`, color: COLORS.muted, 

          borderRadius: 6, padding: "4px  

12px", cursor: "pointer", 

          fontFamily: "inherit", fontSize:  

----------------------- Page 9-----------------------

12, marginTop: 4, 

        }} 

      >+ Add</button> 

    </div> 

  ); 

} 

// ─── URL BAR  

──────────────────────────────────── 

───────────────────────────── 

function UrlBar({ method, setMethod, url,  

setUrl, onSend, loading }) { 

  return ( 

    <div className="flex gap-2 items- 

center" style={{ padding: "12px 16px",  

borderBottom: `1px solid ${COLORS.border}`  

}}> 

      {/* Method dropdown */} 

      <div style={{ position: "relative"  

}}> 

        <select 

          value={method} 

          onChange={(e) =>  

setMethod(e.target.value)} 

          style={{ 

            background: COLORS.panel2, 

            border: `1px solid  

${COLORS.border}`, 

            color: METHOD_COLORS[method] ||  

COLORS.text, 

            borderRadius: 6, padding: "7px  

10px", 

            fontFamily: "inherit",  

----------------------- Page 10-----------------------

fontSize: 13, fontWeight: 700, 

            cursor: "pointer", outline:  

"none", minWidth: 90, 

            appearance: "none",  

paddingRight: 28, 

          }} 

        > 

          {METHODS.map((m) => ( 

            <option key={m} value={m}  

style={{ color: METHOD_COLORS[m] }}> 

              {m} 

            </option> 

          ))} 

        </select> 

        <span style={{ position:  

"absolute", right: 8, top: "50%",  

transform: "translateY(-50%)", color:  

COLORS.muted, pointerEvents: "none"  

}}>▾</span> 

      </div> 

      {/* URL input */} 

      <input 

        value={url} 

        onChange={(e) =>  

setUrl(e.target.value)} 

        onKeyDown={(e) => e.key === "Enter"  

&& onSend()} 

         

placeholder="https://api.example.com/endpoi 

nt" 

        style={{ 

          flex: 1, background:  

COLORS.panel2, 

----------------------- Page 11-----------------------

          border: `1px solid  

${COLORS.border}`, 

          color: COLORS.text, borderRadius:  

6, 

          padding: "7px 12px", fontFamily:  

"inherit", fontSize: 13, outline: "none", 

        }} 

      /> 

      {/* Send button */} 

      <button 

        onClick={onSend} 

        disabled={loading} 

        style={{ 

          background: loading ?  

COLORS.panel2 : COLORS.accent, 

          border: "none", borderRadius: 6, 

          color: loading ? COLORS.muted :  

"#0b0e14", 

          padding: "7px 20px", fontFamily:  

"inherit", 

          fontSize: 13, fontWeight: 700,  

cursor: loading ? "not-allowed" :  

"pointer", 

          boxShadow: loading ? "none" : `0  

0 12px ${COLORS.accent}55`, 

          transition: "all 0.15s", 

          whiteSpace: "nowrap", 

        }} 

      > 

        {loading ? " ⏳ Sending…" : " ▶  

Send"} 

      </button> 

    </div> 

----------------------- Page 12-----------------------

  ); 

} 

// ─── BODY EDITOR  

──────────────────────────────────── 

───────────────────────── 

function BodyEditor({ bodyType,  

setBodyType, body, setBody }) { 

  const types = ["none", "json", "form",  

"raw"]; 

  return ( 

    <div className="flex flex-col gap-3"> 

      {/* Type selector */} 

      <div className="flex gap-3" style={{  

flexWrap: "wrap" }}> 

        {types.map((t) => ( 

          <label key={t} style={{ display:  

"flex", alignItems: "center", gap: 6,  

cursor: "pointer", fontSize: 13, color:  

bodyType === t ? COLORS.accent :  

COLORS.muted }}> 

            <input 

              type="radio" name="bodyType"  

value={t} 

              checked={bodyType === t} 

              onChange={() =>  

setBodyType(t)} 

              style={{ accentColor:  

COLORS.accent }} 

            /> 

            {t} 

          </label> 

        ))} 

----------------------- Page 13-----------------------

      </div> 

      {/* Body textarea (hide for none) */} 

      {bodyType !== "none" && ( 

        <textarea 

          value={body} 

          onChange={(e) =>  

setBody(e.target.value)} 

          placeholder={bodyType === "json"  

? '{"key": "value"}' : bodyType === "form"  

? "key=value&other=thing" : "Raw body  

content"} 

          rows={8} 

          style={{ 

            background: COLORS.panel2,  

border: `1px solid ${COLORS.border}`, 

            color: COLORS.text,  

borderRadius: 6, padding: "10px 12px", 

            fontFamily: "inherit",  

fontSize: 13, resize: "vertical", 

            outline: "none", lineHeight:  

1.6, 

          }} 

        /> 

      )} 

    </div> 

  ); 

} 

// ─── CODE GEN TAB  

──────────────────────────────────── 

───────────────────────── 

function CodeGenTab({ buildPayload, baseUrl  

----------------------- Page 14-----------------------

}) { 

  const [lang, setLang] = useState("curl"); 

  const [code, setCode] = useState(null); 

  const [loading, setLoading] =  

useState(false); 

  const [copied, setCopied] =  

useState(false); 

  const [error, setError] = useState(null); 

  const generate = async () => { 

    setLoading(true); setError(null); 

    try { 

      const res = await  

fetch(`${baseUrl}/api/codegen`, { 

        method: "POST", 

        headers: { "Content-Type":  

"application/json" }, 

        body:  

JSON.stringify(buildPayload()), 

      }); 

      const d = await res.json(); 

      setCode(d); 

    } catch (e) { 

      setError(e.message); 

    } 

    setLoading(false); 

  }; 

  const copy = () => { 

    if (code?.[lang]) { 

       

navigator.clipboard.writeText(code[lang]); 

      setCopied(true); 

      setTimeout(() => setCopied(false),  

----------------------- Page 15-----------------------

1500); 

    } 

  }; 

  return ( 

    <div className="flex flex-col gap-3"> 

      <div className="flex gap-2 items- 

center flex-wrap"> 

        {["curl", "fetch", "axios"].map((l)  

=> ( 

          <button 

            key={l} 

            onClick={() => setLang(l)} 

            style={{ 

              background: lang === l ?  

COLORS.accent2 : COLORS.panel2, 

              border: `1px solid ${lang ===  

l ? COLORS.accent2 : COLORS.border}`, 

              color: lang === l ? "#0b0e14"  

: COLORS.muted, 

              borderRadius: 6, padding:  

"5px 14px", 

              fontFamily: "inherit",  

fontSize: 12, fontWeight: 600, 

              cursor: "pointer", 

            }} 

          >{l}</button> 

        ))} 

        <button 

          onClick={generate} 

          disabled={loading} 

          style={{ 

            background: COLORS.panel2,  

border: `1px solid ${COLORS.border}`, 

----------------------- Page 16-----------------------

            color: COLORS.accent,  

borderRadius: 6, padding: "5px 14px", 

            fontFamily: "inherit",  

fontSize: 12, cursor: "pointer",  

marginLeft: "auto", 

          }} 

        >{loading ? "Generating…" : "⚡  

Generate"}</button> 

        {code && ( 

          <button 

            onClick={copy} 

            style={{ 

              background: COLORS.panel2,  

border: `1px solid ${COLORS.border}`, 

              color: copied ? COLORS.accent  

: COLORS.muted, 

              borderRadius: 6, padding:  

"5px 14px", 

              fontFamily: "inherit",  

fontSize: 12, cursor: "pointer", 

            }} 

          >{copied ? "✓ Copied" : "Copy"} 

</button> 

        )} 

      </div> 

      {error && <div style={{ color:  

"#ff6b8a", fontSize: 13 }}>Error: {error} 

</div>} 

      {code && code[lang] && ( 

        <pre style={{ 

          background: COLORS.panel2,  

border: `1px solid ${COLORS.border}`, 

----------------------- Page 17-----------------------

          borderRadius: 8, padding: "14px  

16px", fontSize: 12, 

          color: COLORS.text, overflowX:  

"auto", lineHeight: 1.7, 

          margin: 0, whiteSpace: "pre- 

wrap", wordBreak: "break-all", 

        }}>{code[lang]}</pre> 

      )} 

      {!code && !loading && ( 

        <div style={{ color: COLORS.muted,  

fontSize: 13 }}>Click "Generate" to get  

code snippets for this request.</div> 

      )} 

    </div> 

  ); 

} 

// ─── REQUEST TABS  

──────────────────────────────────── 

──────────────────────── 

function RequestTabs({ params, setParams,  

headers, setHeaders, bodyType, setBodyType,  

body, setBody, buildPayload, baseUrl }) { 

  const [active, setActive] =  

useState("params"); 

  const tabs = ["params", "headers",  

"body", "code"]; 

  return ( 

    <div style={{ background: COLORS.panel,  

borderRadius: 8, border: `1px solid  

${COLORS.border}`, overflow: "hidden" }}> 

----------------------- Page 18-----------------------

      {/* Tab bar */} 

      <div className="flex" style={{  

borderBottom: `1px solid ${COLORS.border}`  

}}> 

        {tabs.map((t) => ( 

          <button 

            key={t} 

            onClick={() => setActive(t)} 

            style={{ 

              background: "none", border:  

"none", 

              borderBottom: active === t ?  

`2px solid ${COLORS.accent}` : "2px solid  

transparent", 

              color: active === t ?  

COLORS.accent : COLORS.muted, 

              padding: "10px 18px",  

fontFamily: "inherit", 

              fontSize: 13, fontWeight:  

active === t ? 600 : 400, 

              cursor: "pointer",  

textTransform: "capitalize", 

              transition: "color 0.15s", 

            }} 

          >{t}</button> 

        ))} 

      </div> 

      {/* Tab content */} 

      <div style={{ padding: "16px" }}> 

        {active === "params" && ( 

          <KeyValueEditor rows={params}  

onChange={setParams} placeholder="param" /> 

        )} 

----------------------- Page 19-----------------------

        {active === "headers" && ( 

          <KeyValueEditor rows={headers}  

onChange={setHeaders} placeholder="header"  

/> 

        )} 

        {active === "body" && ( 

          <BodyEditor bodyType={bodyType}  

setBodyType={setBodyType} body={body}  

setBody={setBody} /> 

        )} 

        {active === "code" && ( 

          <CodeGenTab buildPayload= 

{buildPayload} baseUrl={baseUrl} /> 

        )} 

      </div> 

    </div> 

  ); 

} 

// ─── RESPONSE PANEL  

──────────────────────────────────── 

────────────────────── 

function ResponsePanel({ response, loading  

}) { 

  const [rawView, setRawView] =  

useState(false); 

  if (loading) { 

    return ( 

      <div style={{ 

        background: COLORS.panel,  

borderRadius: 8, 

        border: `1px solid  

----------------------- Page 20-----------------------

${COLORS.border}`, padding: "32px", 

        display: "flex", alignItems:  

"center", justifyContent: "center", 

        color: COLORS.muted, fontSize: 13,  

gap: 10, 

      }}> 

        <span style={{ animation: "spin 1s  

linear infinite", display: "inline-block"  

}}>⏳</span> 

        Waiting for response… 

      </div> 

    ); 

  } 

  if (!response) { 

    return ( 

      <div style={{ 

        background: COLORS.panel,  

borderRadius: 8, 

        border: `1px solid  

${COLORS.border}`, padding: "32px", 

        display: "flex", flexDirection:  

"column", 

        alignItems: "center",  

justifyContent: "center", 

        color: COLORS.muted, fontSize: 13,  

gap: 8, minHeight: 160, 

      }}> 

        <span style={{ fontSize: 32  

}}>⚡</span> 

        <span>Send a request to see the  

response here.</span> 

      </div> 

    ); 

----------------------- Page 21-----------------------

  } 

  const { ok, status, statusText, headers,  

contentType, data, time, size,  

networkError, message } = response; 

  const isJson = typeof data === "object"  

&& data !== null; 

  return ( 

    <div style={{ background: COLORS.panel,  

borderRadius: 8, border: `1px solid  

${COLORS.border}`, overflow: "hidden" }}> 

      {/* Status bar */} 

      <div className="flex items-center  

gap-3 flex-wrap" style={{ padding: "10px  

16px", borderBottom: `1px solid  

${COLORS.border}`, background:  

COLORS.panel2 }}> 

        {networkError ? ( 

          <span style={{ color: "#ff6b8a",  

fontWeight: 700, fontSize: 13 }}>⚠ Network  

Error</span> 

        ) : ( 

          <> 

            <span style={{ 

              background:  

`${statusColor(status)}22`, 

              color: statusColor(status), 

              border: `1px solid  

${statusColor(status)}66`, 

              borderRadius: 6, padding:  

"2px 10px", 

              fontWeight: 700, fontSize:  

13, 

----------------------- Page 22-----------------------

            }}>{status} {statusText}</span> 

            <span style={{ color:  

COLORS.muted, fontSize: 12 }}>⏱  

{time}ms</span> 

            <span style={{ color:  

COLORS.muted, fontSize: 12 }}>📦  

{formatBytes(size)}</span> 

            {contentType && <span style={{  

color: COLORS.muted, fontSize: 12 }}> 

{contentType}</span>} 

          </> 

        )} 

        <div style={{ marginLeft: "auto",  

display: "flex", gap: 8 }}> 

          {!networkError && isJson && ( 

            <> 

              <button 

                onClick={() =>  

setRawView(false)} 

                style={{ 

                  background: !rawView ?  

COLORS.panel : "none", 

                  border: `1px solid  

${!rawView ? COLORS.accent :  

COLORS.border}`, 

                  color: !rawView ?  

COLORS.accent : COLORS.muted, 

                  borderRadius: 5, padding:  

"3px 10px", fontSize: 11, 

                  fontFamily: "inherit",  

cursor: "pointer", 

                }} 

              >Pretty</button> 

              <button 

----------------------- Page 23-----------------------

                onClick={() =>  

setRawView(true)} 

                style={{ 

                  background: rawView ?  

COLORS.panel : "none", 

                  border: `1px solid  

${rawView ? COLORS.accent :  

COLORS.border}`, 

                  color: rawView ?  

COLORS.accent : COLORS.muted, 

                  borderRadius: 5, padding:  

"3px 10px", fontSize: 11, 

                  fontFamily: "inherit",  

cursor: "pointer", 

                }} 

              >Raw</button> 

            </> 

          )} 

        </div> 

      </div> 

      {/* Response body */} 

      <div style={{ padding: "14px 16px",  

maxHeight: 420, overflowY: "auto" }}> 

        {networkError ? ( 

          <div style={{ color: "#ff6b8a",  

fontSize: 13 }}> 

            <div style={{ fontWeight: 600,  

marginBottom: 6 }}>Connection failed</div> 

            <div style={{ color:  

COLORS.muted }}>{message || statusText} 

</div> 

          </div> 

        ) : isJson && !rawView ? ( 

----------------------- Page 24-----------------------

          <pre style={{ margin: 0,  

fontSize: 13, lineHeight: 1.7, fontFamily:  

"inherit" }}> 

            <JsonNode data={data} /> 

          </pre> 

        ) : ( 

          <pre style={{ 

            margin: 0, fontSize: 13,  

lineHeight: 1.7, color: COLORS.text, 

            whiteSpace: "pre-wrap",  

wordBreak: "break-word", 

          }}> 

            {typeof data === "string" ?  

data : JSON.stringify(data, null, 2)} 

          </pre> 

        )} 

      </div> 

      {/* Response headers (collapsed) */} 

      {headers &&  

Object.keys(headers).length > 0 && ( 

        <details style={{ borderTop: `1px  

solid ${COLORS.border}` }}> 

          <summary style={{ 

            padding: "8px 16px", cursor:  

"pointer", 

            color: COLORS.muted, fontSize:  

12, userSelect: "none", 

          }}> 

            Response Headers  

({Object.keys(headers).length}) 

          </summary> 

          <div style={{ padding: "8px 16px  

12px" }}> 

----------------------- Page 25-----------------------

             

{Object.entries(headers).map(([k, v]) => ( 

              <div key={k} style={{  

fontSize: 12, marginBottom: 4, display:  

"flex", gap: 8 }}> 

                <span style={{ color:  

COLORS.accent2, minWidth: 180 }}>{k}</span> 

                <span style={{ color:  

COLORS.muted }}>{v}</span> 

              </div> 

            ))} 

          </div> 

        </details> 

      )} 

    </div> 

  ); 

} 

// ─── HISTORY SIDEBAR  

──────────────────────────────────── 

───────────────────── 

function HistorySidebar({ history,  

onSelect, onClear, collections,  

onSaveCollection, onSelectCollection,  

onExportCollections, onImportCollections })  

{ 

  const [activeTab, setActiveTab] =  

useState("history"); 

  const [colName, setColName] =  

useState(""); 

  const importRef = useRef(); 

  return ( 

----------------------- Page 26-----------------------

    <div style={{ 

      background: COLORS.panel,  

borderRight: `1px solid ${COLORS.border}`, 

      display: "flex", flexDirection:  

"column", width: 240, minWidth: 200, 

      flexShrink: 0, height: "100%", 

    }}> 

      {/* Sidebar tabs */} 

      <div className="flex" style={{  

borderBottom: `1px solid ${COLORS.border}`  

}}> 

        {["history", "collections"].map((t)  

=> ( 

          <button 

            key={t} 

            onClick={() => setActiveTab(t)} 

            style={{ 

              flex: 1, background: "none",  

border: "none", 

              borderBottom: activeTab === t  

? `2px solid ${COLORS.accent}` : "2px solid  

transparent", 

              color: activeTab === t ?  

COLORS.accent : COLORS.muted, 

              padding: "10px 0",  

fontFamily: "inherit", 

              fontSize: 12, fontWeight:  

600, 

              cursor: "pointer",  

textTransform: "capitalize", 

            }} 

          >{t}</button> 

        ))} 

      </div> 

----------------------- Page 27-----------------------

      {/* History tab */} 

      {activeTab === "history" && ( 

        <div className="flex flex-col"  

style={{ flex: 1, overflow: "hidden" }}> 

          <div style={{ 

            display: "flex",  

justifyContent: "space-between", 

            alignItems: "center", padding:  

"8px 12px", 

            borderBottom: `1px solid  

${COLORS.border}`, 

          }}> 

            <span style={{ color:  

COLORS.muted, fontSize: 11 }}>RECENT</span> 

            {history.length > 0 && ( 

              <button 

                onClick={onClear} 

                style={{ background:  

"none", border: "none", color: "#ff6b8a",  

fontSize: 11, cursor: "pointer",  

fontFamily: "inherit" }} 

              >Clear</button> 

            )} 

          </div> 

          <div style={{ overflowY: "auto",  

flex: 1 }}> 

            {history.length === 0 ? ( 

              <div style={{ padding: "16px  

12px", color: COLORS.muted, fontSize: 12,  

textAlign: "center" }}> 

                No history yet.<br />Send a  

request to start. 

              </div> 

----------------------- Page 28-----------------------

            ) : ( 

              history.map((item) => ( 

                <button 

                  key={item.id} 

                  onClick={() =>  

onSelect(item)} 

                  style={{ 

                    display: "block",  

width: "100%", textAlign: "left", 

                    background: "none",  

border: "none", 

                    borderBottom: `1px  

solid ${COLORS.border}`, 

                    padding: "8px 12px",  

cursor: "pointer", 

                  }} 

                  onMouseEnter={(e) =>  

e.currentTarget.style.background =  

COLORS.panel2} 

                  onMouseLeave={(e) =>  

e.currentTarget.style.background = "none"} 

                > 

                  <div style={{ display:  

"flex", alignItems: "center", gap: 6,  

marginBottom: 2 }}> 

                    <span style={{ 

                      color:  

METHOD_COLORS[item.method] || COLORS.muted, 

                      fontSize: 10,  

fontWeight: 700, minWidth: 40, 

                    }}>{item.method}</span> 

                    {item.status && ( 

                      <span style={{ 

                        fontSize: 10,  

----------------------- Page 29-----------------------

color: statusColor(item.status), 

                        background:  

`${statusColor(item.status)}22`, 

                        padding: "1px 5px",  

borderRadius: 3, 

                      }}>{item.status} 

</span> 

                    )} 

                  </div> 

                  <div style={{ 

                    color: COLORS.text,  

fontSize: 11, 

                    overflow: "hidden",  

textOverflow: "ellipsis", 

                    whiteSpace: "nowrap",  

maxWidth: "100%", 

                  }}>{item.url}</div> 

                </button> 

              )) 

            )} 

          </div> 

        </div> 

      )} 

      {/* Collections tab */} 

      {activeTab === "collections" && ( 

        <div className="flex flex-col"  

style={{ flex: 1, overflow: "hidden" }}> 

          <div style={{ padding: "10px  

12px", borderBottom: `1px solid  

${COLORS.border}` }}> 

            <div className="flex gap-2"> 

              <input 

                value={colName} 

----------------------- Page 30-----------------------

                onChange={(e) =>  

setColName(e.target.value)} 

                placeholder="Name…" 

                style={{ 

                  flex: 1, background:  

COLORS.panel2, border: `1px solid  

${COLORS.border}`, 

                  color: COLORS.text,  

borderRadius: 5, padding: "5px 8px", 

                  fontFamily: "inherit",  

fontSize: 12, outline: "none", 

                }} 

              /> 

              <button 

                onClick={() => {  

onSaveCollection(colName); setColName("");  

}} 

                disabled={!colName.trim()} 

                style={{ 

                  background:  

COLORS.accent, border: "none", 

                  color: "#0b0e14",  

borderRadius: 5, padding: "5px 10px", 

                  fontSize: 12, fontWeight:  

700, cursor: "pointer", fontFamily:  

"inherit", 

                }} 

              >Save</button> 

            </div> 

            <div className="flex gap-2"  

style={{ marginTop: 6 }}> 

              <button 

                onClick= 

{onExportCollections} 

----------------------- Page 31-----------------------

                style={{ 

                  flex: 1, background:  

COLORS.panel2, border: `1px solid  

${COLORS.border}`, 

                  color: COLORS.muted,  

borderRadius: 5, padding: "5px 0", 

                  fontSize: 11, cursor:  

"pointer", fontFamily: "inherit", 

                }} 

              >↓ Export</button> 

              <button 

                onClick={() =>  

importRef.current?.click()} 

                style={{ 

                  flex: 1, background:  

COLORS.panel2, border: `1px solid  

${COLORS.border}`, 

                  color: COLORS.muted,  

borderRadius: 5, padding: "5px 0", 

                  fontSize: 11, cursor:  

"pointer", fontFamily: "inherit", 

                }} 

              >↑ Import</button> 

              <input 

                ref={importRef} 

                type="file" accept=".json" 

                style={{ display: "none" }} 

                onChange={(e) => { 

                  const file =  

e.target.files?.[0]; 

                  if (!file) return; 

                  const reader = new  

FileReader(); 

                  reader.onload = (ev) =>  

----------------------- Page 32-----------------------

onImportCollections(ev.target.result); 

                  reader.readAsText(file); 

                  e.target.value = ""; 

                }} 

              /> 

            </div> 

          </div> 

          <div style={{ overflowY: "auto",  

flex: 1 }}> 

            {collections.length === 0 ? ( 

              <div style={{ padding: "16px  

12px", color: COLORS.muted, fontSize: 12,  

textAlign: "center" }}> 

                No saved requests.<br  

/>Save one above. 

              </div> 

            ) : ( 

              collections.map((item) => ( 

                <button 

                  key={item.id} 

                  onClick={() =>  

onSelectCollection(item)} 

                  style={{ 

                    display: "block",  

width: "100%", textAlign: "left", 

                    background: "none",  

border: "none", 

                    borderBottom: `1px  

solid ${COLORS.border}`, 

                    padding: "8px 12px",  

cursor: "pointer", 

                  }} 

                  onMouseEnter={(e) =>  

e.currentTarget.style.background =  

----------------------- Page 33-----------------------

COLORS.panel2} 

                  onMouseLeave={(e) =>  

e.currentTarget.style.background = "none"} 

                > 

                  <div style={{ color:  

COLORS.accent2, fontSize: 11, fontWeight:  

600, marginBottom: 2 }}>{item.name}</div> 

                  <div style={{ display:  

"flex", alignItems: "center", gap: 6 }}> 

                    <span style={{ color:  

METHOD_COLORS[item.method] || COLORS.muted,  

fontSize: 10, fontWeight: 700 }}> 

{item.method}</span> 

                    <span style={{ color:  

COLORS.muted, fontSize: 10, overflow:  

"hidden", textOverflow: "ellipsis",  

whiteSpace: "nowrap" }}>{item.url}</span> 

                  </div> 

                </button> 

              )) 

            )} 

          </div> 

        </div> 

      )} 

    </div> 

  ); 

} 

// ─── MAIN APP  

──────────────────────────────────── 

──────────────────────────── 

export default function App() { 

  // Request state 

----------------------- Page 34-----------------------

  const [method, setMethod] =  

useState("GET"); 

  const [url, setUrl] =  

useState("https://jsonplaceholder.typicode. 

com/posts/1"); 

  const [params, setParams] =  

useState([emptyKV()]); 

  const [headers, setHeaders] =  

useState([emptyKV()]); 

  const [bodyType, setBodyType] =  

useState("none"); 

  const [body, setBody] = useState(""); 

  // Response state 

  const [response, setResponse] =  

useState(null); 

  const [loading, setLoading] =  

useState(false); 

  // Persistence 

  const [history, setHistory] = useState(()  

=> lsGet("api-playground-history", [])); 

  const [collections, setCollections] =  

useState(() => lsGet("api-playground- 

collections", [])); 

  const [baseUrl, setBaseUrl] = useState(()  

=> lsGet("api-playground-base",  

DEFAULT_BASE)); 

  // Persist history 

  useEffect(() => lsSet("api-playground- 

history", history), [history]); 

  useEffect(() => lsSet("api-playground- 

collections", collections), [collections]); 

----------------------- Page 35-----------------------

  useEffect(() => lsSet("api-playground- 

base", baseUrl), [baseUrl]); 

  // Build request payload for the proxy 

  const buildPayload = useCallback(() => { 

    let parsedBody = body; 

    if (bodyType === "json") { 

      try { parsedBody = JSON.parse(body);  

} catch { /* send raw */ } 

    } 

    return { 

      method, 

      url, 

      headers: kvToObj(headers), 

      params: kvToObj(params), 

      body: bodyType === "none" ? undefined  

: parsedBody, 

      bodyType, 

    }; 

  }, [method, url, headers, params, body,  

bodyType]); 

  // Send request 

  const handleSend = useCallback(async ()  

=> { 

    if (!url.trim()) return; 

    setLoading(true); 

    setResponse(null); 

    let result = null; 

    try { 

      const res = await  

fetch(`${baseUrl}/api/proxy`, { 

        method: "POST", 

        headers: { "Content-Type":  

----------------------- Page 36-----------------------

"application/json" }, 

        body:  

JSON.stringify(buildPayload()), 

      }); 

      result = await res.json(); 

      setResponse(result); 

    } catch (e) { 

      result = { ok: false, networkError:  

true, status: 0, statusText: "Connection  

failed", message: e.message, time: 0 }; 

      setResponse(result); 

    } 

    // Add to history 

    const entry = { 

      id: uid(), 

      method, url, 

      params: [...params], 

      headers: [...headers], 

      body, bodyType, 

      status: result?.status, 

      ts: Date.now(), 

    }; 

    setHistory((h) => [entry,  

...h].slice(0, MAX_HISTORY)); 

    setLoading(false); 

  }, [baseUrl, buildPayload, method, url,  

params, headers, body, bodyType]); 

  // Restore a history/collection entry 

  const restoreRequest = (item) => { 

    setMethod(item.method); 

    setUrl(item.url); 

    setParams(item.params?.length ?  

----------------------- Page 37-----------------------

item.params : [emptyKV()]); 

    setHeaders(item.headers?.length ?  

item.headers : [emptyKV()]); 

    setBody(item.body || ""); 

    setBodyType(item.bodyType || "none"); 

    setResponse(null); 

  }; 

  // Collections 

  const saveCollection = (name) => { 

    if (!name.trim()) return; 

    const entry = { 

      id: uid(), name: name.trim(), 

      method, url, 

      params: [...params], headers:  

[...headers], 

      body, bodyType, 

    }; 

    setCollections((c) => [entry, ...c]); 

  }; 

  const exportCollections = () => { 

    const blob = new  

Blob([JSON.stringify(collections, null,  

2)], { type: "application/json" }); 

    const a = document.createElement("a"); 

    a.href = URL.createObjectURL(blob); 

    a.download = "api-playground- 

collections.json"; 

    a.click(); 

  }; 

  const importCollections = (text) => { 

    try { 

----------------------- Page 38-----------------------

      const parsed = JSON.parse(text); 

      if (Array.isArray(parsed)) { 

        setCollections((c) =>  

[...parsed.map(i => ({ ...i, id: uid() })),  

...c]); 

      } 

    } catch { alert("Invalid JSON file"); } 

  }; 

  return ( 

    <div style={{ 

      background: COLORS.bg, color:  

COLORS.text, 

      minHeight: "100vh", fontFamily:  

"'JetBrains Mono', 'SF Mono', 'Fira Mono',  

'Consolas', monospace", 

      display: "flex", flexDirection:  

"column", 

    }}> 

      {/* Global keyframe for spin */} 

      <style>{` 

        @import  

url('https://fonts.googleapis.com/css2? 

family=JetBrains+Mono:wght@400;600;700&disp 

lay=swap'); 

        @keyframes spin { to { transform:  

rotate(360deg); } } 

        * { box-sizing: border-box; } 

        ::-webkit-scrollbar { width: 6px;  

height: 6px; } 

        ::-webkit-scrollbar-track {  

background: ${COLORS.panel}; } 

        ::-webkit-scrollbar-thumb {  

background: ${COLORS.border}; border- 

----------------------- Page 39-----------------------

radius: 3px; } 

        ::-webkit-scrollbar-thumb:hover {  

background: ${COLORS.muted}; } 

        select option { background:  

${COLORS.panel2}; color: ${COLORS.text}; } 

        details summary::-webkit-details- 

marker { color: ${COLORS.muted}; } 

      `}</style> 

      {/* Top nav / header */} 

      <div style={{ 

        background: COLORS.panel,  

borderBottom: `1px solid ${COLORS.border}`, 

        padding: "10px 20px", display:  

"flex", alignItems: "center", gap: 16, 

        flexWrap: "wrap", 

      }}> 

        <div style={{ display: "flex",  

alignItems: "center", gap: 10 }}> 

          <span style={{ fontSize: 18,  

color: COLORS.accent }}>⚡</span> 

          <span style={{ fontWeight: 700,  

fontSize: 16, color: COLORS.text,  

letterSpacing: "-0.5px" }}> 

            API <span style={{ color:  

COLORS.accent }}>Playground</span> 

          </span> 

        </div> 

        <div style={{ marginLeft: "auto",  

display: "flex", alignItems: "center", gap:  

8 }}> 

          <label style={{ color:  

COLORS.muted, fontSize: 11, whiteSpace:  

----------------------- Page 40-----------------------

"nowrap" }}>Backend URL</label> 

          <input 

            value={baseUrl} 

            onChange={(e) =>  

setBaseUrl(e.target.value)} 

            placeholder={DEFAULT_BASE} 

            style={{ 

              background: COLORS.panel2,  

border: `1px solid ${COLORS.border}`, 

              color: COLORS.text,  

borderRadius: 6, padding: "4px 10px", 

              fontFamily: "inherit",  

fontSize: 12, outline: "none", width: 220, 

            }} 

          /> 

        </div> 

      </div> 

      {/* Main layout */} 

      <div style={{ display: "flex", flex:  

1, overflow: "hidden", height: "calc(100vh  

- 53px)" }}> 

        {/* Left sidebar */} 

        <HistorySidebar 

          history={history} 

          onSelect={restoreRequest} 

          onClear={() => setHistory([])} 

          collections={collections} 

          onSaveCollection={saveCollection} 

          onSelectCollection= 

{restoreRequest} 

          onExportCollections= 

{exportCollections} 

----------------------- Page 41-----------------------

          onImportCollections= 

{importCollections} 

        /> 

        {/* Main column */} 

        <div style={{ flex: 1, display:  

"flex", flexDirection: "column", overflow:  

"hidden" }}> 

          {/* URL bar */} 

          <div style={{ background:  

COLORS.panel, borderBottom: `1px solid  

${COLORS.border}` }}> 

            <UrlBar 

              method={method} setMethod= 

{setMethod} 

              url={url} setUrl={setUrl} 

              onSend={handleSend} loading= 

{loading} 

            /> 

          </div> 

          {/* Scrollable request + response  

area */} 

          <div style={{ flex: 1, overflowY:  

"auto", padding: "14px 16px", display:  

"flex", flexDirection: "column", gap: 14  

}}> 

            {/* Request tabs */} 

            <RequestTabs 

              params={params} setParams= 

{setParams} 

              headers={headers} setHeaders= 

{setHeaders} 

              bodyType={bodyType}  

----------------------- Page 42-----------------------

setBodyType={setBodyType} 

              body={body} setBody={setBody} 

              buildPayload={buildPayload} 

              baseUrl={baseUrl} 

            /> 

            {/* Response panel */} 

            <div> 

              <div style={{ color:  

COLORS.muted, fontSize: 11, fontWeight:  

600, letterSpacing: 1, marginBottom: 8  

}}>RESPONSE</div> 

              <ResponsePanel response= 

{response} loading={loading} /> 

            </div> 

          </div> 

        </div> 

      </div> 

    </div> 

  ); 

} 
