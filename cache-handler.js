const Redis = require("ioredis");

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || "admin";
const KEY_PREFIX = process.env.KEY_PREFIX || "next:cache:";
const DEFAULT_TTL_SECONDS = process.env.DEFAULT_TTL_SECONDS
  ? Number(process.env.DEFAULT_TTL_SECONDS)
  : 60 * 60 * 24;

const tagIndexKey = (tag) => `${KEY_PREFIX}__tag__:${tag}`;
const entryKey = (key) => `${KEY_PREFIX}${key}`;

let client = null;
let isReady = false;
let hasLoggedDisabledWarning = false;
let hasLoggerCurrentIncident = false;

function buildConnection() {
  if (!REDIS_URL) {
    if (!hasLoggedDisabledWarning) {
      console.warn(
        "⚠️  Redis cache handler is disabled because REDIS_URL is not set.",
      );
      hasLoggedDisabledWarning = true;
    }
    return null;
  }

  const baseOptions = {
    maxRetriesPerRequest: 2,
    enableOfflineQueue: false,
    connectionTimeout: 5_000,
    lazyConnect: false,
    retryStrategy: (times) =>
      Math.min(1000 * 2 ** Math.min(times * 7), 120_000),
    ...(REDIS_PASSWORD ? { password: REDIS_PASSWORD } : {}),
  };

  const hasSchema = /^rediss?:\/\//i.test(REDIS_URL);

  if (hasSchema) {
    return new Redis(REDIS_URL, baseOptions);
  }

  // If no schema is provided, assume it's a host:port format
  const [host, port] = REDIS_URL.split(":");

  return new Redis({
    host,
    port: port ? parseInt(port, 10) : 6379,
    tls: REDIS_PASSWORD ? {} : undefined,
    ...baseOptions,
  });
}

function getClient() {
  if (client) {
    return client;
  }

  const instance = buildConnection();

  if (!instance) {
    return null;
  }

  instance.on("ready", () => {
    isReady = true;
    hasLoggerCurrentIncident = false;
    console.log("✅ Redis cache handler is ready.");
  });

  instance.on("end", (err) => {
    isReady = false;
    console.error("❌ Redis cache handler connection ended.", err);
  });

  instance.on("error", (err) => {
    isReady = false;
    if (!hasLoggerCurrentIncident) {
      console.error("❌ Redis cache handler error:", err);
      hasLoggerCurrentIncident = true;
    }
  });

  client = instance;
  return client;
}

function serialize(payload) {
  return JSON.stringify(payload, (_key, value) => {
    if (value && value.type === "Buffer" && Array.isArray(value.data)) {
      return value;
    }

    if (Buffer.isBuffer(value)) {
      return { __buffer__: true, data: value.toString("base64") };
    }

    return value;
  });
}

function deserialize(serialized) {
  return JSON.parse(serialized, (_key, value) => {
    if (value && value.__buffer__ && typeof value.data === "string") {
      return Buffer.from(value.data, "base64");
    }
    return value;
  });
}

function resolveTtlSeconds(data, ctx) {
  if (typeof ctx.revalidate === "number" && ctx.revalidate > 0) {
    return ctx.revalidate;
  }
  if (typeof data.revalidate === "number" && data.revalidate > 0) {
    return data.revalidate;
  }
  return DEFAULT_TTL_SECONDS;
}

module.exports = class CacheHandler {
  constructor(options) {
    this.options = options;
    getClient(); // Initialize Redis client
  }

  async get(key) {
    if (!isReady) {
      return null;
    }

    try {
      const raw = await getClient().get(entryKey(key));

      if (!raw) {
        return null;
      }

      return deserialize(raw);
    } catch (error) {
      console.error("Error occurred while getting cache:", error);
      return null;
    }
  }

  async set(key, data, ctx) {
    if (!isReady) {
      return;
    }

    try {
      const client = getClient();
      const ttl = resolveTtlSeconds(data, ctx);
      const tags = Array.isArray(ctx.tags) ? ctx.tags : [];

      const payload = serialize({
        value: data,
        lastModified: Date.now(),
        tags,
      });

      const redisKey = entryKey(key);
      const pipeline = client.pipeline();

      if (ttl > 0) {
        pipeline.set(redisKey, payload, "EX", ttl);
      } else {
        pipeline.set(redisKey, payload);
      }

      for (const tag of tags) {
        pipeline.sadd(tagIndexKey(tag), redisKey);

        if (ttl > 0) {
          pipeline.expire(tagIndexKey(tag), ttl + 60);
        }
      }
      await pipeline.exec();
    } catch (error) {
      console.error("Error occurred while setting cache:", error);
    }
  }

  async revalidateTag(tag) {
    if (!isReady) {
      return;
    }

    try {
      const tags = Array.isArray(tag) ? tag : [tag];
      const client = getClient();

      for (const tag of tags) {
        const indexKey = tagIndexKey(tag);
        const members = await client.smembers(indexKey);

        if (members.length > 0) {
          await client.del(...members);
        }

        await client.del(indexKey);
      }
    } catch (error) {
      console.error("Error occurred while revalidating tag:", error);
    }
  }

  // If you want to have temporary in memory cache for a single request that is reset
  // before the next request you can leverage this method
  resetRequestCache() {}
};
