var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// vendor/@qubitcoin/sdk/dist/index.js
var dist_exports = {};
__export(dist_exports, {
  DevnetTestHarness: () => DevnetTestHarness,
  IndexerRuntime: () => IndexerRuntime,
  LuaRuntime: () => LuaRuntime,
  QubitcoinNode: () => QubitcoinNode,
  getScript: () => getScript,
  preloadLuaScripts: () => preloadLuaScripts,
  saveScript: () => saveScript
});
module.exports = __toCommonJS(dist_exports);

// ../../../tmp/meta-polyfill.js
var __import_meta_url2 = require("url").pathToFileURL(__filename).href;

// vendor/@qubitcoin/sdk/dist/node.js
var DEFAULT_SECRET_KEY = new Uint8Array(32).fill(1);
var QubitcoinNode = class _QubitcoinNode {
  devnet;
  constructor(devnet) {
    this.devnet = devnet;
  }
  /**
   * Create and initialize a new in-process regtest node.
   *
   * Automatically loads the WASM module, creates a chain with a genesis
   * block, and returns a ready-to-use node.
   */
  static async create(config) {
    const wasm = await import("./wasm/qubitcoin_web_sys.js");
    await wasm.default();
    const key = config?.secretKey ?? DEFAULT_SECRET_KEY;
    const devnet = new wasm.QubitcoinDevnet(key);
    return new _QubitcoinNode(devnet);
  }
  // -- Chain state --------------------------------------------------------
  /** Current chain tip height (0 = genesis only). */
  get height() {
    return this.devnet.height;
  }
  /** Tip block hash as hex string. */
  get tipHash() {
    return this.devnet.tipHashHex;
  }
  /** Tip block hash as raw bytes. */
  get tipHashBytes() {
    return this.devnet.tipHash;
  }
  /** Number of UTXOs in the in-memory set. */
  get utxoCount() {
    return this.devnet.utxoCount;
  }
  /** Coinbase public key (33-byte compressed). */
  get coinbasePubkey() {
    return this.devnet.coinbasePubkey;
  }
  /** Number of mature (spendable) coinbase outputs. */
  get matureCoinbaseCount() {
    return this.devnet.matureCoinbaseCount;
  }
  // -- Mining -------------------------------------------------------------
  /** Mine a single empty block. Returns the mined block. */
  mineBlock() {
    const data = this.devnet.mineBlock();
    return {
      height: this.devnet.height,
      hash: this.devnet.tipHashHex,
      data
    };
  }
  /** Mine `count` empty blocks. Returns the last mined block. */
  mineBlocks(count) {
    const data = this.devnet.mineBlocks(count);
    return {
      height: this.devnet.height,
      hash: this.devnet.tipHashHex,
      data
    };
  }
  /**
   * Mine a block containing the given transactions.
   *
   * Each transaction must be in Bitcoin wire format (Uint8Array).
   */
  mineBlockWithTxs(rawTxs) {
    const data = this.devnet.mineBlockWithTxs(rawTxs);
    return {
      height: this.devnet.height,
      hash: this.devnet.tipHashHex,
      data
    };
  }
  // -- Block queries ------------------------------------------------------
  /** Get a block by height, or `null` if out of range. */
  getBlock(height) {
    const data = this.devnet.getBlock(height);
    if (data === null)
      return null;
    const hash = this.devnet.getBlockHash(height);
    return { height, hash, data };
  }
  /** Get the block hash at a given height as hex, or `null`. */
  getBlockHash(height) {
    return this.devnet.getBlockHash(height);
  }
  // -- Transaction helpers ------------------------------------------------
  /**
   * Create a simple transaction spending a UTXO.
   *
   * Returns the raw serialized transaction (Bitcoin wire format).
   * Change (minus 1000-sat fee) goes back to the coinbase address.
   */
  createTransaction(txid, vout, valueSat, destScript) {
    return this.devnet.createTransaction(txid, vout, valueSat, destScript);
  }
  /**
   * Find the first spendable (mature, unspent) coinbase output.
   *
   * Returns `null` if no coinbase is mature yet (need 100 confirmations).
   */
  getSpendableOutput() {
    return this.devnet.getSpendableOutput();
  }
  // -- UTXO queries -------------------------------------------------------
  /** Check whether a UTXO exists in the set. */
  hasUtxo(txid, vout) {
    return this.devnet.hasUtxo(txid, vout);
  }
  /** Get a UTXO's value in satoshis, or `null` if not found. */
  getUtxoValue(txid, vout) {
    return this.devnet.getUtxoValue(txid, vout);
  }
  // -- Crypto helpers -----------------------------------------------------
  /** Build a P2PKH locking script from a 20-byte pubkey hash. */
  static buildP2pkhScript(pubkeyHash) {
    const wasm = globalThis.__qubitcoin_wasm;
    if (wasm)
      return wasm.QubitcoinDevnet.buildP2pkhScript(pubkeyHash);
    throw new Error("Call QubitcoinNode.create() before using static helpers");
  }
  /** Derive a compressed public key (33 bytes) from a 32-byte secret key. */
  static pubkeyFromSecret(secretKey) {
    const wasm = globalThis.__qubitcoin_wasm;
    if (wasm)
      return wasm.QubitcoinDevnet.pubkeyFromSecret(secretKey);
    throw new Error("Call QubitcoinNode.create() before using static helpers");
  }
  /** Compute Hash160 (RIPEMD160(SHA256(data))). */
  static hash160(data) {
    const wasm = globalThis.__qubitcoin_wasm;
    if (wasm)
      return wasm.QubitcoinDevnet.hash160(data);
    throw new Error("Call QubitcoinNode.create() before using static helpers");
  }
  /** Release WASM resources. Call when done with the node. */
  dispose() {
    this.devnet.free();
  }
};

// vendor/@qubitcoin/sdk/dist/indexer.js
var IndexerRuntime = class _IndexerRuntime {
  inner;
  constructor(inner) {
    this.inner = inner;
  }
  /**
   * Load and compile a WASM indexer module from bytes.
   *
   * The module must export a `_start()` function (metashrew ABI).
   */
  static async load(wasmBytes) {
    const wasm = await import("./wasm/qubitcoin_web_sys.js");
    await wasm.default();
    const inner = new wasm.SecondaryIndexer(wasmBytes);
    return new _IndexerRuntime(inner);
  }
  /** Current indexer tip height. */
  get height() {
    return this.inner.height;
  }
  /**
   * Feed a block to the indexer for processing.
   *
   * The block must be in Bitcoin wire format (the same bytes returned
   * by `QubitcoinNode.mineBlock().data`).
   */
  processBlock(blockData) {
    this.inner.processBlock(blockData);
  }
  /**
   * Call a named view function on the indexer.
   *
   * `height` is the block height context for the view call.
   * Returns the raw result bytes. Interpretation depends on the
   * specific indexer module.
   */
  callView(name, height, input) {
    return this.inner.callView(name, height, input);
  }
  /** Compute the sparse Merkle tree state root. */
  stateRoot() {
    return this.inner.stateRoot();
  }
  /**
   * Roll back the indexer state to a previous height.
   *
   * Returns the number of deleted entries.
   */
  rollbackTo(targetHeight) {
    return this.inner.rollbackTo(targetHeight);
  }
  /** Release WASM resources. */
  dispose() {
    this.inner.free();
  }
};

// vendor/@qubitcoin/sdk/dist/lua-runtime.js
var import_wasmoon = require("wasmoon");
var import_crypto = require("crypto");
var import_fs = require("fs");
var import_path = require("path");
var LUA_JSON_LIB = `
local __json = {}

-- Decode JSON string to native Lua table
function __json.decode(str)
  if str == nil or str == "" then return nil end
  local pos = 1

  local function skip_ws()
    pos = str:match("^%s*()", pos)
  end

  local function peek()
    skip_ws()
    return str:sub(pos, pos)
  end

  local decode_value -- forward declaration

  local function decode_string()
    pos = pos + 1 -- skip opening quote
    local parts = {}
    while pos <= #str do
      local c = str:sub(pos, pos)
      if c == '"' then
        pos = pos + 1
        return table.concat(parts)
      elseif c == '\\\\' then
        pos = pos + 1
        local esc = str:sub(pos, pos)
        if esc == '"' or esc == '\\\\' or esc == '/' then
          parts[#parts + 1] = esc
        elseif esc == 'n' then parts[#parts + 1] = '\\n'
        elseif esc == 'r' then parts[#parts + 1] = '\\r'
        elseif esc == 't' then parts[#parts + 1] = '\\t'
        elseif esc == 'b' then parts[#parts + 1] = '\\b'
        elseif esc == 'f' then parts[#parts + 1] = '\\f'
        elseif esc == 'u' then
          local hex = str:sub(pos + 1, pos + 4)
          pos = pos + 4
          local code = tonumber(hex, 16)
          if code then
            if code < 128 then
              parts[#parts + 1] = string.char(code)
            else
              parts[#parts + 1] = '?' -- simplified; non-ASCII as ?
            end
          end
        end
        pos = pos + 1
      else
        parts[#parts + 1] = c
        pos = pos + 1
      end
    end
    error("unterminated string")
  end

  local function decode_number()
    local start = pos
    if str:sub(pos, pos) == '-' then pos = pos + 1 end
    while pos <= #str and str:sub(pos, pos):match('[0-9]') do pos = pos + 1 end
    if pos <= #str and str:sub(pos, pos) == '.' then
      pos = pos + 1
      while pos <= #str and str:sub(pos, pos):match('[0-9]') do pos = pos + 1 end
    end
    if pos <= #str and str:sub(pos, pos):match('[eE]') then
      pos = pos + 1
      if pos <= #str and str:sub(pos, pos):match('[+-]') then pos = pos + 1 end
      while pos <= #str and str:sub(pos, pos):match('[0-9]') do pos = pos + 1 end
    end
    return tonumber(str:sub(start, pos - 1))
  end

  local function decode_array()
    pos = pos + 1 -- skip [
    local arr = {}
    skip_ws()
    if str:sub(pos, pos) == ']' then
      pos = pos + 1
      return arr
    end
    while true do
      arr[#arr + 1] = decode_value()
      skip_ws()
      local c = str:sub(pos, pos)
      if c == ']' then
        pos = pos + 1
        return arr
      elseif c == ',' then
        pos = pos + 1
      else
        error("expected ',' or ']' at position " .. pos)
      end
    end
  end

  local function decode_object()
    pos = pos + 1 -- skip {
    local obj = {}
    skip_ws()
    if str:sub(pos, pos) == '}' then
      pos = pos + 1
      return obj
    end
    while true do
      skip_ws()
      local key = decode_string()
      skip_ws()
      if str:sub(pos, pos) ~= ':' then error("expected ':' at position " .. pos) end
      pos = pos + 1
      obj[key] = decode_value()
      skip_ws()
      local c = str:sub(pos, pos)
      if c == '}' then
        pos = pos + 1
        return obj
      elseif c == ',' then
        pos = pos + 1
      else
        error("expected ',' or '}' at position " .. pos)
      end
    end
  end

  function decode_value()
    skip_ws()
    local c = str:sub(pos, pos)
    if c == '"' then return decode_string()
    elseif c == '{' then return decode_object()
    elseif c == '[' then return decode_array()
    elseif c == 't' then pos = pos + 4; return true
    elseif c == 'f' then pos = pos + 5; return false
    elseif c == 'n' then pos = pos + 4; return nil
    elseif c == '-' or c:match('[0-9]') then return decode_number()
    else error("unexpected character '" .. c .. "' at position " .. pos)
    end
  end

  return decode_value()
end

-- Encode Lua value to JSON string
function __json.encode(val)
  if val == nil then return "null" end
  local t = type(val)
  if t == "boolean" then return val and "true" or "false" end
  if t == "number" then
    if val ~= val then return "null" end -- NaN
    if val == math.huge or val == -math.huge then return "null" end
    if val == math.floor(val) and math.abs(val) < 2^53 then
      return string.format("%.0f", val)
    end
    return tostring(val)
  end
  if t == "string" then
    val = val:gsub('\\\\', '\\\\\\\\'):gsub('"', '\\\\"'):gsub('\\n', '\\\\n'):gsub('\\r', '\\\\r'):gsub('\\t', '\\\\t')
    return '"' .. val .. '"'
  end
  if t == "table" then
    -- Check if it's an array (sequential integer keys starting from 1)
    local n = #val
    local is_array = true
    if n == 0 then
      -- Check if table has any keys
      if next(val) ~= nil then
        is_array = false
      end
    else
      for k in pairs(val) do
        if type(k) ~= "number" or k < 1 or k > n or k ~= math.floor(k) then
          is_array = false
          break
        end
      end
    end

    if is_array then
      local parts = {}
      for i = 1, n do
        parts[i] = __json.encode(val[i])
      end
      return "[" .. table.concat(parts, ",") .. "]"
    else
      local parts = {}
      for k, v in pairs(val) do
        parts[#parts + 1] = __json.encode(tostring(k)) .. ":" .. __json.encode(v)
      end
      return "{" .. table.concat(parts, ",") .. "}"
    end
  end
  return "null"
end
`;
var LUA_SETUP_SCRIPT = `
-- Decode args from JSON to get native Lua tables
args = __json.decode(__args_json)

-- Set up _RPC table with metatable for dynamic dispatch
_RPC = setmetatable({}, {
  __index = function(t, method)
    local fn = function(...)
      local call_args = {...}
      local args_json = __json.encode(call_args)
      local resp_json = __call_rpc(method, args_json)
      local resp = __json.decode(resp_json)
      if resp.error then
        return nil
      end
      return resp.result
    end
    rawset(t, method, fn)
    return fn
  end
})
`;
var scriptStore = /* @__PURE__ */ new Map();
function sha256(content) {
  return (0, import_crypto.createHash)("sha256").update(content, "utf8").digest("hex");
}
function preloadLuaScripts(luaDir) {
  const scripts = [
    "balances.lua",
    "spendable_utxos.lua",
    "multicall.lua",
    "batch_utxo_balances.lua",
    "address_utxos_with_txs.lua"
  ];
  for (const name of scripts) {
    const filePath = (0, import_path.resolve)(luaDir, name);
    if ((0, import_fs.existsSync)(filePath)) {
      const content = (0, import_fs.readFileSync)(filePath, "utf8");
      const hash = sha256(content);
      scriptStore.set(hash, content);
    }
  }
}
function saveScript(content) {
  const hash = sha256(content);
  scriptStore.set(hash, content);
  return hash;
}
function getScript(hash) {
  return scriptStore.get(hash);
}
var LuaRuntime = class _LuaRuntime {
  factory;
  rpcHandler;
  constructor(factory, rpcHandler) {
    this.factory = factory;
    this.rpcHandler = rpcHandler;
  }
  static async create(rpcHandler) {
    const factory = new import_wasmoon.LuaFactory();
    return new _LuaRuntime(factory, rpcHandler);
  }
  /**
   * Execute a Lua script with arguments.
   *
   * The script receives `args` as a global Lua table, and has access to
   * `_RPC` table where each method routes back to the devnet RPC handler.
   *
   * Returns the script's return value (serialized as JSON-compatible JS value).
   */
  async executeScript(scriptContent, args) {
    const startTime = Date.now();
    let callCount = 0;
    let engine = null;
    try {
      engine = await this.factory.createEngine({
        openStandardLibs: true
        // injectObjects: false — we handle all data marshalling through JSON
        // strings because wasmoon converts JS objects to Lua userdata which
        // doesn't support ipairs/# properly.
      });
      engine.global.set("__args_json", JSON.stringify(args));
      const rpcHandler = this.rpcHandler;
      engine.global.set("__call_rpc", (method, argsJson) => {
        callCount++;
        const fnArgs = JSON.parse(argsJson);
        const requestJson = JSON.stringify({
          jsonrpc: "2.0",
          method,
          params: fnArgs,
          id: callCount
        });
        const responseJson = rpcHandler(requestJson);
        return responseJson;
      });
      const setupScript = LUA_JSON_LIB + `
` + LUA_SETUP_SCRIPT;
      await engine.doString(setupScript);
      const wrappedScript = `return (function()
${scriptContent}
end)()`;
      const result = await engine.doString(wrappedScript);
      return {
        calls: callCount,
        returns: luaToJs(result),
        runtime: Date.now() - startTime
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        calls: callCount,
        returns: null,
        runtime: Date.now() - startTime,
        error: message
      };
    } finally {
      if (engine) {
        engine.global.close();
      }
    }
  }
  /**
   * Execute a saved script by hash.
   */
  async executeSaved(hash, args) {
    const content = scriptStore.get(hash);
    if (!content) {
      return {
        calls: 0,
        returns: null,
        runtime: 0,
        error: `Script not found for hash: ${hash}`
      };
    }
    return this.executeScript(content, args);
  }
};
function luaToJs(value) {
  if (value === null || value === void 0)
    return null;
  if (typeof value === "number" || typeof value === "string" || typeof value === "boolean") {
    return value;
  }
  if (value instanceof Map) {
    const keys = Array.from(value.keys());
    if (keys.length === 0) {
      return [];
    }
    const isArray = keys.every((k, i) => k === i + 1);
    if (isArray) {
      return keys.map((k) => luaToJs(value.get(k)));
    }
    const obj = {};
    for (const [k, v] of value.entries()) {
      obj[String(k)] = luaToJs(v);
    }
    return obj;
  }
  if (Array.isArray(value)) {
    return value.map(luaToJs);
  }
  if (typeof value === "object") {
    const entries = Object.entries(value);
    if (entries.length === 0) {
      return [];
    }
    const isArray = entries.every(([k], i) => String(i + 1) === k);
    if (isArray) {
      return entries.map(([, v]) => luaToJs(v));
    }
    const obj = {};
    for (const [k, v] of entries) {
      obj[k] = luaToJs(v);
    }
    return obj;
  }
  return value;
}

// vendor/@qubitcoin/sdk/dist/devnet-server.js
var DEFAULT_SECRET_KEY2 = new Uint8Array(32).fill(1);
var DEFAULT_INTERCEPT_URLS = [
  "http://localhost:18888",
  "http://127.0.0.1:18888",
  "http://localhost:8080"
];
function toHex(bytes) {
  const hex = [];
  for (let i = 0; i < bytes.length; i++) {
    hex.push(bytes[i].toString(16).padStart(2, "0"));
  }
  return hex.join("");
}
function fromHex(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}
var LUA_METHODS = /* @__PURE__ */ new Set([
  "lua_evalscript",
  "lua_evalsaved",
  "lua_savescript",
  "sandshrew_evalscript",
  "sandshrew_evalsaved",
  "sandshrew_savescript"
]);
var DevnetTestHarness = class _DevnetTestHarness {
  server;
  originalFetch = null;
  interceptUrls;
  luaRuntime = null;
  luaInitPromise = null;
  constructor(server, interceptUrls) {
    this.server = server;
    this.interceptUrls = interceptUrls;
  }
  /**
   * Create a new devnet test harness.
   *
   * Loads the WASM modules and creates the in-process chain + indexers.
   * Optionally initializes the Lua runtime for script execution.
   */
  static async create(opts) {
    const wasm = await import("./wasm/qubitcoin_web_sys.js");
    if (typeof process !== "undefined" && process.versions?.node) {
      const { readFileSync: readFileSync2 } = await import("fs");
      const { fileURLToPath } = await import("url");
      const { dirname, resolve: resolve2 } = await import("path");
      const wasmJsUrl = new URL("./wasm/qubitcoin_web_sys_bg.wasm", __import_meta_url);
      let wasmPath;
      try {
        wasmPath = fileURLToPath(wasmJsUrl);
      } catch {
        const thisDir = dirname(fileURLToPath(__import_meta_url));
        wasmPath = resolve2(thisDir, "wasm", "qubitcoin_web_sys_bg.wasm");
      }
      const wasmBytes = readFileSync2(wasmPath);
      await wasm.default(wasmBytes);
    } else {
      await wasm.default();
    }
    const secretKey = opts.secretKey ?? DEFAULT_SECRET_KEY2;
    const esploraArr = opts.esploraWasm ? new Uint8Array(opts.esploraWasm) : void 0;
    const server = new wasm.DevnetServer(secretKey, opts.alkanesWasm, esploraArr);
    if (opts.additionalSecondaries) {
      for (const si of opts.additionalSecondaries) {
        server.addSecondary(si.label, si.wasm);
      }
    }
    if (opts.tertiaryIndexers) {
      for (const ti of opts.tertiaryIndexers) {
        server.addTertiary(ti.label, ti.wasm);
      }
    }
    const harness = new _DevnetTestHarness(server, opts.interceptUrls ?? DEFAULT_INTERCEPT_URLS);
    harness.luaInitPromise = harness.initLuaRuntime(opts.luaScriptsDir);
    return harness;
  }
  /** Current chain height. */
  get height() {
    return this.server.height;
  }
  /** Current alkanes indexer height. */
  get indexerHeight() {
    return this.server.indexerHeight;
  }
  /** Tip block hash as hex. */
  get tipHashHex() {
    return this.server.tipHashHex;
  }
  /** Mine N empty blocks and auto-index through all indexers. */
  mineBlocks(count) {
    this.server.mineBlocks(count);
  }
  /**
   * Mine a block with extra outputs in the coinbase transaction.
   *
   * This is metaprotocol-agnostic — pass raw TxOut data as hex.
   * Format: repeated [8-byte LE value][2-byte LE script_len][script_bytes]
   *
   * Example: to add a 546-sat P2TR output to coinbase:
   *   const value = Buffer.alloc(8); value.writeBigInt64LE(546n);
   *   const script = bitcoin.address.toOutputScript(addr, network);
   *   const scriptLen = Buffer.alloc(2); scriptLen.writeUInt16LE(script.length);
   *   const hex = Buffer.concat([value, scriptLen, script]).toString('hex');
   *   harness.mineBlockWithCoinbaseOutputs(hex);
   */
  mineBlockWithCoinbaseOutputs(extraOutputsHex) {
    this.server.mineBlockWithCoinbaseOutputs(extraOutputsHex);
  }
  /**
   * Process a JSON-RPC request and return the response.
   *
   * Lua methods (lua_evalscript, lua_evalsaved, etc.) are handled by the
   * wasmoon runtime. All other methods are dispatched to the Rust WASM backend.
   */
  handleRpc(requestJson) {
    let parsed;
    try {
      parsed = JSON.parse(requestJson);
    } catch {
      return this.server.handleRpc(requestJson);
    }
    if (parsed.method && LUA_METHODS.has(parsed.method)) {
      return this.server.handleRpc(requestJson);
    }
    return this.server.handleRpc(requestJson);
  }
  /**
   * Install a fetch interceptor that routes JSON-RPC POST requests
   * to the in-process devnet server.
   *
   * After calling this, any `fetch()` to the intercepted URLs will
   * be handled in-process without network access.
   */
  installFetchInterceptor() {
    if (this.originalFetch)
      return;
    this.originalFetch = globalThis.fetch;
    const self = this;
    const interceptedFetch = function(input, init) {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
      const method = init?.method?.toUpperCase() ?? "GET";
      if (method === "POST" && self.interceptUrls.some((u) => url.startsWith(u))) {
        return self.handleFetchRequest(url, init);
      }
      return self.originalFetch.call(globalThis, input, init);
    };
    globalThis.fetch = interceptedFetch;
    if (typeof globalThis !== "undefined" && globalThis.window) {
      globalThis.window.fetch = interceptedFetch;
    }
  }
  /** Restore the original fetch function. */
  restoreFetch() {
    if (this.originalFetch) {
      globalThis.fetch = this.originalFetch;
      if (typeof globalThis !== "undefined" && globalThis.window) {
        globalThis.window.fetch = this.originalFetch;
      }
      this.originalFetch = null;
    }
  }
  // -- Snapshot / Restore ----------------------------------------------------
  /**
   * Export full devnet state to a binary blob.
   * Captures chain, alkanes, esplora, and tertiary indexer state.
   */
  exportState() {
    return this.server.exportState();
  }
  /**
   * Restore devnet from a previously exported state blob.
   */
  importState(data) {
    this.server.importState(data);
  }
  /** Clean up: restore fetch and free WASM resources. */
  dispose() {
    this.restoreFetch();
    this.luaRuntime = null;
  }
  // -- Private ---------------------------------------------------------------
  /**
   * Initialize the Lua runtime and pre-load known scripts.
   */
  async initLuaRuntime(luaScriptsDir) {
    try {
      const rpcHandler = (requestJson) => {
        return this.server.handleRpc(requestJson);
      };
      this.luaRuntime = await LuaRuntime.create(rpcHandler);
      if (luaScriptsDir) {
        preloadLuaScripts(luaScriptsDir);
      } else {
        const { existsSync: existsSync2 } = await import("fs");
        const { resolve: resolve2 } = await import("path");
        const home = process.env.HOME || "/home/ubuntu";
        const candidates = [
          resolve2(home, "alkanes-rs/lua"),
          resolve2(home, "Documents/GitHub/alkanes-rs/lua"),
          resolve2(process.cwd(), "node_modules/@alkanes/ts-sdk/lua")
        ];
        for (const dir of candidates) {
          if (existsSync2(dir)) {
            preloadLuaScripts(dir);
            break;
          }
        }
      }
    } catch (err) {
      console.warn("[DevnetTestHarness] Lua runtime init failed, falling back to Rust shims:", err);
      this.luaRuntime = null;
    }
  }
  /**
   * Ensure the Lua runtime is initialized before use.
   */
  async ensureLuaRuntime() {
    if (this.luaInitPromise) {
      await this.luaInitPromise;
      this.luaInitPromise = null;
    }
    return this.luaRuntime;
  }
  /**
   * Handle a Lua RPC method (evalscript, evalsaved, savescript).
   *
   * Returns JSON-RPC response string, or null if Lua runtime unavailable
   * (caller should fall through to Rust shims).
   */
  async handleLuaRpc(method, params, id) {
    const lua = await this.ensureLuaRuntime();
    if (!lua)
      return null;
    const normalizedMethod = method.replace(/^(lua|sandshrew)_/, "");
    if (normalizedMethod === "savescript") {
      const scriptContent = params[0];
      if (typeof scriptContent !== "string") {
        return JSON.stringify({
          jsonrpc: "2.0",
          error: { code: -32602, message: "savescript requires script content as first param" },
          id
        });
      }
      const hash = saveScript(scriptContent);
      return JSON.stringify({
        jsonrpc: "2.0",
        result: { hash },
        id
      });
    }
    if (normalizedMethod === "evalscript") {
      const scriptContent = params[0];
      if (typeof scriptContent !== "string") {
        return JSON.stringify({
          jsonrpc: "2.0",
          error: { code: -32602, message: "evalscript requires script content as first param" },
          id
        });
      }
      const args = params.slice(1);
      const result = await lua.executeScript(scriptContent, args);
      if (result.error) {
        return JSON.stringify({
          jsonrpc: "2.0",
          result: {
            calls: result.calls,
            returns: null,
            runtime: result.runtime,
            error: { code: -1, message: result.error }
          },
          id
        });
      }
      return JSON.stringify({
        jsonrpc: "2.0",
        result: {
          calls: result.calls,
          returns: result.returns,
          runtime: result.runtime
        },
        id
      });
    }
    if (normalizedMethod === "evalsaved") {
      const hash = params[0];
      if (typeof hash !== "string") {
        return JSON.stringify({
          jsonrpc: "2.0",
          error: { code: -32602, message: "evalsaved requires script hash as first param" },
          id
        });
      }
      const args = params.slice(1);
      const result = await lua.executeSaved(hash, args);
      if (result.error) {
        if (result.error.includes("Script not found")) {
          return null;
        }
        return JSON.stringify({
          jsonrpc: "2.0",
          result: {
            calls: result.calls,
            returns: null,
            runtime: result.runtime,
            error: { code: -1, message: result.error }
          },
          id
        });
      }
      return JSON.stringify({
        jsonrpc: "2.0",
        result: {
          calls: result.calls,
          returns: result.returns,
          runtime: result.runtime
        },
        id
      });
    }
    return null;
  }
  async handleFetchRequest(url, init) {
    let bodyText;
    if (typeof init?.body === "string") {
      bodyText = init.body;
    } else if (init?.body instanceof ArrayBuffer) {
      bodyText = new TextDecoder().decode(init.body);
    } else if (init?.body instanceof Uint8Array) {
      bodyText = new TextDecoder().decode(init.body);
    } else {
      const resp = new Response(init?.body);
      bodyText = await resp.text();
    }
    try {
      let parsed;
      try {
        parsed = JSON.parse(bodyText);
      } catch {
      }
      if (parsed?.method) {
        if (LUA_METHODS.has(parsed.method)) {
          const luaResponse = await this.handleLuaRpc(parsed.method, Array.isArray(parsed.params) ? parsed.params : [], parsed.id);
          if (luaResponse) {
            return new Response(luaResponse, {
              status: 200,
              headers: { "Content-Type": "application/json" }
            });
          }
        }
        const responseJson2 = this.server.handleRpc(bodyText);
        return new Response(responseJson2, {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }
      const restMethod = this.resolveRestMethod(url, parsed);
      if (restMethod) {
        if ("inline" in restMethod) {
          return new Response(restMethod.inline, {
            status: 200,
            headers: { "Content-Type": "application/json" }
          });
        }
        const rpcRequest = JSON.stringify({
          jsonrpc: "2.0",
          method: restMethod.method,
          params: restMethod.params,
          id: 1
        });
        const responseJson2 = this.server.handleRpc(rpcRequest);
        if (restMethod.method === "metashrew_view") {
          try {
            const rpcResult = JSON.parse(responseJson2);
            if (rpcResult?.result) {
              const hex = rpcResult.result.replace(/^0x/, "");
              const decoded = new TextDecoder().decode(fromHex(hex));
              const quspoData = JSON.parse(decoded);
              const restResponse = this.transformQuspoResponse(url, quspoData);
              return new Response(JSON.stringify(restResponse), {
                status: 200,
                headers: { "Content-Type": "application/json" }
              });
            }
          } catch (e) {
          }
        }
        return new Response(responseJson2, {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }
      const responseJson = this.server.handleRpc(bodyText);
      return new Response(responseJson, {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } catch (e) {
      const error = e instanceof Error ? e.message : String(e);
      const errorResponse = JSON.stringify({
        jsonrpc: "2.0",
        error: { code: -32603, message: error },
        id: null
      });
      return new Response(errorResponse, {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
  /**
   * Transform a decoded quspo response into the REST format the SDK expects.
   *
   * The SDK's data API clients expect specific response shapes:
   *   get-all-pools-details → { statusCode: 200, data: [pool...] }
   *   get-alkanes-by-address → { statusCode: 200, data: [balance...] }
   *   get-all-amm-tx-history → { statusCode: 200, data: [tx...] }
   *   get-alkane-details → { statusCode: 200, data: {name, symbol, ...} }
   *   get-candles → { statusCode: 200, data: {candles: [...]} }
   */
  transformQuspoResponse(url, quspoData) {
    let path;
    try {
      path = new URL(url).pathname;
    } catch {
      return { statusCode: 200, data: quspoData };
    }
    if (path.endsWith("/get-all-pools-details") || path.endsWith("/get-all-token-pairs") || path.endsWith("/get-pools") || path.endsWith("/get-pool-details")) {
      const pools = quspoData?.pools || [];
      const transformed = pools.map((p) => ({
        poolId: p.poolId,
        token0: p.token0,
        token1: p.token1,
        reserve0: p.reserve0 || "0",
        reserve1: p.reserve1 || "0",
        poolName: p.poolName || "",
        fee: p.fee || "30",
        lpTokenSupply: p.lpTokenSupply || "0",
        // Mock TVL/volume for devnet display
        tvlUsd: "0",
        volume24hUsd: "0",
        apr: "0"
      }));
      return { statusCode: 200, data: transformed };
    }
    if (path.endsWith("/get-alkanes-by-address") || path.endsWith("/get-address-balances")) {
      const balances = Array.isArray(quspoData) ? quspoData : [];
      const transformed = balances.map((b) => ({
        alkaneId: b.alkaneId,
        name: b.name || "",
        symbol: b.symbol || "",
        balance: b.balance || "0"
      }));
      return { statusCode: 200, data: transformed };
    }
    if (path.endsWith("/get-all-amm-tx-history") || path.endsWith("/get-all-address-amm-tx-history")) {
      const items = quspoData?.items || [];
      return { statusCode: 200, data: items };
    }
    if (path.endsWith("/get-alkane-details") || path.endsWith("/get-alkane-info")) {
      return { statusCode: 200, data: quspoData };
    }
    if (path.endsWith("/get-candles")) {
      return { statusCode: 200, data: quspoData };
    }
    if (path.endsWith("/get-address-positions") || path.endsWith("/address-positions")) {
      return { statusCode: 200, data: quspoData };
    }
    if (path.includes("/wrap") || path.includes("/unwrap")) {
      return { statusCode: 200, data: quspoData };
    }
    return { statusCode: 200, data: quspoData };
  }
  /**
   * Resolve a REST-style URL + body into a quspo metashrew_view call
   * or an inline mock response.
   *
   * REST endpoints from the SDK's data API are mapped to quspo tertiary
   * indexer views via metashrew_view JSON-RPC:
   *
   *   /get-all-pools-details      → quspo get_pools
   *   /get-all-token-pairs        → quspo get_pools
   *   /get-alkanes-by-address     → quspo get_alkanes_by_address
   *   /get-bitcoin-price          → inline mock {usd: 100000}
   *   /get-all-amm-tx-history     → quspo get_activity
   *   /get-alkane-details         → quspo get_token_details
   *   /get-candles                → quspo get_candles
   *   /get-pools                  → quspo get_pools
   *   /get-pool-details           → quspo get_pools (single)
   *   /get-address-positions      → quspo get_user_positions
   *   /get-wrap-events            → quspo get_wrap_events
   *   /get-unwrap-events          → quspo get_unwrap_events
   */
  resolveRestMethod(url, body) {
    let path;
    try {
      path = new URL(url).pathname;
    } catch {
      return null;
    }
    const quspoCall = (viewName, input) => {
      const payloadStr = typeof input === "string" ? input : JSON.stringify(input);
      const hexInput = "0x" + toHex(new TextEncoder().encode(payloadStr));
      return {
        method: "metashrew_view",
        params: [viewName, hexInput, "latest"]
      };
    };
    if (path.endsWith("/get-all-pools-details") || path.endsWith("/get-all-token-pairs") || path.endsWith("/get-pools")) {
      const factoryId = body?.factoryId || body?.factory || { block: "4", tx: "65522" };
      return quspoCall("get_pools", factoryId);
    }
    if (path.endsWith("/get-pool-details")) {
      const factoryId = body?.factoryId || body?.factory || { block: "4", tx: "65522" };
      return quspoCall("get_pools", factoryId);
    }
    if (path.endsWith("/get-alkanes-by-address") || path.endsWith("/get-address-balances")) {
      const address = body?.address || "";
      return quspoCall("get_alkanes_by_address", address);
    }
    if (path.endsWith("/get-alkane-details") || path.endsWith("/get-alkane-info")) {
      const alkaneId = body?.alkaneId || body?.id || "";
      const idStr = typeof alkaneId === "object" ? `${alkaneId.block}:${alkaneId.tx}` : String(alkaneId);
      return quspoCall("get_token_details", idStr);
    }
    if (path.endsWith("/get-all-amm-tx-history") || path.endsWith("/get-all-address-amm-tx-history")) {
      const limit = body?.count || body?.limit || 50;
      const input = { limit };
      if (body?.address)
        input.address = body.address;
      return quspoCall("get_activity", input);
    }
    if (path.endsWith("/get-candles")) {
      return quspoCall("get_candles", body || {});
    }
    if (path.endsWith("/get-address-positions") || path.endsWith("/address-positions")) {
      return quspoCall("get_user_positions", body || {});
    }
    if (path.endsWith("/get-wrap-events") || path.endsWith("/get-wrap-events-all")) {
      return quspoCall("get_wrap_events", body || {});
    }
    if (path.endsWith("/get-unwrap-events") || path.endsWith("/get-unwrap-events-all")) {
      return quspoCall("get_unwrap_events", body || {});
    }
    if (path.endsWith("/get-wrap-events-by-address")) {
      return quspoCall("get_wrap_events", body || {});
    }
    if (path.endsWith("/get-unwrap-events-by-address")) {
      return quspoCall("get_unwrap_events", body || {});
    }
    if (path.endsWith("/get-bitcoin-price") || path.endsWith("/bitcoin-price")) {
      return { inline: JSON.stringify({ usd: 1e5 }) };
    }
    if (path.endsWith("/get-all-alkanes")) {
      return quspoCall("get_all_alkanes", "");
    }
    if (path.endsWith("/get-contract-state")) {
      return quspoCall("get_contract_state", body || {});
    }
    return null;
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DevnetTestHarness,
  IndexerRuntime,
  LuaRuntime,
  QubitcoinNode,
  getScript,
  preloadLuaScripts,
  saveScript
});
